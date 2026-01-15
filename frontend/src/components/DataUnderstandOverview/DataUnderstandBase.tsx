import { FC, useEffect, useMemo, useState } from 'react'
import { Button, Tooltip, Progress } from 'antd'
import classnames from 'classnames'
import { OverviewRangeEnum } from './const'
import __ from './locale'
import { baseViewCardData } from './mock'
import styles from './styles.module.less'
import UnderstandDepartmentDetail from './UnderstandDepartmentDetail'
import UnderstandTaskDetail from './UnderstandTaskDetail'
import { IDataUnderstandOverviewResult } from '@/core'

interface DataUnderstandBaseProps {
    activeRange: OverviewRangeEnum
    overviewData: IDataUnderstandOverviewResult
}
const DataUnderstandBase: FC<DataUnderstandBaseProps> = ({
    activeRange,
    overviewData,
}) => {
    const [understandDepartmentDetailOpen, setUnderstandDepartmentDetailOpen] =
        useState(false)
    const [understandTaskDetailOpen, setUnderstandTaskDetailOpen] =
        useState(false)

    // 计算完成率，避免除零错误
    const completionRate = useMemo(() => {
        if (
            !overviewData?.view_catalog_count ||
            overviewData.view_catalog_count <= 0
        ) {
            return 0
        }
        const rate =
            (overviewData.view_catalog_understand_count /
                overviewData.view_catalog_count) *
            100
        return Number(rate.toFixed(2))
    }, [
        overviewData?.view_catalog_count,
        overviewData?.view_catalog_understand_count,
    ])

    return (
        <div className={styles.dataUnderstandBase}>
            <div
                className={classnames(styles.baseDataCard, styles.baseViewCard)}
            >
                <div className={styles.baseViewCardHeader}>
                    <span>{__('数据理解部门')}</span>
                    <Button
                        type="link"
                        onClick={() => setUnderstandDepartmentDetailOpen(true)}
                    >
                        {__('详情')}
                    </Button>
                </div>
                <div className={styles.baseViewCardContent}>
                    {overviewData?.department_count?.toLocaleString('en-US')}
                </div>
            </div>
            <div
                className={classnames(styles.baseDataCard, styles.baseViewCard)}
            >
                <div className={styles.baseViewCardHeader}>
                    <span>{__('库表数据目录')}</span>
                </div>
                <div className={styles.baseViewCardContent}>
                    {overviewData?.view_catalog_count?.toLocaleString('en-US')}
                </div>

                <div className={styles.detailDataContainer}>
                    <div>
                        <span>{__('已理解：')}</span>
                        <span>
                            {overviewData?.view_catalog_understand_count?.toLocaleString(
                                'en-US',
                            )}
                        </span>
                    </div>
                    <div>
                        <span>{__('未理解：')}</span>
                        <span>
                            {overviewData?.view_catalog_not_understand_count?.toLocaleString(
                                'en-US',
                            )}
                        </span>
                    </div>
                </div>
                <div className={styles.detailDataProgress}>
                    <Tooltip
                        title={__('已完成${rate}%', {
                            rate: completionRate,
                        })}
                    >
                        <Progress
                            percent={completionRate}
                            showInfo={false}
                            strokeColor="#14CEAA"
                            strokeLinecap="butt"
                        />
                    </Tooltip>
                </div>
            </div>
            <div
                className={classnames(
                    styles.taskCardContainer,
                    styles.baseViewCard,
                )}
            >
                <div className={styles.baseViewCardHeader}>
                    <span className={styles.title}>{__('理解任务')}</span>
                    <Button
                        type="link"
                        onClick={() => setUnderstandTaskDetailOpen(true)}
                    >
                        {__('详情')}
                    </Button>
                </div>
                <div className={styles.baseViewCardContent}>
                    <div className={styles.baseViewCardContentItem}>
                        <div className={styles.baseViewCardContentItemTitle}>
                            {__('理解任务总数')}
                        </div>
                        <div className={styles.baseViewCardContentItemValue}>
                            {overviewData?.understand_task_count?.toLocaleString(
                                'en-US',
                            )}
                        </div>
                    </div>
                    <div className={styles.baseViewCardContentItem}>
                        <div className={styles.baseViewCardContentItemTitle}>
                            {__('未开始')}
                        </div>
                        <div className={styles.baseViewCardContentItemValue}>
                            {overviewData?.understand_task_count === 0
                                ? '0'
                                : overviewData?.understand_task
                                      ?.find((item) => item.status === 1)
                                      ?.count?.toLocaleString('en-US') || '0'}
                        </div>
                    </div>
                    <div className={styles.baseViewCardContentItem}>
                        <div className={styles.baseViewCardContentItemTitle}>
                            {__('已完成')}
                        </div>
                        <div className={styles.baseViewCardContentItemValue}>
                            {overviewData?.understand_task_count === 0
                                ? 0
                                : overviewData?.understand_task
                                      ?.find((item) => item.status === 3)
                                      ?.count?.toLocaleString('en-US') || 0}
                        </div>
                    </div>
                    <div className={styles.baseViewCardContentItem}>
                        <div className={styles.baseViewCardContentItemTitle}>
                            {__('进行中')}
                        </div>
                        <div className={styles.baseViewCardContentItemValue}>
                            {overviewData?.understand_task_count === 0
                                ? 0
                                : overviewData?.understand_task
                                      ?.find((item) => item.status === 2)
                                      ?.count?.toLocaleString('en-US') || 0}
                        </div>
                    </div>
                </div>
            </div>
            {understandDepartmentDetailOpen && (
                <UnderstandDepartmentDetail
                    activeRange={activeRange}
                    open={understandDepartmentDetailOpen}
                    onClose={() => setUnderstandDepartmentDetailOpen(false)}
                />
            )}
            {understandTaskDetailOpen && (
                <UnderstandTaskDetail
                    activeRange={activeRange}
                    open={understandTaskDetailOpen}
                    onClose={() => setUnderstandTaskDetailOpen(false)}
                />
            )}
        </div>
    )
}

export default DataUnderstandBase
