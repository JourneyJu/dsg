import React, { useEffect, useMemo, useState } from 'react'
import { Button, Drawer, Form, message, Row, Space } from 'antd'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { InfoCircleFilled } from '@ant-design/icons'
import styles from './styles.module.less'
import __ from '../locale'
import { CommonTitle, Empty } from '@/ui'
import {
    DataAnalAuditStatus,
    DataAnalCommissionType,
    formatError,
    getDataAnalRequireDetail,
    getWorkOrderInfo,
    IAnalOutputItem,
    IDataAnalRequireDetail,
    putDataAnalRequireImplement,
} from '@/core'
import { getPlatformNumber, OperateType } from '@/utils'
import DrawerHeader from '@/components/CitySharing/component/DrawerHeader'
import BasicInfo from '../Details/BasicInfo'
import AnalysisOutputTable from '../components/AnalysisOutputTable'
import ResultTable from './ResultTable'
import CreateFusionOpt from './CreateFusionOpt'
import { TextAreaView } from '@/components/AutoFormView/baseViewComponents'
import { htmlDecodeByRegExp } from '@/components/InfoRescCatlg/const'

interface IImplement {
    open: boolean
    onClose?: () => void
    // 共享申请 id
    applyId?: string
}

const Implement: React.FC<IImplement> = ({ open, onClose, applyId }) => {
    const [form] = Form.useForm()
    const [saveLoading, setSaveLoading] = useState<boolean>(false)

    const [resultList, setResultList] = useState<any[]>([])

    const navigator = useNavigate()

    const platform = getPlatformNumber()

    const [initAnalysisOutput, setInitAnalysisOutput] = useState<any[]>([])
    const [details, setDetails] = useState<IDataAnalRequireDetail>()
    const [createFusionOptOpen, setCreateFusionOptOpen] = useState(false)
    const [fusionOptData, setFusionOptData] = useState<any>()

    useEffect(() => {
        if (applyId) {
            getDetails()
        }
    }, [applyId])

    const isCanSubmit = useMemo(() => {
        return details?.base.commission_type ===
            DataAnalCommissionType.COMMISSION_BASED
            ? initAnalysisOutput.every(
                  (item) =>
                      item.work_order_status === 'finished' ||
                      item.work_order_status === 'Completed',
              )
            : true
    }, [initAnalysisOutput])

    const updateStatus = async () => {
        const workOrderRes = await getWorkOrderInfo({
            source_ids: initAnalysisOutput.map((item) => item.id!),
            source_type: 'data_analysis',
            type: 'data_fusion',
        })
        setInitAnalysisOutput(
            initAnalysisOutput.map((item) => {
                // const workOrder = (workOrderRes.entries || []).find(
                //     (wo) => wo.source_id === item.id,
                // )
                const workOrder = workOrderRes.entries
                    .filter((wo) => wo.source_id === item.id)
                    .sort((a, b) => b.created_at - a.created_at)
                return {
                    ...item,
                    work_order_status: workOrder[0]?.status,
                    work_order_id: workOrder[0]?.work_order_id,
                }
            }),
        )
    }

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
                    const workOrder = (workOrderRes.entries || [])
                        .filter((wo) => wo.source_id === id)
                        .sort((a, b) => b.created_at - a.created_at)
                    const columns: any[] = []
                    catalogs.forEach((catalog) => {
                        catalog.columns.forEach((column) => {
                            columns.push({ ...column, ...catalog })
                        })
                    })
                    const impItemRes = (res.implement || []).find(
                        (impItem) => impItem.anal_output_item_id === id,
                    )

                    const {
                        id: impItemId,
                        work_order_status,
                        work_order_id,
                        ...restImpItem
                    } = impItemRes || {}
                    return {
                        name,
                        id,
                        columns,
                        work_order_status: workOrder[0]?.status,
                        work_order_id: workOrder[0]?.work_order_id,
                        isNeedEditFusion:
                            res.base.audit_status ===
                            DataAnalAuditStatus.ImplementConfirmReject,
                        ...restImpItem,
                    }
                }),
            )
        } catch (error) {
            formatError(error)
        }
    }

    // 提交申请
    const handleSave = async () => {
        try {
            if (
                details?.base.commission_type ===
                    DataAnalCommissionType.SELF_SERVICE &&
                !(resultList.length > 0)
            ) {
                message.error('请添加分析成果')
                return
            }
            setSaveLoading(true)
            await putDataAnalRequireImplement(applyId!, {
                impl_achivements:
                    details?.base.commission_type ===
                    DataAnalCommissionType.SELF_SERVICE
                        ? resultList.map((item) => ({
                              view_id: item.view_id,
                              datasource_id: item.datasource_id,
                              datasource_name: item.datasource_name,
                              is_catalog: item.is_catalog,
                          }))
                        : undefined,
            })
            message.success(__('提交成功'))
            onClose?.()
        } catch (err) {
            formatError(err)
        } finally {
            setSaveLoading(false)
        }
    }

    const handleChangeResult = (
        id: string,
        operate: OperateType,
        vals?: Record<string, any> | any[],
    ) => {
        if (operate === OperateType.EDIT) {
            setResultList(
                resultList.map((item) =>
                    item.view_id === id ? { ...item, ...(vals || {}) } : item,
                ),
            )
        }

        if (operate === OperateType.DELETE) {
            setResultList(resultList.filter((item) => item.view_id !== id))
        }

        if (operate === OperateType.ADD && Array.isArray(vals)) {
            setResultList([...resultList, ...vals])
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
                    title={__('数据资源实施')}
                    fullScreen
                    onClose={onClose}
                />

                {/* 内容 */}
                <div className={styles.bottom}>
                    <div className={styles.content}>
                        <div className={styles['content-body']}>
                            {details?.base.audit_status ===
                                DataAnalAuditStatus.ImplementConfirmReject &&
                                details.base.impl_confirm_reject_reason && (
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
                                                        details.base
                                                            .impl_confirm_reject_reason,
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
                            <div className={styles['analysis-output-table']}>
                                <AnalysisOutputTable
                                    isView
                                    data={initAnalysisOutput}
                                    isFusional={
                                        details?.base.commission_type ===
                                        DataAnalCommissionType.COMMISSION_BASED
                                    }
                                    onFusion={(record) => {
                                        setFusionOptData(record)
                                        setCreateFusionOptOpen(true)
                                    }}
                                    isImpReject={
                                        details?.base.audit_status ===
                                        DataAnalAuditStatus.ImplementConfirmReject
                                    }
                                />
                            </div>
                            {details?.base.commission_type ===
                                DataAnalCommissionType.SELF_SERVICE && (
                                <>
                                    <div className={styles['common-title']}>
                                        <CommonTitle title={__('分析成果')} />
                                    </div>
                                    <div
                                        className={
                                            styles['result-table-container']
                                        }
                                    >
                                        <ResultTable
                                            data={resultList}
                                            onChange={handleChangeResult}
                                        />
                                    </div>
                                </>
                            )}
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
                                    // loading={saveLoading}
                                    disabled={!isCanSubmit}
                                    onClick={() => {
                                        handleSave()
                                    }}
                                >
                                    {__('实施完成')}
                                </Button>
                            </Space>
                        </div>
                    </div>
                </div>
            </div>
            {createFusionOptOpen && (
                <CreateFusionOpt
                    open={createFusionOptOpen}
                    onClose={() => {
                        setCreateFusionOptOpen(false)
                        setFusionOptData(undefined)
                    }}
                    onOk={() => {
                        updateStatus()
                    }}
                    data={fusionOptData}
                    dataAnalRequireID={applyId!}
                />
            )}
        </Drawer>
    )
}

export default Implement
