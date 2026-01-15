import React, { memo, useMemo, useEffect, useRef } from 'react'
import classNames from 'classnames'
import { Line } from '@antv/g2plot'
import styles from './styles.module.less'
import { mockData } from '../mockData'

interface LineCardProps {
    title: string
    className?: string
}

/** 折线图卡片组件 */
const LineCard: React.FC<LineCardProps> = ({ title, className }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const lineIns = useRef<Line>()

    useEffect(() => {
        if (containerRef.current) {
            const line = new Line(containerRef.current, {
                // 数据源
                data: mockData(),
                // 横坐标
                xField: 'date',
                // 纵坐标
                yField: 'value',
                // 系列字段
                seriesField: 'type',
                yAxis: {
                    grid: {
                        line: {
                            style: {
                                lineDash: [4, 2],
                            },
                        },
                    },
                    min: 0,
                    max: 1000,
                    tickCount: 5,
                    tickInterval: 250,
                    label: {
                        formatter: (text: string) => text,
                    },
                },
                xAxis: {
                    label: {
                        formatter: (text: string) => {
                            const date = new Date(text)
                            return `${date.getMonth() + 1}-${date.getDate()}`
                        },
                    },
                },
                legend: {
                    position: 'bottom' as const,
                    itemName: {
                        style: {
                            fontSize: 12,
                        },
                    },
                },
                color: ['#1890ff', '#52c41a'], // 蓝色和绿色
            })

            line.render()
            lineIns.current = line
        }
        return () => {
            lineIns.current?.destroy()
        }
    }, [])

    return (
        <div className={classNames(styles['line-card'], className)}>
            <div className={styles['line-card-header']}>
                <div className={styles.title}>{title}</div>
                <div className={styles.extra}>（展示近7日数据）</div>
            </div>
            <div className={styles['line-card-unit']}>
                <div className={styles.left}>单位：个</div>
                <div className={styles.right}>单位：万条</div>
            </div>
            <div className={styles['line-card-content']}>
                {/* 左侧图表 */}
                <div ref={containerRef} />
                {/* 右侧固定刻度列 */}
                <div className={styles['right-items']}>
                    {[4, 3, 2, 1, 0].map((item) => (
                        <div className={styles['right-items-item']} key={item}>
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default memo(LineCard)
