import {
    Badge,
    Button,
    Checkbox,
    Divider,
    Drawer,
    Dropdown,
    message,
    Modal,
    Space,
    Table,
} from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useGetState, useUpdateEffect } from 'ahooks'
import __ from './locale'
import {
    DataAnalysisTab,
    tabMap,
    recordSearchFilter,
    CatalogPublishStatusMap,
} from './const'
import styles from './styles.module.less'
import { Empty, ListPagination, ListType, Loader, OptionBarTool } from '@/ui'
import {
    formatError,
    ShareApplyStatus,
    getDataAnalCatalogList,
    getDataAnalCatalogOutputItemList,
    IDataAnalCatalogOutputItem,
    IDataAnalCatalogItem,
    DataAnalCatalogPublishStatusEnum,
} from '@/core'
import { formatTime, getActualUrl, rewriteUrl, useQuery } from '@/utils'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import SearchLayout from '../SearchLayout'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import dataEmpty from '@/assets/dataEmpty.svg'
import AddCatalog from '../DataAnalysisDemand/AddCatalog'
import CardHeader from '../DataAnalysisDemand/components/CardHeader'

const initPublishStatusFilter = [
    DataAnalCatalogPublishStatusEnum.Published,
    DataAnalCatalogPublishStatusEnum.Unpublished,
    DataAnalCatalogPublishStatusEnum.Null,
]
const CatalogDataTable: React.FC = () => {
    const query = useQuery()
    // 共享申请 id
    const applyId = query.get('applyId') || ''
    const { initSearch, filterKeys } = tabMap[DataAnalysisTab.CatalogData]

    // 页面加载状态
    const [loading, setLoading] = useState(false)
    // 卡片列表
    const [cardList, setCardList] = useState<IDataAnalCatalogItem[]>([])
    // 卡片数据总数
    const [total, setTotal] = useState(0)
    // 展开的卡片
    const [expandedCard, setExpandedCard, getExpandedCard] =
        useGetState<any>(null)
    // 卡片搜索条件
    const [searchCondition, setSearchCondition] = useState<any>(initSearch)
    // 表格加载状态
    const [tableLoading, setTableLoading] = useState(false)
    // 表格数据
    const [tableData, setTableData] = useState<IDataAnalCatalogOutputItem[]>([])
    // 表格操作项
    const [operateItem, setOperateItem] =
        useState<IDataAnalCatalogOutputItem | null>(null)
    // 添加选中状态的状态管理
    const [selectStatus, setSelectStatus] = useState<ShareApplyStatus>(
        ShareApplyStatus.All,
    )
    const [addCatalogOpen, setAddCatalogOpen] = useState(false)

    const [publishStatusFilter, setPublishStatusFilter] = useState<
        DataAnalCatalogPublishStatusEnum[]
    >(initPublishStatusFilter)
    // 当前用户信息
    const [userInfo] = useCurrentUser()
    useEffect(() => {
        if (searchCondition) {
            getCardList(searchCondition)
        }
    }, [searchCondition])

    const showTableData = useMemo(() => {
        if (
            publishStatusFilter.length === 0 ||
            publishStatusFilter.length === 3
        )
            return tableData

        const publishData = tableData.filter(
            (item) =>
                item.publish_status ===
                DataAnalCatalogPublishStatusEnum.Published,
        )
        const noStatusData = tableData.filter((item) => !item.publish_status)
        const unPublishData = tableData.filter(
            (item) =>
                item.publish_status &&
                item.publish_status !==
                    DataAnalCatalogPublishStatusEnum.Published,
        )
        let res: IDataAnalCatalogOutputItem[] = []
        if (
            publishStatusFilter.includes(
                DataAnalCatalogPublishStatusEnum.Published,
            )
        ) {
            res = [...publishData]
        }
        if (
            publishStatusFilter.includes(
                DataAnalCatalogPublishStatusEnum.Unpublished,
            )
        ) {
            res = [...res, ...unPublishData]
        }
        if (
            publishStatusFilter.includes(DataAnalCatalogPublishStatusEnum.Null)
        ) {
            res = [...res, ...noStatusData]
        }

        return res
    }, [publishStatusFilter, tableData])

    // 获取卡片列表数据
    const getCardList = async (params: any) => {
        try {
            setLoading(true)
            const res = await getDataAnalCatalogList(
                applyId
                    ? { id: applyId }
                    : {
                          ...params,
                      },
            )
            const entries = res?.entries || []
            setCardList(entries)
            setTotal(res?.total_count || 0)

            // 如果有数据，默认展开第一个卡片
            if (entries.length > 0) {
                const firstCard = entries[0]
                setExpandedCard(firstCard)
                getCardTableData(firstCard.id)
            } else {
                // 如果没有数据，清空相关状态
                clearActiveData()
            }
        } catch (error) {
            formatError({ error })
        } finally {
            setLoading(false)
        }
    }

    // 获取展开卡片的表格数据
    const getCardTableData = async (cardId: string) => {
        try {
            setTableLoading(true)

            const res = await getDataAnalCatalogOutputItemList(cardId)
            setTableData(res || [])
        } catch (error) {
            formatError(error)
        } finally {
            setTableLoading(false)
        }
    }

    const handleCatalogOk = () => {
        getCardTableData(expandedCard?.id!)
    }

    // 处理卡片展开/收起
    const handleCardExpand = (cardInfo: any) => {
        if (expandedCard?.id === cardInfo.id) {
            setExpandedCard(null)
            setTableData([])
            setOperateItem(null)
        } else {
            setExpandedCard(cardInfo)
            getCardTableData(cardInfo.id)
        }
    }

    // 清理方法
    const clearActiveData = () => {
        setExpandedCard(null)
        setTableData([])
        setOperateItem(null)
    }

    const publishStatusItems = [
        {
            label: __('未发布'),
            value: DataAnalCatalogPublishStatusEnum.Unpublished,
        },
        {
            label: __('已发布'),
            value: DataAnalCatalogPublishStatusEnum.Published,
        },
        {
            label: __('空'),
            value: DataAnalCatalogPublishStatusEnum.Null,
        },
    ]

    const dropdownRender = (menu: any) => {
        return (
            <div className={styles['dropdown-container']}>
                <div className={styles['dropdown-header']}>
                    <div>{__('筛选')}</div>
                    <Button
                        type="link"
                        onClick={() =>
                            setPublishStatusFilter(initPublishStatusFilter)
                        }
                    >
                        {__('重置筛选')}
                    </Button>
                </div>
                <Divider style={{ margin: 0 }} />
                <div className={styles['checkbox-group-container']}>
                    <Checkbox.Group
                        className={styles['dropdown-vertical-checkbox']}
                        options={publishStatusItems}
                        value={publishStatusFilter}
                        onChange={(value) => {
                            setPublishStatusFilter(
                                value as DataAnalCatalogPublishStatusEnum[],
                            )
                        }}
                    />
                </div>
            </div>
        )
    }

    // 表格列配置
    const columns: any = [
        {
            title: __('数据资源名称（编码）'),
            dataIndex: 'view_busi_name',
            key: 'view_busi_name',
            ellipsis: true,
            width: 300,
            render: (text: string, record: any) => {
                return (
                    <div
                        className={styles['name-container']}
                        key={record.view_id}
                    >
                        <FontIcon
                            name="icon-shujubiaoshitu"
                            type={IconType.COLOREDICON}
                            className={styles['view-icon']}
                        />
                        <div className={styles['name-info']}>
                            <div
                                className={styles['business-name']}
                                title={record.view_busi_name}
                            >
                                {record.view_busi_name}
                            </div>
                            <div
                                className={styles['technical-name']}
                                title={record.view_code}
                            >
                                {record.view_code}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            title: __('资源类型'),
            dataIndex: 'res_type',
            key: 'res_type',
            width: 120,
            render: (value) => (value === 'view' ? __('库表') : '--'),
        },
        {
            title: __('所属组织架构'),
            dataIndex: 'org_name',
            key: 'org_name',
            ellipsis: true,
            render: (value, record) => (
                <span title={record.org_path}>{value || '--'}</span>
            ),
        },
        {
            title: __('所属数据目录名称（编码）'),
            dataIndex: 'catalog_name',
            key: 'catalog_name',
            ellipsis: true,
            render: (text: string, record: any) => {
                return record.catalog_name ? (
                    <div
                        className={styles['name-container']}
                        key={record.view_id}
                    >
                        <FontIcon
                            name="icon-shujumuluguanli1"
                            type={IconType.COLOREDICON}
                            className={styles['view-icon']}
                        />
                        <div className={styles['name-info']}>
                            <div
                                className={styles['business-name']}
                                title={record.catalog_name}
                            >
                                {record.catalog_name}
                            </div>
                            <div
                                className={styles['technical-name']}
                                title={record.catalog_code}
                            >
                                {record.catalog_code}
                            </div>
                        </div>
                    </div>
                ) : (
                    '--'
                )
            },
        },
        {
            title: (
                <div>
                    {__('目录发布状态')}
                    <Dropdown
                        placement="bottom"
                        dropdownRender={dropdownRender}
                    >
                        <FontIcon
                            name="icon-shaixuan"
                            type={IconType.FONTICON}
                            className={styles['filter-icon']}
                        />
                    </Dropdown>
                </div>
            ),
            dataIndex: 'publish_status',
            key: 'publish_status',
            render: (value: DataAnalCatalogPublishStatusEnum) =>
                !value ? (
                    '--'
                ) : (
                    <Badge
                        color={
                            value === DataAnalCatalogPublishStatusEnum.Published
                                ? CatalogPublishStatusMap[
                                      DataAnalCatalogPublishStatusEnum.Published
                                  ].color
                                : CatalogPublishStatusMap[
                                      DataAnalCatalogPublishStatusEnum
                                          .Unpublished
                                  ].color
                        }
                        text={
                            value === DataAnalCatalogPublishStatusEnum.Published
                                ? __('已发布')
                                : __('未发布')
                        }
                    />
                ),
        },
        {
            title: __('发布时间'),
            dataIndex: 'published_at',
            key: 'published_at',
            sorter: (a, b) => a.published_at - b.published_at,
            showSorterTooltip: false,
            sortDirections: ['descend', 'ascend', 'descend'],
            width: 160,
            ellipsis: true,
            render: (val: number, record) =>
                val ? formatTime(val, 'YYYY-MM-DD') : '--',
        },
        {
            title: __('操作'),
            key: 'action',
            width: 260,
            render: (_, record) => (
                <Space size={16}>
                    <Button
                        type="link"
                        onClick={() => {
                            const url = `/datasheet-view/detail?id=${record.view_id}&model=view`
                            window.open(getActualUrl(url))
                        }}
                    >
                        {__('查看')}
                    </Button>
                    {(!record.publish_status ||
                        record.publish_status ===
                            DataAnalCatalogPublishStatusEnum.Unpublished) && (
                        <Button
                            type="link"
                            onClick={() => {
                                setAddCatalogOpen(true)
                                setOperateItem(record)
                            }}
                        >
                            {__('编目')}
                        </Button>
                    )}
                </Space>
            ),
        },
    ]

    // 渲染卡片
    const renderCard = (item: any) => (
        <div key={item.id} className={styles.implementCard}>
            <CardHeader
                section={item}
                expanded={expandedCard?.id === item.id}
                handleToggleExpand={() => handleCardExpand(item)}
            />
            {expandedCard?.id === item.id && (
                <Table
                    columns={columns}
                    scroll={{
                        y: `200px`,
                    }}
                    dataSource={showTableData}
                    pagination={false}
                    rowKey="id"
                    loading={tableLoading}
                />
            )}
        </div>
    )

    // 搜索处理
    const handleSearch = (values: any) => {
        const newCondition = {
            ...searchCondition,
            ...values,
            offset: 1,
        }
        setSearchCondition(newCondition)
    }

    // 分页处理
    const handlePageChange = (page: number, pageSize: number) => {
        setSearchCondition((prev) => ({
            ...prev,
            offset: page,
            limit: pageSize,
        }))
    }

    // 切换状态
    const handleStatusChange = (status: ShareApplyStatus) => {
        setSelectStatus(status)
        const newCondition = {
            ...searchCondition,
            status,
            is_all: status === ShareApplyStatus.All,
            offset: 1,
        }
        setSearchCondition(newCondition)
    }

    return (
        <div className={styles['catalog-data-table']}>
            <SearchLayout
                formData={recordSearchFilter({
                    filterKeys,
                })}
                prefixNode={
                    __('数据资源编目')
                    // <StatusFilter
                    //     statusOptions={statusOption}
                    //     selectStatus={selectStatus}
                    //     onStatusChange={handleStatusChange}
                    // />
                }
                onSearch={handleSearch}
            />
            {loading ? (
                <div className={styles.loadingWrapper}>
                    <div style={{ marginTop: 104, width: '100%' }}>
                        <Loader />
                    </div>
                </div>
            ) : (
                <>
                    {cardList.length === 0 ? (
                        <Empty
                            iconSrc={dataEmpty}
                            desc={__('暂无数据')}
                            style={{ marginTop: 36, width: '100%' }}
                        />
                    ) : (
                        <div className={styles.cardList}>
                            {cardList.map(renderCard)}
                        </div>
                    )}

                    <ListPagination
                        listType={ListType.WideList}
                        queryParams={searchCondition}
                        totalCount={total}
                        onChange={handlePageChange}
                        className={styles.pagination}
                    />
                </>
            )}
            {addCatalogOpen && operateItem?.view_id && (
                <AddCatalog
                    open={addCatalogOpen}
                    onClose={() => setAddCatalogOpen(false)}
                    resId={operateItem?.view_id}
                    onOk={handleCatalogOk}
                />
            )}
        </div>
    )
}

export default CatalogDataTable
