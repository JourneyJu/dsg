import ProjectManage from '@/components/ProjectManage'
import styles from './styles.module.less'

function Project() {
    return (
        <div className={styles.projectWrapper}>
            <div className={styles.projectTitle}>项目管理</div>
            <ProjectManage />
        </div>
    )
}

export default Project
