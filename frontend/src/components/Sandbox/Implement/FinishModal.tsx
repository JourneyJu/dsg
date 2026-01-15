import React, { useEffect, useMemo, useState } from 'react'
import { Col, Form, Input, message, Modal, Row, Select } from 'antd'
import __ from '../locale'
import { SandboxImpTypeOptions } from '../const'
import {
    formatError,
    ISandboxImplementItem,
    postSandboxImpFinish,
} from '@/core'

interface FinishModalProps {
    open: boolean
    onClose: () => void
    onOk: () => void
    data: ISandboxImplementItem
}
const FinishModal: React.FC<FinishModalProps> = ({
    open,
    onClose,
    onOk,
    data,
}) => {
    const [form] = Form.useForm()
    useEffect(() => {
        if (data) {
            form.setFieldsValue({
                type: data.operation,
            })
        }
    }, [data])

    const onFinish = async (values) => {
        try {
            await postSandboxImpFinish({
                ...values,
                execution_id: data.id,
            })
            message.success(__('提交成功'))
            onOk()
            onClose()
        } catch (error) {
            formatError(error)
        }
    }

    return (
        <Modal
            title={__('实施完成')}
            width={640}
            bodyStyle={{ height: 276 }}
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
                                options={SandboxImpTypeOptions}
                                disabled
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="desc"
                            label={__('实施说明')}
                            required
                            rules={[
                                {
                                    required: true,
                                    message: __('请输入'),
                                },
                            ]}
                        >
                            <Input.TextArea
                                placeholder={__('请输入')}
                                style={{ height: 120, resize: 'none' }}
                                maxLength={800}
                                showCount
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default FinishModal
