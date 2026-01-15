import React from 'react'
import DataStatistics from '../../components/DataOperationStatistics'
import { DataStatisticsType } from '../../components/DataOperationStatistics/const'

const DataAssociationStatisticsPage: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
            <DataStatistics type={DataStatisticsType.ASSOC} />
        </div>
    )
}

export default DataAssociationStatisticsPage
