import { FC, useEffect, useRef, useState } from 'react'
import { DualAxes } from '@antv/g2plot'
import styles from './styles.module.less'
import __ from './locale'
import { OverviewRangeEnum, XAxisLabelLimit } from './const'
import { DataQualityCard, TitleLabel } from './helper'
import QualityDepartment from './QualityDepartment'
import {
    DepartmentQualityState,
    formatError,
    IDataProcessingOverview,
} from '@/core'

interface IDataQuality {
    dataDetail: IDataProcessingOverview
    activeRange: OverviewRangeEnum
}

// 数据质量
const DataQuality: FC<IDataQuality> = ({ dataDetail, activeRange }) => {
    const [dataQualityData, setDataQualityData] = useState<any[]>([])

    const g2Ref = useRef<HTMLDivElement>(null)

    const [showDetail, setShowDetail] = useState<boolean>(false)

    const [detailFormType, setDetailFormType] = useState<'quality' | 'process'>(
        'quality',
    )

    const dualAxesRef = useRef<any>(null)
    // ... existing code ...
    useEffect(() => {
        if (g2Ref.current) {
            // 格式化数据
            // ... existing code ...
            initG2(dataDetail?.department_quality_status || [])
        }
    }, [])

    useEffect(() => {
        // 格式化数据
        if (dataDetail) {
            setDataQualityData(formatDataQualityData(dataDetail))
            if (dualAxesRef.current) {
                dualAxesRef.current.changeData([
                    formatDepartmentTopData(
                        dataDetail.department_quality_status,
                    ),
                    formatDepartmentTopDaRate(
                        dataDetail.department_quality_status,
                    ),
                ])
            }
        }
    }, [dataDetail])
    // ... existing code ...

    const initG2 = (departmentQualityStatus: Array<DepartmentQualityState>) => {
        try {
            const departmentTopData = formatDepartmentTopData(
                departmentQualityStatus,
            )
            const departmentTopDaRate = formatDepartmentTopDaRate(
                departmentQualityStatus,
            )
            // ... existing code ...
            if (g2Ref.current) {
                dualAxesRef.current = new DualAxes(g2Ref.current, {
                    data: [departmentTopData, departmentTopDaRate],
                    xField: 'departmentName',
                    yField: ['tableCount', 'rate'],
                    meta: {
                        rate: {
                            type: 'linear',
                            min: 0,
                            max: 100,
                            minLimit: 0,
                            /** 严格模式下的定义域最大值，设置后会强制 ticks 已最大值结束 */
                            maxLimit: 100,
                        },
                    },
                    xAxis: {
                        label: {
                            autoRotate: false, // 6 7
                            formatter: (text) =>
                                text?.length > XAxisLabelLimit.len
                                    ? `${text.slice(0, XAxisLabelLimit.len)}...`
                                    : text,
                        },
                    },

                    geometryOptions: [
                        {
                            geometry: 'column',
                            isGroup: true,
                            seriesField: 'type',
                            lineStyle: {
                                lineWidth: 1,
                            },
                            marginRatio: 0,
                            color: ['#5B91FF', '#3AC4FF'],
                            columnWidthRatio: 0.4,
                        },
                        {
                            geometry: 'line',
                            color: '#FFBA30',
                        },
                    ],
                    legend: {
                        visible: true,
                        custom: true,
                        position: 'top',
                        // ... existing code ...
                        // ... existing code ...
                        items: [
                            {
                                value: 'unrepairedTable',
                                name: __('待整改'),
                                marker: {
                                    symbol: 'square',
                                    style: { fill: '#5B91FF', r: 5 },
                                },
                            },
                            {
                                value: 'repairedTable',
                                name: __('已整改'),
                                marker: {
                                    symbol: 'square',
                                    style: { fill: '#3AC4FF', r: 5 },
                                },
                            },
                            {
                                value: 'rate',
                                name: __('整改率'),
                                marker: {
                                    symbol: (x, y, r) => {
                                        return [
                                            ['M', x - r / 2, y],
                                            ['L', x + r / 2, y],
                                        ]
                                    },
                                    style: {
                                        r: 8,
                                        lineWidth: 2,
                                        // square marker 只有填充色，赋给 line 的 stroke
                                        stroke: '#FFBA30',
                                    },
                                },
                            },
                        ],
                    },
                    tooltip: {
                        formatter: (datum: any) => {
                            return {
                                name:
                                    datum?.type === 'unrepairedTable'
                                        ? __('待整改')
                                        : datum.type === 'repairedTable'
                                        ? __('已整改')
                                        : __('整改率'),
                                value:
                                    datum?.tableCount ||
                                    (datum?.rate && `${datum?.rate}%`) ||
                                    '--',
                            }
                        },
                    },

                    // ... existing code ...

                    // ... existing code ...
                })
                // ... existing code ...
                // ... existing code ...
                dualAxesRef.current.render()
            }
        } catch (err) {
            formatError(err)
        }
    }

    /**
     * 柱状图数据格式化
     * @param departmentQualityStatus
     * @returns
     */
    const formatDepartmentTopData = (
        departmentQualityStatus: Array<DepartmentQualityState>,
    ) => {
        const processedTableData = departmentQualityStatus.map((item) => ({
            departmentName: item.department_name,
            tableCount: item.processed_table_count,
            type: 'repairedTable',
        }))

        const unprocessedTableData = departmentQualityStatus.map((item) => ({
            departmentName: item.department_name,
            tableCount: item.question_table_count,
            type: 'unrepairedTable',
        }))

        return [...unprocessedTableData, ...processedTableData]
    }

    /**
     * 线性图整改率数据格式化
     * @param departmentQualityStatus
     * @returns
     */
    const formatDepartmentTopDaRate = (
        departmentQualityStatus: Array<DepartmentQualityState>,
    ) => {
        return departmentQualityStatus.map((item) => {
            return {
                departmentName: item.department_name,
                rate: item.quality_rate
                    ? Number(item.quality_rate).toFixed(2)
                    : 0,
            }
        })
    }

    /**
     * 格式化数据
     * @param details
     * @returns
     */
    const formatDataQualityData = (details: IDataProcessingOverview) => {
        return [
            {
                // 应检测部门
                type: 'shouldCheckDepartment',
                value: details.table_department_count,
                hasDetail: true,
            },
            {
                // 应检测表
                type: 'shouldCheckTable',
                value: details.table_count,
                hasDetail: false,
            },
            {
                // 已检测表
                type: 'checkedTable',
                value: details.qualitied_table_count,
                hasDetail: false,
            },
            {
                // 已整改表
                type: 'repairedTable',
                value: details.processed_table_count,
                hasDetail: false,
            },
            {
                // 问题表
                type: 'problemTable',
                value: details.question_table_count,
                hasDetail: false,
            },
            {
                // 已响应表
                type: 'respondedTable',
                value: details.start_process_table_count,
                hasDetail: false,
            },
            {
                // 整改中表
                type: 'repairingTable',
                value: details.processing_table_count,
                hasDetail: false,
            },
            {
                // 未整改表
                type: 'unrepairedTable',
                value: details.not_process_table_count,
                hasDetail: false,
            },
        ]
    }
    const handleDetail = (detail: any) => {
        setShowDetail(true)
        setDetailFormType('quality')
    }

    const handleDepartmentDetail = () => {
        setDetailFormType('process')
        setShowDetail(true)
    }

    return (
        <div className={styles.dataQualityContainer}>
            <div className={styles.dataQualityTitle}>{__('数据质量')}</div>
            <div className={styles.dataQualityContent}>
                {dataQualityData.map((item, index) => (
                    <DataQualityCard
                        data={item}
                        key={index}
                        onDetail={item.hasDetail ? handleDetail : undefined}
                    />
                ))}
            </div>
            <TitleLabel
                title={__('部门整改情况')}
                description={__('(部门待整改表top10)')}
                onDetail={handleDepartmentDetail}
            />
            <div className={styles.g2Container}>
                <div ref={g2Ref} className={styles.g2} />
                <div className={styles.leftLineTitle}>{__('单位：个')}</div>
                <div className={styles.rightLineTitle}>{__('单位：%')}</div>
            </div>
            {showDetail && (
                <QualityDepartment
                    open={showDetail}
                    onClose={() => setShowDetail(false)}
                    myDepartment={activeRange === OverviewRangeEnum.DEPARTMENT}
                    formType={detailFormType}
                />
            )}
        </div>
    )
}

export default DataQuality
