import {
    Button,
    Divider,
    Input,
    List,
    message,
    Pagination,
    Select,
    Space,
} from 'antd'
import React, { useEffect, useMemo, useRef, useState, useContext } from 'react'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { debounce, trim } from 'lodash'
import { useSize } from 'ahooks'
import { AddOutlined } from '@/icons'
import styles from './styles.module.less'
import {
    AssemblyLineChangeState,
    AssemblyLineReleaseState,
    menus,
    searchData,
    SortType,
} from './const'
import {
    IAssemblyLineItem,
    IAssemblyLineQueryParams,
} from '@/core/apis/assemblyLine/index.d'
import { SortDirection, formatError } from '@/core'
import DropDownFilter from '../DropDownFilter'
import {
    assemblyLineDelete,
    assemblyLineQueryList,
    assemblyLineQueryItem,
} from '@/core/apis/assemblyLine'
import Confirm from '../Confirm'
import { getActualUrl, OperateType, rewriteUrl, useQuery } from '@/utils'
import Loader from '@/ui/Loader'
import Empty from '@/ui/Empty'
import empty from '@/assets/dataEmpty.svg'
import searchEmpty from '@/assets/searchEmpty.svg'
import EditAssemblyLine from './EditAssemblyLine'
import AssemblyLineCardItem from './AssemblyLineCardItem'
import __ from './locale'
import { RefreshBtn, SortBtn } from '@/components/ToolbarComponents'
import {
    SearchInput,
    ListPagination,
    ListType,
    ListDefaultPageSize,
    LightweightSearch,
} from '@/ui'
import Graph from '../Graph'

// 初始搜索条件
const initialQueryParams = {
    offset: 1,
    limit: ListDefaultPageSize[ListType.CardList],
    direction: SortDirection.DESC,
    sort: SortType.CREATED,
    release_state: AssemblyLineReleaseState.RELEASED,
}

const AssemblyLineMgt = () => {
    // load显示,【true】显示,【false】隐藏
    const [loading, setLoading] = useState(false)

    // 当前工作流程发布状态
    const [relState, setRelState] = useState<string>(
        AssemblyLineReleaseState.RELEASED,
    )

    // 当前工作流程变更状态
    const [chgState, setChgState] = useState(AssemblyLineChangeState.ALL)

    // 工作流程数据
    const [items, setItems] = useState<IAssemblyLineItem[]>([])

    // 选中工作流程
    const [assemblyLine, setAssemblyLine] = useState<IAssemblyLineItem>()

    // 查询params
    const [queryParams, setQueryParams] =
        useState<IAssemblyLineQueryParams>(initialQueryParams)

    // 搜素关键字
    const [searchKey, setSearchKey] = useState('')

    // 总数
    const [total, setTotal] = useState<{
        total_count: number
        released_total_count: number
        unreleased_total_count: number
    }>()

    // 新建/编辑弹框显示,【true】显示,【false】隐藏
    const [editVisible, setEditVisible] = useState(false)

    // 删除弹框显示,【true】显示,【false】隐藏
    const [delVisible, setDelVisible] = useState(false)

    // 请求加载
    const [isLoading, setIsLoading] = useState(false)

    // 流程图编辑显示/隐藏
    const [editGraphOpen, setEditGraphOpen] = useState(false)
    const [graphModel, setGraphModel] = useState<string>('')

    // 设置进入画布的id
    const [editGraphId, setEditGraphId] = useState<string>('')

    // 操作类型
    const [operate, setOperate] = useState(OperateType.CREATE)

    // 显示/隐藏顶部右侧区（选项，搜索，筛选）
    const showSearch = useMemo(
        () =>
            searchKey !== '' ||
            chgState !== AssemblyLineChangeState.ALL ||
            items.length > 0,
        [searchKey, chgState, items],
    )

    const ref = useRef<HTMLDivElement>(null)
    // 列表大小
    const size = useSize(ref)
    const col = size
        ? (size?.width || 0) - 8 >= 1356
            ? 4
            : (size?.width || 0) - 8 >= 1012
            ? 3
            : (size?.width || 0) - 8 >= 668
            ? 2
            : 1
        : 3

    const navigate = useNavigate()
    const query = useQuery()

    const id = query.get('id')

    useEffect(() => {
        const state = query.get('state')
        const release_state =
            state !== null ? state : AssemblyLineReleaseState.RELEASED
        setRelState(release_state)
        setChgState(AssemblyLineChangeState.ALL)
        setSearchKey('')
        setLoading(true)
        queryAssemblyLineList({
            ...initialQueryParams,
            release_state,
        })
        if (id) {
            setEditGraphOpen(true)
            setEditGraphId(id)
        }
    }, [editGraphOpen])

    // 获取工作流程列表
    const queryAssemblyLineList = async (params: IAssemblyLineQueryParams) => {
        try {
            setLoading(true)
            const {
                entries,
                total_count,
                released_total_count,
                unreleased_total_count,
            } = await assemblyLineQueryList(params)
            setItems(entries)
            setQueryParams(params)
            setTotal({
                total_count,
                released_total_count,
                unreleased_total_count,
            })
        } catch (e) {
            formatError(e)
        } finally {
            setLoading(false)
        }
    }

    // 获取指定工作流程内容
    const queryAssemblyLineItem = async (fid?: string): Promise<boolean> => {
        if (!fid) {
            return Promise.resolve(false)
        }
        try {
            const res = await assemblyLineQueryItem(fid)
            setAssemblyLine(res)
            return Promise.resolve(true)
        } catch (e) {
            formatError(e)
            queryAssemblyLineList({
                ...queryParams,
                offset:
                    items.length === 1
                        ? queryParams.offset! - 1 || 1
                        : queryParams.offset!,
            })
            setAssemblyLine(undefined)
            return Promise.resolve(false)
        }
    }

    // 切换工作流程状态
    const changeStatus = (
        rel: AssemblyLineReleaseState,
        chg: AssemblyLineChangeState,
    ) => {
        setRelState(rel)
        setChgState(chg)
        if (chg === AssemblyLineChangeState.ALL) {
            const { limit, direction, sort, keyword } = queryParams
            queryAssemblyLineList({
                keyword,
                limit,
                direction,
                sort,
                offset: 1,
                release_state: rel,
            })
        } else {
            queryAssemblyLineList({
                ...queryParams,
                offset: 1,
                release_state: rel,
                change_state: chg,
            })
        }
    }

    // 排序方式改变
    const handleSortWayChange = (selectedMenu) => {
        if (showSearch) {
            queryAssemblyLineList({
                ...queryParams,
                offset: 1,
                direction: selectedMenu.sort,
                sort: selectedMenu.key,
            })
        }
    }

    // 搜索框enter
    const handleSearchPressEnter = (e: any) => {
        const keyword = typeof e === 'string' ? e : trim(e.target.value)
        queryAssemblyLineList({
            ...queryParams,
            keyword,
            offset: 1,
        })
    }

    // 工作流程相关操作onClick
    const operateClick = async (
        type: OperateType,
        item?: IAssemblyLineItem,
    ) => {
        setOperate(type)
        setAssemblyLine(item)
        switch (type) {
            case OperateType.DELETE:
                setDelVisible(true)
                break
            case OperateType.DETAIL: {
                const bo = await queryAssemblyLineItem(item?.id)
                if (item && bo) {
                    // navigate(
                    //         `/graph/resumedraft?id=${item.id}&state=${relState}`,
                    //     )
                    rewriteUrl(
                        `${window.location.pathname}?id=${item.id}&state=${relState}&viewKey=resumedraft`,
                    )
                    setGraphModel('resumedraft')
                    setEditGraphOpen(true)
                }
                break
            }
            case OperateType.PREVIEW: {
                const bo = await queryAssemblyLineItem(item?.id)
                if (item && bo) {
                    // navigate(
                    //         `/graph/view?id=${item.id}&state=${relState}`,
                    // )
                    rewriteUrl(
                        `${window.location.pathname}?id=${item.id}&state=${relState}&viewKey=view`,
                    )
                    setGraphModel('view')
                    setEditGraphOpen(true)
                    setEditGraphId(item.id)
                }
                break
            }
            case OperateType.EDIT: {
                const bo = await queryAssemblyLineItem(item?.id)
                setEditVisible(bo)
                break
            }
            default:
                setEditVisible(true)
        }
    }

    // 相关操作弹窗关闭
    const modalClose = () => {
        setEditVisible(false)
        setDelVisible(false)
        setAssemblyLine(undefined)
    }

    // 新建/编辑 工作流程
    const handleCreateEdit = (info) => {
        queryAssemblyLineList({
            ...queryParams,
            offset: operate === OperateType.CREATE ? 1 : queryParams.offset,
        })

        if (info && operate === OperateType.CREATE) {
            // navigate(
            //         `/graph/resumedraft?id=${info.id}&state=${AssemblyLineReleaseState.UNRELEASED}`,
            // )
            rewriteUrl(
                `${window.location.pathname}?id=${info.id}&state=${AssemblyLineReleaseState.UNRELEASED}&viewKey=resumedraft`,
            )
            setGraphModel('resumedraft')
            setEditGraphOpen(true)
            setEditGraphId(info.id)
        }
    }

    // 删除工作流程
    const handleDelete = async () => {
        try {
            setIsLoading(true)
            if (!assemblyLine) return
            await assemblyLineDelete(assemblyLine.id)
            setIsLoading(false)
            message.success(__('删除成功'))
        } catch (e) {
            formatError(e)
        } finally {
            setIsLoading(false)
            modalClose()
            queryAssemblyLineList({
                ...queryParams,
                offset:
                    items.length === 1
                        ? queryParams.offset! - 1 || 1
                        : queryParams.offset!,
            })
        }
    }

    // 空库表
    const showEmpty = () => {
        const desc = showSearch ? (
            <span>{__('抱歉，没有找到相关内容')}</span>
        ) : (
            <div style={{ height: 44 }}>
                <div>{__('暂无数据')}</div>
                {/* {__('点击')}
                <span
                    onClick={() => operateClick(OperateType.CREATE)}
                    className={styles.link}
                >
                    【{__('新建')}】
                </span>
                {__('按钮可新建工作流程')} */}
            </div>
        )
        const icon = showSearch ? searchEmpty : empty
        return <Empty desc={desc} iconSrc={icon} />
    }

    // 页面分栏头标题
    const showTitleLabel = (
        label: string,
        type: AssemblyLineReleaseState,
        totalKey: string,
    ) => (
        <span
            onClick={() => changeStatus(type, AssemblyLineChangeState.ALL)}
            className={`${styles.dividerTitle} ${
                relState === type && styles.titleSelected
            }`}
        >
            {`${label} (${total?.[totalKey] || 0})`}
        </span>
    )

    const searchChange = (data, dataKey) => {
        changeStatus(AssemblyLineReleaseState.RELEASED, data[dataKey])
    }

    const handlePageChange = (offset: number, limit: number) => {
        queryAssemblyLineList({
            ...queryParams,
            offset,
            limit,
        })
    }

    return (
        <div className={styles.content} ref={ref}>
            <div className={styles.titleRapper}>{__('工作流程配置')}</div>
            <div className={styles.operateWrapper}>
                <Button
                    type="primary"
                    onClick={() => operateClick(OperateType.CREATE)}
                    icon={<AddOutlined />}
                >
                    {__('新建工作流程')}
                </Button>
            </div>
            <div className={styles.selectWrapper}>
                <Space className={styles.dividerWrapper} size={12}>
                    {showTitleLabel(
                        __('已发布'),
                        AssemblyLineReleaseState.RELEASED,
                        'released_total_count',
                    )}
                    {showTitleLabel(
                        __('未发布'),
                        AssemblyLineReleaseState.UNRELEASED,
                        'unreleased_total_count',
                    )}
                </Space>
                <Space hidden={!showSearch}>
                    {/* <span
                        className={styles.textSecondaryColor}
                        style={{ wordBreak: 'keep-all' }}
                        hidden={
                            relState === AssemblyLineReleaseState.UNRELEASED
                        }
                    >
                        {__('状态')}
                    </span> */}
                    <SearchInput
                        placeholder={__('搜索工作流程名称')}
                        onKeyChange={(value: string) => {
                            setSearchKey(value)
                            handleSearchPressEnter(value)
                        }}
                        // onPressEnter={handleSearchPressEnter}
                        style={{ width: 272 }}
                    />
                    <div
                        hidden={
                            relState === AssemblyLineReleaseState.UNRELEASED
                        }
                    >
                        <LightweightSearch
                            formData={searchData}
                            onChange={(data, key) => searchChange(data, key)}
                            defaultValue={{ state: '' }}
                        />
                    </div>
                    <span>
                        <SortBtn
                            contentNode={
                                <DropDownFilter
                                    menus={menus}
                                    defaultMenu={{
                                        key: SortType.UPDATED,
                                        sort: SortDirection.DESC,
                                    }}
                                    menuChangeCb={handleSortWayChange}
                                />
                            }
                        />
                        <RefreshBtn
                            onClick={() =>
                                queryAssemblyLineList({
                                    ...queryParams,
                                    keyword: searchKey,
                                    offset: 1,
                                })
                            }
                        />
                    </span>
                </Space>
            </div>
            {loading ? (
                <div className={styles.empty} hidden={!loading}>
                    <Loader />
                </div>
            ) : items.length === 0 ? (
                <div
                    className={styles.empty}
                    hidden={loading || items.length > 0}
                >
                    {showEmpty()}
                </div>
            ) : (
                <div className={styles.bottom} ref={ref}>
                    <div className={styles.listWrapper}>
                        <List
                            grid={{
                                gutter: 20,
                                column: col,
                            }}
                            dataSource={items}
                            renderItem={(item) => (
                                <List.Item
                                    style={{
                                        maxWidth:
                                            (size?.width ||
                                                0 - 8 - (col - 1) * 20) / col,
                                    }}
                                >
                                    <AssemblyLineCardItem
                                        item={item}
                                        onOperateClick={(o) =>
                                            operateClick(o, item)
                                        }
                                    />
                                </List.Item>
                            )}
                            className={styles.list}
                        />
                    </div>
                    <ListPagination
                        listType={ListType.CardList}
                        queryParams={queryParams}
                        totalCount={total?.total_count}
                        onChange={handlePageChange}
                        className={styles.pagination}
                    />
                </div>
            )}

            <EditAssemblyLine
                visible={editVisible}
                operate={operate}
                item={assemblyLine}
                onClose={modalClose}
                onSure={(info) => handleCreateEdit(info)}
            />
            <Confirm
                open={delVisible}
                title={__('确认要删除该工作流程吗？')}
                content={__('工作流程删除后将无法找回，请谨慎操作！')}
                onOk={handleDelete}
                onCancel={modalClose}
                width={432}
                okButtonProps={{ loading: isLoading }}
            />
            <Graph
                gid={editGraphId || ''}
                open={editGraphOpen}
                model={graphModel}
                operate={operate}
                onClose={() => {
                    setEditGraphOpen(false)
                    setGraphModel('')
                    setEditGraphId('')
                    // 刷新列表
                    // queryAssemblyLineList({
                    //     ...queryParams,
                    //     offset: 1,
                    // })
                }}
            />
        </div>
    )
}

export default AssemblyLineMgt
