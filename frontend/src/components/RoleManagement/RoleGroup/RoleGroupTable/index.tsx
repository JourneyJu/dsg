import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'
import { Button, Space, Table } from 'antd'
import { useDebounceFn, useUpdateEffect } from 'ahooks'
import { ColumnType } from 'antd/lib/table/interface'
import { isEmpty } from 'lodash'
import classnames from 'classnames'
import styles from './styles.module.less'
import Empty from '@/ui/Empty'
import {
    deleteRoleGroup,
    formatError,
    getRoleGroupsFrontendList,
    IRoleGroupDetails,
    SortDirection,
} from '@/core'
import __ from './locale'
import {
    ListPagination,
    ListType,
    OptionBarTool,
    OptionMenuType,
    SearchInput,
} from '@/ui'
import { RefreshBtn, SortBtn } from '@/components/ToolbarComponents'
import { menus, defaultMenu } from './const'
import { formatTime, OperateType } from '@/utils'
import { getConfirmModal, renderEmpty, renderLoader } from '../../helper'
import DropDownFilter from '@/components/DropDownFilter'
import { FixedType } from '@/components/CommonTable/const'
import { AddOutlined } from '@/icons'
import CreateRoleGroupModal from '../CreateRoleGroupModal'

const initSearch = {
    keyword: '',
    offset: 1,
    limit: 10,
}

interface IProps {
    onInitEmpty?: (empty: boolean) => void
    onSelect?: (value: any) => void
    selectedRoleGroup?: any
}

const RoleGroupTable = forwardRef(
    ({ onInitEmpty, onSelect, selectedRoleGroup }: IProps, ref) => {
        // 排序
        const [selectedSort, setSelectedSort] = useState<any>(defaultMenu)
        // 创建表头排序
        const [tableSort, setTableSort] = useState<any>({
            name: null,
            updateAt: 'descend',
        })
        const [searchCondition, setSearchCondition] = useState<any>()

        const [loading, setLoading] = useState<boolean>(true)
        const [fetching, setFetching] = useState<boolean>(true)
        const [createVisible, setCreateVisible] = useState(false)
        // 当前操作
        const [operate, setOperate] = useState<OperateType>()
        // 当前操作项
        const [operateItem, setOperateItem] = useState<any>()
        // 表格数据
        const [tableData, setTableData] = useState<IRoleGroupDetails[]>([])
        // 总条数
        const [total, setTotal] = useState<number>(0)
        // 初次加载数据
        const [firstLoad, setFirstLoad] = useState<boolean>(true)
        const abortControllerRef = useRef<AbortController | null>(null)

        const isSearch = useMemo(() => {
            if (!searchCondition) return false
            const { keyword } = searchCondition
            return keyword !== undefined && keyword !== null && keyword !== ''
        }, [searchCondition])

        useEffect(() => {
            setSearchCondition(initSearch)
            return () => {
                if (abortControllerRef?.current) {
                    abortControllerRef.current.abort()
                }
            }
        }, [])

        useImperativeHandle(ref, () => ({
            refresh: () => {
                setLoading(true)
                setFirstLoad(true)
                setSearchCondition({ ...initSearch })
                setSelectedSort(defaultMenu)
            },
        }))

        // 获取角色列表
        const getUsersData = async (params: any) => {
            if (abortControllerRef?.current) {
                abortControllerRef.current.abort()
            }
            const controller = new AbortController()
            abortControllerRef.current = controller
            try {
                setFetching(true)
                const res = await getRoleGroupsFrontendList(params)
                setTableData(res?.entries || [])
                setTotal(res?.total_count || 0)
                onInitEmpty?.(!isSearch && !res?.total_count)
                if (firstLoad && res?.entries?.length) {
                    setFirstLoad(false)
                    onSelect?.(res.entries[0])
                }
                if (!isSearch && !res?.total_count) {
                    onSelect?.(null)
                }
                setFetching(false)
                setLoading(false)
            } catch (error) {
                if (error?.data?.code === 'ERR_CANCELED') {
                    return
                }
                formatError(error)
                setFetching(false)
                setLoading(false)
            } finally {
                setSelectedSort(undefined)
                if (abortControllerRef.current === controller) {
                    abortControllerRef.current = null
                }
            }
        }

        // 根据条件请求数据
        useUpdateEffect(() => {
            if (!isEmpty(searchCondition)) {
                getUsersData({ ...searchCondition })
            }
        }, [searchCondition])

        // 删除角色
        const handleDeleteRole = async (_id: string) => {
            try {
                await deleteRoleGroup(_id)
                setSearchCondition((prev) => ({
                    ...prev,
                    offset:
                        tableData.length === 1
                            ? prev.offset - 1 || 1
                            : prev.offset,
                }))
                if (selectedRoleGroup?.id === _id) {
                    onSelect?.(null)
                }
            } catch (error) {
                formatError(error)
            }
        }

        // 表格操作事件
        const { run: handleOptionTable } = useDebounceFn(
            (key: OperateType, record?: any) => {
                setOperate(key)
                setOperateItem(record)
                switch (key) {
                    case OperateType.CREATE:
                    case OperateType.EDIT:
                        setCreateVisible(true)
                        break
                    case OperateType.DELETE:
                        getConfirmModal({
                            title: __('确定要删除角色组吗？'),
                            content: __(
                                '删除角色组后，其所包含的角色均会被移除，请确认操作！',
                            ),
                            onOk: () => handleDeleteRole(record.id),
                        })
                        break
                    default:
                        break
                }
            },
            {
                wait: 400,
                leading: true,
                trailing: false,
            },
        )

        // 表格操作项
        const getTableOptions = (record) => {
            const optionMenus = [
                {
                    key: OperateType.EDIT,
                    label: __('编辑'),
                    menuType: OptionMenuType.Menu,
                },
                {
                    key: OperateType.DELETE,
                    label: __('删除'),
                    menuType: OptionMenuType.Menu,
                },
            ]
            return optionMenus
        }

        const columns: ColumnType<any>[] = [
            {
                title: (
                    <span>
                        <span style={{ color: 'rgba(0,0,0,0.85)' }}>
                            {__('角色组名称')}
                        </span>
                        <span style={{ color: 'rgba(0,0,0,0.65)' }}>
                            {__('（描述）')}
                        </span>
                    </span>
                ),
                dataIndex: 'name',
                key: 'name',
                sorter: true,
                sortOrder: tableSort.name,
                ellipsis: true,
                showSorterTooltip: false,
                sortDirections: ['descend', 'ascend', 'descend'],
                render: (value, record) => (
                    <div className={styles.twoLine}>
                        <span className={styles.firstLine} title={value}>
                            {value}
                        </span>
                        <span
                            className={styles.secondLine}
                            title={record.description}
                        >
                            {record.description || __('[暂无描述]')}
                        </span>
                    </div>
                ),
            },
            {
                title: __('更新时间'),
                dataIndex: 'updated_at',
                key: 'updated_at',
                ellipsis: true,
                sorter: true,
                sortOrder: tableSort.updateAt,
                showSorterTooltip: false,
                sortDirections: ['descend', 'ascend', 'descend'],
                render: (value: string) => (value ? formatTime(value) : '--'),
            },
            {
                title: __('操作'),
                key: 'action',
                width: 100,
                fixed: FixedType.RIGHT,
                render: (_: string, record) => (
                    <OptionBarTool
                        menus={getTableOptions(record) as any[]}
                        onClick={(key, e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleOptionTable(key as OperateType, record)
                        }}
                    />
                ),
            },
        ]

        // 表格排序改变
        const handleTableChange = (sorter) => {
            if (sorter.column) {
                if (sorter.columnKey === 'updated_at') {
                    setTableSort({
                        updateAt: sorter.order || 'ascend',
                        name: null,
                    })
                } else {
                    setTableSort({
                        updateAt: null,
                        name: sorter.order || 'ascend',
                    })
                }
                return {
                    key: sorter.columnKey,
                    sort:
                        sorter.order === 'ascend'
                            ? SortDirection.ASC
                            : SortDirection.DESC,
                }
            }
            if (searchCondition.sort === 'updated_at') {
                if (searchCondition.direction === SortDirection.ASC) {
                    setTableSort({
                        updateAt: 'descend',
                        name: null,
                    })
                } else {
                    setTableSort({
                        updateAt: 'ascend',
                        name: null,
                    })
                }
            } else if (searchCondition.sort === 'name') {
                if (searchCondition.direction === SortDirection.ASC) {
                    setTableSort({
                        updateAt: null,
                        name: 'descend',
                    })
                } else {
                    setTableSort({
                        updateAt: null,
                        name: 'ascend',
                    })
                }
            }
            return {
                key: searchCondition.sort,
                sort:
                    searchCondition.direction === SortDirection.ASC
                        ? SortDirection.DESC
                        : SortDirection.ASC,
            }
        }

        const onChangeMenuToTableSort = (selectedMenu) => {
            switch (selectedMenu.key) {
                case 'name':
                    setTableSort({
                        name:
                            selectedMenu.sort === SortDirection.ASC
                                ? 'ascend'
                                : 'descend',
                        updateAt: null,
                    })
                    break
                case 'updated_at':
                    setTableSort({
                        name: null,
                        updateAt:
                            selectedMenu.sort === SortDirection.ASC
                                ? 'ascend'
                                : 'descend',
                    })
                    break
                default:
                    setTableSort({
                        name: null,
                        updateAt: null,
                    })
                    break
            }
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

        // 刷新
        const handleRefresh = (refresh: boolean = true) => {
            setSearchCondition((prev) => ({
                ...prev,
                offset: refresh ? 1 : prev.offset,
            }))
        }

        return (
            <div className={styles.roleGroupTable}>
                {loading ? (
                    renderLoader()
                ) : (
                    <>
                        <div className={styles.operateWrapper}>
                            <Button
                                onClick={() =>
                                    handleOptionTable(OperateType.CREATE)
                                }
                                className={styles.operateBtn}
                                icon={<AddOutlined />}
                                type="primary"
                            >
                                {__('新建角色组')}
                            </Button>

                            <Space size={8}>
                                <SearchInput
                                    style={{ width: 200 }}
                                    placeholder={__('搜索角色组名称')}
                                    value={searchCondition?.keyword}
                                    onKeyChange={(val: string) => {
                                        if (val === searchCondition?.keyword)
                                            return
                                        setSearchCondition({
                                            ...searchCondition,
                                            keyword: val,
                                            offset: 1,
                                        })
                                    }}
                                />
                                <span>
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
                                    <RefreshBtn
                                        onClick={() => handleRefresh()}
                                    />
                                </span>
                            </Space>
                        </div>

                        <div className={styles.tableWrapper}>
                            <Table
                                rowKey="id"
                                columns={columns}
                                dataSource={tableData}
                                loading={fetching}
                                onChange={(
                                    currentPagination,
                                    filters,
                                    sorter,
                                ) => {
                                    const selectedMenu =
                                        handleTableChange(sorter)
                                    setSelectedSort(selectedMenu)
                                    setSearchCondition((prev) => ({
                                        ...prev,
                                        sort: selectedMenu.key,
                                        direction: selectedMenu.sort,
                                        offset: 1,
                                    }))
                                }}
                                scroll={{
                                    x: 400,
                                    y: `calc(100vh - ${
                                        total > 10 ? 275 : 243
                                    }px)`,
                                }}
                                bordered={false}
                                locale={{
                                    emptyText: isSearch ? (
                                        <Empty />
                                    ) : (
                                        renderEmpty()
                                    ),
                                }}
                                pagination={false}
                                rowClassName={(record) =>
                                    classnames(styles.tableRow, {
                                        [styles.tableRowSelected]:
                                            selectedRoleGroup?.id === record.id,
                                    })
                                }
                                onRow={(record) => ({
                                    onClick: () => onSelect?.(record),
                                })}
                            />
                            <ListPagination
                                listType={ListType.WideList}
                                queryParams={searchCondition}
                                totalCount={total}
                                onChange={(page, pageSize) => {
                                    setSearchCondition((prev) => ({
                                        ...prev,
                                        offset: page || 1,
                                        limit: pageSize,
                                    }))
                                }}
                                className={styles.pagination}
                            />
                        </div>
                    </>
                )}

                {/* 新建 */}
                <CreateRoleGroupModal
                    open={createVisible}
                    operate={operate}
                    roleGroupData={operateItem}
                    onClose={(refresh, id) => {
                        if (refresh) {
                            handleRefresh(false)
                            if (id) {
                                onSelect?.({ id })
                            }
                        }
                        setCreateVisible(false)
                    }}
                />
            </div>
        )
    },
)

export default RoleGroupTable
