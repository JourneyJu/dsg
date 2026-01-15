import { Select } from 'antd'
import { useSafeState, useUpdateEffect } from 'ahooks'
import {
    forwardRef,
    memo,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'
import classnames from 'classnames'
import { flatMapDeep } from 'lodash'
import { allFileTypeOptions, fileTypeOptions, viewModeItems } from './helper'
import {
    BusinessDomainLevelTypes,
    CAFileTreeType,
    CAFileType,
    formatError,
    getBusinessDomainLevel,
} from '@/core'
import BusinessDomainTree from '../BusiArchitecture/BusinessDomainTree'
import { Architecture } from '../BusinessArchitecture/const'
import ArchitectureDirTree from '../BusinessArchitecture/ArchitectureDirTree'
import { UNGROUPED } from '../FormGraph/helper'
import InfoSystem from '../DataSource/InfoSystem'
import { DirTree, EllipsisMiddle, Loader } from '@/ui'

import styles from './styles.module.less'
import __ from './locale'

/**
 * 搜索结果库表
 * @param data 搜索结果数组
 * @returns 搜索结果库表Element
 */
const SearchContainer = memo(
    ({
        data,
        onSelectedNode,
        treeType,
    }: {
        data: any[]
        onSelectedNode: (o) => void
        // 'system' | 'custom'
        treeType: string
    }) => {
        const [currentNode, setCurrentNode] = useState<any>()

        return (
            <div
                className={classnames(
                    styles['search-wrapper'],
                    'search-result',
                )}
            >
                {data?.map((o) => (
                    <div
                        key={o?.id}
                        className={
                            currentNode?.id === o?.id ? styles.checked : ''
                        }
                        onClick={() => {
                            setCurrentNode(o)
                            onSelectedNode(o)
                        }}
                    >
                        <div className={styles['search-item-wrapper']}>
                            <div className={styles['search-item']}>
                                {/* <div className={styles['search-item-icon']}>
                                    {folderIcon(treeType)}
                                </div> */}
                                <div className={styles['search-item-right']}>
                                    <div
                                        className={
                                            styles['search-item-content']
                                        }
                                    >
                                        <div
                                            className={
                                                styles[
                                                    'search-item-content-name'
                                                ]
                                            }
                                            title={o.name}
                                        >
                                            {o.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {o.cusPath ? (
                                <div
                                    className={styles['search-path']}
                                    title={o.cusPath}
                                >
                                    <EllipsisMiddle>{o.cusPath}</EllipsisMiddle>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>
        )
    },
)

interface ICAFileCustomTree {
    // 选中的文件类型
    fileType?: CAFileType
    currentNode?: any
    onTreeNodeChange: (node) => void
}

const CAFileCustomTree = forwardRef((props: ICAFileCustomTree, ref) => {
    const { fileType, currentNode, onTreeNodeChange } = props
    const [viewMode, setViewMode] = useState<CAFileTreeType>(
        CAFileTreeType.FileType,
    )
    const [selectedNode, setSelectedNode] = useState<any>(currentNode || {})
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [treeData, setTreeData] = useState<any>([])
    const [selectFilterOptions, setSelectFilterOptions] = useState<any>([])
    const [treeType, setTreeType] = useState<string>('')
    const [searchResult, setSearchResult] = useSafeState<any[]>([])
    const [treeList, setTreeList] = useSafeState<any[]>([])
    const [domainLevels, setDomainLevels] = useState<
        BusinessDomainLevelTypes[]
    >([])
    const [extendNodesData, setExtendNodesData] = useState({
        id: UNGROUPED,
        title: __('未分类'),
        num: 0,
    })
    // 新建/编辑选中信息系统id
    const [newSelSysId, setNewSelSysId] = useState<any>(undefined)

    const treeRef: any = useRef()
    const aRef: any = useRef()
    const [isEmpty, setIsEmpty] = useState<boolean>(false)

    useImperativeHandle(ref, () => ({
        viewMode,
    }))

    const selectAllNode = {
        id: '',
        type: '',
        isAll: '',
        cate_id: '',
    }

    // 文件类型树的已选keys
    const selectedKeys = useMemo(() => {
        return viewMode === CAFileTreeType.FileType && selectedNode
            ? [selectedNode?.id]
            : []
    }, [viewMode, selectedNode])

    useEffect(() => {
        if (viewMode === CAFileTreeType.FileType) {
            setTreeList(
                fileTypeOptions?.map((item) => {
                    return {
                        id: item.value,
                        name: item.label,
                    }
                }),
            )
        }
    }, [viewMode])

    // 搜索结果渲染
    const toRenderSearch = useMemo(() => {
        return (
            <SearchContainer
                data={searchResult}
                onSelectedNode={setSelectedNode}
                treeType={treeType}
            />
        )
    }, [searchResult, viewMode])

    useEffect(() => {
        getDomainLevel()
    }, [])

    useEffect(() => {
        onTreeNodeChange({
            ...selectedNode,
            business_type: viewMode,
        })
    }, [selectedNode])

    useEffect(() => {
        // 表格顶部筛选-切换文件类型时，切换左侧树节点
        if (
            viewMode === CAFileTreeType.FileType &&
            selectedNode?.id !== fileType
        ) {
            const selNodeTemp = allFileTypeOptions?.find(
                (fItem) => fItem.value === fileType,
            )
            if (selNodeTemp) {
                setSelectedNode({
                    id: selNodeTemp.value,
                    name: selNodeTemp.label,
                })
            }
        }
    }, [fileType])

    useUpdateEffect(() => {
        if (viewMode === CAFileTreeType.FileType) {
            // 表格顶部已选文件类型，此时切换左侧树结构视角为文件类型时，切换树节点为对应类型
            const selNodeTemp = allFileTypeOptions?.find(
                (fItem) => fItem.value === fileType,
            )
            if (selNodeTemp) {
                setSelectedNode({
                    id: selNodeTemp.value,
                    name: selNodeTemp.label,
                })
            } else {
                onTreeNodeChange({
                    ...selectAllNode,
                    business_type: viewMode,
                })
            }
        }
    }, [viewMode])

    // 获取业务域层级模板
    const getDomainLevel = async () => {
        try {
            const res = await getBusinessDomainLevel()
            setDomainLevels(res)
        } catch (error) {
            formatError(error)
        }
    }

    const handleTopAll = () => {
        // onTreeNodeChange(selectAllNode)
        setSelectedNode(selectAllNode)
    }

    const flatTreeData = (list: any[]): any[] =>
        flatMapDeep(list, (item) => [
            item,
            ...flatTreeData(item.children || []),
        ])

    const handleSearch = (key: string) => {
        const flatList = flatTreeData(treeList)
        const filterTreeData = flatList?.filter((item: any) =>
            item.name.toLocaleLowerCase().includes(key.toLocaleLowerCase()),
        )
        setSearchResult(filterTreeData)
    }

    return (
        <div className={styles.csFileTreeWrapper}>
            <div className={styles.viewWrapper}>
                <Select
                    value={viewMode}
                    bordered={false}
                    options={viewModeItems}
                    onChange={(value) => {
                        setIsLoading(true)
                        setViewMode(value)
                        setTimeout(() => {
                            setIsLoading(false)
                        }, 200)
                    }}
                    className={styles.viewSelect}
                />
            </div>
            {viewMode === CAFileTreeType.FileType ? (
                isLoading ? (
                    <Loader />
                ) : (
                    <DirTree
                        conf={{
                            placeholder: `${__('搜索文件类型')}`,
                            isSearchEmpty:
                                searchResult !== undefined &&
                                !searchResult?.length,
                            canTreeEmpty: true,
                            canCheckTopTitle: true,
                            isCheckTop: true,
                            searchRender: toRenderSearch,
                            onSearchChange: handleSearch,
                            onTopTitleClick: handleTopAll,
                            showSearch: true,
                            // isSearchLoading: isSearching,
                            isTreeLoading: isLoading,
                            showTopTitle: true,
                        }}
                        className={styles['custom-tree-list']}
                        treeData={treeList}
                        fieldNames={{ key: 'id', title: 'name' }}
                        onSelect={(val, node) => {
                            setSelectedNode(node?.node)
                        }}
                        selectedKeys={selectedKeys}
                    />
                )
            ) : viewMode === CAFileTreeType.BusinessDomain ? (
                <div className={styles['tree-wrapper']}>
                    <BusinessDomainTree
                        ref={treeRef}
                        getSelectedKeys={setSelectedNode}
                        domainLevels={domainLevels}
                        // isShowCount
                        showCountField="process_cnt"
                        extendNodesData={[
                            {
                                id: UNGROUPED,
                                title: __('未分类'),
                            },
                        ]}
                    />
                </div>
            ) : viewMode === CAFileTreeType.Department ? (
                <div className={styles.treeContainer}>
                    <ArchitectureDirTree
                        ref={aRef}
                        getSelectedNode={setSelectedNode}
                        hiddenType={[
                            Architecture.BMATTERS,
                            Architecture.BSYSTEM,
                            Architecture.COREBUSINESS,
                        ]}
                        filterType={[
                            Architecture.ORGANIZATION,
                            Architecture.DEPARTMENT,
                        ].join(',')}
                        handleLoadOrEmpty={(loadState, emptyState) => {
                            setIsLoading(loadState)
                            setIsEmpty(emptyState)
                        }}
                        extendNodesData={[extendNodesData]}
                    />
                </div>
            ) : viewMode === CAFileTreeType.InfoSystem ? (
                <div className={styles.technologyTree}>
                    <InfoSystem
                        onSelectSysId={(val) => val}
                        showTitle={false}
                        showPath={false}
                        newSelNodeId={newSelSysId}
                        onSelectedNode={setSelectedNode}
                        needUncategorized
                        unCategorizedKey={UNGROUPED}
                        unCategorizedName={__('未分类')}
                    />
                </div>
            ) : undefined}
        </div>
    )
})

export default CAFileCustomTree
