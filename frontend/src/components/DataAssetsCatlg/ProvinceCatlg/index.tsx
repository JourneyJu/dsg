import React, { forwardRef, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretLeftOutlined } from '@ant-design/icons'
import { Divider, List, Tooltip, Col, Row, BackTop } from 'antd'
import classnames from 'classnames'
import { isEqual, isNumber, toNumber, trim } from 'lodash'

import moment from 'moment'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useUpdateEffect } from 'ahooks'
import styles from './styles.module.less'
import __ from '../locale'
import { getPlatformNumber, useQuery } from '@/utils'
import { goBackTop, itemOtherInfo } from '../helper'
import {
    formatError,
    getSSZDCatalog,
    IGetSSZDCatalogParams,
    LoginPlatform,
} from '@/core'
import Empty from '@/ui/Empty'
import dataEmpty from '@/assets/dataEmpty.svg'
import Loader from '@/ui/Loader'
import FilterConditionLayout from '../FilterConditionLayout'

import { FontIcon, ReturnTopOutlined } from '@/icons'
import { CogAParamsType } from '@/context'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import DataRescItem from '../DataResc/DataRescItem'
import { DataRescType } from '../ApplicationService/helper'
import { SearchInput } from '@/ui'
import DragBox from '@/components/DragBox'
import ProvinceCatlgCard from './ProvinceCatlgCard'
import ProvinceCatlgContent from './ProvinceCatlgContent'
import { provinceCatlgFilterInit, provinceCatlgFilterConfig } from './helper'
import ProvinceOrganTree from '@/components/ProvincialOriganizationalStructure/ProvinceOrganTree'

interface IProvinceCatlgProps {
    ref?: any
    searchKey: string
    isIntroduced?: boolean
    // 是否目录同步中-true为正在同步
    isSynchzing?: boolean
    // 该同步类型上次同步时间戳（ms），从未同步过返回0
    lastUpdTime?: number
    // 目录同步参数加载中
    isSynchzingLoading?: boolean
}

// 默认加载条数
const defaultListSize = 20
const scrollListId = 'scrollableDiv'

const ProvinceCatlg: React.FC<IProvinceCatlgProps> = forwardRef(
    (props: any, ref) => {
        const {
            searchKey,
            isIntroduced,
            isSynchzing = false,
            lastUpdTime,
            isSynchzingLoading = false,
        } = props
        const query = useQuery()
        const navigator = useNavigate()
        const platform = getPlatformNumber()
        const [userId] = useCurrentUser('ID')

        // // 是否同步中
        // const [isSynchzing, setIsSynchzing] = useState(true)
        const [expand, setExpand] = useState<boolean>(true)

        // 页面loading
        // const [isSynchzingLoading, setIsSynchzingLoading] = useState(true)
        // 右侧列表页loading
        const [listDataLoading, setListDataLoading] = useState(true)

        const [selectedNode, setSelectedNode] = useState<any>({})

        // 业务逻辑实体列表
        const [listData, setListData] = useState<Array<any>>([])

        // 左侧视角-树结构搜索条件
        const [filterTreeCondition, setfilterTreeConditoin] = useState<any>({})

        // 右侧列表搜索条件
        const [filterListCondition, setFilterListCondition] =
            useState<IGetSSZDCatalogParams>()

        const [searchKeyword, setSearchKeyword] = useState<string>(
            searchKey || '',
        )

        // 数据总条数
        const [totalCount, setTotalCount] = useState<number>(0)
        const [isSearch, setIsSearch] = useState<boolean>(false)

        // useCogAsstContext 已移除，相关功能已下线

        const [defaultSize, setDefaultSize] = useState<Array<number>>(
            JSON.parse(localStorage.getItem('marketConSize') || '[60, 40]'),
        )
        const [isDragging, setIsDragging] = useState(false)

        // 目录详情
        const [pCatlgDetailOpen, setPCatlgDetailOpen] = useState<boolean>(false)
        // card中点击某tabkey下关联资源，详情默认展示tabkey下内容
        const [linkDetailTabKey, setLinkDetailTabKey] = useState<any>()
        // 目录卡片详情
        const [pCatlgCardOpen, setPCatlgCardOpen] = useState<boolean>(false)
        // 当前列表选中资源项
        const [selectedResc, setSelectedResc] = useState<any>()
        // 被点击名称资源项
        const [curDetailResc, setCurDetailResc] = useState<any>()

        // useImperativeHandle(ref, () => ({
        //     isSynchzing,
        //     isSynchzingLoading,
        // }))

        useUpdateEffect(() => {
            loadEntityList({ ...filterListCondition, offset: 1 }, searchKeyword)
        }, [searchKeyword])

        useEffect(() => {
            setSelectedNode({})
        }, [])

        useEffect(() => {
            setSearchKeyword('')
            setFilterListCondition(provinceCatlgFilterInit)
        }, [])

        const isListSearchingByKeyword = useMemo(() => {
            return !!searchKeyword
        }, [searchKeyword])

        useUpdateEffect(() => {
            setPCatlgCardOpen(false)
            setPCatlgDetailOpen(false)
            setCurDetailResc(undefined)
            setSelectedResc(undefined)
        }, [filterListCondition])

        useEffect(() => {
            if (!selectedNode?.code) return
            loadEntityList(
                {
                    ...filterListCondition,
                    org_code: selectedNode?.code,
                },
                searchKeyword,
            )
        }, [selectedNode])

        // 获取业务逻辑实体列表
        const loadEntityList = async (
            params: any,
            keyword: string,
            loadMore?: boolean,
        ) => {
            try {
                // 只有加载更多（加载下一页）的时候才传next_flag
                if (!loadMore) {
                    setListDataLoading(true)
                }

                const res = await getSSZDCatalog({
                    ...params,
                    keyword,
                })

                const newData = res.entries?.map((item) => {
                    const {
                        title: name,
                        org_path,
                        abstract: description,
                        resource_groups,
                        info_items,
                    } = item

                    const relateRescType = Object.keys(resource_groups).filter(
                        (key) => resource_groups?.[key]?.length,
                    )

                    return {
                        ...item,
                        name,
                        raw_name: name,
                        department_name: org_path,
                        department_path: org_path,
                        description,
                        type: DataRescType.PROVINCE_DATACATLG,
                        fieldKeys: {
                            nameCn: 'column_name_cn',
                            rawNameCn: 'column_name_cn',
                            nameEn: 'column_name_en',
                            rawNameEn: 'column_name_en',
                        },
                        fields: info_items,
                        relateRescType,
                    }
                })
                if (!loadMore) {
                    setListData(newData || [])
                } else {
                    const listDataTemp = listData || []
                    setListData(listDataTemp?.concat(newData || []))
                }
                setTotalCount(res.total_count)

                if (!isEqual(filterListCondition, params)) {
                    setFilterListCondition(params)
                }
            } catch (error) {
                formatError(error)
            } finally {
                if (!loadMore) {
                    setListDataLoading(false)
                }
            }
        }

        const handleSearchPressEnter = (val?: any) => {
            const value = trim(val)
            setSearchKeyword(value)
            // dataRef?.current?.updFilterCondition(value)
            goBackTop(scrollListId)
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
                    className={styles.toolTip}
                    getPopupContainer={(n) => n}
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

        // render AI/实体列表项-信息展示
        const renderOtherInfo = (item: any, data: any) => {
            const { infoKey, type, title, toolTipTitle } = item
            let showContent = data[infoKey]
            if (infoKey === 'published_at') {
                showContent = `${moment(showContent).format('YYYY-MM-DD')}`
                return (
                    <>
                        <div
                            style={{
                                flexShrink: 0,
                            }}
                            key={infoKey}
                        >
                            {`${__('上线于')} ${showContent}`}
                        </div>
                        {showDivder()}
                    </>
                )
            }

            return showToolTip(title, toolTipTitle, showContent)
        }

        const handleItemClick = (item) => {
            setLinkDetailTabKey(undefined)
            setSelectedResc(item)
            if (!pCatlgCardOpen) {
                setPCatlgCardOpen(true)
            }
        }

        const handleItemNameClick = (e: any, item: any) => {
            e.preventDefault()
            e.stopPropagation()

            setLinkDetailTabKey(undefined)
            setCurDetailResc(item)
            setPCatlgDetailOpen(true)
        }

        const renderListItem = (item) => {
            const originListItem = (
                <List.Item
                    key={item.id}
                    className={styles.itemLi}
                    onClick={() => {
                        handleItemClick(item)
                    }}
                >
                    <div className={styles.itemTop}>
                        <div
                            className={styles.itemTitle}
                            title={item.raw_title}
                            dangerouslySetInnerHTML={{
                                __html: item.title,
                            }}
                        />

                        {/* {(item.owner_id === userId ||
                            item.actions?.includes('read')) && (
                            <Tooltip
                                placement="bottomRight"
                                arrowPointAtCenter
                                title={chatTip()}
                                getPopupContainer={(n) => n}
                            >
                                <FontIcon
                                    name="icon-yinyong1"
                                    className={styles.itemOprIcon}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (!llm) return
                                        updateParams(CogAParamsType.Resource, {
                                            data: [
                                                {
                                                    id: item.id,
                                                    name: item.raw_title,
                                                    type: 'data_catalog',
                                                },
                                            ],
                                            op: 'add',
                                            event: e,
                                        })
                                        onOpenAssistant()
                                    }}
                                />
                            </Tooltip>
                        )} */}
                    </div>

                    <div
                        className={classnames(
                            styles.itemDesc,
                            !item.description && styles.noDesc,
                        )}
                        dangerouslySetInnerHTML={{
                            __html: item.description || __('[暂无描述]'),
                        }}
                    />
                    <div className={styles.itemOtherInfo}>
                        {itemOtherInfo.map((oItem) => {
                            return renderOtherInfo(oItem, item)
                        })}
                    </div>
                </List.Item>
            )

            // return originListItem

            return (
                <DataRescItem
                    item={item}
                    fieldKeys={{
                        nameCn: 'column_name_cn',
                        rawNameCn: 'column_name_cn',
                        nameEn: 'column_name_en',
                        rawNameEn: 'column_name_en',
                    }}
                    isSearchingByKeyword={isListSearchingByKeyword}
                    selectedResc={selectedResc}
                    onNameClick={(e) => handleItemNameClick(e, item)}
                    onItemClick={(e) => handleItemClick(item)}
                    inProvinceDataCatlg
                />
            )
        }

        const renderListContent = () => {
            return (
                <div className={styles.leftWrapper}>
                    <div className={styles.topConWrapper}>
                        <div className={styles.total}>
                            {__('共')}
                            <span
                                className={styles.totalText}
                            >{` ${totalCount} `}</span>
                            {__('条结果')}
                        </div>
                        <div className={styles.updInfo}>
                            {toNumber(lastUpdTime) > 0 &&
                                __('最新同步时间：${text}', {
                                    text: moment(lastUpdTime).format(
                                        'YYYY-MM-DD hh:mm:ss',
                                    ),
                                })}
                        </div>
                    </div>

                    {!listData?.length ? (
                        <div
                            className={styles.listEmpty}
                            // hidden={(listData?.length || 0) > 0}
                        >
                            {searchKeyword || isSearch ? (
                                <Empty />
                            ) : (
                                <Empty
                                    iconSrc={dataEmpty}
                                    desc={__('暂无数据')}
                                />
                            )}
                        </div>
                    ) : (
                        <div
                            id={scrollListId}
                            className={styles.contentList}
                            hidden={!listData?.length}
                        >
                            <InfiniteScroll
                                dataLength={listData?.length}
                                next={() => {
                                    loadEntityList(
                                        {
                                            ...filterListCondition,
                                            offset:
                                                (filterListCondition?.offset ||
                                                    0) + 1,
                                        },
                                        searchKeyword,
                                        true,
                                    )
                                }}
                                hasMore={
                                    isNumber(listData?.length) &&
                                    listData?.length < totalCount
                                }
                                loader={
                                    <div
                                        className={styles.listLoading}
                                        // hidden={!listDataLoading}
                                    >
                                        <Loader />
                                    </div>
                                }
                                scrollableTarget={scrollListId}
                                endMessage={
                                    listData?.length >= defaultListSize ? (
                                        <div
                                            style={{
                                                textAlign: 'center',
                                                color: 'rgba(0,0,0,0.25)',
                                                padding: '8px 0',
                                                fontSize: '12px',
                                                background: '#fff',
                                            }}
                                        >
                                            {__('已完成全部加载')}
                                        </div>
                                    ) : undefined
                                }
                            >
                                {listData?.map((item = {}) =>
                                    renderListItem(item),
                                )}
                            </InfiniteScroll>
                        </div>
                    )}

                    <Tooltip title={__('回到顶部')} placement="top">
                        <BackTop
                            className={styles.backTop}
                            target={() =>
                                document.getElementById(scrollListId) || window
                            }
                            onClick={() => {
                                // 页面置顶
                                goBackTop(scrollListId)
                            }}
                        >
                            <ReturnTopOutlined />
                        </BackTop>
                    </Tooltip>
                </div>
            )
        }

        return (
            <>
                <div
                    className={classnames({
                        [styles.catlgContainer]: true,
                    })}
                >
                    {isSynchzingLoading ? (
                        <div className={styles.pageLoading}>
                            <Loader />
                        </div>
                    ) : (
                        <Row
                            wrap={false}
                            style={{
                                height: '100%',
                                width: '100%',
                            }}
                        >
                            {isSynchzing ? (
                                <div className={styles.unsynchEmpty}>
                                    <Empty
                                        iconSrc={dataEmpty}
                                        desc={
                                            <>
                                                <div>{__('暂无数据')}</div>
                                                <div>
                                                    {__(
                                                        '可点击「同步省级数据目录」开始',
                                                    )}
                                                </div>
                                            </>
                                        }
                                    />
                                </div>
                            ) : (
                                <>
                                    <Col flex={expand ? '296px' : 0}>
                                        {expand ? (
                                            <div>
                                                <div
                                                    className={
                                                        styles.expandOpen
                                                    }
                                                    onClick={() => {
                                                        setExpand(false)
                                                    }}
                                                >
                                                    <CaretLeftOutlined />
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className={styles.unexpandList}
                                                onClick={() => {
                                                    setExpand(true)
                                                }}
                                            >
                                                <div
                                                    className={
                                                        styles.expandClose
                                                    }
                                                >
                                                    {__('筛选')}
                                                </div>
                                            </div>
                                        )}
                                        <div
                                            className={
                                                styles.leftFilterContainer
                                            }
                                            hidden={!expand}
                                        >
                                            <div
                                                className={
                                                    styles.provinceCatlgTitle
                                                }
                                            >
                                                {__('省级资源目录')}
                                            </div>
                                            <div
                                                className={
                                                    styles.prvcOrgTreeWrapper
                                                }
                                            >
                                                <ProvinceOrganTree
                                                    rootCode="430000000000"
                                                    getSelectedNode={(
                                                        code,
                                                        nodeData,
                                                    ) => {
                                                        setSelectedNode(
                                                            nodeData,
                                                        )
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                    <Col flex="auto">
                                        {/* 业务逻辑实体列表 */}
                                        <div
                                            className={
                                                styles.rightCatlgContainer
                                            }
                                        >
                                            <div className={styles.titleBar}>
                                                <div
                                                    className={
                                                        styles.titleBarBox
                                                    }
                                                >
                                                    <FilterConditionLayout
                                                        layoutClassName={
                                                            styles.catlgFilterLayout
                                                        }
                                                        filterConfig={
                                                            provinceCatlgFilterConfig
                                                        }
                                                        updateList={(
                                                            params: Object,
                                                        ) => {
                                                            loadEntityList(
                                                                {
                                                                    ...filterListCondition,
                                                                    offset: 1,
                                                                    ...params,
                                                                },
                                                                searchKeyword,
                                                            )
                                                        }}
                                                        getIsShowClearBtn={(
                                                            flag,
                                                        ) => setIsSearch(flag)}
                                                    />
                                                </div>
                                                <div
                                                    style={{
                                                        marginLeft: '16px',
                                                        width: '275px',
                                                    }}
                                                >
                                                    <Tooltip
                                                        placement="top"
                                                        title={__(
                                                            '搜索目录名称、描述',
                                                        )}
                                                        overlayInnerStyle={{
                                                            width: 'fit-content',
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        <SearchInput
                                                            placeholder={__(
                                                                '搜索目录名称、描述',
                                                            )}
                                                            value={
                                                                searchKeyword
                                                            }
                                                            onKeyChange={
                                                                handleSearchPressEnter
                                                            }
                                                            onPressEnter={(
                                                                e: any,
                                                            ) =>
                                                                handleSearchPressEnter(
                                                                    e.target
                                                                        ?.value,
                                                                )
                                                            }
                                                            maxLength={255}
                                                        />
                                                    </Tooltip>
                                                </div>
                                            </div>

                                            {listDataLoading ? (
                                                <div
                                                    className={
                                                        styles.listLoading
                                                    }
                                                    // hidden={!listDataLoading}
                                                >
                                                    <Loader />
                                                </div>
                                            ) : (
                                                <div
                                                    className={
                                                        styles.listContentWrapper
                                                    }
                                                    // hidden={listDataLoading}
                                                >
                                                    <DragBox
                                                        defaultSize={
                                                            defaultSize
                                                        }
                                                        minSize={[273, 417]}
                                                        maxSize={[
                                                            Infinity,
                                                            600,
                                                        ]}
                                                        onDragStart={() => {
                                                            setIsDragging(true)
                                                        }}
                                                        onDragEnd={(size) => {
                                                            setIsDragging(false)
                                                            setDefaultSize(size)
                                                            localStorage.setItem(
                                                                'marketConSize',
                                                                JSON.stringify(
                                                                    size,
                                                                ),
                                                            )
                                                        }}
                                                        cursor="col-resize"
                                                        gutterSize={1}
                                                        gutterStyles={{
                                                            width: '4px',
                                                            borderRight:
                                                                '4px solid rgb(0 0 0 / 0%)',
                                                            borderLeft:
                                                                'none !important',
                                                        }}
                                                        splitClass={classnames(
                                                            styles.dragBox,
                                                            isDragging &&
                                                                styles.isDraggingBox,
                                                            !pCatlgCardOpen &&
                                                                styles.noRightNode,
                                                        )}
                                                        showExpandBtn={false}
                                                        rightNodeStyle={{
                                                            padding: 0,
                                                            minWidth: 417,
                                                        }}
                                                    >
                                                        {renderListContent()}
                                                        <div
                                                            className={
                                                                styles.rightWrapper
                                                            }
                                                            hidden={
                                                                !pCatlgCardOpen
                                                            }
                                                        >
                                                            {pCatlgCardOpen && (
                                                                <ProvinceCatlgCard
                                                                    open={
                                                                        pCatlgCardOpen
                                                                    }
                                                                    onClose={() => {
                                                                        setPCatlgCardOpen(
                                                                            false,
                                                                        )
                                                                    }}
                                                                    onSure={() => {}}
                                                                    id={
                                                                        selectedResc?.id
                                                                    }
                                                                    onFullScreen={(
                                                                        tabKey?: any,
                                                                    ) => {
                                                                        setCurDetailResc(
                                                                            selectedResc,
                                                                        )
                                                                        setPCatlgDetailOpen(
                                                                            true,
                                                                        )
                                                                        setLinkDetailTabKey(
                                                                            tabKey,
                                                                        )
                                                                    }}
                                                                    cardProps={{
                                                                        zIndex: 999,
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    </DragBox>
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                </>
                            )}
                        </Row>
                    )}
                </div>

                {pCatlgDetailOpen && (
                    <ProvinceCatlgContent
                        open={pCatlgDetailOpen}
                        onClose={() => {
                            setPCatlgDetailOpen(false)
                        }}
                        id={curDetailResc?.id}
                        isIntroduced={isIntroduced}
                        tabKey={
                            curDetailResc?.id === selectedResc?.id
                                ? linkDetailTabKey
                                : undefined
                        }
                        canChat
                        hasAsst={platform === LoginPlatform.default}
                    />
                )}
            </>
        )
    },
)

export default ProvinceCatlg
