import { Layout } from 'antd'
import classnames from 'classnames'
import { registerMicroApps, start } from 'qiankun'
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CongSearchProvider } from '@/components/CognitiveSearch/CogSearchProvider'
import IndexMenuSider from '@/components/IndexMenuSider'
import { LoginPlatform } from '@/core'
import { flatRoute, getRouteByAttr, getRouteByKeys } from '@/hooks/useMenus'
import { MicroAppsArr } from '@/registryApp'
import { homeRouteKeys } from '@/routers/config'
import { Loader } from '@/ui'
import { isRuntimeMicroApp } from '@/utils'
import styles from './styles.module.less'
// import CogAsstModal from '@/components/CognitiveAssistant/cogAsstModal'
import AssetCenterHeader from '@/components/AssetCenterHeader'
import MicroAppHeader from '@/components/MicroAppHeader'

const { Content } = Layout

const IndexRouterLayout: React.FC = () => {
    const { pathname } = useLocation()
    const ref = useRef<HTMLDivElement>(null)
    // 判断是否为微应用模式
    const isMicroApp = useMemo(() => isRuntimeMicroApp(), [])
    // 没有菜单栏和导航栏
    const [noSiderHeader, setNoSiderHeader] = useState<boolean>(false)
    // 没有菜单栏，仅有导航栏
    const [noSiderOnlyHeader, setNoSiderOnlyHeader] = useState<boolean>(false)
    // 首页 - 首页样式侧边栏及导航栏
    const [inHome, setInHome] = useState<boolean>(false)
    // 是否在数据服务超市页面
    const [inDataAssets, setInDataAssets] = useState<boolean>(false)

    useEffect(() => {
        registerMicroApps(MicroAppsArr)

        start({ prefetch: true })
    }, [])

    useMemo(() => {
        // 滚动条平滑回到顶部
        ref?.current?.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
        })
        const path =
            pathname.slice(-1) === '/'
                ? pathname.slice(0, pathname.length - 1)
                : pathname
        setNoSiderHeader(getRouteByAttr(path, 'path')?.hide)

        const homeMenu = flatRoute(
            getRouteByKeys(homeRouteKeys[LoginPlatform.default]),
            true,
        )
        setInHome(homeMenu.some((item) => item.path === path))
        setInDataAssets(path === '/data-assets')
    }, [pathname])

    return (
        <Layout
            className={classnames(
                styles.layoutWapper,
                noSiderHeader && styles.hideMenuLayoutWapper,
                inDataAssets && styles.layoutWapperInDataAssets,
            )}
        >
            <CongSearchProvider>
                {/* 微应用模式:使用主应用的Header组件渲染菜单 */}
                {isMicroApp ? (
                    <MicroAppHeader />
                ) : (
                    // 独立模式:使用AnyFabric自己的AssetCenterHeader
                    !noSiderHeader &&
                    (inHome ? (
                        <AssetCenterHeader />
                    ) : (
                        <AssetCenterHeader showApplyList={false} />
                    ))
                )}
                <Layout hasSider={!noSiderHeader && !noSiderOnlyHeader}>
                    {!noSiderHeader &&
                        !noSiderOnlyHeader &&
                        // <AssetCenterSider />
                        (inHome ? null : <IndexMenuSider />)}
                    <Layout
                        ref={ref}
                        className={classnames(
                            styles.layoutContent,
                            !inHome && styles.layoutContentWhite,
                            noSiderOnlyHeader && styles.layoutContentNoSider,
                        )}
                        id="indexRouterLayoutContent"
                    >
                        <Content className={styles.content}>
                            <Suspense fallback={<Loader />}>
                                <Outlet />
                            </Suspense>
                        </Content>
                    </Layout>
                </Layout>
            </CongSearchProvider>
        </Layout>
    )
}

export default IndexRouterLayout
