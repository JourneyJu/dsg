import React from 'react'
import { Card, Statistic, StatisticProps } from 'antd'
import styles from './styles.module.less'

interface StatisticCardProps {
    statistic: StatisticProps & {
        description?: React.ReactNode
    }
    style?: React.CSSProperties
}

const StatisticCard: React.FC<StatisticCardProps> = ({ statistic, style }) => {
    const { description, ...statisticProps } = statistic

    return (
        <Card style={style} className={styles.statisticCard}>
            <Statistic {...statisticProps} />
            {description && (
                <div className={styles.statisticDescription}>{description}</div>
            )}
        </Card>
    )
}

export default StatisticCard
