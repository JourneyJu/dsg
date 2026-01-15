import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import __ from './locale'
import {
    createTopicModelLabel,
    formatError,
    getModelList,
    updateTopicModelLabel,
} from '@/core'
import { mockListOtherInfo } from './mock'

const { TextArea } = Input

/**
 * 标签编辑组件Props
 */
interface EditTagManageProps {
    /** 弹窗开启状态 */
    visible: boolean
    /** 编辑的标签ID，为空时表示新建 */
    editId?: string
    /** 初始表单数据（编辑时传入） */
    initialValues?: {
        name?: string
        description?: string
        relatedModels?: string[]
    }
    /** 完成回调（提交表单） */
    onFinish: () => void
    /** 取消/关闭回调 */
    onCancel: () => void
}

/**
 * 标签新建/编辑弹窗组件
 *
 * @description 提供标签的新建和编辑功能，包含名称、描述和关联模型字段
 * @author 资深大数据开发工程师
 */
const EditTagManage: React.FC<EditTagManageProps> = ({
    visible,
    editId,
    initialValues,
    onFinish,
    onCancel,
}) => {
    const [form] = Form.useForm()

    const [allObjectModels, setAllObjectModels] = useState<any[]>([])

    useEffect(() => {
        getModelData()
    }, [])

    /**
     * 监听弹窗状态和初始值变化，重置表单
     */
    useEffect(() => {
        if (visible) {
            if (editId && initialValues) {
                // 编辑模式：填充表单数据
                form.setFieldsValue(initialValues)
            } else {
                // 新建模式：重置表单
                form.resetFields()
            }
        }
    }, [visible, editId, initialValues, form])

    /**
     * 获取模型数据
     */
    const getModelData = async () => {
        try {
            const res = await getModelList({
                offset: 1,
                limit: 1000,
                model_type: 'thematic',
                only_self: 'false',
            })
            setAllObjectModels(res.entries)
        } catch (err) {
            formatError(err)
        }
    }

    /**
     * 处理表单提交
     */
    const handleSubmit = async (values: any) => {
        try {
            if (editId) {
                await updateTopicModelLabel(editId, values)
                message.success(__('编辑成功'))
            } else {
                await createTopicModelLabel(values)
                message.success(__('新建成功'))
            }
            onFinish()
        } catch (error) {
            formatError(error) // 表单验证失败，不做处理（antd 会自动显示错误信息）
        }
    }

    /**
     * 处理取消操作
     */
    const handleCancel = () => {
        form.resetFields()
        onCancel()
    }

    const handleValuesChange = (changedValues: any, allValues: any) => {
        if (changedValues.related_models !== undefined) {
            const selectedModels = changedValues.related_models || []
            if (selectedModels.length > 10) {
                // 限制为最多10个
                const limitedValue = selectedModels.slice(0, 10)

                // 设置错误信息
                form.setFields([
                    {
                        name: 'related_models',
                        value: limitedValue,
                        errors: [__('最多只能选择10个关联模型')],
                    },
                ])
            } else if (selectedModels.length <= 10) {
                // 清除错误信息
                form.setFields([
                    {
                        name: 'related_models',
                        errors: [],
                    },
                ])
            }
        }
    }

    return (
        <Modal
            title={editId ? __('编辑标签关联推荐') : __('新建标签关联推荐')}
            open={visible}
            onOk={() => {
                form.submit()
            }}
            onCancel={handleCancel}
            width={640}
            okText={__('确定')}
            cancelText={__('取消')}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                onFinish={handleSubmit}
                onValuesChange={handleValuesChange}
            >
                {/* 标签名称 */}
                <Form.Item
                    label={__('名称')}
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: __('请输入标签关联推荐名称'),
                        },
                    ]}
                    required
                >
                    <Input
                        placeholder={__('请输入标签关联推荐名称')}
                        maxLength={300}
                    />
                </Form.Item>
                {/* 关联模型 */}
                <Form.Item
                    label={__('关联模型')}
                    name="related_models"
                    required
                    rules={[{ required: true, message: __('请选择关联模型') }]}
                >
                    <Select
                        mode="multiple"
                        placeholder={__('请选择关联模型')}
                        options={allObjectModels.map((model) => ({
                            label: model.business_name,
                            value: model.id,
                        }))}
                        showSearch
                        allowClear
                        maxTagCount="responsive"
                        filterOption={(input, option) =>
                            (option?.label ?? '')
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                    />
                </Form.Item>

                {/* 标签描述 */}
                <Form.Item label={__('描述')} name="description">
                    <TextArea
                        placeholder={__('请输入描述')}
                        maxLength={300}
                        style={{ height: 100, resize: 'none' }}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default EditTagManage
