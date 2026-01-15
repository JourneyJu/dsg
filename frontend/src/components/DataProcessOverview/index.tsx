import { useEffect, useMemo, useState } from 'react'
import { Radio } from 'antd'
import { operationOptions, OverviewRangeEnum } from './const'
import __ from './locale'
import styles from './styles.module.less'
import WorkOrder from './WorkOrder'
import DataQuality from './DataQuality'
import DataProcessView from './DataProcessView'
import {
    formatError,
    getDataProcessingOverview,
    IDataProcessingOverview,
    PermissionScope,
} from '@/core'
import { useUserPermCtx } from '@/context/UserPermissionProvider'

const DataProcessOverview = () => {
    const [activeRange, setActiveRange] = useState<OverviewRangeEnum>(
        OverviewRangeEnum.ALL,
    )
    const [overviewData, setOverviewData] = useState<any>(null)
    const [workOrderData, setWorkOrderData] = useState<any[]>([])
    const { checkPermission } = useUserPermCtx()

    // 是否拥有数据获取概览全部的权限
    const hasAllAccess = useMemo(() => {
        return (
            checkPermission([
                {
                    key: 'dataProcessOverview',
                    scope: PermissionScope.All,
                },
            ]) ?? false
        )
    }, [checkPermission])

    useEffect(() => {
        if (!hasAllAccess) {
            setActiveRange(OverviewRangeEnum.DEPARTMENT)
        }
    }, [hasAllAccess])

    useEffect(() => {
        getOverviewData(activeRange)
    }, [activeRange])

    /**
     * 获取数据处理概览数据
     * @param departmentStatus 部门状态
     */
    const getOverviewData = async (departmentStatus: OverviewRangeEnum) => {
        try {
            const res = await getDataProcessingOverview({
                my_department:
                    departmentStatus === OverviewRangeEnum.DEPARTMENT,
            })
            setWorkOrderData(formatWorkOrderData(res))
            setOverviewData(res)
        } catch (err) {
            formatError(err)
        }
    }

    const formatWorkOrderData = (data: IDataProcessingOverview) => {
        return [
            {
                type: 'dataProcessWorkOrder',
                value: data.work_order_count,
                // 质量检测数
                dataQuality: data.data_quality_audit_work_order_count,
                // 数据融合数
                dataFusion: data.data_fusion_work_order_count,
            },
            {
                // 已完成工单
                type: 'finishedWorkOrder',
                value: data.finished_work_order_count,
                // 质量检测数
                dataQuality: data.finished_data_quality_audit_work_order_count,
                // 数据融合数
                dataFusion: data.finished_data_fusion_work_order_count,
            },
            {
                // 处理中工单
                type: 'processingWorkOrder',
                value: data.ongoing_work_order_count,
                // 质量检测数
                dataQuality: data.ongoing_data_quality_audit_work_order_count,
                // 数据融合数
                dataFusion: data.ongoing_data_fusion_work_order_count,
            },
            {
                // 未派发工单
                type: 'unassignedWorkOrder',
                value: data.unassigned_work_order_count,
                // 质量检测数
                dataQuality:
                    data.unassigned_data_quality_audit_work_order_count,
                // 数据融合数
                dataFusion: data.unassigned_data_fusion_work_order_count,
            },
        ]
    }

    return (
        <div className={styles.overViewContainer}>
            <div className={styles.overViewHeader}>
                <span className={styles.overViewTitle}>
                    {__('数据处理概览')}
                </span>
                <Radio.Group
                    options={
                        hasAllAccess
                            ? (operationOptions as any)
                            : (operationOptions.filter(
                                  (item) =>
                                      item.value !== OverviewRangeEnum.ALL,
                              ) as any)
                    }
                    value={activeRange}
                    onChange={(e) => setActiveRange(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                />
            </div>
            <WorkOrder workOrderData={workOrderData} />
            <DataQuality activeRange={activeRange} dataDetail={overviewData} />
            <DataProcessView
                activeRange={activeRange}
                dataDetail={overviewData}
            />
        </div>
    )
}

export default DataProcessOverview
