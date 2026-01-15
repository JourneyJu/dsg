import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, TreeSelect, message } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { getDataGradeLabel, formatError, setModelGradeLabel } from '@/core'
import { FontIcon } from '@/icons'
import styles from './styles.module.less'
import __ from '../locale'

interface IConfigLevelProps {
    modelInfo: any
    open: boolean
    onClose: () => void
    onOk?: () => void
}

const ConfigLevel: React.FC<IConfigLevelProps> = ({
    modelInfo,
    open,
    onClose,
    onOk,
}) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [gradeLabelOptions, setGradeLabelOptions] = useState<any[]>([])

    useEffect(() => {
        if (open) {
            getAllGradeLabel()
            form.setFieldsValue({
                model_name: modelInfo.business_name,
                grade_label_id: modelInfo.grade_label_id || undefined,
            })
        }
    }, [open, modelInfo])

    /**
     * 获取所有分级标签
     */
    const getAllGradeLabel = async () => {
        try {
            const gradeRules = await getDataGradeLabel({
                keyword: '',
                is_show_label: true,
            })
            setGradeLabelOptions(formatDataToTreeData(gradeRules.entries))
        } catch (err) {
            formatError(err)
        }
    }

    /**
     * 将数据格式化为树形结构
     * @param treeData 数据
     * @returns 树形结构
     */
    const formatDataToTreeData = (treeData: any) => {
        return treeData.map((item) => ({
            ...item,
            label: !item?.children?.length ? (
                <div className={styles.selectOptionWrapper}>
                    {item.icon ? (
                        <FontIcon
                            name="icon-biaoqianicon"
                            style={{
                                fontSize: 20,
                                color: item.icon,
                            }}
                            className={styles.icon}
                        />
                    ) : null}
                    <span title={item.name} className={styles.name}>
                        {item.name}
                    </span>
                </div>
            ) : (
                item.name
            ),
            value: item.id,
            isLeaf: !item?.children?.length,
            selectable: !item?.children?.length,
            name: item.name,
            children: item?.children?.length
                ? formatDataToTreeData(item.children)
                : undefined,
        }))
    }

    /**
     * 获取分级标签名称
     */
    const getLabelName = (labelId: string) => {
        const findLabel = (data: any[]): string => {
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < data.length; i++) {
                const item = data[i]
                if (item.value === labelId) {
                    return item.name
                }
                if (item.children) {
                    const found = findLabel(item.children)
                    if (found) return found
                }
            }
            return ''
        }
        return findLabel(gradeLabelOptions)
    }

    /**
     * 提交表单
     */
    const handleOk = async () => {
        try {
            setLoading(true)
            const values = await form.validateFields()
            const labelName = getLabelName(values.grade_label_id)

            if (!labelName) {
                message.error('请选择分级标签')
                return
            }
            await setModelGradeLabel(modelInfo.id, {
                grade_label_id: values.grade_label_id,
            })

            message.success('保存成功')
            onOk?.()
        } catch (err) {
            // 表单验证失败
            formatError(err)
        } finally {
            setLoading(false)
        }
    }

    /**
     * 取消
     */
    const handleCancel = () => {
        form.resetFields()
        onClose()
    }

    return (
        <Modal
            title={__('设置分级标签')}
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
            width={640}
            destroyOnClose
        >
            <Form form={form} layout="vertical" preserve={false}>
                <div className={styles.modelInfoWrapper}>
                    <div className={styles.modelIcon}>
                        {__('主题模型名称：')}
                    </div>
                    <div className={styles.modelName}>
                        {modelInfo.business_name}
                    </div>
                </div>

                <Form.Item
                    label={__('分级标签')}
                    name="grade_label_id"
                    rules={[{ required: true, message: __('请选择分级标签') }]}
                >
                    <TreeSelect
                        placeholder={__('请选择分级标签')}
                        treeData={gradeLabelOptions}
                        switcherIcon={<DownOutlined />}
                        style={{ width: '100%' }}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        showSearch
                        treeNodeFilterProp="name"
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ConfigLevel
