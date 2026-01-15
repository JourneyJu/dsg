import React, { useEffect, useMemo, useState, ReactNode } from 'react'
import { Radio, Tabs } from 'antd'
import classnames from 'classnames'
import styles from './styles.module.less'
import __ from './locale'
import { getPlatformNumber, useQuery } from '@/utils'
import { ServiceType } from './helper'
import { useGeneralConfig } from '@/hooks/useGeneralConfig'
import DataCatlg from './DataCatlg'
import ProvinceCatlg from './ProvinceCatlg'
import InfoResourcesCatlg from './InfoResourcesCatlg'
import { FontIcon } from '@/icons'
import {
    formatError,
    SSZDSyncTaskEnum,
    getSSZDHasSynchTask,
    createSSZDSynchTask,
    HasAccess,
} from '@/core'
import ElectronicLicense from './ElectronicLicense'
import Interface from './Interface'
import { useUserPermCtx } from '@/context/UserPermissionProvider'
import { catlgViewOptions } from './const'
import { useRescProviderContext } from './RescProvider'
import CSSJJAppService from './CSSJJAppService'
import CSSJJSpatialService from './CSSJJSpatialService'

interface IAllDataCatlgProps {
    ref?: any
    searchKey: string
    getClickAsset?: (asset: any, st: ServiceType) => void
    getAddAsset?: (asset: any) => void
    addedAssets?: any[]
    isIntroduced?: boolean
    searchRender?: any
}

const AllDataCatlg: React.FC<IAllDataCatlgProps> = (props: any, ref) => {
    const {
        searchKey,
        getClickAsset,
        getAddAsset,
        addedAssets,
        isIntroduced,
        searchRender,
    } = props
    const query = useQuery()
    const [{ governmentSwitch, local_app }] = useGeneralConfig()
    const platform = getPlatformNumber()

    const [activeKey, setActiveKey] = useState<string>()

    const catlgItems = useMemo(() => {
        const tabs = [
            // {
            //     label: __('信息资源目录'),
            //     key: ServiceType.INFORESOURCESDATACATLG,
            // },
            {
                label: __('数据资源目录'),
                key: ServiceType.DATACATLG,
            },
            {
                label: __('接口服务'),
                key: ServiceType.APPLICATIONSERVICE,
            },
            // {
            //     label: __('电子证照目录'),
            //     key: ServiceType.LICENSE,
            // },
            governmentSwitch?.on
                ? {
                      label: __('省级数据目录'),
                      key: ServiceType.PROVINCEDATACATLG,
                  }
                : undefined,
            governmentSwitch?.on
                ? {
                      label: __('应用服务'),
                      key: ServiceType.CSSJJ_APPSVC,
                  }
                : undefined,
            governmentSwitch?.on
                ? {
                      label: __('空间地理服务'),
                      key: ServiceType.CSSJJ_SPATIALSVC,
                  }
                : undefined,
            // {
            //     label: __('AI服务'),
            //     key: ServiceType.AISERVICE,
            // },
        ]?.filter((item) => item) as Array<{
            key: string
            label: ReactNode
        }>
        setActiveKey(tabs[0]?.key)
        return tabs
    }, [governmentSwitch?.on, platform])

    // 同步中-true为正在同步
    const [isSynchzing, setIsSynchzing] = useState(false)
    // 该同步类型上次同步时间戳（ms），从未同步过返回0
    const [lastUpdTime, setLastUpdTime] = useState<number>(0)

    // 页面loading
    const [isSynchzingLoading, setIsSynchzingLoading] = useState(true)
    const { checkPermissions } = useUserPermCtx()

    const hasBusinessRoles = useMemo(
        () => checkPermissions(HasAccess.isHasBusiness),
        [checkPermissions],
    )

    const { catlgView, setCatlgView, resetCatlgView } = useRescProviderContext()

    const checkSSZDHasSynchTask = async () => {
        try {
            setIsSynchzingLoading(true)
            const res = await getSSZDHasSynchTask(SSZDSyncTaskEnum.Catalog)
            setIsSynchzing(!!res?.id)
            setLastUpdTime(res?.last_sync_time || 0)
        } catch (e) {
            formatError(e)
        } finally {
            setIsSynchzingLoading(false)
        }
    }

    useEffect(() => {
        if (!hasBusinessRoles && !local_app && governmentSwitch?.on) {
            setActiveKey(ServiceType.PROVINCEDATACATLG)
        }
    }, [hasBusinessRoles, local_app, governmentSwitch?.on])

    const handleSynchBtnClick = async () => {
        try {
            setIsSynchzing(true)
            await createSSZDSynchTask(SSZDSyncTaskEnum.Catalog)
            // messageSuccess(__('同步完成'))
        } catch (e) {
            formatError(e)
        }
    }

    return (
        <>
            <div className={styles.bannerWrapper}>
                <h1>{__('数据服务超市')}</h1>
                {/* <div className={styles.bannerContent}>
                    {__('简化数据管理，极简找数用数，实现数据资产')}
                </div> */}
            </div>
            <Tabs
                activeKey={activeKey}
                onChange={(key) => {
                    setActiveKey(key)
                    resetCatlgView?.()
                    if (key === ServiceType.PROVINCEDATACATLG) {
                        checkSSZDHasSynchTask()
                    }
                }}
                getPopupContainer={(node) => node}
                tabBarGutter={32}
                items={catlgItems}
                destroyInactiveTabPane
                className={styles.serviceTabs}
                tabBarExtraContent={{
                    right:
                        // activeKey === ServiceType.DATACATLG ? (
                        //     <div className={styles.checkoutViewWrapper}>
                        //         <Radio.Group
                        //             options={catlgViewOptions}
                        //             onChange={(e) =>
                        //                 setCatlgView(e.target?.value)
                        //             }
                        //             value={catlgView}
                        //             optionType="button"
                        //         />
                        //     </div>
                        // ) :
                        activeKey === ServiceType.PROVINCEDATACATLG ? (
                            <div
                                className={classnames(
                                    styles.tabRightSynchBtn,
                                    isSynchzing && styles.tabRightSynchingBtn,
                                )}
                                onClick={
                                    isSynchzing
                                        ? undefined
                                        : handleSynchBtnClick
                                }
                            >
                                <FontIcon
                                    name="icon-shujutongbu"
                                    className={styles.synchIcon}
                                />
                                <div className={styles.synchBtn}>
                                    {isSynchzing
                                        ? __('省级数据目录同步中…')
                                        : __('同步省级数据目录')}
                                </div>
                            </div>
                        ) : null,
                }}
            />

            {/* 信息资源目录 */}
            {activeKey === ServiceType.INFORESOURCESDATACATLG && (
                <InfoResourcesCatlg />
            )}
            {/* 数据资源目录 */}
            {activeKey === ServiceType.DATACATLG && (
                <DataCatlg
                    // ref={dataRef}
                    searchKey={searchKey}
                    getClickAsset={getClickAsset}
                    getAddAsset={getAddAsset}
                    addedAssets={addedAssets}
                    isIntroduced={isIntroduced}
                    searchRender={searchRender}
                />
            )}
            {/* 接口服务 */}
            {activeKey === ServiceType.APPLICATIONSERVICE && <Interface />}
            {activeKey === ServiceType.AISERVICE && <Interface isAIService />}
            {/* 电子证照目录 */}
            {activeKey === ServiceType.LICENSE && <ElectronicLicense />}
            {/* 省级目录 */}
            {activeKey === ServiceType.PROVINCEDATACATLG && (
                <ProvinceCatlg
                    // ref={dataRef}
                    searchKey={searchKey}
                    isIntroduced={isIntroduced}
                    isSynchzing={isSynchzing}
                    isSynchzingLoading={isSynchzingLoading}
                    lastUpdTime={lastUpdTime}
                    // searchRender={searchRender}
                />
            )}
            {activeKey === ServiceType.CSSJJ_APPSVC && <CSSJJAppService />}
            {activeKey === ServiceType.CSSJJ_SPATIALSVC && (
                <CSSJJSpatialService />
            )}
        </>
    )
}

export default AllDataCatlg
