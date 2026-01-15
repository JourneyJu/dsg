import styles from '../styles.module.less'
import OpenCatalogListComp from '@/components/OpenCatalog'

function OpenCatalogList() {
    return (
        <div className={styles.rescDirMgnWrapper}>
            <OpenCatalogListComp />
        </div>
    )
}

export default OpenCatalogList
