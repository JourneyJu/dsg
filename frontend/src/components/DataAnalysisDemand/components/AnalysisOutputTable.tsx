import { Button, Col, Row, Space, Table, Tooltip } from 'antd'
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react'
import { PlusOutlined } from '@ant-design/icons'
import styles from './styles.module.less'
import __ from '../locale'
import { Empty, SearchInput } from '@/ui'
import AddAnalysisOutput from './AddAnalysisOutput'
import SourceDataList from './SourceDataList'
import OutputDetails from '../Details/OutputDetails'
import dataEmpty from '@/assets/dataEmpty.svg'
import {
    getOptionState,
    CommonOrderStatusOptions,
} from '@/components/WorkOrder/helper'
import DetailModal from '@/components/WorkOrder/WorkOrderManage/DetailModal'
import FieldDetails from './FieldDetails'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { DataAnalCommissionType } from '@/core'
import { getActualUrl } from '@/utils'
import { DataAnalysisTab } from '@/components/DataAnalysis/const'

interface AnalysisOutputTableProps {
    data?: any[]
    isView?: boolean
    dataChangeCallback?: (data: any[]) => void
    isFusional?: boolean
    onFusion?: (record: any) => void
    commissionType?: DataAnalCommissionType
    // colKeys?: string[]
    tab?: DataAnalysisTab
    commisionOperationKeys?: string[]
    commisionColKeys?: string[]
    // 分析确认驳回时需求编辑融合工单
    isImpReject?: boolean
}

const AnalysisOutputTable = forwardRef(
    (
        {
            data,
            isView = false,
            dataChangeCallback,
            isFusional = false,
            onFusion,
            commissionType = DataAnalCommissionType.SELF_SERVICE,
            tab,
            commisionOperationKeys,
            commisionColKeys = [
                'name',
                'view_busi_name',
                'catalog_name',
                'columns',
                'operation',
            ],
            isImpReject = false,
        }: AnalysisOutputTableProps,
        ref,
    ) => {
        const [items, setItems] = useState<any[]>([])
        const [addAnalysisOutputOpen, setAddAnalysisOutputOpen] =
            useState(false)
        const [sourceDataListOpen, setSourceDataListOpen] = useState(false)
        const [outputDetailsOpen, setOutputDetailsOpen] = useState(false)
        const [operateItem, setOperateItem] = useState<any>(null)
        const [operateIndex, setOperateIndex] = useState<number>()
        const [keyword, setKeyword] = useState('')
        // 融合工单
        const [orderDetailOpen, setOrderDetailOpen] = useState(false)
        const [currentWorkOrderId, setCurrentWorkOrderId] = useState('')
        const [fieldDetailsOpen, setFieldDetailsOpen] = useState(false)
        const [fields, setFields] = useState<any[]>([])

        const showItems = useMemo(() => {
            return !keyword
                ? items
                : items.filter((item) =>
                      item.name.toLowerCase().includes(keyword.toLowerCase()),
                  )
        }, [items, keyword])

        useImperativeHandle(ref, () => ({
            getItems: () => items,
        }))

        useEffect(() => {
            if (data) {
                setItems(data)
            }
        }, [data])

        useEffect(() => {
            dataChangeCallback?.(items)
        }, [items])

        const columns = useMemo(() => {
            // 自助型和委托公用（委托实施时使用）的cols
            const outputName = {
                title: __('分析场景产物名称'),
                dataIndex: 'name',
                key: 'name',
            }
            const analysisRes = {
                title: __('分析成果'),
                dataIndex: 'view_busi_name',
                key: 'view_busi_name',
                render: (text: string, record: any) => {
                    return record.view_busi_name ? (
                        <div
                            className={styles['name-container']}
                            key={record.view_id}
                        >
                            <FontIcon
                                name="icon-shitusuanzi"
                                type={IconType.COLOREDICON}
                                className={styles['view-icon']}
                            />
                            <div className={styles['name-info']}>
                                <div
                                    className={styles['business-name']}
                                    title={record.view_busi_name}
                                >
                                    {record.view_busi_name}
                                </div>
                                <div
                                    className={styles['technical-name']}
                                    title={record.view_code}
                                >
                                    {record.view_code}
                                </div>
                            </div>
                        </div>
                    ) : (
                        '--'
                    )
                },
            }

            const catalogs = {
                title: __('来源数据目录'),
                dataIndex: 'catalogs',
                key: 'catalogs',
                ellipsis: true,
                render: (text: string, record: any) =>
                    Array.from(
                        new Set(
                            record.columns
                                .filter((item) => item.catalog_name)
                                .map((column: any) => column.catalog_name),
                        ),
                    ).join('、') || '--',
            }
            const workOrderStatus = {
                title: __('融合工单状态'),
                dataIndex: 'work_order_status',
                key: 'work_order_status',
                render: (val) =>
                    getOptionState(val, CommonOrderStatusOptions) || '--',
            }
            const cols = [
                outputName,
                {
                    title: __('表字段'),
                    dataIndex: 'columns',
                    key: 'columns',
                    render: (text: string, record: any) => {
                        const firstColumnName = record.columns[0]?.name_cn
                        const columnsLen = record.columns.length
                        return (
                            <div className={styles['column-list']}>
                                <div className={styles['column-item']}>
                                    {firstColumnName}
                                </div>
                                {columnsLen > 1 && (
                                    <div
                                        className={styles['column-more']}
                                        onClick={() => {
                                            setFieldDetailsOpen(true)
                                            setFields(record.columns)
                                        }}
                                    >
                                        +{columnsLen - 1}
                                    </div>
                                )}
                            </div>
                        )
                    },
                },
                catalogs,
                workOrderStatus,
                {
                    title: __('操作'),
                    dataIndex: 'operation',
                    key: 'operation',
                    render: (text: string, record: any, index: number) => (
                        <Space size={16}>
                            {isView ? (
                                <>
                                    <Button
                                        type="link"
                                        onClick={() => {
                                            setOutputDetailsOpen(true)
                                            setOperateItem(record)
                                        }}
                                    >
                                        {__('查看')}
                                    </Button>
                                    {isFusional ? (
                                        !record.work_order_status ? (
                                            <Button
                                                type="link"
                                                onClick={() =>
                                                    onFusion?.(record)
                                                }
                                            >
                                                {__('发起融合工单')}
                                            </Button>
                                        ) : (
                                            <Button
                                                type="link"
                                                onClick={() => {
                                                    setCurrentWorkOrderId(
                                                        record.work_order_id,
                                                    )
                                                    setOrderDetailOpen(true)
                                                }}
                                            >
                                                {__('查看融合工单')}
                                            </Button>
                                        )
                                    ) : null}
                                </>
                            ) : (
                                <>
                                    <Button
                                        type="link"
                                        onClick={() => {
                                            setOperateItem(record)
                                            setAddAnalysisOutputOpen(true)
                                        }}
                                    >
                                        {__('编辑')}
                                    </Button>
                                    <Button
                                        type="link"
                                        onClick={() =>
                                            setItems(
                                                items.filter(
                                                    (item) =>
                                                        item.id !== record.id,
                                                ),
                                            )
                                        }
                                    >
                                        {__('移除')}
                                    </Button>
                                </>
                            )}
                        </Space>
                    ),
                },
            ]

            const CommissionCols = [
                outputName,
                analysisRes,
                {
                    title: __('所属数据资源目录名称（编码）'),
                    dataIndex: 'catalog_name',
                    key: 'catalog_name',
                    render: (text: string, record: any) => {
                        return record.catalog_name ? (
                            <div
                                className={styles['name-container']}
                                key={record.view_id}
                            >
                                <FontIcon
                                    name="icon-shujumuluguanli1"
                                    type={IconType.COLOREDICON}
                                    className={styles['view-icon']}
                                />
                                <div className={styles['name-info']}>
                                    <div
                                        className={styles['business-name']}
                                        title={record.catalog_name}
                                    >
                                        {record.catalog_name}
                                    </div>
                                    <div
                                        className={styles['technical-name']}
                                        title={record.catalog_code}
                                    >
                                        {record.catalog_code}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            '--'
                        )
                    },
                },
                {
                    title: commisionColKeys.includes('catalog_name')
                        ? __('信息项')
                        : __('表字段'),
                    dataIndex: 'columns',
                    key: 'columns',
                    render: (text: string, record: any) => {
                        const firstColumnName = record.columns[0]?.name_cn
                        const columnsLen = record.columns.length
                        return (
                            <div className={styles['column-list']}>
                                <div className={styles['column-item']}>
                                    {firstColumnName}
                                </div>
                                {columnsLen > 1 && (
                                    <div
                                        className={styles['column-more']}
                                        onClick={() => {
                                            setFieldDetailsOpen(true)
                                            setFields(record.columns)
                                        }}
                                    >
                                        +{columnsLen - 1}
                                    </div>
                                )}
                            </div>
                        )
                    },
                },
                catalogs,
                {
                    title: __('操作'),
                    dataIndex: 'operation',
                    key: 'operation',
                    render: (text: string, record: any, index: number) => (
                        <Space size={16}>
                            {(commisionOperationKeys?.includes('view') ||
                                commisionOperationKeys?.includes('detail')) && (
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setOutputDetailsOpen(true)
                                        setOperateItem(record)
                                    }}
                                >
                                    {commisionOperationKeys?.includes('view')
                                        ? __('查看')
                                        : __('详情')}
                                </Button>
                            )}
                            {commisionOperationKeys?.includes(
                                'viewFusionOrder',
                            ) && (
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setCurrentWorkOrderId(
                                            record.data_fusion_id ||
                                                record.work_order_id,
                                        )
                                        setOrderDetailOpen(true)
                                    }}
                                >
                                    {__('查看融合工单')}
                                </Button>
                            )}
                            {commisionOperationKeys?.includes('viewOutput') && (
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setOutputDetailsOpen(true)
                                        setOperateItem(record)
                                    }}
                                >
                                    {__('查看分析场景产物')}
                                </Button>
                            )}
                            {commisionOperationKeys?.includes(
                                'viewPushTask',
                            ) && (
                                <Button
                                    type="link"
                                    onClick={() => {
                                        window.open(
                                            getActualUrl(
                                                `/dataPush/manage?operate=detail&dataPushId=${record.data_push_id}`,
                                            ),
                                            '_blank',
                                        )
                                    }}
                                >
                                    {__('查看推送任务')}
                                </Button>
                            )}
                        </Space>
                    ),
                },
            ]

            const commissionImpRejectCols = [
                outputName,
                analysisRes,
                {
                    title: __('成果是否可使用'),
                    dataIndex: 'is_usable',
                    key: 'is_usable',
                    render: (val) => (val ? __('是') : __('否')),
                },
                {
                    title: __('理由说明'),
                    dataIndex: 'use_remark',
                    key: 'use_remark',
                    ellipsis: true,
                    render: (val) => val || '--',
                },
                workOrderStatus,
                {
                    title: __('操作'),
                    dataIndex: 'operation',
                    key: 'operation',
                    render: (text: string, record: any, index: number) => (
                        <Space size={16}>
                            <Button
                                type="link"
                                onClick={() => {
                                    setOutputDetailsOpen(true)
                                    setOperateItem(record)
                                }}
                            >
                                {__('查看分析场景产物')}
                            </Button>
                            {record.is_usable ? (
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setCurrentWorkOrderId(
                                            record.data_fusion_id ||
                                                record.work_order_id,
                                        )
                                        setOrderDetailOpen(true)
                                    }}
                                >
                                    {__('查看融合工单')}
                                </Button>
                            ) : (
                                <Button
                                    type="link"
                                    onClick={() => onFusion?.(record)}
                                >
                                    {__('新建融合工单')}
                                </Button>
                            )}
                        </Space>
                    ),
                },
            ]
            return isImpReject
                ? commissionImpRejectCols
                : commissionType === DataAnalCommissionType.SELF_SERVICE
                ? isFusional
                    ? cols
                    : cols.filter((col) => col.key !== 'work_order_status')
                : CommissionCols.filter((item) =>
                      commisionColKeys.includes(item.key),
                  )
        }, [
            isFusional,
            isView,
            commissionType,
            commisionColKeys,
            commisionOperationKeys,
            isImpReject,
        ])

        const handleAddAnalysisOutputOK = (values: any) => {
            if (operateItem) {
                setItems(
                    items.map((item) =>
                        item.id === operateItem.id ? values : item,
                    ),
                )
                setOperateItem(undefined)
            } else {
                setItems([...items, values])
            }
        }

        return (
            <div className={styles['analysis-output-table']}>
                <div className={styles['analysis-output-table-header']}>
                    <Space size={20}>
                        {!isView && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setAddAnalysisOutputOpen(true)}
                            >
                                {__('添加分析场景产物')}
                            </Button>
                        )}
                        <Button onClick={() => setSourceDataListOpen(true)}>
                            {__('来源数据目录')}
                        </Button>
                    </Space>
                    <SearchInput
                        placeholder={__('搜索分析场景产物名称')}
                        style={{ width: 280 }}
                        onKeyChange={(e) => setKeyword(e)}
                    />
                </div>
                {items.length > 0 ? (
                    <Table
                        columns={columns}
                        dataSource={showItems}
                        pagination={{ hideOnSinglePage: true }}
                        rowKey="id"
                        locale={{
                            emptyText: <Empty />,
                        }}
                    />
                ) : (
                    <div className={styles['analysis-output-table-empty']}>
                        <Empty iconSrc={dataEmpty} desc={__('暂无数据')} />
                    </div>
                )}

                {addAnalysisOutputOpen && (
                    <AddAnalysisOutput
                        open={addAnalysisOutputOpen}
                        onClose={() => {
                            setAddAnalysisOutputOpen(false)
                            setOperateItem(undefined)
                        }}
                        onOk={handleAddAnalysisOutputOK}
                        initData={operateItem}
                    />
                )}
                {sourceDataListOpen && (
                    <SourceDataList
                        open={sourceDataListOpen}
                        onClose={() => setSourceDataListOpen(false)}
                        dataSource={items}
                        isView={isView}
                    />
                )}
                {outputDetailsOpen && (
                    <OutputDetails
                        open={outputDetailsOpen}
                        onClose={() => setOutputDetailsOpen(false)}
                        data={operateItem}
                    />
                )}
                {orderDetailOpen && currentWorkOrderId && (
                    <DetailModal
                        id={currentWorkOrderId}
                        type="data_fusion"
                        onClose={() => {
                            setOrderDetailOpen(false)
                            setCurrentWorkOrderId('')
                        }}
                    />
                )}
                {fieldDetailsOpen && (
                    <FieldDetails
                        fields={fields}
                        open={fieldDetailsOpen}
                        onClose={() => {
                            setFieldDetailsOpen(false)
                            setFields([])
                        }}
                    />
                )}
            </div>
        )
    },
)

export default AnalysisOutputTable
