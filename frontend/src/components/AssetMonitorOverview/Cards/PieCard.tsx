import React, { memo, useEffect, useMemo, useRef, useCallback } from 'react'
import { Divider } from 'antd'
import classNames from 'classnames'
import { Pie } from '@antv/g2plot'
import styles from './styles.module.less'
import { formatThousand } from '@/utils/number'
import { DataRangeItems, TabKey } from '../const'
import { transformPieData } from '../helper'

interface PieCardProps {
    title: string
    /** 原始数据，父组件根据 tab 传入对应数据 */
    data?: any[]
    pieTitle: string
    selectedTab: TabKey
    onSelectTab?: (tab: TabKey) => void
}

/** 饼图卡片组件 */
const PieCard: React.FC<PieCardProps> = ({
    title,
    data = [],
    pieTitle,
    selectedTab,
    onSelectTab,
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const pieIns = useRef<Pie>()

    const chartData = useMemo(() => {
        return transformPieData(data || [], selectedTab)
    }, [data, selectedTab])

    // 根据 selectedTab 设置颜色数组
    const colorPalette = useMemo(() => {
        if (selectedTab === TabKey.SubjectGroup) {
            // subjectGroup 模式的配色方案
            return [
                '#8894FF',
                '#3AC4FF',
                '#5B91FF',
                '#FF822F',
                '#FFBA30',
                '#14CEAA',
            ]
        }
        // dataRange 模式的配色方案
        return ['#5B91FF', '#3AC4FF', '#8894FF', '#14CEAA']
    }, [selectedTab])

    const total = useMemo(() => {
        const count = chartData.reduce(
            (acc, item) => acc + (item.value || 0),
            0,
        )
        return formatThousand(count, '0')
    }, [chartData])

    // 统一的中心统计渲染 HTML，避免重复
    const renderStatisticHtml = useCallback(() => {
        return `<div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100%;
              width: 100%;
              text-align: center;
          ">
              <div style="
                  font-size: 12px;
                  color: #78839F;
                  line-height: 1.2;
                  margin-bottom: 4px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  max-width: 100%;
                  font-weight: 400;
                ">${pieTitle}</div>
              <div style="
                  font-size: 20px;
                  color: rgba(0,0,0,0.85);
                  line-height: 1.2;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  font-weight: 550;
                  max-width: 100%;
              }" title="${total}">${total}</div>
          </div>`
    }, [pieTitle, total])

    // 首次创建实例
    useEffect(() => {
        if (!containerRef.current || pieIns.current) return
        const pie = new Pie(containerRef.current, {
            data: chartData,
            // autoFit: true,
            // width: 248,
            height: 180,
            padding: [0, 140, 0, 0],
            angleField: 'value',
            colorField: 'type',
            radius: 1,
            legend: {
                position: 'right',
                offsetX: 16,
                itemName: {
                    formatter: (text: string) => text,
                    style: { fontSize: 12 },
                },
            },
            color: colorPalette,
            innerRadius: 0.75,
            theme: 'custom-theme',
            interactions: [{ type: 'element-active' }],
            label: false,
            statistic: {
                title: false,
                content: {
                    style: {
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        width: '100%',
                    },
                    customHtml: () => renderStatisticHtml(),
                },
            },
            state: {
                active: {
                    style: {
                        lineWidth: 0,
                    },
                },
            },
        })
        pie.render()
        pieIns.current = pie
    }, [chartData, colorPalette, selectedTab, renderStatisticHtml])

    // 数据/样式变化时更新实例（不销毁）
    useEffect(() => {
        if (!pieIns.current) return
        pieIns.current.changeData(chartData)
        pieIns.current.update({
            color: colorPalette,
            statistic: {
                title: false,
                content: {
                    customHtml: () => renderStatisticHtml(),
                },
            },
        })
    }, [chartData, colorPalette, total, selectedTab, renderStatisticHtml])

    // 仅由上面的 effect 负责数据更新，避免重复触发导致图例累加

    const handleSelectTab = (tab: TabKey) => {
        onSelectTab?.(tab)
    }

    return (
        <div className={classNames(styles['pie-card'])}>
            <div className={styles['pie-card-header']}>
                <div className={classNames(styles.title, styles['title-flag'])}>
                    {title}
                </div>
                <div className={styles.extra}>
                    <span
                        className={
                            selectedTab === TabKey.SubjectGroup
                                ? styles.active
                                : ''
                        }
                        onClick={() => handleSelectTab(TabKey.SubjectGroup)}
                    >
                        基础信息
                    </span>
                    <Divider type="vertical" />
                    <span
                        className={
                            selectedTab === TabKey.DataRange
                                ? styles.active
                                : ''
                        }
                        onClick={() => handleSelectTab(TabKey.DataRange)}
                    >
                        目录层级
                    </span>
                </div>
            </div>
            <div
                className={classNames(
                    styles['pie-card-content'],
                    styles.horizontal,
                )}
            >
                <div className={styles['pie-card-content-chart']}>
                    <div ref={containerRef} />
                </div>
            </div>
        </div>
    )
}

export default memo(PieCard)
