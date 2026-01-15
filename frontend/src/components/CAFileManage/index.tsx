import { ExclamationCircleFilled } from '@ant-design/icons'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Space, Table, message } from 'antd'

import { useDebounce, useSize } from 'ahooks'
import { SortOrder } from 'antd/lib/table/interface'
import classnames from 'classnames'
import { trim } from 'lodash'
import moment from 'moment'
import dataEmpty from '@/assets/dataEmpty.svg'
import { RefreshBtn, SortBtn } from '@/components/ToolbarComponents'
import { useUserPermCtx } from '@/context/UserPermissionProvider'
import {
    CAFileTreeType,
    CAFileType,
    ICAFileItem,
    ICAFileListParams,
    IMenuData,
    SortDirection,
    delCAFileById,
    downloadCAFileById,
    formatError,
    getCAFileList,
    previewCAFileHrefById,
} from '@/core'
import {
    LightweightSearch,
    ListPageSizerOptions,
    ListType,
    SearchInput,
} from '@/ui'
import Empty from '@/ui/Empty'
import Loader from '@/ui/Loader'
import {
    OperateType,
    StdDirStyle,
    getActualUrl,
    getFileExtension,
    streamToFile,
} from '@/utils'
import { confirm } from '@/utils/modalHelper'
import DragBox from '../DragBox'
import DropDownFilter from '../DropDownFilter'
import FileIcon from '../FileIcon'
import { UNGROUPED } from '../FormGraph/helper'
import CAFileCustomTree from './CAFileCustomTree'
import Details from './Details'
import {
    FileSorterType,
    defaultMenu,
    fileTypeOptions,
    menus,
    searchData,
} from './helper'
import __ from './locale'
import styles from './styles.module.less'

const defaultPagiSize = 20
const miniPageSize = ListPageSizerOptions[ListType.NarrowList]?.[0]

const initSearchCondition = {
    business_type: CAFileTreeType.FileType,
    type: CAFileType.ALL,
    related_object_id: [],
    offset: 1,
    limit: defaultPagiSize,
    keyword: '',
    sort: FileSorterType.CREATED,
    direction: SortDirection.DESC,
    un_class_type: 0,
}

const CAFileManage = () => {
    const navigator = useNavigate()
    const { checkPermission } = useUserPermCtx()

    const [defaultSize, setDefaultSize] = useState<Array<number>>([15, 85])

    // 搜索关键字
    const [searchKey, setSearchKey] = useState('')

    const ref = useRef<HTMLDivElement>(null)
    const treeRef = useRef<any>(null)
    // 文件类型树与表格右上角筛选类型对应
    const [fileTreeNode, setFileTreeNode] = useState({
        id: '',
        business_type: CAFileTreeType.FileType,
    })

    const lightweightSearchRef: any = useRef()
    // 过滤项
    const [searchFormData, setSearchFormData] = useState(searchData)

    // 列表大小
    const size = useSize(ref)

    // 详情界面显示,【true】显示,【false】隐藏
    const [detailVisible, setDetailVisible] = useState(false)

    // 表格选中项
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

    // 删除项ID
    const [delId, setDelId] = useState<number | string>(0)

    // 请求加载
    const [isLoading, setIsLoading] = useState(false)

    // 整体的load显示,【true】显示,【false】隐藏
    const [loading, setLoading] = useState(true)
    const [listLoading, setListLoading] = useState(true)

    const [selectedSort, setSelectedSort] = useState<
        { key: FileSorterType | string; sort: SortDirection } | undefined
    >(defaultMenu)
    // 搜索参数
    const [searchCondition, setSearchCondition] = useState<ICAFileListParams>({
        ...initSearchCondition,
    })
    const searchDebounce = useDebounce(searchCondition, { wait: 300 })

    // table文件列表
    const [fileList, setFileList] = useState<Array<ICAFileItem>>([])

    // table分页参数
    const [total, setTotal] = useState(0)
    // 当前页码信息
    const [pageConfig, setPageConfig] = useState({
        current: 1,
        pageSize: defaultPagiSize,
    })

    // useUpdateEffect(() => {
    //     setLoading(true)
    //     setSearchCondition({
    //         ...initSearchCondition,
    //         business_type: treeRef?.current?.viewMode,
    //     })
    // }, [treeRef?.current?.viewMode])

    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        let newSearchCondition = {
            ...searchCondition,
        }
        if (pagination.current === searchCondition.offset) {
            // 默认
            setSelectedSort({
                key: sorter?.columnKey,
                sort:
                    sorter?.order === 'ascend'
                        ? SortDirection.ASC
                        : SortDirection.DESC,
            })
            newSearchCondition = {
                ...searchCondition,
                sort: sorter?.columnKey,
                direction:
                    sorter?.order === 'ascend'
                        ? SortDirection.ASC
                        : SortDirection.DESC,
            }
            setSearchCondition({
                ...newSearchCondition,
            })
        }

        setPageConfig({
            ...pageConfig,
            current: pagination.current,
            pageSize: pagination.pageSize,
        })
    }

    useEffect(() => {
        filterFileList(searchDebounce)
    }, [searchDebounce])

    // 处理页码变化
    const onPageChange = (page: number, pageSize: number) => {
        setFileList([]) // 清空table的datasource，避免报错
        // 切换页面清空选中页码
        if (page !== pageConfig.current) {
            setSelectedRowKeys([])
        }
        setPageConfig({
            current: page,
            pageSize,
        })
        setSearchCondition({
            ...searchCondition,
            keyword: searchKey,
            offset: page,
            limit: pageSize,
        })
    }

    // 删除确认提示
    const deleteConfirm = (okCallBack: () => void) => {
        confirm({
            title: __('确认要删除吗？'),
            icon: <ExclamationCircleFilled className="delIcon" />,
            // content: __(
            //     '删除后，该标准文件将无法恢复，但不会对已经关联该标准文件的相关数据标准产生影响',
            // ),
            okText: __('确定'),
            cancelText: __('取消'),
            onOk() {
                okCallBack()
            },
        })
    }

    // 删除表单
    const handleDelete = async (dId: string, batchDel?: boolean) => {
        try {
            setIsLoading(true)
            const pageCurrent =
                fileList?.length === (batchDel ? selectedRowKeys?.length : 1)
                    ? pageConfig.current - 1 > 0
                        ? pageConfig.current - 1
                        : 1
                    : pageConfig.current

            await delCAFileById(dId)
            setIsLoading(false)
            message.success(__('删除成功'))
            if (pageCurrent === pageConfig.current) {
                filterFileList(searchCondition)
            } else {
                setPageConfig({
                    ...pageConfig,
                    current: pageCurrent,
                })
                setSearchCondition({
                    ...searchCondition,
                    offset: pageCurrent,
                })
            }

            if (batchDel) {
                setSelectedRowKeys([])
            } else if (selectedRowKeys.length > 0) {
                // 在选中时 删除选中行，更新选中项
                const tempKeys = selectedRowKeys.filter((key) => key !== delId)
                setSelectedRowKeys(tempKeys)
            }
        } catch (error: any) {
            if (error.status === 400) {
                const errorKey =
                    (error.data.detail &&
                        error.data.detail[0] &&
                        error.data.detail[0].Key) ||
                    error.data.code ||
                    ''
                let msg = ''
                if (errorKey === 'Standardization.InvalidParameter') {
                    msg = error.data.detail
                        ? error.data.detail[0].Message
                        : error.data.description
                } else if (errorKey === 'Standardization.Incorrect') {
                    // 消息队列服务异常
                    msg = error.data.description
                }
                if (msg) {
                    message.error(msg)
                }
                filterFileList(searchCondition)
            } else {
                formatError(error)
            }
        } finally {
            setIsLoading(false)
            // setDelVisible(false)
        }
    }

    const [oprId, serOprId] = useState<string>('')
    // 点击操作选中对象
    const [oprItem, setOprItem] = useState<ICAFileItem>()

    // 操作处理
    const handleOperate = async (type: OperateType, record: any) => {
        const { id } = record || {}
        setOprItem(record)
        if (type === OperateType.DETAIL) {
            // 查看詳情
            setDetailVisible(true)
            if (id && id !== '') {
                serOprId(id)
            }
        } else if (type === OperateType.PREVIEW) {
            // 预览
            toView(record)
        } else if (type === OperateType.EXPORT) {
            // 导出文件
            downloadFile(record)
        } else if (type === OperateType.LINK) {
            // 跳转管理
            if (record.type === CAFileType.Standard) {
                window.open(
                    getActualUrl(`/standards/file?name=${record.fileName}`),
                    '_blank',
                )
            } else if (record.type === CAFileType.Responsibility) {
                window.open(
                    getActualUrl('/systemConfig/businessArchitecture'),
                    '_blank',
                )
            } else if (
                [
                    CAFileType.ConstructionBasis,
                    CAFileType.ConstructionContent,
                ].includes(record.type)
            ) {
                window.open(getActualUrl('/systemConfig/infoSystem'), '_blank')
            }
        } else if (type === OperateType.DELETE) {
            // 删除
            setDelId(record.id)
            deleteConfirm(() => handleDelete(record.id, false))
        }
    }

    const downloadFile = async (fileItem: ICAFileItem) => {
        try {
            message.info(__('导出准备中...'))
            const res = await downloadCAFileById({
                id: fileItem.id,
                oss_id: fileItem.export_oss_id,
            })
            // 将文件流转换成文件
            streamToFile(res, fileItem?.name)
            message.success(__('导出成功'))
        } catch (error) {
            formatError(error)
        }
    }

    const handlePreviewFile = async (fileItem: ICAFileItem) => {
        try {
            const res = await downloadCAFileById({
                id: fileItem.id,
                oss_id: fileItem.export_oss_id,
            })
            const blob = new Blob([res], {
                type: 'application/octet-stream',
            })
            const blobUrl = URL.createObjectURL(blob)
            window.open(blobUrl, '_blank')
        } catch (e) {
            formatError(e)
        }
    }

    const toView = async (fileItem: ICAFileItem) => {
        try {
            const res: any = await previewCAFileHrefById({
                id: fileItem.id,
                preview_id: fileItem.preview_oss_id || '',
            })
            // // const mimeType = contentTypes[getFileExtension(name) || '']
            // const mimeType = 'application/pdf'
            // const blob = new Blob([res], { type: mimeType })
            // const blobUrl = URL.createObjectURL(blob)
            // window.open(blobUrl, '_blank')
            window.open(res?.href_url, '_blank')
        } catch (error) {
            formatError(error)
        }
    }

    // 筛选onChange
    const handleSelectChange = (value: number) => {
        setPageConfig({
            ...pageConfig,
            current: 1,
        })
        setSearchCondition({
            ...searchCondition,
            keyword: searchKey,
            offset: 1,
        })
    }

    // 搜索框enter
    const handleSearchPressEnter = (e: any) => {
        const keyword = typeof e === 'string' ? e : trim(e.target.value)
        if (keyword === searchCondition?.keyword) return
        setSearchKey(keyword)
        setPageConfig({
            ...pageConfig,
            current: 1,
        })
        setSearchCondition({
            ...searchCondition,
            offset: 1,
            keyword,
        })
    }

    // 排序方式改变
    const handleMenuChange = (selectedMenu: IMenuData) => {
        // if (hasData) {
        const current = 1
        setPageConfig({
            ...pageConfig,
            current,
        })
        setSearchCondition({
            ...searchCondition,
            offset: current,
            keyword: searchKey,
            sort: selectedMenu.key as FileSorterType,
            direction: selectedMenu.sort,
        })
    }

    // 表格项操作
    const columnOprs = (record: any) => {
        const { type, fileType } = record
        // 预览id无值 或者 不可直接预览文件类型的导出id与预览id值相同（代表文件还在转pdf中）
        const isDisabledView =
            !record?.preview_oss_id ||
            (['doc', 'docx', 'xls', 'xlsx'].includes(fileType) &&
                record.export_oss_id === record.preview_oss_id)
        const oprs: any = [
            {
                key: OperateType.DETAIL,
                label: __('详情'),
            },
            {
                key: OperateType.PREVIEW,
                label: __('预览'),
                disable: isDisabledView,
            },
            {
                key: OperateType.EXPORT,
                label: __('导出'),
                disable: !record?.export_oss_id,
            },
            {
                key: OperateType.LINK,
                label: __('跳转管理'),
                disable:
                    type === CAFileType.Standard
                        ? !checkPermission('manageDataStandard')
                        : type === CAFileType.Responsibility
                        ? !checkPermission('manageUserAndRole')
                        : [
                              CAFileType.ConstructionBasis,
                              CAFileType.ConstructionContent,
                          ].includes(type)
                        ? !checkPermission('manageInformationSystem')
                        : undefined,
            },
            {
                key: OperateType.DELETE,
                label: __('删除'),
            },
        ]

        return oprs
    }

    // 原始/标准表格项
    const columnsFile: any = [
        {
            title: __('文件名称'),
            dataIndex: 'fileName',
            key: 'name',
            // width: 172,
            ellipsis: true,
            sorter: true,
            sortOrder:
                searchCondition.sort === FileSorterType.FILENAME
                    ? searchCondition.direction === SortDirection.ASC
                        ? ('ascend' as SortOrder)
                        : ('descend' as SortOrder)
                    : undefined,
            showSorterTooltip: {
                title: __('按文件名称排序'),
                placement: 'bottom',
            },
            render: (name: any, record: any) => (
                <div
                    className={classnames(
                        styles.showTableInfo,
                        styles.fileNameWrapper,
                    )}
                >
                    <FileIcon suffix={record.fileType} />

                    <div
                        className={styles.topInfo}
                        title={name || '--'}
                        onClick={() =>
                            handleOperate(OperateType.DETAIL, record)
                        }
                    >
                        {name || '--'}
                    </div>
                </div>
            ),
        },
        {
            title: __('文件类型'),
            dataIndex: 'type',
            key: 'type',
            // width: 180,
            ellipsis: true,
            render: (type: any) => {
                const res: any = fileTypeOptions?.find(
                    (item: any) => item.value === type,
                )
                return (
                    <div className={styles.baseTableRow}>
                        {res ? res.label : '--'}
                    </div>
                )
            },
        },
        {
            title: __('创建时间'),
            dataIndex: 'created_at',
            key: 'created_at',
            // width: 180,
            ellipsis: true,
            sorter: true,
            sortOrder:
                searchCondition.sort === FileSorterType.CREATED
                    ? searchCondition.direction === SortDirection.ASC
                        ? ('ascend' as SortOrder)
                        : ('descend' as SortOrder)
                    : undefined,
            showSorterTooltip: {
                title: __('按创建时间排序'),
                placement: 'bottom',
            },
            render: (date: any) => (
                <div className={styles.baseTableRow}>
                    {date
                        ? moment(date || '').format('YYYY-MM-DD HH:mm:ss')
                        : '--'}
                </div>
            ),
        },
        {
            title: __('操作'),
            fixed: 'right',
            key: 'action',
            width: 280,
            render: (_: string, record: any) => {
                // 按钮超过三个之外的放到dropdown中
                const oprs = columnOprs(record) || []
                const maxBtnCount = 4
                const showMore = oprs?.length > maxBtnCount
                //   按钮展示
                const btnOprs = showMore ? oprs.slice(0, maxBtnCount - 1) : oprs
                // 下拉展示，超过四个，把第四个及其之后的放到dropdown中
                const moreMenus = showMore ? oprs.slice(maxBtnCount - 1) : []
                return (
                    <Space size={16} className={styles.tableOperate}>
                        {oprs?.map((oItem, oIndex) => {
                            return (
                                <div
                                    key={oIndex}
                                    className={classnames(
                                        styles.operate,
                                        oItem.disable
                                            ? styles.disableOpr
                                            : undefined,
                                    )}
                                    onClick={() =>
                                        handleOperate(oItem.key, record)
                                    }
                                >
                                    {oItem?.label}
                                </div>
                            )
                        })}
                    </Space>
                )
            },
        },
    ]

    const showEmpty = () => {
        return <Empty desc={__('暂无数据')} iconSrc={dataEmpty} />
    }

    // 根据过滤条件获取文件
    const filterFileList = async (condition: ICAFileListParams) => {
        const {
            un_class_type,
            related_object_id,
            offset = 1,
            limit = 10,
            // status,
            created_at,
            business_type,
            type,
            keyword,
            sort,
            direction,
        } = condition

        try {
            setListLoading(true)
            const res = await getCAFileList({
                // ...condition,
                un_class_type,
                related_object_id,
                keyword,
                offset,
                limit,
                type: type as CAFileType,
                business_type,
                create_begin_time:
                    created_at?.[0] &&
                    moment(
                        created_at[0].format('YYYY-MM-DD 00:00:00'),
                    ).valueOf(),
                create_end_time:
                    created_at?.[1] &&
                    moment(
                        created_at[1].format('YYYY-MM-DD 23:59:59'),
                    ).valueOf(),
                sort,
                direction,
            })
            const dataList =
                res.entries?.map((item) => ({
                    ...item,
                    fileName: item.name?.substring(
                        0,
                        item.name.lastIndexOf('.'),
                    ),
                    fileType: getFileExtension(item.name),
                })) || []
            setFileList(dataList)
            setTotal(res.total_count)

            setSelectedRowKeys([])
        } catch (error: any) {
            formatError(error)
        } finally {
            setListLoading(false)
            if (loading) {
                setLoading(false)
            }
            setSelectedSort(undefined)
        }
    }

    const searchChange = (data: any, dataKey: string = '') => {
        if (!dataKey) {
            // 清空筛选
            setSearchCondition({
                ...searchCondition,
                ...data,
            })
        } else {
            setSearchCondition({
                ...searchCondition,
                [dataKey]: data[dataKey],
            })
        }
    }

    return (
        <DragBox
            defaultSize={defaultSize}
            minSize={[StdDirStyle.MINWIDTH, 500]}
            maxSize={[StdDirStyle.MAXWIDTH, Infinity]}
            onDragEnd={(newSize) => {
                setDefaultSize(newSize)
            }}
        >
            <CAFileCustomTree
                ref={treeRef}
                fileType={searchCondition.type}
                onTreeNodeChange={(node) => {
                    if (
                        !node ||
                        (node?.business_type ===
                            searchCondition.business_type &&
                            node?.id ===
                                searchCondition?.related_object_id?.[0])
                    )
                        return

                    // 切换左侧文件类型-树节点，修改表格顶部筛选条件中的值
                    if (
                        node.business_type === CAFileTreeType.FileType &&
                        node.id !== searchCondition.type
                    ) {
                        setSearchFormData(searchData)
                        lightweightSearchRef?.current?.reset({
                            type: node.id,
                            created_at: searchCondition.created_at,
                        })
                    }
                    const searchConditionTemp = {
                        ...searchCondition,
                        business_type: node?.business_type,
                        related_object_id:
                            node.business_type === CAFileTreeType.FileType ||
                            node?.id === UNGROUPED ||
                            !node.id
                                ? undefined
                                : [node.id],
                        un_class_type: node?.id === UNGROUPED ? 1 : 0,
                        type:
                            node.business_type === CAFileTreeType.FileType
                                ? node.id
                                : searchCondition.type,
                        offset: 1,
                    }
                    // 切换视角
                    // if (node?.business_type !== searchCondition.business_type) {
                    //     setLoading(true)
                    // }
                    setSearchCondition(searchConditionTemp)
                    setPageConfig({
                        current: 1,
                        pageSize: 20,
                    })
                    setSearchKey('')
                }}
            />

            <div className={styles.fileContentWrapper}>
                {loading ? (
                    <div className={styles.showEmpty}>
                        <Loader />
                    </div>
                ) : (
                    <>
                        <div className={styles.operateWrapper}>
                            <Space className={styles.filterCondits}>
                                <SearchInput
                                    className={styles.searchInput}
                                    title={__('搜索文件名称')}
                                    placeholder={__('搜索文件名称')}
                                    value={searchCondition.keyword}
                                    onKeyChange={(kw: string) => {
                                        handleSearchPressEnter(kw)
                                    }}
                                    maxLength={64}
                                />
                                <div className={styles.selectWrapper}>
                                    <LightweightSearch
                                        ref={lightweightSearchRef}
                                        formData={searchFormData}
                                        onChange={(data, key) =>
                                            searchChange(data, key)
                                        }
                                        defaultValue={{
                                            type: CAFileType.ALL,
                                            created_at: undefined,
                                        }}
                                    />
                                </div>

                                <Space size={4}>
                                    <SortBtn
                                        contentNode={
                                            <DropDownFilter
                                                menus={menus}
                                                defaultMenu={defaultMenu}
                                                changeMenu={selectedSort}
                                                menuChangeCb={handleMenuChange}
                                            />
                                        }
                                    />
                                    <RefreshBtn
                                        onClick={() =>
                                            filterFileList({
                                                ...searchCondition,
                                                keyword: searchKey,
                                            })
                                        }
                                    />
                                </Space>
                            </Space>
                        </div>
                        <div className={styles.tableContent}>
                            {listLoading ? (
                                <div className={styles.showEmpty}>
                                    <Loader />
                                </div>
                            ) : !searchCondition?.keyword &&
                              !fileList?.length ? (
                                <div className={styles.showEmpty}>
                                    {showEmpty()}
                                </div>
                            ) : (
                                <div ref={ref} className={styles.fileList}>
                                    <Table
                                        rowKey={(rec) => rec.id}
                                        columns={columnsFile}
                                        rowClassName={styles.tableRow}
                                        sortDirections={[
                                            'ascend',
                                            'descend',
                                            'ascend',
                                        ]}
                                        dataSource={fileList}
                                        pagination={{
                                            current: pageConfig.current,
                                            pageSize: pageConfig.pageSize,
                                            total,
                                            pageSizeOptions:
                                                ListPageSizerOptions[
                                                    ListType.NarrowList
                                                ],
                                            showQuickJumper: true,
                                            showLessItems: true,
                                            responsive: true,
                                            onChange: onPageChange,
                                            showTotal: (totalCount) => {
                                                return `共 ${totalCount} 条记录`
                                            },
                                            hideOnSinglePage:
                                                total <= miniPageSize,
                                        }}
                                        scroll={{
                                            x: 500,
                                            y:
                                                fileList?.length === 0
                                                    ? undefined
                                                    : total >
                                                      pageConfig.pageSize
                                                    ? (size?.height || 588) -
                                                      136
                                                    : (size?.height || 588) -
                                                      136,
                                        }}
                                        locale={{
                                            emptyText: <Empty />,
                                        }}
                                        onChange={handleTableChange}
                                    />
                                </div>
                            )}

                            {detailVisible && oprId !== '' && (
                                <Details
                                    visible={detailVisible && oprId !== ''}
                                    fileId={oprId}
                                    fileItem={oprItem as ICAFileItem}
                                    onClose={() => setDetailVisible(false)}
                                    handleError={(errorKey: string) => {
                                        // 文件不存在(status:400, code:Standardization.Empty)，刷新列表
                                        if (
                                            errorKey === 'Standardization.Empty'
                                        ) {
                                            filterFileList(searchCondition)
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </DragBox>
    )
}

export default CAFileManage
