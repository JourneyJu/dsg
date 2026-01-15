import React, { useEffect, useState } from 'react'
import {
    Button,
    Collapse,
    Drawer,
    Form,
    Input,
    Radio,
    Row,
    Col,
    message,
} from 'antd'
import { CaretDownFilled } from '@ant-design/icons'
import classnames from 'classnames'
import {
    formatError,
    getDwhDataAuthRequestDetail,
    getDatasheetViewDetails,
    IDwhDataAuthRequestDetail,
    getAuditDetails,
    putDocAudit,
} from '@/core'
import { formatTime } from '@/utils'
import { Loader } from '@/ui'
import ViewRules from '@/components/DemandManagement/Details/ViewRules'
import __ from '../locale'
import styles from './styles.module.less'

const { Panel } = Collapse
const { TextArea } = Input

interface IAuditDrawerProps {
    visible: boolean
    recordId: string | null
    procInstId?: string
    onClose: () => void
    onSuccess?: () => void
}

const AuditDrawer: React.FC<IAuditDrawerProps> = ({
    visible,
    recordId,
    procInstId,
    onClose,
    onSuccess,
}) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [detailData, setDetailData] =
        useState<IDwhDataAuthRequestDetail | null>(null)
    const [fields, setFields] = useState<any[]>([])
    const [baseInfoExpanded, setBaseInfoExpanded] = useState(true)

    // 获取详情数据
    useEffect(() => {
        if (visible && recordId) {
            fetchDetail()
        } else {
            setDetailData(null)
            form.resetFields()
        }
    }, [visible, recordId])

    const fetchDetail = async () => {
        if (!recordId) return
        try {
            setLoading(true)
            const res = await getDwhDataAuthRequestDetail(recordId)
            setDetailData(res)
            // 获取字段列表
            if (res.data_id) {
                try {
                    const fieldsRes = await getDatasheetViewDetails(res.data_id)
                    setFields(fieldsRes?.fields || [])
                } catch (error) {
                    // 如果获取字段失败，不影响详情展示
                }
            }
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    // 格式化申请类型
    const formatRequestType = (type: string) => {
        if (type === 'check') return __('数据校核')
        if (type === 'query') return __('数据查询')
        return type
    }

    // 格式化时间范围
    const formatTimeRange = (expiredAt: string | number | null) => {
        if (!expiredAt || expiredAt === 0 || expiredAt === '0')
            return __('永久有效')
        const timestamp =
            typeof expiredAt === 'number'
                ? expiredAt
                : new Date(expiredAt).getTime()
        return formatTime(timestamp, 'YYYY-MM-DD HH:mm')
    }

    // 获取实际使用的数据（草稿优先）
    const getActualData = () => {
        if (!detailData) return null
        const isDraft = !!detailData.draft_spec
        return {
            ...detailData,
            expired_at: isDraft
                ? detailData.draft_expired_at ?? detailData.expired_at
                : detailData.expired_at,
            request_type: isDraft
                ? detailData.draft_request_type || detailData.request_type
                : detailData.request_type,
            spec: isDraft
                ? detailData.draft_spec || detailData.spec
                : detailData.spec,
        }
    }

    const onFinish = async (values: any) => {
        if (!procInstId) {
            return
        }
        if (submitting) {
            return // 防止重复提交
        }
        try {
            setSubmitting(true)
            const res = await getAuditDetails(procInstId)
            await putDocAudit({
                ...values,
                id: procInstId,
                task_id: res?.task_id,
            })
            message.success(__('审核成功'))
            onClose()
            onSuccess?.()
        } catch (error) {
            formatError(error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Drawer
            title={__('权限申请审核')}
            placement="right"
            width="calc(100vw - 200px)"
            open={visible}
            onClose={onClose}
            className={styles.auditDrawer}
            bodyStyle={{ padding: 0, overflow: 'hidden' }}
            footer={
                <div className={styles.drawerFooter}>
                    <Button onClick={onClose} disabled={submitting}>
                        {__('取消')}
                    </Button>
                    <Button
                        type="primary"
                        loading={submitting}
                        onClick={() => form.submit()}
                    >
                        {__('确定')}
                    </Button>
                </div>
            }
        >
            {loading ? (
                <div className={styles.loadingContainer}>
                    <Loader />
                </div>
            ) : detailData ? (
                (() => {
                    const actualData = getActualData()
                    if (!actualData) return null
                    return (
                        <>
                            <div className={styles.drawerContent}>
                                {/* 基本信息 */}
                                <Collapse
                                    bordered={false}
                                    activeKey={baseInfoExpanded ? ['1'] : []}
                                    onChange={(keys) => {
                                        setBaseInfoExpanded(keys.includes('1'))
                                    }}
                                    ghost
                                    className={styles.baseInfoCollapse}
                                >
                                    <Panel
                                        key="1"
                                        showArrow={false}
                                        header={
                                            <div
                                                className={
                                                    styles['filter-header-box']
                                                }
                                            >
                                                <CaretDownFilled
                                                    className={classnames(
                                                        styles[
                                                            'filter-header-box-icon'
                                                        ],
                                                        baseInfoExpanded &&
                                                            styles.expand,
                                                    )}
                                                />
                                                <span
                                                    className={
                                                        styles[
                                                            'filter-header-title'
                                                        ]
                                                    }
                                                >
                                                    {__('基本信息')}
                                                </span>
                                            </div>
                                        }
                                    >
                                        <Row
                                            gutter={[16, 16]}
                                            className={styles.baseInfo}
                                        >
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('申请单名称')}:
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.valueName
                                                        }
                                                    >
                                                        {actualData.name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('申请库表')}:
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.valueName
                                                        }
                                                    >
                                                        {
                                                            actualData.data_business_name
                                                        }
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('申请权限')}:
                                                    </span>
                                                    <span
                                                        className={styles.value}
                                                    >
                                                        {__('读取')}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('时间范围')}:
                                                    </span>
                                                    <span
                                                        className={styles.value}
                                                    >
                                                        {formatTimeRange(
                                                            actualData.expired_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('申请类型')}:
                                                    </span>
                                                    <span
                                                        className={styles.value}
                                                    >
                                                        {formatRequestType(
                                                            actualData.request_type,
                                                        )}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('申请人')}:
                                                    </span>
                                                    <span
                                                        className={styles.value}
                                                    >
                                                        {
                                                            actualData.applicant_name
                                                        }
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('申请时间')}:
                                                    </span>
                                                    <span
                                                        className={styles.value}
                                                    >
                                                        {formatTime(
                                                            actualData.apply_time,
                                                        )}
                                                    </span>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Panel>
                                </Collapse>

                                {/* 限定列和限定行 */}
                                <div style={{ padding: 12 }}>
                                    <ViewRules
                                        fields={fields}
                                        detail={actualData.spec}
                                    />
                                </div>
                            </div>

                            {/* 审核意见 - 固定在底部 */}
                            <div className={styles.auditOpinion}>
                                <Form
                                    form={form}
                                    layout="vertical"
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
                                            <Radio value={1}>
                                                {__('通过')}
                                            </Radio>
                                            <Radio value={0}>
                                                {__('驳回')}
                                            </Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                    <Form.Item label="" name="audit_msg">
                                        <Input.TextArea
                                            placeholder={__('请输入')}
                                            maxLength={300}
                                            showCount
                                            style={{
                                                height: 100,
                                                resize: 'none',
                                            }}
                                        />
                                    </Form.Item>
                                </Form>
                            </div>
                        </>
                    )
                })()
            ) : null}
        </Drawer>
    )
}

export default AuditDrawer
