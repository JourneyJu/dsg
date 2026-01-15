import {
    FC,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import classnames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { useSize } from 'ahooks'
import {
    firstLineMenuKeys,
    secondLineMenuKeys,
    thirdLineMenuKeys,
    fourthLineMenuKeys,
    shortcutMenus,
    personalCenterKeys,
} from './const'
import styles from './styles.module.less'
import __ from './locale'
import {
    formatError,
    getReviewCount,
    getAuditApplyCount,
    getAllMenus,
} from '@/core'
import UserInfo from './UserInfo'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { getActualUrl } from '@/utils'
import {
    checkMenuDeveloping,
    findFirstPathByKeys,
    findFirstPathByModule,
    findMenuTreeByKey,
    getRecentUseRoutesByUserId,
    getRouteByAttr,
    getRouteByModule,
    useMenus,
} from '@/hooks/useMenus'
import { TitleLabel, DevelopingTip } from './helper'
import CardMenu from './CardMenu'
import CardVerticalMenu from './CardVerticalMenu'
import { homeRouteKeys } from '@/routers/config'
import QuickMenuCard from './QuickMenuCard'
import GradientSvgIcon from './GradientSvgIcon'
import { Empty } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'

/**
 * 数据资源管理后台首页
 */
const DrmbHome: FC = () => {
    const navigate = useNavigate()
    const [menus] = useMenus()

    const [userInfo] = useCurrentUser()
    // 审核待办数量
    const [reviewCount, setReviewCount] = useState(0)
    // 我的申请数量
    const [applyCount, setApplyCount] = useState(0)
    // 最近使用
    const [recentUse, setRecentUse] = useState<any[]>([])
    const ref = useRef<HTMLDivElement>(null)
    const size = useSize(ref)

    useLayoutEffect(() => {}, [size])
    const pTop = useMemo(() => {
        if (size?.height) {
            return Math.max((size?.height || 0) * 0.06, 24)
        }
        return null
    }, [size])
    useEffect(() => {
        // getReviewInfo()
        // getApplyInfo()
    }, [])

    useEffect(() => {
        if (userInfo?.ID) {
            const routesUse = getRecentUseRoutesByUserId(userInfo?.ID)
            setRecentUse(
                routesUse
                    .map((it) => {
                        const currentRoute = getRouteByAttr(it, 'key')
                        return currentRoute
                    })
                    .filter((it) => it),
            )
        }
    }, [userInfo])

    // 适配分组菜单数据
    const adaptMenuGroup = (data: any) => {
        const module = menus.find(
            (it) => it.key === data.key && it.type === 'module',
        )
        const items = getRouteByModule(data.key).filter(
            (it) => !data.ignoreKeys?.includes(it.key),
        )
        if (items.length === 0) {
            return undefined
        }
        const children = items.map((it) => adaptMenu(it))
        const obj = {
            ...module,
            isDeveloping: items.every((it) => it.isDeveloping),
            path:
                children.find((it) => it.path && !it.isDeveloping)?.path || '',
            children,
        }
        return obj
    }

    // 适配菜单数据
    const adaptMenu = (child: any) => {
        const currentRoute = getRouteByAttr(child.key, 'key')
        const path =
            currentRoute?.path ||
            findFirstPathByKeys(child.key, [findMenuTreeByKey(child.key)], true)
        const href = `${getActualUrl(path)}`
        return {
            ...child,
            label: child.label || currentRoute?.label,
            path,
        }
    }

    const firstLineMenu = useMemo(() => {
        return adaptMenuGroup(firstLineMenuKeys)
    }, [menus])

    const secLineMenu = useMemo(() => {
        const menuData = secondLineMenuKeys
            .map((it) => adaptMenuGroup(it))
            .filter((it) => it)
        return menuData
    }, [menus])

    const thirdLineMenu = useMemo(() => {
        return adaptMenuGroup(thirdLineMenuKeys)
    }, [menus])

    const fouthLineMenu = useMemo(() => {
        return adaptMenuGroup(fourthLineMenuKeys)
    }, [menus])

    const personalCenterMenu = useMemo(() => {
        return adaptMenuGroup(personalCenterKeys)
    }, [menus])

    // 获取审核待办数量
    const getReviewInfo = async () => {
        try {
            const res = await getReviewCount()
            setReviewCount(res?.count)
        } catch (error) {
            // formatError(error)
        }
    }

    // 获取我的申请数量
    const getApplyInfo = async () => {
        try {
            const res = await getAuditApplyCount()
            setApplyCount(res?.total_count)
        } catch (error) {
            // formatError(error)
        }
    }

    // 跳转
    const jumpTo = (path: string) => {
        if (!path) return
        const url = path.substring(0, 1) === '/' ? path : `/${path}`
        navigate(url)
    }

    // 点击模块
    const onMenuModuleClick = (key: string) => {
        const url = findFirstPathByModule(key, menus, true)
        jumpTo(url)
    }

    // 点击卡片
    const onMenuCardClick = (item: any) => {
        if (item.isDeveloping) return
        const url = item.path
        jumpTo(url)
    }

    // 点击卡片菜单项
    const onMenuItemClick = (item: any) => {
        if (item.isDeveloping || !item.path) return
        const url = findFirstPathByKeys([item.key], menus, true)
        jumpTo(url)
    }

    const getRouters = (routers: any, parentKey?: string) => {
        const list = routers.map((item) => {
            const { children, key } = item
            return {
                ...item,
                // 是否是待开发页面
                isDeveloping: checkMenuDeveloping(item),
                children: children?.length
                    ? getRouters(children, key)
                    : undefined,
            }
        })
        return list
    }

    // 平台间跳转
    const onJumpNewPlatform = async (value: any) => {
        const { platform } = value
        try {
            const res = await getAllMenus()
            const routers = getRouters(res?.menus || [])
            const keys = homeRouteKeys[platform]
            let firstPath = ''
            const menu = routers.find((item) => item.key === keys[0])
            if (keys.length === 1 && menu?.type === 'module') {
                firstPath = findFirstPathByModule(keys[0], routers)
            } else {
                firstPath = findFirstPathByKeys(keys, routers)
            }
            window.open(getActualUrl(firstPath, true, platform), '_blank')
        } catch (error) {
            formatError(error)
        }
    }

    return (
        <div className={styles.drmbHome}>
            <div
                className={styles.homeContent}
                style={{ paddingTop: document.body.clientHeight * 0.07 }}
            >
                <div className={styles.contentLeft}>
                    <div
                        className={styles.secLineMenu}
                        ref={ref}
                        style={{
                            gap: 0,
                            flex: 1,
                            borderRadius: 4,
                            overflow: 'hidden',
                            background: '#fff',
                            paddingTop: pTop || 0,
                        }}
                    >
                        {/* 列表 */}
                        {pTop &&
                            secLineMenu.map((menu) => (
                                <CardVerticalMenu
                                    key={menu.key}
                                    menu={menu}
                                    onCardClick={() => onMenuCardClick(menu)}
                                    onItemClick={(item) =>
                                        onMenuItemClick(item)
                                    }
                                />
                            ))}
                    </div>

                    {/* 省直达 */}
                    <CardMenu
                        menu={fouthLineMenu}
                        isHorizontal
                        onCardClick={() => onMenuCardClick(fouthLineMenu)}
                        onItemClick={(item) => onMenuItemClick(item)}
                        style={{ minHeight: 150 }}
                    />

                    <div className={styles.secLineMenu}>
                        {/* 数据资产管理 */}
                        <CardMenu
                            style={{
                                paddingBottom:
                                    fouthLineMenu?.children?.length > 0
                                        ? 16
                                        : 90,
                            }}
                            menu={firstLineMenu}
                            gridCol={2}
                            isHorizontal
                            onCardClick={() => onMenuCardClick(firstLineMenu)}
                            onItemClick={(item) => onMenuItemClick(item)}
                        />
                        {/* 运营工单 */}
                        <CardMenu
                            menu={thirdLineMenu}
                            gridCol={2}
                            isHorizontal
                            onCardClick={() => onMenuCardClick(thirdLineMenu)}
                            onItemClick={(item) => onMenuItemClick(item)}
                        />
                    </div>
                </div>

                <div className={styles.contentRight}>
                    <div className={styles.contentBlock}>
                        <UserInfo onMenuModuleClick={onMenuModuleClick} />
                        <TitleLabel title={__('审核待办')} />
                        <div className={styles.rightLabel}>
                            {/* <DevelopingTip menu={personalCenterMenu}> */}
                            <div className={styles.rightLabelWrap}>
                                <GradientSvgIcon
                                    className={styles.rightLabelIcon}
                                    name="icon-daibanrenwu"
                                    style={{ fontSize: 24 }}
                                    colors={[
                                        'rgba(255, 196, 116, 1)',
                                        'rgba(255, 129, 37, 1)',
                                    ]}
                                    bgColors={[
                                        'rgba(255, 196, 116, 0.08)',
                                        'rgba(255, 129, 37, 0.08)',
                                    ]}
                                />
                                <div
                                    onClick={() =>
                                        window.open(
                                            getActualUrl(
                                                '/personal-center/doc-audit-client',
                                            ),
                                            '_blank',
                                        )
                                    }
                                    className={classnames(
                                        styles.rightLabelItem,
                                        {
                                            [styles.rightLabelItemDisabled]:
                                                personalCenterMenu?.isDeveloping,
                                        },
                                    )}
                                >
                                    <div className={styles.rightLabelText}>
                                        {__('待办任务')}
                                    </div>
                                    <div className={styles.rightLabelVal}>
                                        {reviewCount}
                                    </div>
                                </div>
                            </div>
                            {/* </DevelopingTip> */}

                            <DevelopingTip menu={personalCenterMenu}>
                                <div className={styles.rightLabelWrap}>
                                    <GradientSvgIcon
                                        className={styles.rightLabelIcon}
                                        name="icon-woshenqingde"
                                        style={{ fontSize: 24 }}
                                        colors={[
                                            'rgba(0, 198, 255, 1)',
                                            'rgba(0, 148, 255, 1)',
                                        ]}
                                        bgColors={[
                                            'rgba(0, 198, 255, 0.08)',
                                            'rgba(0, 148, 255, 0.08)',
                                        ]}
                                    />
                                    <div
                                        onClick={() =>
                                            window.open(
                                                getActualUrl(
                                                    '/personal-center/doc-audit-client/?target=apply',
                                                ),
                                                '_blank',
                                            )
                                        }
                                        className={classnames(
                                            styles.rightLabelItem,
                                            {
                                                [styles.rightLabelItemDisabled]:
                                                    personalCenterMenu?.isDeveloping,
                                            },
                                        )}
                                    >
                                        <div className={styles.rightLabelText}>
                                            {__('我申请的')}
                                        </div>
                                        <div className={styles.rightLabelVal}>
                                            {applyCount}
                                        </div>
                                    </div>
                                </div>
                            </DevelopingTip>
                        </div>
                        <DevelopingTip menu={personalCenterMenu}>
                            <div
                                onClick={() => {
                                    // jumpTo('personal-center')
                                    window.open(
                                        getActualUrl('/personal-center'),
                                        '_blank',
                                        'noopener noreferrer',
                                    )
                                }}
                                className={classnames(styles.personalCenter, {
                                    [styles.personalCenterDisabled]:
                                        personalCenterMenu?.isDeveloping,
                                })}
                            >
                                {__('进入个人中心')}
                            </div>
                        </DevelopingTip>
                        <TitleLabel
                            title={__('最近使用')}
                            style={{ marginBottom: 16 }}
                        />
                        <div className={styles.recentUse}>
                            {recentUse?.length > 0 ? (
                                recentUse.map((item) => {
                                    return (
                                        <div
                                            key={item?.key}
                                            className={styles.recUseCard}
                                            onClick={() => jumpTo(item?.path)}
                                        >
                                            {item?.label}
                                        </div>
                                    )
                                })
                            ) : (
                                <Empty
                                    desc="暂无使用记录"
                                    iconSrc={dataEmpty}
                                    style={{ width: '100%' }}
                                    iconHeight={100}
                                />
                            )}
                        </div>
                    </div>
                    <div className={styles.contentBlock}>
                        <TitleLabel
                            title={__('快捷入口')}
                            style={{ marginBottom: 20 }}
                        />
                        <div className={styles.shortcutMenu}>
                            {shortcutMenus.map((item) => {
                                return (
                                    <QuickMenuCard
                                        className={styles.shortcutMenuCard}
                                        menu={item}
                                        onClick={() => onJumpNewPlatform(item)}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DrmbHome
