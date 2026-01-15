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
import DepartmentAndOrgSelect from '../../DepartmentAndOrgSelect'
import {
    formatError,
    getCurUserDepartment,
    getProjects,
    IProject,
    ISandboxApplyItem,
    postSandboxExtend,
} from '@/core'
import __ from '../locale'
import styles from './styles.module.less'
import { CommonTitle } from '@/ui'
import BasicInfo from '../Details/BasicInfo'
import { expandBaseInfoConfig } from '../helper'

interface ExpandCapacityProps {
    open: boolean
    onClose: () => void
    onOk: () => void
    data?: ISandboxApplyItem
}
const ExpandCapacity: React.FC<ExpandCapacityProps> = ({
    open,
    onClose,
    onOk,
    data,
}) => {
    const [form] = Form.useForm()

    const onFinish = async (values) => {
        try {
            await postSandboxExtend({ ...values, sandbox_id: data?.sandbox_id })
            onClose()
            onOk()
            message.success(__('申请成功'))
        } catch (error) {
            formatError(error)
        }
    }

    return (
        <Modal
            title={__('扩容申请')}
            width={640}
            bodyStyle={{ height: 470 }}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
        >
            <Form
                form={form}
                autoComplete="off"
                layout="vertical"
                onFinish={onFinish}
                className={styles['expand-capacity-form']}
            >
                <Row gutter={24}>
                    <Col span={24} className={styles['common-title']}>
                        <CommonTitle title={__('基本信息')} />
                    </Col>
                    <BasicInfo config={expandBaseInfoConfig} details={data} />
                    <Col span={24} className={styles['common-title']}>
                        <CommonTitle title={__('增量信息')} />
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={__('申请容量')}
                            name="request_space"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: __('请输入'),
                                },
                            ]}
                        >
                            <InputNumber
                                placeholder={__('请输入')}
                                addonAfter="G"
                                style={{ width: '100%' }}
                                min={1}
                                precision={0}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            name="reason"
                            label={__('申请原因')}
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
                                autoSize={{
                                    minRows: 4,
                                    maxRows: 4,
                                }}
                                showCount
                                maxLength={800}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default ExpandCapacity
