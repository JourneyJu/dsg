import DataCheckingDataDir from '@/components/DataCheckingDataDir'
import { ResourcesCatlogProvider } from '@/components/ResourcesDir/ResourcesCatlogProvider'
import styles from '../styles.module.less'

const DataDirManage = () => {
    return (
        <div className={styles.rescDirMgnWrapper}>
            <ResourcesCatlogProvider>
                <DataCheckingDataDir />
            </ResourcesCatlogProvider>
        </div>
    )
}

export default DataDirManage
