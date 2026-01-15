import React, { useEffect, useRef, useMemo, useState } from 'react'
import { Col, Row } from 'antd'
import classnames from 'classnames'
import moment from 'moment'
import { sumBy, toNumber } from 'lodash'
import { Column } from '@antv/g2plot'
import BaseCard from '../DataGetOverview/Cards/BaseCard'
import {
    formatError,
    getDataGetOverview,
    getDataAseetsOverview,
    getDataPushOverview,
    getDataPushAnnualStatistics,
    reqRescCatlgOverview,
} from '@/core'
import __ from './locale'
import { renderFooter, transformData } from '../DataGetOverview/helper'
import CountCard from '../DataGetOverview/Cards/CountCard'
import styles from './styles.module.less'
import DepartmentModal from './DepartmentModal'
import TaskModal from '../DataGetOverview/TaskModal'
import { Empty, Loader } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'
import { cancelRequest, formatNumber } from '@/utils'
import { formatData } from './const'
import { renderStatisticsCard } from './helper'
import {
    ColumnPlot,
    StackedColumnPlot,
    rescCatlgStaticsGroupIds,
    catlgUseStaticsList,
    shareStaticsList,
    catlgFedbkStaticsList,
} from '../ResourcesDir/Overview/helper'
import { DataPushStatus } from '../DataPush/const'
import { ColumnMap } from '../DataPush/Overview/g2plotConfig'

const DataAssetOverview: React.FC<any> = () => {
    // 审批统计-柱状图相关信息
    const barChartRef = useRef<HTMLDivElement>(null)
    const catlgFedbkChartRef = useRef<HTMLDivElement>(null)
    const columnIns = useRef<Column>()
    const [data, setData] = useState<any>()
    const [loading, setLoading] = useState(false)
    const [departmentVisible, setDepartmentVisible] = useState(false)
    const [taskVisible, setTaskVisible] = useState(false)
    const [details, setDetails] = useState<any>()
    const [chartData, setChartData] = useState<any>([])
    const [overviewData, setOverviewData] = useState<any>({})

    useEffect(() => {
        getOverviewData()
        getOverview()
        getPushOverview()
        getYearData()
    }, [])

    useEffect(() => {
        if (loading || !details || !barChartRef?.current) return
        const { audit_statics_list = [] } = details
        // 数据资源目录统计-审批统计
        if (audit_statics_list?.length) {
            if (audit_statics_list?.length) {
                const column = StackedColumnPlot(
                    barChartRef?.current,
                    audit_statics_list,
                    {
                        // 分组柱状图 组间的间距 (像素级别)
                        // intervalPadding: 20,
                        // padding: [24, 0, 0, 0],
                        tooltip: {
                            showTitle: false,
                            shared: false,
                            position: 'top',
                            customContent: (title, datum) => {
                                const name = datum?.[0]?.name
                                const num = datum?.[0]?.value || 0
                                const color = datum?.[0]?.color
                                return `<div style="color: #fff; disaply: inline-flex; align-items: center; gap: 16px;padding: 8px 0;line-height: 16px;">
                                        <div style="display: inline-flex; align-items: flex-start;column-gap:8px;word-break:break-all">
                                            <span 
                                                style="width:8px;
                                                min-width:8px; 
                                                height:8px;
                                                margin-top: 4px;
                                                border-radius:50%;
                                                background:${color};
                                                display:${
                                                    color ? '' : 'none'
                                                }"></span>
                                            ${title}${name}
                                        </div>
                                        <span style="margin-left: 8px;"> ${num}</span>
                                    </div>`
                            },
                        },
                        legend: {
                            visible: true,
                            layout: 'horizontal',
                            position: 'top-right',
                            marker: {
                                symbol: 'square',
                            },
                        },
                        color: ['#14CEAA', '#5B91FF', '#F25D5D'],
                    },
                )
                column?.render()
                columnIns.current = column
            }
        }
    }, [loading, details, barChartRef?.current])

    useEffect(() => {
        if (!details || !catlgFedbkChartRef?.current) return
        const { catalog_feedback_count_list = [] } = details
        // 目录反馈统计
        if (
            catlgFedbkChartRef?.current &&
            catalog_feedback_count_list?.length
        ) {
            const fedbkColumn = ColumnPlot(
                catlgFedbkChartRef?.current,
                catalog_feedback_count_list || [],
                {
                    tooltip: {
                        showTitle: false,
                        position: 'top',
                        customContent: (title, datum) => {
                            const num = datum?.[0]?.y_type_count || 0

                            return `<div style="padding: 8px 12px; color: #fff, font-size: 12px; line-height: 16px'">
                                            <div>${title}<span style="margin-left: 8px"> ${datum?.[0]?.value}</span></div>
                                        </div>`
                        },
                    },
                },
            )
            fedbkColumn?.render()
        }
    }, [details, catlgFedbkChartRef?.current])

    // 转换图表数据
    const transformChartData = useMemo(() => {
        if (!chartData.length) {
            return []
        }
        return chartData
            .map((item) => {
                return {
                    name: `${item.month.substr(0, 4)}${__('年')}${
                        item.month.slice(4, 6) < 10
                            ? item.month.slice(5, 6)
                            : item.month.slice(4, 6)
                    }${__('月')}`,
                    value: item.count,
                }
            })
            .reverse()
    }, [chartData])

    // 转换卡片数据
    const statistics = useMemo(() => {
        return [
            {
                label: __('数据推送记录总数'),
                value: 'total',
                key: 'total',
            },
            {
                label: __('待发布'),
                value: 'waiting',
                key: DataPushStatus.Pending,
            },
            {
                label: __('未开始'),
                value: 'starting',
                key: DataPushStatus.NotStarted,
            },
            {
                label: __('进行中'),
                value: 'going',
                key: DataPushStatus.InProgress,
            },
            {
                label: __('已结束'),
                value: 'end',
                key: DataPushStatus.Ended,
            },
            {
                label: __('已停用'),
                value: 'stopped',
                key: DataPushStatus.Stopped,
            },
        ].map((item) => ({
            ...item,
            value: overviewData?.[item.value] || 0,
        }))
    }, [overviewData])

    // 资产总览、归集任务
    const getOverview = async () => {
        try {
            setLoading(true)
            const res = await getDataAseetsOverview()
            const getOverviewRes = await getDataGetOverview({
                my_department: false,
            })
            const { aggregation_task } = transformData(getOverviewRes)
            setData({ ...formatData(res?.entries), aggregation_task })
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    // 数据目录统计 -- 目录统计、审核情况、目录反馈
    const getOverviewData = async () => {
        try {
            setLoading(true)
            const res = await reqRescCatlgOverview()
            const formatRes = {
                ...res,
                // 数据资源目录统计
                audit_statics_list: Object.keys(rescCatlgStaticsGroupIds).map(
                    (key) => {
                        return {
                            ...rescCatlgStaticsGroupIds[key],
                            y_type_count: res?.data_catalog_count?.[key] || 0,
                        }
                    },
                ),
                // 部门提供目录统计-总数
                department_statics_count: sumBy(
                    res?.department_count || [],
                    'count',
                ),
                // 目录共享统计-total
                share_conditional_total: Object.keys(
                    res?.share_conditional || {},
                ).reduce((prev, next) => {
                    return prev + toNumber(res?.share_conditional?.[next] || 0)
                }, 0),
                // 目录共享统计-list
                share_conditional_list: shareStaticsList?.map((item) => {
                    return {
                        ...item,
                        value: res?.share_conditional?.[item.key] || 0,
                    }
                }),
                // 目录使用统计-总数
                catalog_using_count_total: Object.keys(
                    res?.catalog_using_count || {},
                )
                    ?.map((item) => toNumber(res?.catalog_using_count?.[item]))
                    ?.reduce((prev, next) => prev + next, 0),
                // 目录使用统计-list
                catalog_using_count_list: catlgUseStaticsList?.map((item) => {
                    return {
                        ...item,
                        value: res?.catalog_using_count?.[item.type] || 0,
                    }
                }),
                // 目录反馈统计-总数
                catalog_feedback_count_total: Object.keys(
                    res?.catalog_feedback_count || {},
                )
                    ?.map((item) =>
                        toNumber(res?.catalog_feedback_count?.[item]),
                    )
                    ?.reduce((prev, next) => prev + next, 0),
                // 目录反馈统计-list
                catalog_feedback_count_list: catlgFedbkStaticsList?.map(
                    (item) => {
                        return {
                            ...item,
                            value:
                                res?.catalog_feedback_count?.[item.type] || 0,
                        }
                    },
                ),
            }
            setDetails(formatRes)
        } catch (e) {
            formatError(e)
        } finally {
            setLoading(false)
        }
    }

    // 数据推送总览
    const getPushOverview = async () => {
        try {
            setLoading(true)
            cancelRequest('/api/data-catalog/v1/data-push/overview', 'get')
            const res = await getDataPushOverview({
                start_time: moment().subtract(1, 'year').valueOf(),
                end_time: moment().valueOf(),
            })
            setOverviewData(res)
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    // 近一年推送
    const getYearData = async () => {
        try {
            setLoading(true)
            const res = await getDataPushAnnualStatistics()
            setChartData(res)
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles['data-asset-overview']}>
            <div className={styles['data-asset-overview-header']}>
                <div>{__('数据资产概览')}</div>
            </div>
            <div
                hidden={!loading}
                className={styles['data-asset-overview-loader']}
            >
                <Loader />
            </div>
            <div hidden={loading}>
                <Row gutter={16} style={{ marginTop: 20 }}>
                    {/* 资源部门数 */}
                    <Col span={6}>
                        <BaseCard
                            title={__('资源部门数')}
                            count={data?.resource_department}
                            extra={
                                <a
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setDepartmentVisible(true)
                                    }}
                                >
                                    {__('详情')}
                                </a>
                            }
                        />
                    </Col>
                    {/* 信息资源目录 */}
                    <Col span={6}>
                        <BaseCard
                            title={__('信息资源目录')}
                            count={data?.info_resource.total}
                            footer={renderFooter(
                                [
                                    {
                                        label: __('已发布'),
                                        value: data?.info_resource.published,
                                    },
                                    {
                                        label: __('已上线'),
                                        value: data?.info_resource.online,
                                    },
                                ],
                                {
                                    gridTemplateColumns: '1fr 1fr',
                                },
                            )}
                        />
                    </Col>
                    {/* 数据资源目录 */}
                    <Col span={6}>
                        <BaseCard
                            title={__('数据资源目录')}
                            count={data?.data_resource.total}
                            footer={renderFooter(
                                [
                                    {
                                        label: __('已发布'),
                                        value: data?.data_resource.published,
                                    },
                                    {
                                        label: __('已上线'),
                                        value: data?.data_resource.online,
                                    },
                                ],
                                {
                                    gridTemplateColumns: '1fr 1fr',
                                },
                            )}
                        />
                    </Col>
                    {/* 数据资源 */}
                    <Col span={6}>
                        <BaseCard
                            title={__('库表')}
                            count={data?.database.total}
                            footer={renderFooter(
                                [
                                    {
                                        label: __('已发布'),
                                        value: data?.database.published,
                                    },
                                ],
                                {
                                    gridTemplateColumns: '1fr 1fr',
                                },
                            )}
                        />
                    </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={6}>
                        <BaseCard
                            title={__('接口')}
                            className={styles['front-end-item']}
                            count={data?.api.total}
                            footer={renderFooter(
                                [
                                    {
                                        label: __('已发布'),
                                        value: data?.api.published,
                                    },
                                    {
                                        label: __('已上线'),
                                        value: data?.api.online,
                                    },
                                ],
                                {
                                    gridTemplateColumns: '1fr 1fr',
                                },
                            )}
                        />
                    </Col>
                    <Col span={6}>
                        <BaseCard
                            title={__('文件')}
                            className={styles['front-end-item']}
                            count={data?.file.total}
                            footer={renderFooter(
                                [
                                    {
                                        label: __('已发布'),
                                        value: data?.file.published,
                                    },
                                ],
                                {
                                    gridTemplateColumns: '1fr 1fr',
                                },
                            )}
                        />
                    </Col>
                    <Col span={12}>
                        <CountCard
                            title={__('归集任务')}
                            extra={
                                <a
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setTaskVisible(true)
                                    }}
                                >
                                    {__('详情')}
                                </a>
                            }
                            items={[
                                {
                                    label: __('归集任务总数'),
                                    value: data?.aggregation_task
                                        ?.aggregation_total,
                                },
                                {
                                    label: __('已完成'),
                                    value: data?.aggregation_task
                                        ?.aggregation_completed,
                                },
                                {
                                    label: __('未完成'),
                                    value: data?.aggregation_task
                                        ?.aggregation_uncompleted,
                                },
                            ]}
                        />
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                        <div className={styles.catlagCol}>
                            <div className={styles.summaryItemTop}>
                                <div className={styles.summaryItemTitle}>
                                    {__('数据目录统计')}
                                </div>
                            </div>
                            <div className={styles.summaryCountInfo}>
                                <div className={styles.totalCount}>
                                    <div
                                        className={styles.countItemTitle}
                                        title={formatNumber(
                                            details?.data_catalog_count
                                                ?.catalog_count,
                                            false,
                                            '0',
                                        )}
                                    >
                                        {__('数据目录总数')}
                                    </div>
                                    <div className={styles.countItemValue}>
                                        {formatNumber(
                                            details?.data_catalog_count
                                                ?.catalog_count,
                                            false,
                                            '0',
                                        )}
                                    </div>
                                </div>
                                <div className={styles.statusBox}>
                                    <div className={styles.statusCount}>
                                        <div
                                            className={styles.countItem}
                                            title={formatNumber(
                                                details?.data_catalog_count
                                                    ?.publish_catalog_count,
                                                false,
                                                '0',
                                            )}
                                        >
                                            <div
                                                className={
                                                    styles.countItemTitle
                                                }
                                            >
                                                {__('已发布')}：
                                            </div>
                                            <div
                                                className={
                                                    styles.countItemValue
                                                }
                                            >
                                                {formatNumber(
                                                    details?.data_catalog_count
                                                        ?.publish_catalog_count,
                                                    false,
                                                    '0',
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.countItem}>
                                            <div
                                                className={
                                                    styles.countItemTitle
                                                }
                                                title={formatNumber(
                                                    details?.data_catalog_count
                                                        ?.un_publish_catalog_count,
                                                    false,
                                                    '0',
                                                )}
                                            >
                                                {__('未发布')}：
                                            </div>
                                            <div
                                                className={
                                                    styles.countItemValue
                                                }
                                            >
                                                {formatNumber(
                                                    details?.data_catalog_count
                                                        ?.un_publish_catalog_count,
                                                    false,
                                                    '0',
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.statusCount}>
                                        <div
                                            className={classnames(
                                                styles.countItem,
                                                styles.smallCountItem,
                                            )}
                                            title={
                                                details?.data_catalog_count
                                                    ?.notline_catalog_count || 0
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.countItemTitle
                                                }
                                            >
                                                {__('未上线')}：
                                            </div>
                                            <div
                                                className={
                                                    styles.countItemValue
                                                }
                                            >
                                                {details?.data_catalog_count
                                                    ?.notline_catalog_count ||
                                                    0}
                                            </div>
                                        </div>
                                        <div
                                            className={classnames(
                                                styles.countItem,
                                                styles.smallCountItem,
                                            )}
                                            title={
                                                details?.data_catalog_count
                                                    ?.online_catalog_count || 0
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.countItemTitle
                                                }
                                            >
                                                {__('已上线')}：
                                            </div>
                                            <div
                                                className={
                                                    styles.countItemValue
                                                }
                                            >
                                                {details?.data_catalog_count
                                                    ?.online_catalog_count || 0}
                                            </div>
                                        </div>
                                        <div
                                            className={classnames(
                                                styles.countItem,
                                                styles.smallCountItem,
                                            )}
                                            title={
                                                details?.data_catalog_count
                                                    ?.offline_catalog_count || 0
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.countItemTitle
                                                }
                                            >
                                                {__('已下线')}：
                                            </div>
                                            <div
                                                className={
                                                    styles.countItemValue
                                                }
                                            >
                                                {details?.data_catalog_count
                                                    ?.offline_catalog_count ||
                                                    0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.auditStaticsWrapper}>
                                <div className={styles.auditTitle}>
                                    {__('审核情况')}
                                </div>
                                <div className={styles.unit}>
                                    {__('单位：个')}
                                </div>
                                <div
                                    ref={barChartRef}
                                    style={{
                                        height: '300px',
                                        visibility:
                                            loading ||
                                            !details?.audit_statics_list?.length
                                                ? 'hidden'
                                                : 'visible',
                                    }}
                                    hidden={
                                        loading ||
                                        !details?.audit_statics_list?.length
                                    }
                                />
                                <div
                                    hidden={
                                        loading ||
                                        details?.audit_statics_list?.length
                                    }
                                >
                                    <Empty
                                        desc={__('暂无数据')}
                                        iconSrc={dataEmpty}
                                    />
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div className={styles.catlagCol}>
                            <div className={styles.summaryItemTop}>
                                <div className={styles.summaryItemTitle}>
                                    {__('目录反馈统计')}
                                </div>
                            </div>
                            <div
                                className={classnames(
                                    styles.totalCount,
                                    styles.totalCountWid,
                                )}
                            >
                                <div className={styles.countItemTitle}>
                                    {__('目录反馈总数')}
                                </div>
                                <div className={styles.countItemValue}>
                                    {formatNumber(
                                        details?.catalog_feedback_count_total,
                                        false,
                                        '0',
                                    )}
                                </div>
                            </div>
                            <div className={styles.auditTitle}>
                                {__('反馈情况')}
                            </div>
                            <div className={styles.unit}>{__('单位：个')}</div>
                            <div className={styles.summaryItemContentWrapper}>
                                <div
                                    ref={catlgFedbkChartRef}
                                    style={{
                                        height: '260px',
                                        width: '100%',
                                        visibility:
                                            loading ||
                                            !details
                                                ?.catalog_feedback_count_list
                                                ?.length
                                                ? 'hidden'
                                                : 'visible',
                                    }}
                                />
                                <div
                                    hidden={
                                        loading ||
                                        details?.catalog_feedback_count_list
                                            ?.length
                                    }
                                >
                                    <Empty
                                        desc={__('暂无数据')}
                                        iconSrc={dataEmpty}
                                    />
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <div className={styles.statisticsContainer}>
                    <div className={styles.title}>{__('数据推送情况')}</div>
                    <div className={styles.cardContainer}>
                        {statistics.map((item) =>
                            renderStatisticsCard(item, overviewData),
                        )}
                    </div>
                    <div className={styles.chartContainer}>
                        <div className={styles.auditTitle}>
                            {__('近一年推送的数据总量')}
                        </div>
                        {chartData ? (
                            <div style={{ paddingLeft: '8px' }}>
                                <ColumnMap dataInfo={transformChartData} />
                            </div>
                        ) : (
                            <Empty desc={__('暂无数据')} iconSrc={dataEmpty} />
                        )}
                    </div>
                </div>
            </div>

            {departmentVisible && (
                <DepartmentModal
                    visible={departmentVisible}
                    onClose={() => setDepartmentVisible(false)}
                />
            )}
            {taskVisible && (
                <TaskModal
                    isAll
                    visible={taskVisible}
                    onClose={() => setTaskVisible(false)}
                />
            )}
        </div>
    )
}

export default DataAssetOverview
