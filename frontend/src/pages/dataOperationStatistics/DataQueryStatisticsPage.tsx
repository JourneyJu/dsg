import React from 'react'
import DataStatistics from '../../components/DataOperationStatistics'
import { DataStatisticsType } from '../../components/DataOperationStatistics/const'

const DataQueryStatisticsPage: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
            <DataStatistics type={DataStatisticsType.QUERY} />
        </div>
    )
}

export default DataQueryStatisticsPage
