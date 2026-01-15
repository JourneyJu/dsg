import { message, Modal, Select } from 'antd'
import React, { useEffect, useState } from 'react'
import {
    formatError,
    getSystemOperationConfig,
    updateSystemOperationConfig,
} from '@/core'
import NumberInput from '@/ui/NumberInput'
import { NumberType } from '@/ui/NumberInput/const'
import { operatorOptions, ruleConfigForm } from './const'
import __ from './locale'
import styles from './styles.module.less'

interface IRuleConfigModal {
    // 显示/隐藏
    open: boolean
    onClose: () => void
}

const RuleConfigModal: React.FC<IRuleConfigModal> = ({ open, onClose }) => {
    const [loading, setLoading] = useState(false)
    const [ruleConfigData, setRuleConfigData] = useState<any>({})

    useEffect(() => {
        getConfig()
    }, [])

    // 获取配置
    const getConfig = async () => {
        try {
            const res = await getSystemOperationConfig()
            setRuleConfigData(res)
        } catch (e) {
            formatError(e)
        }
    }

    // 对话框onOk
    const handleModalOk = async () => {
        try {
            setLoading(true)
            await updateSystemOperationConfig(ruleConfigData)
            message.success(__('设置成功'))
            onClose()
        } catch (e) {
            formatError(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            title={__('规则设置')}
            width={640}
            maskClosable={false}
            open={open}
            onCancel={onClose}
            onOk={handleModalOk}
            destroyOnClose
            getContainer={false}
            okText={__('确定')}
            cancelText={__('取消')}
            bodyStyle={{ padding: '16px 24px' }}
            okButtonProps={{ loading, style: { width: 80 } }}
            cancelButtonProps={{ style: { width: 80 } }}
        >
            <div className={styles.ruleConfigWrapper}>
                {ruleConfigForm?.map((item) => {
                    return (
                        <div key={item.key} className={styles.ruleConfigRow}>
                            <div className={styles.ruleConfigLabel}>
                                {item.label}
                            </div>
                            {item.list.map((o: any, index) => {
                                const key = `${index}-${o.key}`
                                return o.type === 'input' ? (
                                    <NumberInput
                                        placeholder={__('')}
                                        type={NumberType.IntegerZeroToHundred}
                                        min={0}
                                        max={100}
                                        key={key}
                                        style={{ width: 80 }}
                                        value={
                                            ruleConfigData?.[item.key]?.[o.key]
                                        }
                                        onChange={(val) => {
                                            setRuleConfigData((pre) => {
                                                return {
                                                    ...pre,
                                                    [item.key]: {
                                                        ...pre?.[item.key],
                                                        [o.key]: val,
                                                    },
                                                }
                                            })
                                        }}
                                    />
                                ) : o.type === 'select' ? (
                                    <Select
                                        options={operatorOptions}
                                        key={key}
                                        style={{ width: 80 }}
                                        value={
                                            ruleConfigData?.[item.key]?.[o.key]
                                        }
                                        onChange={(val) => {
                                            setRuleConfigData((pre) => {
                                                return {
                                                    ...pre,
                                                    [item.key]: {
                                                        ...pre?.[item.key],
                                                        [o.key]: val,
                                                    },
                                                }
                                            })
                                        }}
                                    />
                                ) : (
                                    <div
                                        key={key}
                                        className={styles.ruleConfigLabel}
                                    >
                                        {o.label}
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </Modal>
    )
}

export default RuleConfigModal
