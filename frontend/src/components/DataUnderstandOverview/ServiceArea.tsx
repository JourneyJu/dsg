import { FC, useEffect, useMemo, useState } from 'react'
import { Button, Table } from 'antd'
import styles from './styles.module.less'
import {
    OverviewRangeEnum,
    ServiceAreaEnum,
    serviceAreaEnumOptions,
    serviceAreaOptions,
} from './const'
import __ from './locale'
import UnderstandCatalogDetail from './UnderstandCatalogDetail'
import { IDataUnderstandOverviewResult } from '@/core'

interface ServiceAreaProps {
    activeRange: OverviewRangeEnum
    overviewData: IDataUnderstandOverviewResult
}
// 服务领域
const ServiceArea: FC<ServiceAreaProps> = ({ activeRange, overviewData }) => {
    const [columns, setColumns] = useState<any[]>([])
    const [detailOpen, setDetailOpen] = useState(false)

    const formatDataSource = () => {
        return [
            {
                domain_name: ServiceAreaEnum.DATA_CATALOG,
                ...overviewData.catalog_domain_group,
            },
            {
                domain_name: ServiceAreaEnum.TABLE,
                ...overviewData.view_domain_group,
            },
            {
                domain_name: ServiceAreaEnum.BUSINESS_OBJECT,
                ...overviewData.subject_domain_group,
            },
        ]
    }
    const dataSource = useMemo(() => {
        return formatDataSource()
    }, [overviewData])

    useEffect(() => {
        setColumns([
            {
                title: __('领域名称'),
                dataIndex: 'domain_name',
                key: 'domain_name',
                width: 100,
                align: 'center',
                render: (text, record) => {
                    return (
                        <span>
                            {
                                serviceAreaEnumOptions.find(
                                    (item) => item.value === text,
                                )?.label
                            }
                        </span>
                    )
                },
            },
            ...serviceAreaOptions.map((item) => ({
                ...item,
                width: 100,
                align: 'center',
                render: (text, record) => {
                    return <span>{text.toLocaleString('en-US')}</span>
                },
            })),
        ])
    }, [])

    return (
        <div className={styles.serviceAreaContainer}>
            <div className={styles.title}>
                <span>{__('服务领域')}</span>
                <Button type="link" onClick={() => setDetailOpen(true)}>
                    {__('详情')}
                </Button>
            </div>
            <div className={styles.tableWrapper}>
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                />
            </div>

            {detailOpen && (
                <UnderstandCatalogDetail
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    activeRange={activeRange}
                    detailType="service-area"
                />
            )}
        </div>
    )
}

export default ServiceArea
