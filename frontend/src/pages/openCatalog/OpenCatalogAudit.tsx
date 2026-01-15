import styles from '../styles.module.less'
import OpenCatalogAuditComp from '@/components/OpenCatalog/AuditList'

function OpenCatalogAudit() {
    return (
        <div className={styles.rescDirMgnWrapper}>
            <OpenCatalogAuditComp />
        </div>
    )
}

export default OpenCatalogAudit
