import * as React from 'react'
import { useState, useEffect } from 'react'
import { useAntdTable, useDebounce } from 'ahooks'
import { Button, Input, Spin, Table, Tooltip, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import Icon, { SearchOutlined } from '@ant-design/icons'
import DropDownFilter from '../DropDownFilter'
import empty from '@/assets/dataEmpty.svg'
import __ from './locale'
import styles from './styles.module.less'
import { AvatarOutlined, AddOutlined } from '@/icons'
import { menus } from './helper'
import Empty from '@/ui/Empty'
import Confirm from '../Confirm'
import AddUser from './AddUser'
import {
    getUserListByPermission,
    removeUserForRole,
    formatError,
    SortDirection,
} from '@/core'
import { SearchInput } from '@/ui'
import { RefreshBtn, SortBtn } from '@/components/ToolbarComponents'

interface RoleUserTableType {
    selectedRole: any
    addUsersStatus: boolean
    onSetAddUserState: (status: boolean) => void
}

const RoleUserTable = ({
    selectedRole,
    addUsersStatus,
    onSetAddUserState,
}: RoleUserTableType) => {
    const columns: ColumnsType<any> = [
        {
            title: __('用户名称'),
            key: 'name',
            render: (_, record) => (
                <div className={styles.tableItemUserName}>
                    <div className={styles.userIcon}>
                        <AvatarOutlined />
                    </div>
                    <div className={styles.userName} title={record.name}>
                        {record.name}
                    </div>
                </div>
            ),
            width: '30%',
        },
        {
            title: __('所属部门'),
            key: ' departments',
            ellipsis: true,
            render: (_, record) => (
                <Tooltip
                    overlayStyle={{ maxWidth: '500px' }}
                    placement="top"
                    title={
                        <div
                            style={{
                                padding: '8px',
                            }}
                        >
                            {record?.departments?.map((department) => (
                                <div
                                    style={{
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    {department}
                                </div>
                            ))}
                        </div>
                    }
                    color="#fff"
                    overlayInnerStyle={{
                        color: 'rgba(0,0,0,0.85)',
                    }}
                    getPopupContainer={(node) => document.body}
                >
                    {record.departments
                        .map((department) => {
                            const parents = department.split('/')
                            return parents[parents.length - 1]
                        })
                        .join('、')}
                </Tooltip>
            ),

            width: '40%',
        },
        {
            title: __('操作'),
            key: 'action',
            render: (_, record) => (
                <div>
                    <Button
                        type="link"
                        onClick={() => {
                            setRemoveUser(record)
                        }}
                        style={{ height: '22px' }}
                    >
                        {__('移除')}
                    </Button>
                </div>
            ),
        },
    ]
    const [removeUser, setRemoveUser] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [addUserStatus, setAddUserStatus] = useState<boolean>(false)
    const [searchKey, setSearchKey] = useState<string>('')
    const [direction, setDirection] = useState<SortDirection>(
        SortDirection.DESC,
    )
    const [userTableLoading, setUserTableLoading] = useState<boolean>(true)
    const [firstLoadData, setFirstLoadData] = useState<boolean>(true)

    const getUserInfo = async (params) => {
        try {
            if (selectedRole?.id) {
                setUserTableLoading(true)
                const { total_count, entries } = await getUserListByPermission({
                    innerRoleId: selectedRole.id,
                })
                setFirstLoadData(false)
                return {
                    total: total_count,
                    list: entries,
                }
            }
        } catch (ex) {
            formatError(ex)
        }

        return {
            total: 0,
            list: [],
        }
    }

    const { tableProps, run } = useAntdTable(getUserInfo, {
        defaultPageSize: 20,
        manual: true,
    })

    useEffect(() => {
        setSearchKey('')
        run({ pageSize: 20, current: 1 })
    }, [selectedRole])

    useEffect(() => {
        if (addUsersStatus) {
            setAddUserStatus(addUsersStatus)
        }
    }, [addUsersStatus])

    useEffect(() => {
        run({ pageSize: 20, current: 1, keyword: searchKey })
        // 触发搜索
    }, [searchKey])

    useEffect(() => {
        if (!firstLoadData) {
            setUserTableLoading(false)
        }
    }, [tableProps.dataSource])

    /**
     * 移除用户
     */
    const handleRemoveUser = async () => {
        try {
            setLoading(true)
            await removeUserForRole(selectedRole.id, {
                uid: removeUser.id,
            })
            message.success(__('移除成功'))
            setRemoveUser(null)
            setLoading(false)
        } catch (ex) {
            setRemoveUser(null)
            formatError(ex)
        } finally {
            if (searchKey) {
                run({ pageSize: 20, current: 1, keyword: searchKey })
            } else {
                run({ pageSize: 20, current: 1 })
            }
        }
    }

    /**
     * 添加用户完成
     */
    const handleAddedUser = () => {
        setAddUserStatus(false)
        if (searchKey) {
            run({ pageSize: 20, current: 1, keyword: searchKey })
        } else {
            run({ pageSize: 20, current: 1 })
        }
    }

    return (
        <div className={styles.roleUser}>
            <div className={styles.userRoleTools}>
                <div>
                    <Button
                        icon={<AddOutlined />}
                        type="primary"
                        onClick={() => {
                            setAddUserStatus(true)
                        }}
                    >
                        {__('添加用户')}
                    </Button>
                </div>
                {!searchKey && tableProps.dataSource.length === 0 ? null : (
                    <div className={styles.userRoleFilter}>
                        <SearchInput
                            value={searchKey}
                            placeholder={__('搜索用户名称')}
                            className={styles.userRoleSearch}
                            onKeyChange={(kw: string) => {
                                setSearchKey(kw)
                            }}
                        />
                        {/* <SortBtn
                            contentNode={
                                <DropDownFilter
                                    menus={menus}
                                    defaultMenu={{
                                        key: 'created_at',
                                        sort: SortDirection.DESC,
                                    }}
                                    menuChangeCb={(value) => {
                                        setDirection(
                                            value.sort || SortDirection.DESC,
                                        )
                                        run({
                                            pageSize: 20,
                                            current: 1,
                                            direction: value.sort,
                                            keyword: searchKey,
                                        })
                                    }}
                                />
                            }
                        /> */}
                        <RefreshBtn
                            onClick={() =>
                                run({
                                    pageSize: 20,
                                    current: 1,
                                    keyword: searchKey,
                                })
                            }
                        />
                    </div>
                )}
            </div>
            <div className={styles.userTable}>
                {tableProps.dataSource.length === 0 && !searchKey ? (
                    userTableLoading ? (
                        <div className={styles.tableEmpty}>
                            <Spin />
                        </div>
                    ) : (
                        <div className={styles.tableEmpty}>
                            <Empty
                                iconSrc={empty}
                                desc={
                                    <div>
                                        {__('此角色下暂无用户')}
                                        {/* <a onClick={() => setAddUserStatus(true)}>
                                    {__('【添加用户】')}
                                </a>
                                {__('进行添加')} */}
                                    </div>
                                }
                            />
                        </div>
                    )
                ) : (
                    <Table
                        columns={columns}
                        {...tableProps}
                        scroll={{
                            y:
                                tableProps.pagination.total > 20
                                    ? 'calc(100vh - 286px)'
                                    : 'calc(100vh - 244px)',
                        }}
                        locale={{ emptyText: <Empty /> }}
                        pagination={{
                            ...tableProps.pagination,
                            showSizeChanger: false,
                            hideOnSinglePage: true,
                        }}
                        loading={userTableLoading}
                    />
                )}
            </div>
            {removeUser && (
                <Confirm
                    onOk={() => {
                        handleRemoveUser()
                    }}
                    onCancel={() => {
                        setRemoveUser(null)
                    }}
                    open
                    title={__('确认要移除用户吗?')}
                    content={__(
                        '移除角色中的用户后，您可能需要对使用到该用户的功能进行重新配置。确认要移除吗？',
                    )}
                    width={432}
                    okText={__('确定')}
                    cancelText={__('取消')}
                    okButtonProps={{ loading }}
                />
            )}
            {addUserStatus && (
                <AddUser
                    roleInfo={selectedRole}
                    onCancel={() => {
                        setAddUserStatus(false)
                        onSetAddUserState(false)
                    }}
                    onConfirm={() => {
                        handleAddedUser()
                        onSetAddUserState(false)
                    }}
                />
            )}
        </div>
    )
}
export default RoleUserTable
