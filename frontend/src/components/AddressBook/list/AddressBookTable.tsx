import { Space, Table, Button, Tooltip } from 'antd'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useUpdateEffect } from 'ahooks'
import { PlusOutlined } from '@ant-design/icons'
import { trim, omit } from 'lodash'
import { SortOrder } from 'antd/lib/table/interface'
import { Empty, OptionBarTool, OptionMenuType, SearchInput } from '@/ui'
import {
    SortDirection,
    formatError,
    getAddressBookList,
    IGetListParams,
    deleteAddressBook,
    SortType,
    IAddressBookListParams,
} from '@/core'
import { RefreshBtn } from '../../ToolbarComponents'
import {
    AddressBookTabMap,
    AddressBookOperate,
    renderEmpty,
    renderLoader,
    getConfirmModal,
} from '../helper'
import Create from '../operate/Create'
import Import from '../operate/Import'
import __ from '../locale'
import styles from '../styles.module.less'

const AddressBookTable: React.FC<{
    menu: string
    selectedNode: any
}> = ({ menu, selectedNode }) => {
    // 初始化 load
    const [loading, setLoading] = useState<boolean>(true)
    // 加载数据 load
    const [fetching, setFetching] = useState<boolean>(true)
    // 表格数据
    const [tableData, setTableData] = useState<any[]>([])
    // 总条数
    const [total, setTotal] = useState<number>(0)
    // 当前操作项
    const [operateItem, setOperateItem] = useState<any>()
    // 表头排序
    const [tableSort, setTableSort] = useState<{
        [key: string]: SortOrder
    }>(AddressBookTabMap[menu].defaultTableSort)
    // 新建/编辑弹窗
    const [editVisible, setEditVisible] = useState(false)
    // 导入弹窗
    const [importVisible, setImportVisible] = useState(false)
    // 搜索条件
    const [searchCondition, setSearchCondition] =
        useState<IAddressBookListParams>()
    // 获取 搜索条件
    const searchConditionRef = useRef(searchCondition)

    useEffect(() => {
        // 初始化搜索条件
        const { initSearch } = AddressBookTabMap[menu]
        setSearchCondition(initSearch)
    }, [menu])

    useEffect(() => {
        searchConditionRef.current = searchCondition
    }, [searchCondition])

    // 是否有过滤值
    const isSearchStatus = useMemo(() => {
        const ignoreAttr = ['offset', 'limit', 'sort', 'direction']
        return Object.values(omit(searchCondition, ignoreAttr)).some(
            (item) => item,
        )
    }, [searchCondition])

    useUpdateEffect(() => {
        setOperateItem(undefined)
        if (searchCondition) {
            getTableList({ ...searchCondition })
        }
    }, [searchCondition])

    useUpdateEffect(() => {
        if (!selectedNode) return
        setSearchCondition({
            ...searchCondition,
            department_id: selectedNode.id,
        })
    }, [selectedNode])

    // 获取表格数据
    const getTableList = async (params: any) => {
        try {
            setFetching(true)
            const res = await getAddressBookList(params)
            setTableData(res?.entries || [])
            setTotal(res?.total_count || 0)
        } catch (error) {
            formatError(error)
        } finally {
            setFetching(false)
            setLoading(false)
        }
    }

    // 表格操作事件
    const handleOptionTable = (key: string, record) => {
        setOperateItem(record)
        switch (key) {
            case AddressBookOperate.Edit:
                setEditVisible(true)
                break
            case AddressBookOperate.Delete:
                handleDeleteAddressBook(record?.id)
                break
            default:
                break
        }
    }

    // 表格操作项
    const getTableOptions = () => {
        const allOptionMenus = [
            {
                key: AddressBookOperate.Edit,
                label: __('编辑'),
                menuType: OptionMenuType.Menu,
            },
            {
                key: AddressBookOperate.Delete,
                label: __('删除'),
                menuType: OptionMenuType.Menu,
            },
        ]

        // 根据 optionKeys 过滤出对应的 optionMenus
        const optionMenus = allOptionMenus.filter((i) =>
            AddressBookTabMap[menu].actionMap.includes(i.key),
        )

        return optionMenus
    }

    const columns: any = useMemo(() => {
        const commonProps = {
            ellipsis: true,
            render: (value) => value || '--',
        }

        const sortableColumn = (dataIndex: string) => ({
            sorter: true,
            sortOrder: tableSort?.[dataIndex],
            showSorterTooltip: false,
            sortDirections: ['descend', 'ascend', 'descend'],
            width: 200,
        })

        const cols = [
            {
                title: __('人员名称'),
                dataIndex: 'name',
                key: 'name',
                ...sortableColumn('name'),
                width: 300,
                ...commonProps,
            },
            {
                title: __('所属部门'),
                dataIndex: 'department',
                key: 'department',
                ...commonProps,
            },

            {
                title: __('手机号码'),
                dataIndex: 'contact_phone',
                key: 'contact_phone',
                ...commonProps,
            },
            {
                title: __('邮箱地址'),
                dataIndex: 'contact_mail',
                key: 'contact_mail',
                ...commonProps,
            },
            {
                title: __('操作'),
                key: 'action',
                width: AddressBookTabMap[menu].actionWidth,
                fixed: 'right',
                render: (_, record) => {
                    return (
                        <OptionBarTool
                            menus={getTableOptions() as any[]}
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
        return cols.filter((col) =>
            AddressBookTabMap[menu].columnKeys.includes(col.key),
        )
    }, [menu, tableSort])

    // 关键字搜索
    const handleKwSearch = (kw) => {
        if (kw === searchCondition?.keyword) return
        setSearchCondition({
            ...searchCondition,
            keyword: kw,
            offset: 1,
        } as IGetListParams)
    }

    // 刷新
    const handleRefresh = (refresh: boolean = true) => {
        setSearchCondition({
            ...searchCondition,
            offset: refresh ? 1 : searchCondition?.offset,
        } as IGetListParams)
    }

    // 表格排序改变
    const handleTableChange = (sorter) => {
        const newSort = {
            name: null,
        }

        if (sorter.column) {
            const key = sorter.columnKey
            newSort[key] = sorter.order || 'ascend'
        }

        setTableSort(newSort)

        return {
            key: sorter?.columnKey,
            sort:
                sorter?.order === 'ascend'
                    ? SortDirection.ASC
                    : SortDirection.DESC,
        }
    }

    // 表格排序改变
    const onTableChange = (currentPagination, filters, sorter, extra) => {
        const selectedMenu = handleTableChange(sorter)
        if (extra.action === 'sort' && !!sorter.column) {
            setSearchCondition({
                ...searchCondition,
                sort: selectedMenu.key,
                direction: selectedMenu.sort,
                offset: 1,
            } as IGetListParams)
        }
    }

    // 分页改变
    const onPaginationChange = (page, pageSize) => {
        setSearchCondition({
            ...searchCondition,
            offset: page || 1,
            limit: pageSize,
        } as IGetListParams)
    }

    // 确认删除
    const handleAddressBookDelete = async (delId: string) => {
        try {
            await deleteAddressBook(delId)
            getTableList({ ...searchConditionRef.current })
        } catch (error) {
            formatError(error)
        }
    }

    // 删除
    const handleDeleteAddressBook = (delId: string) => {
        getConfirmModal({
            title: '确定要删除已选人员信息吗？',
            content: '删除后已选人员信息将无法找回，请确认操作！',
            onOk: () => handleAddressBookDelete(delId),
        })
    }

    // 顶部左侧操作
    const leftOperate = (
        <div className={styles.topLeft}>
            <Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setOperateItem(undefined)
                        setEditVisible(true)
                    }}
                >
                    {__('新建')}
                </Button>
                <Button onClick={() => setImportVisible(true)}>
                    {__('导入')}
                </Button>
            </Space>
        </div>
    )

    // 顶部右侧操作
    const rightOperate = (tableData.length > 0 || isSearchStatus) && (
        <div className={styles.topRight}>
            <Space size={8}>
                <Tooltip
                    placement="bottom"
                    title={__('搜索人员名称、所属部门、手机号')}
                >
                    <SearchInput
                        value={searchCondition?.keyword}
                        style={{ width: 280 }}
                        placeholder={__('搜索人员名称、所属部门、手机号')}
                        onKeyChange={(kw: string) => {
                            handleKwSearch(kw)
                        }}
                        onPressEnter={(
                            e: React.KeyboardEvent<HTMLInputElement>,
                        ) => {
                            handleKwSearch(trim(e.currentTarget.value))
                        }}
                    />
                </Tooltip>
                <RefreshBtn onClick={handleRefresh} />
            </Space>
        </div>
    )

    return (
        <div className={styles.addressBookContent}>
            {loading ? (
                renderLoader()
            ) : (
                <>
                    <div className={styles.addressBookOperation}>
                        {leftOperate}
                        {rightOperate}
                    </div>

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
                                x: columns.length * 180,
                                y: 'calc(100vh - 270px)',
                            }}
                            pagination={{
                                total,
                                pageSize: Number(searchCondition?.limit),
                                current: Number(searchCondition?.offset),
                                hideOnSinglePage: total < 10,
                                showQuickJumper: true,
                                onChange: onPaginationChange,
                                showSizeChanger: true,
                                showTotal: (count) =>
                                    __('共${count}条', { count }),
                            }}
                            locale={{ emptyText: <Empty /> }}
                        />
                    )}
                </>
            )}

            {editVisible && (
                <Create
                    open={editVisible}
                    item={operateItem}
                    selectedNode={selectedNode}
                    onCreateClose={() => setEditVisible(false)}
                    onCreateSuccess={() => {
                        setEditVisible(false)
                        getTableList({ ...searchCondition })
                    }}
                />
            )}

            {importVisible && (
                <Import
                    open={importVisible}
                    onImportClose={() => setImportVisible(false)}
                    onImportSuccess={() => {
                        setImportVisible(false)
                        getTableList({ ...searchCondition })
                    }}
                />
            )}
        </div>
    )
}

export default AddressBookTable
