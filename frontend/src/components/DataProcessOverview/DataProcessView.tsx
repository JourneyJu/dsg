import { FC, useEffect, useMemo, useState } from 'react'
import { QuestionCircleOutlined } from '@ant-design/icons'
import moment from 'moment'
import { Tooltip, Tabs, Table } from 'antd'
import {
    dataAssessmentConfigs,
    dataProcessViewConfig,
    OverviewRangeEnum,
    updateTypeOptions,
} from './const'
import styles from './styles.module.less'
import __ from './locale'
import { DataAssessmentLabel, DataQualityCard, TitleLabel } from './helper'
import {
    formatError,
    getResultsTableCatalog,
    getSubjectDomain,
    IDataProcessingOverview,
} from '@/core'
import ProcessViewModal from './ProcessViewMoal'

interface IDataProcessView {
    activeRange: OverviewRangeEnum
    dataDetail: IDataProcessingOverview
}
/**
 * 数据加工
 * @returns
 */
const DataProcessView: FC<IDataProcessView> = ({ activeRange, dataDetail }) => {
    const [dataProcessViewData, setDataProcessViewData] = useState<any[]>([])
    const [items, setItems] = useState<any[]>([])
    const [catalogData, setCatalogData] = useState<any[]>([])
    const [total, setTotal] = useState(20)
    const [searchCondition, setSearchCondition] = useState<{
        limit: number
        offset: number
        my_department: boolean
        subject_id?: string
    }>({
        limit: 10,
        offset: 1,
        my_department: false,
    })
    const [showDetail, setShowDetail] = useState<boolean>(false)
    const [detailFormType, setDetailFormType] = useState<
        'processingTask' | 'resultTable'
    >('processingTask')

    useEffect(() => {
        if (dataDetail) {
            setDataProcessViewData(formatDataProcessViewData(dataDetail))
        }
    }, [dataDetail])

    useEffect(() => {
        setSearchCondition({
            ...searchCondition,
            my_department: activeRange === OverviewRangeEnum.DEPARTMENT,
        })
    }, [activeRange])

    useEffect(() => {
        getItemsData()
    }, [])

    useEffect(() => {
        getCatalogData()
    }, [searchCondition])

    /**
     * 处理详情
     * @param type 类型
     */
    const handleDetail = (type: any) => {
        setShowDetail(true)
        setDetailFormType(type)
    }

    /**
     * 格式化数据处理概览数据
     * @param details 数据处理概览数据
     * @returns
     */
    const formatDataProcessViewData = (details: IDataProcessingOverview) => {
        return [
            {
                type: 'sourceDepartment',
                value: details.source_table_department_count,
            },
            {
                type: 'sourceTable',
                value: details.source_table_count,
            },
            {
                type: 'processingTask',
                value: dataDetail.work_order_task_count,
                hasDetail: true,
            },
            {
                type: 'resultTableDepartment',
                value: details.target_table_department_count,
            },
            {
                type: 'resultTable',
                value: details.target_table_count,
                hasDetail: true,
            },
        ]
    }

    /**
     * 获取成果表数据资源目录
     */
    const getCatalogData = async () => {
        try {
            const res = await getResultsTableCatalog(searchCondition)
            setCatalogData(res.entries)
            setTotal(res.total_count)
        } catch (error) {
            formatError(error)
        }
    }

    /**
     * 获取成果表数据资源目录
     */
    const getItemsData = async () => {
        try {
            const res = await getSubjectDomain({
                limit: 2000,
                parent_id: '',
                is_all: true,
                type: 'subject_domain,subject_domain_group',
            })
            const filterItems = res.entries.filter(
                (item) => item.type === 'subject_domain',
            )
            setItems(filterItems)
        } catch (error) {
            formatError(error)
        }
    }

    /**
     * 获取成果表数据资源目录列
     * @returns
     */
    const columns = useMemo(() => {
        return [
            {
                title: __('目录名称'),
                dataIndex: 'name',
                key: 'name',
                width: 200,
                ellipsis: true,
                align: 'center' as const,
                render: (text, record) => {
                    return (
                        <span title={record.name} style={{ color: '#78839F' }}>
                            {record.name}
                        </span>
                    )
                },
            },
            {
                title: __('资源类型'),
                dataIndex: 'resource',
                key: 'resource',
                width: 200,
                align: 'center' as const,
                render: (text, record) => {
                    return (
                        <div style={{ color: '#78839F' }}>
                            {record?.resource
                                ?.map(
                                    (item) =>
                                        `${
                                            item.resource_type === 1
                                                ? __('库表')
                                                : item.resource_type === 2
                                                ? __('接口')
                                                : __('文件')
                                        } ${item.resource_count}`,
                                )
                                .join('、') || '--'}
                        </div>
                    )
                },
            },

            {
                title: __('所属部门'),
                dataIndex: 'department',
                key: 'department',
                align: 'center' as const,
                width: 200,
                ellipsis: true,
                render: (text, record) => {
                    return (
                        <span
                            style={{ color: '#78839F' }}
                            title={record.department}
                        >
                            {record.department}
                        </span>
                    )
                },
            },
            {
                title: __('数据评估'),
                dataIndex: 'data_assessment',
                key: 'data_assessment',
                align: 'center' as const,
                width: 250,
                render: (text, record) => {
                    return (
                        <div
                            title={record.dataAssessment}
                            className={styles.dataAssessment}
                        >
                            {dataAssessmentConfigs.map((item) => (
                                <DataAssessmentLabel
                                    value={record[item.key]}
                                    label={item.label}
                                />
                            ))}
                        </div>
                    )
                },
            },
            {
                title: __('更新方式'),
                dataIndex: 'sync_mechanism',
                key: 'sync_mechanism',
                align: 'center' as const,
                width: 100,
                render: (text, record) => {
                    return (
                        <div style={{ color: '#78839F' }}>
                            {
                                updateTypeOptions.find(
                                    (item) =>
                                        item.value === record.sync_mechanism,
                                )?.label
                            }
                        </div>
                    )
                },
            },
            {
                title: __('最新更新时间'),
                dataIndex: 'updated_at',
                key: 'updated_at',
                align: 'center' as const,
                width: 180,
                render: (text, record) => {
                    return (
                        <div
                            title={record.updated_at}
                            style={{ color: '#78839F' }}
                        >
                            {moment(text).format('YYYY-MM-DD HH:mm:ss')}
                        </div>
                    )
                },
            },
        ]
    }, [])

    return (
        <div className={styles.dataProcessViewContainer}>
            <div className={styles.dataProcessViewTitle}>
                <span>{__('数据加工')}</span>
                <Tooltip
                    title={__('数据融合工单中任务和表的相关统计')}
                    color="#fff"
                    overlayInnerStyle={{ color: 'rgba(0,0,0,0.85)' }}
                    overlayStyle={{ maxWidth: 320 }}
                    placement="topLeft"
                >
                    <QuestionCircleOutlined />
                </Tooltip>
            </div>
            <div className={styles.dataProcessViewContent}>
                {dataProcessViewData.map((item, index) => (
                    <DataQualityCard
                        data={item}
                        key={index}
                        onDetail={
                            item.hasDetail
                                ? () => {
                                      handleDetail(item.type)
                                  }
                                : undefined
                        }
                        options={dataProcessViewConfig}
                    />
                ))}
            </div>
            <TitleLabel
                title={__('成果表数据资源目录')}
                rightNode={
                    <Tabs
                        items={[
                            {
                                label: __('全部'),
                                key: '',
                            },
                            ...items.map((item) => ({
                                label: (
                                    <span
                                        title={item?.path_name}
                                        className={styles.tabLabel}
                                    >
                                        {item.name}
                                    </span>
                                ),
                                key: item.id,
                            })),
                        ]}
                        onChange={(key) => {
                            setSearchCondition({
                                ...searchCondition,
                                subject_id: key,
                            })
                        }}
                        activeKey={searchCondition.subject_id}
                    />
                }
            />
            <div className={styles.dataProcessViewTable}>
                <Table
                    dataSource={catalogData}
                    columns={columns}
                    pagination={{
                        total,
                        pageSize: Number(searchCondition?.limit),
                        current: Number(searchCondition?.offset),
                        hideOnSinglePage: total < 10,
                        showQuickJumper: true,
                        onChange: (page, pageSize) => {
                            setSearchCondition({
                                ...searchCondition,
                                offset: page,
                                limit: pageSize,
                            })
                        },
                        showSizeChanger: true,
                        showTotal: (count) => __('共${count}条', { count }),
                    }}
                    scroll={{ y: 450 }}
                />
            </div>
            {showDetail && (
                <ProcessViewModal
                    open={showDetail}
                    onClose={() => setShowDetail(false)}
                    modalType={detailFormType}
                    myDepartment={activeRange === OverviewRangeEnum.DEPARTMENT}
                />
            )}
        </div>
    )
}

export default DataProcessView
