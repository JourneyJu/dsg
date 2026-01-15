import React, { memo } from 'react'
import classNames from 'classnames'
import styles from './styles.module.less'
import { formatThousand } from '@/utils/number'

interface CountCardProps {
    title: string
    items: {
        label: string
        value?: number
    }[]
    /** 右侧分割线索引 */
    splitIndex?: number[] | null
    /** 顶部右侧拓展 */
    extra?: React.ReactNode
    className?: string
}

const CountCard: React.FC<CountCardProps> = ({
    title,
    items,
    splitIndex = [0],
    extra,
    className,
}) => {
    return (
        <div className={classNames(styles['count-card'], className)}>
            <div className={styles['count-card-header']}>
                <div className={styles.title}>{title}</div>
                <div className={styles.extra}>{extra}</div>
            </div>
            <div className={styles['count-card-content']}>
                {items.map((item, index) => (
                    <div
                        className={classNames(
                            styles['count-card-item'],
                            // 判断 splitIndex 是否为数组，并且包含当前 index
                            Array.isArray(splitIndex) &&
                                splitIndex.includes(index) &&
                                styles['count-card-item-split'],
                        )}
                        key={item.label}
                    >
                        <div className={styles['count-card-item-title']}>
                            {item.label}
                        </div>
                        <div
                            className={styles['count-card-item-count']}
                            title={(item.value ?? 0)?.toString()}
                        >
                            {formatThousand(item.value, '0')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default memo(CountCard)
