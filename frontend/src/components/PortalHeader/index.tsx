import { useState, useEffect, CSSProperties, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Badge, Layout, Tooltip } from 'antd'
import classnames from 'classnames'
import { useSelector } from 'react-redux'
import csLogo from '@/assets/csLogo.png'
import csLogoWhite from '@/assets/csLogo_white.png'
import styles from './styles.module.less'
import UserInfoCard from '../UserInfoCard'
import { allRoleList, goEffectivePath, HasAccess } from '@/core'
import __ from './locale'
import { getActualUrl, getPlatformNumber } from '@/utils'
import { homeRouteKeys } from '@/routers/config'
import { flatRoute, getRouteByKeys, useMenus } from '@/hooks/useMenus'
import HeaderMenu from './HeaderMenu'
import { useUserPermCtx } from '@/context/UserPermissionProvider'
import { FontIcon } from '@/icons'
import CityShareCard from '../AssetCenterHeader/CityShareCard'
import { useOemConfig } from '@/hooks/useOemConfig'

const { Header: AntdHeader } = Layout

interface IPortalHeader {
    darkMode?: boolean
    style?: CSSProperties
}

/** 门户平台的导航头 */
const PortalHeader = ({ darkMode = false, style }: IPortalHeader) => {
    const navigate = useNavigate()
    const { checkPermission } = useUserPermCtx()
    const [menus] = useMenus()
    const platform = getPlatformNumber()
    const [oemConfig] = useOemConfig()
    const [inHome, setInHome] = useState<boolean>(false)
    const { pathname } = useLocation()
    const citySharingData = useSelector(
        (state: any) => state?.citySharingReducer,
    )

    const isOnlySystemMgm = useMemo(
        () => checkPermission(allRoleList.TCSystemMgm, 'only') ?? false,
        [checkPermission],
    )

    useEffect(() => {
        // homeRouteKeys[platform][0]
        const homeMenu = flatRoute(getRouteByKeys(['portal-home']), true)
        const path =
            pathname.slice(-1) === '/'
                ? pathname.slice(0, pathname.length - 1)
                : pathname
        setInHome(homeMenu.some((item) => item.path === path))
    }, [pathname])

    const handleClickHeaderImg = () => {
        if (inHome || isOnlySystemMgm) {
            return
        }

        goEffectivePath(menus, platform, isOnlySystemMgm, navigate)
    }

    return (
        <AntdHeader
            className={classnames(styles.portalHeaderWrapper, {
                // [styles.portalHeaderHome]: inHome,
                [styles.portalHeaderDark]: darkMode,
            })}
            style={style}
        >
            <div
                className={classnames(styles.imgWrapper, {
                    [styles.imgWrapperDisabled]: isOnlySystemMgm || inHome,
                })}
            >
                {oemConfig?.['logo.png'] && (
                    <img
                        height="40px"
                        src={`data:image/png;base64,${
                            darkMode
                                ? oemConfig['darklogo.png']
                                : oemConfig['logo.png']
                        }`}
                        alt="长沙市数据资源管理平台"
                        aria-hidden
                        className={classnames(styles.img)}
                        onClick={handleClickHeaderImg}
                    />
                )}
            </div>
            <div className={styles.headerTitle}>
                <div className={styles.divider} />
                <span className={styles.subTitle}>湖南省政务信息共享网站</span>
            </div>
            <HeaderMenu darkMode={darkMode} />
            <div className={styles.operationWrapper}>
                {!isOnlySystemMgm &&
                    checkPermission('initiateDataAnalysisDemand') && (
                        <Tooltip title={__('数据分析需求申请')}>
                            <FontIcon
                                name="icon-shujufenxixuqiushenqing"
                                className={styles.singleIcon}
                                onClick={() => {
                                    window.open(
                                        getActualUrl(
                                            '/dataAnalysis/apply',
                                            true,
                                            2,
                                        ),
                                        '_blank',
                                    )
                                }}
                            />
                        </Tooltip>
                    )}
                {/* 市州共享申请 */}
                {!isOnlySystemMgm &&
                    checkPermission('initiateSharedApplication') && (
                        <CityShareCard>
                            <Badge
                                count={citySharingData?.data?.length || 0}
                                overflowCount={99}
                                size="small"
                                color="#8FCBFF"
                                offset={[-8, 8]}
                            >
                                <Tooltip title={__('发起共享申报')}>
                                    <FontIcon
                                        name="icon-gouwuche1"
                                        className={styles.singleIcon}
                                    />
                                </Tooltip>
                            </Badge>
                        </CityShareCard>
                    )}

                {!isOnlySystemMgm &&
                    checkPermission('initiateDataSupplyDemand') && (
                        <Tooltip title={__('发起供需申报')}>
                            <FontIcon
                                name="icon-faqigongxuduijie"
                                className={styles.singleIcon}
                                onClick={() => {
                                    window.open(
                                        getActualUrl(
                                            '/city-demand/apply',
                                            true,
                                            2,
                                        ),
                                        '_self',
                                    )
                                }}
                            />
                        </Tooltip>
                    )}

                <div className={styles.itemWrapper}>
                    <UserInfoCard darkMode={darkMode} />
                </div>
            </div>
        </AntdHeader>
    )
}

export default PortalHeader
