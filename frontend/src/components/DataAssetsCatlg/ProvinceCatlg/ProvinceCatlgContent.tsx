import Icon, { LeftOutlined } from '@ant-design/icons'
import { Button, Divider, Space, Tabs, Tooltip } from 'antd'
import { isEmpty, noop } from 'lodash'
import moment from 'moment'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useUnmount } from 'ahooks'
import { TextAreaView } from '@/components/AutoFormView/baseViewComponents'
import { useCongSearchContext } from '@/components/CognitiveSearch/CogSearchProvider'
import CustomDrawer from '@/components/CustomDrawer'
import {
    AssetTypeEnum,
    IPrvcDataCatlgDetail,
    formatError,
    getPrvcDataCatlgDetailById,
    getPrvcDataCatlgInfoItemById,
    ObjectionTypeEnum,
} from '@/core'
import { AppDataContentColored, DepartmentOutlined, FontIcon } from '@/icons'
import __ from './locale'
import styles from './styles.module.less'
import AccessModal from '@/components/AccessPolicy/AccessModal'
import { Loader } from '@/ui'
import DataDownloadConfig from '@/components/DataAssetsCatlg/DataDownloadConfig'
import ApplicationServiceDetail from '../ApplicationServiceDetail'

import { MicroWidgetPropsContext } from '@/context'
import { DataCatlgTabKey } from '../helper'

import { PrvcCatlgDetailTabKey, pCatlgCreditCodeList } from './helper'
import InfoItemTableInfo from './InfoItemTableInfo'
import FileRescInfo from './FileRescInfo'
import ApiRescInfo from './ApiRescInfo'
import DBRescInfo from './DBRescInfo'
import BasicInfo from './BasicInfo'
import { IconType } from '@/icons/const'
import ApplyChooseModal from '@/components/ResourceSharing/Apply/ApplyChooseModal'
import { CreateObjection } from '@/components/ObjectionMgt'

interface IProvinceCatlgContent {
    open: boolean
    onClose: (flag?: boolean) => void
    id?: string
    // 默认显示tab页
    tabKey?: string
    isIntroduced?: boolean
    // 是否来自授权页
    isFromAuth?: boolean
    // 是否拥有此数据资源的权限
    hasPermission?: boolean
    returnInDrawer?: () => void
    getContainer?: HTMLElement | false
    showShadow?: boolean
    style?: React.CSSProperties | undefined
    // 是否显示详情需要原有按钮
    isNeedComExistBtns?: boolean
    extraBtns?: React.ReactNode
    canChat?: boolean // 是否可以问答
    hasAsst?: boolean // 是否有认知助手
    headerStyle?: React.CSSProperties | undefined
    headerTitle?: string
    isShowHeader?: boolean
    isFromAi?: boolean
    aiStyle?: React.CSSProperties | undefined
    fullHeight?
    maskClosable?: boolean
}

const ProvinceCatlgContent = ({
    open,
    onClose,
    id = '',
    tabKey,
    isIntroduced,
    isFromAuth,
    hasPermission = false,
    returnInDrawer = noop,
    getContainer = false,
    showShadow = true,
    style,
    isNeedComExistBtns = true,
    extraBtns,
    canChat = false,
    hasAsst = false,
    headerStyle = { display: 'none' },
    headerTitle,
    isShowHeader = false,
    isFromAi = false,
    aiStyle,
    fullHeight = false,
    maskClosable = false,
}: IProvinceCatlgContent) => {
    const [loading, setLoading] = useState(true)

    const container = useRef<any>(null)
    const header = useRef<any>(null)
    const [isApply, setIsApply] = useState<boolean>(false)

    const [tabActiveKey, setTabActiveKey] = useState<PrvcCatlgDetailTabKey>()
    const [downloadOpen, setDownloadOpen] = useState(false)

    // 目录详情
    const [detail, setDetail] = useState<IPrvcDataCatlgDetail>({})
    // 关联信息项
    const [infoItems, setInfoItems] = useState<any>({})

    // 授权申请
    const [permissionRequestOpen, setPermissionRequestOpen] =
        useState<boolean>(false)
    // 授权
    const [accessOpen, setAccessOpen] = useState<boolean>(false)
    // 点击接口
    const [selInterface, setSelInterface] = useState<any>({})
    // 接口详情
    const [interfaceDetailOpen, setInterfaceDetailOpen] =
        useState<boolean>(false)
    // 资源共享申请
    const [shareApplyOpen, setShareApplyOpen] = useState<boolean>(false)
    // 纠错
    const [objectionOpen, setObjectionOpen] = useState<boolean>(false)
    const { bigHeader } = useCongSearchContext()
    const { microWidgetProps } = useContext(MicroWidgetPropsContext)
    // useCogAsstContext 已移除，相关功能已下线

    const detailTabItems = useMemo(() => {
        const tabItems: Array<any> = [
            {
                label: __('基本信息'),
                key: PrvcCatlgDetailTabKey.BASICINFO,
            },
        ]

        if (infoItems?.total_count) {
            tabItems.push({
                label: __('信息项'),
                key: PrvcCatlgDetailTabKey.ITEMS,
            })
        }

        const resource_groups = detail?.resource_groups || {}

        const rescItems =
            [
                {
                    label: __('库表资源'),
                    key: PrvcCatlgDetailTabKey.DBRESC,
                },
                {
                    label: __('接口资源'),
                    key: PrvcCatlgDetailTabKey.APIRESC,
                },
                {
                    label: __('文件资源'),
                    key: PrvcCatlgDetailTabKey.FILERESC,
                },
            ]?.filter((item) => !isEmpty(resource_groups?.[item.key])) || []

        // 仅在规定模块下显示权限Tab
        return [...tabItems, ...rescItems]
    }, [detail, infoItems])

    useEffect(() => {
        if (detailTabItems?.find((item) => item.key === tabKey)) {
            setTabActiveKey(tabKey as PrvcCatlgDetailTabKey)
        } else {
            setTabActiveKey(PrvcCatlgDetailTabKey.BASICINFO)
        }
    }, [detailTabItems])

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
    }, [id, open])

    useUnmount(() => {
        // useCogAsstContext 已移除
    })

    const getDetails = async () => {
        if (!id) return
        try {
            setLoading(true)
            const catlgDetail = await getPrvcDataCatlgDetailById(id)
            const catlgInfoItems = await getPrvcDataCatlgInfoItemById(id)

            setDetail(catlgDetail)
            setInfoItems(catlgInfoItems)
        } catch (err) {
            const { code } = err?.data ?? {}
            if (code === 'DataView.FormView.FormViewIdNotExist') {
                // setIsNotExistDatasheet(
                //     err?.data?.code === 'DataView.FormView.FormViewIdNotExist',
                // )
                onClose()
                return
            }
            formatError(err, microWidgetProps?.components?.toast)
            onClose()
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

    // render
    const renderOtherInfo = (infoItem: any) => {
        const { infoKey, infoRawKey, icon, toolTipTitle } = infoItem
        let value = detail?.[infoKey] || '--'
        if (infoKey === 'org_code') {
            value =
                pCatlgCreditCodeList?.find((item) => item.key === infoKey)
                    ?.label || '--'
        }
        return (
            <Tooltip
                title={
                    <div className={styles.unitTooltip}>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: toolTipTitle(value),
                            }}
                        />
                    </div>
                }
                overlayClassName={styles.toolTipWrapper}
                className={styles.toolTip}
                getPopupContainer={(n) => n.parentElement?.parentElement || n}
                placement="bottom"
            >
                <div className={styles.itemDetailInfo} key={value}>
                    <span>{icon}</span>
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
            onClose={(e: any) => onClose(e)}
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
                className={styles.provinceCatlgDetail}
                ref={container}
                style={{
                    height: isIntroduced ? '100%' : undefined,
                    borderTop:
                        !style && !isIntroduced
                            ? '1px solid rgb(0 0 0 / 10%)'
                            : '',
                }}
            >
                {loading ? (
                    <div className={styles.detailLoading}>
                        <Loader />
                    </div>
                ) : (
                    <>
                        <div
                            className={styles.header}
                            ref={header}
                            hidden={loading}
                        >
                            <div
                                onClick={() => {
                                    returnInDrawer()
                                    onClose(isApply)
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
                                            <AppDataContentColored
                                                className={styles.modelIcon}
                                            />
                                        </div>
                                        <div
                                            className={
                                                styles.rescTopInfoWrapper
                                            }
                                        >
                                            <div
                                                className={styles.logicViewName}
                                            >
                                                <span
                                                    className={styles.name}
                                                    title={
                                                        detail?.title || '--'
                                                    }
                                                >
                                                    {detail?.title || '--'}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            className={styles.oprItemBtn}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setShareApplyOpen(true)
                                            }}
                                        >
                                            <FontIcon
                                                name="icon-shenqing1"
                                                type={IconType.COLOREDICON}
                                                className={
                                                    styles.oprItemBtn_icon
                                                }
                                            />
                                            {__('申请')}
                                        </Button>
                                        <Button
                                            className={styles.oprItemBtn}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setObjectionOpen(true)
                                            }}
                                        >
                                            <FontIcon
                                                name="icon-jiucuo"
                                                type={IconType.COLOREDICON}
                                                className={
                                                    styles.oprItemBtn_icon
                                                }
                                            />
                                            {__('纠错')}
                                        </Button>
                                    </div>
                                    <div className={styles.descriptionWrapper}>
                                        <span className={styles.textTitle}>
                                            {__('描述：')}
                                        </span>
                                        <div className={styles.descContent}>
                                            <TextAreaView
                                                initValue={
                                                    detail?.abstract || '--'
                                                }
                                                rows={1}
                                                placement="end"
                                                onExpand={() => {}}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.itemOtherInfo}>
                                        <div className={styles.updatedAt}>
                                            {`${__('更新时间')} ${
                                                detail?.updated_at
                                                    ? moment(
                                                          detail?.updated_at,
                                                      ).format('YYYY-MM-DD')
                                                    : '--'
                                            }`}
                                        </div>
                                        {showDivder()}
                                        <div className={styles.iconLabel}>
                                            {renderOtherInfo({
                                                infoRawKey: 'org_code',
                                                infoKey: 'org_code',
                                                toolTipTitle: (text) =>
                                                    `${__('所属部门：${text}', {
                                                        text: text || '--',
                                                    })}`,
                                                icon: (
                                                    <DepartmentOutlined
                                                        className={
                                                            styles.commonIcon
                                                        }
                                                    />
                                                ),
                                            })}
                                        </div>
                                    </div>
                                </Space>
                            </div>
                        </div>
                        <div
                            className={styles.contentTabsWrapper}
                            hidden={loading}
                        >
                            <Tabs
                                activeKey={tabActiveKey}
                                onChange={(key: any) => {
                                    setTabActiveKey(key)
                                }}
                                tabBarGutter={32}
                                items={detailTabItems}
                                className={styles.contentTabs}
                            />
                            {tabActiveKey ===
                            PrvcCatlgDetailTabKey.BASICINFO ? (
                                <BasicInfo id={id} detail={detail} />
                            ) : tabActiveKey === PrvcCatlgDetailTabKey.ITEMS ? (
                                <InfoItemTableInfo
                                    id={id}
                                    tableInfoType={DataCatlgTabKey.FIELDINFO}
                                />
                            ) : tabActiveKey ===
                              PrvcCatlgDetailTabKey.DBRESC ? (
                                <DBRescInfo
                                    rescId={
                                        detail?.resource_groups?.view?.[0]
                                            ?.resource_id
                                    }
                                />
                            ) : tabActiveKey ===
                              PrvcCatlgDetailTabKey.APIRESC ? (
                                <ApiRescInfo
                                    rescId={
                                        detail?.resource_groups?.api?.[0]
                                            ?.resource_id
                                    }
                                />
                            ) : tabActiveKey ===
                              PrvcCatlgDetailTabKey.FILERESC ? (
                                <FileRescInfo
                                    rescId={
                                        detail?.resource_groups?.file?.[0]
                                            ?.resource_id
                                    }
                                />
                            ) : null}
                        </div>
                    </>
                )}
            </div>
            {downloadOpen && (
                <DataDownloadConfig
                    formViewId={id}
                    open={downloadOpen}
                    onClose={() => {
                        setDownloadOpen(false)
                    }}
                    isFullScreen
                />
            )}

            {/* 权限申请 */}
            {accessOpen && (
                <AccessModal
                    id={id}
                    type={AssetTypeEnum.DataView}
                    onClose={() => {
                        setAccessOpen(false)
                    }}
                />
            )}

            {interfaceDetailOpen && selInterface?.service_id && (
                <ApplicationServiceDetail
                    open={interfaceDetailOpen}
                    onClose={() => {
                        setInterfaceDetailOpen(false)
                    }}
                    serviceCode={selInterface?.service_id}
                    isIntroduced
                    showShadow={false}
                    style={{
                        position: 'fixed',
                        width: '100vw',
                        height: '100vh',
                        top: '52px',
                        borderTop: '1px solid rgb(0 0 0 / 10%)',
                        color: '#123456,',
                        zIndex: '1001',
                    }}
                    hasAsst={hasAsst}
                />
            )}

            {/* 资源共享申请 */}
            {shareApplyOpen && (
                <ApplyChooseModal
                    data={detail}
                    open={shareApplyOpen}
                    onCancel={() => setShareApplyOpen(false)}
                    onOk={() => setShareApplyOpen(false)}
                />
            )}

            {/* 纠错 */}
            {objectionOpen && (
                <CreateObjection
                    type={ObjectionTypeEnum.DirectoryCorrection}
                    open={objectionOpen}
                    item={detail}
                    onCreateObjectionClose={() => setObjectionOpen(false)}
                />
            )}
        </CustomDrawer>
    )
}

export default ProvinceCatlgContent
