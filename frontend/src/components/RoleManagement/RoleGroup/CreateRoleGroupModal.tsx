import React, { useEffect, useState } from 'react'
import { Button, Form, Input, message, Modal } from 'antd'
import { trim } from 'lodash'
import {
    formatError,
    getRoleGroupNameCheck,
    postRoleGroup,
    putRoleGroup,
} from '@/core'
import { OperateType } from '@/utils'
import __ from './locale'

interface ICreateRoleGroupModal {
    open: boolean
    operate?: OperateType
    roleGroupData?: any
    onClose: (refresh?: boolean, id?: string) => void
}

/** 创建/编辑 角色组 */
const CreateRoleGroupModal: React.FC<ICreateRoleGroupModal> = ({
    open,
    operate,
    roleGroupData,
    onClose,
}) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && operate === OperateType.EDIT && roleGroupData) {
            const { name, description } = roleGroupData
            form.setFieldsValue({ name, description })
            return
        }
        form.resetFields()
    }, [open])

    // 对话框onOk
    const handleModalOk = async () => {
        try {
            setLoading(true)
            await form.validateFields()
            const { name, description } = form.getFieldsValue()
            if (operate === OperateType.CREATE) {
                const res = await postRoleGroup({
                    name,
                    description,
                })
                message.success(__('新建角色组成功'))
                onClose(true, res?.id)
            } else {
                await putRoleGroup(roleGroupData?.id || '', {
                    name,
                    description,
                })
                message.success(__('编辑角色组成功'))
                onClose(true)
            }
        } catch (e) {
            if (e.errorFields) {
                return
            }
            formatError(e)
        } finally {
            setLoading(false)
        }
    }

    // 验证名称是否重复
    const validateNameRepeat = (_id?: string) => {
        return (_: any, value: string) => {
            return new Promise((resolve, reject) => {
                const trimValue = trim(value)
                if (!trimValue) {
                    reject(new Error(__('输入不能为空')))
                    return
                }
                const errorMsg = __('该角色组名称已存在，请重新输入')
                getRoleGroupNameCheck({
                    name: trimValue,
                    id: _id,
                })
                    .then((res) => {
                        if (res) {
                            reject(new Error(errorMsg))
                        } else {
                            resolve(1)
                        }
                    })
                    .catch((err) => {
                        formatError(err)
                        reject(new Error(err?.data?.description))
                    })
            })
        }
    }

    return (
        <Modal
            title={
                operate === OperateType.CREATE
                    ? __('新建角色组')
                    : __('编辑角色组')
            }
            width={640}
            maskClosable={false}
            open={open}
            onCancel={() => onClose()}
            destroyOnClose
            getContainer={false}
            okButtonProps={{ loading }}
            footer={[
                <Button
                    onClick={() => onClose()}
                    key="cancel"
                    style={{ minWidth: 80 }}
                >
                    {__('取消')}
                </Button>,
                <Button
                    type="primary"
                    onClick={handleModalOk}
                    loading={loading}
                    key="confirm"
                    style={{ minWidth: 80 }}
                >
                    {__('确定')}
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                initialValues={{ remember: true }}
            >
                <Form.Item
                    required
                    label={__('角色组名称')}
                    name="name"
                    validateFirst
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                        {
                            required: true,
                            validateTrigger: 'onChange',
                            transform: (value: string) => trim(value),
                            message: __('输入不能为空'),
                        },
                        {
                            validateTrigger: 'onBlur',
                            validator: validateNameRepeat(roleGroupData?.id),
                        },
                    ]}
                >
                    <Input
                        placeholder={__('请输入')}
                        maxLength={128}
                        allowClear
                    />
                </Form.Item>
                <Form.Item label={__('描述')} name="description">
                    <Input.TextArea
                        placeholder={__('请输入')}
                        maxLength={255}
                        autoSize={{ minRows: 6, maxRows: 6 }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default CreateRoleGroupModal
