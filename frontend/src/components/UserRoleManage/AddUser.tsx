import { useState, useEffect, useRef } from 'react'
import { uniq } from 'lodash'
import List from 'rc-virtual-list'
import { Checkbox, message, Modal } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { useSize } from 'ahooks'
import classnames from 'classnames'
import __ from './locale'
import styles from './styles.module.less'
import Empty from '@/ui/Empty'
import { AvatarOutlined } from '@/icons'
import { getCandidateUser, addUserForRole, formatError } from '@/core'
import dataEmpty from '@/assets/dataEmpty.svg'
import { SearchInput } from '@/ui'

interface AddUserType {
    onCancel: () => void
    onConfirm: () => void
    roleInfo: any
}

const AddUser = ({ onCancel, onConfirm, roleInfo }: AddUserType) => {
    const [allUsers, setAllUsers] = useState<any>([])
    const [searchUsers, setSearchUsers] = useState<any>([])
    const [selectedUsers, setSelectedUsers] = useState<any>([])
    const [searchValue, setSearchValue] = useState<string>()
    const collapseRef = useRef(null)
    const collapseWrapperRef = useRef(null)
    const collapseSize = useSize(collapseRef)
    const collapseWrapperSize = useSize(collapseWrapperRef)

    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        getAllUsers()
    }, [])

    // 搜索成员
    useEffect(() => {
        const escapedValue = (searchValue ?? '').replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&',
        )
        const regex = new RegExp(escapedValue ?? '', 'i')
        setSearchUsers(allUsers.filter((user) => regex.test(user.name)))
    }, [searchValue])

    /**
     * 获取用户
     */
    const getAllUsers = async () => {
        const users = await getCandidateUser(roleInfo.id)
        setAllUsers(
            users.filter(
                (user) => user.id !== '266c6a42-6131-4d62-8f39-853e7093701c',
            ),
        )
    }

    /**
     * 删除用户
     * @param user 用户
     */
    const handleDelete = (user) => {
        setSelectedUsers(
            selectedUsers.filter((selectedUser) => selectedUser.id !== user.id),
        )
    }

    /**
     * 复选框选中用户
     * @param user 用户
     * @param checked 选中状态
     */
    const checkUser = (user: any, checked: boolean) => {
        if (checked) {
            setSelectedUsers([...selectedUsers, user])
        } else {
            setSelectedUsers(
                selectedUsers.filter(
                    (selectedUser) => selectedUser.id !== user.id,
                ),
            )
        }
    }
    // 获取用户
    const getItem = (user) => {
        return (
            <div className={styles.item} key={user.id}>
                <div className={styles.memberWrapper}>
                    <div className={styles.avator}>
                        <AvatarOutlined />
                    </div>
                    <div className={styles.name} title={user.name}>
                        {user.name}
                    </div>
                </div>
                <Checkbox
                    onChange={(e) => {
                        checkUser(user, e.target.checked)
                    }}
                    checked={
                        !!selectedUsers.find(
                            (selectedUser) => selectedUser.id === user.id,
                        )
                    }
                />
            </div>
        )
    }

    /**
     * 选中用户和可选用户的交集 已选的成员 eg: [1,2,3] in [1,5,6,7,8] => [1]
     * @param users 用户组
     * @returns 当前搜索用户中选择的用户
     */
    const getSelectedInSearchUsers = (users) => {
        return users.filter((user) => {
            const index = selectedUsers.findIndex((selectedUser) => {
                return user.id === selectedUser.id
            })
            return index !== -1
        })
    }
    /**
     * 保存用户
     */
    const saveAddUser = async (async) => {
        if (selectedUsers.length) {
            try {
                setLoading(true)
                await addUserForRole(roleInfo.id, {
                    uids: selectedUsers.map((user) => user.id),
                })
                message.success('添加成功')
                onConfirm()
            } catch (ex) {
                formatError(ex)
            } finally {
                setLoading(false)
            }
        } else {
            onCancel()
        }
    }

    // 全选组件  搜索时控制搜索的数据  非搜索时控制全部数据
    const getCheckAllComp = () => {
        let indeterminate = false
        let checked = false
        // 搜索时，全选的checkbo中间状态
        if (searchValue) {
            const res = getSelectedInSearchUsers(searchUsers)
            indeterminate =
                res.length !== 0 && res.length !== searchUsers.length
            checked = res.length === searchUsers.length
        } else {
            indeterminate =
                selectedUsers.length !== 0 &&
                selectedUsers.length !== allUsers.length
            checked = selectedUsers.length === allUsers.length
        }
        return searchValue && searchUsers.length === 0 ? null : (
            <div
                className={classnames(
                    styles.checkWrapper,
                    (collapseSize?.height || 0) >
                        (collapseWrapperSize?.height || 0) &&
                        styles.checkWrapperScroll,
                )}
            >
                <div>全选</div>
                <Checkbox
                    indeterminate={indeterminate}
                    checked={checked}
                    onChange={(e) => checkAll(e.target.checked)}
                />
            </div>
        )
    }

    // 点击选中全部
    const checkAll = (checked) => {
        // 搜索时
        if (searchValue) {
            if (checked) {
                // 选中时，将当前搜索结果下的所有成员添加到选中列表
                setSelectedUsers(uniq([...selectedUsers, ...searchUsers]))
            } else {
                // 取消选中时， 去掉当前搜索结果下的所有成员
                setSelectedUsers(
                    selectedUsers.filter((selectedUser) => {
                        return !searchUsers.find(
                            (searchUser) => searchUser.id === selectedUser.id,
                        )
                    }),
                )
            }
            return
        }
        // 非搜索时
        if (checked) {
            setSelectedUsers(allUsers)
        } else {
            setSelectedUsers([])
        }
    }
    return (
        <Modal
            title={__('添加用户')}
            open
            onCancel={onCancel}
            width={800}
            maskClosable={false}
            onOk={saveAddUser}
            confirmLoading={loading}
            footer={allUsers.length ? undefined : null}
        >
            {allUsers.length ? (
                <div className={styles.chooseMemberWrapper}>
                    <div className={styles.chooseMemberTitle}>
                        {__('选择用户')}
                    </div>
                    <div className={styles.content}>
                        <div className={styles.left}>
                            <div className={styles.top}>
                                <SearchInput
                                    placeholder={__('搜索用户名称')}
                                    className={styles.memberName}
                                    onKeyChange={(kw: string) =>
                                        setSearchValue(kw)
                                    }
                                />
                                {getCheckAllComp()}
                            </div>

                            <div
                                className={styles.collapseWrapper}
                                ref={collapseWrapperRef}
                            >
                                <div
                                    className={styles.collapse}
                                    ref={collapseRef}
                                >
                                    {searchValue ? (
                                        searchUsers.length > 0 ? (
                                            <List
                                                data={searchUsers}
                                                height={275}
                                                itemHeight={44}
                                                itemKey="id"
                                            >
                                                {(searchUser) =>
                                                    getItem(searchUser)
                                                }
                                            </List>
                                        ) : (
                                            <Empty />
                                        )
                                    ) : (
                                        <div>
                                            {allUsers.length > 0 ? (
                                                <List
                                                    data={allUsers}
                                                    height={275}
                                                    itemHeight={44}
                                                    itemKey="id"
                                                >
                                                    {(user) => getItem(user)}
                                                </List>
                                            ) : (
                                                <Empty />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.right}>
                            <div className={styles.selectedAll}>
                                <span className={styles.count}>
                                    已选择：{selectedUsers.length} 人
                                </span>
                                <span
                                    className={classnames(
                                        styles.clearAll,
                                        selectedUsers.length === 0 &&
                                            styles.disabledClearAll,
                                    )}
                                    onClick={() => {
                                        setSelectedUsers([])
                                    }}
                                >
                                    {__('全部移除')}
                                </span>
                            </div>
                            <div className={styles.selectedMemberWrapper}>
                                {/* {selectedUsers.map((selectedUser) => (
                                    <div
                                        className={styles.selectedMember}
                                        key={selectedUser.id}
                                    >
                                        <div className={styles.memberWrapper}>
                                            <div className={styles.avator}>
                                                <AvatarOutlined />
                                            </div>
                                            <div
                                                className={styles.name}
                                                title={selectedUser.name}
                                            >
                                                {selectedUser.name}
                                            </div>
                                        </div>
                                        <div
                                            className={styles.delIconContainer}
                                            onClick={() =>
                                                handleDelete(selectedUser)
                                            }
                                        >
                                            <CloseOutlined
                                                className={styles.delIcon}
                                            />
                                        </div>
                                    </div>
                                ))} */}
                                <List
                                    data={selectedUsers}
                                    height={310}
                                    itemHeight={44}
                                    itemKey="id"
                                >
                                    {(selectedUser) => (
                                        <div
                                            className={styles.selectedMember}
                                            key={selectedUser.id}
                                        >
                                            <div
                                                className={styles.memberWrapper}
                                            >
                                                <div className={styles.avator}>
                                                    <AvatarOutlined />
                                                </div>
                                                <div
                                                    className={styles.name}
                                                    title={selectedUser.name}
                                                >
                                                    {selectedUser.name}
                                                </div>
                                            </div>
                                            <div
                                                className={
                                                    styles.delIconContainer
                                                }
                                                onClick={() =>
                                                    handleDelete(selectedUser)
                                                }
                                            >
                                                <CloseOutlined
                                                    className={styles.delIcon}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </List>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.userAddEmpty}>
                    <Empty desc={__('暂无可添加用户')} iconSrc={dataEmpty} />
                </div>
            )}
        </Modal>
    )
}

export default AddUser
