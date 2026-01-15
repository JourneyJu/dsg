import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import Icon, {
    CaretLeftOutlined,
    DeleteOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import { Input, message, Spin, Tooltip } from 'antd'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useDebounce, useAsyncEffect } from 'ahooks'
import { noop } from 'lodash'
import __ from './locale'
import styles from './styles.module.less'
import {
    AddOutlined,
    EditOutlined,
    RecycleBinOutlined,
    RoleColored,
} from '@/icons'
import { conbineSvg, getCurrentRoleIcon } from './helper'
import {
    createSystemRole,
    deleteSystemRole,
    getRoleIcons,
    getSystemRoles,
    formatError,
    updateSystemRole,
} from '@/core'
import {
    roleIconInfo,
    roleCreateParams,
    roleInfo,
} from '@/core/apis/configurationCenter/index.d'
import RoleInfo from './RoleInfo'
import Confirm from '../Confirm'
import Empty from '@/ui/Empty'
import CreateRoleSuccess from './CreateRoleSuccess'

interface RoleListType {
    onSelectedRole: (role: any) => void
    onSetAddUserState: (status: boolean) => void
}

const RoleList = ({
    onSelectedRole = noop,
    onSetAddUserState,
}: RoleListType) => {
    const [expand, setExpand] = useState<boolean>(true)
    const [roles, setRoles] = useState<Array<any>>([])
    const [totalCount, setTotalCount] = useState<number>(0)
    const [showRoleOptions, setRoleShowOptions] = useState<string>('')
    const [newRoleData, setNewRoleData] = useState<any | null>(null)
    const [editRoleData, setEditRoleData] = useState<any | null>(null)
    const [selectedRole, setSelectedRole] = useState<any>(null)
    const [deleteRole, setDeleteRole] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [listLoading, setListLoading] = useState<boolean>(false)
    const [searchKey, setSearchKey] = useState<string>('')
    const [roleIcons, setRoleIcons] = useState<Array<roleIconInfo>>([])
    const [roleListWidth, setRoleListWidth] = useState<number>(210)
    const [createRoleInfo, setCreateRoleInfo] = useState<any>(null)
    const [defaultSelectRole, setDefaultSelectRole] = useState<any>(null)

    useEffect(() => {
        getRoles([])
        getRoleIconInfo()
    }, [])

    useEffect(() => {
        if (deleteRole && deleteRole.id === selectedRole.id) {
            if (roles.length) {
                setSelectedRole(roles[0])
                onSelectedRole(roles[0])
            } else {
                setSelectedRole(defaultSelectRole)
                onSelectedRole(defaultSelectRole)
            }
            setDeleteRole(null)
        }
    }, [roles])

    useEffect(() => {
        // 滚动条恢复到顶部
        setRoles([])
        // 获取搜索结果
        if (searchKey) {
            searchRoles([])
        } else {
            getRoles([])
        }
    }, [searchKey])

    /**
     * 获取所有角色
     */
    const getRoles = async (initRole) => {
        try {
            setListLoading(true)
            const { entries, total_count } = await getSystemRoles({
                offset: initRole.length ? roles.length / 50 + 1 : 1,
                limit: 50,
            })
            if (initRole.length === 0) {
                setDefaultSelectRole(entries[0])
            }
            setTotalCount(total_count)
            setRoles([...initRole, ...entries])
            if (!selectedRole) {
                setSelectedRole(entries[0])
                onSelectedRole(entries[0])
            }
        } catch (ex) {
            formatError(ex)
        } finally {
            setListLoading(false)
        }
    }
    /**
     * 获取所有角色图标
     */
    const getRoleIconInfo = async () => {
        const icons = await getRoleIcons()
        setRoleIcons(icons)
    }

    /**
     * 搜索角色
     */
    const searchRoles = async (initRole) => {
        try {
            setListLoading(true)
            const { entries, total_count } = await getSystemRoles({
                offset: initRole.length ? roles.length / 50 + 1 : 1,
                limit: 50,
                keyword: searchKey,
            })
            setTotalCount(total_count)
            setRoles([...initRole, ...entries])
            if (!selectedRole) {
                setSelectedRole(roles[0])
                onSelectedRole(roles[0])
            }
            setListLoading(false)
        } catch (ex) {
            formatError(ex)
            setListLoading(false)
        }
    }

    /**
     * 创建新角色
     */
    const creatNewRoles = () => {
        setNewRoleData({
            color: '#126EE3',
            icon: roleIcons[0].name,
            name: '',
        })
    }

    /**
     * 添加角色
     */
    const handCreateRole = async (Info: roleCreateParams) => {
        try {
            const res = await createSystemRole(Info)
            setCreateRoleInfo({ ...Info, ...res })
            if (searchKey) {
                searchRoles([])
            } else {
                getRoles([])
            }
        } catch (ex) {
            formatError(ex)
        } finally {
            setNewRoleData(null)
        }
    }
    /**
     * 编辑角色
     */
    const handEditRole = async (info: roleInfo) => {
        try {
            await updateSystemRole(info.id, {
                icon: info.icon,
                color: info.color,
                name: info.name,
            })
            message.success(__('修改成功'))
            if (searchKey) {
                searchRoles([])
            } else {
                getRoles([])
            }
        } catch (ex) {
            formatError(ex)
        } finally {
            setEditRoleData(null)
        }
    }

    /**
     * 删除
     */
    const handleDeleteRole = async (id) => {
        setLoading(true)
        try {
            await deleteSystemRole(id)
            if (searchKey) {
                searchRoles([])
            } else {
                getRoles([])
            }
            if (deleteRole && deleteRole.id !== selectedRole.id) {
                setDeleteRole(null)
            }
            message.success(__('移除成功'))
        } catch (ex) {
            if (deleteRole && deleteRole.id !== selectedRole.id) {
                setDeleteRole(null)
            }
            if (searchKey) {
                searchRoles([])
            } else {
                getRoles([])
            }
            formatError(ex)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div
            style={{
                height: '100%',
            }}
        >
            <div className={styles.roleListContent}>
                {/* <div className={styles.searchRole}>
                    <SearchInput
                        value={searchKey}
                        placeholder={__('搜索角色')}
                        onKeyChange={(kw: string) => {
                            setSearchKey(kw)
                        }}
                    />
                </div> */}
                <div className={styles.roleBar}>
                    <div className={styles.roleTitle}>{__('角色管理')}</div>
                    {/* <div className={styles.roleAdd}>
                        <Tooltip placement="bottom" title={__('添加角色')}>
                            <AddOutlined onClick={creatNewRoles} />
                        </Tooltip>
                    </div> */}
                </div>
                <div
                    style={{
                        height: `calc(100% - 100px)`,
                        overflow: 'auto',
                    }}
                    id="scrollableDiv"
                >
                    {listLoading ? (
                        <div className={styles.roleLoading}>
                            <Spin />
                        </div>
                    ) : (
                        <InfiniteScroll
                            hasMore={roles.length < totalCount}
                            endMessage={roles.length === 0 ? <Empty /> : ''}
                            loader=""
                            next={() => {
                                if (searchKey) {
                                    searchRoles(roles)
                                } else {
                                    getRoles(roles)
                                }
                            }}
                            dataLength={roles.length}
                            scrollableTarget="scrollableDiv"
                        >
                            <div className={styles.listContent}>
                                {roles.map((value, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className={`${styles.listItem} ${
                                                selectedRole &&
                                                selectedRole.name === value.name
                                                    ? styles.listSelectedItem
                                                    : styles.listUnselectedItem
                                            }`}
                                            onFocus={() => 0}
                                            onBlur={() => 0}
                                            onMouseOver={() => {
                                                setRoleShowOptions(value.name)
                                            }}
                                            onMouseLeave={() => {
                                                setRoleShowOptions('')
                                            }}
                                            onClick={() => {
                                                setSelectedRole(value)
                                                onSelectedRole(value)
                                            }}
                                        >
                                            <div
                                                className={styles.listIcon}
                                                style={{
                                                    background:
                                                        value.color.concat(
                                                            'D9',
                                                        ),
                                                }}
                                            >
                                                <Icon
                                                    component={() => {
                                                        return conbineSvg(
                                                            getCurrentRoleIcon(
                                                                roleIcons,
                                                                value.icon,
                                                            ),
                                                        )
                                                    }}
                                                    style={{
                                                        width: 24,
                                                        height: 24,
                                                        fill: '#ffffff',
                                                    }}
                                                />
                                            </div>
                                            <div
                                                className={styles.listName}
                                                title={value.name}
                                            >
                                                {value.name}
                                            </div>
                                            {showRoleOptions === value.name &&
                                            !value.system ? (
                                                <div
                                                    className={styles.listTools}
                                                >
                                                    <Tooltip
                                                        placement="bottom"
                                                        title={__('编辑角色')}
                                                    >
                                                        <div
                                                            className={
                                                                styles.iconWrapper
                                                            }
                                                        >
                                                            <EditOutlined
                                                                style={{
                                                                    fontSize:
                                                                        '14px',
                                                                }}
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    setEditRoleData(
                                                                        value,
                                                                    )
                                                                    e.preventDefault()
                                                                    e.stopPropagation()
                                                                }}
                                                            />
                                                        </div>
                                                    </Tooltip>

                                                    <Tooltip
                                                        placement="bottom"
                                                        title={__('删除角色')}
                                                    >
                                                        <div
                                                            className={
                                                                styles.iconWrapper
                                                            }
                                                        >
                                                            <RecycleBinOutlined
                                                                style={{
                                                                    fontSize:
                                                                        '14px',
                                                                }}
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    setDeleteRole(
                                                                        value,
                                                                    )
                                                                    e.preventDefault()
                                                                    e.stopPropagation()
                                                                }}
                                                            />
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                            ) : null}
                                        </div>
                                    )
                                })}
                            </div>
                        </InfiniteScroll>
                    )}
                </div>
            </div>
            <RoleInfo
                data={newRoleData}
                title={__('添加角色')}
                onCancel={() => {
                    setNewRoleData(null)
                }}
                onConfirm={handCreateRole}
                defaultIcons={roleIcons}
            />
            <RoleInfo
                data={editRoleData}
                title={__('编辑角色')}
                onCancel={() => {
                    setEditRoleData(null)
                }}
                onConfirm={handEditRole}
                defaultIcons={roleIcons}
            />
            {deleteRole && (
                <Confirm
                    onOk={() => {
                        handleDeleteRole(deleteRole.id)
                    }}
                    onCancel={() => {
                        setDeleteRole(null)
                    }}
                    open
                    title={__('确认要删除角色吗?')}
                    content={__(
                        '角色删除后，您可能需要对使用到该角色的功能进行重新配置。确认要删除吗？',
                    )}
                    width={432}
                    okText={__('确定')}
                    cancelText={__('取消')}
                    okButtonProps={{ loading }}
                />
            )}

            {createRoleInfo && (
                <CreateRoleSuccess
                    name={createRoleInfo.name}
                    onModelClose={() => {
                        const currentUser = roles.find(
                            (role) => role.name === createRoleInfo.name,
                        )
                        if (currentUser) {
                            setSelectedRole(currentUser)
                            onSelectedRole(currentUser)
                        } else {
                            setSelectedRole(createRoleInfo)
                            onSelectedRole(createRoleInfo)
                        }
                        setCreateRoleInfo(null)
                    }}
                    onAdduser={() => {
                        const currentUser = roles.find(
                            (role) => role.name === createRoleInfo.name,
                        )
                        if (currentUser) {
                            setSelectedRole(currentUser)
                            onSelectedRole(currentUser)
                        } else {
                            setSelectedRole(createRoleInfo)
                            onSelectedRole(createRoleInfo)
                        }
                        onSetAddUserState(true)
                        setCreateRoleInfo(null)
                    }}
                />
            )}
        </div>
    )
}

export default RoleList
