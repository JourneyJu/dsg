import React, { useEffect, useRef } from 'react'
import { Column } from '@antv/g2plot'
import { cloneDeep, find, forEach, max } from 'lodash'
import { DemandType } from '@/core'
import { renderEmpty, colorMap, demandTypeMap } from './helper'

// 区间数量
const BIN_COUNT = 5
// 最大刻度数量
const MAX_TICK_COUNT = 6
// 柱状图宽度比例
const COLUMN_WIDTH_RATIO = 0.2
// 柱状图高度
const CHART_HEIGHT = 260

// 根据总天数生成处理时长的区间分组，用于柱状图的横轴显示。
const buildBins = (totalDays: number) => {
    // 计算每个区间的天数
    const binSize = Math.ceil(totalDays / BIN_COUNT)
    const bins: Array<{ label: string; start: number; end: number }> = []
    let start = 1

    // 生成5个区间
    for (let i = 0; i < BIN_COUNT; i += 1) {
        // 计算每个区间的结束天数
        const end = Math.min(totalDays, start + binSize - 1)
        // 将区间信息添加到bins中
        bins.push({ label: `${start}-${end}天`, start, end })
        // 更新开始天数
        start = end + 1
        // 如果开始天数大于总天数，则跳出循环
        if (start > totalDays) break
    }
    return bins
}

// 计算Y轴刻度数量
const calculateTickCount = (maxValue: number): number => {
    // 如果最大值为0，则设置为2
    if (maxValue === 0) return 2
    // 如果最大值为1，则设置为2
    if (maxValue === 1) return 2
    // 如果最大值小于等于3，则设置为最大值+1
    if (maxValue <= 3) return maxValue + 1
    // 如果最大值大于3，则设置为6
    return Math.min(MAX_TICK_COUNT, maxValue + 1)
}

// 初始化聚合数据结构
const initializeAggregation = (
    bins: Array<{ label: string; start: number; end: number }>,
) => {
    // 初始化聚合数据结构
    const agg: Record<string, Record<string, number>> = {}
    // 遍历bins，初始化聚合数据
    forEach(bins, (b) => {
        // 初始化每个区间的数据
        agg[b.label] = {
            // 初始化每个需求类型的数据
            [DemandType.ShareApply]: 0,
            // 初始化供需对接需求的数据
            [DemandType.Require]: 0,
            // 初始化数据分析需求的数据
            [DemandType.DataAnalysis]: 0,
        }
    })
    return agg
}

// 聚合数据到区间
const aggregateData = (
    data: any,
    bins: Array<{ label: string; start: number; end: number }>,
    categories: string[],
    initialAgg: Record<string, Record<string, number>>,
) => {
    const agg = cloneDeep(initialAgg)

    // 遍历数据
    forEach(data?.entries, (entry: any) => {
        // 获取需求类型
        const type = entry.demand_type
        // 如果需求类型不在categories中，则跳过
        if (!categories.includes(type)) return

        // 获取统计信息
        const info = entry.statistic_info || []
        // 遍历统计信息
        forEach(info, (s: any) => {
            // 获取处理天数
            const day = Number(s.process_days)
            // 获取已完成需求数
            const count = Number(s.finished_num) || 0
            // 获取对应的区间
            const bin = find(bins, (b) => day >= b.start && day <= b.end)
            // 如果区间存在，则将已完成需求数累加到对应的区间中
            if (bin) {
                // 累加已完成需求数
                agg[bin.label][type] += count
            }
        })
    })

    return agg
}

// 转换为G2Plot数据格式
const convertToPlotData = (
    bins: Array<{ label: string; start: number; end: number }>,
    categories: string[],
    agg: Record<string, Record<string, number>>,
) => {
    const plotData: Array<{
        bucket: string
        type: string
        value: number
        color: string
    }> = []

    // 遍历bins
    forEach(bins, (b) => {
        // 获取区间标签
        const { label } = b
        // 遍历需求类型
        forEach(categories, (t) => {
            // 将数据添加到plotData中
            plotData.push({
                bucket: label, // 区间标签
                type: demandTypeMap[t as keyof typeof demandTypeMap] || t, // 需求类型
                value: agg[label]?.[t] || 0, // 已完成需求数
                color: colorMap[t as keyof typeof colorMap], // 颜色
            })
        })
    })

    return plotData
}

interface IProcTimeCard {
    // 数据
    data: any
    // 总天数
    totalDays: number
}

const ProcTimeCard: React.FC<IProcTimeCard> = ({ data, totalDays }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const plotRef = useRef<Column | null>(null)

    useEffect(() => {
        if (!data?.entries || !containerRef.current) return

        const bins = buildBins(totalDays)
        const categories = [
            DemandType.ShareApply,
            DemandType.Require,
            DemandType.DataAnalysis,
        ]

        // 数据聚合处理
        const initialAgg = initializeAggregation(bins)
        const agg = aggregateData(data, bins, categories, initialAgg)
        const plotData = convertToPlotData(bins, categories, agg)

        // 计算Y轴刻度
        const maxValue = max(plotData.map((item) => item.value)) || 0
        const tickCount = calculateTickCount(maxValue)

        // 销毁旧图表
        if (plotRef.current) {
            plotRef.current.destroy()
            plotRef.current = null
        }

        // 创建新图表
        const plot = new Column(containerRef.current, {
            data: plotData,
            isGroup: true,
            xField: 'bucket',
            yField: 'value',
            seriesField: 'type',
            legend: { position: 'bottom', marker: { symbol: 'circle' } },
            columnStyle: { radius: [2, 2, 0, 0] },
            color: plotData.map((item) => item.color),
            columnWidthRatio: COLUMN_WIDTH_RATIO,
            tooltip: {
                formatter: (datum: any) => {
                    return { name: datum.type, value: String(datum.value) }
                },
            },
            xAxis: { label: { autoRotate: false } },
            yAxis: {
                tickCount,
                label: {
                    formatter: (value: any) => Math.round(value),
                },
                grid: {
                    line: {
                        style: {
                            stroke: '#f0f0f0',
                            lineWidth: 1,
                            lineDash: [4, 4], // 设置为虚线
                        },
                    },
                },
            },
        })

        plot.render()
        plotRef.current = plot
        // eslint-disable-next-line consistent-return
        return () => {
            if (plotRef.current) {
                plotRef.current.destroy()
                plotRef.current = null
            }
        }
    }, [data, totalDays])

    if (!data?.entries || data.entries.length === 0) return renderEmpty()

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height: CHART_HEIGHT }}
        />
    )
}

export default ProcTimeCard
