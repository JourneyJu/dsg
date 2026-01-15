import { useEffect, useMemo, useState } from 'react'
import { getPermissionsList, IPermissions } from '@/core'
import { getInnerUrl } from '@/utils'
import { loginRoutePath } from '@/routers/config'

// 全局状态管理
let globalPermission: IPermissions[] = []
let pendingPromise: Promise<IPermissions[]> | null = null

/**
 * 获取权限
 */
export const usePermission = (): [IPermissions[], () => void] => {
    const pathname = getInnerUrl(window.location.pathname)
    const [permission, setPermission] =
        useState<IPermissions[]>(globalPermission)

    const getPermissionData = async () => {
        // 登录页面直接返回 false
        if (loginRoutePath.includes(pathname)) {
            return
        }

        // 创建新的Promise并保存
        pendingPromise = getPermissionsList()
            .then((res) => {
                globalPermission = res?.entries || []
                // 更新所有订阅组件的状态
                setPermission(res?.entries || [])
                pendingPromise = null
                return res?.entries || []
            })
            .catch(() => {
                globalPermission = []
                // 更新所有订阅组件的状态
                setPermission([])
                pendingPromise = null
                return []
            })
    }

    useEffect(() => {
        // 如果有正在进行的请求，等待该请求完成
        if (pendingPromise) {
            pendingPromise.then(() => {
                setPermission(globalPermission)
            })
        } else if (globalPermission.length === 0) {
            // 没有正在进行的请求，且需要初始化时发起新请求
            getPermissionData()
        } else {
            // 已有结果，直接同步状态
            setPermission(globalPermission)
        }
    }, [])

    return [useMemo(() => permission, [permission]), getPermissionData]
}
