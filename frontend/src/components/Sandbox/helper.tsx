import React from 'react'
import { Tooltip, Divider, Tag } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import moment from 'moment'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { Empty, Loader } from '@/ui'
import { applyProcessMap, auditStatusListMap, SandboxTab } from './const'
import dataEmpty from '@/assets/dataEmpty.svg'
import styles from './styles.module.less'
import __ from './locale'
import {
    SandboxCreateTypeEnum,
    SandboxExecuteTypeEnum,
    SandboxStatus,
} from '@/core'
import { formatTime } from '@/utils'
import { StatusDot } from '../DataPush/helper'
import { jobStatusMap } from '../DataPush/const'

export const SubTitle: React.FC<{ title: string; subTitle: string }> = ({
    title,
    subTitle,
}) => (
    <div>
        <span>{title}</span>
        <span className={styles.sub_title}>{subTitle}</span>
    </div>
)

export const AuditStatusTag = ({
    auditStatus,
    reason,
}: {
    auditStatus: any
    reason?: string
}) => {
    const { backgroundColor, color, text } =
        auditStatusListMap[auditStatus](SandboxCreateTypeEnum.Apply) || {}
    return (
        <Tag
            className={styles.auditStatus}
            style={{
                backgroundColor,
                color,
            }}
        >
            {text}
            {reason && (
                <Tooltip title={reason} getPopupContainer={() => document.body}>
                    <InfoCircleOutlined
                        className={styles.reasonIcon}
                        color="rgba(230, 0, 18, 1)"
                    />
                </Tooltip>
            )}
        </Tag>
    )
}

/**
 * 申请人 view
 */
export const ContactView: React.FC<{
    data?: any
}> = ({ data }) => {
    const { contact, contact_phone } = data || {}
    return (
        <div className={styles.twoLine}>
            <div title={contact} className={styles.the_one_line}>
                {contact}
            </div>
            <div title={contact_phone} className={styles.the_two_line}>
                {contact_phone}
            </div>
        </div>
    )
}

/**
 * 带圆点状态 view
 */
export const StatusView: React.FC<{
    record: any
    tip?: string
    field?: string
    tab?: SandboxTab
}> = ({ record, tip, field = 'sandbox_status', tab }) => {
    const { text, color } =
        applyProcessMap[record?.[field]]?.(record.operation, tab) || {}
    return (
        <div className={styles.statusView}>
            <div
                className={styles.dot}
                style={{ background: color || 'transparent' }}
            />
            <span className={styles.text}>{text || '--'}</span>
            {tip && (
                <Tooltip title={tip} getPopupContainer={(n) => n}>
                    <FontIcon
                        name="icon-shenheyijian"
                        type={IconType.COLOREDICON}
                        style={{ fontSize: 16 }}
                    />
                </Tooltip>
            )}
        </div>
    )
}

// 状态筛选组件
export const StatusFilter: React.FC<{
    statusOptions: any[]
    selectStatus: SandboxStatus
    onStatusChange: (status: SandboxStatus) => void
}> = ({ statusOptions, selectStatus, onStatusChange }) => {
    return (
        <div className={styles.statusFilter}>
            {statusOptions.map((option, index) => (
                <React.Fragment key={option.status}>
                    <span
                        className={
                            selectStatus === option.status
                                ? styles.selectStatusActive
                                : styles.selectStatus
                        }
                        onClick={() => onStatusChange(option.status)}
                    >
                        {option.label}
                    </span>
                    {index < statusOptions.length - 1 && (
                        <Divider type="vertical" />
                    )}
                </React.Fragment>
            ))}
        </div>
    )
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

// 将期望完成时间、创建时间调整为时间戳
export const timeStrToTimestamp = (searchObj: any) => {
    const obj: any = {}
    const timeFields = [
        'apply_time_end',
        'apply_time_start',
        'create_begin_time',
        'create_end_time',
        'finish_begin_time',
        'finish_end_time',
    ]
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in searchObj) {
        if (Object.prototype.hasOwnProperty.call(searchObj, key)) {
            obj[key] = searchObj[key]
                ? timeFields.includes(key)
                    ? moment(searchObj[key]).valueOf()
                    : searchObj[key]
                : undefined
        }
    }
    return obj
}

export interface IFieldConfig {
    key: string
    label: string
    span: number
    title?: string
    render?: (va: any, record: any) => any
}

export const baseInfoConfig = [
    {
        key: 'project_name',
        label: __('项目名称'),
        span: 24,
    },
    {
        key: 'sandbox_status',
        label: __('状态'),
        span: 12,
        render: (value, record) => {
            return <StatusView record={record} field="execute_status" />
        },
    },
    {
        key: 'total_space',
        label: __('项目空间'),
        span: 12,
        render: (value, record) =>
            __('已使用${used}G（剩余${free}G/总共${total}G）', {
                used: record.used_space || '0',
                free: record.total_space - record.used_space || '0',
                total: record.total_space || '0',
            }),
    },
    {
        key: 'valid_start',
        label: __('有效期'),
        span: 12,
        render: (value, record) =>
            record.valid_start > 0 && record.valid_end > 0
                ? `${formatTime(record.valid_start)} - ${formatTime(
                      record.valid_end,
                  )}`
                : '--',
    },
]

export const expandBaseInfoConfig = [
    {
        key: 'project_name',
        label: __('项目名称'),
        span: 24,
    },
    {
        key: 'name',
        label: __('项目空间'),
        span: 24,
        render: (value, record) =>
            __('已使用${used}G（剩余${free}G/总共${total}G）', {
                used: record.used_space || '0',
                free: record.total_space - record.used_space || '0',
                total: record.total_space || '0',
            }),
    },
]

export const logBaseInfoConfig = [
    {
        key: 'target_table_name',
        label: __('数据集名称'),
        span: 12,
    },
    {
        key: 'sandbox_project_name',
        label: __('所属项目'),
        span: 12,
    },
    {
        key: 'creator_name',
        label: __('操作人'),
        span: 12,
    },
    {
        key: 'status',
        label: __('状态'),
        span: 12,
        render: (value, record) => (
            <StatusDot data={jobStatusMap[record.status]} />
        ),
    },
    {
        key: 'sync_method',
        label: __('执行方式'),
        span: 12,
    },
    {
        key: 'sync_count',
        label: __('推送总数'),
        span: 12,
    },
    {
        key: 'sync_success_count',
        label: __('推送成功数'),
        span: 12,
    },
    {
        key: 'start_time',
        label: __('请求时间'),
        span: 12,
        render: (value, record) => (value ? formatTime(value) : '--'),
    },
    {
        key: 'end_time',
        label: __('完成时间'),
        span: 24,
        render: (value, record) => (value ? formatTime(value) : '--'),
    },
    {
        key: 'push_error',
        label: __('报错信息'),
        span: 12,
    },
]

export const spaceBaseInfoConfig = [
    {
        key: 'project_name',
        label: __('项目名称'),
        span: 12,
    },
    {
        key: 'applicant_name',
        label: __('申请人'),
        span: 12,
    },
    {
        key: 'department_name',
        label: __('所属组织架构'),
        span: 24,
    },
    {
        key: 'total_space',
        label: __('项目空间'),
        span: 24,
        render: (value, record) =>
            __('已使用${used}G（剩余${free}G/总共${total}G）', {
                used: record.used_space || '0',
                free: record.total_space - record.used_space || '0',
                total: record.total_space || '0',
            }),
    },
]

export const impBaseInfoConfig = [
    {
        key: 'project_name',
        label: __('项目名称'),
        span: 24,
    },
    {
        key: 'execute_status',
        label: __('状态'),
        span: 12,
        render: (value, record) => {
            return <StatusView record={record} field="execute_status" />
        },
    },
    {
        key: 'applicant_name',
        label: __('申请人'),
        span: 12,
    },
    {
        key: 'department_name',
        label: __('所属组织架构'),
        span: 12,
    },
    {
        key: 'request_space',
        label: __('期望容量'),
        span: 12,
        render: (val) => `${val}G`,
    },
    {
        key: 'valid_start',
        label: __('有效期'),
        span: 12,
        render: (value, record) =>
            record.valid_start > 0 && record.valid_end > 0
                ? `${formatTime(record.valid_start)} - ${formatTime(
                      record.valid_end,
                  )}`
                : '--',
    },
    {
        key: 'apply_time',
        label: __('申请时间'),
        span: 24,
        render: (value, record) => formatTime(record.apply_time),
    },
    {
        key: 'reason',
        label: __('申请原因'),
        span: 24,
    },
]

export const impInfoConfig = [
    {
        key: 'datasource_name',
        label: __('数据源名称'),
        span: 12,
    },
    {
        key: 'datasource_type_name',
        label: __('数据库类型'),
        span: 12,
    },
    {
        key: 'database_name',
        label: __('表空间名称'),
        span: 12,
    },
    {
        key: 'execute_type',
        label: __('实施方式'),
        span: 12,
        render: (val) =>
            val === SandboxExecuteTypeEnum.Online ? __('线上') : __('线下'),
    },
    {
        key: 'username',
        label: __('沙箱用户名'),
        span: 12,
    },
    {
        key: 'password',
        label: __('沙箱密码'),
        span: 12,
        render: (val) => (val ? atob(val).replace(/./g, '*') : '--'),
    },
    {
        key: 'request_space',
        label: __('沙箱容量'),
        span: 12,
        render: (val) => `${val}G`,
    },
]

export const impResInfoConfig = [
    {
        key: 'operation',
        label: __('实施类型'),
        span: 12,
        render: (val) =>
            val === SandboxCreateTypeEnum.Apply
                ? __('沙箱申请')
                : __('扩容申请'),
    },
    {
        key: 'executed_time',
        label: __('完成时间'),
        span: 12,
        render: (value, record) =>
            record.executed_time && record.executed_time > 0
                ? formatTime(record.executed_time)
                : '--',
    },
    {
        key: 'description',
        label: __('实施说明'),
        span: 12,
    },
]
