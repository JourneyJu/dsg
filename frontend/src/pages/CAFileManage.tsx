import styles from './styles.module.less'
import CAFileManage from '@/components/CAFileManage'

function CAFileManagePage() {
    return (
        <div className={styles.caFileManageWrapper}>
            <CAFileManage />
        </div>
    )
}

export default CAFileManagePage
