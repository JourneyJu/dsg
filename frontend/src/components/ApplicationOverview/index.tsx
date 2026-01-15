import React, { useEffect, useRef, useState } from 'react'
import { BackTop, Col, List, Row, Tooltip } from 'antd'
import { isNumber } from 'lodash'
import classnames from 'classnames'
import { LeftOutlined } from '@ant-design/icons'
import InfiniteScroll from 'react-infinite-scroll-component'
import moment from 'moment'
import styles from './styles.module.less'
import __ from './locale'
import ResourcesCustomTree from '../ResourcesDir/ResourcesCustomTree'
import {
    InfoApplicationViewCardOutlined,
    ReturnTopOutlined,
    ViewOutlined,
} from '@/icons'
import { Loader, SearchInput, Empty } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'
import searchEmpty from '@/assets/searchEmpty.svg'
import { formatError, reqInfoSysSearch } from '@/core'
import { businessFilterInit, goBackTop } from './helper'
import { MoreInfo } from './MoreInfo'
import { ApplicationOverviewDetailDrawer } from './ApplicationOverviewDetailDrawer'

// 默认加载条数
const defaultListSize = 20
const scrollListId = 'scrollableDiv'
interface IApplicationOverviewProps {}
const ApplicationOverview: React.FC<IApplicationOverviewProps> = () => {
    const [expand, setExpand] = useState<boolean>(true)
    // 类目
    const [categorys, setCategorys] = useState<Array<any>>([])
    const [selectedNode, setSelectedNode] = useState<any>({})
    const [searchKeyword, setSearchKeyword] = useState<string>('')

    const [catalogCardOpen, setCatalogCardOpen] = useState<boolean>(false)
    const showCardStyle = {
        // width: 'calc(100% - 418px)',
        borderRight: '16px solid #F0F2F6',
    }
    // 右侧列表页loading
    const [listDataLoading, setListDataLoading] = useState(true)

    // 业务逻辑实体列表
    const [listData, setListData] = useState<Array<any>>([])
    const [roleList, setRoleList] = useState<Array<any>>()
    const [isSearch, setIsSearch] = useState<boolean>(false)
    // 数据总条数
    const [totalCount, setTotalCount] = useState<number>(100)

    // 右侧列表搜索条件
    const [filterListCondition, setFilterListCondition] = useState({
        ...businessFilterInit,
    })
    const [isInit, setIsInit] = useState(true)
    const [detailInfo, setDetailInfo] = useState(null)
    const isLastRef = useRef(false)

    useEffect(() => {
        const { id, isAll, cate_id } = selectedNode
        if ((id && isAll === false) || (isAll && cate_id)) {
            isLastRef.current = false
            loadEntityList(
                {
                    ...filterListCondition,
                    department_id: selectedNode.id,
                },
                searchKeyword,
            )
            setCatalogCardOpen(false)
        }
    }, [selectedNode])
    useEffect(() => {}, [detailInfo])

    // 列表为空
    const showListDataEmpty = () => {
        const desc =
            searchKeyword || isSearch
                ? __('抱歉，没有找到相关内容')
                : __('暂无数据')
        const icon = searchKeyword || isSearch ? searchEmpty : dataEmpty
        return <Empty desc={desc} iconSrc={icon} />
    }

    // 获取业务逻辑实体列表
    const loadEntityList = async (
        params: any,
        keyword: string,
        loadMore?: boolean,
    ) => {
        try {
            const filter = {
                keyword,
                department_id: params.department_id || null,
            }
            if (!params.department_id) {
                delete filter.department_id
            }
            const reqParams = {
                continue: params.continue,
                filter,
                limit: params.limit,
            }
            // 只有加载更多（加载下一页）的时候才传next_flag
            if (!loadMore) {
                setListDataLoading(true)
                delete reqParams.continue
            }

            const res: any = await reqInfoSysSearch(reqParams)

            const entries = res.entries || []

            if (!loadMore) {
                setListData(entries || [])
            } else {
                const listDataTemp = listData || []
                setListData(listDataTemp?.concat(entries || []))
            }
            setListDataLoading(false)

            setFilterListCondition(
                res?.continue ? { ...params, continue: res?.continue } : params,
            )
            if (!res?.continue || entries?.length < params.limit)
                isLastRef.current = true
        } catch (error) {
            formatError(error)
        } finally {
            if (!loadMore) {
                setListDataLoading(false)
            }
            setIsInit(false)
        }
    }

    const renderListItem = (item) => {
        return (
            <List.Item
                key={item.id}
                className={styles.itemLi}
                onClick={(e) => {
                    e.stopPropagation()
                    setDetailInfo(item)
                }}
            >
                <div className={styles.itemTop}>
                    <div className={styles.itemTopTitle}>
                        <InfoApplicationViewCardOutlined
                            className={styles.itemIcon}
                        />
                        <div
                            className={styles.itemTitle}
                            title={item.name}
                            dangerouslySetInnerHTML={{
                                __html:
                                    item.name_highlight ||
                                    `<span>${item.name || '--'}</span>`,
                            }}
                        />
                    </div>
                </div>
                <div className={styles.itemDesc}>
                    <span>{__('描述')}：</span>
                    <span
                        className={styles.text}
                        dangerouslySetInnerHTML={{
                            __html:
                                item.description_highlight ||
                                `<span>${item.description || '--'}</span>`,
                        }}
                        title={item.description || '--'}
                    />
                </div>
                <MoreInfo
                    infoData={[
                        {
                            infoKey: 'updated_at',
                            content: item?.updated_at
                                ? moment(item?.updated_at).format(
                                      'YYYY-MM-DD HH:mm:ss',
                                  )
                                : '--',
                        },
                        {
                            infoKey: 'department_name',
                            content: item?.department_path || '--',
                        },
                    ]}
                />
            </List.Item>
        )
    }

    return (
        <div style={{ overflowY: 'auto', height: '100%' }}>
            <div className={styles.applicationOverviewBanner}>
                {__('应用概览')}
            </div>
            <div
                className={classnames({
                    [styles.contentWrapper]: true,
                    [styles.businessAssetsWrapper]: true,
                })}
            >
                <Row
                    wrap={false}
                    style={{
                        height: '100%',
                        width: '100%',
                    }}
                >
                    <Col flex={expand ? '280px' : 0}>
                        <div
                            className={styles.unexpandSwitch}
                            onClick={() => setExpand(false)}
                            hidden={!expand}
                        >
                            <LeftOutlined />
                        </div>
                        <div className={styles.leftWrapper} hidden={!expand}>
                            <ResourcesCustomTree
                                getCategorys={setCategorys}
                                onChange={setSelectedNode}
                                needUncategorized
                                hiddenSwitch
                            />
                        </div>

                        <span
                            className={styles.expandSwitch}
                            hidden={expand}
                            onClick={() => {
                                setExpand(true)
                            }}
                        >
                            <ViewOutlined />
                            <span>{__('视角')}</span>
                        </span>
                    </Col>
                    <Col flex="auto">
                        <div className={styles.rightWrapper}>
                            {/* 业务逻辑实体列表 */}
                            <div className={styles.catlgListWrapper}>
                                <div
                                    className={classnames(
                                        styles.listHeader,
                                        styles.catlgListHeader,
                                    )}
                                >
                                    <strong>{__('信息系统')}</strong>

                                    <Tooltip
                                        title={__('搜索信息系统名称、描述')}
                                    >
                                        <SearchInput
                                            style={{
                                                marginLeft: '16px',
                                                width: '275px',
                                            }}
                                            placeholder={__(
                                                '搜索信息系统名称、描述',
                                            )}
                                            value={searchKeyword}
                                            onKeyChange={(kw: string) => {
                                                isLastRef.current = false
                                                setSearchKeyword(kw)
                                                loadEntityList(
                                                    filterListCondition,
                                                    kw,
                                                )
                                            }}
                                            onPressEnter={(e: any) => {
                                                isLastRef.current = false
                                                setSearchKeyword(
                                                    e.target?.value,
                                                )
                                                loadEntityList(
                                                    filterListCondition,
                                                    e.target?.value,
                                                )
                                            }}
                                            maxLength={255}
                                        />
                                    </Tooltip>
                                </div>

                                <div className={styles.catlgListContentWrapper}>
                                    <div className={styles.listLeftWrapper}>
                                        {/* <div
                                        className={styles.totalWrapper}
                                        style={
                                            catalogCardOpen ? showCardStyle : {}
                                        }
                                    >
                                        共
                                        <span
                                            className={styles.totalCount}
                                        >{` ${0} `}</span>
                                        条资源
                                    </div> */}
                                        <div
                                            className={styles.listLoading}
                                            hidden={!listDataLoading}
                                            style={
                                                catalogCardOpen
                                                    ? {
                                                          ...showCardStyle,
                                                          height: '100%',
                                                          marginTop: 0,
                                                      }
                                                    : {}
                                            }
                                        >
                                            <Loader />
                                        </div>
                                        <div
                                            id={scrollListId}
                                            className={styles.listDataWrapper}
                                            hidden={listDataLoading}
                                            style={
                                                catalogCardOpen
                                                    ? showCardStyle
                                                    : {}
                                            }
                                        >
                                            {!listData?.length ? (
                                                <div
                                                    className={styles.listEmpty}
                                                >
                                                    {showListDataEmpty()}
                                                </div>
                                            ) : (
                                                <InfiniteScroll
                                                    dataLength={listData.length}
                                                    next={() => {
                                                        loadEntityList(
                                                            filterListCondition,
                                                            searchKeyword,
                                                            true,
                                                        )
                                                    }}
                                                    hasMore={
                                                        isNumber(
                                                            listData?.length,
                                                        ) && !isLastRef.current
                                                    }
                                                    loader={<div />}
                                                    scrollableTarget={
                                                        scrollListId
                                                    }
                                                    endMessage={
                                                        listData?.length >=
                                                        defaultListSize ? (
                                                            <div
                                                                style={{
                                                                    textAlign:
                                                                        'center',
                                                                    color: 'rgba(0,0,0,0.25)',
                                                                    padding:
                                                                        '8px 0',
                                                                    fontSize:
                                                                        '12px',
                                                                    background:
                                                                        '#fff',
                                                                }}
                                                            >
                                                                {__(
                                                                    '已完成全部加载',
                                                                )}
                                                            </div>
                                                        ) : undefined
                                                    }
                                                >
                                                    <List
                                                        dataSource={listData}
                                                        renderItem={
                                                            renderListItem
                                                        }
                                                    />
                                                </InfiniteScroll>
                                            )}
                                        </div>
                                        <Tooltip
                                            title={__('回到顶部')}
                                            placement="top"
                                        >
                                            <BackTop
                                                className={styles.backTop}
                                                style={
                                                    catalogCardOpen
                                                        ? {
                                                              right: '454px',
                                                          }
                                                        : {}
                                                }
                                                target={() =>
                                                    document.getElementById(
                                                        scrollListId,
                                                    ) || window
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
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            {detailInfo && (
                <ApplicationOverviewDetailDrawer
                    open={Boolean(detailInfo)}
                    onClose={() => setDetailInfo(null)}
                    dataResource={detailInfo}
                />
            )}
        </div>
    )
}
export default ApplicationOverview
