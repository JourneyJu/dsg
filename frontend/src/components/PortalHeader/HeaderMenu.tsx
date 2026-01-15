import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Menu, MenuProps } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSize } from 'ahooks'
import classnames from 'classnames'
import { DownOutlined } from '@ant-design/icons'
import styles from './styles.module.less'
import __ from './locale'
import {
    findFirstPathByKeys,
    findFirstPathByModule,
    getRouteByAttr,
    getRouteByModule,
    useMenus,
} from '@/hooks/useMenus'
import { homeRouteKeys } from '@/routers/config'
import { getPlatformNumber } from '@/utils'

interface IHeaderMenu {
    // 深色模式
    darkMode?: boolean
}

const HeaderMenu = ({ darkMode = false }: IHeaderMenu) => {
    const [selectedKey, setSelectedKey] = useState<string[]>([])
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const ref = useRef(null)
    const size = useSize(ref)
    const [menus] = useMenus()
    const platform = getPlatformNumber()

    const menuItems: MenuProps['items'] = useMemo(() => {
        const items = homeRouteKeys[platform]
            .map((item) => {
                // TODO homeRouteKeys目前只放开了两个菜单
                const menu = menus.find((it) => it.key === item)
                if (menu) {
                    const { key, label } = menu
                    if (menu.type === 'module') {
                        const childs = getRouteByModule(key).filter(
                            (m) => m.type !== 'group',
                        )
                        return {
                            key,
                            label,
                            title: (
                                <span className={styles.menuTitleWrapper}>
                                    <span className={styles.menuTitle}>
                                        {label}
                                    </span>
                                    <DownOutlined />
                                </span>
                            ),
                            type: 'SubMenu',
                            children: childs.map((c) => ({
                                key: c.key,
                                label: c.label,
                            })),
                        }
                    }
                    return { key, label, title: label }
                }
                return null
            })
            .filter((item) => item !== null)

        // if (size?.width) {
        //     let showNumber = Math.floor((Math.max(size.width, 64) - 28) / 68)
        //     if (showNumber < 8) {
        //         showNumber =
        //             items.length === showNumber
        //                 ? showNumber + 1
        //                 : items.length === 2
        //                 ? 3
        //                 : showNumber
        //         // 显示的菜单
        //         const showItems = items.slice(0, showNumber - 1)
        //         // 隐藏的菜单
        //         const hideItems = drop(items, showNumber - 1)
        //         // 设置 'more' 菜单选中状态
        //         if (
        //             hideItems.find((item: any) =>
        //                 selectedKey.includes(item.key),
        //             )
        //         ) {
        //             if (!selectedKey.includes('more')) {
        //                 setSelectedKey((prev) => [...prev, 'more'])
        //             }
        //         } else if (selectedKey.includes('more')) {
        //             setSelectedKey((prev) =>
        //                 prev.filter((item) => item !== 'more'),
        //             )
        //         }
        //         if (hideItems.length > 0) {
        //             return [
        //                 ...showItems,
        //                 {
        //                     label: __('更多'),
        //                     key: 'more',
        //                     children: hideItems,
        //                     popupClassName: styles['sider-submenu'],
        //                 },
        //             ]
        //         }
        //         return showItems
        //     }
        // }
        return items
    }, [selectedKey, menus?.length])

    /**
     * 获取选中菜单的路径
     * @returns 路径
     */
    const getDefaultSelectKey = () => {
        const pathnameArr: string[] = pathname.split('/')
        if ((menuItems || []).find((item) => item?.key === pathnameArr[1])) {
            setSelectedKey([pathnameArr[1]])
        } else {
            setSelectedKey([pathnameArr[1], 'more'])
        }
    }

    const handleMenuClick = (item) => {
        const { key, keyPath } = item
        setSelectedKey(keyPath)
        const findMenu = menus.find((it) => it.key === key)
        if (findMenu.type === 'module') {
            const firstUrl = findFirstPathByModule(key)
            navigate(firstUrl)
        } else {
            const currentRoute = getRouteByAttr(key, 'key')
            const firstUrl = currentRoute?.path || findFirstPathByKeys([key])
            navigate(firstUrl)
        }
    }

    useEffect(() => {
        getDefaultSelectKey()
    }, [pathname])

    return (
        <div
            ref={ref}
            className={classnames(styles.headerMenu, {
                [styles.darkModeMenu]: darkMode,
            })}
        >
            <Menu
                mode="horizontal"
                defaultOpenKeys={selectedKey}
                selectedKeys={selectedKey}
                items={menuItems}
                onClick={handleMenuClick}
            />
        </div>
    )
}

export default HeaderMenu
