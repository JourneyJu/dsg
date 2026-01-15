import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Col, Divider, Dropdown, Row, Tabs } from 'antd'
import classnames from 'classnames'
import {
    CaretDownOutlined,
    CaretUpOutlined,
    CloseOutlined,
    LeftOutlined,
} from '@ant-design/icons'
import { getActualUrl, useQuery } from '@/utils'
import { formatError, getDataCatalogMount, queryOpenCatlgDetail } from '@/core'
import { DataCatlgOutlined, FontIcon, ModelFilledOutlined } from '@/icons'
import styles from './styles.module.less'
import __ from './locale'
import {
    ICatlgContent,
    IRescCatlg,
    IRescItem,
} from '@/core/apis/dataCatalog/index.d'
import { TabKey } from './helper'
import GlobalMenu from '@/components/GlobalMenu'
import DirColumnInfo from '@/components/ResourcesDir/DirColumnInfo'
import DirBasicInfo from './DirBasicInfo'
import { IconType } from '@/icons/const'
import { Loader } from '@/ui'

interface IContentTabs {
    // 传入的目录部分相关信息（如id,name，其余信息在组件内通过接口获取）
    catlgItem?: {
        // 开放目录id
        id: string
        // 开放目录名称
        name: string
        // 关联数据资源目录id
        // catalog_id?: string
    }
    // 是否时审核代办中打开
    isWorkFlow?: boolean
    onReturn?: () => void
}

// 页面路径中获取参数
const ContentTabs = ({
    catlgItem,
    isWorkFlow = false,
    onReturn,
}: IContentTabs) => {
    const [activeKey, setActiveKey] = useState<TabKey>(TabKey.BASIC)
    const needPagePadding = [TabKey.BASIC, TabKey.COLUMN]

    const [loading, setLoading] = useState(true)
    const [details, setDetails] = useState<any>(catlgItem)

    // 目录内容tab
    const openCatlgDetailTabList = [
        {
            label: __('基本信息'),
            key: TabKey.BASIC,
        },
        {
            label: __('信息项'),
            key: TabKey.COLUMN,
        },
    ]

    const navigator = useNavigate()

    const query = useQuery()
    const [mountResource, setMountResource] = useState<any>()

    const ref = useRef({
        getDirName: () => {},
    })

    // 左侧树选中tab
    const activeTabKey = query.get('activeTabKey')
    // 列表目录id--不能为空
    // 开放目录id、开放目录（也是数据资源目录）名称
    const [id, name] = useMemo(() => {
        const { id: openCatlgId = '', name: catlgName = '' } = catlgItem || {}

        return [openCatlgId, catlgName]
    }, [details])

    useEffect(() => {
        if (id) {
            // 审核中需要获取详情得到数据资源目录id
            getOpenCatlgDetail()
        }
    }, [id])

    const handleReturn = () => {
        const backUrl = query.get('backUrl') || `/openCatalog`

        navigator(backUrl)
    }

    const getOpenCatlgDetail = async () => {
        if (!id) return
        try {
            setLoading(true)
            const res = await queryOpenCatlgDetail(id)
            setDetails(res)
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className={classnames(
                styles.openCatlgDetailWrapper,
                isWorkFlow ? styles.detailWFWrapper : undefined,
            )}
        >
            <div className={styles.dirContent}>
                <div className={styles.top}>
                    <Row
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <Col span={6}>
                            {isWorkFlow ? (
                                <div className={styles.drawerHeader}>
                                    <FontIcon
                                        name="icon-shujumuluguanli1"
                                        type={IconType.COLOREDICON}
                                        style={{ fontSize: '20px' }}
                                    />
                                    <div className={styles.drawerTitle}>
                                        {__('开放目录详情')}
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.leftContent}>
                                    <GlobalMenu />
                                    <div
                                        onClick={() => {
                                            if (onReturn) {
                                                onReturn()
                                            } else {
                                                handleReturn()
                                            }
                                        }}
                                        className={styles.returnInfo}
                                    >
                                        <LeftOutlined
                                            className={styles.returnArrow}
                                        />
                                        <span className={styles.returnText}>
                                            返回
                                        </span>
                                    </div>
                                    <Divider
                                        className={styles.divider}
                                        type="vertical"
                                    />
                                    {/* <div className={styles.modelIconWrapper}>
                                    <DataCatlgOutlined
                                        className={styles.modelIcon}
                                    />
                                </div> */}
                                    <div
                                        title={name}
                                        className={styles.businessName}
                                    >
                                        {name}
                                    </div>
                                </div>
                            )}
                        </Col>
                        <Col span={12}>
                            <div className={styles.tabs}>
                                <Tabs
                                    activeKey={activeKey}
                                    onChange={(e) => {
                                        setActiveKey(e as TabKey)
                                    }}
                                    getPopupContainer={(node) => node}
                                    tabBarGutter={32}
                                    items={openCatlgDetailTabList}
                                    destroyInactiveTabPane
                                />
                            </div>
                        </Col>
                        <Col span={6}>
                            {isWorkFlow && (
                                <div className={styles.drawerClose}>
                                    <CloseOutlined
                                        style={{
                                            fontSize: '16px',
                                            color: 'rgba(0, 0, 0, 0.4)',
                                        }}
                                        onClick={() => {
                                            onReturn?.()
                                        }}
                                    />
                                </div>
                            )}
                        </Col>
                    </Row>
                </div>
                <div
                    className={classnames(
                        styles.bottom,
                        needPagePadding.includes(activeKey)
                            ? styles.needPadding
                            : '',
                    )}
                >
                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            {activeKey === TabKey.BASIC && (
                                <DirBasicInfo
                                    id={id}
                                    catalogId={details?.catalog_id}
                                    details={details}
                                />
                            )}

                            {activeKey === TabKey.COLUMN && (
                                <DirColumnInfo
                                    catalogId={details?.catalog_id}
                                    showTitle
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ContentTabs
