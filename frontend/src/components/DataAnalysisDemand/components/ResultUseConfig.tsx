import {
    Button,
    Checkbox,
    Col,
    DatePicker,
    Drawer,
    Form,
    Input,
    Radio,
    Row,
    Select,
    Space,
    Table,
} from 'antd'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { stubFalse } from 'lodash'
import __ from '../locale'
import { CommonTitle, SearchInput } from '@/ui'
import { updateCycleOptions } from '@/components/CitySharing/const'
import { resourceUtilizationOptions } from '@/components/CitySharing/Apply/helper'
import {
    formatError,
    getDatasheetViewDetails,
    getDataSourceList,
    getFormsFromDatasource,
} from '@/core'
import styles from './styles.module.less'
import { FormatDataType, typeOptoins } from '@/components/ResourcesDir/const'
import BasicInfo from '../Details/BasicInfo'
import { resInfoFieldsConfig } from '../helper'

interface ResultUseConfigProps {
    open: boolean
    onClose: () => void
    data: any
    onOk: (useConfig: any) => void
}
const ResultUseConfig = ({
    open,
    onClose,
    data,
    onOk,
}: ResultUseConfigProps) => {
    const [form] = Form.useForm()
    const [dataSourceOptions, setDataSourceOptions] = useState<any[]>([])
    const [dataTableOptions, setDataTableOptions] = useState<
        {
            label: string
            value: string
        }[]
    >([])
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [selectedColumns, setSelectedColumns] = useState<any[]>([])
    const [fields, setFields] = useState<any[]>([])
    const [checked, setChecked] = useState(false)
    const [keyword, setKeyword] = useState('')

    useEffect(() => {
        if (data.use_conf) {
            const {
                time_range_type,
                time_range,
                column_ids,
                column_names,
                other_available_date,
                ...rest
            } = data.use_conf
            form.setFieldsValue({
                ...rest,
                time_range_type,
                time_range:
                    time_range_type === 'self-define'
                        ? time_range
                        : time_range.split('~').map((item) => moment(item)),
                other_available_date: other_available_date
                    ? moment(other_available_date)
                    : undefined,
            })
            const columnIds = JSON.parse(column_ids)
            setSelectedRowKeys(columnIds)
            setSelectedColumns(
                columnIds.map((id, index) => ({
                    id,
                    business_name: JSON.parse(column_names)[index],
                })),
            )
        }
    }, [data])

    const getDataSources = async () => {
        const { entries } = await getDataSourceList({
            limit: 999,
            source_type: 'sandbox',
        })
        setDataSourceOptions(entries)
    }

    const getDataTables = async (dataSourceId: string) => {
        try {
            const res = await getFormsFromDatasource(dataSourceId)
            setDataTableOptions(
                res.map((item) => ({
                    label: item,
                    value: item,
                })),
            )
        } catch (e) {
            formatError(e)
        }
    }

    const getFields = async () => {
        try {
            const res = await getDatasheetViewDetails(data.view_id)
            setFields(res.fields)
            form.setFieldsValue({
                push_fields: res.fields,
            })
        } catch (e) {
            formatError(e)
        }
    }

    useEffect(() => {
        if (data.view_id) {
            getFields()
        }
    }, [data.view_id])

    useEffect(() => {
        getDataSources()
    }, [])

    const pushFieldsColumns = [
        {
            title: __('源表业务名称'),
            dataIndex: 'business_name',
        },

        {
            title: __('源表技术名称'),
            dataIndex: 'technical_name',
        },
        {
            title: __('源表数据类型'),
            dataIndex: 'data_type',
            key: 'data_type',
            render: (text) => {
                const val =
                    typeOptoins.find(
                        (item) => item.value === FormatDataType(text),
                    )?.label || ''
                return <span title={val}>{val || '--'}</span>
            },
        },
    ]

    const rowSelection: any = useMemo(
        () => ({
            type: 'checkbox',
            selectedRowKeys,
            onChange: (selRowKeys: React.Key[], selectedRows: any[]) => {
                const newSelectedRowKeys = selectedRowKeys.filter(
                    (key) => !fields.find((item) => item.id === key),
                )
                const newSelectedColumns = selectedColumns.filter(
                    (item) => !fields.find((d) => d.id === item.id),
                )
                setSelectedRowKeys([...newSelectedRowKeys, ...selRowKeys])
                setSelectedColumns([...newSelectedColumns, ...selectedRows])
                form.validateFields(['push_fields'])
            },
        }),
        [selectedRowKeys, fields],
    )

    const onFinish = (values) => {
        const {
            push_fields,
            time_range_type,
            time_range,
            other_available_date,
            ...rest
        } = values
        onOk({
            ...rest,
            other_available_date: other_available_date
                ? other_available_date.endOf('day').valueOf()
                : undefined,
            time_range_type,
            time_range:
                time_range_type === 'self-define'
                    ? time_range
                    : time_range
                          .map((item) => item.format('YYYY-MM-DD'))
                          .join('~'),
            column_ids: JSON.stringify(selectedColumns.map((item) => item.id)),
            column_names: JSON.stringify(
                selectedColumns.map((item) => item.business_name),
            ),
        })
        onClose()
    }

    return (
        <Drawer
            title={__('成果使用配置')}
            width={826}
            open={open}
            onClose={onClose}
            bodyStyle={{ overflowX: 'hidden' }}
            footer={
                <Space className={styles['result-use-config-footer']}>
                    <Button onClick={onClose}>{__('取消')}</Button>
                    <Button type="primary" onClick={() => form.submit()}>
                        {__('保存')}
                    </Button>
                </Space>
            }
        >
            <div className={styles['result-use-config']}>
                <div className={styles['common-title']}>
                    <CommonTitle title={__('资源信息')} />
                </div>
                <BasicInfo details={data} config={resInfoFieldsConfig} />
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <div className={styles['common-title']}>
                        <CommonTitle title={__('资源使用配置')} />
                    </div>
                    <Form.Item
                        name="supply_type"
                        label={__('资源提供方式')}
                        required
                        className={styles.form_row}
                        initialValue="view"
                    >
                        <Radio.Group>
                            <Radio value="view">{__('库表交换')}</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        name="area_range"
                        label={__('期望空间范围')}
                        required
                        rules={[
                            {
                                required: true,
                                message: __('请输入'),
                            },
                        ]}
                    >
                        <Input
                            placeholder={__(
                                '请输入空间范围，如全市、市直、某各区、某个园区、某个街道等',
                            )}
                            maxLength={128}
                            style={{ width: 513 }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="time_range_type"
                        label={__('期望时间范围')}
                        required
                        rules={[
                            {
                                required: true,
                                message: __('请选择'),
                            },
                        ]}
                        className={styles.form_row}
                        initialValue="select"
                    >
                        <Radio.Group
                            onChange={() => form.resetFields(['time_range'])}
                        >
                            <Radio value="select">{__('选择日期')}</Radio>
                            <Radio value="self-define">
                                {__('自定义日期')}
                            </Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        shouldUpdate={(pre, cur) =>
                            pre.time_range_type !== cur.time_range_type
                        }
                    >
                        {({ getFieldValue }) => {
                            return getFieldValue('time_range_type') ===
                                'self-define' ? (
                                <Form.Item
                                    name="time_range"
                                    label=""
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message: __('请选择'),
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder={__('请输入时间范围')}
                                        maxLength={128}
                                        style={{
                                            width: 513,
                                        }}
                                    />
                                </Form.Item>
                            ) : (
                                <Form.Item
                                    name="time_range"
                                    label=""
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message: __('请选择时间范围'),
                                        },
                                    ]}
                                >
                                    <DatePicker.RangePicker
                                        style={{
                                            width: 513,
                                        }}
                                    />
                                </Form.Item>
                            )
                        }}
                    </Form.Item>
                    <Form.Item
                        name="push_frequency"
                        label={__('期望推送频率')}
                        required
                        rules={[
                            {
                                required: true,
                                message: __('请选择'),
                            },
                        ]}
                    >
                        <Select
                            options={updateCycleOptions}
                            placeholder={__('请选择')}
                            getPopupContainer={(n) => n.parentNode}
                            style={{ width: 513 }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="available_date_type"
                        label={__('资源使用期限')}
                        required
                        rules={[
                            {
                                required: true,
                                message: __('请选择'),
                            },
                        ]}
                        className={styles.form_row}
                        initialValue={-1}
                    >
                        <Radio.Group>
                            {resourceUtilizationOptions.map((option) => (
                                <Radio key={option.value} value={option.value}>
                                    {option.label}
                                </Radio>
                            ))}
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        shouldUpdate={(pre, cur) =>
                            pre.available_date_type !== cur.available_date_type
                        }
                        noStyle
                    >
                        {({ getFieldValue }) => {
                            return getFieldValue('available_date_type') ===
                                -2 ? (
                                <Form.Item
                                    name="other_available_date"
                                    label={__('选择日期')}
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message: __('请选择'),
                                        },
                                    ]}
                                >
                                    <DatePicker
                                        placeholder={__('请选择')}
                                        getPopupContainer={(n) => n}
                                        disabledDate={(current) => {
                                            return (
                                                current &&
                                                current < moment().endOf('day')
                                            )
                                        }}
                                        style={{ width: 513 }}
                                    />
                                </Form.Item>
                            ) : null
                        }}
                    </Form.Item>
                    <div className={styles['common-title']}>
                        <CommonTitle title={__('数据推送配置')} />
                    </div>

                    <Row gutter={78}>
                        <Col span={12}>
                            <Form.Item
                                name="dst_data_source_id"
                                label={__('目标数据源')}
                                className={styles.form_row}
                                required
                                rules={[
                                    {
                                        required: true,
                                        message: __('请选择'),
                                    },
                                ]}
                            >
                                <Select
                                    options={dataSourceOptions}
                                    fieldNames={{
                                        label: 'name',
                                        value: 'id',
                                    }}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.name ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    placeholder={__('请选择')}
                                    style={{ width: 284 }}
                                    onChange={(value) => {
                                        getDataTables(value)
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="dst_view_name"
                                label={__('目标数据表')}
                                className={styles.form_row}
                            >
                                <Select
                                    options={dataTableOptions}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    placeholder={__('请选择')}
                                    style={{ width: 284 }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="push_type"
                        label={__('推送机制')}
                        required
                        className={styles.form_row}
                        initialValue="full"
                    >
                        <Radio.Group>
                            <Radio value="full">{__('全量')}</Radio>
                            <Radio value="incr">{__('增量')}</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        name="push_fields"
                        label={
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: 755,
                                }}
                            >
                                <Space size={12}>
                                    {__('推送字段')}
                                    <Checkbox
                                        checked={checked}
                                        onChange={(e) => {
                                            setChecked(e.target.checked)
                                            form.setFieldsValue({
                                                push_fields: (e.target.checked
                                                    ? fields.filter((item) =>
                                                          selectedRowKeys.includes(
                                                              item.id,
                                                          ),
                                                      )
                                                    : fields
                                                ).filter((item) =>
                                                    item.business_name
                                                        .toLocaleLowerCase()
                                                        .includes(
                                                            keyword
                                                                .toLocaleLowerCase()
                                                                .trim(),
                                                        ),
                                                ),
                                            })
                                        }}
                                    >
                                        {__('只看已选')}
                                    </Checkbox>
                                </Space>
                                <SearchInput
                                    placeholder={__('搜索业务名称')}
                                    style={{ width: 200 }}
                                    onKeyChange={(key) => {
                                        setKeyword(key)
                                        form.setFieldsValue({
                                            push_fields: (checked
                                                ? selectedColumns
                                                : fields
                                            ).filter((item) =>
                                                item.business_name
                                                    .toLocaleLowerCase()
                                                    .includes(
                                                        key
                                                            .toLocaleLowerCase()
                                                            .trim(),
                                                    ),
                                            ),
                                        })
                                    }}
                                />
                            </div>
                        }
                        required
                        colon={false}
                        valuePropName="dataSource"
                        rules={[
                            {
                                required: true,
                                validator: (_, value) => {
                                    if (selectedRowKeys.length === 0) {
                                        return Promise.reject(
                                            new Error(__('请选择')),
                                        )
                                    }
                                    return Promise.resolve()
                                },
                            },
                        ]}
                    >
                        <Table
                            rowKey={(record) => record.id}
                            columns={pushFieldsColumns}
                            pagination={false}
                            rowSelection={rowSelection}
                        />
                    </Form.Item>
                </Form>
            </div>
        </Drawer>
    )
}

export default ResultUseConfig
