import { FC, useEffect, useMemo, useState } from 'react'
import { Input, Modal, Table, Tabs } from 'antd'
import moment from 'moment'
import {
    CatalogStatus,
    catalogStatusOptions,
    dataAssessmentConfigs,
    OverviewRangeEnum,
    serviceAreaOptions,
    updateTypeOptions,
} from './const'
import __ from './locale'
import styles from './styles.module.less'
import { DataAssessmentLabel } from './helper'
import { understandCatalogDetailDataMock } from './mock'
import DepartSelect from '../DataGetOverview/DepartSelect'
import DepartmentAndOrgSelect from '../DepartmentAndOrgSelect'
import {
    formatError,
    getDataUnderstandDomainDetail,
    getUnderstandDepartmentDetail,
    IDataUnderstandDomainDetailResult,
} from '@/core'

interface UnderstandCatalogDetailProps {
    open: boolean
    onClose: () => void
    activeRange: OverviewRangeEnum
    detailType?: 'service-area' | 'department-catalog'
}

const UnderstandCatalogDetail: FC<UnderstandCatalogDetailProps> = ({
    open,
    onClose,
    activeRange,
    detailType = 'service-area',
}) => {
    const [domainDetail, setDomainDetail] =
        useState<IDataUnderstandDomainDetailResult | null>(null)
    const [searchCondition, setSearchCondition] = useState<{
        limit: number
        offset: number
        department_id?: string
        my_department: boolean
        understand: boolean
    }>({
        limit: 10,
        offset: 1,
        department_id: undefined,
        my_department: false,
        understand: true,
    })
    const [total, setTotal] = useState(0)
    const [dataSource, setDataSource] = useState<any[]>([])
    const [activeCatalogStatus, setActiveCatalogStatus] = useState(
        catalogStatusOptions[0].key,
    )

    const [departmentId, setDepartmentId] = useState<string | undefined>()

    const [serviceAreaData, setServiceAreaData] =
        useState<IDataUnderstandDomainDetailResult | null>(null)

    const [serviceAreaActive, setServiceAreaActive] = useState<string>(
        serviceAreaOptions[0].key,
    )

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
                width: 120,
                ellipsis: true,
                render: (text, record) => {
                    return record.name || '--'
                },
            },
            {
                title: __('资源类型'),
                dataIndex: 'resource',
                key: 'resource',
                ellipsis: true,
                width: 180,
                render: (text, record) => {
                    return (
                        <div
                            title={record?.resource
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
                                .join('、')}
                        >
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
                dataIndex: 'department_name',
                key: 'department_name',
                width: 100,
                ellipsis: true,
                render: (text, record) => {
                    return (
                        <div title={record.department_name}>
                            {record.department_name || '--'}
                        </div>
                    )
                },
            },
            {
                title: __('数据评估'),
                dataIndex: 'data_assessment',
                key: 'data_assessment',
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

                width: 100,
                render: (text, record) => {
                    return (
                        <div>
                            {updateTypeOptions.find(
                                (item) => item.value === record.sync_mechanism,
                            )?.label || '--'}
                        </div>
                    )
                },
            },
            {
                title: __('最新更新时间'),
                dataIndex: 'updated_at',
                key: 'updated_at',
                width: 180,
                render: (text, record) => {
                    return (
                        <div title={moment(text).format('YYYY-MM-DD HH:mm:ss')}>
                            {moment(text).format('YYYY-MM-DD HH:mm:ss') || '--'}
                        </div>
                    )
                },
            },
        ]
    }, [])

    useEffect(() => {
        if (detailType === 'service-area') {
            getDomainDetail()
        } else if (detailType === 'department-catalog') {
            setSearchCondition({
                ...searchCondition,
                offset: 1,
                my_department: activeRange === OverviewRangeEnum.DEPARTMENT,
            })
        }
    }, [activeRange, detailType])

    useEffect(() => {
        if (detailType === 'department-catalog') {
            getDepartmentCatalogData()
        }
    }, [searchCondition])

    useEffect(() => {
        setSearchCondition({
            ...searchCondition,
            offset: 1,
            department_id: departmentId || undefined,
            my_department: activeRange === OverviewRangeEnum.DEPARTMENT,
            understand: activeCatalogStatus === CatalogStatus.PROCESSED,
        })
    }, [departmentId, activeCatalogStatus])

    useEffect(() => {
        if (detailType === 'department-catalog') {
            getDepartmentCatalogData()
        }
    }, [activeCatalogStatus])

    useEffect(() => {
        if (domainDetail && detailType === 'service-area') {
            getFormTableData()
        } else if (domainDetail && detailType === 'department-catalog') {
            getDepartmentCatalogData()
        }
    }, [searchCondition, domainDetail])

    useEffect(() => {
        if (detailType === 'service-area' && serviceAreaData) {
            getFormTableData()
        }
    }, [searchCondition, serviceAreaData, serviceAreaActive])

    /**
     * 获取领域详情
     */
    const getDomainDetail = async () => {
        try {
            const res = await getDataUnderstandDomainDetail({
                my_department: activeRange === OverviewRangeEnum.DEPARTMENT,
            })
            setServiceAreaData(res.catalog_info)
        } catch (err) {
            formatError(err)
        }
    }

    /**
     * 获取领域详情
     */
    const getDepartmentCatalogData = async () => {
        try {
            const res = await getUnderstandDepartmentDetail({
                ...searchCondition,
            })
            setDataSource(
                res.entries?.map((item) => ({
                    ...item,
                    resource: [
                        {
                            resource_type: 1,
                            resource_count: item.view_count,
                        },
                        {
                            resource_type: 2,
                            resource_count: item.api_count,
                        },
                        {
                            resource_type: 3,
                            resource_count: item.file_count,
                        },
                    ].filter((it) => it.resource_count > 0),
                })),
            )
            setTotal(res.total_count)
        } catch (err) {
            formatError(err)
        }
    }

    /*
     *  获取表单数据
     */
    const getFormTableData = () => {
        try {
            const currentServiceAreaData =
                serviceAreaData?.[serviceAreaActive] || []

            if (currentServiceAreaData.length > 0) {
                setTotal(currentServiceAreaData.length)
                if (currentServiceAreaData.length > searchCondition.limit) {
                    setDataSource(
                        currentServiceAreaData
                            .slice(
                                (searchCondition.offset - 1) *
                                    searchCondition.limit,
                                searchCondition.offset * searchCondition.limit,
                            )
                            .map((item) => ({
                                ...item,
                                resource: [
                                    {
                                        resource_type: 1,
                                        resource_count: item.view_count,
                                    },
                                    {
                                        resource_type: 2,
                                        resource_count: item.api_count,
                                    },
                                    {
                                        resource_type: 3,
                                        resource_count: item.file_count,
                                    },
                                ].filter((it) => it.resource_count > 0),
                            })),
                    )
                } else {
                    setDataSource(
                        currentServiceAreaData.map((item) => ({
                            ...item,
                            resource: [
                                {
                                    resource_type: 1,
                                    resource_count: item.view_count,
                                },
                                {
                                    resource_type: 2,
                                    resource_count: item.api_count,
                                },
                                {
                                    resource_type: 3,
                                    resource_count: item.file_count,
                                },
                            ].filter((it) => it.resource_count > 0),
                        })),
                    )
                }
            } else {
                setDataSource([])
                setTotal(0)
            }
        } catch (err) {
            formatError(err)
        }
    }

    return (
        <Modal
            width={1000}
            open={open}
            onCancel={onClose}
            footer={null}
            title={
                detailType === 'service-area'
                    ? __('服务领域数据理解详情')
                    : __('部门理解目录情况详情')
            }
            maskClosable={false}
        >
            <div className={styles.understandCatalogDetail}>
                {detailType === 'service-area' ? (
                    <div className={styles.understandServiceAreaTab}>
                        <Tabs
                            items={serviceAreaOptions.map((item) => ({
                                label: item.title,
                                key: item.key,
                            }))}
                            onChange={(key) => {
                                setServiceAreaActive(key)
                            }}
                            activeKey={serviceAreaActive}
                        />
                    </div>
                ) : (
                    <div className={styles.understandTabContent}>
                        <Tabs
                            items={catalogStatusOptions.map((item) => ({
                                label: item.label,
                                key: item.key,
                            }))}
                            onChange={(key) => {
                                setActiveCatalogStatus(key as CatalogStatus)
                            }}
                            activeKey={activeCatalogStatus}
                        />
                        <div className={styles.departmentContent}>
                            <DepartmentAndOrgSelect
                                onChange={(value) => {
                                    setDepartmentId(value)
                                }}
                                placeholder={__('搜索部门')}
                                style={{ width: '200px' }}
                                value={departmentId}
                                allowClear
                            />
                        </div>
                    </div>
                )}
                <div className={styles.understandCatalogDetailContent}>
                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        pagination={{
                            pageSize: searchCondition.limit,
                            current: searchCondition.offset,
                            hideOnSinglePage: total < 10,
                            showQuickJumper: true,
                            total,
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
                        scroll={{ y: 440 }}
                    />
                </div>
            </div>
        </Modal>
    )
}

export default UnderstandCatalogDetail
