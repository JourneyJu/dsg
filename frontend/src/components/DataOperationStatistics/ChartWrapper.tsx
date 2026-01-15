import React, { useEffect, useRef, useMemo } from 'react'
import { Pie, Bar, DualAxes, Line, Column } from '@antv/g2plot'

interface ChartWrapperProps {
    type: 'pie' | 'bar' | 'dualAxes' | 'line' | 'column'
    data: any[]
    config: any
    height?: number
    title?: string // 饼图中心显示的标题（仅对 pie 生效）
    unit?: string // 饼图中心显示的单位（仅对 pie 生效）
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
    type,
    data,
    config,
    height = 300,
    title,
    unit,
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<any>(null)

    // 使用 useMemo 来稳定 config 的引用
    const stableConfig = useMemo(() => {
        const baseConfig = {
            data: data || [],
            height,
            ...config,
        }

        // 仅对 pie 类型且传入了 title 时，添加 statistic 配置
        if (type === 'pie' && title !== undefined) {
            baseConfig.statistic = {
                title: {
                    content: title,
                },
            }
        }

        return baseConfig
    }, [data, height, config, type, title, unit])

    const cleanup = () => {
        if (chartRef.current) {
            try {
                chartRef.current.destroy()
            } catch (error) {
                // 静默处理销毁错误，避免控制台污染
            } finally {
                chartRef.current = null
            }
        }
    }

    useEffect(() => {
        if (containerRef.current) {
            // 销毁之前的图表实例
            if (chartRef.current) {
                try {
                    chartRef.current.destroy()
                } catch (error) {
                    // 静默处理销毁错误，避免控制台污染
                } finally {
                    chartRef.current = null
                }
            }

            let ChartClass
            switch (type) {
                case 'pie':
                    ChartClass = Pie
                    break
                case 'bar':
                    ChartClass = Bar
                    break
                case 'dualAxes':
                    ChartClass = DualAxes
                    break
                case 'line':
                    ChartClass = Line
                    break
                case 'column':
                    ChartClass = Column
                    break
                default:
                    return
            }

            chartRef.current = new ChartClass(
                containerRef.current,
                stableConfig,
            )
            chartRef.current.render()
        }

        // eslint-disable-next-line
        return cleanup
    }, [type, stableConfig])

    return <div ref={containerRef} />
}

export default ChartWrapper
