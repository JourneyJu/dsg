import React, { useEffect, useState } from 'react'
import { Col, Row } from 'antd'
import BaseCard from './Cards/BaseCard'
import PieCard from './Cards/PieCard'
import TableCard from './Cards/TableCard'
import LineCard from './Cards/LineCard'
import {
    formatError,
    getDataGetOverview,
    IDataGetOverview,
    getDataGetDepartment,
} from '@/core'
import __ from './locale'
import { transformData } from './helper'
import styles from './styles.module.less'
import { TabKey } from './const'
import { Loader } from '@/ui'

type IDataGetOverviewType = IDataGetOverview & {
    data_resource?: {
        data_resource_total: number
        data_resource_view: number
        data_resource_api: number
        data_resource_file: number
    }
    aggregation_task?: {
        aggregation_total: number
        aggregation_completed: number
        aggregation_uncompleted: number
    }
}

const AssetMonitorOverview: React.FC<any> = () => {
    const [data, setData] = useState<IDataGetOverviewType>()
    const [departs, setDeparts] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // 数据目录分类占比
    const [pieLeftTab, setPieLeftTab] = useState<TabKey>(TabKey.SubjectGroup)
    // 库表分类占比
    const [pieRightTab, setPieRightTab] = useState<TabKey>(TabKey.SubjectGroup)

    useEffect(() => {
        getOverview()
    }, [])

    const getOverview = async () => {
        try {
            setLoading(true)
            const [resData, resDeparts] = await Promise.all([
                getDataGetOverview({
                    my_department: false,
                }),
                getDataGetDepartment({
                    my_department: false,
                    limit: 5,
                    offset: 1,
                }),
            ])

            setData(transformData(resData))
            setDeparts(resDeparts?.entries || [])
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles['asset-monitor-overview']}>
            <div className={styles['asset-monitor-overview-header']}>
                <div>{__('数据资产监测')}</div>
            </div>
            <div
                hidden={!loading}
                className={styles['asset-monitor-overview-loader']}
            >
                <Loader />
            </div>
            <div hidden={loading}>
                <Row gutter={16} style={{ marginTop: 20 }}>
                    {/* 数据资源目录 */}
                    <Col span={6}>
                        <BaseCard
                            title={__('数据资源目录')}
                            count={data?.data_catalog_count}
                        />
                    </Col>
                    {/* 库表 */}
                    <Col span={6}>
                        <BaseCard
                            title={__('库表')}
                            count={data?.data_resource?.data_resource_view}
                        />
                    </Col>
                    {/* 接口 */}
                    <Col span={6}>
                        <BaseCard
                            title={__('接口')}
                            count={data?.data_resource?.data_resource_api}
                        />
                    </Col>
                    {/* 文件 */}
                    <Col span={6}>
                        <BaseCard
                            title={__('文件')}
                            count={data?.data_resource?.data_resource_file}
                        />
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                        <PieCard
                            title={__('数据目录分类占比')}
                            data={
                                pieLeftTab === TabKey.SubjectGroup
                                    ? data?.catalog_subject_group
                                    : data?.data_range
                            }
                            pieTitle={__('目录总数')}
                            selectedTab={pieLeftTab}
                            onSelectTab={setPieLeftTab}
                        />
                    </Col>
                    <Col span={12}>
                        <PieCard
                            title={__('库表分类占比')}
                            data={
                                pieRightTab === TabKey.SubjectGroup
                                    ? data?.view_overview?.subject_group
                                    : data?.view_overview?.data_range
                            }
                            pieTitle={__('库表总数')}
                            selectedTab={pieRightTab}
                            onSelectTab={setPieRightTab}
                        />
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                        <LineCard title={__('归集库表趋势')} />
                    </Col>
                    <Col span={12}>
                        <TableCard
                            title={__('部门数据获取情况')}
                            data={departs}
                            showColumns={[
                                'department_name',
                                'view_count',
                                'new_view_count',
                                'data_size',
                                'new_data_size',
                            ]}
                        />
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                        <TableCard
                            title={__('数据鲜活监控')}
                            data={departs}
                            showColumns={[
                                'department_name',
                                'view_count',
                                'fresh_view_count',
                                'task_error_count',
                            ]}
                        />
                    </Col>
                    <Col span={12}>
                        <TableCard
                            title={__('前置机监控')}
                            data={departs}
                            showColumns={[
                                'department_name',
                                'front_end_processor_count',
                                'reclaim_count',
                            ]}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default AssetMonitorOverview
