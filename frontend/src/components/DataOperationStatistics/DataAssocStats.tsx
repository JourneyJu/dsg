import React, { useEffect, useState, useMemo } from 'react'
import { Space, Row, Col, Statistic } from 'antd'
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import moment from 'moment'
import StatsHeader from './StatsHeader'
import CardLayout from './CardLayout'
import {
    CardDataLabel,
    ContentLayout,
    ItemCardContainer,
    TimeRangeSelector,
    TimeRangeValue,
} from './helper'
import ChartWrapper from './ChartWrapper'
import { formatDeptCallTrendData } from './const'
import styles from './styles.module.less'
import {
    formatError,
    getDeptModelCallStats,
    getDeptUsageTop10,
    getDirectoryUsageStats,
    getModelGrowthStats,
    getSceneAnalysisAssocAuth,
    IDeptModelCallItem,
    IDeptUsageTop10Item,
    IDirectoryUsageStatsItem,
    IModelGrowthStatsItem,
    ISceneAnalysisAssocAuth,
} from '@/core'

const DataAssocStats: React.FC = () => {
    const [timeRangeValue, setTimeRangeValue] = useState<TimeRangeValue>(() => {
        const today = moment()
        return {
            start_date: today.clone().subtract(7, 'day').format('YYYY-MM-DD'),
            end_date: today.clone().subtract(1, 'day').format('YYYY-MM-DD'),
            time_dimension: 'day',
        }
    })

    const [assocAuthData, setAssocAuthData] = useState<ISceneAnalysisAssocAuth>(
        {
            model_total_count: 0,
            growth_rate: 0,
            created_at: '',
            updated_at: '',
        },
    )

    const [deptModelCallStatsData, setDeptModelCallStatsData] = useState<
        IDeptModelCallItem[]
    >([])

    const [deptUsageTop10Data, setDeptUsageTop10Data] = useState<
        IDeptUsageTop10Item[]
    >([])
    const [directoryUsageStatsData, setDirectoryUsageStatsData] = useState<
        IDirectoryUsageStatsItem[]
    >([])

    const [modelGrowthStatsData, setModelGrowthStatsData] = useState<
        IModelGrowthStatsItem[]
    >([])

    useEffect(() => {
        getAssocAuthData()
        getDeptUsageTop10Data()
        getDirectoryUsageStatsData()
        getModelGrowthStatsData()
    }, [])

    const getAssocAuthData = async () => {
        try {
            const res = await getSceneAnalysisAssocAuth()
            setAssocAuthData(res)
        } catch (err) {
            formatError(err)
        }
    }

    useEffect(() => {
        getDeptModelCallStatsData()
    }, [timeRangeValue])

    const getDeptModelCallStatsData = async () => {
        try {
            const res = await getDeptModelCallStats({
                time_dimension: timeRangeValue.time_dimension,
                start_date: timeRangeValue.start_date,
                end_date: timeRangeValue.end_date,
            })
            setDeptModelCallStatsData(res)
        } catch (err) {
            formatError(err)
        }
    }

    /**
     * 获取部门使用统计Top10数据
     */
    const getDeptUsageTop10Data = async () => {
        try {
            const res = await getDeptUsageTop10()
            // 将接口返回数据格式化为 assocStatsMockData.deptUsageData 的格式
            const formattedData = res.flatMap((item) => [
                {
                    dept: item.dept || '',
                    value: item.metaentries_model || 0,
                    type: '元数据模型',
                },
                {
                    dept: item.dept || '',
                    value: item.theme_model || 0,
                    type: '主题模型',
                },
            ])
            setDeptUsageTop10Data(formattedData)
        } catch (err) {
            formatError(err)
        }
    }

    /**
     * 获取目录使用统计数据
     */
    const getDirectoryUsageStatsData = async () => {
        try {
            const res = await getDirectoryUsageStats()
            // 将接口返回数据格式化为 dirUsageStats 的格式
            const formattedData = res.flatMap((item) => [
                {
                    time: item.time || '',
                    type: '元数据模型',
                    value: item.metaentries_model || 0,
                },
                {
                    time: item.time || '',
                    type: '主题模型',
                    value: item.theme_model || 0,
                },
            ])
            setDirectoryUsageStatsData(formattedData)
        } catch (err) {
            formatError(err)
        }
    }

    const getModelGrowthStatsData = async () => {
        try {
            const res = await getModelGrowthStats()
            // 将接口返回数据格式化为 modelGrowthData 的格式
            const formattedData = res.map((item) => ({
                time: item.time || '',
                type: item.type || '',
                value: item.value || 0,
            }))
            setModelGrowthStatsData(formattedData)
        } catch (err) {
            formatError(err)
        }
    }

    // 格式化部门调用趋势数据，使用useMemo监听数据变化
    const [deptCallColumnData, deptCallLineData] = useMemo(() => {
        return formatDeptCallTrendData(deptModelCallStatsData)
    }, [deptModelCallStatsData])

    return (
        <Space
            direction="vertical"
            size="large"
            className={styles.dataAssocContainer}
        >
            {/* <StatsHeader /> */}
            {/* 1. 数据关联模型情况统计 */}
            <ContentLayout title="数据关联模型情况统计" theme="gray">
                <Row gutter={16}>
                    <Col span={6}>
                        <ItemCardContainer title="模型总体数量">
                            <div
                                className={styles.contentItemAssocCountWrapper}
                            >
                                <div className={styles.countWrapper}>
                                    <div className={styles.textWrapper}>
                                        <span className={styles.text}>
                                            {assocAuthData?.model_total_count ||
                                                0}
                                        </span>
                                        <span>个</span>
                                    </div>
                                    <div>
                                        <span>较上月</span>
                                        {(assocAuthData?.growth_rate || 0) ===
                                        0 ? null : (assocAuthData?.growth_rate ||
                                              0) > 0 ? (
                                            <ArrowUpOutlined
                                                style={{
                                                    fontSize: 12,
                                                    color: '#FF4D4F',
                                                }}
                                            />
                                        ) : (
                                            <ArrowDownOutlined
                                                style={{
                                                    fontSize: 12,
                                                    color: '#52C41A',
                                                }} // 上涨为绿色 下降为红色
                                            />
                                        )}
                                        {(assocAuthData?.growth_rate || 0) !==
                                        0 ? (
                                            <span
                                                style={{
                                                    fontSize: 12,
                                                    color: 'rgb(0 0 0 / 65%)',
                                                    marginLeft: 4,
                                                }}
                                            >
                                                {Math.abs(
                                                    assocAuthData?.growth_rate ||
                                                        0,
                                                )}
                                                %
                                            </span>
                                        ) : (
                                            <span
                                                style={{
                                                    fontSize: 12,
                                                    color: 'rgb(0 0 0 / 65%)',
                                                    marginLeft: 4,
                                                }}
                                            >
                                                持平
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ItemCardContainer>
                    </Col>
                    <Col span={18}>
                        <ItemCardContainer title="模型总量与增量趋势">
                            <ChartWrapper
                                type="line"
                                data={modelGrowthStatsData}
                                config={{
                                    xField: 'time',
                                    yField: 'value',
                                    seriesField: 'type',
                                    isStack: true,
                                    smooth: true,
                                }}
                                height={200}
                            />
                        </ItemCardContainer>
                    </Col>
                </Row>
            </ContentLayout>

            {/* 2. 数据关联使用情况统计 */}
            <ContentLayout title="数据关联使用情况统计" theme="gray">
                <div className={styles.contentItemCardWrapper}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <ItemCardContainer title="部门使用排名Top10">
                                <ChartWrapper
                                    type="bar"
                                    data={deptUsageTop10Data}
                                    config={{
                                        xField: 'value',
                                        yField: 'dept',
                                        seriesField: 'type',
                                        isStack: true,
                                        legend: { position: 'top' },
                                        meta: {
                                            value: { alias: '使用次数' },
                                        },
                                    }}
                                />
                            </ItemCardContainer>
                        </Col>
                        <Col span={12}>
                            <ItemCardContainer title="目录使用情况统计">
                                <ChartWrapper
                                    type="column"
                                    data={directoryUsageStatsData}
                                    config={{
                                        xField: 'time',
                                        yField: 'value',
                                        seriesField: 'type',
                                        isStack: true,
                                        legend: { position: 'top' },
                                        meta: {
                                            value: { alias: '使用次数' },
                                        },
                                    }}
                                />
                            </ItemCardContainer>
                        </Col>
                    </Row>
                </div>
            </ContentLayout>

            {/* 3. 数据关联调用情况统计 */}
            <ContentLayout
                title="数据关联调用情况统计"
                theme="gray"
                toolbar={
                    <TimeRangeSelector
                        value={timeRangeValue}
                        onChange={setTimeRangeValue}
                    />
                }
            >
                <ItemCardContainer title="部门调用模型趋势">
                    <ChartWrapper
                        type="dualAxes"
                        data={[deptCallColumnData, deptCallLineData]}
                        config={{
                            xField: 'time',
                            yField: ['value', 'count'],
                            geometryOptions: [
                                {
                                    geometry: 'column',
                                    isStack: true,
                                    seriesField: 'dept',
                                },
                                {
                                    geometry: 'line',
                                    lineStyle: { lineWidth: 2 },
                                    seriesField: 'type',
                                    color: ['#5B8FF9', '#5AD8A6'],
                                },
                            ],
                            legend: { position: 'top' },
                            meta: {
                                value: { alias: '调用量' },
                                count: { alias: '总量' },
                            },
                        }}
                        height={300}
                    />
                </ItemCardContainer>
            </ContentLayout>
        </Space>
    )
}

export default DataAssocStats
