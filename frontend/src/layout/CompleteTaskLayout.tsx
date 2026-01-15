import React, { Suspense, useRef } from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import classnames from 'classnames'
import CompleteTaskHeader from '@/components/CompleteTaskHeader'
import { Loader } from '@/ui'
import { TaskInfoProvider, initTaskInfoData } from '@/context'
import styles from './styles.module.less'

const { Content } = Layout

const CompleteTaskLayout: React.FC = () => {
    return (
        <Layout
            className={classnames(
                styles.layoutWapper,
                styles.completeTaskLayoutWrapper,
            )}
        >
            <TaskInfoProvider initTaskInfo={initTaskInfoData}>
                <CompleteTaskHeader />
                <Layout className={styles.layoutContent}>
                    <Content
                        className={classnames(
                            styles.content,
                            styles.completeTaskContent,
                        )}
                    >
                        <Suspense fallback={<Loader />}>
                            <Outlet />
                        </Suspense>
                    </Content>
                </Layout>
            </TaskInfoProvider>
        </Layout>
    )
}

export default CompleteTaskLayout
