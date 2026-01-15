import { noop } from 'lodash'
import { Select, Tooltip } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import __ from '../locale'
import { FontIcon } from '@/icons'
import styles from './styles.module.less'

import { FieldTypeIcon } from '@/core'

interface SelectAreaProps {
    value?: {
        startFieldId: string
        endFieldId: string
        startModelId: string
        endModelId: string
    }
    onChange?: (value: {
        startFieldId: string
        endFieldId: string
        startModelId: string
        endModelId: string
    }) => void
    modelList: {
        business_name: string
        technical_name: string
        id: string
        fields: {
            id: string
            data_type: string
            business_name: string
            technical_name: string
            field_id: string
            primary_key: boolean
        }[]
    }[]
}
const SelectArea = ({ value, onChange = noop, modelList }: SelectAreaProps) => {
    const [startModelInfo, setStartModelInfo] = useState<{
        modelId: string
        modelName: string
        fieldId: string
    } | null>(null)
    const [endModelInfo, setEndModelInfo] = useState<{
        modelId: string
        modelName: string
        fieldId: string
    } | null>(null)

    const [startFieldOptions, setStartFieldOptions] = useState<
        {
            label: any
            value: string
        }[]
    >([])
    const [endFieldOptions, setEndFieldOptions] = useState<
        {
            label: any
            value: string
        }[]
    >([])

    useEffect(() => {
        if (value && modelList?.length) {
            const startModel = modelList.find(
                (item) => item.id === value.startModelId,
            )
            if (startModel) {
                setStartModelInfo({
                    modelId: startModel.id,
                    modelName: startModel.business_name,
                    fieldId: value.startFieldId,
                })
                setStartFieldOptions(
                    startModel.fields.map((item) => ({
                        label: (
                            <div className={styles['select-option-wrapper']}>
                                <FieldTypeIcon
                                    dataType={item.data_type}
                                    style={{
                                        color: 'rgba(0, 0, 0, 0.65)',
                                        flexShrink: 0,
                                        marginRight: 8,
                                    }}
                                />
                                <div className={styles['select-name-wrapper']}>
                                    <span
                                        className={styles['select-name']}
                                        title={item.business_name}
                                    >
                                        {item.business_name}
                                    </span>
                                    {item?.primary_key && (
                                        <div className={styles['primary-key']}>
                                            {__('主键')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ),
                        value: item.field_id,
                        name: item.business_name,
                    })),
                )
            }
            const endModel = modelList.find(
                (item) => item.id === value.endModelId,
            )
            if (endModel) {
                setEndModelInfo({
                    modelId: endModel.id,
                    modelName: endModel.business_name,
                    fieldId: value.endFieldId,
                })
                setEndFieldOptions(
                    endModel.fields.map((item) => ({
                        label: (
                            <div className={styles['select-option-wrapper']}>
                                <FieldTypeIcon
                                    dataType={item.data_type}
                                    style={{
                                        color: 'rgba(0, 0, 0, 0.65)',
                                        flexShrink: 0,
                                    }}
                                />
                                <div className={styles['select-name-wrapper']}>
                                    <span
                                        className={styles['select-name']}
                                        title={item.business_name}
                                    >
                                        {item.business_name}
                                    </span>
                                    {item?.primary_key && (
                                        <div className={styles['primary-key']}>
                                            {__('主键')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ),
                        value: item.field_id,
                        name: item.business_name,
                    })),
                )
            }
        }
    }, [value, modelList])

    return (
        <div className={styles['select-area-wrapper']}>
            <div className={styles['forward-title']}>
                <div>{__('起')}</div>
                <div className={styles.line} />
                <div className={styles['arrow-icon']} />
                <div>{__('终')}</div>
            </div>
            <div className={styles['content-wrapper']}>
                <div className={styles['content-item']}>
                    <div className={styles['content-item-model']}>
                        <FontIcon name="icon-jichengyingyong-xianxing" />
                        <div
                            title={startModelInfo?.modelName}
                            className={styles['text-wrapper']}
                        >
                            {startModelInfo?.modelName}
                        </div>
                    </div>
                    <div className={styles['connect-line']} />
                    <div className={styles['select-wrapper']}>
                        <Select
                            options={startFieldOptions}
                            value={startModelInfo?.fieldId || null}
                            placeholder={__('请选择关联字段')}
                            onChange={(currentValue) => {
                                if (value) {
                                    onChange({
                                        ...value,
                                        startFieldId: currentValue,
                                    })
                                }
                            }}
                            showSearch
                            filterOption={(input, option: any) =>
                                option?.name
                                    ?.toString()
                                    .toLowerCase()
                                    ?.includes(input.toLowerCase())
                            }
                        />
                    </div>
                </div>
                <div className={styles['content-item']}>
                    <div className={styles['content-item-model']}>
                        <FontIcon name="icon-jichengyingyong-xianxing" />
                        <div
                            title={endModelInfo?.modelName}
                            className={styles['text-wrapper']}
                        >
                            {endModelInfo?.modelName}
                        </div>
                    </div>
                    <div className={styles['connect-line']} />
                    <div className={styles['select-wrapper']}>
                        <Select
                            options={endFieldOptions}
                            value={endModelInfo?.fieldId || null}
                            placeholder={__('请选择关联字段')}
                            onChange={(currentValue) => {
                                if (value) {
                                    onChange({
                                        ...value,
                                        endFieldId: currentValue,
                                    })
                                }
                            }}
                            showSearch
                            filterOption={(input, option: any) =>
                                option?.name
                                    ?.toString()
                                    .toLowerCase()
                                    ?.includes(input.toLowerCase())
                            }
                        />
                    </div>
                </div>
            </div>
            <div
                onClick={() => {
                    if (value) {
                        onChange({
                            startFieldId: value.endFieldId,
                            endFieldId: value.startFieldId,
                            startModelId: value.endModelId,
                            endModelId: value.startModelId,
                        })
                    }
                }}
                className={styles['exchange-icon']}
            >
                <Tooltip title={__('交换')} placement="bottom">
                    <SyncOutlined />
                </Tooltip>
            </div>
        </div>
    )
}

export default SelectArea
