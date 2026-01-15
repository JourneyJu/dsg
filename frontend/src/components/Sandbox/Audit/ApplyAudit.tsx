import { Button, Drawer, Form, Input, message, Radio, Space } from 'antd'
import { useEffect, useState } from 'react'
import { CommonTitle } from '@/ui'
import {
    DataAnalCommissionType,
    formatError,
    getAuditDetails,
    getCityShareApplyDetail,
    getDataAnalRequireDetail,
    IAnalOutputItem,
    IDataAnalRequireDetail,
    ISandboxAuditItem,
    putDocAudit,
    SandboxCreateTypeEnum,
} from '@/core'
import __ from '../locale'
import styles from './styles.module.less'
import BasicInfo from '../Details/BasicInfo'
import { applyFieldsConfig } from './helper'
import Details from '../Details'
import { SandboxTab } from '../const'

interface AuditModalProps {
    open: boolean
    onClose: () => void
    auditItem: ISandboxAuditItem
    onOk: () => void
}
const ApplyAudit = ({
    open,
    onClose,
    auditItem,
    onOk = () => {},
}: AuditModalProps) => {
    const [form] = Form.useForm()
    const [showDetails, setShowDetails] = useState(false)

    const onFinish = async (values: any) => {
        if (!auditItem.proc_inst_id) {
            return
        }
        try {
            const res = await getAuditDetails(auditItem.proc_inst_id)
            await putDocAudit({
                ...values,
                id: auditItem.proc_inst_id,
                task_id: res?.task_id,
            })
            message.success(__('审核成功'))
            onClose()
            onOk()
        } catch (error) {
            formatError(error)
        }
    }

    return (
        <Drawer
            title={
                auditItem.operation === SandboxCreateTypeEnum.Apply
                    ? __('沙箱申请')
                    : __('扩容申请')
            }
            open={open}
            onClose={onClose}
            width={640}
            bodyStyle={{ padding: '20px 0' }}
            footer={
                <Space className={styles['audit-footer']}>
                    <Button onClick={onClose}>{__('取消')}</Button>
                    <Button type="primary" onClick={() => form.submit()}>
                        {__('确定')}
                    </Button>
                </Space>
            }
        >
            <div className={styles['audit-info-wrapper']}>
                <div className={styles['info-container']}>
                    <div className={styles['audit-info-title']}>
                        <CommonTitle title={__('申请信息')} />
                    </div>
                    <BasicInfo
                        details={auditItem}
                        config={
                            auditItem.operation === SandboxCreateTypeEnum.Apply
                                ? applyFieldsConfig
                                : applyFieldsConfig.filter(
                                      (item) => item.key !== 'valid',
                                  )
                        }
                        clickEvent={[
                            {
                                name: 'name',
                                onClick: (data) => {
                                    setShowDetails(true)
                                },
                            },
                        ]}
                    />
                </div>
                <div className={styles['audit-form-container']}>
                    <Form
                        layout="vertical"
                        style={{ marginTop: 20 }}
                        form={form}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            label={__('审核意见')}
                            name="audit_idea"
                            required
                            rules={[{ required: true }]}
                            initialValue={1}
                        >
                            <Radio.Group>
                                <Radio value={1}>{__('通过')}</Radio>
                                <Radio value={0}>{__('驳回')}</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item label="" name="audit_msg">
                            <Input.TextArea
                                placeholder={__('请输入')}
                                maxLength={300}
                                showCount
                                style={{ height: 100, resize: 'none' }}
                            />
                        </Form.Item>
                    </Form>
                </div>
            </div>
            {showDetails && (
                <Details
                    open={showDetails}
                    sandboxId={auditItem?.sandbox_id}
                    tab={SandboxTab.Apply}
                    data={auditItem}
                    onClose={() => {
                        setShowDetails(false)
                    }}
                />
            )}
        </Drawer>
    )
}

export default ApplyAudit
