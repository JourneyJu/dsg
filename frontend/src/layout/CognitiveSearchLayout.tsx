import { Layout } from 'antd'
import React, { Suspense, useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import { Loader } from '@/ui'
import styles from './styles.module.less'
import { CongSearchProvider } from '@/components/CognitiveSearch/CogSearchProvider'
import AssetCenterHeader from '@/components/AssetCenterHeader'
import { isRuntimeMicroApp } from '@/utils'
import MicroAppHeader from '@/components/MicroAppHeader'

const { Content } = Layout

const CognitiveSearchLayout: React.FC = () => {
    // 判断是否为微应用模式
    const isMicroApp = useMemo(() => isRuntimeMicroApp(), [])

    return (
        <Layout className={styles.cognitiveSearchLayoutWapper}>
            <CongSearchProvider>
                {/* 微应用模式:使用主应用的Header组件渲染菜单 */}
                {isMicroApp ? <MicroAppHeader /> : <AssetCenterHeader />}
                <Layout className={styles.layoutContent}>
                    <Content className={styles.content}>
                        <Suspense fallback={<Loader />}>
                            <Outlet />
                        </Suspense>
                    </Content>
                </Layout>
            </CongSearchProvider>
        </Layout>
    )
}

export default CognitiveSearchLayout
