import { useEffect } from 'react'
import { Form, Input, message, Modal } from 'antd'
import __ from '../locale'
import { createDataModel, formatError, updateModel } from '@/core'
import { useModalManageContext } from '../ModalManageProvider'
import { ModelType, validateModelNameRepeat } from '../const'
import { modelBusinessNameReg, nameReg } from '@/utils'

interface ConfigThemeModelProps {
    open: boolean
    modelType?: ModelType
    onClose: () => void
    onConfirm: (id: string) => void
    id?: string
    initInfo?: {
        business_name: string
        description: string
    }
}
const ConfigThemeModel = ({
    open,
    onClose,
    onConfirm,
    id,
    initInfo,
    modelType = ModelType.THEME_MODEL,
}: ConfigThemeModelProps) => {
    const [form] = Form.useForm()
    const { filterKey } = useModalManageContext()

    useEffect(() => {
        if (initInfo) {
            form.setFieldsValue(initInfo)
        }
    }, [initInfo])

    /**
     * 提交表单
     * @param values 表单数据
     */
    const handleFinish = async (values: any) => {
        try {
            if (id) {
                const res = await updateModel(id, {
                    ...values,
                    subject_id: filterKey,
                    model_type: modelType,
                })
                message.success(__('编辑成功'))
                onConfirm(id)
            } else {
                const res = await createDataModel({
                    ...values,
                    subject_id: filterKey,
                    model_type: modelType,
                })
                message.success(__('新建成功'))
                onConfirm(res.id)
            }
        } catch (err) {
            formatError(err)
        }
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={() => {
                form.submit()
            }}
            title={
                id
                    ? modelType === ModelType.THEME_MODEL
                        ? __('编辑主题模型')
                        : __('编辑专题模型')
                    : modelType === ModelType.THEME_MODEL
                    ? __('新建主题模型')
                    : __('新建专题模型')
            }
            width={640}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                autoComplete="off"
            >
                <Form.Item
                    label={
                        modelType === ModelType.THEME_MODEL
                            ? __('主题模型业务名称')
                            : __('专题模型业务名称')
                    }
                    name="business_name"
                    required
                    validateFirst
                    validateTrigger={['onBlur']}
                    rules={[
                        {
                            required: true,
                            message: __('请输入主题模型业务名称'),
                        },
                        {
                            pattern: modelBusinessNameReg,
                            message: __('仅支持中英文、数字及下划线'),
                        },
                        {
                            validateTrigger: ['onBlur'],
                            validator: (rule, value, callback) => {
                                return validateModelNameRepeat({
                                    business_name: value,
                                    id: id || undefined,
                                })
                            },
                        },
                    ]}
                >
                    <Input
                        placeholder={
                            modelType === ModelType.THEME_MODEL
                                ? __('请输入主题模型业务名称')
                                : __('请输入专题模型业务名称')
                        }
                        maxLength={50}
                    />
                </Form.Item>
                <Form.Item label={__('描述')} name="description">
                    <Input.TextArea
                        placeholder={__('请输入描述')}
                        maxLength={255}
                        style={{ height: 120, resize: 'none' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ConfigThemeModel
