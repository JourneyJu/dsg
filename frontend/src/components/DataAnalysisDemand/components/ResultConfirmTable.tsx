import { Button, Input, Radio, Space, Table, Tooltip } from 'antd'
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
import RemarkModal from './RemarkModal'
import ResultUseConfig from './ResultUseConfig'

interface AnalysisOutputTableProps {
    data?: any[]
    dataChangeCallback?: (data: any[]) => void
}

const ResultConfirmTable = forwardRef(
    ({ data, dataChangeCallback }: AnalysisOutputTableProps, ref) => {
        const [items, setItems] = useState<any[]>([])
        const [outputDetailsOpen, setOutputDetailsOpen] = useState(false)
        const [operateItem, setOperateItem] = useState<any>(null)
        const [keyword, setKeyword] = useState('')

        const [fieldDetailsOpen, setFieldDetailsOpen] = useState(false)
        const [fields, setFields] = useState<any[]>([])
        const [resultUseConfigOpen, setResultUseConfigOpen] = useState(false)

        const showItems = useMemo(() => {
            return !keyword
                ? items
                : items.filter((item) =>
                      item.name.toLowerCase().includes(keyword.toLowerCase()),
                  )
        }, [items, keyword])

        useImperativeHandle(ref, () => ({
            items,
        }))

        const [remarkModalOpen, setRemarkModalOpen] = useState(false)

        useEffect(() => {
            if (data) {
                setItems(data)
            }
        }, [data])

        useEffect(() => {
            dataChangeCallback?.(items)
        }, [items])

        const handleRemarkSubmit = (remark: string) => {
            setItems(
                items.map((item) => {
                    if (item.id === operateItem?.id) {
                        return {
                            ...item,
                            use_remark: remark,
                        }
                    }
                    return item
                }),
            )
            setRemarkModalOpen(false)
            setOperateItem(null)
        }

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

        const columns = useMemo(() => {
            const cols = [
                {
                    title: __('分析场景产物名称'),
                    dataIndex: 'name',
                    key: 'name',
                },
                {
                    title: __('分析成果'),
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
                {
                    title: (
                        <div>
                            <span style={{ color: '#FF4D4F', marginRight: 4 }}>
                                *
                            </span>
                            {__('成果是否可使用')}
                        </div>
                    ),
                    dataIndex: 'is_usable',
                    key: 'is_usable',
                    render: (val: boolean, record) => (
                        <Radio.Group
                            value={val}
                            onChange={(e) => {
                                setItems(
                                    items.map((item) => {
                                        if (item.id === record.id) {
                                            return {
                                                ...item,
                                                is_usable: e.target.value,
                                            }
                                        }
                                        return item
                                    }),
                                )
                            }}
                        >
                            <Radio value>
                                <Tooltip
                                    title={__('若选择“是”，请配置成果使用信息')}
                                >
                                    {__('是')}
                                </Tooltip>
                            </Radio>
                            <Radio value={false}>{__('否')}</Radio>
                        </Radio.Group>
                    ),
                },
                {
                    title: (
                        <div>
                            <span style={{ color: '#FF4D4F', marginRight: 4 }}>
                                *
                            </span>
                            {__('理由说明')}
                        </div>
                    ),
                    dataIndex: 'use_remark',
                    key: 'use_remark',
                    render: (val, record) => (
                        <Space size={8}>
                            <Input
                                style={{ width: 200 }}
                                value={val || undefined}
                                onChange={(e) => {
                                    setItems(
                                        items.map((item) => {
                                            if (item.id === record.id) {
                                                return {
                                                    ...item,
                                                    use_remark: e.target.value,
                                                }
                                            }
                                            return item
                                        }),
                                    )
                                }}
                                placeholder={
                                    record.is_usable ? __('请输入') : __('必填')
                                }
                                prefix={
                                    record.is_usable ? null : (
                                        <span style={{ color: '#ff4d4f' }}>
                                            *
                                        </span>
                                    )
                                }
                            />
                            <FontIcon
                                name="icon-a-quanpingyiquanpingzhuangtai"
                                type={IconType.FONTICON}
                                className={styles['use-remark-icon']}
                                onClick={(e) => {
                                    setOperateItem(record)
                                    setRemarkModalOpen(true)
                                }}
                            />
                        </Space>
                    ),
                },
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
                            <Button
                                type="link"
                                onClick={() => {
                                    setResultUseConfigOpen(true)
                                    setOperateItem(record)
                                }}
                                disabled={!record.is_usable}
                            >
                                {__('成果使用配置')}
                            </Button>
                        </Space>
                    ),
                },
            ]
            return cols
        }, [items])

        return (
            <div className={styles['analysis-output-table']}>
                <div className={styles['analysis-output-table-header']}>
                    <div />
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
                {remarkModalOpen && (
                    <RemarkModal
                        open={remarkModalOpen}
                        initialValues={operateItem?.use_remark}
                        onClose={() => setRemarkModalOpen(false)}
                        onSubmit={handleRemarkSubmit}
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
            </div>
        )
    },
)

export default ResultConfirmTable
