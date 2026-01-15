import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, message } from 'antd'
import { debounce } from 'lodash'
import __ from '../locale'
import styles from '../styles.module.less'
import DepartmentAndOrgSelect from '@/components/DepartmentAndOrgSelect'
import { formatError, createOrg, updateOrg, checkTagUnique } from '@/core'
import LeaderSelect from './LeaderSelect'
import { getFirstLetter } from '@/core/csIntelGateway'
import { getActualUrl } from '@/utils'

const { TextArea } = Input

interface CreateModalProps {
    // 是否打开
    open: boolean
    // 机构信息
    item?: any
    // 取消回调
    onCancel: () => void
    // 成功回调
    onSuccess: () => void
}

const OrganizationCreate: React.FC<CreateModalProps> = ({
    open,
    item,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm()
    const [selectedOrgInfo, setSelectedOrgInfo] = useState<any>(null)
    const [submitting, setSubmitting] = useState<boolean>(false)

    // 处理初始数据填充
    useEffect(() => {
        if (item && open) {
            // 处理user_ids：将逗号分割的字符串转换为数组
            let userIds = item.user_ids
            if (typeof userIds === 'string' && userIds) {
                userIds = userIds.split(',').filter((id) => id.trim())
            } else if (!userIds) {
                userIds = undefined
            }

            // 填充表单数据
            form.setFieldsValue({
                dept_id: item.id,
                dept_tag: item.dept_tag,
                user_ids: userIds,
                business_duty: item.business_duty || __('无'),
            })

            // 如果有机构ID，设置选中状态
            if (item.id) {
                setSelectedOrgInfo({
                    dept_id: item.id,
                    title: item.dept_name || '',
                    business_duty: item.business_duty || __('无'),
                })
            }
        }
    }, [item, open, form])

    // 处理机构选择变化
    const handleOrgSelect = async (value: string, info: any) => {
        if (value) {
            const isObj = info && typeof info === 'object'
            const title = isObj
                ? info?.title || ''
                : typeof info === 'string'
                ? info
                : ''

            const tag = getFirstLetter(title)
            form.setFieldsValue({
                dept_tag: tag,
                dept_id: value,
                business_duty: info?.business_duty || __('无'),
                user_ids: undefined, // 清空已选择的机构负责人
            })
            setSelectedOrgInfo({
                ...(isObj ? info : {}),
                dept_id: value,
            })
        } else {
            form.setFieldsValue({
                dept_tag: '',
                dept_id: '',
                business_duty: '',
                user_ids: undefined, // 清空已选择的机构负责人
            })
            setSelectedOrgInfo(null)
        }
    }

    const handleSubmit = async (values) => {
        const user_ids = values?.user_ids?.map((id) => ({
            user_id: id,
        }))

        const params = {
            dept_id: values?.dept_id,
            dept_tag: values?.dept_tag,
            business_duty: values?.business_duty,
            user_ids,
        }

        try {
            setSubmitting(true)
            if (item) {
                // 编辑模式
                const result = await updateOrg(item.id, params)
                message.success(__('机构更新成功'))
            } else {
                // 创建模式
                await createOrg(params)
                message.success(__('机构注册成功'))
            }

            onSuccess()
        } catch (error) {
            formatError(error)
        } finally {
            setSubmitting(false)
        }
    }

    // 自定义提交入口：先校验、再提交；用 submitting 作为全局锁避免重复触发
    const handleOk = async () => {
        if (submitting) return
        setSubmitting(true)
        try {
            await form.validateFields()
            const values = form.getFieldsValue()
            await handleSubmit(values)
        } finally {
            setSubmitting(false)
        }
    }

    // 防抖包裹 onOk
    const debouncedHandleOk = React.useMemo(
        () => debounce(() => handleOk(), 300),
        [],
    )

    // 组件卸载时取消防抖定时器
    useEffect(() => {
        return () => {
            debouncedHandleOk.cancel()
        }
    }, [debouncedHandleOk])

    return (
        <Modal
            title={item ? __('编辑机构') : __('机构注册')}
            open={open}
            onCancel={onCancel}
            onOk={debouncedHandleOk}
            okText={__('确定')}
            cancelText={__('取消')}
            width={560}
            destroyOnClose
            maskClosable={false}
            confirmLoading={submitting}
            okButtonProps={{ disabled: submitting }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className={styles.organizationForm}
            >
                <Form.Item
                    label={__('机构名称')}
                    name="dept_id"
                    rules={[
                        {
                            required: true,
                            message: __('请选择机构名称'),
                        },
                    ]}
                >
                    <DepartmentAndOrgSelect
                        allowClear
                        defaultValue={item?.id || ''}
                        disabled={!!item}
                        onSelect={handleOrgSelect}
                        placeholder={__('请选择')}
                        checkRegistered
                    />
                </Form.Item>

                <Button
                    type="link"
                    className={styles.helpLink}
                    onClick={() =>
                        window.open(
                            getActualUrl('/systemConfig/businessArchitecture'),
                            '_blank',
                        )
                    }
                >
                    {__('找不到机构？请到组织架构同步数据>>')}
                </Button>

                <Form.Item
                    label={__('机构标识')}
                    name="dept_tag"
                    validateTrigger="onBlur"
                    rules={[
                        {
                            required: true,
                            message: __('请输入机构标识'),
                        },
                        {
                            validator: async (_, value) => {
                                // 编辑模式下不检查唯一性，因为字段不允许编辑
                                if (item) {
                                    return Promise.resolve()
                                }

                                if (value) {
                                    const res = await checkTagUnique({
                                        dept_tag: value,
                                    })
                                    if (res) {
                                        throw new Error(__('机构标识已存在'))
                                    }
                                }
                                return Promise.resolve()
                            },
                        },
                    ]}
                >
                    <Input
                        disabled={!selectedOrgInfo || !!item}
                        placeholder={__('请先选择机构名称')}
                    />
                </Form.Item>

                <Form.Item
                    label={__('机构负责人')}
                    name="user_ids"
                    rules={[
                        {
                            required: true,
                            message: __('请选择机构负责人'),
                        },
                    ]}
                >
                    <LeaderSelect orgInfo={selectedOrgInfo} />
                </Form.Item>

                <Button
                    type="link"
                    className={styles.helpLink}
                    onClick={() =>
                        window.open(
                            getActualUrl('/dataServiceManage/ownerRegister'),
                            '_blank',
                        )
                    }
                >
                    {__('找不到负责人？请到负责人注册进行注册>>')}
                </Button>

                <Form.Item
                    label={__('机构业务责任')}
                    name="business_duty"
                    rules={[
                        {
                            required: true,
                            message: __('请输入机构业务责任'),
                        },
                    ]}
                >
                    <TextArea
                        rows={4}
                        disabled
                        style={{ resize: 'none' }}
                        placeholder={__('请先选择机构名称，将自动填充业务责任')}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default OrganizationCreate
