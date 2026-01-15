import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'
import { message } from 'antd'
import { Dnd } from '@antv/x6-plugin-dnd'
import { v4 as uuidv4 } from 'uuid'
import { uniq } from 'lodash'
import { Shape, Graph as GraphType, Node, Edge, EdgeView } from '@antv/x6'
import { X6PortalProvider } from '@/core/graph/helper'
import { instancingGraph } from '@/core/graph/graph-config'
import { wheellDebounce } from '@/components/FormGraph/helper'
import { loadPlugins, Plugins } from '@/core/graph/plugin'
import {
    FIT_PAGE_PADDING,
    NodeExpandStatus,
    ModelType,
    ViewModel,
} from '../const'
import { GraphContentProvider } from './GraphContentProvider'
import metaModelNode from './metaModelNode'
import {
    HEADER_HEIGHT,
    LINE_BUTTON_MAX_WIDTH,
    LineNormalStyle,
    MetaModelNodeTemplate,
    NODE_WIDTH,
    RelationButtonBox,
    RelationButtonText,
    ThemeModelNodeTemplate,
} from './nodeStatic'
import {
    formatError,
    getModelInfo,
    saveModelGraph,
    updateModel,
    getModelGraph,
} from '@/core'
import ConfigRelation from './ConfigRelation'
import __ from '../locale'
import { useModelGraphContext } from './ModelGraphProvider'
import themeModelNode from './themeModeDragNode'
import TooltipTool from './LineTooltip'
import { Loader } from '@/ui'

const GraphContent = forwardRef(
    ({ modelId, viewModel, graphSize, setGraphSize }: any, ref) => {
        // 画布实例
        const graphCase = useRef<GraphType>()
        const dndCase = useRef<Dnd>()
        const container = useRef<HTMLDivElement>(null)
        const dndContainer = useRef<HTMLDivElement>(null)
        const [relationData, setRelationData] = useState<any[]>([])

        const [showConfigRelation, setShowConfigRelation] = useState(false)

        const [initLoading, setInitLoading] = useState(true)

        const [editingRelation, setEditingRelation] = useState<{
            fromNode: Node
            toNode: Node
            edge: Edge
        } | null>()

        const { onConfirm } = useModelGraphContext()

        const metaModelNodeName = metaModelNode()
        const themeModelNodeName = themeModelNode()

        TooltipTool.config({
            tagName: 'div',
            isSVGElement: false,
        })
        useMemo(() => {
            GraphType.registerEdgeTool('tooltip', TooltipTool, true)
        }, [])

        useEffect(() => {
            if (container.current) {
                const graph = instancingGraph(container.current, {
                    interacting: true,
                    embedding: false,
                    panning: {
                        enabled: true,
                    },

                    mousewheel: {
                        enabled: true,
                        modifiers: ['ctrl', 'meta'],
                        guard(this: any, e: WheelEvent) {
                            const wheelEvent = this

                            if (graph) {
                                wheellDebounce(graph, wheelEvent, setGraphSize)
                                return true
                            }
                            return false
                        },
                    },
                    connecting: {
                        allowBlank: false,
                        allowLoop: false,
                        allowNode: false,
                        allowEdge: false,
                        highlight: true,
                        connectionPoint: 'anchor',
                        connector: {
                            name: 'smooth',
                            args: {
                                direction: 'H',
                            },
                        },
                        targetAnchor: {
                            name: 'right',
                            args: {},
                        },
                        snap: true,
                        router: {
                            name: 'normal',
                        },
                        createEdge() {
                            return new Shape.Edge({
                                attrs: {
                                    line: LineNormalStyle,
                                    zIndex: 0,
                                },
                            })
                        },
                    },
                })
                if (graph) {
                    loadPlugins(
                        graph,
                        [
                            Plugins.History,
                            Plugins.Keyboard,
                            Plugins.Selection,
                            Plugins.Clipboard,
                            Plugins.Export,
                        ],
                        {
                            [Plugins.Selection]: {
                                enabled: true,
                                multiple: false,
                                rubberEdge: false,
                                rubberNode: true,
                                rubberband: false,
                                showNodeSelectionBox: true,
                                pointerEvents: 'none',
                                className: 'form-seleted',
                            },
                        },
                    )
                    graphCase.current = graph
                    dndCase.current = new Dnd({
                        target: graph,
                        scaled: false,
                        dndContainer: dndContainer.current || undefined,
                    })
                    graph.on('edge:connected', ({ edge }) => {
                        if (viewModel === ViewModel.EDIT) {
                            if (checkEdgeRelationIsExist(edge)) {
                                edge.remove()
                                return
                            }
                            const targetPortId = edge.getTargetPortId()
                            const targetNode = edge.getTargetNode()
                            const sourceNode = edge.getSourceNode()
                            const sourcePortId = edge.getSourcePortId()
                            if (sourceNode && targetNode) {
                                setEditingRelation({
                                    fromNode: sourceNode,
                                    toNode: targetNode,
                                    edge,
                                })
                                setShowConfigRelation(true)
                            }
                        } else {
                            edge.remove()
                        }
                    })

                    graph.on('node:added', ({ node }) => {
                        if (node.data.dragModels?.length > 0) {
                            const [firstModel, ...restModels] =
                                node.data.dragModels
                            const position = node.getPosition()
                            const nodePorts = node.getPorts()
                            restModels.forEach((model, index) => {
                                addDragModelNode(model, {
                                    x: position.x,
                                    y:
                                        position.y +
                                        (HEADER_HEIGHT + 10) * (index + 1),
                                })
                            })
                            if (!nodePorts.length) {
                                addPort(node, { x: 0, y: 20 }, 'leftPorts')
                                addPort(node, { x: 280, y: 20 }, 'rightPorts')
                            }
                            node.replaceData({
                                ...node.data,
                                dragModels: [],
                            })
                        }
                        if (node.data.model_type !== ModelType.META_MODEL) {
                            const position = node.getPosition()
                            addDragThemeModelNode(node.data.modelInfo, {
                                x: position.x,
                                y: position.y,
                            })
                            node.remove()
                        }
                    })

                    graph.on('edge:mouseenter', ({ edge }) => {
                        edge.addTools([
                            {
                                name: 'button-remove',
                                args: {
                                    distance: '50%',
                                    offset: {
                                        y: 0,
                                        x: LINE_BUTTON_MAX_WIDTH / 2 + 40,
                                    },
                                    onClick({ view }: { view: EdgeView }) {
                                        const currentEdge = view.cell
                                        const relation =
                                            currentEdge.getData()?.relation
                                        setRelationData(
                                            relationData.filter(
                                                (item) => item.id !== relation,
                                            ),
                                        )
                                        currentEdge.remove()
                                    },
                                },
                            },
                        ])
                    })
                    graph.on('edge:mouseleave', ({ edge }) => {
                        edge.removeTool('button-remove')
                    })
                }
            }
        }, [container.current])

        useEffect(() => {
            if (graphCase.current && modelId) {
                initModelGraph()
            }
        }, [modelId, graphCase.current])

        const initModelGraph = async () => {
            // 获取模型信息
            try {
                setInitLoading(true)
                const res = await getModelGraph(modelId)
                const { meta_model_slice } = await getModelInfo(modelId)
                if (res?.content) {
                    const graphData = JSON.parse(res.content)
                    const nodes = graphData.cells.filter(
                        (cell: any) => cell.shape !== 'edge',
                    )
                    const edges = graphData.cells.filter(
                        (cell: any) => cell.shape === 'edge',
                    )

                    await Promise.all(
                        nodes.map((node: any) => {
                            const findMetaModel = meta_model_slice?.find(
                                (item) => item.id === node.data.model_id,
                            )

                            return initAddNode(node, findMetaModel)
                        }),
                    )
                    if (edges.length) {
                        edges.forEach((edge: any) => {
                            addEdges(edge)
                        })
                    }
                    if (viewModel !== ViewModel.EDIT) {
                        removeNotUsedPort()
                    }
                }
            } catch (err) {
                formatError(err)
            } finally {
                setTimeout(() => {
                    handleMovedToCenter()
                }, 100)
                setInitLoading(false)
            }
        }

        /**
         * 移除未使用的桩
         */
        const removeNotUsedPort = () => {
            if (graphCase.current) {
                const nodes = graphCase.current?.getNodes()
                const edges = graphCase.current?.getEdges()
                const usedPorts = uniq(
                    edges
                        ?.map((edge) => {
                            return [
                                edge.getSourcePortId(),
                                edge.getTargetPortId(),
                            ]
                        })
                        ?.flat() || [],
                )
                nodes?.forEach((node) => {
                    const ports = node.getPorts()
                    ports.forEach((port) => {
                        if (!usedPorts?.includes(port.id) && port.id) {
                            node.removePort(port.id)
                        }
                    })
                })
            }
        }

        /**
         * 检查边是否存在
         * @param edge 边
         * @returns 是否存在
         */
        const checkEdgeRelationIsExist = (edge: Edge) => {
            if (graphCase.current) {
                const edges = graphCase.current
                    .getEdges()
                    .filter((item) => item.id !== edge.id)
                const targetNode = edge.getTargetNode()
                const sourceNode = edge.getSourceNode()
                let isExist = false
                edges.forEach((item) => {
                    const itemTargetNode = item.getTargetNode()
                    const itemSourceNode = item.getSourceNode()
                    if (
                        itemTargetNode?.id === targetNode?.id &&
                        itemSourceNode?.id === sourceNode?.id
                    ) {
                        isExist = true
                        message.error(__('节点关系已存在'))
                    }
                })
                return isExist
            }
            return false
        }

        /**
         * 初始化添加节点
         * @param node 节点
         */
        const initAddNode = async (node: any, metaModel: any) => {
            try {
                if (graphCase.current) {
                    let modelInfo
                    if (metaModel) {
                        modelInfo = metaModel
                    } else {
                        modelInfo = await getModelInfo(node.data.model_id)
                    }
                    const { fields, ...rest } = modelInfo

                    // const { fields, ...rest } = await getModelInfo(
                    //     node.data.model_id,
                    // )
                    const nodeData = {
                        ...node,
                        data: {
                            ...node.data,
                            modelInfo: rest,
                            items: fields?.sort(
                                (a, b) =>
                                    (b.primary_key ? 1 : 0) -
                                    (a.primary_key ? 1 : 0),
                            ),
                            expand: NodeExpandStatus.FOLD,
                            model_type: ModelType.META_MODEL,
                        },
                    }
                    graphCase.current.addNode(nodeData)
                }
            } catch (err) {
                formatError(err)
            }
        }

        /**
         * 添加拖拽模型节点
         * @param modelInfo 模型信息
         * @param position 位置
         */

        const addDragModelNode = (
            modelInfo: any,
            position: { x: number; y: number },
        ) => {
            if (graphCase.current) {
                const { fields, ...rest } = modelInfo
                const willAddNode = {
                    ...MetaModelNodeTemplate,
                    height: HEADER_HEIGHT,
                    width: NODE_WIDTH,
                    position,
                    data: {
                        ...MetaModelNodeTemplate.data,
                        model_id: modelInfo.id,
                        model_type: ModelType.META_MODEL,
                        items: fields?.sort(
                            (a, b) =>
                                (b.primary_key ? 1 : 0) -
                                (a.primary_key ? 1 : 0),
                        ),
                        modelInfo: rest,
                    },
                }

                const newNode = graphCase.current.addNode(willAddNode)
                if (newNode) {
                    addPort(newNode, { x: 0, y: 20 }, 'leftPorts')
                    addPort(newNode, { x: 280, y: 20 }, 'rightPorts')
                }
            }
        }

        /**
         * 添加拖拽主题模型节点
         * @param modelInfo 模型信息
         * @param position 位置
         */
        const addDragThemeModelNode = async (
            modelInfo: any,
            position: { x: number; y: number },
        ) => {
            if (graphCase.current) {
                const { relations, meta_model_slice, ...rest } =
                    await getModelInfo(modelInfo.id)
                const { content } = await getModelGraph(modelInfo.id)
                if (content) {
                    const graphData = JSON.parse(content)
                    let edges = graphData.cells.filter(
                        (cell: any) => cell.shape === 'edge',
                    )

                    const nodes = graphData.cells.filter(
                        (cell: any) => cell.shape === 'meta-model-node',
                    )

                    const offsetPosition = findOffsetPosition(nodes, position)

                    nodes.forEach((node: any) => {
                        const findMetaModel = meta_model_slice?.find(
                            (item) => item.id === node.data.model_id,
                        )
                        const { fields, ...other } = findMetaModel || {}
                        const newPort = addDragContentNode(
                            {
                                ...node,
                                data: {
                                    ...node.data,
                                    modelInfo: other || node.data.modelInfo,
                                    items:
                                        // 主键放在第一个
                                        fields?.sort(
                                            (a, b) =>
                                                (b.primary_key ? 1 : 0) -
                                                (a.primary_key ? 1 : 0),
                                        ) || node.data.items,
                                    model_type: ModelType.META_MODEL,
                                },
                            },
                            offsetPosition,
                        )
                        if (newPort) {
                            edges = edges.map((edge: any) => {
                                if (edge.source.cell === node.id) {
                                    const sourcePorts = node?.ports?.items
                                    const sourcePortSite = sourcePorts.find(
                                        (port: any) =>
                                            port.id === edge.source.port,
                                    ).group
                                    return {
                                        ...edge,
                                        source: {
                                            ...edge.source,
                                            port: newPort[sourcePortSite],
                                            cell: newPort.nodeId,
                                        },
                                    }
                                }
                                if (edge.target.cell === node.id) {
                                    const targetPorts = node?.ports?.items
                                    const targetPortSite = targetPorts.find(
                                        (port: any) =>
                                            port.id === edge.target.port,
                                    ).group
                                    return {
                                        ...edge,
                                        target: {
                                            ...edge.target,
                                            port: newPort[targetPortSite],
                                            cell: newPort.nodeId,
                                        },
                                    }
                                }
                                return edge
                            })
                        }
                    })

                    edges.forEach((edge: any) => {
                        addContentEdge(edge)
                    })
                }
            }
        }

        /**
         * 添加内容边
         * @param source 源节点
         * @param target 目标节点
         * @param edge 边
         * @param relations 关系
         */
        const addContentEdge = (edge: any) => {
            if (graphCase.current) {
                const newRelation = {
                    ...edge.data.relation,
                    id: uuidv4(),
                }
                const edgeRelations =
                    graphCase.current
                        ?.getEdges()
                        .map((item) => item.getData()?.relation) || []
                const isExist = edgeRelations.find(
                    (item) =>
                        item.technical_name === newRelation.technical_name,
                )
                const newEdge = graphCase.current.addEdge({
                    source: {
                        cell: edge.source.cell,
                        port: edge.source.port,
                    },
                    target: {
                        cell: edge.target.cell,
                        port: edge.target.port,
                    },
                    attrs: {
                        line: {
                            stroke: isExist
                                ? '#FF4D4F'
                                : 'rgba(49, 132, 254, 1)',
                            strokeWidth: 0.7,
                        },
                    },
                    data: {
                        relation: newRelation,
                    },
                    zIndex: 0,
                })
                setRelationData([...relationData, newRelation])
                handleChangeRelation(
                    newEdge,
                    newRelation.business_name,
                    !!isExist,
                )
            }
        }
        /**
         * 查找偏移位置
         * @param nodes 节点
         * @param position 位置
         * @returns 偏移位置
         */
        const findOffsetPosition = (
            nodes: Array<any>,
            position: { x: number; y: number },
        ) => {
            let minPosition: { x: number; y: number } = {
                x: nodes[0].position.x,
                y: nodes[0].position.y,
            }
            nodes.forEach((node) => {
                if (node.position.y < minPosition.y) {
                    minPosition = {
                        ...minPosition,
                        y: node.position.y,
                    }
                }
                if (node.position.x < minPosition.x) {
                    minPosition = {
                        ...minPosition,
                        x: node.position.x,
                    }
                }
            })
            return {
                x: position.x - minPosition.x,
                y: position.y - minPosition.y,
            }
        }
        /**
         * 添加拖拽内容节点
         * @param node 节点
         * @param edge 边
         * @param offsetPosition 偏移位置
         */
        const addDragContentNode = (
            node: any,
            offsetPosition: { x: number; y: number },
        ) => {
            if (graphCase.current) {
                const newNode = graphCase.current.addNode({
                    ...MetaModelNodeTemplate,
                    height: HEADER_HEIGHT,
                    width: NODE_WIDTH,
                    position: {
                        x: node.position.x + offsetPosition.x,
                        y: node.position.y + offsetPosition.y,
                    },
                    data: {
                        ...node.data,
                        expand: NodeExpandStatus.FOLD,
                    },
                })

                if (newNode) {
                    addPort(newNode, { x: 0, y: 20 }, 'leftPorts')
                    addPort(newNode, { x: 280, y: 20 }, 'rightPorts')
                    const allPorts = newNode.getPorts()
                    const leftPort = allPorts.find(
                        (port: any) => port.group === 'leftPorts',
                    )
                    const rightPort = allPorts.find(
                        (port: any) => port.group === 'rightPorts',
                    )

                    return {
                        leftPorts: leftPort?.id || '',
                        rightPorts: rightPort?.id || '',
                        nodeId: newNode.id,
                    }
                }
                return null
            }

            return null
        }
        /**
         * 添加边
         * @param edge 边
         */
        const addEdges = (edge: any) => {
            if (graphCase.current) {
                graphCase.current.addEdge(edge)
                const graphEdge = graphCase?.current?.getEdges()
                graphEdge?.forEach((item) => {
                    item.removeTools()
                    handleChangeRelation(
                        item,
                        item.getData()?.relation?.business_name,
                    )
                })
                setRelationData(
                    graphEdge.map((item) => item.getData()?.relation),
                )
            }
        }

        useImperativeHandle(ref, () => ({
            handleFoldAll,
            handleShowAll,
            handleChangeGraphSize,
            handleMovedToCenter,
            startDrag,
            handleSaveModel,
            graphCase: graphCase.current,
        }))

        /**
         * 收起所有模型
         */
        const handleFoldAll = () => {
            if (graphCase.current) {
                const allNodes = graphCase.current.getNodes()
                allNodes.forEach((node) => {
                    if (node?.data?.expand === NodeExpandStatus.EXPAND) {
                        node.setData({
                            ...node.data,
                            expand: NodeExpandStatus.FOLD,
                        })
                    }
                })
            }
        }

        /**
         * 连接关系
         * @param edge 边
         */
        const handleConnectRelation = (
            fromNode: Node,
            toNode: Node,
            edge: Edge,
        ) => {
            setEditingRelation({
                fromNode,
                toNode,
                edge,
            })
        }

        /**
         * 展示所有画布内容
         */
        const handleShowAll = () => {
            if (graphCase.current) {
                graphCase.current.zoomToFit({ padding: FIT_PAGE_PADDING })
                const multiple = graphCase.current.zoom()
                const showSize = Math.round(multiple * 100)
                setGraphSize(showSize - (showSize % 5))
                return multiple
            }
            return 100
        }

        /**
         * 缩放画布
         * @param multiple  缩放大小
         */
        const handleChangeGraphSize = (multiple: number) => {
            setGraphSize(multiple * 100)
            graphCase.current?.zoomTo(multiple)
        }

        /**
         * 画布定位到中心
         */
        const handleMovedToCenter = () => {
            graphCase.current?.centerContent()
        }

        /**
         * 添加端口
         * @param node 节点
         * @param position 位置
         * @param group 组
         * @param modelId 模型id
         * @returns
         */
        const addPort = (
            node: Node,
            position: { x: number; y: number },
            group: 'leftPorts' | 'rightPorts',
        ) => {
            const port = node.addPort({
                group,
                label: {},
                args: {
                    position,
                },
                zIndex: 99,
            })
            return port
        }

        /**
         * 拖拽模型
         * @param e 事件
         */
        const startDrag = async (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            dataIds: Array<string>,
            modelType: ModelType,
        ) => {
            try {
                if (modelType === ModelType.META_MODEL) {
                    const allModelInfos = await Promise.all(
                        dataIds.map((id) => getModelInfo(id)),
                    )
                    const { fields, ...rest } = allModelInfos[0]
                    if (graphCase.current) {
                        if (allModelInfos?.length > 1) {
                            const node = graphCase.current?.createNode({
                                ...MetaModelNodeTemplate,
                                height:
                                    (HEADER_HEIGHT + 10) * allModelInfos.length,
                                width: NODE_WIDTH,
                                data: {
                                    ...MetaModelNodeTemplate.data,
                                    model_id: dataIds[0],
                                    model_type: modelType,
                                    items: fields?.sort(
                                        (a, b) =>
                                            (b.primary_key ? 1 : 0) -
                                            (a.primary_key ? 1 : 0),
                                    ),
                                    modelInfo: rest,
                                    dragModels: allModelInfos,
                                },
                            })
                            if (node) {
                                dndCase?.current?.start(
                                    node,
                                    e.nativeEvent as any,
                                )
                            }
                        } else {
                            const node = graphCase.current?.createNode({
                                ...MetaModelNodeTemplate,
                                height: HEADER_HEIGHT,
                                width: NODE_WIDTH,
                                data: {
                                    ...MetaModelNodeTemplate.data,
                                    model_id: dataIds[0],
                                    model_type: modelType,
                                    items: fields?.sort(
                                        (a, b) =>
                                            (b.primary_key ? 1 : 0) -
                                            (a.primary_key ? 1 : 0),
                                    ),
                                    modelInfo: rest,
                                },
                            })
                            if (node) {
                                addPort(node, { x: 0, y: 20 }, 'leftPorts')
                                addPort(node, { x: 280, y: 20 }, 'rightPorts')
                                dndCase?.current?.start(
                                    node,
                                    e.nativeEvent as any,
                                )
                            }
                        }
                    }
                } else {
                    const modelInfo = await getModelInfo(dataIds[0])
                    const node = graphCase.current?.createNode({
                        ...ThemeModelNodeTemplate,
                        height: HEADER_HEIGHT,
                        width: NODE_WIDTH,
                        data: {
                            ...ThemeModelNodeTemplate.data,
                            modelInfo,
                            model_type: modelType,
                        },
                    })
                    if (node) {
                        dndCase?.current?.start(node, e.nativeEvent as any)
                    }
                }
            } catch (err) {
                formatError(err)
            }
        }

        /**
         * 上下文值
         */
        const contextValue = useMemo(() => {
            return {
                graphInstance: graphCase.current || null,
                relationData,
                setRelationData,
                viewModel,
            }
        }, [graphCase.current, relationData, setRelationData, viewModel])

        const calculateRelationName = (businessName: string) => {
            // 获取字段在容器中的长度
            const text = document.createElement('div')
            text.textContent = businessName
            text.style.cssText =
                'font-size: 12px; font-weight: normal; width:fit-content; padding:0 8px;'
            document.body.appendChild(text)
            const textWidth = text.offsetWidth
            document.body.removeChild(text)
            return textWidth
        }

        /**
         * 修改关系
         * @param edge 边
         * @param businessName 关系名称
         */
        const handleChangeRelation = (
            edge: Edge,
            businessName: string,
            error: boolean = false,
        ) => {
            if (edge) {
                const textWidth = calculateRelationName(businessName)
                let newBusinessName = businessName
                let width = LINE_BUTTON_MAX_WIDTH
                if (textWidth < LINE_BUTTON_MAX_WIDTH) {
                    width = textWidth
                    newBusinessName = businessName
                } else {
                    width = LINE_BUTTON_MAX_WIDTH
                    const maxLength =
                        textWidth > 0
                            ? Math.ceil(
                                  (LINE_BUTTON_MAX_WIDTH / textWidth) *
                                      businessName.length,
                              ) - 3
                            : businessName.length
                    newBusinessName = Number.isNaN(maxLength)
                        ? businessName
                        : `${(businessName || '').slice(0, maxLength)}...`
                }
                edge.addTools(
                    [
                        {
                            name: 'button',
                            args: {
                                markup: [
                                    {
                                        ...RelationButtonBox,
                                        attrs: {
                                            ...RelationButtonBox.attrs,
                                            stroke: error
                                                ? '#FF4D4F'
                                                : RelationButtonBox.attrs
                                                      .stroke,
                                        },
                                        width,
                                        x: -(width / 2),
                                    },
                                    {
                                        ...RelationButtonText,
                                        attrs: {
                                            ...RelationButtonText.attrs,
                                            fill: error
                                                ? '#FF4D4F'
                                                : RelationButtonText.attrs.fill,
                                        },
                                        textContent: newBusinessName,
                                    },
                                ],
                                distance: '50%',
                                onClick({ view }: { view: EdgeView }) {
                                    if (viewModel === ViewModel.EDIT) {
                                        const currentEdge = view.cell
                                        const relation =
                                            currentEdge.getData()?.relation
                                        const targetPortId =
                                            edge.getTargetPortId()
                                        const targetNode = edge.getTargetNode()
                                        const sourceNode = edge.getSourceNode()
                                        const sourcePortId =
                                            edge.getSourcePortId()
                                        if (
                                            relation &&
                                            targetNode &&
                                            sourceNode
                                        ) {
                                            setEditingRelation({
                                                fromNode: sourceNode,
                                                toNode: targetNode,
                                                edge: currentEdge,
                                            })
                                            setShowConfigRelation(true)
                                        }
                                    }
                                },
                            },
                        },
                        {
                            name: 'tooltip',
                            args: {
                                relation: {
                                    business_name:
                                        edge.getData()?.relation?.business_name,
                                    technical_name:
                                        edge.getData()?.relation
                                            ?.technical_name,
                                    description:
                                        edge.getData()?.relation?.description,
                                },
                            },
                        },
                    ].filter(
                        (item) =>
                            item.name !== 'button-remove' ||
                            viewModel === ViewModel.EDIT,
                    ),
                )
                if (viewModel === ViewModel.EDIT) {
                    edge.toBack()
                } else {
                    edge.toFront()
                }
            }
        }

        const formatRelationModelData = (edges: Edge[]) => {
            return edges
                .map((edge) => {
                    const relation = edge.getData()?.relation
                    const sourceNode = edge.getSourceNode()
                    const targetNode = edge.getTargetNode()
                    if (relation) {
                        return {
                            ...relation,
                            start_display_field_id:
                                sourceNode?.data?.display_filed_id,
                            end_display_field_id:
                                targetNode?.data?.display_filed_id,
                        }
                    }
                    return null
                })
                .filter((relation) => relation)
        }

        /**
         * 检查关系技术名称是否存在
         * @returns 是否存在
         */
        const checkRelationTechnicalNameIsExist = () => {
            if (graphCase.current) {
                const relationsData =
                    graphCase.current
                        ?.getEdges()
                        .map((item) => item.getData()?.relation) || []

                let isExist = false
                relationsData.forEach((item) => {
                    if (!isExist) {
                        const findRelation = relationsData.find((relation) => {
                            return (
                                relation.technical_name ===
                                    item.technical_name &&
                                relation.id !== item.id
                            )
                        })

                        if (findRelation) {
                            isExist = true
                        }
                    }
                })

                return isExist
            }
            return false
        }

        /**
         * 检查节点是否存在显示字段
         * @param allNodes 所有节点
         * @returns 是否存在
         */
        const checkNodesDisplayFieldIsExist = (allNodes: Node[]) => {
            if (graphCase.current) {
                let isExist = true
                allNodes.forEach((node) => {
                    if (!node.data.display_filed_id) {
                        isExist = false
                        node.replaceData({
                            ...node.data,
                            isError: true,
                        })
                    } else {
                        node.replaceData({
                            ...node.data,
                            isError: false,
                        })
                    }
                })
                return isExist
            }
            return false
        }

        /**
         * 保存模型
         */
        const handleSaveModel = async () => {
            try {
                if (graphCase.current) {
                    if (checkRelationTechnicalNameIsExist()) {
                        message.error(__('关联技术名称重复'))
                        return
                    }
                    if (
                        !checkNodesDisplayFieldIsExist(
                            graphCase.current?.getNodes() || [],
                        )
                    ) {
                        message.error(__('当前存在未配置显示字段的节点'))
                        return
                    }
                    const edges = graphCase.current?.getEdges()
                    const allNodes = graphCase.current?.getNodes()
                    const relationsData = formatRelationModelData(edges || [])
                    const graphData = graphCase.current?.toJSON()
                    await updateModel(modelId, {
                        relations: relationsData,
                        all_nodes: allNodes.length
                            ? allNodes.map((item) => {
                                  return {
                                      meta_model_id: item.data.model_id,
                                      display_field_id:
                                          item.data.display_filed_id,
                                  }
                              })
                            : [],
                    })
                    await saveModelGraph({
                        id: modelId,
                        content: JSON.stringify(graphData),
                    })

                    message.success(__('保存成功'))
                    onConfirm()
                }
            } catch (err) {
                formatError(err)
            }
        }

        return (
            <div
                style={{
                    display: 'flex',
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                }}
            >
                <GraphContentProvider value={contextValue}>
                    <X6PortalProvider />
                    <div
                        ref={container}
                        id="container"
                        style={{
                            display: 'flex',
                            width: '100%',
                            height: '100%',
                        }}
                    />
                </GraphContentProvider>

                {initLoading && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(255, 255, 255, 0.65)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Loader />
                    </div>
                )}
                {showConfigRelation && editingRelation && (
                    <ConfigRelation
                        open={showConfigRelation}
                        fromNode={editingRelation.fromNode}
                        toNode={editingRelation.toNode}
                        edge={editingRelation.edge}
                        onConfirm={(relationName: string, edge: Edge) => {
                            handleChangeRelation(edge, relationName)
                            setShowConfigRelation(false)
                            setEditingRelation(null)
                        }}
                        onCancel={() => {
                            setShowConfigRelation(false)
                            setEditingRelation(null)
                        }}
                        graph={graphCase.current || null}
                    />
                )}
            </div>
        )
    },
)

export default GraphContent
