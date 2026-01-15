import React, { useEffect, useMemo, useState } from 'react'
import { Button, Drawer, Form, message, Row, Space, Tooltip } from 'antd'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import styles from './styles.module.less'
import __ from '../locale'
import { CommonTitle, Empty } from '@/ui'
import {
    DataAnalCommissionType,
    dataAnalOutbound,
    formatError,
    getDataAnalRequireDetail,
    getWorkOrderInfo,
    IAnalOutputItem,
    IDataAnalImplementInfo,
    IDataAnalRequireDetail,
    putDataAnalRequireImplement,
} from '@/core'
import { getPlatformNumber, OperateType } from '@/utils'
import DrawerHeader from '@/components/CitySharing/component/DrawerHeader'
import BasicInfo from '../Details/BasicInfo'
import AnalysisOutputTable from '../components/AnalysisOutputTable'
import CreateFusionOpt from './CreateFusionOpt'
import AnalysisResultTable from '../components/AnalysisResultTable'

interface IApplyOutbound {
    open: boolean
    onClose?: () => void
    // 共享申请 id
    applyId?: string
    onOk?: () => void
}

const ApplyOutbound: React.FC<IApplyOutbound> = ({
    open,
    onClose,
    applyId,
    onOk = () => {},
}) => {
    const [form] = Form.useForm()
    const [saveLoading, setSaveLoading] = useState<boolean>(false)

    const [resultList, setResultList] = useState<IDataAnalImplementInfo[]>([])

    const navigator = useNavigate()

    const platform = getPlatformNumber()

    const [initAnalysisOutput, setInitAnalysisOutput] = useState<any[]>([])
    const [details, setDetails] = useState<IDataAnalRequireDetail>()
    const [lastAnalysisOutput, setLastAnalysisOutput] = useState<any[]>([])

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
            const workOrderRes = await getWorkOrderInfo({
                source_ids: analOutputItems.map((item) => item.id!),
                source_type: 'data_analysis',
                type: 'data_fusion',
            })
            setInitAnalysisOutput(
                analOutputItems.map((item) => {
                    const { name, id, catalogs } = item
                    const workOrder = (workOrderRes.entries || []).find(
                        (wo) => wo.source_id === id,
                    )
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
                        work_order_status: workOrder?.status,
                        work_order_id: workOrder?.work_order_id,
                    }
                }),
            )

            setResultList(res.implement || [])
        } catch (error) {
            formatError(error)
        }
    }

    const getLastAnalysisOutput = (items: any[]) => {
        setLastAnalysisOutput(items)
    }

    // 提交申请
    const handleSave = async () => {
        try {
            // if (lastAnalysisOutput.find((item) => !item.use_conf)) {
            //     message.error(__('请完成成果使用配置'))
            //     return
            // }
            await dataAnalOutbound(applyId!, {
                entries: lastAnalysisOutput.map((item) => ({
                    id: item.id,
                    use_conf: item.use_conf,
                })),
            })
            message.success(__('提交成功'))
            onClose?.()
            onOk?.()
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
            <div className={classNames(styles['implement-wrapper'])}>
                {/* 导航头部 */}
                <DrawerHeader
                    title={__('成果出库申请')}
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
                            <div className={styles['analysis-output-table']}>
                                <AnalysisOutputTable
                                    isView
                                    data={initAnalysisOutput}
                                />
                            </div>
                            <div className={styles['common-title']}>
                                <CommonTitle title={__('分析成果')} />
                            </div>
                            <div className={styles['result-table-container']}>
                                <AnalysisResultTable
                                    data={resultList}
                                    dataChangeCallback={getLastAnalysisOutput}
                                    colKeys={[
                                        'catalog_name',
                                        'view_busi_name',
                                        'columns',
                                        'operation',
                                    ]}
                                    operationKeys={['view', 'resultUseConfig']}
                                />
                            </div>
                        </div>

                        {/* 底部栏 */}
                        <div className={styles.footer}>
                            <div className={styles['btn-container']}>
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
                                        lastAnalysisOutput.find(
                                            (item) => !item.use_conf,
                                        )
                                            ? __('请完成成果使用配置后再提交')
                                            : ''
                                    }
                                >
                                    <Button
                                        type="primary"
                                        style={{
                                            minWidth: 80,
                                            height: 36,
                                        }}
                                        disabled={lastAnalysisOutput.find(
                                            (item) => !item.use_conf,
                                        )}
                                        onClick={() => {
                                            handleSave()
                                        }}
                                    >
                                        {__('提交')}
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Drawer>
    )
}

export default ApplyOutbound
