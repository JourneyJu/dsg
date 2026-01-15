/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useRoutes, useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import { otherRoutes, loginRoutes } from './config'
import { getPlatformNumber } from '@/utils'
import { useDocumentTitleContext, useMicroAppProps } from '@/context'
import { addRecentUseRoutes, getRouteByAttr, useMenus } from '@/hooks/useMenus'
import { useAuthContext } from '@/providers'
import styles from './styles.module.less'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { LoginPlatform } from '@/core'

interface AnyFabricRoutesProps {
    /** 是否为微应用模式 */
    isMicroApp?: boolean
}

const AnyFabricRoutes: React.FC<AnyFabricRoutesProps> = ({
    isMicroApp = false,
}) => {
    const navigator = useNavigate()
    const [menus] = useMenus()
    const [routes, setRoutes] = useState<any[]>([])
    const { authenticated, loading } = useAuthContext()
    const element = useRoutes([...routes, ...otherRoutes, ...loginRoutes])
    const { setCurrentPath, setMenusData } = useDocumentTitleContext()
    const { pathname } = useLocation()
    const [userInfo] = useCurrentUser()
    const { microAppProps } = useMicroAppProps()
    const isMicroAppMode = Boolean(microAppProps?.route?.basename)

    useEffect(() => {
        setCurrentPath(pathname)
    }, [pathname, setCurrentPath])

    useEffect(() => {
        if (isMicroAppMode || loading) {
            return
        }

        const isLoginRoute = loginRoutes.some(
            (route) => pathname === route.path,
        )
        // 如果不是登录路由且未认证,跳转到登录页
        if (!isLoginRoute && !authenticated) {
            navigator('/login')
        }
    }, [authenticated, loading, pathname, navigator, isMicroAppMode])

    useEffect(() => {
        if (!isMicroAppMode) {
            return
        }

        if (pathname === '/' || pathname === '') {
            const homePath = 'data-assets'

            console.log(
                `[AnyFabric路由] 微应用根路径访问,重定向到首页: ${homePath}`,
            )
            navigator(homePath)
        }
    }, [pathname, navigator, isMicroAppMode])

    useEffect(() => {
        setMenusData(menus)
    }, [menus, setMenusData])

    useEffect(() => {
        setRoutes(menus)
    }, [menus])

    useMemo(() => {
        if (menus.length) {
            // 从可用路由中获取当前路径的key
            const key1 = getRouteByAttr(pathname, 'path')?.key
            // 如果当前路径不在路由中，跳转到403
            if (!key1) {
                navigator('403')
            }
        }
    }, [pathname, userInfo, menus])

    return routes.length ? (
        element
    ) : (
        <div className={styles.routesLoading}>
            <Spin />
        </div>
    )
}

export default AnyFabricRoutes
