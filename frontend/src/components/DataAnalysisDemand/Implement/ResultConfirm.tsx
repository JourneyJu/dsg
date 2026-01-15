import React, { useEffect, useMemo, useState } from 'react'
import {
    Button,
    Drawer,
    Form,
    Input,
    message,
    Radio,
    Row,
    Space,
    Tooltip,
} from 'antd'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import styles from './styles.module.less'
import __ from '../locale'
import { CommonTitle, Empty } from '@/ui'
import {
    DataAnalCommissionType,
    formatError,
    getDataAnalRequireDetail,
    IAnalOutputItem,
    IDataAnalRequireDetail,
    putDataAnalRequireImplementConfirm,
} from '@/core'
import { getPlatformNumber, OperateType } from '@/utils'
import { CommissionType } from '../const'
import DrawerHeader from '@/components/CitySharing/component/DrawerHeader'
import BasicInfo from '../Details/BasicInfo'
import ResultConfirmTable from '../components/ResultConfirmTable'

interface IImplement {
    open: boolean
    onClose?: () => void
    // 共享申请 id
    applyId?: string
}

const ResultConfirm: React.FC<IImplement> = ({ open, onClose, applyId }) => {
    const [form] = Form.useForm()

    const [details, setDetails] = useState<IDataAnalRequireDetail>()

    const [saveLoading, setSaveLoading] = useState<boolean>(false)

    const platform = getPlatformNumber()

    const [initAnalysisOutput, setInitAnalysisOutput] = useState<any[]>([])
    const [lastAnalysisOutput, setLastAnalysisOutput] = useState<any[]>([])
    const [confirmRemark, setConfirmRemark] = useState<string>('')

    const canChangeConfirmResult = useMemo(() => {
        if (lastAnalysisOutput.every((item) => item.is_usable)) {
            form.setFieldsValue({
                confirm_result: 'pass',
            })
            return false
        }
        if (lastAnalysisOutput.every((item) => !item.is_usable)) {
            form.setFieldsValue({
                confirm_result: 'reject',
            })
            return false
        }
        form.setFieldsValue({
            confirm_result: 'pass',
        })
        return true
    }, [lastAnalysisOutput])

    const canSubmit = useMemo(() => {
        if (
            lastAnalysisOutput.every(
                (item) => !item.is_usable && !item.use_remark,
            )
        ) {
            return false
        }
        return true
    }, [lastAnalysisOutput])

    const getDetails = async () => {
        try {
            const res = await getDataAnalRequireDetail(applyId!, {
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
                    const implItem = res.implement?.find(
                        (imp) => imp.anal_output_item_id === item.id,
                    )
                    return {
                        ...(implItem || {}),
                        name,
                        id,
                        columns,
                        is_usable: true,
                        // 分析成果记录ID 提交时需要
                        implResRecordId: implItem?.id,
                    }
                }),
            )
        } catch (error) {
            formatError(error)
        }
    }
    useEffect(() => {
        if (applyId) {
            getDetails()
        }
    }, [applyId])

    const getLastAnalysisOutput = (items: any[]) => {
        setLastAnalysisOutput(items)
    }

    const onFinish = async (values) => {
        try {
            await putDataAnalRequireImplementConfirm(applyId!, {
                ...values,
                entries: lastAnalysisOutput.map((item) => ({
                    id: item.implResRecordId,
                    is_usable: item.is_usable,
                    use_remark: item.use_remark,
                    use_conf: item.use_conf,
                })),
            })
            message.success(__('提交成功'))
            onClose?.()
        } catch (error) {
            formatError(error)
        }
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
                    styles['implement-wrapper'],
                    styles['result-confirm-wrapper'],
                )}
            >
                {/* 导航头部 */}
                <DrawerHeader
                    title={__('分析成果确认')}
                    fullScreen
                    onClose={onClose}
                />

                {/* 内容 */}
                <div className={styles.bottom}>
                    <div className={styles.content}>
                        <div className={styles['content-body']}>
                            <div className={styles['common-title']}>
                                <CommonTitle title={__('需求信息')} />
                            </div>
                            <Row className={styles['apply-info-row']}>
                                <BasicInfo details={details?.base} />
                            </Row>
                            <div className={styles['common-title']}>
                                <CommonTitle title={__('分析场景产物')} />
                            </div>
                            <ResultConfirmTable
                                data={initAnalysisOutput}
                                dataChangeCallback={getLastAnalysisOutput}
                            />
                            <div className={styles['form-container']}>
                                <Form
                                    style={{ marginTop: 20 }}
                                    form={form}
                                    onFinish={onFinish}
                                    autoComplete="off"
                                >
                                    <Form.Item
                                        label={__('确认结果')}
                                        name="confirm_result"
                                        required
                                        rules={[{ required: true }]}
                                        initialValue="pass"
                                    >
                                        <Radio.Group
                                            disabled={!canChangeConfirmResult}
                                        >
                                            <Radio value="pass">
                                                {__('通过')}
                                            </Radio>
                                            <Radio value="reject">
                                                {__('驳回')}
                                            </Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                    <Form.Item
                                        label=""
                                        name="confirm_remark"
                                        required
                                        rules={[
                                            {
                                                required: true,
                                                message: __('请输入'),
                                            },
                                        ]}
                                    >
                                        <Input.TextArea
                                            placeholder={__('请输入')}
                                            maxLength={300}
                                            showCount
                                            className={
                                                styles[
                                                    'confirm-remark-textarea'
                                                ]
                                            }
                                            onChange={(e) => {
                                                setConfirmRemark(e.target.value)
                                            }}
                                        />
                                    </Form.Item>
                                </Form>
                            </div>
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
                                <Tooltip
                                    title={
                                        !canSubmit || !confirmRemark
                                            ? __('请填写必填信息后再提交')
                                            : ''
                                    }
                                >
                                    <Button
                                        type="primary"
                                        className={styles.btn}
                                        disabled={!canSubmit || !confirmRemark}
                                        // loading={saveLoading}
                                        onClick={() => form.submit()}
                                    >
                                        {__('提交')}
                                    </Button>
                                </Tooltip>
                            </Space>
                        </div>
                    </div>
                </div>
            </div>
        </Drawer>
    )
}

export default ResultConfirm
