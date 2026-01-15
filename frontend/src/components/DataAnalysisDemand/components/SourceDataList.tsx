import { Badge, Button, Drawer, Space, Table, Tooltip } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import styles from './styles.module.less'
import __ from '../locale'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { SearchInput } from '@/ui'
import DataCatlgContent from '@/components/DataAssetsCatlg/DataCatlgContent'
import {
    formatError,
    getDataQulityStatus,
    getDatasheetView,
    getExploreReport,
    IDataQualityStatus,
} from '@/core'
import OptModal from '@/components/WorkOrder/WorkOrderType/QualityOrder/OptModal'
import { OrderType } from '@/components/WorkOrder/helper'
import ReportDetail from '@/components/WorkOrder/QualityReport/ReportDetail'
import DetailModal from '@/components/WorkOrder/WorkOrderManage/DetailModal'

interface IProps {
    open: boolean
    onClose: () => void
    dataSource: {
        name: string
        columns: any[]
    }[]
    isView?: boolean
}
const SourceDataList = ({
    open,
    onClose,
    dataSource,
    isView = false,
}: IProps) => {
    const [data, setData] = useState<any[]>([])
    const [searchValue, setSearchValue] = useState('')
    const [catalogCardOpen, setCatalogCardOpen] = useState(false)
    const [detailItem, setDetailItem] = useState<any>(null)
    const [correctionVisible, setCorrectionVisible] = useState<boolean>(false)
    const [operateItem, setOperateItem] = useState<any>()
    const [dataSheetView, setDataSheetView] = useState<any[]>([])
    const [reportDetailVisible, setReportDetailVisible] =
        useState<boolean>(false)
    const [qualityStatusInfo, setQualityStatusInfo] = useState<
        IDataQualityStatus[]
    >([])
    const [currentWorkOrderId, setCurrentWorkOrderId] = useState('')
    const [orderDetailOpen, setOrderDetailOpen] = useState(false)

    const showData = useMemo(() => {
        return searchValue
            ? data.filter((item) =>
                  item.catalog_name
                      .toLowerCase()
                      .includes(searchValue.toLowerCase()),
              )
            : data
    }, [data, searchValue])

    const generateData = async () => {
        let allData: any[] = []
        dataSource.forEach((item) => {
            const cols = item.columns.map((column) => ({
                ...column,
                outputName: item.name,
            }))
            allData = [...allData, ...cols]
        })
        const groupedByNames = allData.reduce((acc, item) => {
            if (!acc.has(item.catalog_id)) {
                acc.set(item.catalog_id, []) // 如果键不存在，创建一个新数组
            }
            acc.get(item.catalog_id).push(item) // 将当前项推入对应的数组中
            return acc
        }, new Map()) // 使用 Map 而不是普通的对象，以便保持顺序（如果需要的话）

        const groupedArrays: any[][] = Array.from(groupedByNames.values())
        const newData = groupedArrays
            .map((item) => {
                return {
                    ...item[0],
                    outputName: Array.from(
                        new Set(item.map((i) => i.outputName)),
                    ).join('、'),
                }
            })
            .filter((item) => item.catalog_name)
        const form_view_ids = newData.map((item) => item.view_id).join(',')
        const res = await getDatasheetView({
            form_view_ids,
        })
        const statusRes = await getDataQulityStatus({ form_view_ids })
        setQualityStatusInfo(statusRes.entries)
        setDataSheetView(res.entries)
        setData(newData)
    }

    useEffect(() => {
        generateData()
    }, [dataSource])

    const sendQualityChange = async (record, target) => {
        try {
            const res = await getExploreReport({
                id: record.view_id,
            })
            setCorrectionVisible(true)
            setOperateItem({
                form_view_id: record.view_id,
                business_name: record.view_busi_name,
                datasource: target.datasource,
                datasource_catalog_name: target.datasource_catalog_name,
                owner: target.owner,
                owner_id: target.owner_id,
                report_id: res.task_id,
                report_version: res.version,
                datasource_id: target.datasource_id,
            })
        } catch (error) {
            formatError(error)
        }
    }

    const columns = useMemo(
        () => [
            {
                title: __('资源名称（编码）'),
                dataIndex: 'catalog_name',
                key: 'catalog_name',
                width: 252,
                render: (name: string, record: any) => {
                    const target = dataSheetView.find(
                        (entry) => entry.id === record.view_id,
                    )
                    const statusInfo = qualityStatusInfo.find(
                        (q) => q.form_view_id === record.view_id,
                    )
                    return (
                        <div className={styles['catalog-info-container']}>
                            <FontIcon
                                name="icon-shujumuluguanli1"
                                type={IconType.COLOREDICON}
                                style={{ fontSize: 20 }}
                            />
                            <div className={styles['catalog-info']}>
                                <div
                                    className={styles['catalog-name']}
                                    title={name}
                                >
                                    {name}
                                </div>
                                <div
                                    className={styles['catalog-code']}
                                    title={record.catalog_code}
                                >
                                    {record.catalog_code}
                                </div>
                            </div>
                            {target.explored_data ? (
                                <Tooltip title={__('查看数据质量报告')}>
                                    <FontIcon
                                        name="icon-shujuzhiliangbaogao1"
                                        type={IconType.COLOREDICON}
                                        style={{ fontSize: 20 }}
                                        onClick={() => {
                                            setReportDetailVisible(true)
                                            setOperateItem({
                                                form_view_id: record.view_id,
                                                business_name:
                                                    record.view_busi_name,
                                                datasource_id:
                                                    target.datasource_id,
                                                status: statusInfo?.status,
                                            })
                                        }}
                                    />
                                </Tooltip>
                            ) : null}
                        </div>
                    )
                },
            },
            {
                title: __('所属部门'),
                dataIndex: 'department_name',
                key: 'department_name',
            },
            {
                title: __('关联分析场景产物'),
                dataIndex: 'outputName',
                key: 'outputName',
            },
            {
                title: __('操作'),
                dataIndex: 'operation',
                key: 'operation',
                render: (text: string, record: any) => {
                    const target = dataSheetView.find(
                        (entry) => entry.id === record.view_id,
                    )
                    const statusInfo = qualityStatusInfo.find(
                        (q) => q.form_view_id === record.view_id,
                    )
                    return (
                        <Space
                            size={16}
                            className={styles['operation-container']}
                        >
                            <Button
                                type="link"
                                onClick={() => {
                                    setCatalogCardOpen(true)
                                    setDetailItem(record)
                                }}
                            >
                                {__('详情')}
                            </Button>
                            {isView && statusInfo?.status === 'added' && (
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setCurrentWorkOrderId(
                                            statusInfo?.work_order_id || '',
                                        )
                                        setOrderDetailOpen(true)
                                    }}
                                >
                                    {__('查看质量整改')}
                                </Button>
                            )}
                            {!isView && target.explored_data ? (
                                <Tooltip
                                    color="#fff"
                                    getPopupContainer={(node) =>
                                        node.parentNode as HTMLElement
                                    }
                                    title={
                                        statusInfo?.status === 'added' ? (
                                            <div
                                                className={
                                                    styles['work-order-info']
                                                }
                                            >
                                                <div className={styles.label}>
                                                    {__('工单名称：')}
                                                </div>
                                                <div
                                                    className={
                                                        styles[
                                                            'work-order-name'
                                                        ]
                                                    }
                                                    onClick={() => {
                                                        setCurrentWorkOrderId(
                                                            statusInfo?.work_order_id ||
                                                                '',
                                                        )
                                                        setOrderDetailOpen(true)
                                                    }}
                                                >
                                                    {
                                                        statusInfo?.work_order_name
                                                    }
                                                </div>
                                                <div className={styles.label}>
                                                    {__('工单状态：')}
                                                </div>
                                                <div
                                                    className={
                                                        styles[
                                                            'work-order-status'
                                                        ]
                                                    }
                                                >
                                                    <Badge
                                                        status="processing"
                                                        text={__('进行中')}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            ''
                                        )
                                    }
                                >
                                    <Button
                                        type="link"
                                        onClick={() =>
                                            sendQualityChange(record, target)
                                        }
                                        disabled={
                                            statusInfo?.status === 'added'
                                        }
                                    >
                                        {__('发起质量整改')}
                                    </Button>
                                </Tooltip>
                            ) : null}
                        </Space>
                    )
                },
            },
        ],
        [dataSheetView, qualityStatusInfo],
    )

    const handleCloseOpt = async () => {
        try {
            const statusRes = await getDataQulityStatus({
                form_view_ids: operateItem?.form_view_id,
            })
            // 更新报告状态
            setQualityStatusInfo(
                qualityStatusInfo.map((item) => {
                    if (
                        item.form_view_id === statusRes.entries[0]?.form_view_id
                    ) {
                        return statusRes.entries[0]
                    }
                    return item
                }),
            )
            setOperateItem(undefined)
        } catch (error) {
            formatError(error)
        } finally {
            setCorrectionVisible(false)
        }
    }

    return (
        <Drawer
            title={__('来源数据清单')}
            width={catalogCardOpen ? '100vw' : 1396}
            open={open}
            onClose={onClose}
            push={{ distance: 0 }}
        >
            <div className={styles['source-data-list']}>
                <div className={styles['search-container']}>
                    <SearchInput
                        placeholder={__('搜索数据资源目录名称')}
                        style={{ width: 280 }}
                        onKeyChange={(e) => setSearchValue(e)}
                    />
                </div>
                <Table
                    dataSource={showData}
                    columns={columns}
                    size="small"
                    pagination={{ hideOnSinglePage: true }}
                />

                {catalogCardOpen && (
                    <DataCatlgContent
                        open={catalogCardOpen}
                        onClose={(dataCatlgCommonInfo) => {
                            setCatalogCardOpen(false)
                        }}
                        assetsId={detailItem?.catalog_id}
                    />
                )}
            </div>
            {correctionVisible && (
                <OptModal
                    item={operateItem}
                    type={OrderType.QUALITY}
                    visible={correctionVisible}
                    onClose={handleCloseOpt}
                />
            )}
            {reportDetailVisible && (
                <ReportDetail
                    item={operateItem}
                    visible={reportDetailVisible}
                    onClose={() => setReportDetailVisible(false)}
                />
            )}
            {orderDetailOpen && currentWorkOrderId && (
                <DetailModal
                    id={currentWorkOrderId}
                    type="data_quality"
                    onClose={() => {
                        setOrderDetailOpen(false)
                        setCurrentWorkOrderId('')
                    }}
                />
            )}
        </Drawer>
    )
}

export default SourceDataList
