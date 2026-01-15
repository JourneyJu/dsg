import ResourceBlacklist from '@/components/ResourceBlacklist'
import styles from './styles.module.less'
import { ResourcesCatlogProvider } from '@/components/ResourcesDir/ResourcesCatlogProvider'

function ResourceBlacklistPage() {
    return (
        <div className={styles.rescDirMgnWrapper}>
            <ResourcesCatlogProvider>
                <ResourceBlacklist />
            </ResourcesCatlogProvider>
        </div>
    )
}

export default ResourceBlacklistPage
