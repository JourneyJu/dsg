import React, {
    useRef,
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef,
    useMemo,
    useContext,
} from 'react'
import { Row, Col, Tooltip, BackTop } from 'antd'
import InfiniteScroll from 'react-infinite-scroll-component'
import { CaretLeftOutlined } from '@ant-design/icons'
import classnames from 'classnames'
import { useQuery } from '@/utils'
import styles from './styles.module.less'
import __ from '../locale'
import Loader from '@/ui/Loader'
import Empty from '@/ui/Empty'
import dataEmpty from '@/assets/dataEmpty.svg'
import { ReturnTopOutlined } from '@/icons'
import { DataRescToServiceType, ServiceType, goBackTop } from '../helper'
import {
    HasAccess,
    IQueryFrontendLicenseListParams,
    formatError,
    isMicroWidget,
    queryFrontendLicenseList,
} from '@/core'
import LicenseDetail from './Detail'

import { SearchInput } from '@/ui'
import { MicroWidgetPropsContext } from '@/context'
import DragBox from '@/components/DragBox'
import DataRescItem from '../DataResc/DataRescItem'
import { useAuditProcess } from '@/hooks/useAuditProcess'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { BizType, PolicyType } from '@/components/AuditPolicy/const'
import LicenseCard from './Detail/LicenseCard'
import { DataRescType } from '../ApplicationService/helper'
import LicenseTree from '@/components/ElectronicLicense/LicenseTree'
import { allNodeInfo } from '@/components/ElectronicLicense/const'
import { UpdateFavoriteParams } from '@/components/Favorite/FavoriteOperation'
import { useUserPermCtx } from '@/context/UserPermissionProvider'

interface IElectronicLicense {
    ref?: any
    // searchKey?: string
    isIntroduced?: boolean
    getClickAsset?: (asset: any, st: ServiceType) => void
    getAddAsset?: (asset: any) => void
    searchRender?: any
}

const scrollListId = 'scrollableDiv'

// 默认加载条数
const defaultListSize = 20

const ElectronicLicense: React.FC<IElectronicLicense> = forwardRef(
    (props: any, ref) => {
        const refTree: any = useRef()
        const query = useQuery()
        const serviceCode = query.get('serviceCode')
        const [hasAuditProcess, refreshAuditProcess] = useAuditProcess({
            audit_type: PolicyType.AssetPermission,
            service_type: BizType.AuthService,
        })
        const [userId] = useCurrentUser('ID')
        const { permissions, checkPermissions } = useUserPermCtx()
        // 是否拥有数据运营工程师
        const hasDataOperRole = useMemo(() => {
            return checkPermissions(HasAccess.isGovernOrOperation) ?? false
        }, [checkPermissions])

        const scrollRef: any = useRef()
        const [loading, setLoading] = useState(false)
        const [listDataLoading, setListDataLoading] = useState(false)
        const [defaultSize, setDefaultSize] = useState<Array<number>>(
            JSON.parse(localStorage.getItem('marketConSize') || '[60, 40]'),
        )
        const [isDragging, setIsDragging] = useState(false)
        const [dataList, setDataList] = useState<Array<any>>([])
        const [totalCount, setTotalCount] = useState<number>(0)
        const [nextFlag, setNextFlag] = useState<Array<string>>([])

        const [expand, setExpand] = useState<boolean>(true)
        const [departmentId, setDepartmentId] = useState<string>('')
        // 证照详情
        const [licenseDetailOpen, setViewDetailOpen] = useState<boolean>(false)
        // 证照卡片详情
        const [licenseCardOpen, setLicenseCardOpen] = useState<boolean>(false)
        // 当前列表选中资源项
        const [selectedResc, setSelectedResc] = useState<any>()

        // 列表中按钮操作项
        const [oprResc, setOprResc] = useState<any>()
        // 被点击名称资源项
        const [curDetailResc, setCurDetailResc] = useState<any>()

        // 过滤参数
        const [filterParams, setFilterParams] = useState<any>({})
        const {
            // searchKey,
            isIntroduced,
            getClickAsset,
            getAddAsset,
            searchRender,
        } = props
        const [searchCondition, setSearchCondition] =
            useState<IQueryFrontendLicenseListParams>({
                keyword: '',
                industry_departments: [allNodeInfo.id],
            })
        const [searchKeyword, setSearchKeyword] = useState<string>('')
        const { microWidgetProps } = useContext(MicroWidgetPropsContext)

        const isListSearchingByKeyword = useMemo(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = 0
            }
            return !!searchCondition.keyword
        }, [searchCondition.keyword])

        // useEffect(() => {
        //     if (!roleList) return
        //     setLicenseCardOpen(false)
        //     // if (scrollRef.current) {
        //     //     scrollRef.current.scrollTop = 0
        //     // }
        //     // getListData({}, searchKeyword)
        //     // setSearchKeyword(searchKeyword)
        //     setSearchCondition({
        //         ...searchCondition,
        //         industry_departments: [departmentId],
        //     })
        // }, [departmentId])

        // useUpdateEffect(() => {
        //     if (scrollRef.current) {
        //         scrollRef.current.scrollTop = 0
        //     }
        //     getListData({}, searchKeyword)
        // }, [searchKeyword])

        useEffect(() => {
            getListData(searchCondition)
        }, [searchCondition])

        useImperativeHandle(ref, () => ({
            updFilterCondition: (keyword: string) => {
                setSearchKeyword(keyword)
                setSearchCondition({
                    ...searchCondition,
                    keyword,
                })
            },
            scrollListId,
        }))

        const escFunction = () => {
            if (licenseDetailOpen) {
                setViewDetailOpen(false)
            }
        }

        useEffect(() => {
            const handleKeyDown = (event) => {
                if (event.key === 'Escape') {
                    escFunction()
                }
            }

            document.addEventListener('keydown', handleKeyDown)

            return () => {
                document.removeEventListener('keydown', handleKeyDown)
            }
        }, [licenseDetailOpen])

        /**
         * 获取接口数据
         * @param preData 之前获取到的数据
         */
        const getListData = async (params: any, loadMore?: boolean) => {
            try {
                setListDataLoading(true)
                if (!loadMore) {
                    // 刷新列表
                    setLoading(true)
                    setLicenseCardOpen(false)
                }

                const obj: any = {
                    ...searchCondition,
                }
                // 只有加载更多（加载下一页）的时候才传next_flag
                if (loadMore) {
                    setListDataLoading(true)
                    obj.next_flag = nextFlag
                }
                const res = await queryFrontendLicenseList(obj)

                const { total_count, next_flag, entries } = res

                setNextFlag(next_flag || [])

                const newListData = entries
                    ? [...(loadMore ? dataList : []), ...entries]
                    : []
                setDataList(newListData)
                setTotalCount(total_count)

                // 搜索接口只有一条数据，则打开侧边详情框xxx
                if (
                    searchCondition.keyword &&
                    !loadMore &&
                    newListData?.length === 1
                ) {
                    const onlyRes = newListData?.[0]
                    setSelectedResc(onlyRes)
                    setLicenseCardOpen(true)
                }
            } catch (e) {
                formatError(e)
            } finally {
                // if (isRefreshNewList) {
                setListDataLoading(false)
                // }
                if (!loadMore) {
                    setLoading(false)
                }
            }
        }

        const getAssetIsOnline = (item, type: ServiceType) => {
            getClickAsset(item, type)
        }

        const handleItemClick = (item) => {
            if (isIntroduced) {
                getAssetIsOnline(
                    {
                        serviceCode: item.id,
                        id: item.id,
                    },
                    DataRescToServiceType[DataRescType.LICENSE_CATLG],
                )
            } else {
                setSelectedResc(item)
                if (!licenseCardOpen) {
                    setLicenseCardOpen(true)
                }
            }
        }

        const handleItemNameClick = (e: any, item: any) => {
            e.preventDefault()
            e.stopPropagation()
            const { type } = item
            setCurDetailResc(item)
            setViewDetailOpen(true)
        }

        const handleItemBtnClick = (item: any) => {
            const { id, type } = item
            setOprResc(item)
            // if (type === DataRescType.LICENSE_CATLG) {
            // }
        }

        // 更新收藏状态
        const updateFavoriteInfo = ({
            res,
            item,
        }: {
            res: any
            item?: any
        }) => {
            // 更新列表
            setDataList(
                dataList?.map((i) => {
                    if (i.id === item?.id) {
                        return {
                            ...i,
                            is_favored: res?.is_favored,
                            favor_id: res?.favor_id,
                        }
                    }
                    return i
                }),
            )
            // 更新选中项
            if (item?.id === selectedResc?.id) {
                setSelectedResc({
                    ...selectedResc,
                    is_favored: res?.is_favored,
                    favor_id: res?.favor_id,
                })
            }
        }

        const renderListItem = (item: any, _i) => {
            return (
                <DataRescItem
                    item={{
                        ...item,
                        // 资源类型
                        type: DataRescType.LICENSE_CATLG,
                        department_name: item.department,
                        online_at: item.online_time,
                        // 证照类型
                        license_type: item.type,
                        fields: item.columns?.map((cItem) => ({
                            column_name_cn: cItem,
                            raw_column_name_cn: cItem,
                        })),
                    }}
                    fieldKeys={{
                        nameCn: 'column_name_cn',
                        rawNameCn: 'raw_column_name_cn',
                    }}
                    isSearchingByKeyword={isListSearchingByKeyword}
                    selectedResc={selectedResc}
                    onNameClick={(e) => handleItemNameClick(e, item)}
                    onItemClick={(e) => handleItemClick(item)}
                    onItemBtnClick={(e) => handleItemBtnClick(item)}
                    hasDataOperRole={hasDataOperRole}
                    hasAuditProcess={hasAuditProcess}
                    refreshAuditProcess={refreshAuditProcess}
                    onAddFavorite={(res) => updateFavoriteInfo({ res, item })}
                    onCancelFavorite={(res) =>
                        updateFavoriteInfo({ res, item })
                    }
                />
            )
        }

        const renderListContent = () => {
            return (
                <div className={styles.leftWrapper}>
                    <div
                        className={styles.listEmpty}
                        hidden={dataList?.length > 0}
                    >
                        {searchCondition.keyword ? (
                            <Empty />
                        ) : (
                            <Empty iconSrc={dataEmpty} desc={__('暂无数据')} />
                        )}
                    </div>
                    <div
                        id={scrollListId}
                        className={styles.contentList}
                        ref={scrollRef}
                        hidden={!dataList?.length}
                    >
                        <InfiniteScroll
                            hasMore={dataList.length < totalCount}
                            endMessage={
                                dataList.length >= defaultListSize ? (
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
                            loader={
                                <div
                                    className={styles.listLoading}
                                    // hidden={!listDataLoading}
                                >
                                    <Loader />
                                </div>
                            }
                            next={() => {
                                getListData(searchCondition, true)
                            }}
                            dataLength={dataList.length}
                            scrollableTarget={scrollListId}
                        >
                            {dataList.map((item = {}, index = 0) =>
                                renderListItem(item, index),
                            )}
                        </InfiniteScroll>
                        {/* )} */}
                    </div>
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

        // 获取选中的节点
        const getSelectedNode = (sn?: any) => {
            // if: 在树结构中操作后获取选中项 else: 在列表中操作后 选中项不变，但要更新列表及详情
            let node
            if (sn) {
                node = { ...sn }
            } else {
                node = allNodeInfo
            }
            setDepartmentId(node?.id || '')

            // setSelectedNode(sn || allNodeInfo)
            if (sn.id !== searchCondition.industry_departments?.[0]) {
                setSearchCondition({
                    ...searchCondition,
                    industry_departments: [sn.id],
                })
            }
        }

        // 关闭详情时候，更新列表及选中项
        const handleCloseDetail = (detail: any) => {
            // 关闭详情时候，更新列表及选中项
            if (detail) {
                setDataList(
                    dataList?.map((liItem) => {
                        if (liItem.id === detail?.id) {
                            return {
                                ...liItem,
                                is_favored: detail?.is_favored,
                                favor_id: detail?.favor_id,
                            }
                        }
                        return liItem
                    }),
                )

                if (detail?.id === selectedResc?.id) {
                    setSelectedResc({
                        ...selectedResc,
                        is_favored: detail?.is_favored,
                        favor_id: detail?.favor_id,
                    })
                }
            }
            setViewDetailOpen(false)
        }

        return (
            <div className={styles.licenseWrapper}>
                <Row
                    style={{
                        height: '100%',
                    }}
                    wrap={false}
                >
                    <Col flex={expand ? '296px' : 0}>
                        {expand ? (
                            <div>
                                <div
                                    className={styles.expandOpen}
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
                                <div className={styles.expandClose}>
                                    {__('筛选')}
                                </div>
                            </div>
                        )}
                        <div className={styles.leftContainer} hidden={!expand}>
                            <div
                                className={classnames(
                                    styles.resTree,
                                    isMicroWidget({ microWidgetProps }) &&
                                        styles.microTree,
                                )}
                            >
                                <LicenseTree onChange={getSelectedNode} />
                            </div>
                        </div>
                    </Col>
                    <Col flex="auto">
                        {!permissions ? (
                            <div
                                style={{
                                    background: '#fff',
                                    height: '100%',
                                    width: '100%',
                                }}
                            >
                                <Loader />
                            </div>
                        ) : (
                            <div className={styles.container}>
                                {/* <div className={styles.applicationDataContent}> */}
                                <div className={styles.titleBar}>
                                    <div className={styles.titleBarBox}>
                                        <div className={styles.total}>
                                            {__('共')}
                                            <span className={styles.totalText}>
                                                {` ${totalCount} `}
                                            </span>
                                            {__('条资源')}
                                        </div>
                                    </div>
                                    <Tooltip
                                        title={__('搜索目录名称、编码、信息项')}
                                    >
                                        <SearchInput
                                            style={{
                                                marginLeft: '16px',
                                                width: '275px',
                                            }}
                                            placeholder={__(
                                                '搜索目录名称、编码、信息项',
                                            )}
                                            value={searchKeyword}
                                            onKeyChange={(kw: string) => {
                                                setSearchKeyword(kw)
                                                setSearchCondition({
                                                    ...searchCondition,
                                                    keyword: kw,
                                                })
                                                // getListData(searchCondition)
                                            }}
                                            onPressEnter={(e: any) => {
                                                setSearchKeyword(
                                                    e.target?.value,
                                                )
                                                setSearchCondition({
                                                    ...searchCondition,
                                                    keyword: e.target?.value,
                                                })
                                                // getListData(
                                                //     searchCondition
                                                // )
                                            }}
                                            maxLength={255}
                                        />
                                    </Tooltip>
                                    {searchRender?.()}
                                </div>

                                {loading ? (
                                    <div
                                        className={styles.listLoading}
                                        hidden={!loading}
                                    >
                                        <Loader />
                                    </div>
                                ) : (
                                    <div
                                        className={styles.listContentWrapper}
                                        hidden={loading}
                                    >
                                        <DragBox
                                            defaultSize={defaultSize}
                                            minSize={[273, 417]}
                                            maxSize={[Infinity, 600]}
                                            onDragStart={() => {
                                                setIsDragging(true)
                                            }}
                                            onDragEnd={(size) => {
                                                setIsDragging(false)
                                                setDefaultSize(size)
                                                localStorage.setItem(
                                                    'marketConSize',
                                                    JSON.stringify(size),
                                                )
                                            }}
                                            cursor="col-resize"
                                            gutterSize={1}
                                            gutterStyles={{
                                                width: '4px',
                                                borderRight:
                                                    '4px solid rgb(0 0 0 / 0%)',
                                                borderLeft: 'none !important',
                                            }}
                                            splitClass={classnames(
                                                styles.dragBox,
                                                isDragging &&
                                                    styles.isDraggingBox,
                                                !licenseCardOpen &&
                                                    styles.noRightNode,
                                            )}
                                            showExpandBtn={false}
                                            rightNodeStyle={{
                                                padding: 0,
                                                minWidth: 417,
                                            }}
                                            // hiddenElement={
                                            //     viewCardOpen ||
                                            //     interfaceCardOpen || indicatorCardOpen
                                            //         ? 'right'
                                            //         : ''
                                            // }
                                        >
                                            {renderListContent()}
                                            <div
                                                className={styles.rightWrapper}
                                                hidden={!licenseCardOpen}
                                            >
                                                {licenseCardOpen && (
                                                    <LicenseCard
                                                        open={licenseCardOpen}
                                                        onClose={() => {
                                                            setLicenseCardOpen(
                                                                false,
                                                            )
                                                        }}
                                                        onSure={() => {}}
                                                        id={selectedResc?.id}
                                                        onFullScreen={() => {
                                                            setCurDetailResc(
                                                                selectedResc,
                                                            )
                                                            setViewDetailOpen(
                                                                true,
                                                            )
                                                        }}
                                                        cardProps={{
                                                            zIndex: 999,
                                                        }}
                                                        selectedResc={
                                                            selectedResc
                                                        }
                                                        onFavoriteChange={(
                                                            res: UpdateFavoriteParams,
                                                        ) => {
                                                            updateFavoriteInfo({
                                                                res,
                                                                item: selectedResc,
                                                            })
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </DragBox>
                                    </div>
                                )}
                                {/* </div> */}
                            </div>
                        )}
                    </Col>
                </Row>
                {licenseDetailOpen && (
                    <LicenseDetail
                        open={licenseDetailOpen}
                        onClose={({ detail }) => {
                            // if (!isIntroduced) {
                            //     const url = getActualUrl(`/data-assets`)
                            //     // 修改页面路径参数，但不刷新页面
                            //     rewriteUrl(url)
                            // }
                            handleCloseDetail(detail)
                        }}
                        id={curDetailResc?.id}
                        isIntroduced={isIntroduced}
                        canChat
                    />
                )}
            </div>
        )
    },
)

export default ElectronicLicense
