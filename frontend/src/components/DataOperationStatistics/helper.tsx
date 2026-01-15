import React, { ReactNode, useState, useEffect } from 'react'
import { Radio, Space, DatePicker } from 'antd'
import type { RadioChangeEvent } from 'antd'
import moment from 'moment'
import classNames from 'classnames'
import styles from './styles.module.less'

interface CardDataLabelProps {
    data: {
        total: string | number
        unit: string
        name: string
    }
    style?: React.CSSProperties
}

export const CardDataLabel = ({ data, style }: CardDataLabelProps) => {
    return (
        <div className={styles.cardDataLabelWrapper} style={style}>
            <div className={styles.cardDataLabelContainer}>
                <div className={styles.countContainer}>
                    <div className={styles.count}>
                        {typeof data.total === 'number'
                            ? data.total.toLocaleString()
                            : data.total}
                    </div>
                    <div className={styles.unit}>{data.unit}</div>
                </div>
                <div className={styles.label}>{data.name}</div>
            </div>
        </div>
    )
}

interface ContentLayoutProps {
    title: string
    children: ReactNode
    toolbar?: ReactNode
    theme?: 'white' | 'gray'
}

export const ContentLayout = ({
    title,
    children,
    toolbar,
    theme = 'white',
}: ContentLayoutProps) => {
    return (
        <div
            className={classNames(styles.contentLayoutContainer, {
                [styles['contentLayoutContainer-white']]: theme === 'white',
                [styles['contentLayoutContainer-gray']]: theme === 'gray',
            })}
        >
            <div className={styles.title}>
                <div className={styles.titleText}>{title}</div>
                {toolbar && <div>{toolbar}</div>}
            </div>
            <div>{children}</div>
        </div>
    )
}

interface ItemCardContainerProps {
    title: string
    children: ReactNode
    toolbar?: ReactNode
    height?: number
}
export const ItemCardContainer = ({
    title,
    children,
    toolbar,
    height,
}: ItemCardContainerProps) => {
    return (
        <div
            className={styles.itemCardContainer}
            style={height ? { height: `${height}px` } : undefined}
        >
            <div className={styles.itemCardTitle}>
                <div className={styles.itemCardTitleText}>{title}</div>
                {toolbar && (
                    <div className={styles.itemCardTitleToolbar}>{toolbar}</div>
                )}
            </div>
            <div className={styles.itemCardContent}>{children}</div>
        </div>
    )
}

export interface TimeRangeValue {
    start_date: string // YYYY-MM-DD
    end_date: string // YYYY-MM-DD
    time_dimension: 'day' | 'month' | 'year'
}

interface TimeRangeSelectorProps {
    value?: TimeRangeValue
    onChange?: (value: TimeRangeValue) => void
    className?: string
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
    value,
    onChange,
    className,
}) => {
    const [internalValue, setInternalValue] = useState<TimeRangeValue>(() => {
        const today = moment()
        return {
            start_date: today.clone().subtract(7, 'day').format('YYYY-MM-DD'),
            end_date: today.clone().subtract(1, 'day').format('YYYY-MM-DD'),
            time_dimension: 'day',
        }
    })

    const currentValue = value || internalValue

    const updateValue = (newValue: Partial<TimeRangeValue>) => {
        const updatedValue = { ...currentValue, ...newValue }
        if (!value) {
            setInternalValue(updatedValue)
        }
        onChange?.(updatedValue)
    }

    const handleTimeDimensionChange = (e: RadioChangeEvent) => {
        const timeDimension = e.target.value as 'day' | 'month' | 'year'
        const today = moment()
        let startDate: moment.Moment
        let endDate: moment.Moment

        switch (timeDimension) {
            case 'day':
                startDate = today.clone().subtract(7, 'day')
                endDate = today.clone().subtract(1, 'day')
                break
            case 'month':
                startDate = today.clone().subtract(6, 'month').startOf('month')
                endDate = today.clone().subtract(1, 'month').endOf('month')
                break
            case 'year':
                startDate = today.clone().subtract(5, 'year').startOf('year')
                endDate = today.clone().subtract(1, 'year').endOf('year')
                break
            default:
                startDate = today.clone().subtract(7, 'day')
                endDate = today.clone().subtract(1, 'day')
        }

        updateValue({
            time_dimension: timeDimension,
            start_date: startDate.format('YYYY-MM-DD'),
            end_date: endDate.format('YYYY-MM-DD'),
        })
    }

    const handleDateRangeChange = (dates: any) => {
        if (!dates || dates.length !== 2) return

        const [start, end] = dates
        if (!start || !end) return

        const { time_dimension } = currentValue

        let startDate: moment.Moment
        let endDate: moment.Moment

        switch (time_dimension) {
            case 'day':
                startDate = moment(start).startOf('day')
                endDate = moment(end).endOf('day')
                // 检查天数差是否超过15天
                if (endDate.diff(startDate, 'days') >= 15) {
                    endDate = startDate.clone().add(14, 'days').endOf('day')
                }
                break
            case 'month':
                startDate = moment(start).startOf('month')
                endDate = moment(end).endOf('month')
                // 检查月数差是否超过12个月
                if (endDate.diff(startDate, 'months') >= 12) {
                    endDate = startDate.clone().add(11, 'months').endOf('month')
                }
                break
            case 'year':
                startDate = moment(start).startOf('year')
                endDate = moment(end).endOf('year')
                // 检查年数差是否超过10年
                if (endDate.diff(startDate, 'years') >= 10) {
                    endDate = startDate.clone().add(9, 'years').endOf('year')
                }
                break
            default:
                startDate = moment(start)
                endDate = moment(end)
        }

        updateValue({
            start_date: startDate.format('YYYY-MM-DD'),
            end_date: endDate.format('YYYY-MM-DD'),
        })
    }

    const getPickerProps = () => {
        const today = moment()
        const { time_dimension } = currentValue

        switch (time_dimension) {
            case 'day':
                return {
                    picker: 'date' as const,
                    disabledDate: (current: moment.Moment) => current > today,
                }
            case 'month':
                return {
                    picker: 'month' as const,
                    disabledDate: (current: moment.Moment) => current > today,
                }
            case 'year':
                return {
                    picker: 'year' as const,
                    disabledDate: (current: moment.Moment) => current > today,
                }
            default:
                return {
                    picker: 'date' as const,
                    disabledDate: (current: moment.Moment) => current > today,
                }
        }
    }

    const getRangePickerValue = (): [moment.Moment, moment.Moment] => {
        const { start_date, end_date, time_dimension } = currentValue

        switch (time_dimension) {
            case 'day':
                return [moment(start_date), moment(end_date)]
            case 'month':
                return [
                    moment(start_date).startOf('month'),
                    moment(end_date).endOf('month'),
                ]
            case 'year':
                return [
                    moment(start_date).startOf('year'),
                    moment(end_date).endOf('year'),
                ]
            default:
                return [moment(start_date), moment(end_date)]
        }
    }

    return (
        <Space className={className}>
            <Radio.Group
                value={currentValue.time_dimension}
                onChange={handleTimeDimensionChange}
                size="small"
            >
                <Radio.Button value="day">天</Radio.Button>
                <Radio.Button value="month">月</Radio.Button>
                <Radio.Button value="year">年</Radio.Button>
            </Radio.Group>
            <DatePicker.RangePicker
                {...getPickerProps()}
                value={getRangePickerValue()}
                onChange={handleDateRangeChange}
                className={styles.dateRangePicker}
            />
        </Space>
    )
}
