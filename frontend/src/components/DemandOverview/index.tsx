import React, { useState, useEffect } from 'react'
import classnames from 'classnames'
import moment from 'moment'
import { Card, Row, Col, Tooltip, DatePicker, Space, message } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import {
    getOverview,
    getApplyStatistic,
    getProcStatistic,
    getProcTimeStatistic,
    IOverviewList,
    IApplyStatisticList,
    IProcStatisticList,
    IProcTimeStatisticList,
    formatError,
} from '@/core'
import {
    renderLoader,
    RenderDemandNumber,
    renderTipIcon,
    TimeRangeButtons,
    TimeRangeType,
    timeRangeMap,
    getStartAndEndTime,
    DemandStatisticType,
    getTotalDays,
    sortEntries,
} from './helper'
import CategoryCard from './CategoryCard'
import styles from './styles.module.less'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import __ from './locale'
import StatusCard from './StatusCard'
import DepartmentCard from './DepartmentCard'
import ProcTimeCard from './ProcTimeCard'

const { RangePicker } = DatePicker

const DemandOverview: React.FC = () => {
    const [loading, setLoading] = useState(false)
    // 需求总数
    const [overview, setOverview] = useState<IOverviewList>()
    // 部门申请统计
    const [applyStatistic, setApplyStatistic] = useState<IApplyStatisticList>()
    // 部门已完成需求统计
    const [procStatistic, setProcStatistic] = useState<IProcStatisticList>()
    // 需求处理时长分布
    const [procTimeStatistic, setProcTimeStatistic] =
        useState<IProcTimeStatisticList>()

    // 当前选择的时间范围
    const [activeTimeRange, setActiveTimeRange] = useState<TimeRangeType>(
        TimeRangeType.month,
    )
    // 控制时间选择器的值
    const [rangePickerValue, setRangePickerValue] = useState<any>(null)

    // 计算总天数
    const getCurrentTotalDays = () => {
        // 自定义时间范围：计算实际天数
        if (activeTimeRange === TimeRangeType.custom && rangePickerValue) {
            const [start, finish] = rangePickerValue
            return getTotalDays(
                Math.floor(start.valueOf()),
                Math.floor(finish.valueOf()),
            )
        }
        // 预设时间范围：直接获取固定天数
        return timeRangeMap[activeTimeRange].days
    }

    // 获取数据
    const fetchData = async () => {
        setLoading(true)
        try {
            const [overviewRes, applyStatisticRes, procStatisticRes] =
                await Promise.all([
                    getOverview(),
                    getApplyStatistic(),
                    getProcStatistic(),
                ])
            // entries 排序：share-apply → require → data-analysis
            if (overviewRes && Array.isArray(overviewRes.entries)) {
                overviewRes.entries = sortEntries(overviewRes.entries)
            }
            setOverview(overviewRes)
            setApplyStatistic(applyStatisticRes)
            setProcStatistic(procStatisticRes)
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    // 获取处理时长分布数据
    const fetchProcTime = async (begin: number, end: number) => {
        try {
            const res = await getProcTimeStatistic({
                begin_time: begin,
                end_time: end,
            })
            if (res && Array.isArray(res.entries)) {
                res.entries = sortEntries(res.entries)
            }
            setProcTimeStatistic(res)
        } catch (error) {
            formatError(error)
        }
    }

    // 首次加载
    useEffect(() => {
        fetchData()
        // 首次加载使用默认的"近一个月"时间范围
        const { begin, end } = getStartAndEndTime(TimeRangeType.month)
        fetchProcTime(begin, end)
    }, [])

    // 自定义时间范围选择
    const onRangeChange = (dates: any) => {
        const [start, finish] = dates || []

        // 如果清除了日期选择（dates 为 null 或空数组）
        if (!dates || !start || !finish) {
            setRangePickerValue(null)
            // 清除后恢复到默认的预设时间（近一个月）
            setActiveTimeRange(TimeRangeType.month)
            const { begin, end } = getStartAndEndTime(TimeRangeType.month)
            fetchProcTime(begin, end)
            return
        }

        // 使用 moment 处理时间，确保开始时间是00:00:00，结束时间是23:59:59
        const startMoment = moment(start).startOf('day') // 开始时间设为00:00:00
        const finishMoment = moment(finish).endOf('day') // 结束时间设为23:59:59

        // 计算时间差（毫秒）
        const timeDiff = finishMoment.valueOf() - startMoment.valueOf()
        const oneMonthMs = 30 * 24 * 60 * 60 * 1000 // 30天的毫秒数
        const oneYearMs = 365 * 24 * 60 * 60 * 1000 // 365天的毫秒数

        // 验证时间范围
        if (timeDiff < oneMonthMs) {
            // 时间差小于一个月，显示错误提示
            message.error(__('时间范围不能少于一个月'))
            // 验证失败时，只保留开始时间，清空结束时间
            // setRangePickerValue([start, null])
            return
        }

        if (timeDiff > oneYearMs) {
            // 时间差大于一年，显示错误提示
            message.error(__('时间范围不能超过一年'))
            // 验证失败时，只保留开始时间，清空结束时间
            // setRangePickerValue([start, null])
            return
        }

        setActiveTimeRange(TimeRangeType.custom)
        setRangePickerValue(dates)

        // 使用 moment 处理后的时间戳
        const begin = Math.floor(startMoment.valueOf())
        const end = Math.floor(finishMoment.valueOf())

        // 仅更新处理时长分布
        fetchProcTime(begin, end)
    }

    // 点击快速选择时间范围
    const onTimeRangeClick = (timeRange: TimeRangeType) => {
        setActiveTimeRange(timeRange)
        setRangePickerValue(null)

        const { begin, end } = getStartAndEndTime(timeRange)
        fetchProcTime(begin, end)
    }

    return loading ? (
        renderLoader()
    ) : (
        <div className={styles.demandOverview}>
            {/* 第一行：3个部分，比例1:2:3 */}
            <Row gutter={[16, 16]} className={styles.overviewRow}>
                <Col span={4}>
                    <Card className={styles.overviewCard}>
                        <div className={styles.cardTotalLine}>
                            <FontIcon
                                className={styles.cardTotalIcon}
                                name="icon-xuqiuzongshu"
                                type={IconType.COLOREDICON}
                            />
                            <RenderDemandNumber
                                title={__('需求总数')}
                                number={overview?.total_num || 0}
                            />
                        </div>
                        <div className={styles.cardProcessLine}>
                            <RenderDemandNumber
                                title={__('已完成需求')}
                                number={overview?.finished_num || 0}
                            />
                            <RenderDemandNumber
                                title={__('处理中需求')}
                                number={overview?.processing_num || 0}
                            />
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card className={styles.overviewCard}>
                        <div className={styles.cardTitle}>{__('需求类别')}</div>
                        <CategoryCard data={overview?.entries || []} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card className={styles.overviewCard}>
                        <div className={styles.cardTitle}>{__('需求状态')}</div>
                        <StatusCard data={overview?.entries || []} />
                    </Card>
                </Col>
            </Row>

            {/* 第二行：2个部分 */}
            <Row gutter={[16, 16]} className={styles.overviewRow}>
                <Col span={12}>
                    <Card
                        className={classnames(
                            styles.overviewCard,
                            styles.largeCard,
                        )}
                    >
                        {renderTipIcon({
                            title: __('部门申请需求统计'),
                            tip: __('统计各部门已申请的需求数占需求总数的比例'),
                        })}
                        <DepartmentCard
                            data={applyStatistic?.entries || []}
                            type={DemandStatisticType.Apply}
                            totalNum={applyStatistic?.total_num || 0}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card
                        className={classnames(
                            styles.overviewCard,
                            styles.largeCard,
                        )}
                    >
                        {renderTipIcon({
                            title: __('部门已完成需求统计'),
                            tip: __('统计各部门需求已完成数量排名情况'),
                        })}
                        <DepartmentCard
                            data={procStatistic?.entries || []}
                            type={DemandStatisticType.Finished}
                            totalNum={procStatistic?.total_num || 0}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 第三行：1个部分 */}
            <Row gutter={[16, 16]} className={styles.overviewRow}>
                <Col span={24}>
                    <Card
                        className={classnames(
                            styles.overviewCard,
                            styles.fullWidthCard,
                        )}
                    >
                        {renderTipIcon({
                            title: __('需求处理时长分布'),
                            tip: __('统计不同处理时长的需求分布情况'),
                        })}
                        <div className={styles.procTimeHeader}>
                            <div className={styles.title}>
                                {__('处理时长分布')}
                            </div>
                            <div className={styles.controls}>
                                <TimeRangeButtons
                                    activeTimeRange={activeTimeRange}
                                    onTimeRangeClick={onTimeRangeClick}
                                />
                                <RangePicker
                                    onChange={onRangeChange}
                                    placeholder={['开始时间', '结束时间']}
                                    className={styles.dateRangePicker}
                                    value={rangePickerValue}
                                />
                                <Tooltip
                                    title={__('请选择需求的开始时间和结束时间')}
                                    placement="topRight"
                                >
                                    <QuestionCircleOutlined
                                        className={styles.helpIcon}
                                    />
                                </Tooltip>
                            </div>
                        </div>
                        <ProcTimeCard
                            data={procTimeStatistic}
                            totalDays={getCurrentTotalDays()}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default DemandOverview
