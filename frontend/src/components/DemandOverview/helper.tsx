import { Tooltip } from 'antd'
import { orderBy } from 'lodash'
import moment from 'moment'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { Empty, Loader } from '@/ui'
import styles from './styles.module.less'
import { DemandType } from '@/core'
import __ from './locale'
import dataEmpty from '@/assets/dataEmpty.svg'

// 时间范围类型
export enum TimeRangeType {
    // 近一个月
    month = 'month',
    // 近三个月
    quarter = 'quarter',
    // 近半年
    half = 'half',
    // 自定义
    custom = 'custom',
}

// 时间范围映射
export const timeRangeMap = {
    [TimeRangeType.month]: { label: __('近一个月'), days: 30 },
    [TimeRangeType.quarter]: { label: __('近三个月'), days: 90 },
    [TimeRangeType.half]: { label: __('近半年'), days: 180 },
    [TimeRangeType.custom]: { label: __('自定义'), days: 0 },
}

// 时间范围选项
const timeRangeOption = [
    {
        key: TimeRangeType.month,
        label: timeRangeMap[TimeRangeType.month].label,
    },
    {
        key: TimeRangeType.quarter,
        label: timeRangeMap[TimeRangeType.quarter].label,
    },
    { key: TimeRangeType.half, label: timeRangeMap[TimeRangeType.half].label },
]

// 需求类型映射
export const demandTypeMap = {
    [DemandType.ShareApply]: __('申请共享'),
    [DemandType.Require]: __('供需对接'),
    [DemandType.DataAnalysis]: __('数据分析服务'),
}

// 颜色配置
export const colorMap = {
    [DemandType.ShareApply]: 'rgba(58, 160, 255, 1)',
    [DemandType.Require]: 'rgba(160, 215, 231, 1)',
    [DemandType.DataAnalysis]: 'rgba(140, 123, 235, 1)',
}

// 需求统计类型
export enum DemandStatisticType {
    // 部门申请统计
    Apply = 'apply',
    // 部门已完成需求统计
    Finished = 'finished',
}

/**
 * 数字格式化工具函数
 * 将数字转换为千分位分隔符格式
 * @param num 要格式化的数字
 * @returns 格式化后的字符串
 */
export const formatNumber = (num: number | string): string => {
    // 转换为数字
    const number = typeof num === 'string' ? parseFloat(num) : num

    // 检查是否为有效数字
    if (Number.isNaN(number)) {
        return '0'
    }

    // 使用 toLocaleString 方法添加千分位分隔符
    return number?.toLocaleString('zh-CN')
}

/**
 * 加载状态渲染函数
 * @returns 加载组件
 */
export const renderLoader = (marginTop: number = 104) => (
    <div style={{ marginTop, width: '100%' }}>
        <Loader />
    </div>
)

/**
 * 空数据
 */
export const renderEmpty = (marginTop: number = 8) => (
    <Empty
        iconSrc={dataEmpty}
        desc={__('暂无数据')}
        iconHeight={88}
        style={{ marginTop, width: '100%' }}
    />
)

/**
 * 渲染需求数量
 */
export const RenderDemandNumber = ({
    title,
    number,
}: {
    title: string
    number: number
}) => (
    <div className={styles.demandNumber}>
        <div className={styles.demandNumberTitle}>{title}</div>
        <div title={formatNumber(number)} className={styles.demandNumberValue}>
            {formatNumber(number)}
        </div>
    </div>
)

// 渲染提示图标
export const renderTipIcon = ({
    title,
    tip,
}: {
    title: string
    tip: string
}) => (
    <div className={styles.tipTitleWrapper}>
        {title}
        <Tooltip title={tip} placement="right">
            <QuestionCircleOutlined
                style={{
                    color: 'rgba(0, 0, 0, 0.45)',
                    fontSize: 16,
                    marginLeft: 4,
                }}
            />
        </Tooltip>
    </div>
)

interface TimeRangeButtonsProps {
    activeTimeRange: TimeRangeType
    onTimeRangeClick: (timeRange: TimeRangeType) => void
}

// 时间范围按钮
export const TimeRangeButtons = ({
    activeTimeRange,
    onTimeRangeClick,
}: TimeRangeButtonsProps) => {
    return (
        <div className={styles.presetButtons}>
            {timeRangeOption.map((preset, index) => (
                <span
                    key={preset.key}
                    className={`${styles.presetButton} ${
                        activeTimeRange === preset.key
                            ? styles.active
                            : styles.inactive
                    }`}
                    onClick={() => onTimeRangeClick(preset.key)}
                >
                    {preset.label}
                </span>
            ))}
        </div>
    )
}

// 一天的毫秒数
export const msPerDay = 24 * 60 * 60 * 1000

// 获取开始和结束时间
export const getStartAndEndTime = (timeRange: TimeRangeType) => {
    const now = moment()
    const { days } = timeRangeMap[timeRange]

    const begin = now.clone().subtract(days, 'days').valueOf()
    const end = now.valueOf()

    return { begin, end }
}

// 计算总天数
export const getTotalDays = (beginTime: number, endTime: number) => {
    return Math.max(1, Math.ceil((endTime - beginTime) / msPerDay))
}

// 按需求类型排序
export const sortEntries = <T extends Record<string, any>>(
    entries?: T[] | null,
): T[] => {
    if (!Array.isArray(entries) || entries.length === 0) return []
    const orderIndex: Record<string, number> = {
        [DemandType.ShareApply]: 0,
        [DemandType.Require]: 1,
        [DemandType.DataAnalysis]: 2,
    }
    return orderBy(
        entries,
        [(e: T) => orderIndex[(e as any).demand_type]],
        ['asc'],
    )
}
