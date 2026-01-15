import { Anchor, Drawer, Tabs } from 'antd'
import { FC, useRef, useState } from 'react'
import { find } from 'lodash'
import moment from 'moment'
import DrawerHeader from '../CitySharing/component/DrawerHeader'
import styles from './styles.module.less'
import __ from './locale'
import { MoreInfo } from './MoreInfo'
import { InfoApplicationViewCardOutlined } from '@/icons'
import { IconType } from '@/icons/const'
import {
    ApplicationResourceTable,
    ResourceType,
} from './ApplicationResourceTable'
import CatalogCard from '../DataAssetsCatlg/CatalogCard'
import { DataCatlgTabKey } from '../DataAssetsCatlg/helper'
import DataCatlgContent from '../DataAssetsCatlg/DataCatlgContent'
import { IDataRescItem } from '@/core'
import InfoCatlgCard from '../DataAssetsCatlg/InfoResourcesCatlg/InfoCatlgCard'
import InfoCatlgDetails from '../DataAssetsCatlg/InfoResourcesCatlg/InfoCatlgDetails'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import ApplicationServiceDetail from '../DataAssetsCatlg/ApplicationServiceDetail'
import InterfaceCard from '../DataAssetsCatlg/ApplicationServiceDetail/InterfaceCard'

interface IApplicationOverviewDetailDrawer {
    open: boolean
    onClose?: () => void
    // 是否全屏 默认全屏
    fullScreen?: boolean
    // 是否是弹窗 默认 false
    // 目录信息，创建时需要的数据
    dataResource?: any
}
export const ApplicationOverviewDetailDrawer: FC<
    IApplicationOverviewDetailDrawer
> = ({ open, onClose, fullScreen = true, dataResource }) => {
    const { Link } = Anchor
    const [cardOpen, setCardOpen] = useState(false)
    const [detailItem, setDetailItem] = useState<any>(null)
    // 详情页抽屉的显示/隐藏
    const [detailOpen, setDetailOpen] = useState(false)
    // card中点击某tabkey下关联资源，详情默认展示tabkey下内容
    const [linkDetailTabKey, setLinkDetailTabKey] = useState<any>()
    const [selectResourceKey, setResourceKey] = useState(null)
    const dataRef = useRef<any>()
    const infoRef = useRef<any>()
    const apiRef = useRef<any>()
    const [userId] = useCurrentUser('ID')

    const [infoCardOpen, setInfoCardOpen] = useState(false)
    const [detailInfoOpen, setDetailInfoOpen] = useState(false)
    const [interfaceDetailOpen, setInterfaceDetailOpen] = useState(false)
    const [interfaceCardOpen, setInterfaceCardOpen] = useState(false)
    const container = useRef<any>(null)
    const handleCardOpen = (items, resouceType) => {
        setDetailItem(items)

        setResourceKey(resouceType)
        switch (resouceType) {
            case ResourceType.Data:
                setCardOpen(true)
                setInfoCardOpen(false)
                setInterfaceCardOpen(false)
                break
            case ResourceType.Info:
                setCardOpen(false)
                setInfoCardOpen(true)
                setInterfaceCardOpen(false)
                break
            case ResourceType.Api:
                setCardOpen(false)
                setInfoCardOpen(false)
                setInterfaceCardOpen(true)
                break
            default:
                break
        }
    }

    const updateInfo: (id: string, item?: any) => void = async (id, item) => {
        let newItem
        if (selectResourceKey === ResourceType.Data && dataRef.current) {
            newItem = await dataRef.current?.refresh?.(id)
        } else if (selectResourceKey === ResourceType.Info && infoRef.current) {
            newItem = await infoRef.current?.refresh?.(id, item)
        } else if (selectResourceKey === ResourceType.Api && apiRef.current) {
            newItem = await infoRef.current?.refresh?.(id)
        }

        if (newItem) {
            setDetailItem(newItem)
        } else {
            setDetailItem(null)
            setDetailOpen(false)
            setCardOpen(false)
            setResourceKey(null)
        }
    }

    // 更新列表项收藏状态
    const updateFavoriteInfo = ({ res, item }: { res: any; item?: any }) => {
        if (detailItem?.id === item.id) {
            const newItem = {
                ...detailItem,
                is_favored: res?.is_favored,
                favor_id: res?.favor_id,
            } as any
            updateInfo(detailItem?.id, newItem)
        }
    }
    return (
        <>
            <Drawer
                open={open}
                width={fullScreen ? '100%' : '80%'}
                placement="right"
                closable={false}
                bodyStyle={{
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: fullScreen ? 1080 : 0,
                }}
                contentWrapperStyle={{ minWidth: 800 }}
                destroyOnClose
                maskClosable={false}
                mask={false}
                push={{ distance: 0 }}
                style={{
                    position: 'fixed',
                    width: '100vw',
                    height: '100vh',
                    top: '51px',
                    borderTop: '1px solid rgb(0 0 0 / 10%)',
                    color: '#123456',
                }}
            >
                <div className={styles.detailContainer}>
                    {/* 导航头部 */}
                    <DrawerHeader
                        title=""
                        fullScreen={fullScreen}
                        onClose={onClose}
                    />
                    <div className={styles.contentBox}>
                        <div className={styles.content}>
                            <div className={styles.contentleftWrapper}>
                                <div
                                    className={styles.contentTableWrap}
                                    ref={container}
                                >
                                    <div className={styles.contentTableLeft}>
                                        <div className={styles.contentTop}>
                                            <div
                                                className={
                                                    styles.contentTopTitle
                                                }
                                            >
                                                <InfoApplicationViewCardOutlined
                                                    className={styles.itemIcon}
                                                />
                                                <div
                                                    className={styles.itemTitle}
                                                    title={dataResource?.name}
                                                    dangerouslySetInnerHTML={{
                                                        __html: dataResource?.name,
                                                    }}
                                                />
                                            </div>
                                            <div className={styles.itemDesc}>
                                                <span
                                                    style={{
                                                        color: 'rgba(0, 0, 0, 0.65)',
                                                    }}
                                                >
                                                    {__('描述')}：
                                                </span>
                                                <span
                                                    className={styles.text}
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            dataResource?.description ||
                                                            '--',
                                                    }}
                                                    title={
                                                        dataResource.description
                                                    }
                                                />
                                            </div>
                                            <MoreInfo
                                                className={
                                                    styles.contentTopMoreInfo
                                                }
                                                infoData={[
                                                    {
                                                        infoKey: 'updated_at',
                                                        content:
                                                            dataResource?.updated_at
                                                                ? moment(
                                                                      dataResource?.updated_at,
                                                                  ).format(
                                                                      'YYYY-MM-DD HH:mm:ss',
                                                                  )
                                                                : '--',
                                                    },
                                                    {
                                                        infoKey:
                                                            'department_name',
                                                        content:
                                                            dataResource?.department_path ||
                                                            '--',
                                                    },
                                                ]}
                                            />
                                        </div>
                                        <div id="application-overview-data">
                                            <ApplicationResourceTable
                                                ref={dataRef}
                                                id={dataResource?.id}
                                                resourceType={ResourceType.Data}
                                                setDetailItem={handleCardOpen}
                                            />
                                        </div>
                                        <div id="application-overview-info">
                                            <ApplicationResourceTable
                                                ref={infoRef}
                                                id={dataResource?.id}
                                                resourceType={ResourceType.Info}
                                                setDetailItem={handleCardOpen}
                                            />
                                        </div>
                                        <div id="application-overview-api">
                                            <ApplicationResourceTable
                                                ref={apiRef}
                                                id={dataResource?.id}
                                                resourceType={ResourceType.Api}
                                                setDetailItem={handleCardOpen}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.contentTableRight}>
                                        <Anchor
                                            onClick={(e: any) =>
                                                e.preventDefault()
                                            }
                                            getContainer={() =>
                                                container.current as HTMLElement
                                            }
                                            className={styles.anchorWrapper}
                                            targetOffset={148}
                                            offsetTop={122}
                                        >
                                            <Link
                                                href="#application-overview-data"
                                                title={__('数据资源目录')}
                                            />
                                            <Link
                                                href="#application-overview-info"
                                                title={__('信息资源目录')}
                                            />
                                            <Link
                                                href="#application-overview-api"
                                                title={__('接口服务')}
                                            />
                                        </Anchor>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={styles.contentrightWrapper}
                                hidden={
                                    !cardOpen &&
                                    !infoCardOpen &&
                                    !interfaceCardOpen
                                }
                            >
                                {cardOpen && (
                                    <CatalogCard
                                        catalogId={detailItem?.id}
                                        info={detailItem}
                                        open={cardOpen}
                                        style={{
                                            position: 'relative',
                                            right: '0px',
                                            height: '100%',
                                            zIndex: '999',
                                            width: '100%',
                                        }}
                                        onClose={() => {
                                            setCardOpen(false)
                                        }}
                                        toOpenDetails={(
                                            tabKey?: DataCatlgTabKey,
                                        ) => {
                                            setDetailOpen(true)
                                            setLinkDetailTabKey(tabKey)
                                        }}
                                        onAddFavorite={(res) =>
                                            updateInfo(detailItem.id)
                                        }
                                        onCancelFavorite={(res) =>
                                            updateInfo(detailItem.id)
                                        }
                                    />
                                )}
                                {infoCardOpen && (
                                    <InfoCatlgCard
                                        style={{ marginTop: '76px' }}
                                        catalogId={detailItem?.id}
                                        info={detailItem}
                                        open={infoCardOpen}
                                        onClose={() => {
                                            setInfoCardOpen(false)
                                        }}
                                        toOpenDetails={() => {
                                            setDetailInfoOpen(true)
                                        }}
                                        onAddFavorite={(res) =>
                                            updateFavoriteInfo({
                                                res,
                                                item: detailItem,
                                            })
                                        }
                                        onCancelFavorite={(res) =>
                                            updateFavoriteInfo({
                                                res,
                                                item: detailItem,
                                            })
                                        }
                                    />
                                )}
                                {interfaceCardOpen && (
                                    <InterfaceCard
                                        open={interfaceCardOpen}
                                        onClose={() => {
                                            setInterfaceCardOpen(false)
                                        }}
                                        onSure={() => {}}
                                        interfaceId={detailItem?.id}
                                        allowInvoke={detailItem?.has_permission}
                                        onFullScreen={() => {
                                            setInterfaceDetailOpen(true)
                                        }}
                                        allowChat={
                                            (detailItem?.actions?.includes(
                                                'read',
                                            ) ||
                                                detailItem?.owner_id ===
                                                    userId) &&
                                            detailItem?.is_online
                                        }
                                        cardProps={{
                                            zIndex: 999,
                                        }}
                                        showOwner={false}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Drawer>

            {detailOpen && (
                <DataCatlgContent
                    open={detailOpen}
                    onClose={(dataCatlgCommonInfo) => {
                        setDetailOpen(false)
                    }}
                    assetsId={detailItem?.id}
                    tabKey={linkDetailTabKey}
                    style={{
                        position: 'fixed',
                        width: '100vw',
                        height: '100vh',
                        top: '52px',
                        zIndex: 1001,
                    }}
                />
            )}

            {detailInfoOpen && (
                <InfoCatlgDetails
                    style={{
                        zIndex: 1001,
                        position: 'fixed',
                        top: '52px',
                        borderTop: '1px solid rgb(0 0 0 / 10%)',
                    }}
                    open={detailInfoOpen}
                    onClose={() => {
                        setDetailInfoOpen(false)
                    }}
                    catalogId={detailItem?.id || ''}
                    name={detailItem?.raw_name || ''}
                    onFavoriteChange={(res) =>
                        updateFavoriteInfo({ res, item: detailItem })
                    }
                />
            )}
            {interfaceDetailOpen && (
                <ApplicationServiceDetail
                    open={interfaceDetailOpen}
                    onClose={() => {
                        setInterfaceDetailOpen(false)
                    }}
                    hasPermission={detailItem?.has_permission}
                    serviceCode={detailItem?.id}
                    style={{
                        zIndex: 1001,
                        position: 'fixed',
                        top: '52px',
                        borderTop: '1px solid rgb(0 0 0 / 10%)',
                    }}
                />
            )}
        </>
    )
}
