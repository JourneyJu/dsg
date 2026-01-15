import React from 'react'
import classnames from 'classnames'
import { Checkbox, Tooltip } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { IRoleGroupItem, IRoleItem } from '@/core'
import styles from './styles.module.less'
import __ from './locale'
import RoleAvatar from '../RoleAvatar'

interface IRoleListItem {
    role?: IRoleItem
    roleGroup?: IRoleGroupItem
    checked?: boolean
    onCheck?: (checked: boolean) => void
    disabled?: boolean
    onRemove?: () => void
    style?: React.CSSProperties
}

const RoleListItem: React.FC<IRoleListItem> = ({
    role,
    roleGroup,
    checked = false,
    onCheck,
    disabled = false,
    onRemove,
    style,
}) => {
    return (
        <div
            className={classnames(styles.roleListItem)}
            onClick={() => onCheck?.(!checked)}
            style={style}
        >
            <div className={styles.roleContent}>
                <RoleAvatar
                    role={role}
                    roleGroup={roleGroup}
                    size={28}
                    fontSize={16}
                />
                <span
                    className={styles.roleName}
                    title={role?.name || roleGroup?.name}
                >
                    {role?.name || roleGroup?.name}
                </span>
            </div>
            {onCheck && (
                <Tooltip title={disabled ? __('已添加此角色') : ''}>
                    <Checkbox
                        checked={checked}
                        onChange={(e) => onCheck?.(e.target.checked)}
                        disabled={disabled}
                    />
                </Tooltip>
            )}
            {onRemove && (
                <CloseOutlined
                    className={styles.removeIcon}
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemove()
                    }}
                />
            )}
        </div>
    )
}

export default RoleListItem
