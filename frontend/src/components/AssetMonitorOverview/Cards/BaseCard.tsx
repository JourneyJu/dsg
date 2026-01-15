import React, { memo } from 'react'
import classNames from 'classnames'
import styles from './styles.module.less'
import { formatThousand } from '@/utils/number'

interface BaseCardProps {
    title: string
    count?: number
}

/** 基础卡片组件 */
const BaseCard: React.FC<BaseCardProps> = ({ title, count }) => {
    return (
        <div className={classNames(styles['base-card'])}>
            <div className={styles['base-card-header']}>
                <div className={styles.title}>{title}</div>
            </div>
            <div className={styles['base-card-content']}>
                <span title={(count ?? 0)?.toString()}>
                    {formatThousand(count, '0')}
                </span>
            </div>
        </div>
    )
}

export default memo(BaseCard)
