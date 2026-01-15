import React, { useEffect, useMemo, useState } from 'react'
import { Col, Radio, RadioChangeEvent, Row } from 'antd'
import BaseCard from './Cards/BaseCard'
import PieCard from './Cards/PieCard'
import TableCard from './Cards/TableCard'
import IconCountCard from './Cards/IconCountCard'
import {
    formatError,
    getDataGetOverview,
    IDataGetOverview,
    PermissionScope,
} from '@/core'
import __ from './locale'
import { renderFooter, transformData, transformPieData } from './helper'
import CountCard from './Cards/CountCard'
import styles from './styles.module.less'
import dataEmpty from '@/assets/dataEmpty.svg'
import {
    ActiveType,
    DataRangeItems,
    SyncMechanismItems,
    TypeOptions,
    UpdateCycleItems,
} from './const'
import DepartmentModal from './DepartmentModal'
import TaskModal from './TaskModal'
import openCatalogIcon from '@/assets/open_catalog.png'
import openDepartmentIcon from '@/assets/open_department.png'
import { Empty, Loader } from '@/ui'
import { useUserPermCtx } from '@/context/UserPermissionProvider'
import { useGeneralConfig } from '@/hooks/useGeneralConfig'

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

const DataGetOverview: React.FC<any> = () => {
    const [data, setData] = useState<IDataGetOverviewType>()
    const [loading, setLoading] = useState(false)
    const [activeType, setActiveType] = useState<ActiveType>(ActiveType.All)
    const [departmentVisible, setDepartmentVisible] = useState(false)
    const [taskVisible, setTaskVisible] = useState(false)
    const { checkPermission } = useUserPermCtx()
    const [{ governmentSwitch }] = useGeneralConfig()
    // 是否拥有数据获取概览全部的权限
    const hasAllAccess = useMemo(() => {
        return (
            checkPermission([
                {
                    key: 'dataGetOverview',
                    scope: PermissionScope.All,
                },
            ]) ?? false
        )
    }, [checkPermission])

    useEffect(() => {
        if (!hasAllAccess) {
            setActiveType(ActiveType.Department)
        }
    }, [hasAllAccess])

    const isDepartmentType = useMemo(() => {
        return activeType === ActiveType.Department
    }, [activeType])

    useEffect(() => {
        getOverview(isDepartmentType)
    }, [isDepartmentType])

    const getOverview = async (my_department: boolean = false) => {
        try {
            setLoading(true)
            const res = await getDataGetOverview({
                my_department,
            })
            setData(transformData(res))
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    const handleActiveType = ({ target: { value } }: RadioChangeEvent) => {
        setActiveType(value)
    }

    const currentTypeOptions = useMemo(() => {
        return hasAllAccess
            ? TypeOptions
            : TypeOptions.filter((item) => item.value !== ActiveType.All)
    }, [hasAllAccess])

    return (
        <div className={styles['data-get-overview']}>
            <div className={styles['data-get-overview-header']}>
                <div>{__('数据获取概览')}</div>
                <div>
                    <Radio.Group
                        options={currentTypeOptions}
                        onChange={handleActiveType}
                        value={activeType}
                        optionType="button"
                    />
                </div>
            </div>
            <div
                hidden={!loading}
                className={styles['data-get-overview-loader']}
            >
                <Loader />
            </div>
            <div hidden={loading}>
                <Row gutter={16} style={{ marginTop: 20 }}>
                    {/* 资源部门数 */}
                    <Col span={6}>
                        <BaseCard
                            title={__('资源部门数')}
                            count={data?.department_count}
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
                            count={data?.info_catalog_count}
                            footer={renderFooter(
                                [
                                    {
                                        label: __('信息项'),
                                        value: data?.info_catalog_column_count,
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
                            count={data?.data_catalog_count}
                            footer={renderFooter(
                                [
                                    {
                                        label: __('信息项'),
                                        value: data?.data_catalog_column_count,
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
                            title={__('数据资源')}
                            count={data?.data_resource?.data_resource_total}
                            footer={renderFooter([
                                {
                                    label: __('库表'),
                                    value: data?.data_resource
                                        ?.data_resource_view,
                                },
                                {
                                    label: __('接口'),
                                    value: data?.data_resource
                                        ?.data_resource_api,
                                },
                                {
                                    label: __('文件'),
                                    value: data?.data_resource
                                        ?.data_resource_file,
                                },
                            ])}
                        />
                    </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={6}>
                        <BaseCard
                            title={__('前置机')}
                            className={styles['front-end-item']}
                            count={data?.front_end_processor}
                            footer={renderFooter(
                                [
                                    {
                                        label: __('使用中'),
                                        value: data?.front_end_processor_using,
                                        color: 'rgb(109, 212, 0)',
                                    },
                                    {
                                        label: __('已回收'),
                                        value: data?.front_end_processor_reclaim,
                                        color: 'rgb(255, 28, 28)',
                                    },
                                ],
                                {
                                    height: '32px',
                                    gridTemplateColumns: '2fr 2fr 1fr',
                                },
                            )}
                        />
                    </Col>
                    <Col span={6}>
                        <BaseCard
                            title={__('前置库')}
                            className={styles['front-end-item']}
                            count={data?.front_end_library}
                            footer={renderFooter(
                                [
                                    {
                                        label: __('使用中'),
                                        value: data?.front_end_library_using,
                                        color: 'rgb(109, 212, 0)',
                                    },
                                    {
                                        label: __('已回收'),
                                        value: data?.front_end_library_reclaim,
                                        color: 'rgb(255, 28, 28)',
                                    },
                                ],
                                {
                                    height: '32px',
                                    gridTemplateColumns: '2fr 2fr 1fr',
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
                <div
                    className={styles['card-wrapper']}
                    style={{ marginTop: 16 }}
                >
                    <div className={styles['card-wrapper-title']}>
                        {__('数据更新')}
                    </div>

                    <Row gutter={16}>
                        <Col span={12}>
                            <PieCard
                                title={__('更新方式')}
                                data={transformPieData(
                                    data?.sync_mechanism,
                                    {
                                        type: 'sync_mechanism',
                                        value: 'count',
                                    },
                                    SyncMechanismItems,
                                    SyncMechanismItems.map(
                                        (item) => item.value,
                                    ),
                                )}
                                className={styles['pie-card-update']}
                            />
                        </Col>
                        <Col span={12}>
                            <PieCard
                                title={__('更新频率')}
                                data={transformPieData(
                                    data?.update_cycle,
                                    {
                                        type: 'update_cycle',
                                        value: 'count',
                                    },
                                    UpdateCycleItems,
                                    UpdateCycleItems.map((item) => item.value),
                                )}
                                className={styles['pie-card-update']}
                                legendLayout="double"
                            />
                        </Col>
                    </Row>
                </div>
                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                        <TableCard
                            title={__('基础信息分类')}
                            data={data?.subject_group}
                        />
                    </Col>
                    <Col span={6}>
                        <IconCountCard
                            title={__('数据开放')}
                            data={[
                                {
                                    icon: (
                                        <img
                                            src={openDepartmentIcon}
                                            alt={__('部门数量')}
                                            height={44}
                                        />
                                    ),
                                    label: __('部门数量'),
                                    value: data?.open_department_count,
                                },
                                {
                                    icon: (
                                        <img
                                            src={openCatalogIcon}
                                            alt={__('已开放数据目录')}
                                            height={44}
                                        />
                                    ),
                                    label: __('已开放数据目录'),
                                    value: data?.open_count,
                                },
                            ]}
                        />
                    </Col>
                    <Col span={6}>
                        {governmentSwitch.on ? (
                            <PieCard
                                title={__('目录层级')}
                                data={transformPieData(
                                    data?.data_range,
                                    {
                                        type: 'data_range',
                                        value: 'count',
                                    },
                                    DataRangeItems,
                                    DataRangeItems.map((item) => item.value),
                                )}
                                hasTitleFlag={false}
                                className={styles['pie-card-item']}
                                legendLayout="double"
                                layout="vertical"
                            />
                        ) : (
                            <div className={styles['empty-card']}>
                                <div className={styles['empty-card-header']}>
                                    {__('目录层级')}
                                </div>
                                <div className={styles['empty-card-content']}>
                                    <Empty
                                        iconSrc={dataEmpty}
                                        desc={__('暂无数据')}
                                    />
                                </div>
                            </div>
                        )}
                    </Col>
                </Row>
                <div
                    className={styles['card-wrapper']}
                    style={{ marginTop: 16 }}
                >
                    <div className={styles['card-wrapper-title']}>
                        {__('资源类型')}
                    </div>
                    <Row gutter={16}>
                        <Col span={9}>
                            <CountCard
                                title={__('库表')}
                                className={styles['resource-type-item']}
                                items={[
                                    {
                                        label: __('部门数量'),
                                        value: data?.view_department_count,
                                    },
                                    {
                                        label: __('库表数量'),
                                        value: data?.view_count,
                                    },
                                    {
                                        label: __('待归集库表数量'),
                                        value: data?.view_aggregation_count,
                                    },
                                ]}
                            />
                        </Col>
                        <Col span={9}>
                            <CountCard
                                title={__('接口')}
                                className={styles['resource-type-item']}
                                items={[
                                    {
                                        label: __('部门数量'),
                                        value: data?.api_department_count,
                                    },
                                    {
                                        label: __('生成接口数量'),
                                        value: data?.api_generate_count,
                                    },
                                    {
                                        label: __('注册接口数量'),
                                        value: data?.api_register_count,
                                    },
                                ]}
                            />
                        </Col>
                        <Col span={6}>
                            <CountCard
                                title={__('文件')}
                                className={styles['resource-type-item']}
                                splitIndex={null}
                                items={[
                                    {
                                        label: __('部门数量'),
                                        value: data?.file_department_count,
                                    },
                                    {
                                        label: __('文件数量'),
                                        value: data?.file_count,
                                    },
                                ]}
                            />
                        </Col>
                    </Row>
                </div>
            </div>

            {departmentVisible && (
                <DepartmentModal
                    isAll={!isDepartmentType}
                    visible={departmentVisible}
                    onClose={() => setDepartmentVisible(false)}
                />
            )}
            {taskVisible && (
                <TaskModal
                    isAll={!isDepartmentType}
                    visible={taskVisible}
                    onClose={() => setTaskVisible(false)}
                />
            )}
        </div>
    )
}

export default DataGetOverview
