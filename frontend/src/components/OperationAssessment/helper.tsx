import moment from 'moment'
import { Tag } from 'antd'
import classNames from 'classnames'
import { SearchType as SearchTypeLayout } from '@/components/SearchLayout/const'
import __ from './locale'
import { Empty, Loader } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'
import styles from './styles.module.less'
import { AssessmentTargetStatus } from '@/core'

export const StatusListMap = {
    [AssessmentTargetStatus.ToBeEvaluated]: {
        text: __('待评价'),
        backgroundColor: 'rgba(24, 144, 255, 0.2)',
        color: 'rgba(24, 144, 255, 1)',
    },
    [AssessmentTargetStatus.Ended]: {
        text: __('已结束'),
        backgroundColor: 'rgba(255, 77, 79, 0.2)',
        color: 'rgba(255, 77, 79, 1)',
    },
}

export const StatusTag = ({
    status,
    map = StatusListMap,
}: {
    status: any
    map?: any
}) => {
    const { backgroundColor, color, text } = map[status] || {}
    return (
        <Tag
            className={styles.status}
            style={{
                backgroundColor,
                color,
            }}
        >
            {text}
        </Tag>
    )
}

// 双列行
export const MultiColumn = ({
    record,
    onClick,
    firstField = 'name',
    secondField = 'code',
}: {
    record?: any
    onClick?: () => void
    firstField?: string
    secondField?: string
}) => {
    const { [firstField]: first, [secondField]: second, status } = record || {}

    return (
        <div className={styles.multiColumnWrapper}>
            <div className={styles.titleWrapper}>
                <div
                    title={first}
                    className={classNames(
                        styles.columnTitle,
                        onClick && styles.nameClick,
                    )}
                    onClick={onClick}
                >
                    {first}
                </div>
                {[
                    AssessmentTargetStatus.Ended,
                    AssessmentTargetStatus.ToBeEvaluated,
                ].includes(status) && <StatusTag status={status} />}
            </div>
            <div title={second} className={styles.columnSubTitle}>
                {second}
            </div>
        </div>
    )
}

// 将期望完成时间、创建时间调整为时间戳
export const timeStrToTimestamp = (searchObj: any) => {
    const obj: any = {}
    const timeFields = ['start_date', 'end_date']
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in searchObj) {
        if (Object.prototype.hasOwnProperty.call(searchObj, key)) {
            obj[key] = searchObj[key]
                ? timeFields.includes(key)
                    ? moment(searchObj[key]).format('YYYY-MM-DD')
                    : searchObj[key]
                : undefined
        }
    }
    return obj
}

/**
 * 空数据
 */
export const renderEmpty = (marginTop: number = 36) => (
    <Empty
        iconSrc={dataEmpty}
        desc={__('暂无数据')}
        style={{ marginTop, width: '100%' }}
    />
)

/**
 * 加载中
 */
export const renderLoader = (marginTop: number = 104) => (
    <div style={{ marginTop, width: '100%' }}>
        <Loader />
    </div>
)

// 状态映射
export const AssessmentTargetStatusMap = {
    [AssessmentTargetStatus.NoExpired]: {
        text: __('未到期'),
        color: 'rgba(24, 144, 255, 1)',
    },
    [AssessmentTargetStatus.ToBeEvaluated]: {
        text: __('待评价'),
        color: 'rgba(24, 144, 255, 1)',
    },
    [AssessmentTargetStatus.Ended]: {
        text: __('已结束'),
        color: 'rgba(255, 77, 79, 1)',
    },
}

// 状态筛选项
export const AssessmentTargetStatusOptions = [
    {
        value: AssessmentTargetStatus.NoExpired,
        label: AssessmentTargetStatusMap[AssessmentTargetStatus.NoExpired].text,
    },
    {
        value: AssessmentTargetStatus.ToBeEvaluated,
        label: AssessmentTargetStatusMap[AssessmentTargetStatus.ToBeEvaluated]
            .text,
    },
    {
        value: AssessmentTargetStatus.Ended,
        label: AssessmentTargetStatusMap[AssessmentTargetStatus.Ended].text,
    },
]

export const recordSearchFilter = (
    userList: { label: string; value: string }[] = [],
    filterKeys = [
        'target_name',
        'status',
        'responsible_uid',
        'employee_id',
        'plan_time',
    ],
    customProps = {},
) => {
    // 定义所有可用的筛选项配置
    const allFilters = {
        target_name: {
            label: __('目标名称'),
            key: 'target_name',
            type: SearchTypeLayout.Input,
            isAlone: true,
            itemProps: {
                placeholder: __('搜索目标名称'),
            },
        },
        status: {
            label: __('目标状态'),
            key: 'status',
            type: SearchTypeLayout.Select,
            itemProps: {
                options: AssessmentTargetStatusOptions,
                showSearch: false,
                // fieldNames: {
                //     label: 'label',
                //     value: 'value',
                // },
            },
        },
        responsible_uid: {
            label: __('责任人'),
            key: 'responsible_uid',
            type: SearchTypeLayout.Select,
            itemProps: {
                allowClear: true,
                options: userList,
            },
        },
        employee_id: {
            label: __('协作成员'),
            key: 'employee_id',
            type: SearchTypeLayout.Select,
            itemProps: {
                allowClear: true,
                options: userList,
            },
        },
        plan_time: {
            label: __('计划日期'),
            key: 'plan_time',
            type: SearchTypeLayout.RangePicker,
            itemProps: {
                format: 'YYYY-MM-DD',
            },
            startTime: 'start_date',
            endTime: 'end_date',
        },
    }

    // 根据传入的 filterKeys 筛选并合并自定义属性
    return filterKeys
        .map((key) => {
            const baseFilter = allFilters[key]
            if (!baseFilter) return null

            // 合并自定义属性
            if (customProps[key]) {
                return {
                    ...baseFilter,
                    itemProps: {
                        ...baseFilter.itemProps,
                        ...customProps[key],
                    },
                }
            }

            return baseFilter
        })
        .filter(Boolean)
}
