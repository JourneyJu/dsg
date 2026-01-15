import React, { useState } from 'react'

import DataQueryStats from './DataQueryStats'
import DataVerifyStats from './DataVerifyStats'
import DataAssocStats from './DataAssocStats'
import { DataStatisticsType } from './const'
import styles from './styles.module.less'

interface IDataStatistics {
    type: DataStatisticsType
}
const DataStatistics: React.FC<IDataStatistics> = ({ type }) => {
    const getComponent = () => {
        switch (type) {
            case DataStatisticsType.QUERY:
                return <DataQueryStats />
            case DataStatisticsType.VERIFY:
                return <DataVerifyStats />
            case DataStatisticsType.ASSOC:
                return <DataAssocStats />
            default:
                return <div>暂无数据</div>
        }
    }
    return <div className={styles.container}>{getComponent()}</div>
}

export default DataStatistics
