import React, { Suspense } from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import { Loader } from '@/ui'
import styles from './styles.module.less'

const { Content } = Layout

const ProjectLayout: React.FC = () => {
    return (
        <Layout className={styles.domainLayoutWapper}>
            <Layout hasSider>
                <Layout>
                    <Content className={styles.domainContent}>
                        <Suspense fallback={<Loader />}>
                            <Outlet />
                        </Suspense>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    )
}

export default ProjectLayout
