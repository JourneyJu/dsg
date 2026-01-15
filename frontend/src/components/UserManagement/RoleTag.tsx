import classnames from 'classnames'
import styles from './styles.module.less'
import RoleAvatar from './RoleAvatar'

interface IRoleTag {
    role?: any
    roleGroup?: any
    onClick?: () => void
}

export const RoleTag = ({ role, roleGroup, onClick }: IRoleTag) => {
    return (
        <div
            className={classnames(styles.roleTag, {
                [styles.canClick]: !!onClick,
            })}
            onClick={onClick}
        >
            <RoleAvatar
                role={role}
                roleGroup={roleGroup}
                size={16}
                fontSize={10}
            />
            <span
                className={styles.roleName}
                title={role?.name || roleGroup?.name}
            >
                {role?.name || roleGroup?.name}
            </span>
        </div>
    )
}

export default RoleTag
