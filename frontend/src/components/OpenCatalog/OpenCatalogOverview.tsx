import { useEffect, useMemo, useRef, useState } from 'react'
import { Col, Progress, Row } from 'antd'
import { Column, RingProgress } from '@antv/g2plot'
import styles from './styles.module.less'
import __ from './locale'
import { FontIcon } from '@/icons'
import { formatError, queryOpenCatlgOverview } from '@/core'
import { ResourceType, resourceTypeList } from '../ResourcesDir/const'
import { formatNumber } from '@/utils'
import { Empty } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'

const OpenCatalogOverview = () => {
    const barChartRef = useRef<HTMLDivElement>(null)
    const columnIns = useRef<Column>()

    const [loading, setLoading] = useState(false)
    const [details, setDetails] = useState<any>({})
    // 柱状图相关信息
    const [barChartInfo, setBarChartInfo] = useState<{
        len: number
        width: number
    }>({
        len: 7,
        width: 120,
    })

    useEffect(() => {
        loadData()
    }, [])

    const themeList = useMemo(() => {
        const { catalog_theme_count = [] } = details
        if (!catalog_theme_count) return []
        const maxIndex = 7
        const themeListTemp = catalog_theme_count?.slice(0, maxIndex - 1)
        if (catalog_theme_count?.length < maxIndex) return themeListTemp
        const otherThemeList = catalog_theme_count?.slice(maxIndex - 1)
        const otherThemeProportion = otherThemeList?.reduce(
            (pre, cur) => pre + cur.proportion,
            0,
        )
        return [
            ...themeListTemp,
            {
                id: 'other',
                theme_name: __('其他'),
                proportion: otherThemeProportion,
            },
        ]
    }, [details])

    const loadData = async () => {
        try {
            setLoading(true)
            const res = await queryOpenCatlgOverview()
            setDetails(res || {})
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // if (!details) return
        setLoading(true)

        if (barChartRef.current && details.new_catalog_count?.length) {
            const { new_catalog_count = [] } = details
            // y轴最大值
            const yAxisMaxNum = Math.max(
                ...new_catalog_count.map((item) => item.count),
            )
            const column = new Column(barChartRef.current, {
                // data: details?.new_catalog_count,
                data: new_catalog_count,
                autoFit: true,
                padding: [10, 20, 32, 30],
                appendPadding: [4, 10, 24, 30],
                xField: 'month',
                yField: 'count',
                columnWidthRatio: 0.38,
                columnBackground: {
                    style: { fill: 'transparent' },
                },
                tooltip: {
                    showTitle: false,
                    customContent: (title, datum) => {
                        return `<div style="padding: 12px 8px ; line-height: 1.8; color: rgba(0, 0, 0, 0.45), font-size: 12px">
                            <div>数量： <span style="color:rgba(0, 0, 0, 0.85)"> ${datum?.[0]?.value}个</span></div>
                        </div>`
                    },
                },

                xAxis: {
                    label: {
                        autoRotate: false,
                        formatter: (text) =>
                            (text?.length || 0) > barChartInfo.len
                                ? `${text.slice(0, barChartInfo.len)}...`
                                : text,
                    },
                    line: {
                        style: {
                            stroke: 'rgb(217, 217, 217)',
                            lineWidth: 1,
                            lineDash: [0, 0],
                        },
                    },
                },
                yAxis: {
                    min: 0,
                    max: yAxisMaxNum || 1000,
                    title: {
                        text: '',
                        position: 'center',
                        spacing: 16,
                    },
                    grid: {
                        line: {
                            type: 'line',
                            style: {
                                lineDash: [3, 3],
                                lineWidth: 1,
                                stroke: 'rgb(232, 232, 232)',
                            },
                        },
                    },
                },
                columnStyle: {
                    fill: 'rgb(57, 158, 255)',
                    strokeOpacity: 0,
                },
                // scrollbar: canScroll
                //     ? {
                //           type: 'horizontal',
                //           categorySize: barChartInfo.width,
                //           animate: false,
                //       }
                //     : undefined,
                minColumnWidth: 22,
                maxColumnWidth: 48,
                // 添加 中心统计文本 交互
                interactions: [
                    {
                        type: 'element-highlight',
                    },
                ],
            })

            column?.render()
            columnIns.current = column
        }

        setTimeout(() => {
            setLoading(false)
        }, 500)

        return () => {
            columnIns.current?.destroy()
        }
    }, [details])

    const showNum = (num) => {
        return num || 0
    }

    return (
        <div className={styles.overviewWrapper}>
            <div className={styles.title}>{__('开放目录概览')}</div>
            <div className={styles.countInfoWrapper}>
                <div className={styles.countInfoItem}>
                    <div className={styles.countTitle}>
                        {__('开放目录总数量')}
                    </div>
                    <div className={styles.countValue}>
                        {formatNumber(details.catalog_total_count, true, '0')}
                    </div>
                    <div className={styles.auditingInfoWrapper}>
                        <FontIcon
                            name="icon-a-shenhedaibanxianxing"
                            style={{ fontSize: 16 }}
                        />
                        <div className={styles.auditingInfoText}>
                            {__('审核中')}
                        </div>
                        <div className={styles.auditingInfoValue}>
                            {showNum(details.auditing_catalog_count)}
                        </div>
                    </div>
                </div>
                {details?.type_catalog_count?.map((item, index) => {
                    const resourceType = resourceTypeList?.find(
                        (type) => type.value === item.type,
                    )
                    const strokeColor =
                        resourceType?.value === ResourceType.DataView
                            ? '#52C41B'
                            : resourceType?.value === ResourceType.File
                            ? '#399eff'
                            : '#FF4D4F'
                    return (
                        <div
                            className={styles.countInfoItem}
                            key={`${item.type}`}
                        >
                            <div className={styles.countTitle}>
                                {__('${type}资源目录数量', {
                                    type: resourceType?.label,
                                })}
                            </div>
                            <div className={styles.countValue}>
                                {formatNumber(item.count, true, '0')}
                            </div>
                            <div className={styles.progress}>
                                <Progress
                                    strokeLinecap="butt"
                                    percent={item.proportion}
                                    strokeWidth={6}
                                    strokeColor={strokeColor}
                                    showInfo={false}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className={styles.illustrationWrapper}>
                <Row gutter={[24, 24]}>
                    <Col span={16}>
                        <div className={styles.illustrationItem}>
                            <div className={styles.illustrationTitle}>
                                {__('近一年开放目录新增数量')}
                            </div>
                            <div className={styles.illustrationValue}>
                                {details.new_catalog_count?.length ? (
                                    <div
                                        ref={barChartRef}
                                        style={{
                                            height: '100%',
                                            visibility: loading
                                                ? 'hidden'
                                                : 'visible',
                                        }}
                                    />
                                ) : (
                                    <Empty
                                        desc={__('暂无数据')}
                                        iconSrc={dataEmpty}
                                    />
                                )}
                            </div>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className={styles.rankingList}>
                            <div className={styles.rankingListTitle}>
                                {__('部门提供目录数量 TOP 10')}
                            </div>
                            <div className={styles.rankingListContent}>
                                {details?.department_catalog_count?.length ? (
                                    details?.department_catalog_count?.map(
                                        (item, index) => (
                                            <div
                                                className={
                                                    styles.rankingListContentItem
                                                }
                                                key={item.department_id}
                                            >
                                                <div className={styles.ranking}>
                                                    {index + 1}
                                                </div>
                                                <div
                                                    className={
                                                        styles.rankingName
                                                    }
                                                    title={
                                                        item?.department_name
                                                    }
                                                >
                                                    {item.department_name ||
                                                        '--'}
                                                </div>
                                                <div
                                                    className={
                                                        styles.rankingValue
                                                    }
                                                >
                                                    {formatNumber(
                                                        item.count || 0,
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <Empty
                                        desc={__('暂无数据')}
                                        iconSrc={dataEmpty}
                                    />
                                )}
                            </div>
                        </div>
                    </Col>

                    <Col span={24}>
                        <div className={styles.proportionWrapper}>
                            <div className={styles.proportionTitle}>
                                {__('开放目录主题占比')}
                            </div>

                            <div className={styles.proportionContent}>
                                {/* 主题最多显示7个：前6个主题 + 剩余汇总为其他主题 */}
                                {themeList?.length ? (
                                    themeList?.map((item, index) => {
                                        const isLast =
                                            themeList?.length > 1 &&
                                            index ===
                                                (themeList?.length || 0) - 1
                                        // const sum
                                        return (
                                            <div
                                                className={
                                                    styles.proportionContentItem
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.proportionProgressChart
                                                    }
                                                    id={item.theme_id}
                                                >
                                                    <Progress
                                                        strokeLinecap="butt"
                                                        type="circle"
                                                        percent={
                                                            item.proportion
                                                        }
                                                        width={80}
                                                        strokeWidth={12}
                                                        format={(percent) =>
                                                            `${percent}%`
                                                        }
                                                        strokeColor={
                                                            isLast
                                                                ? '#00D39F'
                                                                : '#5B91FF'
                                                        }
                                                    />
                                                </div>
                                                <div
                                                    className={styles.themeName}
                                                >
                                                    {item.theme_name || '--'}
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className={styles.emptyWrapper}>
                                        <Empty
                                            desc={__('暂无数据')}
                                            iconSrc={dataEmpty}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default OpenCatalogOverview
