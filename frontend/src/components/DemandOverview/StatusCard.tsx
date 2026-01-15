import React, { useMemo } from 'react'
import { Progress } from 'antd'
import { IOverviewItem } from '@/core'
import styles from './styles.module.less'
import { demandTypeMap, formatNumber, renderEmpty } from './helper'
import __ from './locale'

interface IStatusCard {
    data: IOverviewItem[]
}

const StatusCard: React.FC<IStatusCard> = ({ data }) => {
    if (!data?.length) return renderEmpty()

    const renderProgress = (idx: number, item: IOverviewItem) => {
        const { finished_num, processing_num, total_num, demand_type } = item
        const percent =
            total_num > 0 ? Math.min(100, (finished_num / total_num) * 100) : 0

        return (
            <div key={`${demand_type}-${idx}`} className={styles.statusItem}>
                <div className={styles.title}>{demandTypeMap[demand_type]}</div>
                <div className={styles.total}>
                    {formatNumber(total_num || 0)}
                </div>
                <div className={styles.metaRow}>
                    <span>{__('已完成')}</span>
                    <span>{__('处理中')}</span>
                </div>
                <div className={styles.metaRow}>
                    <span>{formatNumber(finished_num)}</span>
                    <span>{formatNumber(processing_num)}</span>
                </div>
                <Progress
                    percent={percent}
                    showInfo={false}
                    strokeColor="rgba(58, 160, 255, 1)"
                    trailColor="rgba(240, 241, 243, 1)"
                />
            </div>
        )
    }

    return (
        <div className={styles.statusCard}>
            {data.map((item, idx) => {
                return renderProgress(idx, item)
            })}
        </div>
    )
}

export default StatusCard
