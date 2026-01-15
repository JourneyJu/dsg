import React, { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './styles.module.less'
import __ from './locale'
import { DataAnalysisTab, leftMenuItems } from './const'
import ShareApplyTable from './ApplyTable'
import CatalogDataTable from './CatalogDataTable'

/**
 * 数据分析
 */
const DataAnalysis = () => {
    const { pathname } = useLocation()

    const current = useMemo(() => {
        return (
            leftMenuItems.find((item) => pathname.endsWith(item.path)) ||
            leftMenuItems[0]
        )
    }, [pathname])

    return (
        <div className={styles.dataAnalysis}>
            {current.key === DataAnalysisTab.CatalogData ? (
                <CatalogDataTable />
            ) : (
                <ShareApplyTable tab={current.key} />
            )}
        </div>
    )
}

export default memo(DataAnalysis)
