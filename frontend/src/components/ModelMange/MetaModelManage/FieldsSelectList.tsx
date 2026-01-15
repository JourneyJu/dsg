import { Checkbox, Input, Tooltip, Button } from 'antd'
import { noop } from 'lodash'
import { useEffect, useState } from 'react'
import { InfoCircleOutlined } from '@ant-design/icons'
import { FormInstance } from 'antd/es/form'
import classnames from 'classnames'
import __ from '../locale'
import {
    formatError,
    getDataCatalogMount,
    getDatasheetViewDetails,
} from '@/core'
import { getFieldTypeIcon } from '@/components/DatasheetView/helper'
import styles from './styles.module.less'
import { Loader } from '@/ui'
import { FieldErrorStatus, FieldErrorStatusMap } from './const'
import { nameReg } from '@/utils'
import { EditOutlined } from '@/icons'

interface FieldsSelectListProps {
    catalogId: string
    value?: { field_id: string; business_name: string; primary_key: boolean }[]
    onChange?: (
        value: {
            field_id: string
            business_name: string
            primary_key: boolean
        }[],
    ) => void
    form?: FormInstance
    onFieldsError?: (boolean) => void
}
const FieldsSelectList = ({
    catalogId,
    value = [],
    onChange,
    form,
    onFieldsError = noop,
}: FieldsSelectListProps) => {
    const [fields, setFields] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingFields, setEditingFields] = useState<
        Array<{
            id: string
            status: FieldErrorStatus
        }>
    >([])
    const [allCheckIndeterminate, setAllCheckIndeterminate] = useState(false)
    const [allChecked, setAllChecked] = useState(false)

    useEffect(() => {
        if (catalogId) {
            getFields()
        }
    }, [catalogId])

    useEffect(() => {
        if (value?.length === 0) {
            setAllChecked(false)
            setAllCheckIndeterminate(false)
        } else if (value?.length === fields.length) {
            setAllChecked(true)
            setAllCheckIndeterminate(false)
        } else {
            setAllChecked(false)
            setAllCheckIndeterminate(true)
        }
    }, [value])

    useEffect(() => {
        if (value?.length > 0 && fields.length > 0) {
            const primaryKeyFields = fields.find((item) => item.primary_key)
            const valuePrimaryKeyFields = value.find((item) => item.primary_key)
            if (
                valuePrimaryKeyFields &&
                primaryKeyFields?.id !== valuePrimaryKeyFields?.field_id
            ) {
                setFields(
                    fields.map((item) => {
                        if (item.id === valuePrimaryKeyFields.field_id) {
                            return { ...item, primary_key: true }
                        }
                        return { ...item, primary_key: false }
                    }),
                )
            }
        }
    }, [value, fields])

    /**
     * 获取字段列表
     */
    const getFields = async () => {
        try {
            setLoading(true)
            const res = await getDataCatalogMount(catalogId)
            const dataViews = res?.mount_resource?.filter(
                (item: any) => item.resource_type === 1,
            )
            if (dataViews.length > 0) {
                const dataViewInfo = await getDatasheetViewDetails(
                    dataViews[0].resource_id,
                )
                setFields(dataViewInfo.fields)
                const primaryField = dataViewInfo.fields.find(
                    (item: any) => item.primary_key,
                )

                if (value?.length === 0 && primaryField) {
                    onChange?.([
                        {
                            field_id: primaryField.id,
                            business_name: primaryField.business_name,
                            primary_key: primaryField.primary_key,
                        },
                    ])
                }
                form?.setFieldValue(
                    'business_name',
                    dataViewInfo.business_name.slice(0, 50),
                )
                form?.setFieldValue(
                    'technical_name',
                    dataViewInfo.technical_name.slice(0, 255),
                )
            }
        } catch (err) {
            formatError(err)
        } finally {
            setLoading(false)
        }
    }

    /**
     * 修改字段名称
     * @param newName 新名称
     * @param item 字段
     */
    const handleFieldChange = (newName: string, item: any) => {
        setFields(
            fields.map((field) => {
                if (field.id === item.id) {
                    return {
                        ...field,
                        business_name: newName,
                    }
                }
                return field
            }),
        )
    }

    /**
     * 检查字段名称
     * @param item 字段
     * @returns
     */
    const handleCheckName = (item: any) => {
        // 必填
        if (!item.business_name || item.business_name.length === 0) {
            return {
                id: item.id,
                status: FieldErrorStatus.REQUIRED,
            }
        }
        // 不合法
        // if (!nameReg.test(item.business_name)) {
        //     return {
        //         id: item.id,
        //         status: FieldErrorStatus.INVALID,
        //     }
        // }
        // 重复
        const isDuplicate = fields.find(
            (field) =>
                field.business_name === item.business_name &&
                field.id !== item.id,
        )
        if (isDuplicate) {
            return {
                id: item.id,
                status: FieldErrorStatus.DUPLICATE,
            }
        }
        return {
            id: item.id,
            status: FieldErrorStatus.NORMAL,
        }
    }

    /**
     * 失去焦点
     * @param item 字段
     */
    const handleFieldBlur = (item: any) => {
        const checkResult = handleCheckName(item)
        const foundField = value.find((it) => it.field_id === item.id)

        if (checkResult.status === FieldErrorStatus.NORMAL) {
            setEditingFields(
                editingFields.filter((field) => field.id !== item.id),
            )

            if (foundField) {
                onFieldsError(false)
                onChange?.(
                    value.map((it) => {
                        if (it.field_id === item.id) {
                            return {
                                ...it,
                                business_name: item.business_name,
                            }
                        }
                        return it
                    }),
                )
            }
        } else {
            if (foundField) {
                onFieldsError(true)
            } else {
                onFieldsError(false)
            }
            setEditingFields(
                editingFields.map((field) => {
                    if (field.id === item.id) {
                        return checkResult
                    }
                    return field
                }),
            )
        }
    }

    /**
     * 设置主键
     * @param item 字段
     */
    const handleSetPrimaryKey = (item: any) => {
        const field = value.find((it) => it.field_id === item.id)
        if (field) {
            onChange?.(
                value.map((it) => {
                    if (it.field_id === item.id) {
                        return { ...it, primary_key: true }
                    }
                    return {
                        ...it,
                        primary_key: false,
                    }
                }),
            )
        } else {
            onChange?.([
                ...value.map((it) => {
                    return {
                        ...it,
                        primary_key: false,
                    }
                }),
                {
                    field_id: item.id,
                    business_name: item.business_name,
                    primary_key: true,
                },
            ])
        }
        setFields(
            fields.map((currentField) => {
                if (currentField.id === item.id) {
                    return { ...currentField, primary_key: true }
                }
                return {
                    ...currentField,
                    primary_key: false,
                }
            }),
        )
    }
    return loading ? (
        <div
            className={classnames(
                styles['loader-container'],
                styles['fields-select-loading-container'],
            )}
        >
            <Loader />
        </div>
    ) : (
        <div className={styles['fields-select-list-container']}>
            <div className={styles['fields-select-all']}>
                <Checkbox
                    checked={allChecked}
                    indeterminate={allCheckIndeterminate}
                    onChange={(e) => {
                        if (value?.length === fields.length) {
                            onChange?.([])
                        } else {
                            onChange?.(
                                fields.map((item) => ({
                                    field_id: item.id,
                                    business_name: item.business_name,
                                    primary_key: item.primary_key,
                                })),
                            )
                        }
                    }}
                />
                <span>{__('全选')}</span>
            </div>
            <div className={styles['fields-select-list-wrapper']}>
                {fields.map((item) => {
                    const editingField = editingFields.find(
                        (field) => field.id === item.id,
                    )

                    return (
                        <div
                            key={item.id}
                            className={styles['fields-select-item']}
                        >
                            <Checkbox
                                className={styles['fields-select-shrink']}
                                checked={value?.some(
                                    (it) => it.field_id === item.id,
                                )}
                                disabled={item.primary_key}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        onChange?.([
                                            ...value,
                                            {
                                                field_id: item.id,
                                                business_name:
                                                    item.business_name,
                                                primary_key: item.primary_key,
                                            },
                                        ])
                                    } else {
                                        onChange?.(
                                            value?.filter(
                                                (it) => it.field_id !== item.id,
                                            ),
                                        )
                                    }
                                }}
                            />
                            <div
                                className={styles['fields-select-shrink']}
                                title={item.data_type}
                            >
                                {getFieldTypeIcon(
                                    { ...item, type: item.data_type },
                                    20,
                                )}
                            </div>
                            {editingField ? (
                                <div
                                    className={
                                        styles['fields-select-content-editing']
                                    }
                                >
                                    <div className={styles['field-input']}>
                                        <Input
                                            value={item.business_name}
                                            onChange={(e) => {
                                                handleFieldChange(
                                                    e.target.value,
                                                    item,
                                                )
                                            }}
                                            onBlur={() => {
                                                handleFieldBlur(item)
                                            }}
                                            className={
                                                editingField.status !==
                                                FieldErrorStatus.NORMAL
                                                    ? styles[
                                                          'input-error-container'
                                                      ]
                                                    : ''
                                            }
                                            autoFocus
                                            placeholder={__('请输入字段名称')}
                                        />
                                    </div>
                                    <div className={styles['field-error']}>
                                        {editingField.status !==
                                            FieldErrorStatus.NORMAL && (
                                            <Tooltip
                                                title={
                                                    FieldErrorStatusMap[
                                                        editingField.status
                                                    ]
                                                }
                                                color="#fff"
                                                overlayInnerStyle={{
                                                    color: 'rgba(245, 34, 45, 1)',
                                                }}
                                                placement="bottom"
                                            >
                                                <InfoCircleOutlined />
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={styles['fields-select-content']}
                                >
                                    <div className={styles['business-name']}>
                                        <span
                                            className={styles.name}
                                            title={item.business_name}
                                        >
                                            {item.business_name}
                                        </span>
                                        {item.primary_key && (
                                            <div
                                                className={
                                                    styles['primary-key']
                                                }
                                            >
                                                {__('主键')}
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className={styles['technical-name']}
                                        title={item.technical_name}
                                    >
                                        {item.technical_name}
                                    </div>
                                </div>
                            )}
                            <div className={styles['field-edit-btn']}>
                                {!item.primary_key && (
                                    <Button
                                        type="link"
                                        onClick={() => {
                                            handleSetPrimaryKey(item)
                                        }}
                                    >
                                        {__('设为主键')}
                                    </Button>
                                )}
                                {editingFields.length === 0 && (
                                    <Button
                                        type="link"
                                        onClick={() => {
                                            setEditingFields([
                                                ...editingFields,
                                                {
                                                    id: item.id,
                                                    status: FieldErrorStatus.NORMAL,
                                                },
                                            ])
                                        }}
                                    >
                                        {__('编辑')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default FieldsSelectList
