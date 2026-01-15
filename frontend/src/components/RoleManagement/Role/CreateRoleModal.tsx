import React, { useEffect, useState } from 'react'
import { Avatar, Button, Form, Input, message, Modal } from 'antd'
import { trim } from 'lodash'
import {
    formatError,
    getRoleNameCheck,
    postRole,
    putRole,
    roleAvatarColor,
} from '@/core'
import { OperateType } from '@/utils'
import __ from './locale'

interface ICreateRoleModal {
    open: boolean
    operate?: OperateType
    roleData?: any
    onClose: (refresh?: boolean) => void
}

/** 创建/编辑 角色 */
const CreateRoleModal: React.FC<ICreateRoleModal> = ({
    open,
    operate,
    roleData,
    onClose,
}) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    // 头像文字
    const [avatarText, setAvatarText] = useState<string>('')
    // 头像颜色
    const [avatarColor, setAvatarColor] = useState<string>('')

    useEffect(() => {
        if (open && operate === OperateType.EDIT && roleData) {
            const { name, description } = roleData
            form.setFieldsValue({ name, description })
            setAvatarText(roleData?.name?.[0])
            setAvatarColor(roleData?.color || '1')
            return
        }

        // 随机颜色
        const colorKeys = Object.keys(roleAvatarColor)
        const randomKey =
            colorKeys[Math.floor(Math.random() * colorKeys.length)]
        setAvatarColor(randomKey)
        setAvatarText('')
        form.resetFields()
    }, [open])

    // 对话框onOk
    const handleModalOk = async () => {
        try {
            setLoading(true)
            await form.validateFields()
            const { name, description } = form.getFieldsValue()
            if (operate === OperateType.CREATE) {
                await postRole({
                    name,
                    description,
                    color: avatarColor,
                })
                message.success(__('新建自定义角色成功'))
            } else {
                await putRole(roleData?.id || '', {
                    name,
                    description,
                })
                message.success(__('编辑自定义角色成功'))
            }
            onClose(true)
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
                const errorMsg = __('该角色名称已存在，请重新输入')
                getRoleNameCheck({
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
                    ? __('新建自定义角色')
                    : __('编辑自定义角色')
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
                    label={__('角色名称')}
                    required
                    style={{ marginBottom: 0 }}
                >
                    <div style={{ display: 'flex' }}>
                        <Avatar
                            size={32}
                            style={{
                                backgroundColor: roleAvatarColor[avatarColor],
                                marginRight: 8,
                                flexShrink: 0,
                                fontSize: 16,
                                fontWeight: 550,
                            }}
                        >
                            {avatarText || '角'}
                        </Avatar>
                        <Form.Item
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
                                    validator: validateNameRepeat(roleData?.id),
                                },
                            ]}
                            style={{ flex: 1 }}
                        >
                            <Input
                                placeholder={__('请输入')}
                                maxLength={128}
                                allowClear
                                onBlur={(e) => {
                                    setAvatarText(e.target.value?.[0])
                                }}
                            />
                        </Form.Item>
                    </div>
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

export default CreateRoleModal
