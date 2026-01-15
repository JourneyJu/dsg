import React, { memo } from 'react'
import classNames from 'classnames'
import styles from './styles.module.less'
import { formatThousand } from '@/utils/number'

interface IconCountCardProps {
    title: string
    data: {
        icon: React.ReactNode
        label: string
        value?: number
    }[]
    extra?: React.ReactNode
    className?: string
}

/** 图标计数卡片组件 */
const IconCountCard: React.FC<IconCountCardProps> = ({
    title,
    data,
    extra,
    className,
}) => {
    return (
        <div className={classNames(styles['icon-count-card'], className)}>
            <div className={styles['icon-count-card-header']}>
                <div className={styles.title}>{title}</div>
                <div className={styles.extra}>{extra}</div>
            </div>
            <div className={styles['icon-count-card-content']}>
                {data?.map((item) => (
                    <div
                        className={styles['icon-count-card-content-item']}
                        key={item.label}
                    >
                        <div
                            className={
                                styles['icon-count-card-content-item-icon']
                            }
                        >
                            {item.icon}
                        </div>
                        <div
                            className={
                                styles['icon-count-card-content-item-value']
                            }
                            title={(item.value ?? 0)?.toString()}
                        >
                            {formatThousand(item.value, '0')}
                        </div>
                        <div
                            className={
                                styles['icon-count-card-content-item-label']
                            }
                        >
                            {item.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default memo(IconCountCard)
