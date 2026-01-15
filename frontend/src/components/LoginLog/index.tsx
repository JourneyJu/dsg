import React, { memo } from 'react'
import styles from './styles.module.less'
import __ from './locale'
import OperationLog from './OperationLog'

/**
 * 审计日志
 */
const LoginLog = () => {
    return (
        <div className={styles.auditLog}>
            <OperationLog />
        </div>
    )
}

export default memo(LoginLog)
