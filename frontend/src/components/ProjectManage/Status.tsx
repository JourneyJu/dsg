import React, { useState } from 'react'
import classnames from 'classnames'
import { ProjectStatus } from './types'
import { statusInfo, statusNextInfo } from './const'
import styles from './styles.module.less'
import { useUserPermCtx } from '@/context/UserPermissionProvider'

interface IStatus {
    status: ProjectStatus
    fontSize?: number
    onSelect?: () => void
}
const Status: React.FC<IStatus> = ({ status, fontSize, onSelect }) => {
    const { checkPermission } = useUserPermCtx()
    const [isHover, setIsHover] = useState(false)

    return (
        <div
            className={styles.statusWrapper}
            onClick={() => {
                if (status === ProjectStatus.COMPLETED) return
                if (checkPermission('manageDataOperationProject')) {
                    onSelect?.()
                }
            }}
        >
            <div
                className={classnames(
                    styles[statusInfo[status].class],
                    isHover &&
                        statusNextInfo[status] &&
                        styles[statusNextInfo[status].class],
                )}
                style={{ fontSize }}
                onFocus={() => {}}
                onMouseOver={() => {
                    if (checkPermission('manageDataOperationProject')) {
                        setIsHover(true)
                    }
                }}
                onMouseLeave={() => {
                    setIsHover(false)
                }}
            >
                {isHover && statusNextInfo[status]
                    ? statusNextInfo[status].text
                    : statusInfo[status].text}
            </div>
        </div>
    )
}

export default Status
