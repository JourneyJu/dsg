import { useSafeState, useUpdateEffect } from 'ahooks'
import {
    Key,
    memo,
    useCallback,
    useDeferredValue,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { FolderFilled } from '@ant-design/icons'
import classnames from 'classnames'
import { DirTree } from '@/ui'
import styles from './styles.module.less'
import __ from './locale'
import {
    formatError,
    LicenseTreeDataNode,
    queryLicenseTree,
    queryLicenseTreeList,
} from '@/core'
import { DirTreeProvider } from '@/context'
import { allNodeInfo } from '../BusinessArchitecture/const'

/**
 * 搜索结果项
 * @param item 节点数据
 * @returns 搜索结果项Element
 */
const SearchItem = memo(
    ({
        item,
    }: {
        item: LicenseTreeDataNode
        // isChecked?: boolean
    }) => {
        const { name } = item

        const ref = useRef<HTMLDivElement | null>(null)

        return (
            <div ref={ref} className={styles['search-item']}>
                <div className={styles['search-item-icon']}>
                    <FolderFilled
                        style={{
                            color: '#59A3FF',
                            marginTop: '2px',
                            fontSize: '16px',
                        }}
                    />
                </div>
                <div className={styles['search-item-right']}>
                    <div className={styles['search-item-content']}>
                        <div
                            className={styles['search-item-content-name']}
                            title={name}
                        >
                            {name}
                        </div>
                    </div>
                    {/* {isChecked && (
                        <CheckOutlined
                            className={styles['itemview-wrapper-checkIcon']}
                        />
                    )} */}
                </div>
            </div>
        )
    },
)

/**
 * 搜索结果库表
 * @param data 搜索结果数组
 * @returns 搜索结果库表Element
 */
const SearchContainer = memo(
    ({
        data,
        checkedKeys,
        onSelectedNode,
    }: {
        data: LicenseTreeDataNode[]
        checkedKeys: string[]
        onSelectedNode: (o) => void
    }) => {
        const [checkedNode, setCheckedNode] = useState<LicenseTreeDataNode>()

        return (
            <div
                className={classnames(
                    styles['search-wrapper'],
                    'search-result',
                )}
            >
                {data?.map((o: LicenseTreeDataNode) => (
                    <div
                        key={o?.id}
                        onClick={() => {
                            setCheckedNode(o)
                            // 添加时间戳，解决再次点击同一节点，监听不触发的问题
                            onSelectedNode(o)
                        }}
                        className={
                            checkedNode?.id === o?.id ? styles.checked : ''
                        }
                    >
                        <SearchItem
                            key={o.id}
                            item={o}
                            // isChecked={checkedKeys?.includes(o.id)}
                        />
                    </div>
                ))}
            </div>
        )
    },
)

interface ILicenseTreeProps {
    // getSelectedNode: (node: LicenseTreeDataNode) => void
    onChange: (value) => void
    extraFunc?: () => void
}

const LicenseTree = ({
    // getSelectedNode,
    onChange,
    extraFunc = () => {},
}: ILicenseTreeProps) => {
    const [treeData, setTreeData] = useSafeState<LicenseTreeDataNode[]>()
    const [searchResult, setSearchResult] =
        useSafeState<LicenseTreeDataNode[]>()
    const [keyword, setKeyword] = useSafeState<string>('')
    const deferredKeyWord = useDeferredValue(keyword)
    const [selectedNode, setSelectedNode] = useState<LicenseTreeDataNode>()
    const [treeExpandedKeys, setTreeExpandedKeys] = useState<Array<Key>>([])
    const [treeLoadedKeys, setTreeLoadedKeys] = useState<Array<Key>>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isSearching, setIsSearching] = useState<boolean>(false)
    const [checkedKeys, setCheckedKeys] = useSafeState<string[]>([])

    const selectAllNode = {
        id: '',
        type: '',
        isAll: '',
        cate_id: '',
    }
    // 选中数据信息
    // const [selectedInfo, setSelectedInfo] = useState<{
    //     id: string
    //     type: any
    //     isAll: boolean
    // }>({
    //     id: '',
    //     type: '',
    //     isAll: true,
    // })

    useEffect(() => {
        getTreeData({})
    }, [])

    useEffect(() => {
        onChange({
            id: selectedNode?.id ? selectedNode?.id : '',
            // type: selectedNode?.type ? selectedNode?.type : '',
            isAll: selectedNode?.id === '',
        })
    }, [selectedNode])

    // 获取数据
    const getTreeData = async (params: any) => {
        try {
            const isSearchingTemp = !!params.keyword
            if (isSearchingTemp) {
                setIsSearching(true)
            } else {
                setIsLoading(true)
            }

            if (isSearchingTemp) {
                const responseData = await queryLicenseTreeList(params)
                const res = responseData?.classify
                setSearchResult(res)
                setIsSearching(false)
            } else {
                const responseData = await queryLicenseTree()
                const res = responseData?.classify_tree
                setTreeData(res)
                // setSelectedNode(res?.[0])
                setIsLoading(false)
            }
        } catch (error) {
            formatError(error)
            setIsLoading(false)
            setIsSearching(false)
        }
    }

    // 搜索查询
    useUpdateEffect(() => {
        if (deferredKeyWord) {
            getTreeData({
                keyword: deferredKeyWord,
            })
        } else {
            setSearchResult(undefined)
        }
    }, [deferredKeyWord])

    const handleSearch = (key: string) => {
        setKeyword(key)
    }

    const handleTopAll = useCallback(() => setSelectedNode(allNodeInfo), [])

    // 搜索结果渲染
    const toRenderSearch = useMemo(
        () => (
            <SearchContainer
                data={searchResult as any[]}
                checkedKeys={checkedKeys}
                onSelectedNode={setSelectedNode}
            />
        ),
        [searchResult],
    )

    return (
        <DirTreeProvider>
            <div className={styles.licenseTreeWrapper}>
                <div className={styles.treeTitle}>{__('电子证照目录')}</div>
                {/* {isLoading ? (
                    <Loader />
                ) : ( */}
                <DirTree
                    conf={{
                        placeholder: `${__('搜索电子证照目录')}`,
                        isSearchEmpty:
                            searchResult !== undefined && !searchResult?.length,
                        canTreeEmpty: true,
                        searchRender: toRenderSearch,
                        canCheckTopTitle: true,
                        isCheckTop: !selectedNode?.id,
                        onSearchChange: handleSearch,
                        onTopTitleClick: handleTopAll,
                        showSearch: true,
                        isSearchLoading: isSearching,
                        isTreeLoading: isLoading,
                        showTopTitle: true,
                    }}
                    className={styles['custom-tree-list']}
                    treeData={treeData as any}
                    fieldNames={{ key: 'id', title: 'name' }}
                    onSelect={(val, dataNode: any) => {
                        const { node } = dataNode // node: EventDataNode<DataNode>
                        setSelectedNode(node)
                    }}
                    selectedKeys={selectedNode ? [selectedNode?.id] : []}
                />
                {/* )} */}
            </div>
        </DirTreeProvider>
    )
}

export default LicenseTree
