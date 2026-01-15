import {
    Badge,
    Button,
    Drawer,
    Input,
    Radio,
    Space,
    Table,
    Tooltip,
} from 'antd'
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react'
import styles from './styles.module.less'
import __ from '../locale'
import { Empty, SearchInput } from '@/ui'
import OutputDetails from '../Details/OutputDetails'
import dataEmpty from '@/assets/dataEmpty.svg'
import FieldDetails from './FieldDetails'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import ResultUseConfig from './ResultUseConfig'
import { IDataAnalImplementInfo } from '@/core'
import PushConfig from '../DataPush/PushConfig'
import { getActualUrl } from '@/utils'
import ResultUseConfigDetails from '../Details/ResultUseConfigDetails'

const defaultColKeys = [
    'catalog_name',
    'view_busi_name',
    'columns',
    'operation',
]
interface AnalysisOutputTableProps {
    // IDataAnalImplementInfo
    data?: any[]
    dataChangeCallback?: (data: any[]) => void
    applyId?: string
    colKeys?: string[]
    operationKeys?: string[]
}

const AnalysisResultTable = forwardRef(
    (
        {
            data,
            dataChangeCallback,
            applyId,
            colKeys = defaultColKeys,
            operationKeys,
        }: AnalysisOutputTableProps,
        ref,
    ) => {
        const [items, setItems] = useState<IDataAnalImplementInfo[]>([])
        const [outputDetailsOpen, setOutputDetailsOpen] = useState(false)
        const [operateItem, setOperateItem] = useState<any>(null)
        const [keyword, setKeyword] = useState('')

        const [fieldDetailsOpen, setFieldDetailsOpen] = useState(false)
        const [fields, setFields] = useState<any[]>([])
        const [resultUseConfigOpen, setResultUseConfigOpen] = useState(false)
        const [pushConfigOpen, setPushConfigOpen] = useState(false)
        const [resultUseConfigDetailsOpen, setResultUseConfigDetailsOpen] =
            useState(false)

        const showItems = useMemo(() => {
            return !keyword
                ? items
                : items.filter((item) =>
                      item.view_busi_name
                          .toLowerCase()
                          .includes(keyword.toLowerCase()),
                  )
        }, [items, keyword])

        useImperativeHandle(ref, () => ({
            items,
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
            return [
                {
                    title: __('分析场景产物名称'),
                    dataIndex: 'name',
                    key: 'name',
                },
                {
                    title: __('数据目录名称（编码）'),
                    dataIndex: 'catalog_name',
                    key: 'catalog_name',
                    render: (text: string, record: any) => {
                        return (
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
                        )
                    },
                },
                {
                    title: __('挂接数据资源名称（编码）'),
                    dataIndex: 'view_busi_name',
                    key: 'view_busi_name',
                    render: (text: string, record: any) => {
                        return (
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
                        )
                    },
                },
                {
                    title: __('信息项'),
                    dataIndex: 'columns',
                    key: 'columns',
                    render: (text: string, record: any) => {
                        const fieldsData = record.columns || record.fields
                        if (!Array.isArray(fieldsData)) return '--'
                        const firstColumnName = fieldsData[0]?.name_cn
                        const columnsLen = fieldsData.length
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
                                            setFields(fieldsData)
                                        }}
                                    >
                                        +{columnsLen - 1}
                                    </div>
                                )}
                            </div>
                        )
                    },
                },
                {
                    title: __('操作'),
                    dataIndex: 'operation',
                    key: 'operation',
                    render: (text: string, record: any, index: number) => (
                        <Space size={16}>
                            {operationKeys?.includes('details') && (
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setOutputDetailsOpen(true)
                                        setOperateItem(record)
                                    }}
                                >
                                    {__('详情')}
                                </Button>
                            )}
                            {operationKeys?.includes('view') && (
                                <Button
                                    type="link"
                                    onClick={() => {
                                        window.open(
                                            getActualUrl(
                                                `/dataService/dirContent?catlgId=${record.catalog_id}`,
                                            ),
                                            '_blank',
                                        )
                                    }}
                                >
                                    {__('查看')}
                                </Button>
                            )}
                            {operationKeys?.includes('viewCatalog') && (
                                <Button
                                    type="link"
                                    onClick={() => {
                                        window.open(
                                            getActualUrl(
                                                `/dataService/dirContent?catlgId=${record.catalog_id}`,
                                            ),
                                            '_blank',
                                        )
                                    }}
                                >
                                    {__('查看目录')}
                                </Button>
                            )}

                            {operationKeys?.includes('resultUseConfig') && (
                                <Badge dot={!record.use_conf}>
                                    <Button
                                        type="link"
                                        onClick={() => {
                                            setResultUseConfigOpen(true)
                                            setOperateItem(record)
                                        }}
                                    >
                                        {__('成果使用配置')}
                                    </Button>
                                </Badge>
                            )}
                            {operationKeys?.includes('dataPushConifg') && (
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setPushConfigOpen(true)
                                        setOperateItem(record)
                                    }}
                                >
                                    {__('数据推送配置')}
                                </Button>
                            )}
                            {operationKeys?.includes('viewResultUseConfig') && (
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setOperateItem(record)
                                        setResultUseConfigDetailsOpen(true)
                                    }}
                                >
                                    {__('查看成果使用配置')}
                                </Button>
                            )}
                        </Space>
                    ),
                },
            ].filter((item) => colKeys.includes(item.key))
        }, [items, colKeys, operationKeys])

        const handleResultUseConfigOk = (useConfig: any) => {
            setItems(
                items.map((item) => {
                    if (item.id === operateItem?.id) {
                        return {
                            ...item,
                            use_conf: useConfig,
                        }
                    }
                    return item
                }),
            )
        }

        const handlePushConfigOk = (pushId: string) => {
            setItems(
                items.map((item) => {
                    if (item.id === operateItem?.id) {
                        return {
                            ...item,
                            pushId,
                        }
                    }
                    return item
                }),
            )
        }

        return (
            <div className={styles['analysis-output-table']}>
                <div className={styles['analysis-output-table-header']}>
                    <div />
                    <SearchInput
                        placeholder={__('搜索数据目录名称')}
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

                {outputDetailsOpen && (
                    <OutputDetails
                        open={outputDetailsOpen}
                        onClose={() => setOutputDetailsOpen(false)}
                        data={operateItem}
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
                {resultUseConfigOpen && (
                    <ResultUseConfig
                        open={resultUseConfigOpen}
                        onClose={() => setResultUseConfigOpen(false)}
                        data={operateItem}
                        onOk={handleResultUseConfigOk}
                    />
                )}
                {pushConfigOpen && applyId && (
                    <PushConfig
                        open={pushConfigOpen}
                        onClose={() => setPushConfigOpen(false)}
                        implItem={operateItem}
                        applyId={applyId}
                        onOk={handlePushConfigOk}
                    />
                )}
                {resultUseConfigDetailsOpen && (
                    <Drawer
                        title={__('成果使用配置')}
                        width={826}
                        open={resultUseConfigDetailsOpen}
                        onClose={() => setResultUseConfigDetailsOpen(false)}
                        bodyStyle={{ overflowX: 'hidden' }}
                        footer={null}
                    >
                        <ResultUseConfigDetails data={operateItem} />
                    </Drawer>
                )}
            </div>
        )
    },
)

export default AnalysisResultTable
