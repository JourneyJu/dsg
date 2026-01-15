import React, { memo } from 'react'
import { Tabs } from 'antd'
import { useNavigate } from 'react-router-dom'
import styles from './styles.module.less'
import __ from './locale'
import { useQuery } from '@/utils'
import { AuditLogType, tabItems } from './helper'
import ManagementLog from './ManagementLog'
import OperationLog from './OperationLog'

/**
 * 审计日志
 */
const AuditLog = () => {
    const navigator = useNavigate()
    const query = useQuery()
    const tab = query.get('tab') || AuditLogType.ManagementLog

    // 切换日志类型
    const handleTabChange = (key) => {
        navigator(`/audit-center?tab=${key}`)
    }

    return (
        <div className={styles.auditLog}>
            <Tabs
                defaultActiveKey={AuditLogType.ManagementLog}
                activeKey={tab}
                onChange={handleTabChange}
                items={tabItems}
            />
            <div className={styles['auditLog-container']}>
                {tab === AuditLogType.ManagementLog && <ManagementLog />}
                {tab === AuditLogType.OperationLog && <OperationLog />}
            </div>
        </div>
    )
}

export default memo(AuditLog)
