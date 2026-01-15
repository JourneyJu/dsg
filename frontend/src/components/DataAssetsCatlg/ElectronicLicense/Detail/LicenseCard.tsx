import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { message, Space, Row, Col, Tabs, Tooltip, Button } from 'antd'
import { isString } from 'lodash'
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react'
import dataEmpty from '@/assets/dataEmpty.svg'
import CustomDrawer from '@/components/CustomDrawer'
import { getFieldTypeEelment } from '@/components/DatasheetView/helper'
import { MicroWidgetPropsContext } from '@/context'
import {
    formatError,
    queryFontendLicenseDetail,
    queryFontendLicenseInfoItems,
    ResType,
    LoginPlatform,
    OnlineStatus,
} from '@/core'
import { getPlatformNumber } from '@/utils'
import { CloseOutlined, FullScreenOutlined } from '@/icons'
import { Empty, Expand, Loader } from '@/ui'
import { cardBaiscInfoList } from './helper'
import __ from './locale'
import styles from './styles.module.less'
import { LicenseTabKey } from '@/components/ElectronicLicense/Detail/helper'
import FavoriteOperation, {
    UpdateFavoriteParams,
} from '@/components/Favorite/FavoriteOperation'

const licenseCardId = 'licenseCardId'

interface IOperaionModelType {
    open?: boolean
    id: string
    cardProps?: Record<string, any>
    onFullScreen: (isOwner?: boolean) => void
    onClose: (flag?: boolean) => void
    onSure: () => void
    onFavoriteChange: (res: UpdateFavoriteParams) => void
    selectedResc?: any
}

const LicenseCard = ({
    open,
    id,
    cardProps,
    onFullScreen,
    onClose,
    onSure,
    onFavoriteChange,
    selectedResc,
}: IOperaionModelType) => {
    const { microWidgetProps } = useContext(MicroWidgetPropsContext)

    const [loading, setLoading] = useState<boolean>(true)
    const [fieldsLoading, setFieldsLoading] = useState<boolean>(true)

    const [tabActiveKey, setTabActiveKey] = useState<string>(
        LicenseTabKey.COLUMN,
    )
    const cardRef = useRef<any>()
    const viewContentRef = useRef<any>()
    const tabBarRef = useRef<any>()

    const [showBackToTop, setShowBackToTop] = useState<boolean>(false)
    const platform = getPlatformNumber()
    const handleScroll = () => {
        const scrollableElement = viewContentRef?.current
        const stickyElement = tabBarRef?.current
        // card viewHeaderWrapper高度47
        const stickyThreshold = 47

        if (
            scrollableElement &&
            stickyElement &&
            scrollableElement.scrollTop >=
                stickyElement.offsetTop - stickyThreshold
        ) {
            setShowBackToTop(true)
        } else {
            setShowBackToTop(false)
        }
    }

    useEffect(() => {
        const scrollableElement = viewContentRef?.current
        scrollableElement?.addEventListener('scroll', handleScroll)
        return () =>
            scrollableElement?.removeEventListener('scroll', handleScroll)
    }, [loading])

    const [basicInfo, setBasicInfo] = useState<any>()
    // 信息项列表
    const [fields, setFields] = useState<any>()

    const detailTabItems = useMemo(() => {
        const tabItems = [
            {
                label: __('信息项：${count}', {
                    count: fields?.length || 0,
                }),
                key: LicenseTabKey.COLUMN,
            },
        ]
        return tabItems
    }, [fields])

    useEffect(() => {
        if (open) {
            // setLoading(true)
            message.destroy()
            setBasicInfo(undefined)
            initTableData()
            getFieldsInfo()
        }
    }, [id, open])

    useEffect(() => {
        if (selectedResc) {
            setBasicInfo({
                ...basicInfo,
                is_favored: selectedResc?.is_favored,
                favor_id: selectedResc?.favor_id,
            })
        }
    }, [selectedResc?.is_favored])

    // 收藏状态改变
    const handleFavoriteChange = (res) => {
        setBasicInfo({
            ...basicInfo,
            is_favored: res?.is_favored,
            favor_id: res?.favor_id,
        })
        onFavoriteChange(res)
    }

    const initTableData = async () => {
        try {
            if (!id) return
            setLoading(true)
            const res = await queryFontendLicenseDetail(id)
            setBasicInfo(res)
        } catch (err) {
            if (err?.data?.code !== 'ERR_CANCELED') {
                formatError(err, microWidgetProps?.components?.toast)
                // onClose()
            }
        } finally {
            setLoading(false)
        }
    }

    const getFieldsInfo = async () => {
        try {
            setFieldsLoading(true)
            const res = await queryFontendLicenseInfoItems(id, {
                offset: 1,
                limit: 1000,
            })
            setFields(res?.entries || [])
        } catch (e) {
            formatError(e)
        } finally {
            setFieldsLoading(false)
        }
    }

    const fieldsEmpty = (desc?: string, iconSrc?: any) => {
        return <Empty iconSrc={iconSrc || dataEmpty} desc={desc} />
    }

    const renderParamsInfo = (info: any) => {
        const { key, type } = info
        const text = basicInfo?.[key]
        if (key === 'description') {
            return (
                <Expand
                    content={text || '--'}
                    expandTips={
                        <span className={styles.expBtn}>
                            {__('展开')}
                            <DownOutlined className={styles.expIcon} />
                        </span>
                    }
                    collapseTips={
                        <span className={styles.expBtn}>
                            {__('收起')}
                            <UpOutlined className={styles.expIcon} />
                        </span>
                    }
                />
            )
        }
        // if (type === 'timestamp') {
        //     return formatTime(text) || '--'
        // }

        return text || '--'
    }

    /**
     *
     * @param _fields 字段（包含名称、类型等）
     * @param _fieldsData 字段数据（样例数据/合成数据）
     * @returns
     */
    const renderFields = (_fields, _fieldsData?: any) => {
        return _fields?.map((fItem) => (
            <div key={fItem.id} className={styles.fieldItemWrapper}>
                <div className={styles.fieldsHeader}>
                    {getFieldTypeEelment(
                        {
                            type: fItem.data_type,
                        },
                        18,
                    )}
                    <div
                        className={styles.fieldTitle}
                        title={fItem.business_name || '--'}
                    >
                        {fItem.business_name || '--'}
                    </div>
                    {/* {fItem.primary_key && (
                        <div className={styles.isPrimary}>{__('主键')}</div>
                    )} */}
                </div>
                {/* <div
                    className={styles.desc}
                    title={fItem.technical_name || '--'}
                >
                    {fItem.technical_name || '--'}
                </div> */}
            </div>
        ))
    }

    return (
        <div
            className={styles.licenseCardWrapper}
            ref={cardRef}
            id={licenseCardId}
        >
            <CustomDrawer
                open={open}
                destroyOnClose
                loading={loading || fieldsLoading}
                onCancel={onClose}
                onClose={() => onClose()}
                handleOk={onSure}
                isShowHeader={false}
                isShowFooter={false}
                customBodyStyle={{
                    flexDirection: 'column',
                    height: '100%',
                }}
                bodyStyle={{
                    padding: 0,
                }}
                style={{
                    position: 'relative',
                    right: '0',
                    height: '100%',
                }}
                {...cardProps}
            >
                <div hidden={!loading}>
                    <Loader />
                </div>
                <div className={styles.viewHeaderWrapper}>
                    <div className={styles.titleWrapper} hidden={loading}>
                        <div
                            className={styles.viewTitle}
                            title={basicInfo?.name}
                        >
                            {basicInfo?.name || '--'}
                        </div>
                        <Space size={4} className={styles.headerBtnWrapper}>
                            {platform === LoginPlatform.drmp &&
                                [
                                    OnlineStatus.ONLINE,
                                    OnlineStatus.DOWN_AUDITING,
                                    OnlineStatus.DOWN_REJECT,
                                ].includes(
                                    basicInfo?.online_status as OnlineStatus,
                                ) && (
                                    <FavoriteOperation
                                        item={basicInfo}
                                        resType={ResType.ElecLicenceCatalog}
                                        onAddFavorite={handleFavoriteChange}
                                        onCancelFavorite={handleFavoriteChange}
                                    />
                                )}
                            <Tooltip title={__('进入全屏')} placement="bottom">
                                <FullScreenOutlined
                                    className={styles.fullScreenIcon}
                                    onClick={() => {
                                        message.destroy()
                                        onFullScreen()
                                    }}
                                />
                            </Tooltip>
                            <Tooltip title={__('关闭')} placement="bottom">
                                <CloseOutlined
                                    className={styles.closeIcon}
                                    onClick={onClose}
                                />
                            </Tooltip>
                        </Space>
                    </div>
                </div>
                <div
                    className={styles.viewContentWrapper}
                    ref={viewContentRef}
                    hidden={loading}
                >
                    <div className={styles.viewBasicInfoWrapper}>
                        <Space
                            direction="vertical"
                            wrap={false}
                            style={{ width: '100%' }}
                        >
                            <Row gutter={16}>
                                {cardBaiscInfoList?.map((info) => {
                                    const { key } = info
                                    const text = renderParamsInfo(info)
                                    const isDesc = key === 'description'
                                    return (
                                        <Col
                                            span={info.span || 12}
                                            key={info.key}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                marginTop: 10,
                                            }}
                                        >
                                            <span className={styles.label}>
                                                {info?.label}
                                            </span>
                                            <span
                                                className={
                                                    isDesc
                                                        ? styles.desc
                                                        : styles.name
                                                }
                                                title={
                                                    isDesc
                                                        ? basicInfo?.[key]
                                                        : isString(text)
                                                        ? text
                                                        : ''
                                                }
                                            >
                                                {text}
                                            </span>
                                        </Col>
                                    )
                                })}
                            </Row>
                        </Space>
                    </div>
                    <div ref={tabBarRef} className={styles.viewContentTab}>
                        <Tabs
                            activeKey={tabActiveKey}
                            onChange={(e) => setTabActiveKey(e)}
                            getPopupContainer={(node) => node}
                            tabBarGutter={32}
                            items={detailTabItems}
                            tabBarExtraContent={
                                showBackToTop && (
                                    <Button
                                        type="link"
                                        onClick={() => {
                                            const scrollableElement =
                                                viewContentRef?.current
                                            // 设置返回时带动画
                                            const timer = setInterval(() => {
                                                const top =
                                                    scrollableElement?.scrollTop
                                                scrollableElement?.scrollTo(
                                                    0,
                                                    top - top / 5,
                                                )
                                                if (top === 0) {
                                                    clearInterval(timer)
                                                }
                                            }, 30)
                                        }}
                                        className={styles.backToTop}
                                    >
                                        {__('返回顶部')}
                                    </Button>
                                )
                            }
                            destroyInactiveTabPane
                        />
                    </div>

                    <div className={styles.viewContent}>
                        {!!fields?.length || fieldsLoading ? (
                            <div className={styles.sampleDataWrapper}>
                                <div className={styles.fieldsWrapper}>
                                    {fieldsLoading ? (
                                        <div
                                            style={{
                                                margin: '96px 0',
                                            }}
                                        >
                                            <Loader />
                                        </div>
                                    ) : (
                                        renderFields(fields)
                                    )}
                                </div>
                            </div>
                        ) : (
                            fieldsEmpty()
                        )}
                    </div>
                </div>
            </CustomDrawer>
        </div>
    )
}

export default memo(LicenseCard)
