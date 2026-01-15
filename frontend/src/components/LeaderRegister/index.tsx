import { Table, Button } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'ahooks'
import { omit } from 'lodash'
import { PlusOutlined } from '@ant-design/icons'
import __ from './locale'
import { OperateType, allOptionMenus, initSearch, defaultMenu } from './const'
import styles from './styles.module.less'
import Create from './operate/Create'
import { Empty, OptionBarTool, SearchInput } from '@/ui'
import {
    formatError,
    SortDirection,
    getUsersFrontendList,
    IUserDetails,
} from '@/core'
import DropDownFilter from '../DropDownFilter'
import { formatTime } from '@/utils'
import { RefreshBtn, SortBtn } from '../ToolbarComponents'
import { renderEmpty, renderLoader, showDepartment } from './helper'
import LeaderDetail from './operate/Detail'
import ArchitectureDirTree from '@/components/BusinessArchitecture/ArchitectureDirTree'
import { Architecture } from '@/components/BusinessArchitecture/const'
import DragBox from '../DragBox'

const LeaderRegister: React.FC = () => {
    // load
    const [loading, setLoading] = useState<boolean>(true)
    const [fetching, setFetching] = useState<boolean>(true)

    // 拖拽
    const [defaultSize, setDefaultSize] = useState<Array<number>>([12, 88])

    // 表格数据
    const [tableData, setTableData] = useState<IUserDetails[]>([])
    // 总条数
    const [total, setTotal] = useState<number>(0)
    // 当前操作项
    const [operateItem, setOperateItem] = useState<IUserDetails>()

    // 搜索条件
    const [searchCondition, setSearchCondition] = useState<any>(initSearch)
    // 表头排序状态
    const [tableSort, setTableSort] = useState<any>({
        register_at: 'descend',
    })
    // 下拉排序
    const [selectedSort, setSelectedSort] = useState<any>(defaultMenu)

    // 详情
    const [detailOpen, setDetailOpen] = useState<boolean>(false)
    // 创建,编辑
    const [createOpen, setCreateOpen] = useState<boolean>(false)

    // 是否有过滤值
    const isSearchStatus = useMemo(() => {
        const ignoreAttr = [
            'offset',
            'limit',
            'sort',
            'direction',
            'keyword',
            'register_at',
            'department_id',
        ]
        return Object.values(omit(searchCondition, ignoreAttr))?.some(
            (item) => item,
        )
    }, [searchCondition])

    // 根据条件请求数据
    useUpdateEffect(() => {
        if (searchCondition) {
            getTableList({ ...searchCondition })
        }
    }, [searchCondition])

    // 获取表格数据
    const getTableList = async (params: any) => {
        try {
            setFetching(true)
            const res = await getUsersFrontendList(params)

            // 筛选已注册的负责人
            setTableData(
                res?.entries?.filter((item) => item.registered === 2) || [],
            )
            setTotal(res?.total_count || 0)
        } catch (error) {
            formatError(error)
        } finally {
            setSelectedSort(undefined)
            setFetching(false)
            setLoading(false)
        }
    }

    // 刷新
    const handleRefresh = (refresh: boolean = true) => {
        setSearchCondition((prevCondition) => ({
            ...prevCondition,
            offset: refresh ? 1 : prevCondition.offset,
        }))
    }

    // 表格操作事件
    const handleOptionTable = (key: string, record) => {
        setOperateItem(record)
        switch (key) {
            case OperateType.Detail:
                setDetailOpen(true)
                break

            default:
                break
        }
    }

    // 获取表格列的sortOrder配置
    const getSortOrder = (fieldKey: string) => {
        return tableSort[fieldKey] || null
    }

    // 表格排序
    const tableSorter = (sorter) => {
        if (sorter.column && sorter.columnKey === 'register_at') {
            // 更新表头排序状态
            setTableSort({
                register_at: sorter.order || 'ascend',
            })

            return {
                key: sorter.columnKey,
                sort:
                    sorter.order === 'ascend'
                        ? SortDirection.ASC
                        : SortDirection.DESC,
            }
        }

        return null
    }

    // 表格排序改变
    const handleTableChange = (currentPagination, filters, sorter) => {
        const selectedMenu = tableSorter(sorter)
        setSelectedSort(selectedMenu)
        if (!selectedMenu) return

        // 只有分页或排序真的变化时才 set
        setSearchCondition((prev) => ({
            ...prev,
            sort: selectedMenu.key,
            direction: selectedMenu.sort,
            offset: currentPagination.current,
            limit: currentPagination.pageSize,
        }))
    }

    // 表格列
    const columns: any = useMemo(() => {
        const cols = [
            {
                title: __('姓名'),
                dataIndex: 'name',
                key: 'name',
                ellipsis: true,
                render: (value, record) => value || '--',
            },
            {
                title: __('所属部门'),
                dataIndex: 'parent_deps',
                key: 'parent_deps',
                ellipsis: true,
                render: (value, record) =>
                    showDepartment(record?.parent_deps || []) || '--',
            },

            {
                title: __('登录账号'),
                dataIndex: 'login_name',
                key: 'login_name',
                ellipsis: true,
                render: (value, record) => value || '--',
            },
            {
                title: __('手机号码'),
                dataIndex: 'phone_number',
                key: 'phone_number',
                ellipsis: true,
                render: (value, record) => value || '--',
            },
            {
                title: __('邮箱地址'),
                dataIndex: 'mail_address',
                key: 'mail_address',
                ellipsis: true,
                render: (value, record) => value || '--',
            },
            {
                title: __('注册时间'),
                dataIndex: 'register_at',
                key: 'register_at',
                width: 180,
                ellipsis: true,
                sorter: true,
                sortOrder: getSortOrder('register_at'),
                showSorterTooltip: false,
                sortDirections: ['descend', 'ascend', 'descend'],
                render: (val: number, record) =>
                    val ? formatTime(record?.register_at) : '--',
            },

            {
                title: __('操作'),
                key: 'action',
                width: 80,
                fixed: 'right',
                render: (_, record) => {
                    return (
                        <OptionBarTool
                            menus={allOptionMenus}
                            onClick={(key, e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleOptionTable(key, record)
                            }}
                        />
                    )
                },
            },
        ]

        return cols
    }, [searchCondition?.sort, searchCondition?.direction])

    // 同步DropDownFilter排序状态到表头排序
    const onChangeMenuToTableSort = (selectedMenu) => {
        if (selectedMenu.key === 'register_at') {
            setTableSort({
                register_at:
                    selectedMenu.sort === SortDirection.ASC
                        ? 'ascend'
                        : 'descend',
            })
        }
    }

    // 筛选顺序变化
    const handleMenuChange = (selectedMenu: any) => {
        setSearchCondition((prev) => ({
            ...prev,
            sort: selectedMenu.key,
            direction: selectedMenu.sort,
            offset: 1,
        }))
        setSelectedSort(selectedMenu)
        onChangeMenuToTableSort(selectedMenu)
    }

    // 获取顶部操作区域
    const getTopOperate = () => {
        return (
            <>
                <div className={styles.title}>{__('负责人注册')}</div>
                <div className={styles.topOperate}>
                    <Button
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => setCreateOpen(true)}
                    >
                        {__('注册')}
                    </Button>
                    <div className={styles.rightOperate}>
                        <SearchInput
                            value={searchCondition?.keyword}
                            style={{ width: 280 }}
                            placeholder={__('搜索姓名')}
                            onKeyChange={(kw: string) => {
                                if (kw === searchCondition?.keyword) return
                                setSearchCondition((prev) => ({
                                    ...prev,
                                    keyword: kw,
                                    offset: 1,
                                }))
                            }}
                        />
                        <SortBtn
                            contentNode={
                                <DropDownFilter
                                    menus={[
                                        {
                                            key: 'register_at',
                                            label: __('按注册时间排序'),
                                        },
                                    ]}
                                    defaultMenu={defaultMenu}
                                    changeMenu={selectedSort}
                                    menuChangeCb={handleMenuChange}
                                />
                            }
                        />
                        <RefreshBtn onClick={() => handleRefresh()} />
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <DragBox
                defaultSize={defaultSize}
                minSize={[220, 270]}
                maxSize={[800, Infinity]}
                onDragEnd={(size) => {
                    setDefaultSize(size)
                }}
            >
                <div className={styles.leftContainer}>
                    <ArchitectureDirTree
                        getSelectedNode={(nodeInfo) => {
                            if (nodeInfo && 'id' in nodeInfo) {
                                setSearchCondition((prev) => ({
                                    ...prev,
                                    department_id: nodeInfo?.id || '',
                                    offset: 1,
                                }))
                            }
                        }}
                        filterType={[
                            Architecture.ORGANIZATION,
                            Architecture.DEPARTMENT,
                        ].join()}
                        // needUncategorized
                        // unCategorizedKey="Uncategorized"
                    />
                </div>
                <div className={styles.rightContainer}>
                    {getTopOperate()}
                    {tableData.length === 0 && !isSearchStatus ? (
                        renderEmpty()
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            loading={fetching}
                            rowKey="id"
                            scroll={{
                                y: 'calc(100vh - 270px)',
                            }}
                            onChange={handleTableChange}
                            pagination={{
                                total,
                                pageSize: searchCondition?.limit,
                                current: searchCondition?.offset,
                                showQuickJumper: true,
                                showSizeChanger: true,
                                showTotal: (count) =>
                                    __('共${count}条', { count }),
                            }}
                            locale={{ emptyText: <Empty /> }}
                        />
                    )}
                </div>
            </DragBox>
            {createOpen && (
                <Create
                    open={createOpen}
                    onCancel={() => {
                        setCreateOpen(false)
                        setOperateItem(undefined)
                    }}
                    onSuccess={() => {
                        setCreateOpen(false)
                        setOperateItem(undefined)
                        handleRefresh()
                    }}
                />
            )}
            {detailOpen && (
                <LeaderDetail
                    open={detailOpen}
                    item={operateItem}
                    onDetailsClose={() => setDetailOpen(false)}
                />
            )}
        </>
    )
}

export default LeaderRegister
