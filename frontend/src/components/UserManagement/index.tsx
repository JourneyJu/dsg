import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Space, Table, Tooltip } from 'antd'
import { useDebounceFn, useUpdateEffect } from 'ahooks'
import { SortOrder, ColumnType } from 'antd/lib/table/interface'
import { isEmpty, omit } from 'lodash'
import Details from './Details'
import { Architecture, DataNode } from '@/components/BusinessArchitecture/const'
import styles from './styles.module.less'
import Empty from '@/ui/Empty'
import DragBox from '../DragBox'
import {
    formatError,
    SortDirection,
    getUsersFrontendList,
    IUserDetails,
} from '@/core'
import __ from './locale'
import ArchitectureDirTree from '@/components/BusinessArchitecture/ArchitectureDirTree'
import {
    ListPagination,
    ListType,
    OptionBarTool,
    OptionMenuType,
    SearchInput,
} from '@/ui'
import { RefreshBtn, SortBtn } from '@/components/ToolbarComponents'
import DropDownFilter from '../DropDownFilter'
import { menus, defaultMenu } from './const'
import { FixedType } from '../CommonTable/const'
import { formatTime, OperateType } from '@/utils'
import { renderEmpty, renderLoader } from './helper'
import RoleTag from './RoleTag'
import ConfigPermission from '../RoleManagement/ConfigPermission'
import ConfigRoleModal from './ConfigRoleModal'
import { FontIcon } from '@/icons'
import RemoveRoleModal from './RemoveRoleModal'

const UserManagement = () => {
    const [defaultSize, setDefaultSize] = useState<Array<number>>([12, 88])
    // 排序
    const [selectedSort, setSelectedSort] = useState<any>(defaultMenu)
    // 创建表头排序
    const [tableSort, setTableSort] = useState<{
        [key: string]: SortOrder
    }>({
        name: null,
        updateAt: 'descend',
    })
    const [selectedNode, setSelectedNode] = useState<DataNode>({
        name: '全部',
        id: '',
        path: '',
        type: Architecture.ALL,
    })
    const [searchCondition, setSearchCondition] = useState<any>()

    const [loading, setLoading] = useState<boolean>(true)
    const [fetching, setFetching] = useState<boolean>(true)
    const [detailsVisible, setDetailsVisible] = useState(false)
    const [delVisible, setDelVisible] = useState(false)
    const [configRoleVisible, setConfigRoleVisible] = useState(false)
    const [configPermissionVisible, setConfigPermissionVisible] =
        useState(false)
    const [operate, setOperate] = useState<OperateType>()
    // 当前操作项
    const [operateItem, setOperateItem] = useState<IUserDetails>()
    // 表格选中项
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
    // 表格数据
    const [tableData, setTableData] = useState<IUserDetails[]>([])
    // 总条数
    const [total, setTotal] = useState<number>(0)
    // 整体是否为空
    const [isDataEmpty, setIsDataEmpty] = useState<boolean>(false)
    const abortControllerRef = useRef<AbortController | null>(null)

    const isSearch = useMemo(() => {
        if (!searchCondition) return false
        const { keyword } = searchCondition
        return keyword !== undefined && keyword !== null && keyword !== ''
    }, [searchCondition])

    useEffect(() => {
        setLoading(true)
        const initSearch = {
            department_id: selectedNode.id,
            keyword: '',
            offset: 1,
            limit: 10,
        }
        setSearchCondition(initSearch)
        setSelectedSort(defaultMenu)

        return () => {
            if (abortControllerRef?.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    // 获取用户列表
    const getUsersData = async (params: any) => {
        if (abortControllerRef?.current) {
            abortControllerRef.current.abort()
        }
        const controller = new AbortController()
        abortControllerRef.current = controller
        try {
            setFetching(true)
            const res = await getUsersFrontendList(params, {
                signal: controller.signal,
            })
            setTableData(res?.entries || [])
            setTotal(res?.total_count || 0)
            setIsDataEmpty(!isSearch && !res?.total_count)
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

    // 表格操作事件
    const { run: handleOptionTable } = useDebounceFn(
        (key: OperateType, record?: any) => {
            setOperate(key)
            setOperateItem(record)
            switch (key) {
                case OperateType.DETAIL:
                    setDetailsVisible(true)
                    break
                case OperateType.CONFIG_ROLE:
                    setConfigRoleVisible(true)
                    break
                case OperateType.CONFIG_PERMISSION:
                    setConfigPermissionVisible(true)
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
                key: OperateType.DETAIL,
                label: __('详情'),
                menuType: OptionMenuType.Menu,
            },
            {
                key: OperateType.CONFIG_ROLE,
                label: __('配置角色'),
                menuType: OptionMenuType.Menu,
            },
            {
                key: OperateType.CONFIG_PERMISSION,
                label: __('配置权限'),
                menuType: OptionMenuType.Menu,
            },
        ]
        return optionMenus
    }

    const columns: ColumnType<any>[] = [
        {
            title: __('用户名称'),
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            sortOrder: tableSort.name,
            ellipsis: true,
            showSorterTooltip: false,
            sortDirections: ['descend', 'ascend', 'descend'],
            render: (value, record) => (
                <span
                    className={styles.name}
                    onClick={() =>
                        handleOptionTable(OperateType.DETAIL, record)
                    }
                >
                    {value}
                </span>
            ),
        },
        {
            title: __('所属部门'),
            dataIndex: 'parent_deps',
            key: 'parent_deps',
            ellipsis: true,
            render: (value, record) => {
                if (value?.length) {
                    const deps = value[0]?.path
                    const depArr = deps?.split('/')
                    return <span title={deps}>{depArr[depArr.length - 1]}</span>
                }
                return '--'
            },
        },
        {
            title: __('登录账号'),
            dataIndex: 'login_name',
            key: 'login_name',
            ellipsis: true,
            render: (value, record) => value || '--',
        },
        {
            title: __('用户角色'),
            dataIndex: 'roles',
            key: 'roles',
            render: (value, record) => {
                const { roles = [], role_groups = [] } = record
                if (roles.length || role_groups.length) {
                    return (
                        <span className={styles.rolesWrapper}>
                            <RoleTag
                                role={roles.length ? roles[0] : undefined}
                                roleGroup={
                                    !roles.length && role_groups.length
                                        ? role_groups[0]
                                        : undefined
                                }
                            />
                            {roles.length + role_groups.length > 1 && (
                                <span
                                    className={styles.tagCount}
                                    title={[...roles, ...role_groups]
                                        .slice(1)
                                        .map((role) => role.name)
                                        .join(';')}
                                >
                                    +{roles.length + role_groups.length - 1}
                                </span>
                            )}
                        </span>
                    )
                }
                return '--'
            },
        },
        {
            title: __('更新时间'),
            dataIndex: 'updated_at',
            key: 'updated_at',
            ellipsis: true,
            sorter: true,
            sortOrder: tableSort.updateAt,
            sortDirections: ['descend', 'ascend', 'descend'],
            showSorterTooltip: false,
            render: (value: string) => (value ? formatTime(value) : '--'),
        },
        {
            title: __('操作'),
            key: 'action',
            width: 200,
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

    // 获取选中的节点 delNode: 删除的节点(用来判断列表中的选中项是否被删除) 用来刷新列表及详情
    const getSelectedNode = (sn?: DataNode, delNode?: DataNode) => {
        // if: 在树结构中操作后获取选中项 else: 在列表中操作后 选中项不变，但要更新列表及详情
        if (sn) {
            setSelectedNode({ ...sn })
            setSearchCondition({
                ...searchCondition,
                keyword: '',
                department_id:
                    sn.id.endsWith('SC') || sn.id.endsWith('MC')
                        ? sn.id.substring(0, sn.id.length - 3)
                        : sn.id,
                offset: 1,
            })
            setSelectedRowKeys([])
        } else {
            // 在列表中删除的情况或重命名时，选中项不变，但是要更新数据
            setSearchCondition({
                ...searchCondition,
            })
            // 操作成功后，按照左侧树选中节点刷新列表+详情
            setSelectedNode({ ...selectedNode })
        }
    }

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

    const getAllUsers = async () => {
        try {
            setFetching(true)
            const res = await getUsersFrontendList(
                omit(searchCondition, 'offset', 'limit'),
            )
            if (res?.entries?.length) {
                setSelectedRowKeys(res?.entries?.map((item) => item.id))
            }
        } catch (error) {
            if (error?.data?.code === 'ERR_CANCELED') {
                return
            }
            formatError(error)
        } finally {
            setFetching(false)
        }
    }

    const rowSelection = {
        selectedRowKeys,
        // onChange: (newSelectedRowKeys: React.Key[]) => {
        //     setSelectedRowKeys(newSelectedRowKeys as string[])
        // },
        onSelect: (record, selected, selectedRows, nativeEvent) => {
            if (selected) {
                setSelectedRowKeys((prev) => [...prev, record.id])
            } else {
                setSelectedRowKeys((prev) =>
                    prev.filter((id) => id !== record.id),
                )
            }
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
            if (selected) {
                setSelectedRowKeys((prev) => [
                    ...prev,
                    ...changeRows.map((item) => item.id),
                ])
            } else {
                setSelectedRowKeys((prev) =>
                    prev.filter(
                        (id) => !changeRows.map((item) => item.id).includes(id),
                    ),
                )
            }
        },
        selections: [
            {
                key: Table.SELECTION_ALL,
                text: __('全选所有'),
                onSelect: () => {
                    getAllUsers()
                },
            },
            {
                key: Table.SELECTION_NONE,
                text: __('清空所有'),
                onSelect: () => {
                    setSelectedRowKeys([])
                },
            },
        ],
    }

    return (
        <div className={styles.userManagementWrapper}>
            <DragBox
                defaultSize={defaultSize}
                minSize={[220, 270]}
                maxSize={[800, Infinity]}
                onDragEnd={(size) => {
                    setDefaultSize(size)
                }}
            >
                <div className={styles.left}>
                    <div className={styles.leftTreeWrapper}>
                        <ArchitectureDirTree
                            getSelectedNode={getSelectedNode}
                            filterType={[
                                Architecture.ORGANIZATION,
                                Architecture.DEPARTMENT,
                            ].join()}
                            needUncategorized
                            unCategorizedKey="00000000-0000-0000-0000-000000000000"
                        />
                    </div>
                </div>
                <div className={styles.right}>
                    <div className={styles.title}>{__('用户管理')}</div>
                    {loading ? (
                        renderLoader()
                    ) : isDataEmpty ||
                      (!isSearch && !fetching && tableData.length === 0) ? (
                        renderEmpty()
                    ) : (
                        <>
                            <div className={styles.operateWrapper}>
                                <Space size={8}>
                                    <Tooltip
                                        title={
                                            selectedRowKeys.length > 0
                                                ? ''
                                                : __('请先选择用户')
                                        }
                                    >
                                        <Button
                                            onClick={() => {
                                                setOperate(OperateType.ADD)
                                                setConfigRoleVisible(true)
                                            }}
                                            className={styles.operateBtn}
                                            icon={
                                                <FontIcon
                                                    name="icon-duojiaose"
                                                    style={{
                                                        fontSize: 14,
                                                        marginRight: 8,
                                                    }}
                                                />
                                            }
                                            type="primary"
                                            disabled={
                                                selectedRowKeys.length === 0
                                            }
                                        >
                                            {__('添加角色')}
                                        </Button>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            selectedRowKeys.length > 0
                                                ? ''
                                                : __('请先选择用户')
                                        }
                                    >
                                        <Button
                                            onClick={() => setDelVisible(true)}
                                            className={styles.operateBtn}
                                            disabled={
                                                selectedRowKeys.length === 0
                                            }
                                        >
                                            {__('移除角色')}
                                        </Button>
                                    </Tooltip>
                                    <Button
                                        onClick={() =>
                                            getUsersData(searchCondition)
                                        }
                                        className={styles.operateBtn}
                                    >
                                        {__('同步用户')}
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            getUsersData(searchCondition)
                                        }
                                        className={styles.operateBtn}
                                    >
                                        {__('同步权限')}
                                    </Button>
                                </Space>
                                <Space size={8}>
                                    <SearchInput
                                        style={{ width: 282 }}
                                        placeholder={__(
                                            '搜索用户名称、登陆账号、用户角色',
                                        )}
                                        value={searchCondition?.keyword}
                                        onKeyChange={(val: string) => {
                                            if (
                                                val === searchCondition?.keyword
                                            )
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
                                                    menuChangeCb={
                                                        handleMenuChange
                                                    }
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
                            <>
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
                                        x: 500,
                                        y: `calc(100vh - ${
                                            total > 10 ? 267 : 235
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
                                    rowClassName={styles.tableRow}
                                    rowSelection={rowSelection}
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
                            </>
                        </>
                    )}
                </div>
            </DragBox>

            {/* 详情 */}
            <Details
                open={detailsVisible}
                userId={operateItem?.id}
                onClose={() => {
                    setDetailsVisible(false)
                    setOperateItem(undefined)
                }}
            />

            {/* 配置权限 */}
            <ConfigPermission
                id={operateItem?.id}
                open={configPermissionVisible}
                fromMenu="user"
                onClose={() => {
                    setConfigPermissionVisible(false)
                    setOperateItem(undefined)
                }}
            />

            {/* 配置角色 */}
            <ConfigRoleModal
                open={configRoleVisible}
                operate={operate}
                userId={operateItem?.id}
                userIds={selectedRowKeys}
                onClose={(refresh) => {
                    if (refresh) {
                        handleRefresh(false)
                    }
                    setConfigRoleVisible(false)
                    setSelectedRowKeys([])
                    setOperateItem(undefined)
                }}
            />

            {/* 移除角色 */}
            <RemoveRoleModal
                open={delVisible}
                userIds={selectedRowKeys}
                onClose={(refresh) => {
                    if (refresh) {
                        handleRefresh(false)
                    }
                    setDelVisible(false)
                    setSelectedRowKeys([])
                }}
            />
        </div>
    )
}

export default UserManagement
