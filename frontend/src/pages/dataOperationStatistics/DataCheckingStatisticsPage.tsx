import React from 'react'
import DataStatistics from '../../components/DataOperationStatistics'
import { DataStatisticsType } from '../../components/DataOperationStatistics/const'

const DataCheckingStatisticsPage: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
            <DataStatistics type={DataStatisticsType.VERIFY} />
        </div>
    )
}

export default DataCheckingStatisticsPage
