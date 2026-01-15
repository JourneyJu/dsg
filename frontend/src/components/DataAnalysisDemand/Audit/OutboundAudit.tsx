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
    IDataAnalImplementInfo,
    IDataAnalRequireDetail,
    putDocAudit,
} from '@/core'
import __ from '../locale'
import styles from './styles.module.less'
import BasicInfo from '../Details/BasicInfo'
import {
    analysisFieldsConfig,
    demandFieldsConfig,
    departmentFieldsConfig,
} from '../helper'
import CommonDetails from '@/components/CitySharing/Details/CommonDetails'
import AnalysisOutputTable from '../components/AnalysisOutputTable'
import AnalysisResultTable from '../components/AnalysisResultTable'

interface OutboundProps {
    open: boolean
    onClose: () => void
    auditItem: any
    onOk: () => void
}
const OutboundAudit = ({
    open,
    onClose,
    auditItem,
    onOk = () => {},
}: OutboundProps) => {
    const [form] = Form.useForm()
    const [openDetails, setOpenDetails] = useState(false)
    const [details, setDetails] = useState<IDataAnalRequireDetail>()
    const [initAnalysisOutput, setInitAnalysisOutput] = useState<any[]>([])
    const [resultList, setResultList] = useState<IDataAnalImplementInfo[]>([])

    useEffect(() => {
        if (auditItem.id) {
            getDetails()
        }
    }, [auditItem])

    const getDetails = async () => {
        try {
            const res = await getDataAnalRequireDetail(auditItem.id!, {
                fields: 'base,analysis,implement',
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
            setResultList(res.implement || [])
        } catch (error) {
            formatError(error)
        }
    }

    const onFinish = async (values: any) => {
        if (!auditItem.audit_proc_inst_id) {
            return
        }
        try {
            const res = await getAuditDetails(auditItem.audit_proc_inst_id)
            await putDocAudit({
                ...values,
                id: auditItem.audit_proc_inst_id,
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
            title={__('分析成果出库审核')}
            open={open}
            onClose={onClose}
            width="calc(100% - 200px)"
            bodyStyle={{ padding: '20px 0' }}
            footer={
                <Space className={styles['audit-footer']}>
                    <Button onClick={onClose}>{__('取消')}</Button>
                    <Button type="primary" onClick={() => form.submit()}>
                        {__('提交')}
                    </Button>
                </Space>
            }
        >
            <div className={styles['audit-info-wrapper']}>
                <div className={styles['info-container']}>
                    <div className={styles['audit-info-title']}>
                        <CommonTitle title={__('需求信息')} />
                    </div>
                    <BasicInfo details={details?.base} />
                    {details?.base.commission_type ===
                        DataAnalCommissionType.COMMISSION_BASED && (
                        <>
                            <div className={styles['audit-info-title']}>
                                <CommonTitle title={__('分析结论')} />
                            </div>
                            <CommonDetails
                                data={{
                                    ...details?.analysis,
                                    analyser_name: details?.base.analyser_name,
                                }}
                                configData={analysisFieldsConfig}
                            />
                        </>
                    )}
                    <div className={styles['audit-info-title']}>
                        <CommonTitle title={__('分析场景产物')} />
                    </div>
                    <div className={styles['analysis-output-table']}>
                        <AnalysisOutputTable data={initAnalysisOutput} isView />
                    </div>
                    <div className={styles['audit-info-title']}>
                        <CommonTitle title={__('分析成果')} />
                    </div>
                    <div className={styles['analysis-output-table']}>
                        <AnalysisResultTable
                            data={resultList}
                            applyId={auditItem?.id}
                            colKeys={[
                                'catalog_name',
                                'view_busi_name',
                                'columns',
                                'operation',
                            ]}
                            operationKeys={[
                                'viewCatalog',
                                'viewResultUseConfig',
                            ]}
                        />
                    </div>
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
        </Drawer>
    )
}

export default OutboundAudit
