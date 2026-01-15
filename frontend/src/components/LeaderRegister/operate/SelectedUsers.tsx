import React from 'react'
import { Tag, Popover } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import __ from '../locale'
import styles from '../styles.module.less'
import { IUserDetails } from '@/core'

// 最多显示的用户个数
const maxDisplayCount = 3

export interface SelectedUsersProps {
    // 已选用户
    selectedUsers: IUserDetails[]
    // 移除用户
    onRemoveUser: (userId: string) => void
}

// 用户标签组件
const UserTag: React.FC<{
    user: IUserDetails
    onRemove: (userId: string) => void
    showCloseIcon?: boolean
    maxWidth?: number | string
}> = ({ user, onRemove, showCloseIcon = false, maxWidth = 120 }) => (
    <Tag
        key={user.id}
        closable
        onClose={() => onRemove(user.id)}
        closeIcon={showCloseIcon ? <CloseOutlined /> : undefined}
        className={styles.selectedTag}
        style={{ maxWidth }}
    >
        <span
            className={styles.selectedTagText}
            title={user?.name || '--'}
            style={{
                maxWidth: `calc(${
                    typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth
                } - 24px)`,
            }}
        >
            {user?.name || '--'}
        </span>
    </Tag>
)

// 已选用户标签组件
const SelectedUsers: React.FC<SelectedUsersProps> = ({
    selectedUsers,
    onRemoveUser,
}) => {
    // 最多显示的用户
    const displayUsers = selectedUsers.slice(0, maxDisplayCount)
    // 剩余用户
    const remainingUsers = selectedUsers.slice(maxDisplayCount)
    // 剩余用户个数
    const remainingCount = remainingUsers.length

    if (selectedUsers.length === 0) {
        return null
    }

    // 更多用户的PopOver内容
    const moreUsersContent = (
        <div style={{ maxWidth: 300 }}>
            {remainingUsers.map((user) => (
                <UserTag
                    key={user.id}
                    user={user}
                    onRemove={onRemoveUser}
                    showCloseIcon
                    maxWidth={200}
                />
            ))}
        </div>
    )

    return (
        <div className={styles.selectedUsersDisplay}>
            <span>
                {__('已选')}（{selectedUsers.length}）：
            </span>
            <div className={styles.selectedTagWrapper}>
                {displayUsers.map((user) => (
                    <UserTag
                        key={user.id}
                        user={user}
                        onRemove={onRemoveUser}
                        showCloseIcon
                        maxWidth={120}
                    />
                ))}
                {remainingCount > 0 && (
                    <Popover
                        content={moreUsersContent}
                        title={__('更多已选用户')}
                        trigger="hover"
                        placement="topLeft"
                    >
                        <Tag style={{ cursor: 'pointer' }}>
                            +{remainingCount}
                        </Tag>
                    </Popover>
                )}
            </div>
        </div>
    )
}

export default SelectedUsers
