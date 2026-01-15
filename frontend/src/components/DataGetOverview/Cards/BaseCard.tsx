import React, { memo } from 'react'
import classNames from 'classnames'
import styles from './styles.module.less'
import { formatThousand } from '@/utils/number'

interface BaseCardProps {
    title: string
    count?: number
    /** 顶部右侧拓展 */
    extra?: React.ReactNode
    footer?: React.ReactNode
    className?: string
}

/** 基础卡片组件 */
const BaseCard: React.FC<BaseCardProps> = ({
    title,
    count,
    extra,
    footer,
    className,
}) => {
    return (
        <div className={classNames(styles['base-card'], className)}>
            <div className={styles['base-card-header']}>
                <div className={styles.title}>{title}</div>
                <div className={styles.extra}>{extra}</div>
            </div>
            <div className={styles['base-card-content']}>
                <span title={(count ?? 0)?.toString()}>
                    {formatThousand(count, '0')}
                </span>
            </div>
            <div className={styles['base-card-footer']}>{footer}</div>
        </div>
    )
}

export default memo(BaseCard)
