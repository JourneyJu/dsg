import React, {
    useState,
    useEffect,
    useMemo,
    ReactNode,
    forwardRef,
    useImperativeHandle,
    useRef,
} from 'react'
import { Select, Spin, Switch, TreeSelectProps } from 'antd'
import { last, uniq, uniqBy } from 'lodash'
import {
    CheckOutlined,
    CloseOutlined,
    DownOutlined,
    LoadingOutlined,
    RightOutlined,
} from '@ant-design/icons'
import classnames from 'classnames'
import { useDebounce, useGetState, useSize } from 'ahooks'
import __ from './locale'
import { IObject, formatError, getObjects } from '@/core'
import styles from './styles.module.less'
import { Architecture } from '@/components/BusinessArchitecture/const'
import Icons from '@/components/BusinessArchitecture/Icons'
import {
    FlattenedItem,
    buildTree,
    findItemChild,
    flattenTree,
    removeChildrenOf,
    setProperty,
} from './helper'

interface IDepartmentMutiSelected extends TreeSelectProps {
    value?: string
    onChange?: (value) => void
    ref?: any
}

const DepartmentMutiSelected: React.FC<IDepartmentMutiSelected> = forwardRef(
    (props: any, ref) => {
        const { value, onChange, ...reset } = props
        const notClassifiedId = '00000000-0000-0000-0000-000000000000'
        const [loading, setLoading] = useState<boolean>(true)
        const [allDepartmentData, setAllDepartmentData] = useState<
            Array<IObject>
        >([])
        const [treeData, setTreeData, getLoadedTreeData] = useGetState<any>([])
        const [searchValue, setSearchValue] = useState<string>('')

        const [searchData, setSearchData] = useState<Array<any>>([])
        // 搜索累计数据
        const [searchAllData, setSearchAllData] = useState<Array<any>>([])

        const debounceSearchValue = useDebounce(searchValue, {
            wait: 500,
        })
        // 包含子部门
        const [includeChild, setIncludeChild, getIncludeChild] =
            useGetState<boolean>(false)
        // 选中值
        const [selected, setSelected] = useState<string[]>([])
        let tagClose = false
        const selectRef = useRef<any>(null)
        const size = useSize(selectRef) || { width: 0, height: 0 }

        useImperativeHandle(ref, () => ({
            selectedData: selected.map((item) => {
                const findItem: any = flattenedItems.find((f) => f.id === item)
                if (findItem) {
                    return findItem.name
                }
                return item
            }),
        }))

        useEffect(() => {
            getTreeData()
        }, [])

        // 获取全部部门数据
        const getTreeData = async () => {
            try {
                setLoading(true)
                const { entries } = await getObjects({
                    is_all: false,
                    id: '',
                    type: `${Architecture.ORGANIZATION},${Architecture.DEPARTMENT}`,
                    limit: 0,
                })
                setAllDepartmentData(entries)
                setTreeData(
                    buildTree(entries).map((item) => ({
                        ...item,
                        collapsed: true,
                    })),
                )
            } catch (err) {
                formatError(err)
            } finally {
                setLoading(false)
            }
        }

        useEffect(() => {
            if (debounceSearchValue) {
                getSearchItems()
            }
        }, [debounceSearchValue])

        const getSearchItems = async () => {
            try {
                const { entries } = await getObjects({
                    is_all: true,
                    id: '',
                    type: `${Architecture.ORGANIZATION},${Architecture.DEPARTMENT}`,
                    limit: 0,
                    keyword: debounceSearchValue,
                })
                setSearchData(
                    entries?.map((item) => ({
                        ...item,
                        collapsed: true,
                    })) || [],
                )
                setSearchAllData(
                    uniqBy([...(entries || []), ...searchAllData], 'id'),
                )
            } catch (err) {
                formatError(err)
            }
        }

        const findItem = (id: string, currentTreeData: any[]): any => {
            let foundItem = null
            currentTreeData.forEach((item) => {
                if (item.id === id && foundItem === null) {
                    foundItem = item
                } else if (foundItem === null && item.children) {
                    foundItem = findItem(id, item.children)
                }
            })
            return foundItem
        }

        // 折叠/展开
        const handleCollapse = async (id: string) => {
            const currentItem = findItem(id, getLoadedTreeData())

            if (
                currentItem &&
                currentItem.expand &&
                !currentItem.children?.length
            ) {
                setTreeData((info) =>
                    setProperty(info, id, 'itemLoading', (val) => {
                        return true
                    }),
                )
                try {
                    const { entries } = await getObjects({
                        is_all: false,
                        id,
                        type: `${Architecture.ORGANIZATION},${Architecture.DEPARTMENT}`,
                        limit: 0,
                    })
                    setAllDepartmentData([...allDepartmentData, ...entries])
                    const newTreeData = buildTree(
                        [
                            ...allDepartmentData,
                            ...entries.map((it) => ({
                                ...it,
                                collapsed: true,
                            })),
                        ].map((item) => {
                            // const expandedNodes = flattenedItems
                            //     .filter((it: any) => it.expand)
                            //     .map((it: any) => it.id)

                            if (item.id === id) {
                                return {
                                    ...item,
                                    itemLoading: false,
                                    collapsed: false,
                                }
                            }
                            const findItemData: any = flattenedItems.find(
                                (it: any) => it.id === item.id,
                            )
                            // if (expandedNodes.includes(item.id)) {
                            //     return {
                            //         ...item,
                            //         expanded: true,
                            //         collapsed: findItemData?.collapsed,
                            //     }
                            // }
                            return {
                                ...item,
                                // expanded: expandedNodes.includes(item.id)
                                //     ? true
                                //     : item.expanded,
                                collapsed: findItemData?.collapsed ?? true,
                            }
                        }),
                    )
                    setTreeData(newTreeData)
                } catch (err) {
                    formatError(err)
                    setTreeData((info) =>
                        setProperty(info, id, 'itemLoading', (val) => {
                            return false
                        }),
                    )
                }
                return
            }

            setTreeData((info) =>
                setProperty(info, id, 'collapsed', (val) => {
                    return !val
                }),
            )
        }

        // 选中
        const handleOnSelect = (val, op) => {
            if (!val.trim()) return
            // setSearchValue('')
            if (getIncludeChild()) {
                const temp = findItemChild(treeData, val)
                if (temp.length > 0) {
                    setSelected(uniq([...selected, ...temp]))
                    return
                }
            }
            if (!selected.find((item) => item === val)) {
                if (val === notClassifiedId) {
                    setSelected([...selected, notClassifiedId])
                    return
                }
                setSelected([...selected, val?.trim()])
            }
        }

        // 取消选中
        const handleOnDeselect = (val, op) => {
            if (tagClose) {
                tagClose = false
            } else {
                // setSearchValue('')
            }
            if (getIncludeChild()) {
                const temp = findItemChild(treeData, val)
                if (temp.length > 0) {
                    setSelected(selected.filter((info) => !temp.includes(info)))
                    return
                }
            }
            setSelected(selected.filter((info) => info !== val))
        }

        const treeItem = (item: FlattenedItem) => {
            const {
                id,
                name,
                type,
                children,
                depth,
                collapsed,
                expand,
                icon = true,
                itemLoading = false,
                hidden = false,
            } = item
            const isSelected = selected.includes(id)
            return hidden ? null : (
                <div
                    className={classnames(
                        styles.treeItem,
                        isSelected && styles.treeItem_selected,
                    )}
                    style={{
                        paddingLeft: `${16 * depth + 12}px`,
                    }}
                    onClick={() => {
                        if (isSelected) {
                            handleOnDeselect(id, item)
                        } else {
                            handleOnSelect(id, item)
                        }
                    }}
                >
                    {icon && (
                        <div
                            className={classnames(
                                styles.arrow,
                                collapsed && styles.collapsed,
                            )}
                            style={{
                                visibility: expand ? 'visible' : 'hidden',
                            }}
                            onClick={(e) => {
                                e.stopPropagation()
                                if (itemLoading) return
                                handleCollapse(id)
                            }}
                        >
                            {itemLoading ? (
                                <LoadingOutlined />
                            ) : collapsed ? (
                                <RightOutlined />
                            ) : (
                                <DownOutlined />
                            )}
                        </div>
                    )}
                    <div className={styles.content}>
                        {type && (
                            <span className={styles.icon}>
                                <Icons type={type as Architecture} />
                            </span>
                        )}
                        <span className={styles.name} title={name}>
                            {name}
                        </span>
                    </div>
                    {isSelected && (
                        <CheckOutlined style={{ color: 'rgb(18, 110, 227)' }} />
                    )}
                </div>
            )
        }

        const searchItem = (item: FlattenedItem) => {
            const { name, type, path } = item
            return (
                <div className={styles.searchItem}>
                    <div className={styles['searchItem-top']}>
                        {type && (
                            <span className={styles.icon}>
                                <Icons type={type as Architecture} />
                            </span>
                        )}
                        <div className={styles.name} title={name}>
                            {name}
                        </div>
                    </div>
                    {path && (
                        <span className={styles.path} title={path}>
                            {path}
                        </span>
                    )}
                </div>
            )
        }

        // 选项
        const flattenedItems = useMemo(() => {
            const flattenedTree = flattenTree(treeData)
            const collapsedItems = flattenedTree.reduce<string[]>(
                (acc, { children, collapsed, id }) =>
                    collapsed && children.length ? [...acc, id] : acc,
                [],
            )
            const result = removeChildrenOf(flattenedTree, collapsedItems)
            const insertArr = selected.filter(
                (item) =>
                    !flattenedTree.find((t) => t.id === item) &&
                    item !== notClassifiedId,
            )
            // 分成两个数组
            const [inSearchNoTree, other] = insertArr.reduce(
                (acc, item) => {
                    const findSearchItem = searchAllData.find(
                        (data) => data.id === item,
                    )
                    if (findSearchItem) {
                        acc[0].push(findSearchItem)
                    } else {
                        acc[1].push(item)
                    }
                    return acc
                },
                [[] as any[], [] as string[]],
            )

            return result.length > 0
                ? [
                      ...result,
                      {
                          id: notClassifiedId,
                          name: '未分类',
                          children: [],
                          parentId: null,
                          depth: 0,
                          icon: false,
                      },
                      ...inSearchNoTree.map((o) => ({
                          id: o.id,
                          name: o.name,
                          children: [],
                          parentId: null,
                          depth: 0,
                          icon: false,
                          hidden: true,
                      })),
                      ...other.map((o) => ({
                          id: o,
                          name: o,
                          children: [],
                          parentId: null,
                          depth: 0,
                          icon: false,
                      })),
                  ].map((item) => ({
                      ...item,
                      value: item.id,
                      label: treeItem(item),
                  }))
                : []
        }, [treeData, selected])

        // 搜索下的选项
        const searchItems: any = useMemo(() => {
            if (debounceSearchValue) {
                const filterSelect = selected
                    .filter(
                        (item) =>
                            !flattenedItems.find((data) => data.id === item),
                    )
                    .filter(
                        (item) =>
                            item
                                .toUpperCase()
                                .indexOf(debounceSearchValue.toUpperCase()) !==
                            -1,
                    )
                const result = [
                    ...searchData,
                    ...filterSelect.filter(
                        (item) => !searchData.find((data) => data.id === item),
                    ),
                ]
                return result.map((item) => {
                    if (typeof item === 'string') {
                        return { value: item, label: item, name: item }
                    }
                    return {
                        ...item,
                        value: item?.id || item,
                        label: searchItem(item),
                    }
                })
            }
            return []
        }, [debounceSearchValue, searchData])

        useMemo(() => {
            if (includeChild) {
                let res: any[] = []
                selected.forEach((item) => {
                    const temp = findItemChild(treeData, item)
                    if (temp.length > 0) {
                        res = uniq([...res, ...temp])
                    } else {
                        res = uniq([...res, item])
                    }
                })
                setSelected(res)
            }
        }, [includeChild])

        const dropdownRender = (menu: ReactNode) => {
            return loading ? null : debounceSearchValue ? ( // /> //     style={{ paddingLeft: 4 }} //     delay={200} //     indicator={<LoadingOutlined spin />} // <Spin
                menu
            ) : (
                <>
                    <div
                        className={styles.treeListWrap}
                        style={{ width: size.width }}
                    >
                        <div className={styles.treeList}>
                            {flattenedItems.map((item) => item.label)}
                        </div>
                    </div>
                    {/* <div className={styles.checkWrap}>
                        <Switch
                            size="small"
                            checked={includeChild}
                            onChange={(checked) => setIncludeChild(checked)}
                        />
                        <span className={styles.checkName}>
                            {__('包含子部门')}
                        </span>
                    </div> */}
                </>
            )
        }

        return (
            <div className={styles.departmentMutiSelect} ref={selectRef}>
                <Select
                    mode="tags"
                    placeholder={__('请选择所属部门')}
                    showSearch
                    allowClear
                    showArrow
                    optionLabelProp="name"
                    optionFilterProp="name"
                    filterOption={(input, option) =>
                        (option?.name as string)
                            ?.toLowerCase()
                            .includes(input.trim().toLowerCase())
                    }
                    options={debounceSearchValue ? searchItems : flattenedItems}
                    value={selected as any}
                    onChange={onChange}
                    searchValue={searchValue}
                    onSearch={(val) => setSearchValue(val.trim())}
                    onSelect={handleOnSelect}
                    onDeselect={handleOnDeselect}
                    onClear={() => {
                        setSelected([])
                    }}
                    onDropdownVisibleChange={(open) => {
                        if (!open) {
                            setSearchValue('')
                        }
                    }}
                    dropdownRender={dropdownRender}
                    removeIcon={
                        <CloseOutlined
                            onClick={() => {
                                tagClose = true
                            }}
                        />
                    }
                    dropdownStyle={{
                        maxHeight: 400,
                        width: size.width,
                        minWidth: size.width,
                        maxWidth: size.width,
                    }}
                    getPopupContainer={(node) => node.parentNode}
                    loading={loading}
                    {...reset}
                />
            </div>
        )
    },
)

export default DepartmentMutiSelected
