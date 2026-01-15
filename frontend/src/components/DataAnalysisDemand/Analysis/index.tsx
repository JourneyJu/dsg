import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    Button,
    Col,
    Drawer,
    Form,
    Input,
    message,
    Radio,
    Row,
    Space,
} from 'antd'
import { InfoCircleFilled } from '@ant-design/icons'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import styles from './styles.module.less'
import __ from '../locale'
import { CommonTitle } from '@/ui'
import {
    DataAnalAuditStatus,
    DataAnalCommissionType,
    formatError,
    getDataAnalRequireDetail,
    IAnalOutputItem,
    ICatalog,
    IDataAnalRequireDetail,
    ISharedApplyDetail,
    LoginPlatform,
    putDataAnalRequireAnalysis,
} from '@/core'
import { getPlatformNumber } from '@/utils'
import { applyFieldsConfig } from '../helper'
import { analysisConclusionConfig, ID_SUFFIX, SubmitType } from '../const'
import DrawerHeader from '@/components/CitySharing/component/DrawerHeader'
import BasicInfo from '../Details/BasicInfo'
import AnalysisOutputTable from '../components/AnalysisOutputTable'

import { TextAreaView } from '@/components/AutoFormView/baseViewComponents'
import { htmlDecodeByRegExp } from '@/components/ResourcesDir/const'

interface IAnalysis {
    open: boolean
    onClose?: () => void
    // 共享申请 id
    applyId?: string
}

const Analysis: React.FC<IAnalysis> = ({ open, onClose, applyId }) => {
    const [form] = Form.useForm()

    const [details, setDetails] = useState<IDataAnalRequireDetail>()

    const [saveLoading, setSaveLoading] = useState<boolean>(false)

    const navigator = useNavigate()

    const platform = getPlatformNumber()

    const [initAnalysisOutput, setInitAnalysisOutput] = useState<any[]>([])
    const analysisOutputTableRef = useRef<any>(null)
    const [isExistOutput, setIsExistOutput] = useState(false)

    useEffect(() => {
        if (applyId) {
            getDetails()
        }
    }, [applyId])

    const getDetails = async () => {
        try {
            const res = await getDataAnalRequireDetail(applyId!, {
                fields: 'base,analysis',
            })
            setDetails(res)
            let analOutputItems: IAnalOutputItem[] = []
            if (
                res.base.commission_type === DataAnalCommissionType.SELF_SERVICE
            ) {
                analOutputItems = res.base.anal_output_items
            }
            if (
                res.base.commission_type ===
                    DataAnalCommissionType.COMMISSION_BASED &&
                res.analysis?.anal_output_items
            ) {
                analOutputItems = res.analysis?.anal_output_items
            }
            setInitAnalysisOutput(
                analOutputItems.map((item) => {
                    const { name, id, catalogs } = item
                    const columns: any[] = []
                    catalogs.forEach((catalog) => {
                        catalog.columns.forEach((column) => {
                            columns.push({ ...column, ...catalog })
                        })
                    })
                    return {
                        name,
                        id,
                        columns,
                    }
                }),
            )
            // 已分析的数据回显分析结论信息
            if (res.analysis?.id) {
                form.setFieldsValue({
                    feasibility: res.analysis.feasibility,
                    conclusion: res.analysis.conclusion,
                })
            }
        } catch (error) {
            formatError(error)
        }
    }

    const checkCatalog = async () => {
        const [res] = await Promise.allSettled([form.validateFields()])
        if (res.status === 'rejected') {
            return false
        }
        return true
    }

    // 提交申请
    const handleSave = async (submitType: SubmitType) => {
        try {
            const checkPass =
                submitType === SubmitType.Submit ? await checkCatalog() : true
            if (!checkPass) return
            setSaveLoading(true)
            const baseInfo = await form.getFieldsValue()
            const analOutputItems: IAnalOutputItem[] = []
            if (
                details?.base.commission_type ===
                DataAnalCommissionType.COMMISSION_BASED
            ) {
                const outputData = analysisOutputTableRef.current?.getItems()
                outputData?.forEach((opdItem) => {
                    const catalogs: ICatalog[] = []
                    opdItem?.columns?.forEach((item) => {
                        const target = catalogs.find(
                            (c) => c.catalog_id === item.catalog_id,
                        )
                        const {
                            catalog_id,
                            catalog_code,
                            catalog_name,
                            view_id,
                            view_code,
                            view_busi_name,
                            view_tech_name,
                            is_increment_field,
                            is_mandatory,
                            is_pk,
                            is_standardized,
                            id,
                            ...rest
                        } = item

                        const col = {
                            is_increment_field: !!is_increment_field,
                            is_mandatory: !!is_mandatory,
                            is_pk: !!is_pk,
                            is_standardized: !!is_standardized,
                            ...rest,
                            // 创建自定义数据时，前端会加一个id，需要删除
                            id: id
                                ? id.includes(ID_SUFFIX)
                                    ? undefined
                                    : id
                                : undefined,
                        }
                        if (!target) {
                            catalogs.push({
                                catalog_id,
                                catalog_code,
                                catalog_name,
                                view_id,
                                view_code,
                                view_busi_name,
                                view_tech_name,
                                columns: [col],
                            })
                        } else {
                            target.columns.push(col)
                        }
                    })
                    analOutputItems.push({
                        name: opdItem.name,
                        catalogs,
                    })
                })
            }

            await putDataAnalRequireAnalysis(applyId!, {
                ...baseInfo,
                analysis_id: details?.analysis?.id,
                submit_type: submitType,
                // 仅委托型必填，自助型不传或传null）
                anal_output_items:
                    details?.base.commission_type ===
                    DataAnalCommissionType.COMMISSION_BASED
                        ? baseInfo.feasibility === 'feasible'
                            ? analOutputItems
                            : null
                        : null,
            })

            message.success(
                submitType === SubmitType.Submit
                    ? __('提交成功')
                    : __('暂存成功'),
            )

            onClose?.()
        } catch (err) {
            formatError(err)
        } finally {
            setSaveLoading(false)
        }
    }

    const getAnalysisConclusion = () => {
        return (
            <Form
                layout="vertical"
                className={styles['analysis-form']}
                form={form}
            >
                <Form.Item
                    label={__('分析结论')}
                    required
                    className={styles['analysis-conclusion-item']}
                    name="feasibility"
                    rules={[{ required: true, message: __('请选择') }]}
                >
                    <Radio.Group>
                        {analysisConclusionConfig.map((item) => (
                            <Radio
                                key={item.value}
                                value={item.value}
                                disabled={
                                    details?.base.commission_type ===
                                    DataAnalCommissionType.SELF_SERVICE
                                        ? false
                                        : (item.value === 'unfeasible' &&
                                              isExistOutput) ||
                                          (item.value === 'feasible' &&
                                              !isExistOutput)
                                }
                            >
                                {item.label}
                            </Radio>
                        ))}
                    </Radio.Group>
                </Form.Item>
                <Form.Item
                    label={__('分析及结果确认')}
                    required
                    rules={[{ required: true, message: __('输入不能为空') }]}
                    name="conclusion"
                >
                    <Input.TextArea
                        className={styles['analysis-result-textarea']}
                        placeholder={__('请输入')}
                        maxLength={300}
                        showCount
                    />
                </Form.Item>
            </Form>
        )
    }

    const outputDataChange = (data: any[]) => {
        const isExist = data.length > 0
        setIsExistOutput(isExist)
        form.setFieldsValue({
            feasibility: isExist ? 'feasible' : 'unfeasible',
        })
    }

    return (
        <Drawer
            open={open}
            width="100%"
            placement="right"
            closable={false}
            bodyStyle={{
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 1080,
            }}
            contentWrapperStyle={{ minWidth: 800 }}
            destroyOnClose
            maskClosable={false}
            mask={false}
            push={false}
        >
            <div
                className={classNames(
                    styles.details,
                    styles['analysis-details-wrapper'],
                )}
            >
                {/* 导航头部 */}
                <DrawerHeader
                    title={__('需求分析')}
                    fullScreen
                    onClose={onClose}
                />

                {/* 内容 */}
                <div className={styles.bottom}>
                    <div className={styles.content}>
                        <div className={styles['content-body']}>
                            {details?.base.audit_status ===
                                DataAnalAuditStatus.AnalysisAuditReject &&
                                (details?.base.anal_confirm_reject_reason ||
                                    details?.base.anal_audit_reject_reason) && (
                                    <div
                                        className={
                                            styles['reject-tip-container']
                                        }
                                    >
                                        <div className={styles['reject-tips']}>
                                            <div
                                                className={
                                                    styles['reject-title']
                                                }
                                            >
                                                <InfoCircleFilled
                                                    className={
                                                        styles['tip-icon']
                                                    }
                                                />
                                                {__('驳回说明')}
                                            </div>
                                            <div
                                                className={
                                                    styles['reject-text']
                                                }
                                            >
                                                <TextAreaView
                                                    initValue={htmlDecodeByRegExp(
                                                        details?.base
                                                            .anal_confirm_reject_reason ||
                                                            details?.base
                                                                .anal_audit_reject_reason ||
                                                            '',
                                                    )}
                                                    rows={1}
                                                    placement="end"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                            <div className={styles['common-title']}>
                                <CommonTitle title={__('需求信息')} />
                            </div>
                            <Row className={styles['apply-info-row']}>
                                <BasicInfo details={details?.base} />
                            </Row>
                            <div className={styles['common-title']}>
                                <CommonTitle title={__('分析场景产物')} />
                            </div>
                            <AnalysisOutputTable
                                data={initAnalysisOutput}
                                isView={
                                    details?.base.commission_type ===
                                    DataAnalCommissionType.SELF_SERVICE
                                }
                                ref={analysisOutputTableRef}
                                dataChangeCallback={
                                    details?.base.commission_type ===
                                    DataAnalCommissionType.COMMISSION_BASED
                                        ? outputDataChange
                                        : undefined
                                }
                            />
                            <div className={styles['common-title']}>
                                <CommonTitle title={__('分析结论')} />
                            </div>
                            {getAnalysisConclusion()}
                        </div>

                        {/* 底部栏 */}
                        <div className={styles.footer}>
                            <Space>
                                <Button
                                    className={styles.btn}
                                    onClick={() => {
                                        onClose?.()
                                    }}
                                >
                                    {__('取消')}
                                </Button>
                                <Button
                                    className={styles.btn}
                                    onClick={() => {
                                        handleSave(SubmitType.Draft)
                                    }}
                                >
                                    {__('暂存')}
                                </Button>
                                <Button
                                    type="primary"
                                    className={styles.btn}
                                    // loading={saveLoading}
                                    onClick={() => {
                                        handleSave(SubmitType.Submit)
                                    }}
                                >
                                    {__('提交')}
                                </Button>
                            </Space>
                        </div>
                    </div>
                </div>
            </div>
        </Drawer>
    )
}

export default Analysis
