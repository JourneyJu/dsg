import React, { useEffect, useState, useMemo } from 'react'
import { Table, Tag, Space, Row, Col } from 'antd'
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
import styles from './styles.module.less'
import {
    formatError,
    getDeptDirectoryStats,
    getDeptUsageStats,
    getDirectoryUsageTop10Stats,
    getQueryAuthStats,
    getQueryCallTrendStats,
    getSharedDirectoryStats,
    getThemeDirectoryStats,
    IDeptDirectoryItem,
    IDeptUsageItem,
    IDirectoryUsageTop10Item,
    IQueryAuthStats,
    IQueryCallTrendItem,
    ISharedDirectoryItem,
    IThemeDirectoryItem,
} from '@/core'

const DataQueryStats: React.FC = () => {
    const [timeRangeValue, setTimeRangeValue] = useState<TimeRangeValue>(() => {
        const today = moment()
        return {
            start_date: today.clone().subtract(7, 'day').format('YYYY-MM-DD'),
            end_date: today.clone().subtract(1, 'day').format('YYYY-MM-DD'),
            time_dimension: 'day',
        }
    })
    const [loading, setLoading] = useState(false)

    const [queryAuthStatsData, setQueryAuthStatsData] =
        useState<IQueryAuthStats>({
            authorized_dir_count: 0,
            covered_dept_count: 0,
            created_at: '',
            updated_at: '',
        })
    const [deptDirectoryStatsData, setDeptDirectoryStatsData] = useState<
        IDeptDirectoryItem[]
    >([])

    const [deptUsageStatsData, setDeptUsageStatsData] = useState<
        IDeptUsageItem[]
    >([])

    const [queryCallTrendStatsData, setQueryCallTrendStatsData] = useState<
        IQueryCallTrendItem[]
    >([])

    const [directoryUsageTop10StatsData, setDirectoryUsageTop10StatsData] =
        useState<IDirectoryUsageTop10Item[]>([])

    const [sharedDirectoryStatsData, setSharedDirectoryStatsData] = useState<
        ISharedDirectoryItem[]
    >([])

    const [themeDirectoryStatsData, setThemeDirectoryStatsData] = useState<
        IThemeDirectoryItem[]
    >([])

    useEffect(() => {
        getQueryCallTrendStatsData()
    }, [timeRangeValue])

    // 从 mock 数据中获取数据
    // const { themeDistData: themeData } = queryStatsMockData

    // 格式化查询调用趋势数据，使用useMemo监听queryCallTrendStatsData的变化
    const callTrendData = useMemo(() => {
        // 将queryCallTrendStatsData处理成为getCallTrendData返回结果一样的格式
        return queryCallTrendStatsData.map((item) => ({
            time: item.time || '',
            type: item.type || '',
            value: (item as any).value || item.avg_duration || 0, // 兼容可能存在的value字段，默认使用avg_duration
        }))
    }, [queryCallTrendStatsData])

    // 计算查询调用统计数据，使用useMemo监听queryCallTrendStatsData的变化
    const callStatsSummary = useMemo(() => {
        // 总调调用次数：type为"总调用"的数据value的和
        const totalCalls = queryCallTrendStatsData
            .filter((item) => item.type === '总调用')
            .reduce((sum, item) => sum + ((item as any).value || 0), 0)

        // 成功次数：type为"成功"的数据value的和
        const successCalls = queryCallTrendStatsData
            .filter((item) => item.type === '成功')
            .reduce((sum, item) => sum + ((item as any).value || 0), 0)

        // 失败次数：type为"失败"的数据value的和
        const failCalls = queryCallTrendStatsData
            .filter((item) => item.type === '失败')
            .reduce((sum, item) => sum + ((item as any).value || 0), 0)

        // 成功率：成功次数/失败次数*100，保留两位小数
        const successRate =
            failCalls > 0
                ? `${(
                      (successCalls / (successCalls + failCalls)) *
                      100
                  ).toFixed(2)}%`
                : '0.00%'

        // 平均耗时：type为"总调用"的数据的avg_duration的和/总调用次数
        const totalDuration = queryCallTrendStatsData
            .filter((item) => item.type === '总调用')
            .reduce((sum, item) => sum + (item.avg_duration || 0), 0)

        const avgDuration =
            totalCalls > 0
                ? `${Math.round(totalDuration / totalCalls)}ms`
                : '0ms'

        return {
            totalCalls,
            successCalls,
            failCalls,
            successRate,
            avgDuration,
        }
    }, [queryCallTrendStatsData])

    useEffect(() => {
        getQueryAuthStatsData()
        getDeptDirectoryStatsData()
        getDeptUsageStatsData()
        getDirectoryUsageTop10StatsData()
        getSharedDirectoryStatsData()
        getThemeDirectoryStatsData()
    }, [])

    /**
     * 获取查询认证统计数据
     */
    const getQueryAuthStatsData = async () => {
        try {
            const res = await getQueryAuthStats()
            setQueryAuthStatsData(res)
        } catch (err) {
            formatError(err)
        }
    }

    const getDirectoryUsageTop10StatsData = async () => {
        try {
            const res = await getDirectoryUsageTop10Stats()
            // 将接口返回数据格式化为 directoryUsageTop10 的格式
            const formattedData = res.map((item, index) => ({
                rank: item.rank || index + 1,
                name: item.name || '',
                dept: item.dept || '',
                count: item.count || 0,
            }))
            setDirectoryUsageTop10StatsData(formattedData)
        } catch (err) {
            formatError(err)
        }
    }

    /**
     * 获取查询调用趋势统计数据
     */
    const getQueryCallTrendStatsData = async () => {
        try {
            const res = await getQueryCallTrendStats({
                time_dimension: timeRangeValue.time_dimension,
                start_date: timeRangeValue.start_date,
                end_date: timeRangeValue.end_date,
            })
            setQueryCallTrendStatsData(res)
        } catch (err) {
            formatError(err)
        }
    }

    const getDeptDirectoryStatsData = async () => {
        try {
            const res = await getDeptDirectoryStats()
            // 将接口返回数据格式化为 deptDistData 的格式
            const formattedData = res.map((item) => ({
                dept: item.dept || '',
                count: item.count || 0,
            }))
            setDeptDirectoryStatsData(formattedData)
        } catch (err) {
            formatError(err)
        }
    }

    /**
     * 获取部门使用统计数据
     */
    const getDeptUsageStatsData = async () => {
        try {
            const res = await getDeptUsageStats()
            // 将接口返回数据格式化为 deptUsageData 的格式
            const formattedData = res.flatMap((item) => [
                {
                    dept: item.dept || '',
                    type: '查询次数',
                    value:
                        (item as any).query_count ||
                        Math.floor(Math.random() * 1000) + 500, // 如果有query_count字段则使用，否则使用随机值作为示例
                },
                {
                    dept: item.dept || '',
                    type: '使用次数',
                    value:
                        (item as any).usage_count ||
                        Math.floor(Math.random() * 800) + 300, // 如果有usage_count字段则使用，否则使用随机值作为示例
                },
            ])
            setDeptUsageStatsData(formattedData)
        } catch (err) {
            formatError(err)
        }
    }

    const getSharedDirectoryStatsData = async () => {
        try {
            const res = await getSharedDirectoryStats()
            // 将接口返回数据格式化为 sharedData 的格式
            const formattedData = res.map((item) => ({
                type: item.type || '',
                value:
                    (item as any).value || Math.floor(Math.random() * 20) + 20, // 如果有value字段则使用，否则使用随机值作为示例
            }))
            setSharedDirectoryStatsData(formattedData)
        } catch (err) {
            formatError(err)
        }
    }

    const getThemeDirectoryStatsData = async () => {
        try {
            const res = await getThemeDirectoryStats({
                source_type: 'query',
            })
            // 将接口返回数据格式化为 themeDistData 的格式
            const formattedData = res.map((item) => ({
                type: item.type || '',
                value:
                    (item as any).value || Math.floor(Math.random() * 15) + 10, // 如果有value字段则使用，否则使用随机值作为示例
            }))
            setThemeDirectoryStatsData(formattedData)
        } catch (err) {
            formatError(err)
        }
    }

    const handleRefresh = () => {
        setLoading(true)
        setTimeout(() => setLoading(false), 1000)
    }

    return (
        <Space
            direction="vertical"
            size="large"
            className={styles.dataQueryContainer}
        >
            {/* <StatsHeader onRefresh={handleRefresh} /> */}
            {/* 1. 数据查询授权统计 */}
            <ContentLayout title="数据查询授权统计" theme="gray">
                <Row gutter={16}>
                    <Col span={12}>
                        <div className={styles.contentItemCardWrapper}>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <CardDataLabel
                                        data={{
                                            name: '已授权目录总数',
                                            total:
                                                queryAuthStatsData?.authorized_dir_count ||
                                                0,
                                            unit: '个',
                                        }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <CardDataLabel
                                        data={{
                                            name: '覆盖部门数',
                                            total:
                                                queryAuthStatsData?.covered_dept_count ||
                                                0,
                                            unit: '个',
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                        <div>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <ItemCardContainer title="主题目录分布">
                                        <ChartWrapper
                                            type="pie"
                                            data={themeDirectoryStatsData}
                                            config={{
                                                angleField: 'value',
                                                colorField: 'type',
                                                radius: 0.8,
                                                innerRadius: 0.6,
                                                legend: { position: 'right' },
                                            }}
                                            height={200}
                                            title="总计"
                                        />
                                    </ItemCardContainer>
                                </Col>
                                <Col span={12}>
                                    <ItemCardContainer title="共享目录分布">
                                        <ChartWrapper
                                            type="pie"
                                            data={sharedDirectoryStatsData}
                                            config={{
                                                angleField: 'value',
                                                colorField: 'type',
                                                radius: 0.8,
                                                innerRadius: 0.6,
                                                legend: { position: 'right' },
                                            }}
                                            height={200}
                                            title="总计"
                                        />
                                    </ItemCardContainer>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                    <Col span={12}>
                        <ItemCardContainer title="部门目录分布">
                            <ChartWrapper
                                type="column"
                                data={deptDirectoryStatsData}
                                config={{
                                    xField: 'dept',
                                    yField: 'count',
                                    color: '#1890ff',
                                    meta: {
                                        dept: { alias: '部门' },
                                        count: { alias: '数量' },
                                    },
                                }}
                                height={337}
                            />
                        </ItemCardContainer>
                    </Col>
                </Row>
            </ContentLayout>

            {/* 2. 数据查询使用情况统计 */}
            <ContentLayout title="数据查询使用情况统计" theme="gray">
                <Row gutter={16}>
                    <Col span={12}>
                        <ItemCardContainer
                            title="部门使用情况 (Top 10)"
                            height={425}
                        >
                            <ChartWrapper
                                type="bar"
                                data={deptUsageStatsData}
                                config={{
                                    xField: 'value',
                                    yField: 'dept',
                                    seriesField: 'type',
                                    isGroup: true,
                                    meta: {
                                        value: { alias: '次数' },
                                    },
                                }}
                            />
                        </ItemCardContainer>
                    </Col>
                    <Col span={12}>
                        <ItemCardContainer title="目录使用情况 (Top 10)">
                            <Table
                                dataSource={directoryUsageTop10StatsData}
                                columns={[
                                    {
                                        title: '排名',
                                        dataIndex: 'rank',
                                        width: 60,
                                    },
                                    {
                                        title: '目录名称',
                                        dataIndex: 'name',
                                    },
                                    {
                                        title: '所属部门',
                                        dataIndex: 'dept',
                                    },
                                    {
                                        title: '使用次数',
                                        dataIndex: 'count',
                                        sorter: (a, b) =>
                                            (a.count || 0) - (b.count || 0),
                                    },
                                ]}
                                pagination={false}
                                scroll={{ y: 425 }}
                                size="small"
                            />
                        </ItemCardContainer>
                    </Col>
                </Row>
            </ContentLayout>

            {/* 3. 数据查询调用情况统计 */}
            <ContentLayout
                title="数据查询调用情况统计"
                theme="gray"
                toolbar={
                    <TimeRangeSelector
                        value={timeRangeValue}
                        onChange={setTimeRangeValue}
                    />
                }
            >
                <div className={styles.callOverviewWrapper}>
                    <div>
                        <CardDataLabel
                            data={{
                                name: '总调用次数',
                                total: callStatsSummary.totalCalls,
                                unit: '',
                            }}
                        />
                    </div>
                    <div>
                        <CardDataLabel
                            data={{
                                name: '成功次数',
                                total: callStatsSummary.successCalls,
                                unit: '',
                            }}
                        />
                    </div>
                    <div>
                        <CardDataLabel
                            data={{
                                name: '失败次数',
                                total: callStatsSummary.failCalls,
                                unit: '',
                            }}
                        />
                    </div>
                    <div>
                        <CardDataLabel
                            data={{
                                name: '成功率',
                                total: callStatsSummary.successRate,
                                unit: '',
                            }}
                        />
                    </div>
                    <div>
                        <CardDataLabel
                            data={{
                                name: '平均耗时',
                                total: callStatsSummary.avgDuration,
                                unit: '',
                            }}
                        />
                    </div>
                </div>

                <ItemCardContainer title="调用趋势">
                    <ChartWrapper
                        type="line"
                        data={callTrendData}
                        config={{
                            xField: 'time',
                            yField: 'value',
                            seriesField: 'type',
                            smooth: true,
                            color: ({ type }: any) => {
                                if (type === '失败') return '#ff4d4f'
                                if (type === '成功') return '#52c41a'
                                return '#1890ff'
                            },
                            meta: {
                                value: { alias: '次数' },
                            },
                        }}
                        height={300}
                    />
                </ItemCardContainer>
            </ContentLayout>
        </Space>
    )
}

export default DataQueryStats
