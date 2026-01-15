import React, { memo, useEffect, useMemo, useState } from 'react'
import classnames from 'classnames'
import { useSafeState } from 'ahooks'
import { flatMapDeep } from 'lodash'
import styles from './styles.module.less'
import __ from './locale'
import { DirTree, EllipsisMiddle, Loader } from '@/ui'
import { UNGROUPED } from '../FormGraph/helper'
import { fileTypeOptions } from './helper'

/**
 * 搜索结果库表
 * @param data 搜索结果数组
 * @returns 搜索结果库表Element
 */
const SearchContainer = memo(
    ({
        data,
        onSelectedNode,
    }: {
        data: any[]
        onSelectedNode: (o) => void
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
    isShowSearch?: boolean
    needUncategorized?: boolean // 是否需要显示未分类
    unCategorizedKey?: string // 未分类的名称
    onTreeNodeChange?: (node: any) => void
}

const CAFileTypeTree = (props: ICAFileCustomTree) => {
    const {
        isShowSearch = true,
        needUncategorized = true,
        unCategorizedKey = UNGROUPED,
        onTreeNodeChange = () => {},
    } = props

    const selectAllNode = {
        id: '',
        type: '',
        name: __('全部'),
    }

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [treeList, setTreeList] = useSafeState<any[]>([])

    const [selectedNode, setSelectedNode] = useState<any>(selectAllNode)
    const [searchResult, setSearchResult] = useSafeState<any[]>([])

    useEffect(() => {
        setTreeList(
            fileTypeOptions?.map((item) => {
                return {
                    id: item.value,
                    name: item.label,
                }
            }),
        )
        setSelectedNode({
            id: '',
        })
    }, [])

    // 搜索结果渲染
    const toRenderSearch = useMemo(() => {
        return isShowSearch ? (
            <SearchContainer
                data={searchResult}
                onSelectedNode={setSelectedNode}
            />
        ) : undefined
    }, [searchResult])

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

    const handleTopAll = () => {
        // onTreeNodeChange(selectAllNode)
        setSelectedNode(selectAllNode)
    }

    return isLoading ? (
        <Loader />
    ) : (
        <DirTree
            conf={{
                placeholder: `${__('搜索文件类型')}`,
                isSearchEmpty:
                    searchResult !== undefined && !searchResult?.length,
                canTreeEmpty: true,
                canCheckTopTitle: true,
                isCheckTop: true,
                searchRender: toRenderSearch,
                onSearchChange: handleSearch,
                onTopTitleClick: handleTopAll,
                showSearch: isShowSearch,
                // isSearchLoading: isSearching,
                isTreeLoading: isLoading,
                showTopTitle: true,
            }}
            className={styles['custom-tree-list']}
            treeData={treeList}
            fieldNames={{ key: 'id', title: 'name' }}
            onSelect={(val, node) => {
                setSelectedNode(node?.node)
                onTreeNodeChange(node?.node)
            }}
            selectedKeys={selectedNode ? [selectedNode?.id] : []}
        />
    )
}

export default CAFileTypeTree
