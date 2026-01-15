import { Suspense } from 'react'
import Content from '@/components/ProjectManage/ProjectContent'
import Loader from '@/ui/Loader'
import styles from './styles.module.less'

function ProjectContent() {
    return (
        // <Suspense fallback={<Loader />}>
        <div className={styles.projectContentWrapper}>
            <Content />
        </div>
        // </Suspense>
    )
}

export default ProjectContent
