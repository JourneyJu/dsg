import * as React from 'react'
import { useState, useEffect } from 'react'
import { Modal, Form, Input } from 'antd'
import { noop, trim } from 'lodash'
import { useGetState } from 'ahooks'
import { nameReg } from '@/utils'
import { formatError, roleDuplicated } from '@/core'
import { roleIconInfo } from '@/core/apis/configurationCenter/index.d'
import { validateName } from '@/utils/validate'
import SelectIcon from './SelectIcon'
import __ from './locale'
import styles from './styles.module.less'

interface RoleInfoType {
    data: any
    title: string
    onCancel: () => void
    onConfirm: (newRole) => void
    defaultIcons: Array<roleIconInfo>
}

const RoleInfo = ({
    data = null,
    title = __('添加角色'),
    onCancel = noop,
    onConfirm = noop,
    defaultIcons,
}: RoleInfoType) => {
    const [roleInfo, setRoleInfo] = React.useState<any>(null)
    const [form] = Form.useForm()
    const [loading, setLoading] = useState<boolean>(false)

    const onFinish = async () => {
        // 发请求

        setLoading(true)
        try {
            await form.validateFields()
            await onConfirm(roleInfo)
        } finally {
            setLoading(false)
        }
    }

    const onValuesChange = (value) => {
        setRoleInfo({ ...roleInfo, ...value, name: trim(value.name) })
    }

    useEffect(() => {
        form.resetFields()
        setRoleInfo(data)
    }, [data])

    /**
     * 检查重复
     * @param rule
     * @param value 当前输入的值
     * @returns
     */
    const checkNameRepeat = async (rule, value) => {
        try {
            if (data.id) {
                await roleDuplicated({ id: data.id, name: trim(value) })
            } else {
                await roleDuplicated({ name: trim(value) })
            }
            return Promise.resolve()
        } catch (ex) {
            if (ex?.data?.code === 'ConfigurationCenter.Role.RoleNameRepeat') {
                return Promise.reject(
                    new Error(__('该角色名称已存在，请重新输入')),
                )
            }
            formatError(ex)
            return Promise.reject(new Error(''))
        }
    }

    const checkNameCorrect = (rule, value) => {
        if (nameReg.test(trim(value))) {
            return Promise.resolve()
        }
        return Promise.reject(
            new Error(__('仅支持中英文、数字、下划线及中划线')),
        )
    }
    return (
        data && (
            <Modal
                title={title}
                open
                onCancel={() => {
                    form.resetFields()
                    onCancel()
                }}
                width={710}
                onOk={() => {
                    onFinish()
                }}
                getContainer={false}
                maskClosable={false}
                confirmLoading={loading}
            >
                <Form
                    form={form}
                    onValuesChange={onValuesChange}
                    initialValues={{ name: data.name }}
                    layout="vertical"
                >
                    <Form.Item
                        label={__('角色名称')}
                        name="name"
                        validateFirst
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                            {
                                required: true,
                                validator: validateName(),
                            },
                            {
                                validateTrigger: ['onBlur'],
                                validator: (e, value) =>
                                    checkNameCorrect(e, value),
                            },
                            {
                                validateTrigger: ['onBlur'],
                                validator: (e, value) =>
                                    checkNameRepeat(e, value),
                            },
                        ]}
                    >
                        <Input
                            placeholder={__('请输入角色名称')}
                            maxLength={128}
                            style={{ color: 'rgba(0, 0, 0, 0.65)' }}
                            autoComplete="off"
                            // onBlur={(e) => {
                            //     checkNameRepeat(e.target.value)
                            // }}
                        />
                    </Form.Item>
                    <Form.Item label={__('自定义图标')} name="color">
                        {roleInfo && (
                            <SelectIcon
                                onChange={({ icon, color }) => {
                                    setRoleInfo({
                                        ...roleInfo,
                                        icon,
                                        color,
                                    })
                                }}
                                color={roleInfo.color}
                                icon={roleInfo.icon}
                                defaultIcons={defaultIcons}
                            />
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        )
    )
}

export default RoleInfo
