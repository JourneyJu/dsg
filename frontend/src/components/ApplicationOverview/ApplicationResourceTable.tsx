import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'
import { message, Popover, Spin, Table, Tooltip } from 'antd'
import moment from 'moment'
import { DoubleRightOutlined } from '@ant-design/icons'
import { useDebounce, useInfiniteScroll } from 'ahooks'
import {
    Empty,
    ListDefaultPageSize,
    ListType,
    Loader,
    OptionBarTool,
    OptionMenuType,
    SearchInput,
} from '@/ui'
import __ from './locale'
import FileIcon from '../FileIcon'
import {
    deleteDataCatalogFileAttachment,
    formatError,
    getFileAttachmentPreviewPdf,
    getFileResourceList,
    queryInfoResCatlgList,
    getDataRescList,
    queryInfoResCatlgListFrontend,
    reqBusinObjList,
    reqBusinObjListForOper,
    SystemCategory,
} from '@/core'
import { serviceTypeList } from '../ApiServices/const'
import dataEmpty from '@/assets/dataEmpty.svg'
import styles from './styles.module.less'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { shareTypeList, typeOptoins } from '@/components/ResourcesDir/const'
import {
    dataRangeOptionsMap,
    updateCycleInfoOptions,
    updateCycleOptionsMap,
    shareTypeListInfo,
    openTypeList,
    openTypeListInfo,
} from './helper'
// ListDefaultPageSize[ListType.WideList]
const defaultPageSize = 10

export enum ResourceType {
    'Data' = 'data',
    'Info' = 'info',
    'Api' = 'api',
}
const TipContent = ({ data }: { data: string[] }) => {
    const [foldup, setFoldup] = useState(true)
    return (
        <div className={styles.tipContent}>
            {(foldup ? data.slice(0, 5) : data).map((txt, index) => {
                return (
                    <div className={styles.tipContentItem}>
                        <span className={styles.itemIcon}>{index + 1}</span>
                        <div className={styles.itemText} title={txt}>
                            {txt}
                        </div>
                    </div>
                )
            })}
            {data?.length > 5 && foldup && (
                <div className={styles.tipContentItem}>
                    <div
                        className={styles.itemText}
                        style={{ color: '#126EE3', cursor: 'pointer' }}
                        onClick={() => setFoldup(false)}
                    >
                        {__('更多')}
                        <DoubleRightOutlined />
                    </div>
                </div>
            )}
        </div>
    )
}
// 关联资源列表table
interface IFilesTable {
    resourceType: ResourceType
    id?: string
    setDetailItem?: (record: any, resouceType) => void
}
export const ApplicationResourceTable = forwardRef(
    ({ resourceType, id, setDetailItem = () => {} }: IFilesTable, ref) => {
        const [dataSource, setDataSource] = useState<any[]>([])
        const [queryParams, setQueryParams] = useState<{
            keyword?: string
            offset: number
            limit: number
            id?: string
        }>({
            keyword: '',
            offset: 1,
            limit: defaultPageSize,
        })
        const debounceCondition = useDebounce(queryParams)
        const [loading, setLoading] = useState(true)
        const [total, setTotal] = useState(0)
        // 无关键词下总条数
        const [searchKeyword, setSearchKeyword] = useState('')
        const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
        const tableContainerRef = useRef<HTMLDivElement>(null)
        const nextFlagRef = useRef(null)

        const TableMap = {
            [ResourceType.Data]: {
                label: __('数据资源目录'),
                placeholder: __('搜索资源名称、编码'),
                columns: [
                    {
                        title: (
                            <>
                                {__('资源名称')}
                                <span
                                    style={{
                                        color: 'rgba(0,0,0,0.45)',
                                        marginLeft: 4,
                                    }}
                                >
                                    {__('(编码)')}
                                </span>
                            </>
                        ),
                        dataIndex: 'name',
                        key: 'name',
                        ellipsis: true,
                        render: (text, record) => {
                            const { name, raw_name, code, raw_code } = record
                            return (
                                <div className={styles.assetInfo}>
                                    <span>
                                        <FontIcon
                                            name="icon-shujumuluguanli1"
                                            type={IconType.COLOREDICON}
                                        />
                                    </span>
                                    <div className={styles.assetName}>
                                        <span
                                            title={raw_name}
                                            dangerouslySetInnerHTML={{
                                                __html: name,
                                            }}
                                            onClick={() =>
                                                handleOperate('preview', record)
                                            }
                                        />
                                        <div
                                            title={raw_code}
                                            dangerouslySetInnerHTML={{
                                                __html: code,
                                            }}
                                            style={{
                                                color: 'rgba(0, 0, 0, 0.45)',
                                                fontSize: '12px',
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        },
                    },
                    {
                        title: __('所属部门'),
                        dataIndex: 'cate_info',
                        key: 'cate_info',
                        ellipsis: true,
                        render: (_, record) => {
                            const { cate_info } = record
                            if (!cate_info) return '--'
                            const department = cate_info?.find(
                                (it) =>
                                    it.cate_id ===
                                    '00000000-0000-0000-0000-000000000001',
                            )
                            return department?.node_name
                        },
                    },
                    {
                        title: __('信息项'),
                        dataIndex: 'fields',
                        key: 'fields',
                        ellipsis: true,
                        render: (_, record) => {
                            const { fields } = record
                            const fieldsArr = (fields || []).map(
                                (o) => o.raw_field_name_zh,
                            )
                            return (
                                <Popover
                                    content={<TipContent data={fieldsArr} />}
                                    placement="topLeft"
                                    destroyTooltipOnHide
                                >
                                    {fieldsArr.join(' | ')}
                                </Popover>
                            )
                        },
                    },
                    {
                        title: __('数据区域范围'),
                        dataIndex: 'data_range',
                        key: 'data_range',
                        ellipsis: true,
                        render: (value) => dataRangeOptionsMap[value] || '--',
                    },
                    {
                        title: __('共享属性'),
                        key: 'shared_type',
                        ellipsis: true,
                        render: (item) => {
                            const type =
                                shareTypeList.find(
                                    (it) => it.value === item.shared_type,
                                )?.label || '--'
                            const condition = item.shared_condition
                                ? `（${item.shared_condition}）`
                                : ''
                            const title = `${type}${condition}`
                            return (
                                <span className={styles.ellipsis} title={title}>
                                    {title}
                                </span>
                            )
                        },
                    },
                    {
                        title: __('开放属性'),
                        dataIndex: 'open_type',
                        key: 'open_type',
                        ellipsis: true,
                        render: (value, item) => {
                            return (
                                openTypeList.find(
                                    (it) => it.value === item.open_type,
                                )?.label || '--'
                            )
                        },
                    },
                    {
                        title: __('更新周期'),
                        dataIndex: 'update_cycle',
                        key: 'update_cycle',
                        ellipsis: true,
                        render: (value) => updateCycleOptionsMap[value] || '--',
                    },
                    {
                        title: __('申请次数'),
                        dataIndex: 'apply_num',
                        key: 'apply_num',
                        ellipsis: true,
                        render: (value) =>
                            value !== undefined && value !== null
                                ? value
                                : '--',
                    },
                    {
                        title: __('操作'),
                        dataIndex: 'operate',
                        key: 'operate',
                        ellipsis: true,
                        render: (text, record) => {
                            const menus = [
                                {
                                    title: __('详情'),
                                    label: __('详情'),
                                    key: 'preview',
                                    menuType: OptionMenuType.Menu,
                                },
                            ]
                            return (
                                <OptionBarTool
                                    menus={menus}
                                    onClick={(key) => {
                                        handleOperate(key, record)
                                    }}
                                    getPopupContainer={(node) => node}
                                />
                            )
                        },
                    },
                ],
            },
            [ResourceType.Info]: {
                label: __('信息资源目录'),
                placeholder: __('搜索资源名称、编码'),
                columns: [
                    {
                        title: (
                            <>
                                {__('资源名称')}
                                <span
                                    style={{
                                        color: 'rgba(0,0,0,0.45)',
                                        marginLeft: 4,
                                    }}
                                >
                                    {__('(编码)')}
                                </span>
                            </>
                        ),
                        dataIndex: 'name',
                        key: 'name',
                        ellipsis: true,
                        render: (text, record) => {
                            const { name, raw_name, code, raw_code } = record
                            return (
                                <div className={styles.assetInfo}>
                                    <span>
                                        <FontIcon
                                            name="icon-xinximulu1"
                                            type={IconType.COLOREDICON}
                                        />
                                    </span>
                                    <div className={styles.assetName}>
                                        <span
                                            title={raw_name}
                                            dangerouslySetInnerHTML={{
                                                __html: name,
                                            }}
                                            onClick={() =>
                                                handleOperate('preview', record)
                                            }
                                        />
                                        <div
                                            title={raw_code}
                                            dangerouslySetInnerHTML={{
                                                __html: code,
                                            }}
                                            style={{
                                                color: 'rgba(0, 0, 0, 0.45)',
                                                fontSize: '12px',
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        },
                    },
                    {
                        title: __('所属部门'),
                        dataIndex: 'cate_info',
                        key: 'cate_info',
                        ellipsis: true,
                        render: (_, record) => {
                            const { cate_info } = record
                            if (!cate_info) return '--'
                            const department = cate_info?.find(
                                (it) =>
                                    it.cate_id ===
                                    '00000000-0000-0000-0000-000000000001',
                            )
                            return department?.node_name
                        },
                    },
                    {
                        title: __('信息项'),
                        dataIndex: 'fields',
                        key: 'fields',
                        ellipsis: true,
                        render: (_, record) => {
                            const { columns } = record
                            const fieldsArr = (columns || []).map((o) => o.name)
                            return (
                                <Popover
                                    content={<TipContent data={fieldsArr} />}
                                    placement="topLeft"
                                    destroyTooltipOnHide
                                >
                                    {fieldsArr.join(' | ')}
                                </Popover>
                            )
                        },
                    },
                    {
                        title: __('所属主干业务'),
                        dataIndex: 'main_business',
                        key: 'main_business',
                        ellipsis: true,
                        render: (_, record) => {
                            const { main_business } = record
                            const fieldsArr = (main_business || []).map(
                                (o) => o.name,
                            )
                            return (
                                <Popover
                                    content={<TipContent data={fieldsArr} />}
                                    placement="topLeft"
                                    destroyTooltipOnHide
                                >
                                    {fieldsArr.join(' | ')}
                                </Popover>
                            )
                        },
                    },
                    {
                        title: __('共享属性'),
                        key: 'shared_type',
                        dataIndex: 'shared_type',
                        ellipsis: true,
                        render: (value, item) => {
                            const type =
                                shareTypeListInfo.find(
                                    (it) => it.value === item.shared_type,
                                )?.label || '--'
                            const condition = item.shared_condition
                                ? `（${item.shared_condition}）`
                                : ''
                            const title = `${type}${condition}`
                            return (
                                <span className={styles.ellipsis} title={title}>
                                    {title}
                                </span>
                            )
                        },
                    },
                    {
                        title: __('开放属性'),
                        dataIndex: 'open_type',
                        key: 'open_type',
                        ellipsis: true,
                        render: (value, item) => {
                            return (
                                openTypeListInfo.find(
                                    (it) => it.value === item.open_type,
                                )?.label || '--'
                            )
                        },
                    },
                    {
                        title: __('更新周期'),
                        dataIndex: 'update_cycle',
                        key: 'update_cycle',
                        ellipsis: true,
                        render: (value) =>
                            updateCycleInfoOptions.find(
                                (it) => it.value === value,
                            )?.label || '--',
                    },
                    {
                        title: __('操作'),
                        dataIndex: 'operate',
                        key: 'operate',
                        ellipsis: true,
                        render: (text, record) => {
                            const menus = [
                                {
                                    title: __('详情'),
                                    label: __('详情'),
                                    key: 'preview',
                                    menuType: OptionMenuType.Menu,
                                },
                            ]
                            return (
                                <OptionBarTool
                                    menus={menus}
                                    onClick={(key) => {
                                        handleOperate(key, record)
                                    }}
                                    getPopupContainer={(node) => node}
                                />
                            )
                        },
                    },
                ],
            },
            [ResourceType.Api]: {
                label: __('接口服务'),
                placeholder: __('搜索接口名称、编码'),
                columns: [
                    {
                        title: (
                            <>
                                {__('接口名称')}
                                <span
                                    style={{
                                        color: 'rgba(0,0,0,0.45)',
                                        marginLeft: 4,
                                    }}
                                >
                                    {__('(编码)')}
                                </span>
                            </>
                        ),
                        dataIndex: 'name',
                        key: 'name',
                        ellipsis: true,
                        render: (text, record) => {
                            const { name, raw_name, code, raw_code } = record
                            return (
                                <div className={styles.assetInfo}>
                                    <span>
                                        <FontIcon
                                            name="icon-jiekoufuwuguanli"
                                            type={IconType.COLOREDICON}
                                        />
                                    </span>
                                    <div className={styles.assetName}>
                                        <span
                                            title={raw_name}
                                            dangerouslySetInnerHTML={{
                                                __html: name,
                                            }}
                                            onClick={() =>
                                                handleOperate('preview', record)
                                            }
                                        />
                                        <div
                                            title={raw_code}
                                            dangerouslySetInnerHTML={{
                                                __html: code,
                                            }}
                                            style={{
                                                color: 'rgba(0, 0, 0, 0.45)',
                                                fontSize: '12px',
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        },
                    },
                    {
                        title: __('接口类型'),
                        dataIndex: 'api_type',
                        key: 'api_type',
                        ellipsis: true,
                        render: (text, record) =>
                            serviceTypeList.find((item) => item.value === text)
                                ?.label || '--',
                    },
                    {
                        title: __('接口描述'),
                        dataIndex: 'description',
                        key: 'description',
                        ellipsis: true,
                        render: (text, record) => text || '--',
                    },
                    {
                        title: __('所属部门'),
                        dataIndex: 'department_name',
                        key: 'department_name',
                        ellipsis: true,
                        render: (text) => text || '--',
                    },
                    {
                        title: __('上线时间'),
                        dataIndex: 'online_at',
                        key: 'online_at',
                        ellipsis: true,
                        render: (text, record) =>
                            text
                                ? moment(text).format('YYYY-MM-DD HH:mm:ss')
                                : '--',
                    },
                    {
                        title: __('操作'),
                        dataIndex: 'operate',
                        key: 'operate',
                        ellipsis: true,
                        render: (text, record) => {
                            const menus = [
                                {
                                    title: __('详情'),
                                    label: __('详情'),
                                    key: 'preview',
                                    menuType: OptionMenuType.Menu,
                                },
                            ]
                            return (
                                <OptionBarTool
                                    menus={menus}
                                    onClick={(key) => {
                                        handleOperate(key, record)
                                    }}
                                    getPopupContainer={(node) => node}
                                />
                            )
                        },
                    },
                ],
            },
        }
        useImperativeHandle(ref, () => ({
            refresh: (resourceId, newItem) =>
                refreshDataFn(resourceId, newItem),
        }))

        useEffect(() => {
            setQueryParams({
                ...queryParams,
                offset: 1,
                id,
            })
        }, [resourceType, id])

        const getList = async (params) => {
            if (!params.id) return
            setLoading(true)
            let res
            if (resourceType === ResourceType.Data) {
                res = await getdataResourceList(params)
            } else if (resourceType === ResourceType.Info) {
                res = await getInfoResourceList(params)
            } else if (resourceType === ResourceType.Api) {
                res = await getApiResourceList(params)
            }
            setLoading(false)
            // eslint-disable-next-line consistent-return
            return res
        }

        const refreshDataFn = async (resourceId, newItem) => {
            let detailItem
            if (resourceType === ResourceType.Data) {
                const res = await reqBusinObjListForOper({
                    filter: {
                        data_kind: [],
                        shared_type: [],
                        update_cycle: [],
                        ids: [resourceId],
                        is_online: true,
                    },
                    keyword: '',
                })

                detailItem = (res.entries || []).find(
                    (o) => o.id === resourceId,
                )
            } else if (resourceType === ResourceType.Info) {
                detailItem = newItem
            }

            setDataSource(
                dataSource.map((item) =>
                    item.id === detailItem.id ? detailItem : item,
                ),
            )
            return detailItem
        }

        // 获取数据资源目录
        const getdataResourceList = async (params?: any) => {
            const { offset, limit, keyword } = params
            try {
                if (!id) {
                    return
                }

                const filter = {
                    data_kind: [],
                    shared_type: [],
                    size: limit,
                    update_cycle: [],
                    cate_info_req: [
                        {
                            cate_id: SystemCategory.InformationSystem,
                            node_ids: [id],
                        },
                    ],
                    is_online: true,
                }
                const reqParams = {
                    filter,
                    next_flag: nextFlagRef.current || undefined,
                    keyword,
                }
                const res = await reqBusinObjList(reqParams)

                // eslint-disable-next-line consistent-return
                return {
                    ...res,
                    list: res?.entries || [],
                    currentFlag: nextFlagRef.current,
                }
            } catch (err) {
                formatError(err)
            } finally {
                setLoading(false)
            }
        }
        // 获取信息资源目录
        const getInfoResourceList = async (params?: any) => {
            const { offset, limit, keyword } = params
            try {
                if (!id) {
                    return
                }

                const filter = {
                    cate_info: {
                        cate_id: SystemCategory.InformationSystem,
                        node_id: id,
                    },
                }
                const res = await queryInfoResCatlgListFrontend({
                    filter,
                    next_flag: nextFlagRef.current || undefined,
                    keyword,
                })

                // eslint-disable-next-line consistent-return
                return {
                    ...res,
                    list: res?.entries || [],
                    currentFlag: nextFlagRef.current,
                }
            } catch (err) {
                formatError(err)
            } finally {
                setLoading(false)
            }
        }

        // 获取接口列表
        const getApiResourceList = async (params?: any) => {
            const { offset, limit, keyword } = params
            try {
                if (!id) {
                    return
                }
                const filter = {
                    type: 'interface_svc',
                    cate_info_req: [
                        {
                            cate_id: '00000000-0000-0000-0000-000000000002',
                            node_ids: [params.id],
                        },
                    ],
                }
                const res = await getDataRescList({
                    filter,
                    next_flag: nextFlagRef.current || undefined,
                    keyword,
                })

                // eslint-disable-next-line consistent-return
                return {
                    ...res,
                    list: res?.entries || [],
                    currentFlag: nextFlagRef.current,
                }
            } catch (err) {
                formatError(err)
            } finally {
                setLoading(false)
            }
        }

        const handleKeywordChange = (val: string) => {
            nextFlagRef.current = null
            setQueryParams({
                ...queryParams,
                keyword: val,
                offset: 1,
            })
        }

        /**
         * 操作
         * @param key 操作类型
         * @param record 文件资源
         */
        const handleOperate = async (key: string, record: any) => {
            try {
                if (key === 'preview') {
                    setDetailItem(record, resourceType)
                }
            } catch (err) {
                formatError(err)
            }
        }

        const {
            data,
            loading: initLoading,
            loadingMore,
            noMore,
            loadMore,
            reload: updateList,
            error,
        } = useInfiniteScroll(
            (currentData) => {
                return getList(debounceCondition)
            },
            {
                target: () => {
                    if (tableContainerRef.current) {
                        return tableContainerRef.current.querySelector(
                            '#scroll-table .any-fabric-ant-table-body',
                        )
                    }
                    return null
                },
                manual: true,
                isNoMore: (d: any) => {
                    return (
                        d?.entries?.length < defaultPageSize ||
                        !d?.entries ||
                        false
                    )
                },
                onSuccess: (d) => {
                    nextFlagRef.current = d?.next_flag || null
                    // curOffset.current += 1
                },
                onError: (err) => {
                    // console.log('err:', err)
                },
                onFinally: () => {
                    setLoading(false)
                },
                reloadDeps: [debounceCondition],
            },
        )

        useEffect(() => {
            if (!data) return
            setDataSource((old) =>
                data.currentFlag
                    ? [...old, ...(data?.entries || [])]
                    : data?.entries || [],
            )
            setTotal(data?.total_count || 0)
        }, [data])

        const scrollHeight = useMemo(() => {
            return Math.max(
                dataSource?.length > defaultPageSize
                    ? 600
                    : ((dataSource?.length || 0) + 1) * 60,
                185,
            )
        }, [dataSource])
        return (
            <div className={styles.ApplicationResourceTable}>
                <div className={styles.tableHeader}>
                    <div className={styles.label}>
                        {TableMap[resourceType].label}
                    </div>
                    <SearchInput
                        style={{
                            marginLeft: '16px',
                            width: '275px',
                        }}
                        placeholder={TableMap[resourceType].placeholder}
                        value={searchKeyword}
                        onKeyChange={(kw: string) => {
                            setSearchKeyword(kw)
                            handleKeywordChange(kw)
                        }}
                        onPressEnter={(e: any) => {
                            setSearchKeyword(e.target?.value)
                            handleKeywordChange(e.target?.value)
                        }}
                        maxLength={255}
                    />
                </div>
                <div ref={tableContainerRef}>
                    {loading || initLoading ? (
                        <div className={styles.emptyWrap}>
                            <Loader />
                        </div>
                    ) : (
                        <Table
                            id="scroll-table"
                            className={styles.sampleTable}
                            columns={TableMap[resourceType].columns}
                            scroll={{
                                y: scrollHeight,
                            }}
                            dataSource={dataSource}
                            pagination={false}
                            loading={initLoading}
                            locale={{
                                emptyText: (
                                    <Empty
                                        desc={__('暂无数据')}
                                        iconSrc={dataEmpty}
                                    />
                                ),
                            }}
                            summary={() =>
                                (dataSource?.length > 0 && (
                                    <div className={styles['text-center']}>
                                        {loadingMore && <Spin size="small" />}
                                        {noMore && <span>没有更多了</span>}
                                        {error && (
                                            <span>
                                                加载失败
                                                <br />
                                                <a
                                                    onClick={() => {
                                                        loadMore()
                                                    }}
                                                >
                                                    重试
                                                </a>
                                            </span>
                                        )}
                                    </div>
                                )) as any
                            }
                        />
                    )}
                </div>
            </div>
        )
    },
)
