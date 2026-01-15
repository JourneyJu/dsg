import React, { useState, useEffect, useCallback } from 'react'
import { Modal, Button, message } from 'antd'
import VirtualList from 'rc-virtual-list'
import __ from '../locale'
import styles from '../styles.module.less'
import {
    formatError,
    getUsersFrontendList,
    createUser,
    IUserDetails,
} from '@/core'
import ArchitectureDirTree from '@/components/BusinessArchitecture/ArchitectureDirTree'
import { Architecture } from '@/components/BusinessArchitecture/const'
import { SearchInput, DetailsLabel } from '@/ui'
import { refreshDetails, renderEmpty, renderLoader } from '../helper'
import { userInfoDefault } from '../const'
import { RefreshBtn } from '@/components/ToolbarComponents'
import UserItem from './UserItem'
import SelectedUsers from './SelectedUsers'

interface CreateModalProps {
    // 是否打开
    open: boolean
    // 取消回调
    onCancel: () => void
    // 成功回调
    onSuccess: () => void
}
const initSearchParams = {
    limit: 20,
    offset: 1,
    keyword: '',
    department_id: '',
}

const LeaderCreate: React.FC<CreateModalProps> = ({
    open,
    onCancel,
    onSuccess,
}) => {
    const [submitLoading, setSubmitLoading] = useState(false)

    // 用户列表整体加载状态
    const [userListLoading, setUserListLoading] = useState(true)
    // 用户列表加载更多数据的状态
    const [loadingMore, setLoadingMore] = useState(false)
    // 是否还有更多数据
    const [hasMore, setHasMore] = useState(true)

    // 用户列表
    const [userList, setUserList] = useState<IUserDetails[]>([])
    // 已选用户，通过复选框勾选的用户
    const [selectedUsers, setSelectedUsers] = useState<IUserDetails[]>([])
    // 当前点击的用户项
    const [operateItem, setOperateItem] = useState<IUserDetails>()

    // 用户搜索条件
    const [searchCondition, setSearchCondition] =
        useState<any>(initSearchParams)
    // 标识当前是否是加载更多操作
    const [isLoadMoreOperation, setIsLoadMoreOperation] = useState(false)

    // 根据条件请求数据（包括初始化）
    useEffect(() => {
        if (searchCondition) {
            getUserList({ ...searchCondition }, isLoadMoreOperation)
            // 重置加载更多标识
            if (isLoadMoreOperation) {
                setIsLoadMoreOperation(false)
            }
        }
    }, [searchCondition])

    // 根据是否是加载更多设置加载状态
    const setLoading = (isLoadMore: boolean, isLoading: boolean) => {
        if (isLoadMore) {
            setLoadingMore(isLoading)
        } else {
            setUserListLoading(isLoading)
        }
    }

    // 获取用户列表
    const getUserList = async (params: any, isLoadMore = false) => {
        try {
            setLoading(isLoadMore, true)

            const res = await getUsersFrontendList(params)
            const newEntries = res?.entries || []
            const totalCount = res?.total_count || 0

            let updatedList
            if (isLoadMore) {
                // 加载更多时追加数据
                setUserList((prev) => {
                    updatedList = [...prev, ...newEntries]
                    return updatedList
                })
            } else {
                // 初始加载或切换部门时替换数据
                updatedList = newEntries
                setUserList(newEntries)
            }

            // 根据最终列表长度和总数判断是否还有更多数据
            setHasMore(updatedList.length < totalCount)
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(isLoadMore, false)
        }
    }

    // 加载更多数据
    const loadMoreData = useCallback(() => {
        if (loadingMore || !hasMore) {
            return
        }

        // 设置加载更多标识
        setIsLoadMoreOperation(true)

        const nextOffset = searchCondition.offset + 1
        setSearchCondition((prev) => ({
            ...prev,
            offset: nextOffset,
        }))
    }, [searchCondition, loadingMore, hasMore])

    // 处理滚动事件
    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLElement>) => {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget

            // 滚动到底部前100px时开始加载更多
            if (scrollHeight - scrollTop - clientHeight <= 100) {
                loadMoreData()
            }
        },
        [loadMoreData],
    )

    // 处理机构选择变化
    const handleOrgChange = async (value) => {
        const newDeptId = value?.id || ''

        // 构建新的搜索条件
        const newSearchCondition = {
            ...initSearchParams,
            department_id: newDeptId,
        }

        // 检查是否与当前状态相同，避免不必要的更新
        const isSameCondition =
            searchCondition.department_id === newDeptId &&
            searchCondition.offset === 1 &&
            searchCondition.keyword === '' &&
            searchCondition.limit === initSearchParams.limit

        if (isSameCondition) {
            return // 状态相同，直接返回
        }

        setHasMore(true)
        setIsLoadMoreOperation(false) // 重置加载更多标识
        setSearchCondition(newSearchCondition)
    }

    // 处理用户选择
    const handleUserSelect = useCallback(
        (userId: string, selected: boolean) => {
            const user = userList.find((u) => u.id === userId)
            if (!user) return

            setSelectedUsers((prev) => {
                if (selected) {
                    return [...prev, user]
                }
                return prev.filter((u) => u.id !== userId)
            })
        },
        [userList],
    )

    // 处理移除已选用户
    const handleRemoveSelectedUser = useCallback((userId: string) => {
        setSelectedUsers((prev) => prev.filter((user) => user.id !== userId))
    }, [])

    // 处理清空所有已选用户
    const handleClearAllSelected = useCallback(() => {
        setSelectedUsers([])
    }, [])

    // 处理全选/反选
    const handleSelectAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                setSelectedUsers([...userList])
            } else {
                setSelectedUsers([])
            }
        },
        [userList],
    )

    // 处理用户行点击
    const handleUserClick = async (user: any) => {
        setOperateItem(user)
    }

    // 刷新按钮
    const handleRefresh = () => {
        // 重置分页状态并刷新数据
        setHasMore(true)
        setIsLoadMoreOperation(false) // 重置加载更多标识

        setSearchCondition((prev) => ({
            ...prev,
            offset: 1,
        }))
    }

    // 确定按钮
    const handleSubmit = async (values) => {
        if (selectedUsers.length === 0) {
            message.error(__('请选择负责人'))
            return
        }

        try {
            setSubmitLoading(true)
            // 从 selectedUsers 中取出 id 字段，映射为 user_id
            const usersToCreate = selectedUsers.map((user) => ({
                user_id: user.id,
            }))
            // 创建用户
            await createUser(usersToCreate)
            message.success(__('负责人注册成功'))
            onSuccess()
        } catch (error) {
            formatError(error)
        } finally {
            setSubmitLoading(false)
        }
    }

    // 渲染底部按钮
    const renderFooter = () => {
        return (
            <div className={styles.footerContainer}>
                {/* 左侧：已选用户显示 */}
                <div className={styles.selectedUsers}>
                    <SelectedUsers
                        selectedUsers={selectedUsers}
                        onRemoveUser={handleRemoveSelectedUser}
                    />
                </div>
                {/* 右侧：操作按钮 */}
                <div className={styles.operate}>
                    <Button
                        type="text"
                        onClick={handleClearAllSelected}
                        disabled={selectedUsers.length === 0}
                    >
                        {__('清空')}
                    </Button>
                    <Button onClick={onCancel}>{__('取消')}</Button>
                    <Button
                        type="primary"
                        loading={submitLoading}
                        onClick={handleSubmit}
                    >
                        {__('确定')}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Modal
            title={__('负责人注册')}
            open={open}
            onCancel={onCancel}
            footer={renderFooter()}
            width={800}
            bodyStyle={{
                padding: 0,
            }}
            destroyOnClose
            maskClosable={false}
        >
            <div className={styles.createWrapper}>
                <div className={styles.leftContainer}>
                    <div className={styles.tips}>{__('组织架构')}</div>
                    <ArchitectureDirTree
                        getSelectedNode={handleOrgChange}
                        filterType={[
                            Architecture.ORGANIZATION,
                            Architecture.DEPARTMENT,
                        ].join()}
                        // needUncategorized
                        // unCategorizedKey="Uncategorized"
                        placeholder={__('搜索组织架构')}
                    />
                </div>
                <div className={styles.centerContainer}>
                    <div className={styles.tips}>{__('用户列表')}</div>

                    {/* 搜索和操作栏 */}
                    <div className={styles.search}>
                        <SearchInput
                            value={searchCondition?.keyword}
                            style={{ width: 252 }}
                            placeholder={__('搜索用户名称')}
                            onKeyChange={(kw: string) => {
                                if (kw === searchCondition?.keyword) return
                                setSearchCondition((prev) => ({
                                    ...prev,
                                    keyword: kw,
                                    offset: 1,
                                }))
                            }}
                        />
                        <RefreshBtn onClick={handleRefresh} />
                    </div>

                    {/* 全选操作 */}
                    {/* {userList.length > 0 && (
                        <div className={styles.selectAll}>
                            <Checkbox
                                checked={
                                    userList.length > 0 &&
                                    selectedUsers.length === userList.length
                                }
                                indeterminate={
                                    selectedUsers.length > 0 &&
                                    selectedUsers.length < userList.length
                                }
                                onChange={(e) =>
                                    handleSelectAll(e.target.checked)
                                }
                            >
                                {__('全选')}
                            </Checkbox>
                        </div>
                    )} */}

                    {/* 用户列表 */}
                    <div className={styles.userList}>
                        {userListLoading ? (
                            <div className={styles.loading}>
                                {renderLoader()}
                            </div>
                        ) : userList.length === 0 ? (
                            renderEmpty()
                        ) : (
                            <>
                                <VirtualList
                                    data={userList}
                                    height={380}
                                    itemHeight={68}
                                    itemKey="user_id"
                                    onScroll={handleScroll}
                                >
                                    {(user, index) => (
                                        <UserItem
                                            key={user.id}
                                            user={user}
                                            isSelected={selectedUsers.some(
                                                (u) => u.id === user.id,
                                            )}
                                            isClicked={
                                                operateItem?.id === user.id
                                            }
                                            onUserClick={handleUserClick}
                                            onUserSelect={handleUserSelect}
                                        />
                                    )}
                                </VirtualList>
                                {/* 将加载更多指示器移到 VirtualList 外部 */}
                                <div className={styles.loadMoreContainer}>
                                    {loadingMore && (
                                        <div className={styles.loadingMore}>
                                            {__('加载更多...')}
                                        </div>
                                    )}
                                    {!hasMore &&
                                        userList.length > 0 &&
                                        !loadingMore && (
                                            <div className={styles.noMore}>
                                                {__('没有更多数据了')}
                                            </div>
                                        )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className={styles.rightContainer}>
                    <div className={styles.rightTips}>{__('用户详情')}</div>
                    <DetailsLabel
                        wordBreak
                        detailsList={refreshDetails({
                            detailList: userInfoDefault,
                            actualDetails: operateItem,
                        })}
                        labelWidth="80px"
                    />
                </div>
            </div>
        </Modal>
    )
}

export default LeaderCreate
