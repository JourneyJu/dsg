import { Table, Tabs } from 'antd'
import { FC, useEffect, useMemo, useState } from 'react'
import {
    BaseInfoClassificationEnum,
    baseInfoClassificationEnumOptions,
    OverviewRangeEnum,
} from './const'
import styles from './styles.module.less'
import __ from './locale'
import {
    formatError,
    getDataUnderstandDepartTop,
    getSubjectDomain,
    IDataUnderstandDepartTopResult,
    IDataUnderstandOverviewResult,
} from '@/core'

import { BaseViewCard, TitleLabel } from './helper'
import UnderstandCatalogDetail from './UnderstandCatalogDetail'

interface BaseInfoClassificationProps {
    activeRange: OverviewRangeEnum
    overviewData: IDataUnderstandOverviewResult
}
// 基础信息分类
const BaseInfoClassification: FC<BaseInfoClassificationProps> = ({
    activeRange,
    overviewData,
}) => {
    const [activeKey, setActiveKey] = useState('')
    const [items, setItems] = useState<any[]>([])
    // 部门理解目录情况
    const [total, setTotal] = useState(30)
    const [searchCondition, setSearchCondition] = useState<{
        my_department: boolean
        subject_id?: string
        sort?: 'completion_rate' | 'name'
        direction?: 'asc' | 'desc'
    }>({
        my_department: false,
        sort: 'completion_rate',
        direction: 'desc',
        subject_id: '',
    })

    const [pageConfig, setPageConfig] = useState<{
        offset: number
        limit: number
    }>({
        offset: 1,
        limit: 10,
    })

    const [detailOpen, setDetailOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [tableTop30Data, setTableTop30Data] = useState<
        IDataUnderstandDepartTopResult[]
    >([])
    // 全部基础信息分类数据
    const allBaseInfoClassificationData = useMemo(() => {
        // 修改后（安全且简洁）
        const catalogCount = overviewData?.view_catalog_count ?? 0
        const understood = overviewData?.view_catalog_understand_count ?? 0
        const completionRate =
            catalogCount <= 0
                ? 0
                : Number(((understood / catalogCount) * 100).toFixed(2))
        return {
            [BaseInfoClassificationEnum.DEPARTMENT]: [
                {
                    subject_name: __('全部'),
                    subject_id: '',
                    count: overviewData?.department_count || 0,
                },
                ...overviewData.department_understand,
            ],
            [BaseInfoClassificationEnum.UNDERSTOOD_DATA_CATALOG]: [
                {
                    subject_name: __('全部'),
                    subject_id: '',
                    count: overviewData?.view_catalog_understand_count || 0,
                },
                ...overviewData.completed_understand,
            ],
            [BaseInfoClassificationEnum.NOT_UNDERSTOOD_DATA_CATALOG]: [
                {
                    subject_name: __('全部'),
                    subject_id: '',
                    count: overviewData?.view_catalog_not_understand_count || 0,
                },
                ...(overviewData?.not_completed_understand || []),
            ],
            [BaseInfoClassificationEnum.COMPLETION_RATE]: [
                {
                    subject_name: __('全部'),
                    subject_id: '',
                    count: completionRate?.toFixed(2) || 0,
                },
                ...(overviewData?.completed_rate?.map((item) => {
                    const completionRateItem = item.count.toFixed(2)
                    return {
                        ...item,
                        count: completionRateItem || 0,
                    }
                }) || []),
            ],
        }
    }, [overviewData])

    const baseInfoClassificationData = useMemo(() => {
        return baseInfoClassificationEnumOptions.map((item) => ({
            ...item,
            value: allBaseInfoClassificationData[item.key].find(
                (it) => it.subject_id === searchCondition.subject_id,
            )?.count,
        }))
    }, [searchCondition.subject_id, allBaseInfoClassificationData])

    useEffect(() => {
        getItemsData()
    }, [])

    const columns = [
        {
            title: __('排名'),
            dataIndex: 'rank',
            key: 'rank',
            ellipsis: true,
            align: 'center',
            render: (text, record, index) => (
                <span title={text}>
                    {index + 1 + (pageConfig.offset - 1) * pageConfig.limit ||
                        '--'}
                </span>
            ),
        },
        {
            title: __('部门'),
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            ellipsis: true,
            render: (text, record) => <span title={text}>{text ?? '--'}</span>,
        },
        {
            title: __('已理解数据目录数量'),
            dataIndex: 'completed_count',
            key: 'completed_count',
            align: 'center',
            ellipsis: true,
            render: (text, record) => (
                <span title={text}>
                    {text ? text.toLocaleString('en-US') : '--'}
                </span>
            ),
        },
        {
            title: __('未理解数据目录数量'),
            dataIndex: 'uncompleted_count',
            key: 'uncompleted_count',
            ellipsis: true,
            align: 'center',
            render: (text, record) => (
                <span title={text}>
                    {text ? text.toLocaleString('en-US') : '--'}
                </span>
            ),
        },
        {
            title: __('数据理解完成率'),
            dataIndex: 'completion_rate',
            key: 'completion_rate',
            ellipsis: true,
            align: 'center',
            render: (text, record) => (
                <span title={text}>{text ? `${text}%` : '--'}</span>
            ),
        },
    ]

    useEffect(() => {
        setSearchCondition({
            ...searchCondition,
            my_department: activeRange === OverviewRangeEnum.DEPARTMENT,
        })
    }, [activeRange])

    useEffect(() => {
        getTableTop30Data()
    }, [searchCondition])

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

    const getTableTop30Data = async () => {
        try {
            setLoading(true)
            const res = await getDataUnderstandDepartTop({
                ...searchCondition,
                limit: 30,
                offset: 1,
            })
            setTableTop30Data(res.entries)
            setTotal(res.total_count > 30 ? 30 : res.total_count)
        } catch (err) {
            formatError(err)
        } finally {
            setLoading(false)
        }
    }
    const tableData = useMemo(() => {
        return (
            tableTop30Data?.slice(
                (pageConfig.offset - 1) * pageConfig.limit,
                pageConfig.offset * pageConfig.limit,
            ) || []
        )
    }, [tableTop30Data, pageConfig])
    return (
        <div className={styles.baseInfoClassificationContainer}>
            <div className={styles.titleWrapper}>
                <span className={styles.labelContainer}>
                    {__('基础信息分类')}
                </span>
                <div className={styles.tabsContainer}>
                    <Tabs
                        items={[
                            {
                                label: __('全部'),
                                key: '',
                            },
                            ...items.map((item) => ({
                                label: (
                                    <span
                                        title={item?.name}
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
                </div>
            </div>

            <div className={styles.listWrapper}>
                {baseInfoClassificationData?.map((item) => {
                    return (
                        <BaseViewCard
                            dataKey={item.key}
                            label={item.label}
                            value={item.value || 0}
                        />
                    )
                })}
            </div>
            <TitleLabel
                title={__('部门理解目录情况')}
                description={__('(部门数据理解完成率top30)')}
                onDetail={() => {
                    setDetailOpen(true)
                }}
            />
            <div className={styles.tableWrapper}>
                <Table
                    dataSource={tableData}
                    columns={columns as any}
                    pagination={{
                        total,
                        pageSize: pageConfig.limit,
                        current: pageConfig.offset,
                        hideOnSinglePage: total < 10,
                        showQuickJumper: true,
                        onChange: (page, pageSize) => {
                            setPageConfig({
                                ...pageConfig,
                                limit: pageSize,
                                offset: page,
                            })
                        },
                        showSizeChanger: true,
                        showTotal: (count) => __('共${count}条', { count }),
                    }}
                />
            </div>
            {detailOpen && (
                <UnderstandCatalogDetail
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    activeRange={activeRange}
                    detailType="department-catalog"
                />
            )}
        </div>
    )
}

export default BaseInfoClassification
