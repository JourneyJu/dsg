import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, message, Select, Row, Col } from 'antd'
import __ from '../locale'
import styles from '../styles.module.less'
// import DepartmentAndOrgSelect from '@/components/DepartmentAndOrgSelect'
import { formatError, putApiSub, IGetApiSubListResponse } from '@/core'
import { formatIpPortItem, CallFrequencyInput } from '../helper'

interface CreateModalProps {
    // 是否打开
    open: boolean
    // 机构信息
    item: IGetApiSubListResponse
    // 取消回调
    onCancel: () => void
    // 成功回调
    onSuccess: () => void
}

// 自定义必填标签组件
const RequiredLabel: React.FC<{
    children: React.ReactNode
}> = ({ children }) => (
    <span>
        <span className={styles.requiredLabel}>*</span>
        {children}
    </span>
)

const SystemAccessEdit: React.FC<CreateModalProps> = ({
    open,
    item,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm()

    // 处理初始数据填充
    useEffect(() => {
        if (item && open) {
            const {
                org_code,
                apply_org_code,
                system_id,
                app_id,
                ip_addr,
                call_frequency,
            } = item || {}

            // 填充表单数据
            form.setFieldsValue({
                org_code,
                apply_org_code,
                system_id,
                app_id,
                ip_addr: ip_addr?.map((i) => formatIpPortItem(i)).join(';'),
                call_frequency: call_frequency || 1,
            })
        }
    }, [item, open, form])

    const handleSubmit = async (values) => {
        try {
            // 编辑模式
            await putApiSub(item.id, {
                call_frequency: values?.call_frequency || 1,
            })
            message.success(__('编辑成功'))

            onSuccess()
        } catch (error) {
            formatError(error)
        }
    }

    return (
        <Modal
            title={__('编辑')}
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            okText={__('确定')}
            cancelText={__('取消')}
            width={600}
            destroyOnClose
            maskClosable={false}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className={styles.organizationForm}
            >
                <Row gutter={40} className={styles.contentWrapper}>
                    <Col span={12}>
                        <Form.Item
                            label={
                                <RequiredLabel>
                                    {__('服务所属部门')}
                                </RequiredLabel>
                            }
                            name="org_code"
                        >
                            <Select
                                options={[
                                    {
                                        label: item?.org_name,
                                        value: item?.org_code,
                                    },
                                ]}
                                disabled
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={
                                <RequiredLabel>{__('接入部门')}</RequiredLabel>
                            }
                            name="apply_org_code"
                        >
                            <Select
                                options={[
                                    {
                                        label: item?.apply_org_name,
                                        value: item?.apply_org_code,
                                    },
                                ]}
                                disabled
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={
                                <RequiredLabel>{__('接入系统')}</RequiredLabel>
                            }
                            name="system_id"
                        >
                            <Select
                                options={[
                                    {
                                        label: item?.system_name,
                                        value: item?.system_id,
                                    },
                                ]}
                                disabled
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={
                                <RequiredLabel>{__('接入应用')}</RequiredLabel>
                            }
                            name="app_id"
                        >
                            <Select
                                options={[
                                    {
                                        label: item?.app_name,
                                        value: item?.app_id,
                                    },
                                ]}
                                disabled
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label={__('调用频率')}
                            name="call_frequency"
                            rules={[
                                { required: true, message: __('输入不能为空') },
                            ]}
                        >
                            <CallFrequencyInput min={1} max={2000} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label={
                                <RequiredLabel>
                                    {__('接入IP及端口')}
                                </RequiredLabel>
                            }
                            name="ip_addr"
                        >
                            <Input allowClear disabled />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default SystemAccessEdit
