import React, { useState, Suspense, useMemo, useRef, useEffect } from 'react'
import { Layout, message } from 'antd'
import { Outlet, useLocation } from 'react-router-dom'
import classnames from 'classnames'
import { Loader } from '@/ui'
import styles from './styles.module.less'
import PortalHeader from '@/components/PortalHeader'
import ContentManagementMenu from '@/components/ContentManagementMenu'

const { Content, Sider } = Layout

/** 内容管理布局 */
const ContentManageLayout: React.FC = () => {
    const { pathname } = useLocation()

    useMemo(() => {}, [pathname])

    return (
        <Layout className={classnames(styles.contentManageLayoutWapper)}>
            <PortalHeader />
            <Layout
                id="contentManageLayout"
                className={styles.contentManageLayout}
                hasSider
            >
                <ContentManagementMenu />
                <Content className={styles.content}>
                    <Suspense fallback={<Loader />}>
                        <Outlet />
                    </Suspense>
                </Content>
            </Layout>
        </Layout>
    )
}

export default ContentManageLayout
