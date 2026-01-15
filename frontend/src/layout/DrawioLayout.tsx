import React, { Suspense } from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import { Loader } from '@/ui'
import styles from './styles.module.less'
import { DrawioInfoProvider } from '@/context/DrawioProvider'

const { Content } = Layout

const DrawioLayout: React.FC = () => {
    return (
        <DrawioInfoProvider>
            <Layout className={styles.layoutWapper}>
                <Content>
                    <Suspense fallback={<Loader />}>
                        <Outlet />
                    </Suspense>
                </Content>
            </Layout>
        </DrawioInfoProvider>
    )
}

export default DrawioLayout
