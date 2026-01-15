import React, { useMemo } from 'react'
import { Checkbox, Avatar, Tooltip } from 'antd'
import { UserOutlined, TeamOutlined } from '@ant-design/icons'
import styles from '../styles.module.less'
import __ from '../locale'
import { IUserDetails } from '@/core'
import { getDepartment } from '../helper'

export interface UserItemProps {
    // 用户信息
    user: IUserDetails
    // 是否选中
    isSelected: boolean
    // 是否点击
    isClicked: boolean
    // 点击用户
    onUserClick: (user: any) => void
    // 选中用户
    onUserSelect: (userId: string, selected: boolean) => void
}

// 用户列表项组件
const UserItem: React.FC<UserItemProps> = ({
    user,
    isSelected,
    isClicked,
    onUserClick,
    onUserSelect,
}) => {
    // 判断用户是否已注册为负责人
    const isDisabled = user.registered === 2

    // 处理用户点击
    const handleUserClick = () => {
        if (isDisabled) return
        onUserClick(user)
    }

    // 处理用户选中
    const handleUserSelect = (checked: boolean) => {
        if (isDisabled) return
        onUserSelect(user.id, checked)
    }

    const showPath = useMemo(() => {
        if (!user?.parent_deps?.length) {
            return '--'
        }
        return getDepartment(user?.parent_deps || [])
    }, [user?.parent_deps])

    const userItem = (
        <div
            className={`${styles.userListItem} ${
                isClicked ? styles.clicked : ''
            } ${isDisabled ? styles.disabled : ''}`}
            onClick={handleUserClick}
        >
            {/* 复选框 */}
            <div
                className={styles.checkbox}
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={(e) => {
                        e.stopPropagation()
                        handleUserSelect(e.target.checked)
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                />
            </div>

            {/* 头像 */}
            <Avatar icon={<UserOutlined />} size="small" />

            {/* 用户信息 */}
            <div className={styles.userInfo}>
                {/* 第一行：用户名 */}
                <div className={styles.userName} title={user?.name || '--'}>
                    {user?.name || '--'}
                </div>
                {/* 第二行：部门图标 + 部门路径 */}
                <div className={styles.userDepartment}>
                    <TeamOutlined className={styles.departmentIcon} />
                    <span className={styles.departmentPath} title={showPath}>
                        {showPath}
                    </span>
                </div>
            </div>
        </div>
    )

    // 如果用户已注册为负责人，显示tooltip提示
    if (isDisabled) {
        return (
            <Tooltip title={__('用户已注册为负责人')} placement="bottom">
                {userItem}
            </Tooltip>
        )
    }

    return userItem
}

export default UserItem
