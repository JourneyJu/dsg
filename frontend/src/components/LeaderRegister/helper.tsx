import React from 'react'
import { Popover } from 'antd'
import { Empty, Loader } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'
import __ from './locale'
import { formatTime } from '@/utils'
import styles from './styles.module.less'
/**
 * 空数据
 */
export const renderEmpty = (marginTop: number = 36) => (
    <Empty
        iconSrc={dataEmpty}
        desc={__('暂无数据')}
        style={{ marginTop, width: '100%' }}
    />
)

/**
 * 加载中
 */
export const renderLoader = (marginTop: number = 104) => (
    <div style={{ marginTop, width: '100%' }}>
        <Loader />
    </div>
)

/**
 * 获取逗号分割的部门名称
 */
export const getDepartment = (
    parent_deps: {
        path_id: string
        path: string
    }[],
) => {
    const displayDepartments = parent_deps
        .filter((dep) => dep.path)
        .map((dep) => dep.path.split('/').pop() || '')
        .filter(Boolean)

    return displayDepartments.length ? displayDepartments.join('，') : '--'
}

/**
 * 获取逗号分割的部门路径
 */
export const getPath = (parent_deps: any[]) => {
    const displayPaths = parent_deps.map((dep) => dep.path).filter(Boolean)

    return displayPaths.length ? displayPaths.join('，') : '--'
}

// 显示部门
export const showDepartment = (parent_deps: any[]) => {
    if (!parent_deps.length) {
        return '--'
    }

    const displayDepartments = getDepartment(parent_deps)
    const displayPaths = getPath(parent_deps)

    return <span title={displayPaths}>{displayDepartments}</span>
}

// 显示部门路径
const showPath = (parent_deps: any[]) => {
    if (!parent_deps.length) {
        return '--'
    }

    // 获取所有完整路径
    const fullPaths = parent_deps
        .filter((dep) => dep.path)
        .map((dep) => dep.path)

    // 显示完整的 dep.path，用逗号分割
    const displayValue = fullPaths.join('，') || '--'

    // Popover 内容
    const popoverContent = (
        <div className={styles.popoverContent}>
            <div className={styles.popoverTitle}>{__('所属部门')}</div>
            {fullPaths.map((path, index) => (
                <div key={index} className={styles.popoverItem}>
                    {path}
                </div>
            ))}
        </div>
    )

    return (
        <Popover content={popoverContent} placement="topLeft">
            {displayValue}
        </Popover>
    )
}

// 展示值
export const showValue = ({ actualDetails }: { actualDetails: any }) => {
    return {
        register_at: formatTime(actualDetails?.register_at) || '--',
        parent_deps: showPath(actualDetails?.parent_deps || []),
    }
}

// 刷新详情
export const refreshDetails = ({
    detailList = [],
    actualDetails,
}: {
    detailList?: any[]
    actualDetails?: any
}) => {
    // 根据详情列表的key，展示对应的value
    return actualDetails
        ? detailList?.map((i) => ({
              ...i,
              value:
                  showValue({
                      actualDetails,
                  })[i.key] ??
                  actualDetails[i.key] ??
                  '',
          }))
        : detailList
}
