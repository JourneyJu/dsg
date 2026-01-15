import React, { useEffect, useState } from 'react'
import { Table, Space, Badge, Row, Col } from 'antd'
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
import { verifyStatsMockData } from './mockData'
import styles from './styles.module.less'
import {
    formatError,
    getThemeDirectoryStats,
    getVerifyAuthStats,
    getVerifyDeptUsageTop10Stats,
    getVerifyDirectoryTrendStats,
    getVerifyDirectoryUsageTop10Stats,
    getVerifyResourceDirectoryStats,
    getVerifyTasksStats,
    IThemeDirectoryItem,
    IVerifyAuthStats,
    IVerifyDeptUsageTop10Item,
    IVerifyDirectoryTrendItem,
    IVerifyDirectoryUsageTop10Item,
    IVerifyResourceDirectoryItem,
    IVerifyTasksResponse,
} from '@/core'

const DataVerifyStats: React.FC = () => {
    const [timeRangeValue, setTimeRangeValue] = useState<TimeRangeValue>(() => {
        const today = moment()
        return {
            start_date: today.clone().subtract(7, 'day').format('YYYY-MM-DD'),
            end_date: today.clone().subtract(1, 'day').format('YYYY-MM-DD'),
            time_dimension: 'day',
        }
    })
    const [verifyAuthStatsData, setVerifyAuthStatsData] =
        useState<IVerifyAuthStats>({
            authorized_dir_count: 0,
            covered_dept_count: 0,
            created_at: '',
            entriesset_count: 0,
            id: 0,
        })

    const [verifyDeptUsageTop10StatsData, setVerifyDeptUsageTop10StatsData] =
        useState<IVerifyDeptUsageTop10Item[]>([])

    const [verifyDirectoryTrendStatsData, setVerifyDirectoryTrendStatsData] =
        useState<IVerifyDirectoryTrendItem[]>([])

    const [
        verifyDirectoryUsageTop10StatsData,
        setVerifyDirectoryUsageTop10StatsData,
    ] = useState<IVerifyDirectoryUsageTop10Item[]>([])

    const [
        verifyResourceDirectoryStatsData,
        setVerifyResourceDirectoryStatsData,
    ] = useState<IVerifyResourceDirectoryItem[]>([])

    const [verifyTasksStatsData, setVerifyTasksStatsData] =
        useState<IVerifyTasksResponse>({
            entries: [],
            limit: 10,
            offset: 1,
            total_count: 0,
        })

    const [themeDirectoryStatsData, setThemeDirectoryStatsData] = useState<
        IThemeDirectoryItem[]
    >([])

    // 分页状态
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    })

    // 从 mock 数据中获取数据
    const { deptUsageData, getTrendData } = verifyStatsMockData

    useEffect(() => {
        getVerifyAuthStatsData()
        getVerifyDeptUsageTop10StatsData()
        getVerifyDirectoryUsageTop10StatsData()
        getVerifyResourceDirectoryStatsData()
        getThemeDirectoryStatsData()
        getVerifyTasksStatsData()
    }, [])

    useEffect(() => {
        getVerifyDirectoryTrendStatsData()
    }, [timeRangeValue])

    // 监听分页变化，重新获取数据
    useEffect(() => {
        getVerifyTasksStatsData()
    }, [pagination.current, pagination.pageSize])

    // 当接口数据变化时，重新计算图表数据
    const [columnData, lineData] = React.useMemo(() => {
        // columnData: 直接使用API返回的数据（每个时间点各种类型的详细数据）
        const processedColumnData = verifyDirectoryTrendStatsData.map(
            (item) => ({
                time: item.time || '',
                type: item.type || '',
                value: item.value || 0,
            }),
        )

        // lineData: 按时间聚合计算总数
        const timeMap = new Map<string, number>()
        verifyDirectoryTrendStatsData.forEach((item) => {
            const time = item.time || ''
            const value = item.value || 0
            timeMap.set(time, (timeMap.get(time) || 0) + value)
        })

        const processedLineData = Array.from(timeMap.entries()).map(
            ([time, count]) => ({
                time,
                count,
            }),
        )

        return [processedColumnData, processedLineData]
    }, [verifyDirectoryTrendStatsData])

    // 格式化目录使用Top10数据
    const dirUsageData = React.useMemo(() => {
        return verifyDirectoryUsageTop10StatsData.map((item) => ({
            dir: item.name || '',
            value: item.count || 0,
        }))
    }, [verifyDirectoryUsageTop10StatsData])

    // 格式化资源目录分布数据
    const resourceDistData = React.useMemo(() => {
        return verifyResourceDirectoryStatsData.map((item) => ({
            type: item.type || '',
            value: (item as any).value || Math.floor(Math.random() * 50) + 10, // 如果有value字段则使用，否则使用随机值作为示例
        }))
    }, [verifyResourceDirectoryStatsData])

    // 格式化主题目录分布数据
    const themeDistData = React.useMemo(() => {
        return themeDirectoryStatsData.map((item) => ({
            type: item.type || '',
            value: (item as any).value || Math.floor(Math.random() * 15) + 10, // 如果有value字段则使用，否则使用随机值作为示例
        }))
    }, [themeDirectoryStatsData])

    // 格式化任务执行数据
    const taskExecData = React.useMemo(() => {
        return (verifyTasksStatsData.entries || []).map((item) => ({
            dept: item.dept || '',
            tasks: item.tasks || 0,
            execs: item.execs || 0,
            volume: item.volume || '0GB',
            duration: item.duration || '0m',
            success: item.success || 0,
            fail: item.fail || 0,
            rate: item.rate ? `${item.rate}%` : '0%',
        }))
    }, [verifyTasksStatsData.entries])

    const getVerifyAuthStatsData = async () => {
        try {
            const res = await getVerifyAuthStats()
            setVerifyAuthStatsData(res)
        } catch (err) {
            formatError(err)
        }
    }

    const getVerifyDeptUsageTop10StatsData = async () => {
        try {
            const res = await getVerifyDeptUsageTop10Stats()
            // 将接口返回数据格式化为 deptUsageDataTop10 的格式
            const formattedData = res.map((item) => ({
                dept: item.dept || '',
                value: item.value || 0,
                type: '使用次数',
            }))
            setVerifyDeptUsageTop10StatsData(formattedData)
        } catch (err) {
            formatError(err)
        }
    }

    const getVerifyDirectoryTrendStatsData = async () => {
        try {
            const res = await getVerifyDirectoryTrendStats({
                time_dimension: timeRangeValue.time_dimension,
                start_date: timeRangeValue.start_date,
                end_date: timeRangeValue.end_date,
            })
            setVerifyDirectoryTrendStatsData(res)
        } catch (err) {
            formatError(err)
        }
    }

    const getVerifyDirectoryUsageTop10StatsData = async () => {
        try {
            const res = await getVerifyDirectoryUsageTop10Stats()
            setVerifyDirectoryUsageTop10StatsData(res)
        } catch (err) {
            formatError(err)
        }
    }

    const getVerifyResourceDirectoryStatsData = async () => {
        try {
            const res = await getVerifyResourceDirectoryStats()
            setVerifyResourceDirectoryStatsData(res)
        } catch (err) {
            formatError(err)
        }
    }

    const getThemeDirectoryStatsData = async () => {
        try {
            const res = await getThemeDirectoryStats({
                source_type: 'verify',
            })
            setThemeDirectoryStatsData(res)
        } catch (err) {
            formatError(err)
        }
    }

    const getVerifyTasksStatsData = async () => {
        try {
            const res = await getVerifyTasksStats({
                offset: pagination.current,
                limit: pagination.pageSize,
            })
            setVerifyTasksStatsData(res)
            setPagination((prev) => ({
                ...prev,
                total: res.total_count || 0,
            }))
        } catch (err) {
            formatError(err)
        }
    }

    // 分页变化处理
    const handleTableChange = (paginationInfo: any) => {
        setPagination((prev) => ({
            ...prev,
            current: paginationInfo.current,
            pageSize: paginationInfo.pageSize,
        }))
    }
    return (
        <Space
            direction="vertical"
            size="large"
            className={styles.dataVerifyContainer}
        >
            {/* <StatsHeader /> */}
            {/* 1. 数据校核授权统计 */}
            <ContentLayout title="数据校核授权统计" theme="gray">
                <Row gutter={16}>
                    <Col span={12}>
                        <div className={styles.contentItemCardWrapper}>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <CardDataLabel
                                        data={{
                                            name: '已授权目录总数',
                                            total:
                                                verifyAuthStatsData.authorized_dir_count ||
                                                0,
                                            unit: '个',
                                        }}
                                        style={{ height: 128 }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <CardDataLabel
                                        data={{
                                            name: '数据集数量',
                                            total:
                                                verifyAuthStatsData.entriesset_count ||
                                                0,
                                            unit: '个',
                                        }}
                                        style={{ height: 128 }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <CardDataLabel
                                        data={{
                                            name: '主题模型目录',
                                            total:
                                                verifyAuthStatsData.theme_model_count ||
                                                0,
                                            unit: '个',
                                        }}
                                        style={{ height: 128 }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <CardDataLabel
                                        data={{
                                            name: '覆盖部门数',
                                            total:
                                                verifyAuthStatsData.covered_dept_count ||
                                                0,
                                            unit: '个',
                                        }}
                                        style={{ height: 128 }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <ItemCardContainer title="资源目录分布">
                                        <ChartWrapper
                                            type="pie"
                                            data={resourceDistData}
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
                                    <ItemCardContainer title="主题目录分布">
                                        <ChartWrapper
                                            type="pie"
                                            data={themeDistData}
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
                </Row>
            </ContentLayout>

            {/* 2. 数据校核使用统计 */}
            <ContentLayout title="数据校核使用统计" theme="gray">
                <div className={styles.contentItemCardWrapper}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <ItemCardContainer title="部门使用排名Top10">
                                <ChartWrapper
                                    type="bar"
                                    data={verifyDeptUsageTop10StatsData}
                                    config={{
                                        xField: 'value',
                                        yField: 'dept',
                                        seriesField: 'type',
                                        legend: false,
                                        meta: {
                                            value: { alias: '使用次数' },
                                        },
                                    }}
                                />
                            </ItemCardContainer>
                        </Col>
                        <Col span={12}>
                            <ItemCardContainer title="目录使用排名Top10">
                                <ChartWrapper
                                    type="bar"
                                    data={dirUsageData}
                                    config={{
                                        xField: 'value',
                                        yField: 'dir',
                                        color: '#5B8FF9',
                                        meta: {
                                            value: { alias: '使用次数' },
                                        },
                                    }}
                                />
                            </ItemCardContainer>
                        </Col>
                    </Row>
                </div>

                <ItemCardContainer
                    title="目录使用趋势"
                    toolbar={
                        <TimeRangeSelector
                            value={timeRangeValue}
                            onChange={setTimeRangeValue}
                        />
                    }
                >
                    <ChartWrapper
                        type="dualAxes"
                        data={[columnData, lineData]}
                        config={{
                            xField: 'time',
                            yField: ['value', 'count'],
                            geometryOptions: [
                                {
                                    geometry: 'column',
                                    isStack: true,
                                    seriesField: 'type',
                                },
                                {
                                    geometry: 'line',
                                    lineStyle: { lineWidth: 2 },
                                    color: '#FF6B3B',
                                },
                            ],
                            legend: { position: 'top' },
                            meta: {
                                value: { alias: '使用量' },
                                count: { alias: '目录数' },
                            },
                        }}
                        height={300}
                    />
                </ItemCardContainer>
            </ContentLayout>

            {/* 3. 数据校核调用统计 */}
            <ContentLayout title="数据校核调用统计" theme="gray">
                <ItemCardContainer title="部门任务执行情况">
                    <Table
                        dataSource={taskExecData}
                        columns={[
                            { title: '部门', dataIndex: 'dept' },
                            { title: '校核任务数', dataIndex: 'tasks' },
                            {
                                title: '执行次数',
                                dataIndex: 'execs',
                                sorter: (a, b) => a.execs - b.execs,
                            },
                            { title: '调用数据量', dataIndex: 'volume' },
                            { title: '调用耗时', dataIndex: 'duration' },
                            { title: '成功次数', dataIndex: 'success' },
                            { title: '失败次数', dataIndex: 'fail' },
                            {
                                title: '成功率',
                                dataIndex: 'rate',
                                render: (text) => (
                                    <Badge status="success" text={text} />
                                ),
                            },
                        ]}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                        }}
                        onChange={handleTableChange}
                        scroll={{ y: 500 }}
                    />
                </ItemCardContainer>
            </ContentLayout>
        </Space>
    )
}

export default DataVerifyStats
