import { memo, useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'ahooks'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { Space, Row, Col, Tabs, Tooltip } from 'antd'
import { isString, isEmpty } from 'lodash'
import classnames from 'classnames'
import CustomDrawer from '@/components/CustomDrawer'
import { CloseOutlined, FullScreenOutlined } from '@/icons'
import styles from './styles.module.less'
import __ from './locale'
import { Expand, Loader, Empty } from '@/ui'
import {
    IPrvcDataCatlgApi,
    IPrvcDataCatlgDB,
    IPrvcDataCatlgDetail,
    IPrvcDataCatlgFile,
    PrvcCatlgRescType,
    formatError,
    getPrvcDataCatlgDBById,
    getPrvcDataCatlgDetailById,
    getPrvcDataCatlgFileById,
    getPrvcDataCatlgInfoItemById,
    getPrvcDataCatlgInterfaceById,
} from '@/core'

import dataEmpty from '@/assets/dataEmpty.svg'
import { getFieldTypeIcon } from '@/components/DatasheetView/helper'
import {
    PrvcCatlgDetailTabKey,
    viewCardBaiscInfoList,
    cardRescInfo,
    PrvcCatlgRescTypeList,
} from './helper'

interface TitleBarType {
    title: string
}

interface IProvinceCatlgCard {
    open?: boolean
    id: string
    // icon?: ReactNode
    // allowDownload?: boolean
    cardProps?: Record<string, any>
    // operate: OperateType
    onFullScreen: (tabActiveKey?: any) => void
    onClose: (flag?: boolean) => void
    onSure: () => void
    // onDownload?: () => void
    // handleAssetBtnUpdate?: (type: BusinObjOpr, item: any, newItem?: any) => void
    errorCallback?: (error?: any) => void
    // allowChat?: boolean // 问答
    // inAssetPanorama?: boolean // 在资产全景中
}

const ProvinceCatlgCard = ({
    open,
    id,
    cardProps,
    onFullScreen,
    onClose,
    onSure,
}: IProvinceCatlgCard) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [tabContentLoading, setTabContentLoading] = useState<boolean>(false)

    // 样例数据加载
    const [sampleDataLoading, setSampleDataLoading] = useState<boolean>(false)

    const [tabActiveKey, setTabActiveKey] = useState<string>(
        PrvcCatlgDetailTabKey.ITEMS,
    )

    // 目录详情
    const [detail, setDetail] = useState<IPrvcDataCatlgDetail>({})
    // 关联库表信息
    const [dbResc, setDbResc] = useState<IPrvcDataCatlgDB>({})
    // 关联接口信息
    const [apiResc, setApiResc] = useState<IPrvcDataCatlgApi>({})
    // 关联文件信息
    const [fileResc, setFileResc] = useState<IPrvcDataCatlgFile>({})

    // 关联信息项
    const [infoItems, setInfoItems] = useState<any>({})

    const detailTabItems = useMemo(() => {
        const tabItems: Array<any> = []

        if (infoItems?.total_count) {
            tabItems.push({
                label: __('信息项：${count}', {
                    count: infoItems?.total_count || 0,
                }),
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

        if (!infoItems?.total_count) {
            setTabActiveKey(rescItems?.[0]?.key || '')
        }

        // 仅在规定模块下显示权限Tab
        return [...tabItems, ...rescItems]
    }, [detail, infoItems])

    const allRescInfo = useMemo(() => {
        return {
            [PrvcCatlgRescType.API]: apiResc,
            [PrvcCatlgRescType.DB]: dbResc,
            [PrvcCatlgRescType.File]: fileResc,
        }
    }, [dbResc, apiResc, fileResc])

    useEffect(() => {
        if (open) {
            getDataCatlgCommonInfo(id)
            setTabActiveKey(PrvcCatlgDetailTabKey.ITEMS)
        }
    }, [id, open])

    const getDataCatlgCommonInfo = async (cId?: string, isUpdate?: boolean) => {
        if (!cId) return
        try {
            setLoading(true)

            const catlgDetail = await getPrvcDataCatlgDetailById(cId)
            const catlgInfoItems = await getPrvcDataCatlgInfoItemById(id)

            setDetail(catlgDetail)
            setInfoItems(catlgInfoItems)
        } catch (error) {
            formatError(error)
            onClose()
        } finally {
            setLoading(false)
        }
    }

    useUpdateEffect(() => {
        getTabItemInfo()
    }, [tabActiveKey])

    const getTabItemInfo = async () => {
        try {
            setTabContentLoading(true)
            let res: any
            let rescId = ''
            switch (tabActiveKey) {
                case PrvcCatlgDetailTabKey.DBRESC:
                    rescId = detail?.resource_groups?.view?.[0]?.resource_id
                    res = rescId ? await getPrvcDataCatlgDBById(rescId) : {}
                    setDbResc(res)
                    break
                case PrvcCatlgDetailTabKey.APIRESC:
                    rescId = detail?.resource_groups?.api?.[0]?.resource_id
                    res = rescId
                        ? await getPrvcDataCatlgInterfaceById(rescId)
                        : {}
                    setApiResc(res)
                    break
                case PrvcCatlgDetailTabKey.FILERESC:
                    rescId = detail?.resource_groups?.file?.[0]?.resource_id
                    res = rescId ? await getPrvcDataCatlgFileById(rescId) : {}
                    setFileResc(res)
                    break
                default:
                    break
            }
        } catch (err) {
            formatError(err)
        } finally {
            setTabContentLoading(false)
        }
    }

    const empty = (desc: string) => {
        return <Empty iconSrc={dataEmpty} desc={desc} />
    }

    const renderParamsInfo = (info: any) => {
        const { key } = info
        const val = detail?.[key]
        if (key === 'resource_groups') {
            const rescLabelList =
                Object.keys(val || {})?.map(
                    (rKey) => PrvcCatlgRescTypeList[rKey],
                ) || []
            return rescLabelList.join('、')
        }
        if (key === 'description') {
            return (
                <Expand
                    content={val || '--'}
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

        return val || '--'
    }

    return (
        <div className={styles.provinceCatlgCardWrapper}>
            <CustomDrawer
                open={open}
                destroyOnClose
                loading={loading || sampleDataLoading}
                onCancel={onClose}
                onClose={() => onClose()}
                handleOk={onSure}
                isShowHeader={false}
                isShowFooter={false}
                customBodyStyle={{
                    flexDirection: 'column',
                    height: '100%',
                }}
                // className={bodyClassName}
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
                {loading ? (
                    <Loader />
                ) : (
                    <>
                        <div className={styles.viewHeaderWrapper}>
                            <div
                                className={styles.viewTitle}
                                title={detail?.title || '--'}
                            >
                                {/* {icon} */}
                                {detail?.title || '--'}
                            </div>
                            <Space size={4} className={styles.headerBtnWrapper}>
                                <Tooltip
                                    title={__('进入全屏')}
                                    placement="bottom"
                                >
                                    <FullScreenOutlined
                                        className={styles.fullScreenIcon}
                                        onClick={() => onFullScreen()}
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
                        <div className={styles.viewContentWrapper}>
                            <div className={styles.viewBasicInfoWrapper}>
                                <Space
                                    direction="vertical"
                                    wrap={false}
                                    style={{ width: '100%' }}
                                >
                                    <Row gutter={16}>
                                        {viewCardBaiscInfoList?.map((info) => {
                                            const { key } = info
                                            const text = renderParamsInfo(info)
                                            const isDesc = key === 'description'
                                            return (
                                                <Col
                                                    span={info.span || 12}
                                                    key={info.key}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems:
                                                            'flex-start',
                                                        marginTop: 10,
                                                    }}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
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
                                                                ? detail?.[key]
                                                                : isString(text)
                                                                ? text
                                                                : ''
                                                        }
                                                    >
                                                        {isDesc ? (
                                                            <Expand
                                                                content={
                                                                    text || '--'
                                                                }
                                                                expandTips={
                                                                    <span
                                                                        className={
                                                                            styles.expBtn
                                                                        }
                                                                    >
                                                                        {__(
                                                                            '展开',
                                                                        )}
                                                                        <DownOutlined
                                                                            className={
                                                                                styles.expIcon
                                                                            }
                                                                        />
                                                                    </span>
                                                                }
                                                                collapseTips={
                                                                    <span
                                                                        className={
                                                                            styles.expBtn
                                                                        }
                                                                    >
                                                                        {__(
                                                                            '收起',
                                                                        )}
                                                                        <UpOutlined
                                                                            className={
                                                                                styles.expIcon
                                                                            }
                                                                        />
                                                                    </span>
                                                                }
                                                            />
                                                        ) : (
                                                            text
                                                        )}
                                                    </span>
                                                </Col>
                                            )
                                        })}
                                    </Row>
                                </Space>
                            </div>
                            <Tabs
                                activeKey={tabActiveKey}
                                onChange={(e) => setTabActiveKey(e)}
                                getPopupContainer={(node) => node}
                                tabBarGutter={32}
                                items={detailTabItems}
                                className={styles.viewContentTab}
                                destroyInactiveTabPane
                            />
                            {tabContentLoading ? (
                                <Loader />
                            ) : (
                                <>
                                    {tabActiveKey ===
                                        PrvcCatlgDetailTabKey.ITEMS &&
                                        (infoItems?.entries?.length ? (
                                            <div
                                                className={styles.fieldsWrapper}
                                            >
                                                {infoItems?.entries?.map(
                                                    (fItem) => {
                                                        return (
                                                            <div
                                                                key={fItem.id}
                                                                className={
                                                                    styles.fieldItemWrapper
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        styles.fieldsHeader
                                                                    }
                                                                >
                                                                    {getFieldTypeIcon(
                                                                        {
                                                                            type: fItem.data_format,
                                                                        },
                                                                    )}
                                                                    <div
                                                                        className={
                                                                            styles.fieldTitle
                                                                        }
                                                                        title={
                                                                            fItem.column_name_cn ||
                                                                            '--'
                                                                        }
                                                                    >
                                                                        {fItem.column_name_cn ||
                                                                            '--'}
                                                                    </div>
                                                                    {fItem.primary_key && (
                                                                        <div
                                                                            className={
                                                                                styles.primaryKey
                                                                            }
                                                                        >
                                                                            唯一标识
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div
                                                                    className={
                                                                        styles.desc
                                                                    }
                                                                    title={
                                                                        fItem.column_name_en ||
                                                                        '--'
                                                                    }
                                                                >
                                                                    {fItem.column_name_en ||
                                                                        '--'}
                                                                </div>
                                                            </div>
                                                        )
                                                    },
                                                )}
                                            </div>
                                        ) : (
                                            empty(__('暂无数据'))
                                        ))}
                                    {[
                                        PrvcCatlgDetailTabKey.DBRESC,
                                        PrvcCatlgDetailTabKey.APIRESC,
                                        PrvcCatlgDetailTabKey.FILERESC,
                                    ].includes(
                                        tabActiveKey as PrvcCatlgDetailTabKey,
                                    ) && (
                                        <div
                                            className={
                                                styles.cardRescInfoWrapper
                                            }
                                        >
                                            <Space
                                                direction="vertical"
                                                wrap={false}
                                                style={{ width: '100%' }}
                                            >
                                                <Row gutter={16}>
                                                    {cardRescInfo?.[
                                                        tabActiveKey
                                                    ]?.map((info: any) => {
                                                        const {
                                                            label,
                                                            key,
                                                            span = 24,
                                                        } = info
                                                        const rescId =
                                                            allRescInfo?.[
                                                                tabActiveKey
                                                            ]?.resource_id
                                                        const curRescInfo =
                                                            allRescInfo?.[
                                                                tabActiveKey
                                                            ]
                                                        const text =
                                                            curRescInfo?.[
                                                                key
                                                            ] || '--'
                                                        const isLink =
                                                            key ===
                                                            'resource_name'
                                                        return (
                                                            <Col
                                                                span={
                                                                    span || 12
                                                                }
                                                                key={info.key}
                                                                style={{
                                                                    display:
                                                                        'flex',
                                                                    alignItems:
                                                                        'flex-start',
                                                                    marginTop: 10,
                                                                }}
                                                            >
                                                                <span
                                                                    className={
                                                                        styles.label
                                                                    }
                                                                >
                                                                    {label}
                                                                </span>
                                                                <span
                                                                    className={classnames(
                                                                        styles.name,
                                                                        isLink &&
                                                                            styles.isLink,
                                                                    )}
                                                                    title={text}
                                                                    onClick={() => {
                                                                        if (
                                                                            isLink
                                                                        ) {
                                                                            onFullScreen(
                                                                                tabActiveKey,
                                                                            )
                                                                        }
                                                                    }}
                                                                >
                                                                    {text}
                                                                </span>
                                                            </Col>
                                                        )
                                                    })}
                                                </Row>
                                            </Space>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </CustomDrawer>
        </div>
    )
}

export default memo(ProvinceCatlgCard)
