import styles from '../styles.module.less'
import ApplicationOverview from '@/components/ApplicationOverview'
import __ from '../locale'

function ApplicationOverviewView() {
    return (
        <div className={styles.useRoleWrapper}>
            <ApplicationOverview />
        </div>
    )
}

export default ApplicationOverviewView
