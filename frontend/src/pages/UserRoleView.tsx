import styles from './styles.module.less'
import UserRoleManage from '@/components/UserRoleManage'
import __ from './locale'

function UserRoleView() {
    return (
        <div className={styles.useRoleWrapper}>
            <UserRoleManage />
        </div>
    )
}

export default UserRoleView
