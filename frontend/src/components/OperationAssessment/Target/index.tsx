import { Space, Table, Button, message, Tooltip, Modal, Checkbox } from 'antd'
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useUpdateEffect } from 'ahooks'
import classnames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { omit } from 'lodash'
import { Empty } from '@/ui'
import {
    SortDirection,
    formatError,
    getTargetList,
    deleteCityShareApply,
    LoginPlatform,
    IGetTargetListParams,
    TargetTypeEnum,
    AssessmentTargetStatus,
    IAssessmentTargetItem,
    getUsersFrontendList,
} from '@/core'
import { formatTime, getPlatformNumber, useQuery } from '@/utils'
import {
    MultiColumn,
    timeStrToTimestamp,
    recordSearchFilter,
    renderEmpty,
    renderLoader,
} from '../helper'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { SortBtn } from '@/components/ToolbarComponents'
import SearchLayout from '@/components/SearchLayout'
import { defaultMenu, defaultMenus, defaultTableSort } from '../const'
import DropDownFilter from '@/components/DropDownFilter'
import __ from '../locale'
import styles from './styles.module.less'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import Create from './Create'
import Evaluate from './Evaluate'
import View from './View'
import Delete from './Delete'

const Target: React.FC = () => {
    const navigate = useNavigate()
    const query = useQuery()

    const platform = getPlatformNumber()

    const [searchCondition, setSearchCondition] =
        useState<IGetTargetListParams>({
            type: TargetTypeEnum.Operation,
            status: AssessmentTargetStatus.All,
            sort: 'default',
            direction: SortDirection.DESC,
            limit: 10,
            offset: 1,
        })

    // 表格高度
    const [scrollY, setScrollY] = useState<string>(`calc(100vh - 227px)`)
    // 下拉排序
    const [selectedSort, setSelectedSort] = useState<any>(defaultMenu)
    // 表头排序
    const [tableSort, setTableSort] = useState<any>(defaultTableSort)

    const [loading, setLoading] = useState<boolean>(true)
    const [fetching, setFetching] = useState<boolean>(true)
    const [showDetails, setShowDetails] = useState(false)
    const [tableData, setTableData] = useState<IAssessmentTargetItem[]>([])
    const [total, setTotal] = useState<number>(0)
    // 当前操作项
    const [operateItem, setOperateItem] = useState<IAssessmentTargetItem>()

    const searchFormRef: any = useRef()

    const [userInfo] = useCurrentUser()

    const [createTargetDrawerOpen, setCreateTargetDrawerOpen] = useState(false)
    const [evaluateDrawerOpen, setEvaluateDrawerOpen] = useState(false)
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [userList, setUserList] = useState<
        { label: string; value: string }[]
    >([])

    // 是否有过滤值
    const isSearchStatus = useMemo(() => {
        const ignoreAttr = [
            'offset',
            'limit',
            'sort',
            'direction',
            'type',
            'status',
        ]
        return (
            Object.values(omit(searchCondition, ignoreAttr))?.some(
                (item) => item,
            ) || searchCondition.status !== AssessmentTargetStatus.All
        )
    }, [searchCondition])

    const getUsers = async () => {
        try {
            const res = await getUsersFrontendList()
            if (res?.entries?.length > 0) {
                setUserList(
                    (res?.entries || []).map((item) => ({
                        value: item.id,
                        label: item.name,
                    })),
                )
            }
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        getUsers()
    }, [])

    // 根据条件请求数据
    useEffect(() => {
        getTableList()
    }, [searchCondition])

    // 获取表格数据
    const getTableList = async () => {
        try {
            setFetching(true)
            const res = await getTargetList({
                ...searchCondition,
                sort:
                    searchCondition.sort === 'default'
                        ? undefined
                        : searchCondition.sort,
                direction:
                    searchCondition.sort === 'default'
                        ? undefined
                        : searchCondition.direction,
                status: searchCondition.status
                    ? searchCondition.status
                    : undefined,
            })

            setTableData(res?.entries || [])
            setTotal(res?.total || 0)
        } catch (error) {
            formatError(error)
        } finally {
            setFetching(false)
            setLoading(false)
            setSelectedSort(undefined)
        }
    }

    // 刷新
    const handleRefresh = (refresh: boolean = true) => {
        setSearchCondition((prevCondition) => ({
            ...prevCondition,
            offset: refresh ? 1 : prevCondition.offset,
        }))
    }

    const handleDelete = async (record: any) => {
        try {
            await deleteCityShareApply(record.id)
            message.success(__('删除成功'))
            handleRefresh()
        } catch (error) {
            formatError(error)
        }
    }

    const columns: any = [
        {
            title: (
                <div>
                    {__('目标名称')}
                    <span className={styles['target-name-desc-title']}>
                        {__('（描述）')}
                    </span>
                </div>
            ),
            dataIndex: 'target_name',
            key: 'target_name',
            sorter: true,
            sortOrder: tableSort?.target_name,
            showSorterTooltip: false,
            sortDirections: ['descend', 'ascend', 'descend'],
            ellipsis: true,
            width: 260,
            render: (value, record) => (
                <MultiColumn
                    record={record}
                    firstField="target_name"
                    secondField="description"
                    onClick={() => {
                        setViewDrawerOpen(true)
                        setOperateItem(record)
                    }}
                />
            ),
        },
        {
            title: __('目标类型'),
            dataIndex: 'target_type',
            key: 'target_type',
            width: 120,
            render: () => __('运营目标'),
        },
        {
            title: __('责任人'),
            dataIndex: 'responsible_name',
            key: 'responsible_name',
            ellipsis: true,
            render: (value, record) => <span title={value}>{value}</span>,
        },
        {
            title: __('协作成员'),
            dataIndex: 'employee_name',
            key: 'employee_name',
            ellipsis: true,
            render: (value, record) => <span title={value}>{value}</span>,
        },
        {
            title: __('计划开始日期'),
            dataIndex: 'start_date',
            key: 'start_date',
            sorter: true,
            sortOrder: tableSort?.start_date,
            showSorterTooltip: false,
            sortDirections: ['descend', 'ascend', 'descend'],
        },
        {
            title: __('计划结束日期'),
            dataIndex: 'end_date',
            key: 'end_date',
            sorter: true,
            sortOrder: tableSort?.end_date,
            showSorterTooltip: false,
            sortDirections: ['descend', 'ascend', 'descend'],
            // render: (val: number) => (val ? formatTime(val) : '--'),
        },
        {
            title: __('目标创建时间'),
            dataIndex: 'created_at',
            key: 'created_at',
            width: 240,
            sorter: true,
            sortOrder: tableSort?.created_at,
            showSorterTooltip: false,
            sortDirections: ['descend', 'ascend', 'descend'],
        },
        {
            title: __('目标更新时间'),
            dataIndex: 'updated_at',
            key: 'updated_at',
            width: 240,
            sorter: true,
            sortOrder: tableSort?.updated_at,
            showSorterTooltip: false,
            sortDirections: ['descend', 'ascend', 'descend'],
        },
        {
            title: __('操作'),
            key: 'action',
            width: 212,
            fixed: 'right',
            render: (_, record) => {
                return (
                    <Space>
                        <Button
                            type="link"
                            onClick={() => {
                                setViewDrawerOpen(true)
                                setOperateItem(record)
                            }}
                        >
                            {__('查看')}
                        </Button>
                        <Tooltip
                            title={
                                record.status === AssessmentTargetStatus.Ended
                                    ? __('目标已结束，不能进行编辑')
                                    : ''
                            }
                        >
                            <Button
                                type="link"
                                disabled={
                                    record.status ===
                                    AssessmentTargetStatus.Ended
                                }
                                onClick={() => {
                                    setCreateTargetDrawerOpen(true)
                                    setOperateItem(record)
                                }}
                            >
                                {__('编辑')}
                            </Button>
                        </Tooltip>
                        <Tooltip
                            title={
                                record.status ===
                                AssessmentTargetStatus.NoExpired
                                    ? __('目标尚未到期，不能开始评价')
                                    : ''
                            }
                        >
                            <Button
                                type="link"
                                onClick={() => {
                                    setEvaluateDrawerOpen(true)
                                    setOperateItem(record)
                                }}
                                disabled={
                                    record.status ===
                                    AssessmentTargetStatus.NoExpired
                                }
                            >
                                {record.status === AssessmentTargetStatus.Ended
                                    ? __('修改评价')
                                    : __('开始评价')}
                            </Button>
                        </Tooltip>
                        <Button
                            type="link"
                            onClick={() => {
                                setDeleteModalOpen(true)
                                setOperateItem(record)
                            }}
                        >
                            {__('删除')}
                        </Button>
                    </Space>
                )
            },
        },
    ]

    // 表格排序改变
    const handleTableChange = (sorter) => {
        if (sorter.column) {
            setTableSort({
                target_name: null,
                start_date: null,
                end_date: null,
                created_at: null,
                updated_at: null,
                [sorter.columnKey]: sorter.order || 'ascend',
            })
            return {
                key: sorter.columnKey,
                sort:
                    sorter.order === 'ascend'
                        ? SortDirection.ASC
                        : SortDirection.DESC,
            }
        }

        setTableSort({
            target_name: null,
            start_date: null,
            end_date: null,
            created_at: null,
            updated_at: null,
            [sorter.columnKey]:
                searchCondition.direction === SortDirection.ASC
                    ? 'descend'
                    : 'ascend',
        })

        return {
            key: searchCondition.sort,
            sort:
                searchCondition.direction === SortDirection.ASC
                    ? SortDirection.DESC
                    : SortDirection.ASC,
        }
    }

    // 表格排序改变
    const onTableChange = (currentPagination, filters, sorter, extra) => {
        if (extra.action === 'sort' && !!sorter.column) {
            const selectedMenu = handleTableChange(sorter)
            setSelectedSort(selectedMenu)
            setSearchCondition((prev) => ({
                ...prev,
                sort: selectedMenu.key,
                direction: selectedMenu.sort,
                offset: 1,
            }))
        }
    }

    // 分页改变
    const onPaginationChange = (page, pageSize) => {
        setSearchCondition((prev) => ({
            ...prev,
            offset: page,
            limit: pageSize,
        }))
    }

    // 筛选
    const handleSearch = (values: any) => {
        const obj = timeStrToTimestamp(values)
        const params = {
            ...searchCondition,
            ...obj,
            offset: 1,
        }

        setSearchCondition(params)
    }

    // 筛选顺序变化
    const handleMenuChange = (selectedMenu) => {
        setSearchCondition({
            ...searchCondition,
            sort: selectedMenu.key,
            direction: selectedMenu.sort,
            offset: 1,
        })
        onChangeMenuToTableSort(selectedMenu)
    }

    const onChangeMenuToTableSort = (selectedMenu) => {
        setTableSort({
            [selectedMenu.key]:
                selectedMenu.sort === SortDirection.ASC ? 'ascend' : 'descend',
        })
    }

    // 筛选展开状态
    const handleExpansionStatus = (status: boolean) => {
        // 使用 requestAnimationFrame 延迟高度更新
        requestAnimationFrame(() => {
            setScrollY(status ? `calc(100vh - 479px)` : `calc(100vh - 227px)`)
        })
    }

    return (
        <div className={classnames(styles['target-container'])}>
            {loading ? (
                renderLoader()
            ) : (
                <>
                    <div className={styles['target-title']}>
                        {__('运营考核目标')}
                    </div>
                    <SearchLayout
                        ref={searchFormRef}
                        formData={recordSearchFilter(userList)}
                        prefixNode={
                            <Button
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={() => setCreateTargetDrawerOpen(true)}
                            >
                                {__('新建考核目标')}
                            </Button>
                        }
                        suffixNode={
                            <SortBtn
                                contentNode={
                                    <DropDownFilter
                                        menus={defaultMenus}
                                        defaultMenu={defaultMenu}
                                        menuChangeCb={handleMenuChange}
                                        changeMenu={selectedSort}
                                        customItems={[
                                            {
                                                key: 'default',
                                                label: (
                                                    <div
                                                        className={
                                                            styles[
                                                                'custom-menu-item-label'
                                                            ]
                                                        }
                                                    >
                                                        {__('默认排序')}
                                                        <Tooltip
                                                            color="#fff"
                                                            placement="left"
                                                            autoAdjustOverflow
                                                            arrowPointAtCenter
                                                            getPopupContainer={(
                                                                triggerNode,
                                                            ) => document.body}
                                                            overlayStyle={{
                                                                maxWidth: 412,
                                                                whiteSpace:
                                                                    'nowrap',
                                                            }}
                                                            mouseEnterDelay={
                                                                0.5
                                                            }
                                                            mouseLeaveDelay={0}
                                                            title={
                                                                <div
                                                                    className={
                                                                        styles[
                                                                            'custom-menu-tooltip-title'
                                                                        ]
                                                                    }
                                                                >
                                                                    <div
                                                                        className={
                                                                            styles[
                                                                                'tooltip-title-text'
                                                                            ]
                                                                        }
                                                                    >
                                                                        {__(
                                                                            '默认排序规则：已到期待评价的>未到期的>已结束的',
                                                                        )}
                                                                    </div>
                                                                    <div
                                                                        className={
                                                                            styles[
                                                                                'tooltip-title-desc'
                                                                            ]
                                                                        }
                                                                    >
                                                                        {__(
                                                                            '同一维度下的，按目标计划开始日期升序排序，最先开始的目标在最下方。',
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            }
                                                        >
                                                            <FontIcon
                                                                name="icon-xinxitishi"
                                                                type={
                                                                    IconType.FONTICON
                                                                }
                                                                className={
                                                                    styles[
                                                                        'info-icon'
                                                                    ]
                                                                }
                                                            />
                                                        </Tooltip>
                                                    </div>
                                                ),
                                            },
                                        ]}
                                    />
                                }
                            />
                        }
                        onSearch={handleSearch}
                        getExpansionStatus={handleExpansionStatus}
                    />
                    {tableData.length === 0 && !isSearchStatus ? (
                        renderEmpty()
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            loading={fetching}
                            rowKey="id"
                            rowClassName={styles.tableRow}
                            onChange={onTableChange}
                            scroll={{
                                x: columns.length * 182,
                                y: scrollY,
                            }}
                            pagination={{
                                total,
                                pageSize: searchCondition?.limit,
                                current: searchCondition?.offset,
                                showQuickJumper: true,
                                onChange: (page, pageSize) =>
                                    onPaginationChange(page, pageSize),
                                showSizeChanger: true,
                                showTotal: (count) =>
                                    __('共${count}条', { count }),
                            }}
                            locale={{ emptyText: <Empty /> }}
                        />
                    )}
                </>
            )}
            {createTargetDrawerOpen && (
                <Create
                    open={createTargetDrawerOpen}
                    onClose={() => {
                        setCreateTargetDrawerOpen(false)
                        setOperateItem(undefined)
                    }}
                    onSuccess={() => handleRefresh()}
                    editItem={operateItem}
                />
            )}
            {evaluateDrawerOpen && (
                <Evaluate
                    open={evaluateDrawerOpen}
                    onClose={() => {
                        setEvaluateDrawerOpen(false)
                        setOperateItem(undefined)
                    }}
                    targetId={operateItem?.id}
                    onSuccess={() => handleRefresh()}
                />
            )}
            {viewDrawerOpen && (
                <View
                    open={viewDrawerOpen}
                    onClose={() => {
                        setViewDrawerOpen(false)
                        setOperateItem(undefined)
                    }}
                    targetId={operateItem?.id}
                    onRefresh={() => handleRefresh()}
                />
            )}
            {deleteModalOpen && operateItem && (
                <Delete
                    open={deleteModalOpen}
                    onCancel={() => {
                        setDeleteModalOpen(false)
                        setOperateItem(undefined)
                    }}
                    id={operateItem.id}
                    onSuccess={() => handleRefresh()}
                />
            )}
        </div>
    )
}

export default Target
