import React, { useEffect, useState } from 'react'
import { Form, Input, message, Modal } from 'antd'
import styles from './styles.module.less'
import { formatError } from '@/core'
import { validateAssemblyLineUniqueness } from './validate'
import { keyboardRegEnter, OperateType } from '@/utils'
import { IAssemblyLineItem } from '@/core/apis/assemblyLine/index.d'
import { assemblyLineCreate, assemblyLineEdit } from '@/core/apis/assemblyLine'
import { validateName, validateTextLegitimacy } from '@/utils/validate'
import __ from './locale'

interface IEditAssemblyLine {
    visible: boolean
    operate: OperateType
    item?: IAssemblyLineItem
    onClose: () => void
    onSure: (any) => void
}

/**
 * 创建/编辑 工作流程
 * @param visible 显示/隐藏
 * @param operate 操作类型
 * @param item 工作流程item
 * @param onClose 关闭
 * @param onSure 确定
 */
const EditAssemblyLine: React.FC<IEditAssemblyLine> = ({
    visible,
    operate,
    item,
    onClose,
    onSure,
}) => {
    const [form] = Form.useForm()

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (item && operate === OperateType.EDIT) {
            const { name, description } = item
            form.setFieldsValue({ name, description })
            return
        }
        form.resetFields()
    }, [item])

    // 对话框onCancel
    const handleModalCancel = () => {
        onClose()
        form.resetFields()
    }

    // 对话框onOk
    const handleModalOk = async () => {
        try {
            setLoading(true)
            await form.validateFields()
            const { name, description } = form.getFieldsValue()
            let itemInfo
            if (operate === OperateType.CREATE) {
                itemInfo = await assemblyLineCreate({
                    name,
                    description,
                })
            } else {
                itemInfo = await assemblyLineEdit(item?.id || '', {
                    name,
                    description,
                })
                message.success(__('编辑成功'))
            }
            handleModalCancel()
            onSure(itemInfo)
        } catch (e) {
            if (e.errorFields) {
                return
            }
            formatError(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            title={`${
                operate === OperateType.CREATE
                    ? __('新建工作流程')
                    : __('编辑基本信息')
            }`}
            width={640}
            maskClosable={false}
            open={visible}
            onCancel={handleModalCancel}
            onOk={handleModalOk}
            destroyOnClose
            getContainer={false}
            className={styles.editWrapper}
            okButtonProps={{ loading }}
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                initialValues={{ remember: true }}
            >
                <Form.Item
                    label={__('工作流程名称')}
                    name="name"
                    validateFirst
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                        {
                            required: true,
                            validateTrigger: 'onChange',
                            message: __('输入不能为空'),
                            // validator: validateName(),
                        },
                        {
                            validateTrigger: 'onBlur',
                            validator: validateAssemblyLineUniqueness(item?.id),
                        },
                    ]}
                >
                    <Input
                        placeholder={__('请输入工作流程名称')}
                        maxLength={128}
                        className={styles.nameInput}
                    />
                </Form.Item>
                <Form.Item
                    label={__('描述')}
                    name="description"
                    validateFirst
                    rules={[
                        {
                            validator: validateTextLegitimacy(
                                keyboardRegEnter,
                                __('仅支持中英文、数字、及键盘上的特殊字符'),
                            ),
                        },
                    ]}
                >
                    <Input.TextArea
                        style={{ height: 136, resize: `none` }}
                        placeholder={__('请输入描述')}
                        maxLength={255}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default EditAssemblyLine
