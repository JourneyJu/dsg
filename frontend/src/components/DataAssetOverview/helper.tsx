import classNames from 'classnames'
import { DatePicker, Progress, Space, Statistic } from 'antd'
import styles from './styles.module.less'
import __ from './locale'
import { FontIcon } from '@/icons'
import { dataPushStatusMap } from './const'

// 统计卡片
export const renderStatisticsCard = (item: any, overviewData: any) => {
    return (
        <div
            key={item.key}
            className={classNames(
                styles.statisticsItem,
                item.key === 'total' && styles.statisticsTotal,
            )}
        >
            <div className={styles.statisticsValue} title={item.value}>
                <Statistic
                    title={item.label}
                    value={item.value}
                    className={styles.statisticsValue}
                />
            </div>
            {item.key === 'total' ? (
                <div className={styles.auditPending}>
                    {/* <FontIcon name="icon-a-shenhedaibanxianxing" /> */}
                    <span className={styles.auditPendingText}>
                        {__('审核中')}
                    </span>
                    {overviewData?.auditing || 0}
                </div>
            ) : (
                <div className={styles.progressContainer}>
                    <div
                        className={styles.divider}
                        style={{
                            background: dataPushStatusMap[item.key].color,
                            left: `${
                                overviewData?.total
                                    ? (item.value / overviewData.total) * 100
                                    : 0
                            }%`,
                        }}
                    />
                    <Progress
                        percent={
                            overviewData?.total
                                ? (item.value / overviewData.total) * 100
                                : 0
                        }
                        showInfo={false}
                        strokeLinecap="butt"
                        trailColor="#F0F2F5"
                        strokeColor={dataPushStatusMap[item.key].color}
                    />
                </div>
            )}
        </div>
    )
}
