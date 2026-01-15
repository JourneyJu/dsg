import React, { useState, useEffect, useMemo } from 'react'
import { Menu, MenuProps } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './styles.module.less'
import __ from './locale'
import { findFirstPathByKeys, getRouteByAttr, useMenus } from '@/hooks/useMenus'

const ContentManagementMenu = () => {
    const [menus] = useMenus()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const [selectedKey, setSelectedKey] = useState<string[]>([])

    const menusKeys = [
        'content-management-carousel',
        'content-management-news-dynamic',
        'content-management-policy-basis',
        'content-management-help-center',
        'content-management-service-guidance',
        'content-management-excellent-case-display',
        'content-management-work-zone',
        'content-management-platform-service',
    ]

    const menuItems: MenuProps['items'] = useMemo(() => {
        const items = menusKeys
            .map((item) => {
                const menu = menus.find((it) => it.key === item)
                if (menu) {
                    const { key, label, icon } = menu
                    return { key, label, title: label, icon }
                }
                return null
            })
            .filter((item) => item !== null)
        return items
    }, [selectedKey, menus?.length])

    const handleMenuClick = (item) => {
        const { key, keyPath } = item
        setSelectedKey(keyPath)
        const currentRoute = getRouteByAttr(key, 'key')
        const firstUrl = currentRoute?.path || findFirstPathByKeys([key])
        navigate(firstUrl)
    }

    const getDefaultSelectKey = () => {
        const pathnameArr: string[] = pathname.split('/')
        if ((menuItems || []).find((item) => item?.key === pathnameArr[1])) {
            setSelectedKey([pathnameArr[1]])
        } else {
            setSelectedKey([pathnameArr[1], 'more'])
        }
    }

    useEffect(() => {
        getDefaultSelectKey()
    }, [pathname])

    return (
        <div className={styles.menuWrapper}>
            <div className={styles.menuTitle}>{__('内容管理')}</div>
            <Menu
                mode="inline"
                defaultOpenKeys={selectedKey}
                selectedKeys={selectedKey}
                items={menuItems}
                onClick={handleMenuClick}
            />
        </div>
    )
}

export default ContentManagementMenu
