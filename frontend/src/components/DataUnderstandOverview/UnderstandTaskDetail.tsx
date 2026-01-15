import { DatePicker, Modal, Tabs } from 'antd'
import { FC, useEffect, useState } from 'react'
import moment from 'moment'
import __ from './locale'
import styles from './styles.module.less'
import {
    OverviewRangeEnum,
    TaskDataConfig,
    taskStatusOptions,
    TimeRangeEnum,
    timeRangeEnumOptions,
} from './const'

import { formatError, getUnderstandTaskDetail } from '@/core'

interface UnderstandTaskDetailProps {
    activeRange: OverviewRangeEnum
    open: boolean
    onClose: () => void
}
const UnderstandTaskDetail: FC<UnderstandTaskDetailProps> = ({
    activeRange,
    open,
    onClose,
}) => {
    const [activeTimeRange, setActiveTimeRange] = useState(TimeRangeEnum.YEAR)

    const [timeRange, setTimeRange] = useState<any>(moment().startOf('year'))

    const [taskData, setTaskData] = useState<any>([])

    const [params, setParams] = useState<any>({
        my_department: activeRange === OverviewRangeEnum.DEPARTMENT,
        start: moment().startOf(activeTimeRange).format('YYYY-MM-DD HH:mm:ss'),
        end: moment().endOf(activeTimeRange).format('YYYY-MM-DD HH:mm:ss'),
    })

    useEffect(() => {
        setTimeRange(moment().startOf(activeTimeRange))
    }, [activeTimeRange])

    useEffect(() => {
        setParams({
            my_department: activeRange === OverviewRangeEnum.DEPARTMENT,
            start: moment(timeRange)
                .startOf(activeTimeRange)
                .format('YYYY-MM-DD HH:mm:ss'),
            end: moment(timeRange)
                .endOf(activeTimeRange)
                .format('YYYY-MM-DD HH:mm:ss'),
        })
    }, [activeTimeRange, activeRange, timeRange])

    useEffect(() => {
        getTaskData()
    }, [params])

    /**
     * 获取理解任务详情
     */
    const getTaskData = async () => {
        try {
            const res = await getUnderstandTaskDetail(params)
            setTaskData(
                taskStatusOptions.map((item) => ({
                    ...item,
                    value: res.task.find((task) => task.status === item.key)
                        ?.count,
                })),
            )
        } catch (err) {
            formatError(err)
        }
    }

    return (
        <Modal
            width={1000}
            open={open}
            onCancel={onClose}
            footer={null}
            title={__('理解任务详情')}
            maskClosable={false}
        >
            <div className={styles.understandTaskDetail}>
                <Tabs
                    items={timeRangeEnumOptions}
                    onChange={(key) => {
                        setActiveTimeRange(key as TimeRangeEnum)
                    }}
                    activeKey={activeTimeRange}
                />
                <div className={styles.timeRangeContainer}>
                    <DatePicker
                        className={styles.timeRangeInput}
                        picker={activeTimeRange}
                        value={timeRange}
                        onChange={(date) => setTimeRange(date)}
                        allowClear={false}
                    />
                </div>

                <div className={styles.taskDataContainer}>
                    {taskData.map((item: any, index: number) => (
                        <div key={index} className={styles.taskDataItem}>
                            <div className={styles.taskDataItemTitle}>
                                {item.label}
                            </div>
                            <div className={styles.taskDataItemValue}>
                                {item.value || '0'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    )
}

export default UnderstandTaskDetail
