import { useAsyncEffect, useSafeState, useUpdateEffect } from 'ahooks'
import {
    Key,
    forwardRef,
    memo,
    useCallback,
    useDeferredValue,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
    FC,
    ReactNode,
} from 'react'
import classnames from 'classnames'
import { cloneDeep } from 'lodash'
import DirTree from '@/ui/DirTree'
import { IGetObject, formatError, getObjects } from '@/core'
import { DirTreeProvider, useDirTreeContext } from '@/context/DirTreeProvider'
import { DataNode, OriganizationType, allNodeInfo } from './const'
import __ from './locale'
import styles from './styles.module.less'
import { OperateType } from '@/utils'

import { EllipsisMiddle } from '@/ui'

import { OriganizationNodeIcon } from './helper'

/**
 * 更新目录树数据
 * @param list 当前目录树列表
 * @param id 选中项id
 * @param children 选中项子目录
 * @returns 更新后的目录树数据
 */
const updateTreeData = (
    list: DataNode[],
    id: string,
    children: DataNode[],
): DataNode[] =>
    list.map((node) => {
        if (node.id === id) {
            return {
                ...node,
                isLeaf: !node.expand,
                children: children?.map((child) => {
                    return {
                        ...child,
                        isLeaf: !child.expand,
                    }
                }),
            }
        }
        if (node.children) {
            return {
                ...node,
                isLeaf: !node.expand,
                children: updateTreeData(node.children, id, children),
            }
        }
        return { ...node }
    })

/**
 * 目录项
 * @param node 节点数据
 * @returns 目录项Element
 */
const ItemView = memo(({ node }: { node: DataNode }) => {
    const { name, type } = node

    const ref = useRef<HTMLDivElement | null>(null)

    return (
        <div ref={ref} className={styles['itemview-wrapper']} title={name}>
            <span className={styles['itemview-icon']}>
                {OriganizationNodeIcon[type]}
            </span>
            <span className={styles['itemview-wrapper-nodename']}>{name}</span>
        </div>
    )
})

/**
 * 搜索结果项
 * @param item 节点数据
 * @returns 搜索结果项Element
 */
const SearchItem = memo(({ item }: { item: DataNode }) => {
    const { name, path, type } = item
    const ref = useRef<HTMLDivElement | null>(null)

    return (
        <div ref={ref} className={styles['search-item']}>
            <div className={styles['search-item-icon']}>
                {OriganizationNodeIcon[type]}
            </div>
            <div className={styles['search-item-right']}>
                <div className={styles['search-item-content']}>
                    <div
                        className={styles['search-item-content-name']}
                        title={name}
                    >
                        {name}
                    </div>
                    {path && path !== name && (
                        <div
                            className={styles['search-item-content-path']}
                            title={path}
                        >
                            <EllipsisMiddle>{path}</EllipsisMiddle>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
})

/**
 * 搜索结果库表
 * @param data 搜索结果数组
 * @returns 搜索结果库表Element
 */
const SearchContainer = memo(({ data }: { data: DataNode[] }) => {
    const { setCurrentNode } = useDirTreeContext()
    const [checkedNode, setCheckedNode] = useState<DataNode>()
    const list = data
    return (
        <div className={classnames(styles['search-wrapper'], 'search-result')}>
            {list?.map((o: DataNode) => (
                <div
                    key={o?.id}
                    onClick={() => {
                        setCheckedNode(o)
                        // 添加时间戳，解决再次点击同一节点，监听不触发的问题
                        setCurrentNode(o)
                    }}
                    className={checkedNode?.id === o?.id ? styles.checked : ''}
                >
                    <SearchItem key={o.id} item={o} />
                </div>
            ))}
        </div>
    )
})

// 参数设置
const InitParams = { limit: 0, id: '', is_all: false }

interface IOrganizationTree {
    ref: any
    getSelectedNode: (node: DataNode) => void
    // 过滤的节点类型
    filterType?: Array<OriganizationType>
    // 隐藏的节点类型
    hiddenType: OriganizationType[]
    // 能否展示数据空库表
    canEmpty: boolean
    isShowAll: boolean
    isShowSearch: boolean
    isShowOperate: boolean
    type?: string
    placeholder?: string
    handleLoadOrEmpty?: (isLoading: boolean, isEmpty: boolean) => void
    extendNodesData?: { title: ReactNode | string; id: string }[]
    needUncategorized?: boolean // 是否需要显示未分类
    unCategorizedKey?: string // 未分类的名称
    getSelectedKeys?: (node: any) => void
    selectedNodes?: DataNode[]
}

/**
 * 数据获取类别
 */
enum DataOpt {
    Init,
    Load,
    Search,
}

/**
 * 组织架构目录树
 * @param getSelectedNode 响应选中节点事件
 * @param filterType 查询节点类型
 */
const OrganizationTree: FC<Partial<IOrganizationTree>> = forwardRef(
    (props: any, ref) => {
        const {
            getSelectedNode,
            filterType = [
                OriganizationType.Origanization,
                OriganizationType.Department,
            ],
            canEmpty = true,
            isShowAll = true,
            isShowSearch = true,
            isShowOperate = false,
            type,
            handleLoadOrEmpty,
            extendNodesData,
            needUncategorized = false,
            unCategorizedKey = 'uncategory',
            placeholder,
            getSelectedKeys,
            selectedNodes,
        } = props

        const [data, setData] = useSafeState<DataNode[]>()
        const [searchResult, setSearchResult] = useSafeState<DataNode[]>()
        const { currentNode, setCurrentNode } = useDirTreeContext()
        const [keyword, setKeyword] = useSafeState<string>('')
        const deferredKeyWord = useDeferredValue(keyword)
        const [selectedNode, setSelectedNode] = useState<DataNode>()
        const [isLoading, setIsLoading] = useState<boolean>(false)
        const [isSearching, setIsSearching] = useState<boolean>(false)
        // 为了保证逻辑, 以下为原结构方法
        const [createNodeType, setCreateNodeType] = useState<OriganizationType>(
            OriganizationType.Department,
        )
        const [createVisible, setCreateVisible] = useState(false)
        const [moveVisible, setMoveVisible] = useState(false)

        const [operateType, setOperateType] = useState<OperateType>(
            OperateType.CREATE,
        )
        const [checkedKeys, setCheckedKeys] = useSafeState<string[]>([])
        const [selectedNodeList, setSelectedNodeList] = useState<any[]>([])

        useImperativeHandle(ref, () => ({
            handleOperate,
            treeData: data,
            renameCallback,
            setCurrentNode,
        }))

        useUpdateEffect(() => {
            if (handleLoadOrEmpty) {
                handleLoadOrEmpty(isLoading, !isLoading && !data?.length)
            }
        }, [isLoading, data])

        // 响应选中事件
        useEffect(() => {
            if (type) {
                getSelectedNode(currentNode, type)
            } else {
                getSelectedNode(currentNode)
            }
            if (currentNode) {
                handleSelect([], { node: currentNode })
            }
        }, [currentNode, type])

        // 外部设置选中树节点
        useEffect(() => {
            if (selectedNodes) {
                setCheckedKeys(selectedNodes.map((item) => item.id))
                setSelectedNodeList(selectedNodes)
            }
        }, [selectedNodes])

        useUpdateEffect(() => {
            getSelectedKeys?.(selectedNodeList)
        }, [selectedNodeList])

        useEffect(() => {
            if (isShowAll) {
                setCurrentNode(allNodeInfo)
            }
        }, [isShowAll])

        // 获取数据
        const getData = async (
            params: IGetObject,
            optType: DataOpt,
            parent_id?: string,
        ) => {
            try {
                if (optType === DataOpt.Init) {
                    setIsLoading(true)
                }
                if (optType === DataOpt.Search && searchResult === undefined) {
                    setIsSearching(true)
                }
                const responseData = await getObjects(params)
                const res = responseData?.entries
                // let processRes: any = []
                // if (isIncludeProcess && optType === DataOpt.Load) {
                //     const processResData = await getBusinessDomainProcessList({
                //         keyword: '',
                //         offset: 1,
                //         limit: 100,
                //         department_id: parent_id,
                //         getall: false,
                //         model_related: 0,
                //         info_related: 0,
                //     })
                //     processRes = processResData?.entries?.filter(
                //         (item) => item.department_id === parent_id,
                //     )
                // }
                let initData
                if (optType === DataOpt.Init) {
                    initData = res?.map((o) => ({
                        ...o,
                        isLeaf: !o.expand,
                    }))
                    if (needUncategorized) {
                        initData = [
                            ...initData,
                            {
                                isLeaf: true,
                                name: __('未分类'),
                                id: unCategorizedKey,
                            },
                        ]
                    }
                }

                switch (optType) {
                    case DataOpt.Init:
                        setData(initData)
                        if (!isShowAll && initData?.length) {
                            setCurrentNode(initData?.[0])
                        }
                        setIsLoading(false)
                        break
                    case DataOpt.Load:
                        setData((prev: DataNode[] | undefined) =>
                            updateTreeData(prev!, parent_id!, res),
                        )
                        break
                    case DataOpt.Search:
                        setSearchResult(res)
                        setIsSearching(false)
                        break
                    default:
                        break
                }
            } catch (error) {
                formatError(error)
                setIsLoading(false)
                setIsSearching(false)
            }
        }

        // 初始化参数
        const QueryParams = useMemo(
            () => ({ ...InitParams, type: filterType.join() }),
            [],
        )

        // 节点查询
        useAsyncEffect(async () => {
            getData(QueryParams, DataOpt.Init)
        }, [QueryParams])

        // 增量更新
        const onLoadData = async (node: any) => {
            try {
                const { id, children } = node
                if (children) {
                    return Promise.resolve()
                }
                await getData({ ...QueryParams, id }, DataOpt.Load, id)
            } catch (err) {
                formatError(err)
            }
            return Promise.resolve()
        }

        // 搜索查询
        useUpdateEffect(() => {
            if (deferredKeyWord) {
                getData(
                    {
                        ...QueryParams,
                        is_all: true,
                        keyword: deferredKeyWord,
                    },
                    DataOpt.Search,
                )
            } else {
                setSearchResult(undefined)
            }
        }, [deferredKeyWord])

        const handleSearch = (key: string) => {
            setKeyword(key)
        }

        const handleTopAll = useCallback(() => setCurrentNode(allNodeInfo), [])

        // 设置选中节点
        const handleSelect = (keys: Key[], info: any) => {
            const { node } = info // node: EventDataNode<DataNode>
            setCurrentNode(node)
        }

        // 以下为原结构逻辑
        const handleOperate = (
            ot: OperateType,
            at: OriganizationType,
            td?: DataNode,
            parentNode?: DataNode,
        ) => {
            if (OperateType.CREATE === ot) {
                setCreateVisible(true)
                setCreateNodeType(at)
            } else if (ot === OperateType.RENAME) {
                setCreateVisible(true)
            } else if (ot === OperateType.MOVE) {
                setMoveVisible(true)
            }
            setOperateType(ot)
            setSelectedNode(td)
        }

        // 搜索结果渲染
        const toRenderSearch = useMemo(
            () => <SearchContainer data={searchResult as DataNode[]} />,
            [isShowOperate, searchResult, handleOperate, checkedKeys],
        )

        const titleRender = useCallback(
            (node: any) => <ItemView node={node} />,
            [isShowOperate, handleOperate, checkedKeys],
        )

        const getTreeNode = (tree: DataNode[], func): DataNode | null => {
            // eslint-disable-next-line
            for (const node of tree) {
                if (func(node)) return node
                if (node.children) {
                    const res = getTreeNode(node.children, func)
                    if (res) return res
                }
            }
            return null
        }

        // 删除节点 callback 外部回调
        // 重命名节点后更新节点的名字 （不调后端列表接口）
        const renameCallback = (name: string) => {
            const temp: DataNode[] = cloneDeep(data) ?? []
            const curNode = getTreeNode(
                temp,
                (node: DataNode) => node.id === selectedNode?.id,
            )
            if (curNode) {
                curNode.name = name
                setData(temp)
            }
            // 在列表重命名 树节点中不存在该节点，则该节点还未加载，但外部需要更新数据
            getSelectedNode()
        }

        return (
            <>
                <DirTree
                    conf={{
                        placeholder: __('搜索组织或部门'),
                        isSearchEmpty:
                            searchResult !== undefined && !searchResult?.length,
                        canTreeEmpty: canEmpty,
                        searchRender: toRenderSearch,
                        onSearchChange: handleSearch,
                        onTopTitleClick: handleTopAll,
                        isCheckTop: !currentNode?.id,
                        showTopTitle: isShowAll,
                        showSearch: isShowSearch,
                        isSearchLoading: isSearching,
                        isTreeLoading: isLoading,
                    }}
                    treeData={data as any}
                    loadData={onLoadData}
                    fieldNames={{ key: 'id' }}
                    titleRender={titleRender}
                    onSelect={handleSelect}
                    selectedKeys={currentNode ? [currentNode?.id] : []}
                />
                {isLoading ||
                isSearching ||
                (searchResult !== undefined && !searchResult?.length)
                    ? null
                    : extendNodesData &&
                      extendNodesData.map((node) => (
                          <div
                              className={classnames(
                                  styles['extend-node'],
                                  currentNode?.id === node.id &&
                                      styles['active-extend-node'],
                              )}
                              onClick={() => {
                                  setCurrentNode({
                                      id: node.id,
                                  })
                              }}
                          >
                              {node.title}
                          </div>
                      ))}
            </>
        )
    },
)

export const OrganizationTreeContainer = forwardRef(
    (props: Partial<IOrganizationTree>, ref) => {
        return (
            <DirTreeProvider>
                <OrganizationTree {...props} ref={ref} />
            </DirTreeProvider>
        )
    },
)

export default memo(OrganizationTreeContainer)
