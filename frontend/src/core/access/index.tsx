import Cookies from 'js-cookie'
import { getActualUrl, getPlatformPrefix } from '@/utils'
import { findFirstPathByKeys, findFirstPathByModule } from '@/hooks/useMenus'
import { adminRouteKey, homeRouteKeys } from '@/routers/config'

export const filterMenuAccess = (
    routeArr: Array<any>,
    checkAccesses: (paths: string[], mode?: boolean, taskInfo?: any) => boolean,
): any[] => {
    // 简化逻辑：后端返回的菜单就是有权限的菜单，不再检查 access 字段
    return routeArr.reduce((res: any[], item) => {
        if (item?.children) {
            const child = filterMenuAccess(item.children, checkAccesses)
            if (child?.length > 0) {
                return [
                    ...res,
                    {
                        ...item,
                        children: child,
                    },
                ]
            }
        }
        // 直接返回菜单项，不再检查 access 权限
        return [...res, item]
    }, [])
}

// 找出首个有权限的菜单项
export const findFirstPagePath = (menuArr) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const mItem of menuArr) {
        if (mItem.path) {
            return mItem
        }

        if (mItem.children) {
            return findFirstPagePath(mItem.children)
        }
    }
    return {}
}

/**
 * 管理员路径
 */
const goAdminPath = (menus, platform, navigate?) => {
    const adminKey = adminRouteKey[platform]
    const menu = menus.find((item) => item.key === adminKey)
    let firstPath = ''
    if (menu?.type === 'module') {
        firstPath = findFirstPathByModule(adminKey)
    } else {
        firstPath = findFirstPathByKeys([menu?.key])
    }
    if (firstPath) {
        if (navigate) {
            navigate(firstPath)
            return
        }
    }
    Cookies.remove('af.oauth2_token')
    window.location.href = getActualUrl('/')
}

export const goEffectivePath = (
    menus,
    platform,
    isOnlySystemMgm,
    navigate?,
) => {
    // 按优先级检查菜单：数据服务超市 -> 数据运营管理 -> 后台管理
    const menuPriority = [
        { key: 'data-market' }, // 数据服务超市
        { key: 'work-center' }, // 数据运营管理
        { key: 'config-center' }, // 后台管理
    ]

    // 尝试找到第一个有有效路径的菜单
    let targetPath = null
    menuPriority.some(({ key }) => {
        const menu = menus.find((item) => item.key === key)
        if (!menu) return false

        // 检查菜单本身是否有有效 path（非模块容器）
        const firstPath = findFirstPathByModule(key)

        if (firstPath) {
            targetPath = firstPath
            return true // 找到有效路径，停止查找
        }
        return false // 继续查找下一个菜单
    })

    if (targetPath) {
        if (navigate) {
            navigate(targetPath)
            return
        }
    }

    // 如果所有菜单都没有，跳转到无权限页面
    if (navigate) {
        navigate('/no-permission')
        return
    }

    // 如果找不到首页，则清除 token 并跳转到登录页
    Cookies.remove('af.oauth2_token')
    window.location.href = getActualUrl('/')
}

// 获取owning路径
export const getOwning = (menusItems, owning) => {
    return menusItems.filter((menu) =>
        menu.owning?.find((item) => item === owning),
    )
}

// 获取有权限的path
export const getPath = (menusItems, owning, getAccesses) => {
    const menus = getOwning(menusItems, owning)

    return findFirstPagePath(filterMenuAccess(menus, getAccesses))?.path
}
