import { register } from '@antv/x6-react-shape'
import { Node } from '@antv/x6'
import { useDebounce } from 'ahooks'
import classnames from 'classnames'
import { useState, useEffect, useMemo } from 'react'
import {
    CaretDownOutlined,
    CaretRightOutlined,
    CaretUpOutlined,
    CloseCircleFilled,
    LeftOutlined,
    RightOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import { ConfigProvider, Tooltip } from 'antd'
import { NodeExpandStatus, searchFieldData, ViewModel } from '../const'
import __ from '../locale'
import styles from './styles.module.less'
import { SearchInput } from '@/ui'
import { getCurrentShowData } from '@/components/FormGraph/helper'
import { FieldTypeIcon } from '@/core'
import {
    HEADER_HEIGHT,
    ITEM_COUNT_LIMIT,
    NODE_FIELD_HEIGHT,
    NODE_WIDTH,
    PAGE_TURNING_HEIGHT,
} from './nodeStatic'
import { FontIcon } from '@/icons'
import { useGraphContentContext } from './GraphContentProvider'

const MetaModelNodeComponent = (props: any) => {
    const { node } = props
    const { data } = node
    const [selectedFields, setSelectedFields] = useState<Array<any>>([])
    const [showFiledOptions, setShowFiledOptions] = useState<string>('')
    const [dataExpand, setDataExpand] = useState<NodeExpandStatus>(
        NodeExpandStatus.FOLD,
    )
    const [originData, setOriginData] = useState<Array<any>>([])
    const [showPagTurning, setShowPageTurning] = useState<boolean>(false)
    const [searchStatus, setSearchStatus] = useState<boolean>(false)
    const [searchKey, setSearchKey] = useState<string>('')
    const debouncedValue = useDebounce(searchKey, { wait: 500 })
    const [modelInfo, setModelInfo] = useState<any>(null)
    const [relationsData, setRelationsData] = useState<Array<string>>([])
    const [showFields, setShowFields] = useState<Array<any>>([])

    const { graphInstance, relationData, setRelationData, viewModel } =
        useGraphContentContext()

    useEffect(() => {
        initOriginNode()
        setModelInfo(data.modelInfo)
        setShowFields(
            getCurrentShowData(
                data.offset,
                searchFieldData(data.items, data.keyWord),
                ITEM_COUNT_LIMIT,
            ),
        )

        setDataExpand(data.expand)
    }, [data])

    useEffect(() => {
        initOriginNode()
    }, [dataExpand, showFields])

    useEffect(() => {
        node.replaceData({
            ...node.data,
            keyWord: debouncedValue,
        })
    }, [debouncedValue])

    const initOriginNode = () => {
        if (data.dragModels?.length > 0) {
            node.resize(
                NODE_WIDTH,
                (HEADER_HEIGHT + 10) * data.dragModels.length,
            )
        } else if (data.expand === NodeExpandStatus.FOLD) {
            node.resize(NODE_WIDTH, HEADER_HEIGHT)
        } else if (showFields.length > ITEM_COUNT_LIMIT) {
            node.resize(
                NODE_WIDTH,
                HEADER_HEIGHT +
                    showFields.length * NODE_FIELD_HEIGHT +
                    PAGE_TURNING_HEIGHT,
            )
        } else {
            node.resize(
                NODE_WIDTH,
                HEADER_HEIGHT + showFields.length * NODE_FIELD_HEIGHT,
            )
        }
    }

    /**
     * 下一页
     */
    const handlePageDown = () => {
        node.replaceData({
            ...node.data,
            offset: data.offset + 1,
        })
    }

    /**
     * 上一页
     */
    const handlePageUp = () => {
        node.replaceData({
            ...node.data,
            offset: data.offset - 1,
        })
    }

    const calcNodeIsOverlap = (
        position: { x: number; y: number },
        height: number,
        targetPosition: { x: number; y: number },
    ) => {
        const x = targetPosition.x - position.x
        const y = targetPosition.y - position.y
        const width = NODE_WIDTH
        const isOverlap = x >= 0 && x <= width && y >= 0 && y <= height
        return isOverlap
    }

    // 计算节点是否与当前节点重叠
    const calcNodeIsOverlapAndMove = (
        position: { x: number; y: number },
        height: number,
        currentNode: Node,
    ) => {
        const itemPosition = currentNode.getPosition()
        const itemSize = currentNode.getSize()

        const positionList = [
            {
                x: itemPosition.x,
                y: itemPosition.y,
            },
            {
                x: itemPosition.x,
                y: itemPosition.y + itemSize.height,
            },
            {
                x: itemPosition.x + NODE_WIDTH,
                y: itemPosition.y,
            },
            {
                x: itemPosition.x + NODE_WIDTH,
                y: itemPosition.y + itemSize.height,
            },
        ]

        const isOverlap = positionList.some((item) => {
            return calcNodeIsOverlap(position, height, item)
        })

        if (isOverlap) {
            const xOffset = itemPosition.x - position.x

            if (xOffset > 0) {
                const newPosition = {
                    x: itemPosition.x + NODE_WIDTH - xOffset + 20,
                    y: itemPosition.y,
                }
                currentNode.setPosition(newPosition)
            } else {
                const newPosition = {
                    x: itemPosition.x - NODE_WIDTH - xOffset - 20,
                    y: itemPosition.y,
                }
                currentNode.setPosition(newPosition)
            }
        }
    }

    /**
     * 移除其他节点的大小
     */
    const removeOtherNodeSize = () => {
        const nodes = graphInstance?.getNodes()
        const position = node.getPosition()
        let height = HEADER_HEIGHT
        if (showFields.length > ITEM_COUNT_LIMIT) {
            height +=
                showFields.length * NODE_FIELD_HEIGHT + PAGE_TURNING_HEIGHT
        } else {
            height += showFields.length * NODE_FIELD_HEIGHT
        }
        nodes?.forEach((item) => {
            if (item.id !== node.id) {
                calcNodeIsOverlapAndMove(position, height, item)
            }
        })
    }
    /**
     * 展开/收起
     */
    const handleExpand = () => {
        node.replaceData({
            ...node.data,
            expand:
                dataExpand === NodeExpandStatus.EXPAND
                    ? NodeExpandStatus.FOLD
                    : NodeExpandStatus.EXPAND,
        })
        if (dataExpand === NodeExpandStatus.FOLD) {
            removeOtherNodeSize()
        }
    }

    const handleDelete = () => {
        if (graphInstance) {
            const edges = graphInstance?.getConnectedEdges(node)

            const relationIds = edges?.map((edge) => edge.getData()?.relation)
            setRelationData(
                relationData?.filter((item) => !relationIds.includes(item.id)),
            )
            edges.forEach((edge) => {
                graphInstance?.removeEdge(edge)
            })
            graphInstance?.removeNode(node)
        }
    }

    return (
        <ConfigProvider
            prefixCls="any-fabric-ant"
            iconPrefixCls="any-fabric-anticon"
        >
            {data?.dragModels?.length > 0 ? (
                <div
                    className={classnames(
                        styles['meta-node-wrapper'],
                        styles['meta-node-wrapper-drag'],
                        {
                            [styles['meta-node-wrapper-error']]:
                                node.data.isError,
                        },
                    )}
                >
                    {data?.dragModels.map((item) => {
                        return (
                            <div className={styles['meta-header']}>
                                <div className={styles['top-border']} />
                                <div className={styles['node-title']}>
                                    <div className={styles['node-title-label']}>
                                        {searchStatus ? null : dataExpand ===
                                          NodeExpandStatus.EXPAND ? (
                                            <Tooltip
                                                placement="top"
                                                title={__('收起')}
                                            >
                                                <CaretDownOutlined
                                                    className={
                                                        styles[
                                                            'node-title-icon'
                                                        ]
                                                    }
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        handleExpand()
                                                    }}
                                                />
                                            </Tooltip>
                                        ) : (
                                            <Tooltip
                                                placement="top"
                                                title={__('展开')}
                                            >
                                                <CaretRightOutlined
                                                    className={
                                                        styles.formSizeIcon
                                                    }
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        handleExpand()
                                                    }}
                                                />
                                            </Tooltip>
                                        )}

                                        <div
                                            className={
                                                styles['node-title-text']
                                            }
                                            title={item?.business_name || ''}
                                        >
                                            <span>
                                                {item?.business_name || ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.formTitleTool}>
                                        {searchStatus ? null : (
                                            <div
                                                className={styles.formTitleBtn}
                                            >
                                                <Tooltip
                                                    placement="bottom"
                                                    title={__('搜索')}
                                                >
                                                    <SearchOutlined
                                                        className={
                                                            styles.iconBtn
                                                        }
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            setSearchStatus(
                                                                true,
                                                            )
                                                        }}
                                                    />
                                                </Tooltip>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className={styles['meta-node-wrapper']}>
                    <div className={styles['meta-header']}>
                        <div className={styles['top-border']} />
                        <div className={styles['node-title']}>
                            {searchStatus ? (
                                <div className={styles['search-wrapper']}>
                                    <SearchOutlined
                                        style={{
                                            flexShrink: 0,
                                        }}
                                    />
                                    <SearchInput
                                        className={styles['search-input']}
                                        placeholder={__('搜索字段名称')}
                                        bordered={false}
                                        showIcon={false}
                                        allowClear={false}
                                        autoFocus
                                        value={searchKey}
                                        onBlur={() => {
                                            if (!searchKey) {
                                                setSearchStatus(false)
                                            }
                                        }}
                                        onChange={(e) => {
                                            setSearchKey(e.target.value)
                                        }}
                                    />
                                    {searchKey && (
                                        <CloseCircleFilled
                                            className={styles['clear-input']}
                                            onClick={() => {
                                                setSearchKey('')
                                                setSearchStatus(false)
                                            }}
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className={styles['node-title-label']}>
                                    {searchStatus ||
                                    viewModel ===
                                        ViewModel.VIEW ? null : dataExpand ===
                                      NodeExpandStatus.EXPAND ? (
                                        <Tooltip
                                            placement="top"
                                            title={__('收起')}
                                        >
                                            <CaretDownOutlined
                                                className={
                                                    styles['node-title-icon']
                                                }
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleExpand()
                                                }}
                                            />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip
                                            placement="top"
                                            title={__('展开')}
                                        >
                                            <CaretRightOutlined
                                                className={styles.formSizeIcon}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleExpand()
                                                }}
                                            />
                                        </Tooltip>
                                    )}

                                    <Tooltip
                                        placement="right"
                                        trigger="click"
                                        title={
                                            <div
                                                className={
                                                    styles['meta-name-tooltip']
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles[
                                                            'meta-name-tooltip-item'
                                                        ]
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles[
                                                                'tooltip-label'
                                                            ]
                                                        }
                                                    >
                                                        {__('元模型业务名称：')}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles[
                                                                'tooltip-value'
                                                            ]
                                                        }
                                                    >
                                                        {modelInfo?.business_name ||
                                                            '--'}
                                                    </div>
                                                </div>
                                                <div
                                                    className={
                                                        styles[
                                                            'meta-name-tooltip-item'
                                                        ]
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles[
                                                                'tooltip-label'
                                                            ]
                                                        }
                                                    >
                                                        {__('元模型技术名称：')}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles[
                                                                'tooltip-value'
                                                            ]
                                                        }
                                                    >
                                                        {modelInfo?.technical_name ||
                                                            '--'}
                                                    </div>
                                                </div>
                                                <div
                                                    className={
                                                        styles[
                                                            'meta-name-tooltip-item'
                                                        ]
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles[
                                                                'tooltip-label'
                                                            ]
                                                        }
                                                    >
                                                        {__('关联库表名称：')}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles[
                                                                'tooltip-value'
                                                            ]
                                                        }
                                                    >
                                                        {modelInfo?.data_view_name ||
                                                            '--'}
                                                    </div>
                                                </div>
                                                <div
                                                    className={
                                                        styles[
                                                            'meta-name-tooltip-item'
                                                        ]
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles[
                                                                'tooltip-label'
                                                            ]
                                                        }
                                                    >
                                                        {__('描述：')}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles[
                                                                'tooltip-value'
                                                            ]
                                                        }
                                                    >
                                                        {modelInfo?.description ||
                                                            '--'}
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        color="#fff"
                                        overlayInnerStyle={{
                                            color: 'rgba(0, 0, 0, 0.85)',
                                        }}
                                        overlayStyle={{
                                            maxWidth: 600,
                                        }}
                                    >
                                        <div
                                            className={
                                                styles['node-title-text']
                                            }
                                            title={
                                                modelInfo?.business_name || ''
                                            }
                                        >
                                            <FontIcon
                                                name="icon-yuanmoxing"
                                                style={{
                                                    fontSize: 16,
                                                    flexShrink: 0,
                                                    color: 'rgba(18, 110, 227, 1)',
                                                    marginRight: 4,
                                                }}
                                            />
                                            <span>
                                                {modelInfo?.business_name || ''}
                                            </span>
                                        </div>
                                    </Tooltip>
                                </div>
                            )}
                            {dataExpand === NodeExpandStatus.EXPAND && (
                                <div className={styles.formTitleTool}>
                                    {searchStatus ? null : (
                                        <div className={styles.formTitleBtn}>
                                            <Tooltip
                                                placement="bottom"
                                                title={__('搜索')}
                                            >
                                                <SearchOutlined
                                                    className={styles.iconBtn}
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        setSearchStatus(true)
                                                    }}
                                                />
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {dataExpand === NodeExpandStatus.EXPAND ? (
                        showFields.length ? (
                            <div
                                className={styles['field-container']}
                                onFocus={() => 0}
                                onBlur={() => 0}
                                onMouseOver={() => {
                                    // if (
                                    //     searchFieldData(data.items, debouncedValue)
                                    //         .length > 10
                                    // ) {
                                    //     setShowPageTurning(true)
                                    // }
                                }}
                                onMouseLeave={() => {
                                    setShowPageTurning(false)
                                }}
                            >
                                <div className={styles['field-content']}>
                                    {showFields.map((item, index) => {
                                        return (
                                            <div
                                                className={styles['field-item']}
                                                key={item.id}
                                                onFocus={() => 0}
                                                onBlur={() => 0}
                                                onMouseOver={() => {
                                                    setShowFiledOptions(item.id)
                                                }}
                                                onMouseLeave={() => {
                                                    setShowFiledOptions('')
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                }}
                                            >
                                                <div
                                                    className={
                                                        styles['data-type-icon']
                                                    }
                                                >
                                                    <FieldTypeIcon
                                                        dataType={
                                                            item.data_type
                                                        }
                                                        style={{
                                                            color: 'rgba(0, 0, 0, 0.65)',
                                                        }}
                                                    />
                                                </div>
                                                <div
                                                    className={
                                                        styles[
                                                            'field-item-content'
                                                        ]
                                                    }
                                                    title={item.name}
                                                >
                                                    <div
                                                        className={
                                                            styles[
                                                                'business-name'
                                                            ]
                                                        }
                                                        title={
                                                            item.business_name
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles[
                                                                    'business-name-text'
                                                                ]
                                                            }
                                                        >
                                                            {item.business_name}
                                                        </div>
                                                        {item.primary_key && (
                                                            <div
                                                                className={
                                                                    styles[
                                                                        'primary-key'
                                                                    ]
                                                                }
                                                            >
                                                                {__('主键')}
                                                            </div>
                                                        )}
                                                        {data.display_filed_id ===
                                                            item.field_id && (
                                                            <div
                                                                className={
                                                                    styles[
                                                                        'display-tag'
                                                                    ]
                                                                }
                                                            >
                                                                {__('显示属性')}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles[
                                                                'technical-name'
                                                            ]
                                                        }
                                                        title={
                                                            item.technical_name
                                                        }
                                                    >
                                                        {item.technical_name}
                                                    </div>
                                                </div>
                                                {data.display_filed_id !==
                                                    item.field_id &&
                                                    viewModel ===
                                                        ViewModel.EDIT && (
                                                        <div
                                                            className={
                                                                styles[
                                                                    'display-attr-name'
                                                                ]
                                                            }
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()

                                                                node.setData({
                                                                    ...node.data,
                                                                    display_filed_id:
                                                                        item.field_id,
                                                                    isError:
                                                                        false,
                                                                })
                                                            }}
                                                        >
                                                            <FontIcon name="icon-xianshishuxing" />
                                                        </div>
                                                    )}
                                            </div>
                                        )
                                    })}
                                </div>

                                {node.data.expand === NodeExpandStatus.EXPAND &&
                                    searchFieldData(data.items, data.keyWord)
                                        .length > ITEM_COUNT_LIMIT && (
                                        <div
                                            className={
                                                styles['page-turning-container']
                                            }
                                        >
                                            <LeftOutlined
                                                onClick={(e) => {
                                                    if (data.offset === 0) {
                                                        return
                                                    }
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handlePageUp()
                                                }}
                                                style={
                                                    data.offset === 0
                                                        ? {
                                                              color: 'rgba(0, 0, 0, 0.45)',
                                                              cursor: 'default',
                                                          }
                                                        : {}
                                                }
                                            />
                                            <div>
                                                {`${data.offset + 1} /
                                ${Math.ceil(
                                    searchFieldData(data.items, data.keyWord)
                                        .length / ITEM_COUNT_LIMIT,
                                )}`}
                                            </div>

                                            <RightOutlined
                                                onClick={(e) => {
                                                    if (
                                                        data.offset + 1 ===
                                                        Math.ceil(
                                                            searchFieldData(
                                                                data.items,
                                                                data.keyWord,
                                                            ).length /
                                                                ITEM_COUNT_LIMIT,
                                                        )
                                                    ) {
                                                        return
                                                    }
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handlePageDown()
                                                }}
                                                style={
                                                    data.offset + 1 ===
                                                    Math.ceil(
                                                        searchFieldData(
                                                            data.items,
                                                            data.keyWord,
                                                        ).length /
                                                            ITEM_COUNT_LIMIT,
                                                    )
                                                        ? {
                                                              color: 'rgba(0, 0, 0, 0.45)',
                                                              cursor: 'default',
                                                          }
                                                        : {}
                                                }
                                            />
                                        </div>
                                    )}
                            </div>
                        ) : (
                            <div className={styles.formEmpty}>
                                {debouncedValue
                                    ? __('抱歉，没有找到相关内容')
                                    : __('暂无数据')}
                            </div>
                        )
                    ) : null}
                    {viewModel === ViewModel.EDIT && (
                        <div className={styles['display-attr-message']}>
                            <span>{__('点击')}</span>
                            <FontIcon
                                name="icon-xianshishuxing"
                                style={{
                                    fontSize: 12,
                                }}
                            />
                            <span>
                                {__('后该字段在模型查询中将作为默认显示属性')}
                            </span>
                        </div>
                    )}
                    {viewModel === ViewModel.EDIT && (
                        <div
                            className={styles['delete-button']}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDelete()
                            }}
                        >
                            <FontIcon name="icon-lajitong" />
                        </div>
                    )}
                </div>
            )}
        </ConfigProvider>
    )
}

const metaModelNode = () => {
    register({
        shape: 'meta-model-node',
        effect: ['data'],
        component: MetaModelNodeComponent,
    })
    return 'meta-model-node'
}

export default metaModelNode
