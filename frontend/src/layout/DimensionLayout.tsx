import React, { Suspense } from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import { Loader } from '@/ui'
import styles from './styles.module.less'

const { Content } = Layout

const DimensionLayout: React.FC = () => {
    return (
        <Layout className={styles.DimensionLayoutWapper}>
            <Content className={styles.DimensionLayoutContent}>
                <Suspense fallback={<Loader />}>
                    <Outlet />
                </Suspense>
            </Content>
        </Layout>
    )
}

export default DimensionLayout
