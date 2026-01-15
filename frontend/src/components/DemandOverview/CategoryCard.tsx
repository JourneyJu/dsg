import React, { useEffect, useRef } from 'react'
import { Pie } from '@antv/g2plot'
import { IOverviewItem } from '@/core'
import { formatNumber, demandTypeMap, colorMap, renderEmpty } from './helper'
import __ from './locale'

interface ICategoryCard {
    data: IOverviewItem[]
}

const CategoryCard: React.FC<ICategoryCard> = ({ data }) => {
    const chartRef = useRef<HTMLDivElement>(null)
    const plotRef = useRef<Pie | null>(null)

    useEffect(() => {
        if (!chartRef.current || !data || data.length === 0) {
            return
        }

        // 处理数据
        const chartData = data.map((item) => ({
            type: demandTypeMap[item?.demand_type] || item?.demand_type,
            value: item?.total_num,
            rate: item?.rate,
            color: colorMap[item?.demand_type],
        }))

        // 计算总数
        const total = chartData.reduce((sum, item) => sum + item.value, 0)
        // 静态统计标题样式
        const statTitleStyle = {
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '14px',
            color: 'rgba(0, 0, 0, 0.85)',
            fontWeight: 400,
        }

        // 销毁之前的图表
        if (plotRef.current) {
            plotRef.current.destroy()
        }

        // 创建环图
        const ring = new Pie(chartRef.current, {
            data: chartData,
            angleField: 'value',
            colorField: 'type',
            color: chartData.map((item) => item.color),
            radius: 0.8,
            innerRadius: 0.8, // 调细圆环
            label: false,
            padding: [0, 160, 0, 0],
            statistic: {
                title: {
                    style: statTitleStyle,
                    content: formatNumber(total),
                },
                content: {
                    style: {
                        ...statTitleStyle,
                        paddingTop: '4px',
                    },
                    content: __('总数'),
                },
            },
            legend: {
                position: 'right',
                layout: 'vertical',
                itemHeight: 20,
                itemSpacing: 8,
                maxWidth: 240,
                offsetX: -50,
                // 自定义静态图例，禁用点击/筛选
                // custom: true,
                items: chartData.map((d) => ({
                    name: `${d.type}  ${formatNumber(d.value)}  ${d.rate}%`,
                    value: d.type,
                    marker: {
                        symbol: 'circle',
                        style: {
                            fill: d.color,
                        },
                    },
                })),
            },
            tooltip: {
                fields: ['type', 'value', 'rate'], // 显式带上 rate
                formatter: (datum: any) => ({
                    name: datum.type,
                    value: `${formatNumber(datum.value)} (${
                        datum.rate ?? '0.0'
                    }%)`,
                }),
            },
            // 禁用与图例相关的默认交互
            interactions: [
                { type: 'legend-filter', enable: false },
                { type: 'legend-highlight', enable: false },
                { type: 'legend-active', enable: false },
                { type: 'element-active', enable: false },
            ],
        })

        plotRef.current = ring
        ring.render()
        // eslint-disable-next-line consistent-return
        return () => {
            if (plotRef.current) {
                plotRef.current.destroy()
                plotRef.current = null
            }
        }
    }, [data])

    if (!data || (Array.isArray(data) && data.length === 0)) {
        return renderEmpty()
    }

    return (
        <div
            ref={chartRef}
            style={{
                width: '100%',
                height: 120,
            }}
        />
    )
}

export default CategoryCard
