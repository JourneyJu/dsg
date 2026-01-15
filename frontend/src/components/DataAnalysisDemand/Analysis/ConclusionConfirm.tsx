import {
    Badge,
    Button,
    Col,
    Drawer,
    Form,
    Input,
    message,
    Radio,
    Row,
    Space,
    Tooltip,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import {
    DataAnalCommissionType,
    formatError,
    getDataAnalRequireDetail,
    IAnalOutputItem,
    IDataAnalRequireDetail,
    putDataAnalRequireConfirm,
} from '@/core'
import __ from '../locale'
import { CommonTitle } from '@/ui'
import styles from './styles.module.less'
import { analysisFieldsConfig } from '../helper'
import BasicInfo from '../Details/BasicInfo'
import CommonDetails from '@/components/CitySharing/Details/CommonDetails'
import AnalysisOutputTable from '../components/AnalysisOutputTable'

interface ConclusionConfirmProps {
    open: boolean
    onClose: () => void
    applyId: string
    onOk: () => void
}
const ConclusionConfirm = ({
    open,
    onClose,
    applyId,
    onOk,
}: ConclusionConfirmProps) => {
    const [form] = Form.useForm()
    const [initAnalysisOutput, setInitAnalysisOutput] = useState<any[]>([])
    const [details, setDetails] = useState<IDataAnalRequireDetail>()

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
        } catch (error) {
            formatError(error)
        }
    }

    const onFinish = async (values: any) => {
        try {
            await putDataAnalRequireConfirm(applyId!, values)
            message.success(__('提交成功'))
            onClose()
            onOk()
        } catch (error) {
            formatError(error)
        }
    }

    return (
        <Drawer
            title={__('分析结论确认')}
            width={1387}
            open={open}
            onClose={onClose}
            bodyStyle={{ padding: 0 }}
            footer={
                <Space className={styles['conclusion-confirm-footer']}>
                    <Button onClick={onClose}>{__('取消')}</Button>
                    <Button type="primary" onClick={() => form.submit()}>
                        {__('确定')}
                    </Button>
                </Space>
            }
        >
            <div className={styles['conclusion-confirm-wrapper']}>
                <div className={styles['info-container']}>
                    <div className={styles['common-title']}>
                        <CommonTitle title={__('需求信息')} />
                    </div>
                    <BasicInfo details={details?.base} />
                    <div className={styles['common-title']}>
                        <CommonTitle title={__('分析结论')} />
                    </div>
                    <CommonDetails
                        data={{
                            ...details?.analysis,
                            analyser_name: details?.base.analyser_name,
                        }}
                        configData={analysisFieldsConfig}
                    />

                    <div className={styles['common-title']}>
                        <CommonTitle title={__('分析场景产物')} />
                    </div>
                    <AnalysisOutputTable data={initAnalysisOutput} isView />
                </div>
                <div className={styles['form-container']}>
                    <Form
                        layout="vertical"
                        style={{ marginTop: 20 }}
                        form={form}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            label={__('确认结果')}
                            name="confirm_result"
                            required
                            rules={[{ required: true }]}
                            initialValue="pass"
                        >
                            <Radio.Group>
                                <Radio value="pass">{__('通过')}</Radio>
                                <Radio value="reject">{__('驳回')}</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item
                            noStyle
                            shouldUpdate={(pre, cur) =>
                                pre.confirm_result !== cur.confirm_result
                            }
                        >
                            {({ getFieldValue }) => {
                                return (
                                    <Form.Item
                                        label=""
                                        name="confirm_remark"
                                        required
                                        rules={[
                                            {
                                                required:
                                                    getFieldValue(
                                                        'confirm_result',
                                                    ) === 'reject',
                                                message: __('请输入'),
                                            },
                                        ]}
                                    >
                                        <Input.TextArea
                                            placeholder={__('请输入')}
                                            maxLength={300}
                                            showCount
                                        />
                                    </Form.Item>
                                )
                            }}
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </Drawer>
    )
}

export default ConclusionConfirm
