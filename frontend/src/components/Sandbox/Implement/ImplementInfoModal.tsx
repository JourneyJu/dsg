import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import {
    Button,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Row,
    Select,
} from 'antd'
import __ from '../locale'
import {
    formatError,
    getDataSourceList,
    ISandboxImplementItem,
    postSandboxImplement,
} from '@/core'
import { SandboxImpTypeOptions } from '../const'

interface ImplementInfoModalProps {
    open: boolean
    onClose: () => void
    onOk: () => void
    data: ISandboxImplementItem
}
const ImplementInfoModal: React.FC<ImplementInfoModalProps> = ({
    open,
    onClose,
    onOk,
    data,
}) => {
    const [form] = Form.useForm()
    const [dataSourceOptions, setDataSourceOptions] = useState<any[]>([])
    // const [dbTypeOptions, setDbTypeOptions] = useState<any[]>([])

    useEffect(() => {
        if (data) {
            form.setFieldsValue({
                type: data.operation,
                request_space: data.request_space || 0,
                user_name: data.username,
                password: atob(data.password),
            })
        }
    }, [data])
    useEffect(() => {
        getDataSources()
    }, [])

    const getDataSources = async () => {
        const { entries } = await getDataSourceList({
            limit: 999,
        })
        setDataSourceOptions(entries)
    }

    const onFinish = async (values) => {
        try {
            await postSandboxImplement({
                ...values,
                apply_id: data.apply_id,
                datasource_name: dataSourceOptions.find(
                    (item) => item.id === values.datasource_id,
                ).name,
                password: btoa(values.password),
            })
            onOk()
            onClose()
            message.success(__('实施成功'))
        } catch (error) {
            formatError(error)
        }
    }

    const handleDatasourceChange = (ds: string) => {
        const target = dataSourceOptions.find((item) => item.id === ds)
        form.setFieldsValue({
            datasource_type: target.type,
            database_name: target.schema,
        })
    }

    return (
        <Modal
            title={__('实施信息')}
            width={640}
            bodyStyle={{ height: 369 }}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
        >
            <Form
                form={form}
                autoComplete="off"
                layout="vertical"
                onFinish={onFinish}
            >
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item label={__('实施类型')} name="type">
                            <Select
                                placeholder={__('请选择')}
                                disabled
                                options={SandboxImpTypeOptions}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label={__('申请容量')} name="request_space">
                            <InputNumber
                                placeholder={__('请输入')}
                                addonAfter="G"
                                style={{ width: '100%' }}
                                min={0}
                                disabled
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="datasource_id"
                            label={__('数据源名称')}
                            required
                            rules={[
                                {
                                    required: true,
                                    message: __('请选择'),
                                },
                            ]}
                        >
                            <Select
                                placeholder={__('请选择')}
                                options={dataSourceOptions}
                                fieldNames={{
                                    label: 'name',
                                    value: 'id',
                                }}
                                onChange={handleDatasourceChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="datasource_type"
                            label={__('数据库类型')}
                        >
                            <Input placeholder={__('请输入')} disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="database_name"
                            label={__('表空间名称')}
                        >
                            <Input placeholder={__('请输入')} disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="user_name"
                            label={__('沙箱用户名')}
                            required
                            rules={[
                                {
                                    required: true,
                                    message: __('请输入'),
                                },
                            ]}
                        >
                            <Input placeholder={__('请输入')} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="password"
                            label={__('沙箱密码')}
                            required
                            rules={[
                                {
                                    required: true,
                                    message: __('请输入'),
                                },
                            ]}
                        >
                            <Input.Password placeholder={__('请输入')} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default ImplementInfoModal
