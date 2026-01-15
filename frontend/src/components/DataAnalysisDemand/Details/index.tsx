import React, { useEffect, useMemo, useState } from 'react'
import classnames from 'classnames'
import { noop } from 'lodash'
import { Drawer } from 'antd'
import __ from '../locale'
import styles from './styles.module.less'
import {
    DataAnalCommissionType,
    formatError,
    getDataAnalRequireDetail,
    getWorkOrderInfo,
    IAnalOutputItem,
    IDataAnalRequireDetail,
} from '@/core'
import { analysisFieldsConfig, feedbackFieldsConfig } from '../helper'
import { CommonTitle } from '@/ui'
import BasicInfo from './BasicInfo'
import AnalysisOutputTable from '../components/AnalysisOutputTable'
import DrawerHeader from '@/components/CitySharing/component/DrawerHeader'
import CommonDetails from '@/components/CitySharing/Details/CommonDetails'
import ResultTable from '../Implement/ResultTable'
import { DataAnalysisTab } from '@/components/DataAnalysis/const'

interface IDetails {
    open: boolean
    applyId?: string
    // 是否全屏
    fullScreen?: boolean
    onClose?: () => void
    tab?: DataAnalysisTab
}

const Details: React.FC<IDetails> = ({
    applyId,
    fullScreen = true,
    onClose = noop,
    open,
    tab = DataAnalysisTab.Apply,
}) => {
    // 初始化 load
    const [loading, setLoading] = useState<boolean>(false)
    const [initAnalysisOutput, setInitAnalysisOutput] = useState<any[]>([])
    const [details, setDetails] = useState<IDataAnalRequireDetail>()
    const [resultList, setResultList] = useState<any[]>([])

    useEffect(() => {
        if (applyId) {
            getDetails()
        }
    }, [applyId])

    const getDetails = async () => {
        try {
            const res = await getDataAnalRequireDetail(applyId!, {
                fields: 'base,analysis,implement,feedback',
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
                        fields: item.info_items?.map((f) => ({
                            ...f,
                            business_name: f.name_cn,
                        })),
                    })),
                )
            }
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
                minWidth: fullScreen ? 1080 : 0,
            }}
            contentWrapperStyle={{ minWidth: 800 }}
            destroyOnClose
            maskClosable={false}
            mask={false}
            push={{ distance: 0 }}
        >
            <div
                className={classnames(
                    styles.details,
                    !fullScreen && styles.details_notFullScreen,
                )}
            >
                {/* 导航头部 */}
                <DrawerHeader
                    title={details?.base?.name}
                    fullScreen={fullScreen}
                    onClose={onClose}
                />

                {/* 内容 */}
                <div className={styles.bottom}>
                    <div className={styles.content}>
                        <div className={styles['common-title']}>
                            <CommonTitle title={__('需求信息')} />
                        </div>
                        <BasicInfo details={details?.base} />
                        {![DataAnalysisTab.PushConfirm].includes(tab) &&
                            details?.base.analyser_name && (
                                <>
                                    <div className={styles['common-title']}>
                                        <CommonTitle title={__('分析结论')} />
                                    </div>
                                    <CommonDetails
                                        data={{
                                            ...details?.analysis,
                                            analyser_name:
                                                details?.base.analyser_name,
                                        }}
                                        configData={analysisFieldsConfig}
                                    />
                                </>
                            )}
                        {initAnalysisOutput?.length > 0 && (
                            <>
                                <div className={styles['common-title']}>
                                    <CommonTitle title={__('分析场景产物')} />
                                </div>
                                <div
                                    className={styles['analysis-output-table']}
                                >
                                    <AnalysisOutputTable
                                        data={initAnalysisOutput}
                                        isView
                                        commissionType={
                                            details?.base.commission_type
                                        }
                                        commisionOperationKeys={
                                            details?.base.commission_type ===
                                            DataAnalCommissionType.COMMISSION_BASED
                                                ? tab ===
                                                  DataAnalysisTab.PushConfirm
                                                    ? ['view']
                                                    : tab ===
                                                      DataAnalysisTab.ImplementData
                                                    ? [
                                                          'detail',
                                                          'viewFusionOrder',
                                                      ]
                                                    : ['view']
                                                : []
                                        }
                                        commisionColKeys={
                                            details?.base.commission_type ===
                                            DataAnalCommissionType.COMMISSION_BASED
                                                ? tab ===
                                                  DataAnalysisTab.PushConfirm
                                                    ? [
                                                          'name',
                                                          'view_busi_name',
                                                          'catalog_name',
                                                          'columns',
                                                          'operation',
                                                      ]
                                                    : [
                                                          DataAnalysisTab.ImplementData,
                                                          DataAnalysisTab.ImplementResult,
                                                          DataAnalysisTab.ResultOutbound,
                                                      ].includes(tab)
                                                    ? [
                                                          'name',
                                                          'view_busi_name',
                                                          'columns',
                                                          'operation',
                                                      ]
                                                    : [
                                                          DataAnalysisTab.AnalysisConfirm,
                                                          DataAnalysisTab.AnalysisImprove,
                                                      ].includes(tab)
                                                    ? [
                                                          'name',
                                                          'columns',
                                                          'catalogs',
                                                          'operation',
                                                      ]
                                                    : // 委托型的成果存在则展示成果信息，不存在则展示产物信息
                                                    details.implement
                                                    ? [
                                                          'name',
                                                          'view_busi_name',
                                                          'catalog_name',
                                                          'columns',
                                                          'operation',
                                                      ]
                                                    : [
                                                          'name',
                                                          'columns',
                                                          'catalogs',
                                                          'operation',
                                                      ]
                                                : []
                                        }
                                    />
                                </div>
                            </>
                        )}
                        {details?.feedback?.feedback_content && (
                            <>
                                <div className={styles['common-title']}>
                                    <CommonTitle title={__('成效反馈')} />
                                </div>
                                <BasicInfo
                                    details={details?.feedback}
                                    config={feedbackFieldsConfig}
                                />
                            </>
                        )}

                        {details?.base.commission_type ===
                            DataAnalCommissionType.SELF_SERVICE && (
                            <>
                                <div className={styles['common-title']}>
                                    <CommonTitle title={__('分析成果')} />
                                </div>
                                <ResultTable data={resultList} isView />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Drawer>
    )
}
export default Details
