import { LeftOutlined } from '@ant-design/icons'
import { Divider, Space, Tabs, Tooltip } from 'antd'
import { noop } from 'lodash'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useCongSearchContext } from '@/components/CognitiveSearch/CogSearchProvider'
import CustomDrawer from '@/components/CustomDrawer'
import {
    formatError,
    queryFontendLicenseDetail,
    ResType,
    LoginPlatform,
    OnlineStatus,
} from '@/core'
import { FontIcon } from '@/icons'
import __ from './locale'
import styles from './styles.module.less'

import { formatTime, useQuery, getPlatformNumber } from '@/utils'
import { Loader } from '@/ui'

import { MicroWidgetPropsContext } from '@/context'
import { itemOtherInfo } from './helper'
import { LicenseTabKey } from '@/components/ElectronicLicense/Detail/helper'
import { IconType } from '@/icons/const'
import BasicInfo from './BasicInfo'
import FavoriteOperation, {
    UpdateFavoriteParams,
} from '@/components/Favorite/FavoriteOperation'

interface ILicenseDetail {
    open: boolean
    onClose: ({ flag, detail }: { flag?: boolean; detail?: any }) => void
    id?: string
    isIntroduced?: boolean
    returnInDrawer?: () => void
    getContainer?: HTMLElement | false
    showShadow?: boolean
    style?: React.CSSProperties | undefined
    canChat?: boolean // 是否可以问答
    headerStyle?: React.CSSProperties | undefined
    headerTitle?: string
    isShowHeader?: boolean
    fullHeight?
    maskClosable?: boolean
}

const LicenseDetail = ({
    open,
    onClose,
    id = '',
    isIntroduced,
    returnInDrawer = noop,
    getContainer = false,
    showShadow = true,
    style,
    canChat = false,
    headerStyle = { display: 'none' },
    headerTitle,
    isShowHeader = false,
    fullHeight = false,
    maskClosable = false,
}: ILicenseDetail) => {
    const [loading, setLoading] = useState(true)

    const container = useRef<any>(null)
    const header = useRef<any>(null)
    const [basicInfo, setBasicInfo] = useState<any>({})
    const { bigHeader } = useCongSearchContext()
    const { microWidgetProps } = useContext(MicroWidgetPropsContext)
    // useCogAsstContext 已移除，相关功能已下线

    const query = useQuery()
    const licenseId = query.get('licenseId') || ''
    // 库表id--不能为空  如果参数中有id就使用id，否则使用页面路径licenseId参数
    const [rescId, setRescId] = useState<string>('')
    const platform = getPlatformNumber()
    // const detailTabItems = useMemo(() => {
    //     return [
    //         {
    //             label: __('基本信息'),
    //             key: LicenseTabKey.BASIC,
    //         },
    //     ]
    // }, [basicInfo])

    useEffect(() => {
        if (id) {
            setRescId(id || '')
        } else {
            setRescId(licenseId)
        }
    }, [id])

    // 抽屉 top
    const styleTop = useMemo(() => {
        if (style?.top === 0) {
            return 0
        }
        if (style?.top) {
            if (typeof style.top === 'number') {
                return style.top
            }
            return Number(style.top.replace('px', ''))
        }
        return bigHeader ? 62 : 52
    }, [style])

    useEffect(() => {
        if (open) {
            getDetails()
        }
    }, [rescId, open])

    const getDetails = async () => {
        if (!rescId) return
        try {
            setLoading(true)
            const res = await queryFontendLicenseDetail(rescId)
            setBasicInfo(res)
        } catch (err) {
            const { code } = err?.data ?? {}

            formatError(err, microWidgetProps?.components?.toast)
            onClose({})
        } finally {
            setLoading(false)
        }
    }

    const showDivder = (divdStyle?: any) => {
        return (
            <Divider
                style={{
                    height: '12px',
                    borderRadius: '1px',
                    borderLeft: '1px solid rgba(0,0,0,0.24)',
                    margin: '0px 2px 0px 12px',
                    ...divdStyle,
                }}
                type="vertical"
            />
        )
    }

    const showToolTip = (title: any, toolTipTitle: any, value: any) => {
        return (
            <Tooltip
                title={
                    title ? (
                        <div className={styles.unitTooltip}>
                            <div>{toolTipTitle}</div>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: value || '--',
                                }}
                            />
                        </div>
                    ) : (
                        value
                    )
                }
                overlayClassName={styles.toolTipWrapper}
                className={styles.toolTip}
                getPopupContainer={(n) => n.parentElement?.parentElement || n}
                placement="bottom"
            >
                <div className={styles.itemDetailInfo} key={title}>
                    <span>{title}</span>
                    <span
                        className={styles.itemDetailInfoValue}
                        dangerouslySetInnerHTML={{
                            __html: value || '--',
                        }}
                    />
                </div>
            </Tooltip>
        )
    }

    // render
    const renderOtherInfo = (item: any, data: any) => {
        const { firstKey, infoKey, type, title, toolTipTitle } = item

        const showContent = data?.[infoKey] || ''
        return showToolTip(title, toolTipTitle, showContent)
    }

    // 收藏状态改变
    const handleFavoriteChange = (res: UpdateFavoriteParams) => {
        setBasicInfo({
            ...basicInfo,
            is_favored: res?.is_favored,
            favor_id: res?.favor_id,
        })
    }

    return (
        <CustomDrawer
            open={open}
            isShowFooter={false}
            bodyStyle={{
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
            }}
            onClose={(e: any) => onClose({ flag: e, detail: basicInfo })}
            title={headerTitle}
            customHeaderStyle={{ display: 'none' }}
            customBodyStyle={{
                height: fullHeight ? '100%' : `calc(100% - ${styleTop}px)`,
                background: '#f0f2f6',
                position: 'relative',
                overflow: 'hidden',
            }}
            headerStyle={headerStyle}
            isShowHeader={isShowHeader}
            style={
                style ||
                (isIntroduced
                    ? {
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          top: 0,
                      }
                    : {
                          position: 'fixed',
                          width: '100vw',
                          height: '100vh',
                          top: styleTop,
                      })
            }
            getContainer={getContainer}
            maskClosable={maskClosable}
        >
            {showShadow && (
                <div hidden={loading} className={styles.bodyShadow} />
            )}
            <div
                className={styles.licenseDetail}
                ref={container}
                style={{
                    height: isIntroduced ? '100%' : undefined,
                    borderTop:
                        !style && !isIntroduced
                            ? '1px solid rgb(0 0 0 / 10%)'
                            : '',
                }}
            >
                {loading && (
                    <div className={styles.detailLoading}>
                        <Loader />
                    </div>
                )}
                <div className={styles.header} ref={header} hidden={loading}>
                    <div
                        onClick={() => {
                            returnInDrawer()
                            onClose({ detail: basicInfo })
                        }}
                        className={styles.returnInfo}
                    >
                        <LeftOutlined className={styles.returnArrow} />
                    </div>
                    <div className={styles.headerContent}>
                        <Space
                            direction="vertical"
                            wrap={false}
                            style={{ width: '100%' }}
                        >
                            <div className={styles.headerBox}>
                                <div className={styles.rescIcon}>
                                    <FontIcon
                                        name="icon-dianzizhengzhaomulu"
                                        type={IconType.COLOREDICON}
                                        style={{ fontSize: '44px' }}
                                    />
                                </div>
                                <div className={styles.rescTopInfoWrapper}>
                                    <div
                                        className={styles.name}
                                        title={basicInfo?.name}
                                    >
                                        <span
                                            className={styles.name}
                                            title={basicInfo?.name}
                                        >
                                            {basicInfo?.name || '--'}
                                        </span>
                                        {/* {hasDataOperRole &&!baseInfoData?.online_status && (
                                                    <div
                                                        className={
                                                            styles.publishState
                                                        }
                                                    >
                                                        {
                                                            __('未上线')
                                                        }
                                                    </div>
                                                )} */}
                                    </div>
                                    <div className={styles.logicSubInfo}>
                                        <div
                                            className={
                                                styles.rescCodeInfoWrapper
                                            }
                                        >
                                            {__('编码：')}
                                            <span
                                                title={basicInfo?.code || '--'}
                                            >
                                                {basicInfo?.code || '--'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Space>
                                    {platform === LoginPlatform.drmp &&
                                        [
                                            OnlineStatus.ONLINE,
                                            OnlineStatus.DOWN_AUDITING,
                                            OnlineStatus.DOWN_REJECT,
                                        ].includes(
                                            basicInfo?.online_status as OnlineStatus,
                                        ) && (
                                            <FavoriteOperation
                                                type="button"
                                                resType={
                                                    ResType.ElecLicenceCatalog
                                                }
                                                item={basicInfo}
                                                onAddFavorite={
                                                    handleFavoriteChange
                                                }
                                                onCancelFavorite={
                                                    handleFavoriteChange
                                                }
                                            />
                                        )}
                                </Space>
                            </div>
                            {/* <div className={styles.descriptionWrapper}>
                                    <span className={styles.textTitle}>
                                        {__('描述：')}
                                    </span>
                                    <div className={styles.descContent}>
                                        <TextAreaView
                                            initValue={
                                                baseInfoData?.description ||
                                                '--'
                                            }
                                            rows={1}
                                            placement="end"
                                            onExpand={() => {}}
                                        />
                                    </div>
                                </div> */}
                            <div className={styles.itemOtherInfo}>
                                <div
                                    style={{
                                        flexShrink: 0,
                                    }}
                                >
                                    {`${__('上线时间')} ${
                                        formatTime(basicInfo.online_time) ||
                                        '--'
                                    }`}
                                </div>
                                {showDivder()}
                                <div className={styles.iconLabel}>
                                    {itemOtherInfo.map((oItem) => {
                                        return renderOtherInfo(oItem, basicInfo)
                                    })}
                                </div>
                            </div>
                        </Space>
                    </div>
                </div>
                <div className={styles.contentTabsWrapper} hidden={loading}>
                    {/* <Tabs
                            activeKey={tabActiveKey}
                            onChange={(key: any) => {
                                setTabActiveKey(key)
                            }}
                            tabBarGutter={32}
                            items={detailTabItems}
                            className={styles.contentTabs}
                        />
                        {tabActiveKey === detailTabKey.view && (
                            <div className={styles.viewDetailsWrapper}>
                                <BasicInfo id={id} isMarket />
                            </div>
                        )} */}

                    <div className={styles.viewDetailsWrapper}>
                        <BasicInfo id={id} details={basicInfo} isMarket />
                    </div>
                </div>
            </div>
        </CustomDrawer>
    )
}

export default LicenseDetail
