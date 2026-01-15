import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button, Modal, message, Form, Input, Select } from 'antd'
import __ from './locale'
import LoyoutGroupView from '@/ui/AutoFormConfig/LoyoutGroupView'
import styles from './styles.module.less'
import { getDataLengthValidate } from '../DataCollection/helper'

interface EditStandardFieldType {
    fieldInfo: any
    businessField: any
    onConfirm: (values: any, isChanged: boolean) => void
    onCancel: () => void
    open: boolean
}

const EditStandardField = ({
    fieldInfo,
    businessField,
    onConfirm,
    onCancel,
    open,
}: EditStandardFieldType) => {
    const [form] = Form.useForm()
    const [standardDataType, setStandardDataType] = useState<string>('')
    useEffect(() => {
        setStandardDataType(fieldInfo.type)
    }, [fieldInfo])

    const getTypeOption = (data_type, data_length?) => {
        switch (data_type) {
            case 'char':
                if (data_length) {
                    return [
                        {
                            label: 'char',
                            value: 'char',
                        },
                        {
                            label: 'varchar',
                            value: 'varchar',
                        },
                    ]
                }
                return [
                    {
                        label: 'string',
                        value: 'string',
                    },
                ]
            case 'number':
                if (data_length) {
                    return [
                        {
                            label: 'decimal',
                            value: 'decimal',
                        },
                    ]
                }
                return [
                    {
                        label: 'tinyint',
                        value: 'tinyint',
                    },
                    {
                        label: 'smallint',
                        value: 'smallint',
                    },
                    {
                        label: 'int',
                        value: 'int',
                    },
                    {
                        label: 'bigint',
                        value: 'bigint',
                    },
                    {
                        label: 'float',
                        value: 'float',
                    },
                    {
                        label: 'double',
                        value: 'double',
                    },
                ]
            case 'bool':
                return [
                    {
                        label: 'boolean',
                        value: 'boolean',
                    },
                ]
            case 'date':
                return [
                    {
                        label: 'date',
                        value: 'date',
                    },
                ]
            case 'datetime':
                return [
                    {
                        label: 'datetime',
                        value: 'datetime',
                    },
                ]
            case 'timestamp':
                return [
                    {
                        label: 'timestamp',
                        value: 'timestamp',
                    },
                ]
            case 'binary':
                return [
                    {
                        label: 'binary',
                        value: 'binary',
                    },
                ]
            default:
                return []
        }
    }

    /**
     * 获取类型框禁用状态
     */
    const getDataTypeStatus = (data_type, type) => {
        const dataTypeMapping = {
            char: ['string'],
            number: ['tinyint', 'smallint', 'int', 'bigint', 'float', 'double'],
            bool: ['boolean'],
            date: ['date'],
            datetime: ['datetime'],
            timestamp: ['timestamp'],
            binary: ['binary'],
        }
        if (['char', 'varchar'].includes(type) || type === 'decimal') {
            return false
        }
        if (data_type === 'char' && dataTypeMapping[data_type].includes(type)) {
            return false
        }
        if (dataTypeMapping[data_type].includes(type)) {
            return true
        }
        return false
    }
    const getDataTypeTemplate = (dataType) => {
        switch (dataType) {
            case 'char':
            case 'binary':
            case 'varchar':
                return (
                    <LoyoutGroupView widths={[12, 12]}>
                        <Form.Item
                            label={
                                <div>
                                    <span>{__('数据类型')}</span>
                                    <span className={styles.itemLabel}>
                                        {__('（映射前：${name}）', {
                                            name: businessField?.data_type,
                                        })}
                                    </span>
                                </div>
                            }
                            name="type"
                            required={businessField?.data_length < 255}
                        >
                            <Select
                                options={getTypeOption(
                                    businessField?.data_type,
                                    businessField?.data_length,
                                )}
                                disabled={
                                    businessField?.data_length > 255 ||
                                    dataType === 'binary'
                                }
                                onChange={(value) => {
                                    setStandardDataType(value)
                                    form.setFieldValue('type', value)
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            label={
                                <div>
                                    <span>{__('长度')}</span>
                                    <span className={styles.itemLabel}>
                                        {__('（映射前：${name}）', {
                                            name: businessField?.data_length,
                                        })}
                                    </span>
                                </div>
                            }
                            name="length"
                            // required
                            // rules={[
                            //     {
                            //         required: true,
                            //         message: __('输入不能为空'),
                            //     },
                            //     ...getDataLengthValidate(dataType),
                            // ]}
                        >
                            <Input
                                placeholder={__('请输入长度')}
                                type="number"
                                disabled
                            />
                        </Form.Item>
                    </LoyoutGroupView>
                )
            case 'decimal':
                return (
                    <LoyoutGroupView widths={[12, 6, 6]}>
                        <Form.Item
                            label={
                                <div>
                                    <span>{__('数据类型')}</span>
                                    <span className={styles.itemLabel}>
                                        {__('（映射前：${name}）', {
                                            name: businessField?.data_type,
                                        })}
                                    </span>
                                </div>
                            }
                            name="type"
                        >
                            <Select
                                options={getTypeOption(
                                    businessField?.data_type,
                                    businessField?.data_length,
                                )}
                                disabled
                                onChange={(value) => {
                                    setStandardDataType(value)
                                    form.setFieldValue('type', value)
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            label={
                                <div>
                                    <span>{__('精度')}</span>
                                    <span className={styles.itemLabel}>
                                        {__('（映射前：${name}）', {
                                            name: businessField?.data_length,
                                        })}
                                    </span>
                                </div>
                            }
                            name="length"
                            // required
                            // rules={[
                            //     {
                            //         required: true,
                            //         message: __('输入不能为空'),
                            //     },
                            //     ...getDataLengthValidate(dataType),
                            // ]}
                        >
                            <Input
                                placeholder={__('请输入精度')}
                                type="number"
                                disabled
                            />
                        </Form.Item>
                        <Form.Item
                            label={
                                <div>
                                    <span>{__('标度')}</span>
                                    <span className={styles.itemLabel}>
                                        {__('（映射前：${name}）', {
                                            name: businessField?.data_accuracy,
                                        })}
                                    </span>
                                </div>
                            }
                            name="field_precision"
                            // required
                            // rules={[
                            //     {
                            //         required: true,
                            //         message: __('输入不能为空'),
                            //     },
                            //     ...getDataLengthValidate(dataType),
                            // ]}
                        >
                            <Input
                                placeholder={__('请输入标度')}
                                type="number"
                                disabled
                            />
                        </Form.Item>
                    </LoyoutGroupView>
                )
            default:
                return (
                    <Form.Item
                        label={
                            <div>
                                <span>{__('数据类型')}</span>
                                <span className={styles.itemLabel}>
                                    {__('（映射前：${name}）', {
                                        name: businessField?.data_type,
                                    })}
                                </span>
                            </div>
                        }
                        name="type"
                        required={
                            !getDataTypeStatus(
                                businessField?.data_type,
                                fieldInfo.type,
                            )
                        }
                    >
                        <Select
                            options={getTypeOption(
                                businessField?.data_type,
                                businessField?.data_length,
                            )}
                            disabled={getDataTypeStatus(
                                businessField?.data_type,
                                fieldInfo.type,
                            )}
                            onChange={(value) => {
                                setStandardDataType(value)
                                form.setFieldValue('type', value)
                            }}
                        />
                    </Form.Item>
                )
        }
    }
    /**
     * 完成
     * @param values
     */
    const handleFinsh = (values) => {
        if (
            values.type === fieldInfo.type &&
            values.description === fieldInfo.description
        ) {
            onConfirm(values, false)
        } else {
            onConfirm(values, true)
        }
    }
    return (
        <Modal
            open={open}
            title={__('编辑字段')}
            onCancel={onCancel}
            onOk={() => {
                form.submit()
            }}
            okText={__('确定')}
            width={640}
            maskClosable={false}
            className={styles.editStanadardField}
        >
            <Form
                form={form}
                initialValues={fieldInfo}
                layout="vertical"
                onFinish={handleFinsh}
            >
                <Form.Item
                    label={
                        <div>
                            <span>{__('字段名称')}</span>
                            <span className={styles.itemLabel}>
                                {__('（映射前：${name}）', {
                                    name: businessField?.name,
                                })}
                            </span>
                        </div>
                    }
                    name="name"
                >
                    <Input disabled />
                </Form.Item>
                {getDataTypeTemplate(standardDataType)}
                <Form.Item label={__('字段注释')} name="description">
                    <Input
                        placeholder={__('请输入字段注释')}
                        autoComplete="off"
                        maxLength={255}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default EditStandardField
