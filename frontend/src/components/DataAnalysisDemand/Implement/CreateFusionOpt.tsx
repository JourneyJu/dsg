import React, { useEffect, useState } from 'react'
import {
    Button,
    Col,
    DatePicker,
    Drawer,
    Form,
    Input,
    message,
    Row,
    Select,
    Space,
} from 'antd'
import { trim } from 'lodash'
import moment from 'moment'
import { OrderType, SelectPriorityOptions } from '@/components/WorkOrder/helper'
import {
    checkNameWorkOrder,
    createWorkOrder,
    formatError,
    formsEnumConfig,
    putDataFusionInDataAnal,
} from '@/core'
import { CommonTitle } from '@/ui'
import { ErrorInfo } from '@/utils'
import DepartResponsibleSelect from '@/components/WorkOrder/DepartResponsibleSelect'
import __ from '../locale'
import styles from './styles.module.less'
import OutputDetails from '../Details/OutputDetails'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface ICreateFusionOpt {
    open: boolean
    onClose?: () => void
    onOk?: () => void
    data: any
    dataAnalRequireID: string
}
const CreateFusionOpt: React.FC<ICreateFusionOpt> = ({
    data,
    open,
    onClose,
    onOk,
    dataAnalRequireID,
}) => {
    const [form] = Form.useForm()
    const [dataTypeOptions, setDataTypeOptions] = useState<any[]>([])
    const [userInfo] = useCurrentUser()
    const getEnumConfig = async () => {
        const enumConfig = await formsEnumConfig()
        setDataTypeOptions(enumConfig?.data_type || [])
    }

    useEffect(() => {
        getEnumConfig()
    }, [])

    useEffect(() => {
        form.setFieldsValue({
            name: data?.name,
            responsible: {
                value: userInfo?.ID,
                key: userInfo?.ID,
                label: userInfo?.VisionName,
            },
        })
    }, [data, userInfo])

    const validateNameRepeat = (fid?: string) => {
        return (_: any, value: string) => {
            return new Promise((resolve, reject) => {
                const trimValue = trim(value)
                const errorMsg = __('该名称已存在，请重新输入')
                checkNameWorkOrder({
                    name: trimValue,
                    id: fid,
                    type: OrderType.FUNSION,
                })
                    .then((res) => {
                        if (res) {
                            reject(new Error(errorMsg))
                        } else {
                            resolve(1)
                        }
                    })
                    .catch(() => {
                        reject(new Error(errorMsg))
                    })
            })
        }
    }

    const onFinish = async (values) => {
        try {
            const { responsible, ...rest } = values
            const params = {
                ...rest,
                responsible_uid: responsible?.value,
                finished_at: values.finished_at
                    ? values.finished_at.endOf('day').unix()
                    : undefined,
                source_type: 'data_analysis',
                type: 'data_fusion',
                source_id: data.id,
                priority: values.priority ? values.priority.value : undefined,
                fusion_table: {
                    table_name: data.name,
                    fields: data.columns.map((col, index) => ({
                        index,
                        c_name: col.name_cn,
                        e_name: col.name_en,
                        data_length:
                            col.data_length > 38
                                ? 38
                                : col.data_length < 1
                                ? 1
                                : col.data_length,
                        data_type: dataTypeOptions.find(
                            (item) => item.value_en === col.data_type,
                        )?.id,
                        data_accuracy: col.data_accuracy,
                        data_range: col.data_range,
                        field_relationship: col.field_rel,
                        is_increment: col.is_increment_field,
                        is_required: col.is_mandatory,
                        is_standard: col.is_standardized,
                        primary_key: col.is_pk,
                        catalog_id: col.catalog_id,
                        code_rule_id: col.rule_code,
                        code_table_id: col.dict_code,
                        info_item_id: col.column_id,
                        standard_id: col.data_std_code,
                    })),
                },
            }
            // await createWorkOrder(params)
            await putDataFusionInDataAnal(
                dataAnalRequireID,
                data.id,
                JSON.stringify(params),
            )
            message.success(__('提交成功'))
            onOk?.()
            onClose?.()
        } catch (error) {
            formatError(error)
        }
    }

    return (
        <Drawer
            title={__('发起融合工单')}
            width={1438}
            open={open}
            onClose={onClose}
            footer={
                <Space size={8} className={styles['create-fusion-footer']}>
                    <Button onClick={onClose}>{__('取消')}</Button>
                    <Button type="primary" onClick={() => form.submit()}>
                        {__('提交')}
                    </Button>
                </Space>
            }
        >
            <div className={styles['create-fusion-wrapper']}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    className={styles.form}
                >
                    <div className={styles['common-title']}>
                        <CommonTitle title={__('基本信息')} />
                    </div>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                label={__('工单名称')}
                                name="name"
                                validateTrigger={['onChange', 'onBlur']}
                                validateFirst
                                rules={[
                                    {
                                        required: true,
                                        message: ErrorInfo.NOTNULL,
                                    },
                                    {
                                        validateTrigger: 'onBlur',
                                        validator: validateNameRepeat(),
                                    },
                                ]}
                            >
                                <Input
                                    placeholder={__('请输入工单名称')}
                                    maxLength={128}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={__('责任人')}
                                name="responsible"
                                rules={[
                                    {
                                        required: true,
                                        message: __('请选择责任人'),
                                    },
                                ]}
                            >
                                <DepartResponsibleSelect
                                    placeholder={__('请选择责任人')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={__('优先级')} name="priority">
                                <Select
                                    labelInValue
                                    placeholder={__('请选择优先级')}
                                    options={SelectPriorityOptions}
                                    getPopupContainer={(node) =>
                                        node.parentNode
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={__('截止日期')}
                                name="finished_at"
                                validateTrigger={['onChange', 'onBlur']}
                                validateFirst
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="YYYY-MM-DD"
                                    disabledDate={(current) => {
                                        return (
                                            current &&
                                            current < moment().startOf('day')
                                        )
                                    }}
                                    placeholder={__('请选择截止日期')}
                                    getPopupContainer={(node) =>
                                        node.parentElement || document.body
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={24}>
                            <Form.Item
                                label={__('工单说明')}
                                name="description"
                            >
                                <Input.TextArea
                                    placeholder={__('请输入')}
                                    maxLength={800}
                                    showCount
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <div className={styles['common-title']}>
                    <CommonTitle title={__('融合模型')} />
                </div>

                <div className={styles['name-container']}>
                    <div className={styles.label}>{__('融合表名称：')}</div>
                    <div className={styles.value}>{data?.name}</div>
                </div>
                <OutputDetails isDrawer={false} data={data} />
            </div>
        </Drawer>
    )
}

export default CreateFusionOpt
