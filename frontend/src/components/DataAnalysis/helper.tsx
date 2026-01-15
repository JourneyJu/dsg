import { Tooltip, Divider, Tag } from 'antd'
import React, { useState } from 'react'
import { InfoCircleOutlined } from '@ant-design/icons'
import moment from 'moment'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { Empty, Loader } from '@/ui'
import {
    DataAnalRequireStatus,
    DataAnalAuditStatus,
    getAuditLogs,
    getDocAuditBizDetails,
} from '@/core'
import { applyProcessMap, auditStatusListMap } from './const'
import dataEmpty from '@/assets/dataEmpty.svg'
import styles from './styles.module.less'
import __ from './locale'

export const SubTitle: React.FC<{ title: string; subTitle: string }> = ({
    title,
    subTitle,
}) => (
    <div>
        <span>{title}</span>
        <span className={styles.sub_title}>{subTitle}</span>
    </div>
)

// 双列行
export const MultiColumn = ({
    record,
    onClick,
}: {
    record?: any
    onClick?: () => void
}) => {
    const {
        name,
        code,
        audit_status,
        report_reject_reason,
        cancel_reason,
        anal_audit_reject_reason,
        anal_confirm_reject_reason,
        impl_confirm_reject_reason,
        feedback_reject_reason,
        outbound_reject_reason,
        audit_apply_id,
    } = record || {}

    // 根据 audit_status 决定有效的拒绝原因
    let effectiveReason = ''
    if (audit_status === DataAnalAuditStatus.ReportAuditReject) {
        effectiveReason = report_reject_reason || ''
    } else if (audit_status === DataAnalAuditStatus.ReportAuditUndone) {
        effectiveReason = cancel_reason || ''
    } else if (audit_status === DataAnalAuditStatus.AnalysisAuditReject) {
        effectiveReason =
            anal_confirm_reject_reason || anal_audit_reject_reason || ''
    } else if (audit_status === DataAnalAuditStatus.ImplementConfirmReject) {
        effectiveReason = impl_confirm_reject_reason || ''
    } else if (audit_status === DataAnalAuditStatus.FeedbackAuditReject) {
        effectiveReason = feedback_reject_reason || ''
    } else if (audit_status === DataAnalAuditStatus.OutboundAuditReject) {
        effectiveReason = outbound_reject_reason || '--'
    }

    return (
        <div className={styles.multiColumnWrapper}>
            <div className={styles.titleWrapper}>
                <div
                    title={name}
                    className={styles.columnTitle}
                    onClick={onClick}
                >
                    {name}
                </div>
                {audit_status && (
                    <AuditStatusTag
                        auditStatus={audit_status}
                        reason={effectiveReason}
                        auditApplyId={audit_apply_id}
                    />
                )}
            </div>
            <div title={code} className={styles.columnSubTitle}>
                {code}
            </div>
        </div>
    )
}

export const AuditStatusTag = ({
    auditStatus,
    reason,
    auditApplyId = '',
}: {
    auditStatus: any
    reason?: string
    auditApplyId?: string
}) => {
    const [auditorInfo, setAuditorInfo] = useState('')
    const [open, setOpen] = useState(false)
    const getAuditors = async (auditId: string) => {
        if (!auditId) {
            return
        }
        const res = await getDocAuditBizDetails(auditId)
        const logs = await getAuditLogs(res.proc_inst_id)
        const auditors = Array.from(
            new Set(
                logs[logs.length - 1].auditor_logs
                    ?.flat()
                    ?.map((item) => item.auditor_name) || [],
            ),
        )
        setAuditorInfo(`${__('审核人')}：${auditors.join(', ')}`)
        setOpen(true)
    }
    const { backgroundColor, color, text } =
        auditStatusListMap[auditStatus] || {}
    return (
        <Tag
            className={styles.auditStatus}
            style={{
                backgroundColor,
                color,
            }}
        >
            <Tooltip
                open={open}
                placement="bottom"
                title={
                    [
                        DataAnalAuditStatus.AnalysisAuditing,
                        DataAnalAuditStatus.ReportAuditing,
                        DataAnalAuditStatus.FeedbackAuditing,
                        DataAnalAuditStatus.OutboundAuditing,
                    ].includes(auditStatus)
                        ? auditorInfo
                        : ''
                }
            >
                <span
                    onMouseEnter={() => getAuditors(auditApplyId)}
                    onMouseLeave={() => setOpen(false)}
                >
                    {text}
                </span>
            </Tooltip>
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
}> = ({ record, tip }) => {
    const { text, color } = applyProcessMap[record?.status] || {}
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
    selectStatus: DataAnalRequireStatus
    onStatusChange: (status: DataAnalRequireStatus) => void
    showCount?: boolean
    countArray?: number[]
}> = ({
    statusOptions,
    selectStatus,
    onStatusChange,
    showCount = false,
    countArray,
}) => {
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
                    {showCount &&
                        countArray?.[index] &&
                        `(${countArray[index]})`}
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
        'create_begin_time',
        'create_end_time',
        'finish_begin_time',
        'finish_end_time',
        'anal_audit_begin_time',
        'anal_audit_end_time',
        'impl_begin_time',
        'impl_end_time',
        'close_begin_time',
        'close_end_time',
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
