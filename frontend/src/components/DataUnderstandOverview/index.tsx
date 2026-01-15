import React, { useEffect, useMemo, useState } from 'react'
import { Radio } from 'antd'
import styles from './styles.module.less'
import __ from './locale'
import { operationOptions, OverviewRangeEnum } from './const'
import DataUnderstandBase from './DataUnderstandBase'
import ServiceArea from './ServiceArea'
import BaseInfoClassification from './BaseInfoClassification'
import {
    formatError,
    getDataUnderstandOverview,
    IDataUnderstandOverviewResult,
    PermissionScope,
} from '@/core'
import { Empty, Loader } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'
import { useUserPermCtx } from '@/context/UserPermissionProvider'

const DataUnderstandOverview = () => {
    const [activeRange, setActiveRange] = useState<OverviewRangeEnum>(
        OverviewRangeEnum.ALL,
    )
    const [dataUnderstandOverview, setDataUnderstandOverview] =
        useState<IDataUnderstandOverviewResult | null>(null)

    const [loading, setLoading] = useState(false)
    const { checkPermission } = useUserPermCtx()

    // 是否拥有数据获取概览全部的权限
    const hasAllAccess = useMemo(() => {
        return (
            checkPermission([
                {
                    key: 'dataUnderstandOverview',
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
        getDetail()
    }, [activeRange])

    const getDetail = async () => {
        try {
            setLoading(true)
            const res = await getDataUnderstandOverview({
                my_department: activeRange === OverviewRangeEnum.DEPARTMENT,
            })
            setDataUnderstandOverview(res)
        } catch (err) {
            formatError(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.overViewContainer}>
            <div className={styles.overViewHeader}>
                <span className={styles.overViewTitle}>
                    {__('数据理解概览')}
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
            {loading ? (
                <Loader />
            ) : dataUnderstandOverview ? (
                <>
                    <DataUnderstandBase
                        activeRange={activeRange}
                        overviewData={dataUnderstandOverview}
                    />
                    <ServiceArea
                        activeRange={activeRange}
                        overviewData={dataUnderstandOverview}
                    />
                    <BaseInfoClassification
                        activeRange={activeRange}
                        overviewData={dataUnderstandOverview}
                    />
                </>
            ) : (
                <Empty desc={__('暂无数据')} iconSrc={dataEmpty} />
            )}
        </div>
    )
}

export default DataUnderstandOverview
