import React from 'react'
import { Progress, Tooltip } from 'antd'
import styles from './styles.module.less'
import { DemandStatisticType, formatNumber, renderEmpty } from './helper'
import __ from './locale'

interface IDepartmentCard {
    // 统计类型
    type: DemandStatisticType
    // 数据
    data: any
    // 总数
    totalNum: number
}

// 部门需求统计
const DepartmentCard: React.FC<IDepartmentCard> = ({
    type,
    data,
    totalNum,
}) => {
    if (!data?.length) {
        return renderEmpty(16)
    }

    const renderTooltip = (item) => {
        const { rate, apply_num, finished_num } = item || {}
        if (type === DemandStatisticType.Apply) {
            return (
                <div>
                    <div>
                        {__('已申请需求数占比：')} {rate || 0}%
                    </div>
                    <div>
                        {__('需求总数：')} {formatNumber(totalNum || 0)}
                    </div>
                    <div>
                        {__('已申请需求数：')}
                        {formatNumber(apply_num || 0)}
                    </div>
                </div>
            )
        }
        return (
            <div>
                <div>
                    {__('本部门已完成需求数：')}
                    {formatNumber(finished_num || 0)}
                </div>
                <div>
                    {__('所有部门已完成需求数：')} {formatNumber(totalNum || 0)}
                </div>
            </div>
        )
    }

    const renderHeader = () => {
        if (type === DemandStatisticType.Apply) {
            return (
                <div className={`${styles.listHeader} ${styles.applyHeader}`}>
                    <span> {__('排名')}</span>
                    <span>{__('部门名称')}</span>
                    <span className={styles.headerTextLeft}>
                        {__('申请需求数')}
                    </span>
                    <span className={styles.headerTextLeft}>
                        {__('申请率')}
                    </span>
                </div>
            )
        }
        return (
            <div className={`${styles.listHeader} ${styles.finishedHeader}`}>
                <span>{__('排名')}</span>
                <span>{__('部门名称')}</span>
                <span className={styles.headerTextLeft}>
                    {__('需求完成数')}
                </span>
            </div>
        )
    }

    const renderRowContent = (item, index) => {
        if (type === DemandStatisticType.Apply) {
            return (
                <div className={`${styles.rowTop} ${styles.applyRow}`}>
                    <span
                        className={styles.departmentName}
                        title={item.org_path}
                    >
                        {item.org_name}
                    </span>
                    <span className={styles.applyNum}>
                        {formatNumber(item.apply_num)}
                    </span>
                    <span className={styles.rate}>{item.rate}%</span>
                </div>
            )
        }
        return (
            <div className={`${styles.rowTop} ${styles.finishedRow}`}>
                <span className={styles.departmentName} title={item.org_path}>
                    {item.org_name}
                </span>
                <span className={styles.finishedNum}>
                    {formatNumber(item.finished_num)}
                </span>
            </div>
        )
    }

    const renderProgress = (item) => {
        const percent =
            type === DemandStatisticType.Apply
                ? item.rate
                : (item.finished_num / totalNum) * 100
        return (
            <Tooltip title={renderTooltip(item)}>
                <div className={styles.rowBottom}>
                    <Progress
                        percent={percent}
                        showInfo={false}
                        strokeColor="rgba(58, 160, 255, 1)"
                        trailColor="rgba(240, 241, 243, 1)"
                        size="small"
                    />
                </div>
            </Tooltip>
        )
    }

    return (
        <div className={styles.chartContainer}>
            {renderHeader()}
            <div className={styles.progressList}>
                {data.map((item, index) => (
                    <div
                        key={`${item.org_name}-${index}`}
                        className={styles.progressItem}
                    >
                        <div className={styles.itemLeftRanking}>
                            <span>{index + 1}</span>
                        </div>
                        <div className={styles.itemRightContent}>
                            {renderRowContent(item, index)}
                            {renderProgress(item)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DepartmentCard
