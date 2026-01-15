import React, { useEffect, useMemo, useState } from 'react'
import { Button, Col, Drawer, Form, Input, message, Row, Space } from 'antd'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import styles from './styles.module.less'
import __ from '../locale'
import { CommonTitle } from '@/ui'
import {
    DataAnalCommissionType,
    dataAnalFeedback,
    formatError,
    getDataAnalRequireDetail,
    IAnalOutputItem,
    IDataAnalRequireDetail,
} from '@/core'
import DrawerHeader from '@/components/CitySharing/component/DrawerHeader'
import BasicInfo from '../Details/BasicInfo'
import AnalysisOutputTable from '../components/AnalysisOutputTable'
import ResultTable from '../Implement/ResultTable'
import { DataAnalysisTab } from '@/components/DataAnalysis/const'

interface IFeedback {
    open: boolean
    onClose?: () => void
    onOk?: () => void
    // 共享申请 id
    applyId?: string
}

const Feedback: React.FC<IFeedback> = ({ open, onClose, applyId, onOk }) => {
    const [form] = Form.useForm()
    const [details, setDetails] = useState<IDataAnalRequireDetail>()
    const [saveLoading, setSaveLoading] = useState<boolean>(false)
    const [initAnalysisOutput, setInitAnalysisOutput] = useState<any[]>([])
    const [resultList, setResultList] = useState<any[]>([])

    const navigator = useNavigate()

    useEffect(() => {
        if (applyId) {
            getDetails()
        }
    }, [applyId])

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
                    const impItemRes = (res.implement || []).find(
                        (impItem) => impItem.anal_output_item_id === id,
                    )

                    const { id: impItemId, ...restImpItem } = impItemRes || {}
                    return {
                        name,
                        id,
                        columns,
                        ...restImpItem,
                    }
                }),
            )
            if (res.implement) {
                setResultList(
                    res.implement.map((item) => ({
                        ...item,
                        business_name: item.view_busi_name,
                        technical_name: item.view_tech_name,
                        fields: (item.info_items || item.fields || [])?.map(
                            (f) => ({
                                ...f,
                                business_name: f.name_cn,
                            }),
                        ),
                    })),
                )
            }
        } catch (error) {
            formatError(error)
        }
    }

    // 提交申请
    const onFinish = async (values) => {
        try {
            setSaveLoading(true)
            await dataAnalFeedback(applyId!, values)
            onClose?.()
            onOk?.()
            message.success(__('提交成功'))
        } catch (err) {
            formatError(err)
        } finally {
            setSaveLoading(false)
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
            <div className={classNames(styles['feedback-wrapper'])}>
                {/* 导航头部 */}
                <DrawerHeader
                    title={__('成效反馈')}
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
                            <div className={styles['catalog-table-container']}>
                                <AnalysisOutputTable
                                    data={initAnalysisOutput}
                                    isView
                                    commissionType={
                                        details?.base.commission_type
                                    }
                                    tab={DataAnalysisTab.HandleFeedback}
                                    commisionOperationKeys={[
                                        'viewOutput',
                                        'viewPushTask',
                                    ]}
                                />
                            </div>
                            {details?.base.commission_type ===
                                DataAnalCommissionType.SELF_SERVICE && (
                                <>
                                    <div className={styles['common-title']}>
                                        <CommonTitle title={__('分析成果')} />
                                    </div>
                                    <ResultTable data={resultList} isView />
                                </>
                            )}
                            <div className={styles['common-title']}>
                                <CommonTitle title={__('反馈内容')} />
                            </div>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                            >
                                <Form.Item
                                    label={__('服务成效')}
                                    name="feedback_content"
                                    required
                                    rules={[
                                        {
                                            required: true,
                                            message: __('请输入'),
                                        },
                                    ]}
                                >
                                    <Input.TextArea
                                        className={styles['feedback-textarea']}
                                        placeholder={__(
                                            '示例：在“湘易办”长沙旗舰店和“我的长沙” APP 上， 8000 余项政务服务事项实现了“减证办”“免证办”，惠及 2204 余万人次，累计服务调用超 6.23 亿次。',
                                        )}
                                        maxLength={300}
                                    />
                                </Form.Item>
                            </Form>
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
                                    type="primary"
                                    className={styles.btn}
                                    loading={saveLoading}
                                    onClick={() => form.submit()}
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

export default Feedback
