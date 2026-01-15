import React, { Suspense } from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import { Loader } from '@/ui'
import styles from './styles.module.less'
import { DrawioInfoProvider } from '@/context/DrawioProvider'

const { Content } = Layout

const SceneGraphLayout: React.FC = () => {
    return (
        <Layout className={styles.sceneGraphLayoutWapper}>
            <Content className={styles.sceneGraphLayoutContent}>
                <Suspense fallback={<Loader />}>
                    <Outlet />
                </Suspense>
            </Content>
        </Layout>
    )
}

export default SceneGraphLayout
