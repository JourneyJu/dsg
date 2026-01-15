import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, message, Space, Table, Tooltip } from 'antd'
import { useDebounceFn, useUpdateEffect } from 'ahooks'
import { ColumnType } from 'antd/lib/table/interface'
import { isEmpty, omit } from 'lodash'
import classnames from 'classnames'
import dataEmpty from '@/assets/dataEmpty.svg'
import styles from './styles.module.less'
import Empty from '@/ui/Empty'
import {
    formatError,
    SortDirection,
    RoleType,
    getRolesFrontendList,
    deleteRoles,
    putRoleGroupRoleBindings,
    IRoleDetails,
} from '@/core'
import __ from './locale'
import {
    LightweightSearch,
    ListPagination,
    ListType,
    OptionBarTool,
    OptionMenuType,
    SearchInput,
} from '@/ui'
import { RefreshBtn, SortBtn } from '@/components/ToolbarComponents'
import { menus, defaultMenu } from './const'
import { formatTime, OperateType } from '@/utils'
import { getConfirmModal, renderEmpty, renderLoader } from '../helper'
import DropDownFilter from '@/components/DropDownFilter'
import { FixedType } from '@/components/CommonTable/const'
import { AddOutlined } from '@/icons'
import { roleTypeOptions, roleTypeText } from '../const'
import { SearchType } from '@/ui/LightweightSearch/const'
import CreateRoleModal from './CreateRoleModal'
import Details from './Details'
import ConfigPermission from '../ConfigPermission'
import GroupAddRoleModal from '../GroupAddRoleModal'
import RoleAvatar from '@/components/UserManagement/RoleAvatar'

interface IRoleProps {
    // 是否在角色组中
    inRoleGroup?: boolean
    // 选中的角色组
    selectedRoleGroup?: { id: string; [key: string]: any }
}
const Role = ({ inRoleGroup = false, selectedRoleGroup }: IRoleProps) => {
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
    const [detailsVisible, setDetailsVisible] = useState(false)
    const [createVisible, setCreateVisible] = useState(false)
    const [configPermissionVisible, setConfigPermissionVisible] =
        useState(false)
    const [addRoleVisible, setAddRoleVisible] = useState(false)
    // 当前操作
    const [operate, setOperate] = useState<OperateType>()
    // 当前操作项
    const [operateItem, setOperateItem] = useState<any>()
    // 表格数据
    const [tableData, setTableData] = useState<IRoleDetails[]>([])
    // 总条数
    const [total, setTotal] = useState<number>(0)
    // 整体是否为空
    const [isDataEmpty, setIsDataEmpty] = useState<boolean>(false)
    // 表格选中项
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
    const abortControllerRef = useRef<AbortController | null>(null)

    const isSearch = useMemo(() => {
        const ignoreAttr = [
            'offset',
            'limit',
            'sort',
            'direction',
            'role_group_id',
        ]
        return Object.values(omit(searchCondition, ignoreAttr)).some(
            (item) => item,
        )
    }, [searchCondition])

    const tableHeight = useMemo(() => {
        if (inRoleGroup) {
            return total > 10 ? 292 : 243
        }
        return total > 10 ? 275 : 243
    }, [inRoleGroup, total])

    useEffect(() => {
        setLoading(true)
        const initSearch: any = {
            keyword: '',
            offset: 1,
            limit: 10,
        }
        if (inRoleGroup) {
            if (selectedRoleGroup) {
                initSearch.role_group_id = selectedRoleGroup.id
                setSearchCondition(initSearch)
            }
        } else {
            setSearchCondition(initSearch)
        }
        setSelectedRowKeys([])
        return () => {
            if (abortControllerRef?.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [selectedRoleGroup, inRoleGroup])

    // 获取角色列表
    const getUsersData = async (params: any) => {
        if (abortControllerRef?.current) {
            abortControllerRef.current.abort()
        }
        const controller = new AbortController()
        abortControllerRef.current = controller
        try {
            setFetching(true)
            const res = await getRolesFrontendList(params, {
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

    // 删除角色
    const handleDeleteRole = async (_id: string) => {
        try {
            await deleteRoles(_id)
            message.success(__('删除成功'))
            setSearchCondition((prev) => ({
                ...prev,
                offset:
                    tableData.length === 1 ? prev.offset - 1 || 1 : prev.offset,
            }))
        } catch (error) {
            formatError(error)
        }
    }

    // 移除角色
    const handleRemoveRole = async (_ids: string[]) => {
        if (!selectedRoleGroup) {
            return
        }
        try {
            await putRoleGroupRoleBindings({
                role_group_ids: [selectedRoleGroup.id],
                role_ids: _ids,
                state: 'Absent',
            })
            message.success(__('移除成功'))
            setSearchCondition((prev) => ({
                ...prev,
                offset:
                    tableData.length === 1 ? prev.offset - 1 || 1 : prev.offset,
            }))
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
                case OperateType.DETAIL:
                    setDetailsVisible(true)
                    break
                case OperateType.CONFIG_PERMISSION:
                    setConfigPermissionVisible(true)
                    break
                case OperateType.DELETE:
                    getConfirmModal({
                        title: __('确定要删除自定义角色吗？'),
                        content: __(
                            '删除后配置该角色的用户将不再拥有此角色、且会失去此角色相应的权限，请确认操作！',
                        ),
                        onOk: () => handleDeleteRole(record.id),
                    })
                    break
                case OperateType.REMOVE:
                    getConfirmModal({
                        title: __('确定要移除角色吗？'),
                        content: __(
                            '移除后不会影响被移除角色的权限，可重新添加',
                        ),
                        onOk: () => handleRemoveRole([record.id]),
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
        if (inRoleGroup) {
            return [
                {
                    key: OperateType.DETAIL,
                    label: __('详情'),
                    menuType: OptionMenuType.Menu,
                },
                {
                    key: OperateType.REMOVE,
                    label: __('移除'),
                    menuType: OptionMenuType.Menu,
                },
            ]
        }

        const optionMenus = [
            {
                key: OperateType.DETAIL,
                label: __('详情'),
                menuType: OptionMenuType.Menu,
            },
            {
                key: OperateType.EDIT,
                label: __('编辑'),
                menuType: OptionMenuType.Menu,
            },
            {
                key: OperateType.CONFIG_PERMISSION,
                label: __('配置权限'),
                menuType: OptionMenuType.Menu,
            },
            {
                key: OperateType.DELETE,
                label: __('删除'),
                menuType: OptionMenuType.Menu,
            },
        ]
        // 内置角色只保留详情
        if (record.type === RoleType.Internal) {
            return optionMenus.slice(0, 1)
        }

        return optionMenus
    }

    const columns: ColumnType<any>[] = [
        {
            title: __('角色名称'),
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            sortOrder: tableSort.name,
            ellipsis: true,
            showSorterTooltip: false,
            sortDirections: ['descend', 'ascend', 'descend'],
            render: (value, record) => (
                <div className={styles.nameWrapper}>
                    <RoleAvatar role={record} />
                    <span
                        className={styles.name}
                        onClick={() =>
                            handleOptionTable(OperateType.DETAIL, record)
                        }
                        title={value}
                    >
                        {value}
                    </span>
                </div>
            ),
        },
        {
            title: __('角色类型'),
            dataIndex: 'type',
            key: 'type',
            ellipsis: true,
            render: (_, record: any) => roleTypeText[record.type],
        },
        {
            title: __('更新人'),
            dataIndex: 'updated_by',
            key: 'updated_by',
            ellipsis: true,
            render: (value, record) => value?.name || '--',
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
            width: inRoleGroup ? 100 : 240,
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
        <div
            className={classnames(styles.role, {
                [styles.roleInGroup]: inRoleGroup,
            })}
        >
            {loading ? (
                renderLoader()
            ) : isDataEmpty ? (
                inRoleGroup ? (
                    <Empty
                        iconSrc={dataEmpty}
                        desc={__('可点击【添加角色】按钮为角色组中添加角色')}
                        style={{ marginTop: 36, width: '100%' }}
                        iconHeight={144}
                        onAdd={() => setAddRoleVisible(true)}
                        btnText={__('添加角色')}
                        primary={false}
                    />
                ) : (
                    renderEmpty()
                )
            ) : (
                <>
                    <div className={styles.operateWrapper}>
                        {inRoleGroup ? (
                            <Space size={8} style={{ marginRight: 8 }}>
                                <Button
                                    onClick={() => setAddRoleVisible(true)}
                                    className={styles.operateBtn}
                                    icon={<AddOutlined />}
                                >
                                    {__('添加角色')}
                                </Button>
                                <Tooltip
                                    title={
                                        selectedRowKeys.length > 0
                                            ? ''
                                            : __('请先选择要移除的角色')
                                    }
                                >
                                    <Button
                                        onClick={() =>
                                            getConfirmModal({
                                                title: __(
                                                    '确定要移除已选角色吗？',
                                                ),
                                                content: __(
                                                    '移除后不会影响被移除角色的权限，可重新添加',
                                                ),
                                                onOk: () =>
                                                    handleRemoveRole(
                                                        selectedRowKeys,
                                                    ),
                                            })
                                        }
                                        className={styles.operateBtn}
                                        disabled={selectedRowKeys.length === 0}
                                    >
                                        {__('移除')}
                                    </Button>
                                </Tooltip>
                            </Space>
                        ) : (
                            <Space size={8}>
                                <Button
                                    onClick={() =>
                                        handleOptionTable(OperateType.CREATE)
                                    }
                                    className={styles.operateBtn}
                                    icon={<AddOutlined />}
                                    type="primary"
                                >
                                    {__('自定义角色')}
                                </Button>
                                <Button
                                    onClick={() =>
                                        getUsersData(searchCondition)
                                    }
                                    className={styles.operateBtn}
                                    type="primary"
                                >
                                    {__('同步角色')}
                                </Button>
                            </Space>
                        )}

                        <Space size={8}>
                            <SearchInput
                                style={{ width: inRoleGroup ? 200 : 272 }}
                                placeholder={__('搜索角色名称')}
                                value={searchCondition?.keyword}
                                onKeyChange={(val: string) => {
                                    if (val === searchCondition?.keyword) return
                                    setSearchCondition({
                                        ...searchCondition,
                                        keyword: val,
                                        offset: 1,
                                    })
                                }}
                            />
                            <LightweightSearch
                                formData={[
                                    {
                                        label: __('角色类型'),
                                        key: 'type',
                                        options: [
                                            { value: '', label: __('不限') },
                                            ...roleTypeOptions,
                                        ],
                                        type: SearchType.Radio,
                                    },
                                ]}
                                onChange={(data, key) => {
                                    if (!key) {
                                        // 重置
                                        setSearchCondition((prev) => ({
                                            ...prev,
                                            offset: 1,
                                            ...data,
                                        }))
                                    } else {
                                        setSearchCondition((prev) => ({
                                            ...prev,
                                            offset: 1,
                                            [key]: data[key],
                                        }))
                                    }
                                }}
                                defaultValue={{ type: '' }}
                            />
                            <span
                                style={{ display: 'flex', flexWrap: 'nowrap' }}
                            >
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
                                <RefreshBtn onClick={() => handleRefresh()} />
                            </span>
                        </Space>
                    </div>
                    <div
                        className={classnames(styles.tableWrapper, {
                            [styles.bordered]: inRoleGroup,
                        })}
                    >
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={tableData}
                            loading={fetching}
                            onChange={(currentPagination, filters, sorter) => {
                                const selectedMenu = handleTableChange(sorter)
                                setSelectedSort(selectedMenu)
                                setSearchCondition((prev) => ({
                                    ...prev,
                                    sort: selectedMenu.key,
                                    direction: selectedMenu.sort,
                                    offset: 1,
                                }))
                            }}
                            scroll={{
                                x: 610,
                                y: `calc(100vh - ${tableHeight}px)`,
                            }}
                            bordered={false}
                            locale={{
                                emptyText: isSearch ? <Empty /> : renderEmpty(),
                            }}
                            pagination={false}
                            rowClassName={styles.tableRow}
                            rowSelection={
                                inRoleGroup
                                    ? {
                                          selectedRowKeys,
                                          onChange: (
                                              newSelectedRowKeys: any[],
                                          ) => {
                                              setSelectedRowKeys(
                                                  newSelectedRowKeys,
                                              )
                                          },
                                      }
                                    : undefined
                            }
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
            <CreateRoleModal
                open={createVisible}
                operate={operate}
                roleData={operateItem}
                onClose={(refresh) => {
                    if (refresh) {
                        handleRefresh(false)
                    }
                    setCreateVisible(false)
                    setOperateItem(undefined)
                }}
            />

            {/* 详情 */}
            <Details
                open={detailsVisible && !!operateItem}
                id={operateItem?.id}
                onClose={() => {
                    setDetailsVisible(false)
                    setOperateItem(undefined)
                }}
            />

            {/* 配置权限 */}
            <ConfigPermission
                id={operateItem?.id}
                open={configPermissionVisible}
                onClose={() => {
                    setConfigPermissionVisible(false)
                    setOperateItem(undefined)
                }}
            />

            {/* 添加角色 */}
            <GroupAddRoleModal
                open={addRoleVisible}
                id={selectedRoleGroup?.id}
                onClose={() => {
                    setAddRoleVisible(false)
                    handleRefresh(false)
                }}
            />
        </div>
    )
}

export default Role
