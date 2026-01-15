/* eslint-disable no-bitwise */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, message, Space, Table, Tooltip, Popconfirm } from 'antd'
import { SortOrder } from 'antd/lib/table/interface'
import { InfoCircleFilled } from '@ant-design/icons'
import { useAntdTable, useDebounce } from 'ahooks'
import classnames from 'classnames'
import moment from 'moment'
import { OperateType } from '@/utils'
import SearchLayout from '@/components/SearchLayout'
import { AddOutlined, FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import {
    SortDirection,
    createAuditFlow,
    formatError,
    deleteOpenCatlg,
    IOpenCatlgListQuery,
    SortType,
    queryOpenCatlgList,
    undoOpenCatlgAudit,
} from '@/core'
import dataEmpty from '@/assets/dataEmpty.svg'
import Empty from '@/ui/Empty'
import styles from './styles.module.less'
import { Loader } from '@/ui'
import { SortBtn } from '@/components/ToolbarComponents'
import { FixedType } from '@/components/CommonTable/const'
import DropDownFilter from '../DropDownFilter'
import {
    defaultMenu,
    menus,
    openStatusList,
    searchFormInitData,
    timeStrToTimestamp,
    getAuditStateLabel,
    OpenStatusEnum,
    OpenCatalogAuditStatus,
    IOpenCatalog,
    OpenTypeEnum,
} from './helper'
import __ from './locale'
import { getState } from '../DatasheetView/helper'
import EditOpenCatlg from './EditOpenCatlg'
import { onLineStatus } from '../DatasheetView/const'
import AddOpenCatlg from './AddOpenCatlg'
import { onlineEnumsList, resourceTypeList } from '../ResourcesDir/const'
import { OnlineStatusList } from '../InfoRescCatlg/const'
import OpenCatlgDetailDrawer from './Detail'

const OpenCatalog = () => {
    const navigator = useNavigate()

    const [loading, setLoading] = useState<boolean>(true)

    // 删除弹框显示,【true】显示,【false】隐藏
    const [delVisible, setDelVisible] = useState(false)
    // 上线弹框显示
    const [onlineVisible, setOnlineVisible] = useState(false)
    // 删除目录loading
    const [delBtnLoading, setDelBtnLoading] = useState(false)

    // 新增开放目录
    const [addOpenCatlgModal, setAddOpenCatlgModal] = useState(false)
    // 编辑开放目录
    const [editOpenCatlgModal, setEditOpenCatlgModal] = useState(false)
    // 开放目录详情
    const [detailOpen, setDetailOpen] = useState(false)

    // 创建表头排序
    const [tableSort, setTableSort] = useState<{
        [key: string]: SortOrder
    }>({
        updated_at: 'descend',
    })

    // 排序
    const [selectedSort, setSelectedSort] = useState<any>(defaultMenu)

    const initSearchCondition: IOpenCatlgListQuery = {
        keyword: '',
        offset: 1,
        limit: 10,
        sort: SortType.UPDATED,
        direction: SortDirection.DESC,
    }

    const [searchCondition, setSearchCondition] = useState<IOpenCatlgListQuery>(
        {
            ...initSearchCondition,
        },
    )
    const searchDebounce = useDebounce(searchCondition, { wait: 500 })

    // 修改表头排序
    const [updateSortOrder, setUpdateSortOrder] = useState<SortOrder>('ascend')

    // 搜索条件
    const [searchFormData, setSearchFormData] = useState(searchFormInitData)
    const [searchIsExpansion, setSearchIsExpansion] = useState<boolean>(false)

    const searchFormRef: any = useRef()
    const [currentOpsType, setCurrentOpsType] = useState<OperateType>(
        OperateType.PUBLISH,
    )
    const [tableHeight, setTableHeight] = useState<number>(0)
    // const [initSearch, setInitSearch] = useState<boolean>(true)

    const hasSearchCondition = useMemo(() => {
        return (
            searchCondition.keyword ||
            searchCondition?.open_level ||
            searchCondition?.open_type ||
            searchCondition?.updated_at_start ||
            searchCondition?.updated_at_end
        )
    }, [searchCondition])

    useEffect(() => {
        // 展开/收起查询条件高度
        const defalutHeight: number = !searchIsExpansion ? 276 : 384
        // 已选搜索条件高度
        const searchConditionHeight: number = hasSearchCondition ? 41 : 0
        const height = defalutHeight + searchConditionHeight

        setTableHeight(height)
    }, [hasSearchCondition, searchIsExpansion])

    // 获取目录列表
    const getCatlgList = async (params) => {
        try {
            setLoading(true)
            const res = await queryOpenCatlgList(params)
            return {
                total: res.total_count,
                list: res.entries,
            }
        } catch (error) {
            formatError(error)
            return { total: 0, list: [] }
        } finally {
            setLoading(false)
            setSelectedSort(undefined)
            // setInitSearch(false)
        }
    }

    const { tableProps, run, pagination } = useAntdTable(getCatlgList, {
        defaultPageSize: 10,
        manual: true,
    })

    useEffect(() => {
        run(searchDebounce)
    }, [searchDebounce])

    // 点击目录项
    const [curCatlg, setCurCatlg] = useState<IOpenCatalog>()

    const handleRevocation = async () => {
        try {
            if (!curCatlg?.id) return
            await undoOpenCatlgAudit(curCatlg.id)
            setSearchCondition({
                ...searchCondition,
            })
        } catch (error) {
            formatError(error)
        }
    }

    const handleOperate = async (
        op: OperateType,
        item: IOpenCatalog,
        opLabel?: string,
    ) => {
        setCurCatlg(item)
        setCurrentOpsType(op)
        if (op === OperateType.DETAIL) {
            setDetailOpen(true)
        } else if (op === OperateType.EDIT) {
            setEditOpenCatlgModal(true)
        }
    }

    // 表格排序改变
    const handleTableChange = (sorter) => {
        const sorterKey = sorter.columnKey

        if (sorter.column) {
            setTableSort({
                key: sorterKey,
                [sorterKey]: sorter.order || 'ascend',
            })
            return {
                key: sorterKey,
                sort:
                    sorter.order === 'ascend'
                        ? SortDirection.ASC
                        : SortDirection.DESC,
            }
        }

        // setTableSort({
        //     key: sorterKey,
        //     [sorterKey]:
        //         searchCondition.sort_by?.direction === SortDirection.ASC
        //             ? 'descend'
        //             : 'ascend',
        // })

        return {
            key: sorterKey,
            sort: 'miaTestSort',
            // sort:
            //     searchCondition.sort_by?.direction === SortDirection.ASC
            //         ? SortDirection.DESC
            //         : SortDirection.ASC,
        }
    }

    const columns: any = [
        {
            title: __('开放目录名称/编码'),
            dataIndex: 'name',
            key: 'name',
            width: 280,
            render: (text, record) => {
                const {
                    code,
                    audit_state: auditState,
                    audit_advice: auditAdvice,
                } = record
                return (
                    <div className={styles.catlgName}>
                        <FontIcon
                            name="icon-shujumuluguanli1"
                            type={IconType.COLOREDICON}
                            className={styles.nameIcon}
                        />
                        <div className={styles.catlgNameCont}>
                            <div className={styles.nameWrapper}>
                                <div
                                    onClick={() =>
                                        handleOperate(
                                            OperateType.DETAIL,
                                            record,
                                        )
                                    }
                                    title={text}
                                    className={styles.names}
                                >
                                    {text || '--'}
                                </div>
                                {getAuditStateLabel(auditState, auditAdvice)}
                            </div>
                            <div className={styles.code} title={record.code}>
                                {code || '--'}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            title: __('开放状态'),
            dataIndex: 'open_status',
            key: 'open_status',
            width: 92,
            ellipsis: true,
            render: (status, record) => {
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {getState(status, openStatusList)}
                    </div>
                )
            },
        },
        {
            title: __('目录状态'),
            dataIndex: 'online_status',
            key: 'online_status',
            width: 92,
            ellipsis: true,
            render: (online_status, record) => {
                const isOnlineStatus = onlineEnumsList.includes(online_status)
                    ? onLineStatus.Online
                    : onLineStatus.Offline
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {getState(isOnlineStatus, OnlineStatusList)}
                    </div>
                )
            },
        },
        {
            title: __('资源类型'),
            dataIndex: 'resource',
            key: 'resource',
            ellipsis: true,
            width: 182,
            render: (text, record) => {
                let content = ''
                record?.resource?.forEach((o) => {
                    const label = resourceTypeList?.find(
                        (item) => item.value === o?.resource_type,
                    )?.label
                    if (label && o?.resource_count) {
                        content += `${content ? '' : ' '}${label} ${
                            o?.resource_count
                        }`
                    }
                })

                return <div title={content}>{content || '--'}</div>
            },
        },
        {
            title: __('数据提供方'),
            dataIndex: 'source_department',
            key: 'source_department',
            ellipsis: true,
            render: (source_department, record) => {
                return (
                    <Tooltip title={record.source_department_path}>
                        {source_department || '--'}
                    </Tooltip>
                )
            },
        },
        {
            title: __('目录更新时间'),
            dataIndex: 'updated_at',
            key: 'updated_at',
            ellipsis: true,
            width: 180,
            // sorter: true,
            // sortOrder: tableSort.update_at,
            // showSorterTooltip: {
            //     title: __('按更新时间排序'),
            //     placement: 'bottom',
            //     overlayInnerStyle: {
            //         color: '#fff',
            //     },
            // },
            render: (text: any) => {
                return moment(text).format('YYYY-MM-DD HH:mm:ss') || '--'
            },
        },
        {
            title: __('操作'),
            key: 'action',
            width: 220,
            fixed: FixedType.RIGHT,
            render: (_: string, record) => {
                const { open_status, online_status, audit_state } = record
                const isAudting = [OpenCatalogAuditStatus.Auditing].includes(
                    audit_state,
                )
                const isOpen = open_status === OpenStatusEnum.Open

                const btnList: any[] = [
                    {
                        key: OperateType.DETAIL,
                        label: __('详情'),
                        show: true,
                        tooltipOpen: false,
                    },
                    {
                        key: OperateType.EDIT,
                        label: __('编辑'),
                        show: !isOpen,
                        disabled: isAudting,
                        disableTips: __('申报审核中，无法操作'),
                    },
                    {
                        key: OperateType.DELETE,
                        label: __('删除'),
                        show: !isOpen,
                        disabled: isAudting,
                        disableTips: __('申报审核中，无法操作'),
                        popconfirmTips: __('确定要执行此操作吗？'),
                    },
                    {
                        key: OperateType.REVOCATION,
                        label: __('撤销审核'),
                        show: isAudting,
                        popconfirmTips: __('确定要执行此操作吗？'),
                    },
                ]
                return (
                    <Space size={16} className={styles.oprColumn}>
                        {btnList
                            .filter((item) => item.show)
                            .map((item) => {
                                return (
                                    <Popconfirm
                                        title={item.popconfirmTips}
                                        okText={__('确定')}
                                        cancelText={__('取消')}
                                        onConfirm={() => {
                                            setCurCatlg(record)
                                            if (
                                                item.key === OperateType.DELETE
                                            ) {
                                                handleDelete()
                                            } else if (
                                                item.key ===
                                                OperateType.REVOCATION
                                            ) {
                                                handleRevocation()
                                            }
                                        }}
                                        placement="bottomLeft"
                                        overlayInnerStyle={{
                                            whiteSpace: 'nowrap',
                                        }}
                                        icon={
                                            <InfoCircleFilled
                                                style={{
                                                    color: '#FAAD14',
                                                    fontSize: '16px',
                                                }}
                                            />
                                        }
                                        disabled={
                                            !item.popconfirmTips ||
                                            item.disabled
                                        }
                                        overlayClassName={styles.popconfirmTips}
                                    >
                                        <Tooltip
                                            title={
                                                item.disabled
                                                    ? item.disableTips
                                                    : ''
                                            }
                                        >
                                            <Button
                                                type="link"
                                                key={item.key}
                                                disabled={item.disabled}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleOperate(
                                                        item.key,
                                                        record,
                                                        item.label,
                                                    )
                                                }}
                                            >
                                                {item.label}
                                            </Button>
                                        </Tooltip>
                                    </Popconfirm>
                                )
                            })}
                    </Space>
                )
            },
        },
    ]

    const onChangeMenuToTableSort = (selectedMenu) => {
        switch (selectedMenu.key) {
            case 'updated_at':
                setTableSort({
                    updated_at:
                        selectedMenu.sort === SortDirection.ASC
                            ? 'ascend'
                            : 'descend',
                })
                break
            default:
                setTableSort({})
                break
        }
    }

    const renderEmpty = () => {
        return <Empty desc={__('暂无数据')} iconSrc={dataEmpty} />
    }

    const handleDelete = async () => {
        try {
            setDelBtnLoading(true)
            if (!curCatlg) return
            await deleteOpenCatlg(curCatlg.id)
            message.success(__('删除成功'))

            setSearchCondition({
                ...searchCondition,
                offset: initSearchCondition.offset,
            })
        } catch (e) {
            formatError(e)
        } finally {
            setDelBtnLoading(false)
            setDelVisible(false)
        }
    }

    // 1：上线、3：下线、4：发布
    const handleOnline = async (data: any, type: OperateType) => {
        const text =
            type === OperateType.ONLINE
                ? __('上线')
                : type === OperateType.OFFLINE
                ? __('下线')
                : __('发布')
        try {
            const flowType =
                type === OperateType.ONLINE
                    ? 'af-data-catalog-online'
                    : type === OperateType.OFFLINE
                    ? 'af-data-catalog-offline'
                    : 'af-data-catalog-publish'

            await createAuditFlow({
                catalogID: data?.id,
                flowType,
            })
            message.success(__('操作成功'))
            setSearchCondition({
                ...searchCondition,
                offset: initSearchCondition.offset,
            })
        } catch (error) {
            if (
                error?.data?.code === 'DataCatalog.Public.NoAuditDefFoundError'
            ) {
                message.error({
                    content: __('审核发起失败，未找到匹配的审核流程'),
                    duration: 5,
                })
            } else if (
                error?.data?.code ===
                'DataCatalog.Public.ConfigCenterDepOwnerUsersRequestErr'
            ) {
                message.info({
                    content: `${text}${__('失败，部门不存在')}`,
                })
            } else {
                formatError(error)
            }
        } finally {
            setOnlineVisible(false)
        }
    }

    const toAdd = () => {
        navigator(`/dataService/editInfoCatlg`)
    }

    // 筛选顺序变化
    const handleMenuChange = (selectedMenu) => {
        setSearchCondition({
            ...searchCondition,
            sort: selectedMenu.key,
            direction: selectedMenu.sort,
            offset: 1,
        })
        setSelectedSort(selectedMenu)
        onChangeMenuToTableSort(selectedMenu)
    }

    return (
        <div className={styles.openCatlgWrapper}>
            <div className={styles.top}>
                <div className={styles.title}>{__('开放目录关联')}</div>
            </div>

            <div className={styles.catlgResourceWrapper}>
                <div className={styles.topOprWrapper}>
                    <SearchLayout
                        ref={searchFormRef}
                        prefixNode={
                            <div>
                                <Button
                                    type="primary"
                                    onClick={() => setAddOpenCatlgModal(true)}
                                    icon={<AddOutlined />}
                                >
                                    {__('添加')}
                                </Button>
                            </div>
                        }
                        suffixNode={
                            <SortBtn
                                contentNode={
                                    <DropDownFilter
                                        menus={menus}
                                        defaultMenu={defaultMenu}
                                        menuChangeCb={handleMenuChange}
                                        changeMenu={selectedSort}
                                    />
                                }
                            />
                        }
                        formData={searchFormData}
                        onSearch={(object, isRefresh) => {
                            const obj = timeStrToTimestamp(object)
                            const {
                                keyword,
                                updated_at_start,
                                updated_at_end,
                                open_type,
                                open_level,
                            } = obj

                            // 开放方式选择无条件开放时，不能选择开放级别
                            const params = {
                                ...searchCondition,
                                keyword,
                                ...obj,
                                open_level:
                                    open_type !== OpenTypeEnum.NoCondition
                                        ? open_level
                                        : undefined,
                                offset: isRefresh ? searchCondition.offset : 1,
                            }
                            setSearchCondition(params)
                            // 开放方式改变
                            if (open_type !== searchCondition.open_type) {
                                searchFormRef?.current.changeFormValues({
                                    open_level: undefined,
                                })
                                setSearchFormData((prev: any) => {
                                    return prev.map((item) => {
                                        if (item.key === 'open_level') {
                                            return {
                                                ...item,
                                                itemProps: {
                                                    ...(item.itemProps || {}),
                                                    disabled:
                                                        open_type ===
                                                        OpenTypeEnum.NoCondition,
                                                },
                                            }
                                        }

                                        return item
                                    })
                                })
                            }
                        }}
                        getExpansionStatus={setSearchIsExpansion}
                    />
                </div>
                {loading ? (
                    <Loader />
                ) : (
                    <div className={styles.bottom}>
                        {tableProps.dataSource.length === 0 &&
                        !hasSearchCondition ? (
                            <div className={styles.emptyWrapper}>
                                {renderEmpty()}
                            </div>
                        ) : (
                            <Table
                                className={classnames(
                                    !searchIsExpansion && styles.isExpansion,
                                )}
                                rowClassName={styles.tableRow}
                                columns={columns}
                                {...tableProps}
                                rowKey="id"
                                scroll={{
                                    x: 1200,
                                    y:
                                        tableProps.dataSource.length === 0
                                            ? undefined
                                            : `calc(100vh - ${tableHeight}px)`,
                                }}
                                pagination={{
                                    ...tableProps.pagination,
                                    current: searchCondition.offset,
                                    pageSize: searchCondition.limit,
                                    showTotal: (t) => `共 ${t} 条`,
                                    showSizeChanger: true,
                                    hideOnSinglePage:
                                        (pagination?.total || 10) < 10,
                                }}
                                bordered={false}
                                locale={{
                                    emptyText: <Empty />,
                                }}
                                onChange={(newPagination, filters, sorter) => {
                                    const newSearchCondition = {
                                        ...searchCondition,
                                        offset: newPagination?.current || 1,
                                        limit: newPagination?.pageSize || 10,
                                    }
                                    if (
                                        newPagination.current ===
                                        searchCondition.offset
                                    ) {
                                        const selectedMenu =
                                            handleTableChange(sorter)
                                        setSelectedSort(selectedMenu)
                                        setSearchCondition({
                                            ...newSearchCondition,
                                            // sort_by: {
                                            //     ...(searchCondition?.sort_by ||
                                            //         {}),
                                            //     fields: [selectedMenu.key],
                                            //     direction:
                                            //         selectedMenu.sort,
                                            // },
                                        })
                                    } else {
                                        setSearchCondition(newSearchCondition)
                                    }
                                }}
                            />
                        )}
                    </div>
                )}
                {/* <Confirm
                    open={delVisible}
                    title={__('确定要执行此操作吗？')}
                    content={__('开放资源目录删除后，将无法找回，请谨慎操作！')}
                    onOk={handleDelete}
                    onCancel={() => {
                        setDelVisible(false)
                    }}
                    width={432}
                    okButtonProps={{ loading: delBtnLoading }}
                /> */}
                {/* 新增开放目录 */}
                <AddOpenCatlg
                    open={addOpenCatlgModal}
                    onClose={() => setAddOpenCatlgModal(false)}
                    onOK={() => {
                        run(searchDebounce)
                        setAddOpenCatlgModal(false)
                    }}
                />
                {/* 编辑开放目录 */}
                {editOpenCatlgModal && (
                    <EditOpenCatlg
                        open={editOpenCatlgModal}
                        catalogInfo={curCatlg}
                        onClose={() => setEditOpenCatlgModal(false)}
                        onOK={() => {
                            run(searchDebounce)
                            setEditOpenCatlgModal(false)
                        }}
                    />
                )}
                {/* 开放目录详情 */}
                {detailOpen && (
                    <OpenCatlgDetailDrawer
                        open={detailOpen}
                        catlgItem={curCatlg}
                        onCancel={() => setDetailOpen(false)}
                    />
                )}
            </div>
        </div>
    )
}

export default OpenCatalog
