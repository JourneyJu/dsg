import styles from '../styles.module.less'
import OpenCatalogOverview from '@/components/OpenCatalog/OpenCatalogOverview'

function OpenCatalogOverviewPage() {
    return (
        <div className={styles.rescDirMgnWrapper}>
            <OpenCatalogOverview />
        </div>
    )
}

export default OpenCatalogOverviewPage
