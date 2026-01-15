import React, { useEffect, useMemo, useState } from 'react'
import { Button, Drawer, Form, message, Row, Space, Tooltip } from 'antd'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import styles from './styles.module.less'
import __ from '../locale'
import { CommonTitle, Empty } from '@/ui'
import {
    DataAnalCommissionType,
    dataAnalDataPushConfirm,
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
import AnalysisResultTable from '../components/AnalysisResultTable'

interface IPushConfirm {
    open: boolean
    onClose?: () => void
    applyId?: string
    onOk?: () => void
}

const PushConfirm: React.FC<IPushConfirm> = ({
    open,
    onClose,
    applyId,
    onOk,
}) => {
    const [form] = Form.useForm()
    const [saveLoading, setSaveLoading] = useState<boolean>(false)
    // IDataAnalImplementInfo
    const [resultList, setResultList] = useState<any[]>([])
    const [lastResultList, setLastResultList] = useState<
        (any & { pushId?: string })[]
    >([])

    const navigator = useNavigate()

    const platform = getPlatformNumber()

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

            const targetList = analOutputItems.map((item) => {
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
                const impItemRes = (res.implement || []).find(
                    (impItem) => impItem.anal_output_item_id === id,
                )

                const { id: impItemId, ...restImpItem } = impItemRes || {}
                return {
                    name,
                    id:
                        res.base.commission_type ===
                        DataAnalCommissionType.COMMISSION_BASED
                            ? impItemId
                            : id,
                    columns,
                    work_order_status: workOrder?.status,
                    work_order_id: workOrder?.work_order_id,
                    ...restImpItem,
                }
            })
            setInitAnalysisOutput(targetList)
            const resList =
                res.base.commission_type ===
                DataAnalCommissionType.COMMISSION_BASED
                    ? targetList
                    : (res.implement as any)
            setResultList(resList)
            setLastResultList(resList)
        } catch (error) {
            formatError(error)
        }
    }

    // 提交申请
    const handleSave = async () => {
        try {
            await dataAnalDataPushConfirm(applyId!)
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
            <div className={classNames(styles['push-confirm-wrapper'])}>
                {/* 导航头部 */}
                <DrawerHeader
                    title={__('数据推送确认')}
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
                            {details?.base.commission_type ===
                                DataAnalCommissionType.SELF_SERVICE && (
                                <>
                                    <div className={styles['common-title']}>
                                        <CommonTitle
                                            title={__('分析场景产物')}
                                        />
                                    </div>
                                    <div
                                        className={
                                            styles['analysis-output-table']
                                        }
                                    >
                                        <AnalysisOutputTable
                                            isView
                                            data={initAnalysisOutput}
                                        />
                                    </div>
                                </>
                            )}

                            <div className={styles['common-title']}>
                                <CommonTitle title={__('分析成果')} />
                            </div>
                            <div className={styles['result-table-container']}>
                                <AnalysisResultTable
                                    data={resultList}
                                    applyId={applyId}
                                    dataChangeCallback={setLastResultList}
                                    colKeys={
                                        details?.base.commission_type ===
                                        DataAnalCommissionType.SELF_SERVICE
                                            ? [
                                                  'catalog_name',
                                                  'view_busi_name',
                                                  'columns',
                                                  'operation',
                                              ]
                                            : [
                                                  'name',
                                                  'catalog_name',
                                                  'view_busi_name',
                                                  'columns',
                                                  'operation',
                                              ]
                                    }
                                    operationKeys={
                                        details?.base.commission_type ===
                                        DataAnalCommissionType.SELF_SERVICE
                                            ? ['dataPushConifg']
                                            : ['details', 'dataPushConifg']
                                    }
                                />
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
                                        lastResultList.every(
                                            (item) => item.pushId,
                                        )
                                            ? ''
                                            : __('请先完成数据推送配置')
                                    }
                                >
                                    <Button
                                        type="primary"
                                        className={styles.btn}
                                        // loading={saveLoading}
                                        onClick={() => {
                                            handleSave()
                                        }}
                                        disabled={
                                            !lastResultList.every(
                                                (item) => item.pushId,
                                            )
                                        }
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

export default PushConfirm
