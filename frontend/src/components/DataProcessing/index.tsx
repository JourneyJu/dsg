import { Graph as GraphType, Node, Shape } from '@antv/x6'
import { Dnd } from '@antv/x6-plugin-dnd'
import { useGetState, useSize, useUnmount } from 'ahooks'
import { message } from 'antd'
import { last, noop } from 'lodash'
import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { ExclamationCircleFilled } from '@ant-design/icons'
import {
    checkDataTables,
    completeCollectOrProcess,
    formatError,
    getCanvasProcessing,
    getFirstProcessingTables,
    getFormQueryItem,
    getFormsFieldsList,
    getSourceTables,
    saveFirstProcessingDataTable,
    saveProcessingCanvas,
    saveProcessingDataTable,
    TaskStatus,
} from '@/core'
import { instancingGraph } from '@/core/graph/graph-config'
import { loadPlugins, Plugins } from '@/core/graph/plugin'
import { confirm } from '@/utils/modalHelper'
import formOriginNode from '../DataCollection/FormOriginNode'
import { getNewPastePosition, getPortByNode } from '../DataCollection/helper'
import DragBox from '../DragBox'
import FormQuoteData from '../FormGraph/formDataQuoteData'
import {
    combUrl,
    DataShowSite,
    ExpandStatus,
    getCurrentShowData,
    getDataCurrentPageIndex,
    getDataShowSite,
    getQueryData,
    OptionType,
    wheellDebounce,
} from '../FormGraph/helper'
import GraphToolBar from './GraphToolBar'
import styles from './styles.module.less'

import {
    ProcessingTableDataParams,
    SourceFormInfo,
} from '@/core/apis/businessGrooming/index.d'
import { X6PortalProvider } from '@/core/graph/helper'
import { enBeginNameReg, enBeginNameRegNew } from '@/utils'
import ConfigDataOrigin from '../DataCollection/ConfigDataOrigin'
import { PasteSourceChecked } from '../DataCollection/const'
import ViewPasteFieldDetail from '../DataCollection/ViewPasteFieldDetail'
import ViewPasteFormDetail from '../DataCollection/ViewPasteFormDetail'
import FieldTableView from '../FormGraph/FieldTableView'
import ViewFieldDetail from '../FormGraph/ViewFieldDetail'
import ViewFormDetail from '../FormGraph/ViewFormDetail'
import businessFormNode from './BusinessForm'
import { ViewModel } from './const'
import EditStandardField from './EditStandardField'
import formPasteNode from './FormPasteNode'
import {
    FormBusinessNodeTemplate,
    FormPasteSourceTemplate,
    FormStandardNodeTemplate,
    searchFieldData,
} from './helper'
import __ from './locale'
import SelectPasteSourceMenu from './SelectPasteSourceMenu'
import standardFormNodeRegistry from './StandardForm'

const DataProcessing = () => {
    const graphCase = useRef<GraphType>()
    const dndCase = useRef<Dnd>()
    const graphBody = useRef<HTMLDivElement>(null)
    const bodySize = useSize(graphBody)
    const container = useRef<HTMLDivElement>(null)
    const dndContainer = useRef<HTMLDivElement>(null)
    const navigator = useNavigate()
    const [model, setModel, getModel] = useGetState<ViewModel>(
        ViewModel.ModelEdit,
    )
    const [defaultSize, setDefaultSize] = useState<Array<number>>([15, 85])
    const [formInfo, setFormInfo, getFormInfo] = useGetState<any>(null)
    const [graphSize, setGraphSize] = useState(100)
    const [searchParams, setSearchParams] = useSearchParams()
    const { search } = useLocation()
    const [queryData, setQueryData] = useState<any>(getQueryData(search))
    const fid = searchParams.get('fid') || ''
    const mid = searchParams.get('mid') || ''
    const redirect = searchParams.get('redirect')
    const taskId = searchParams.get('taskId') || ''
    const [formNodeOfBusiness, setFormNodeOfBusiness, getFormNodeOfBusiness] =
        useGetState<Node | null>(null)
    const [standardFormNode, setStandardFormNode, getStandardFormNode] =
        useGetState<Node | null>(null)
    const [editStandardField, setEditStandardField] = useState<any>(null)
    const [editStandardNode, setEditStandardNode] = useState<Node | null>(null)
    const [deleteNode, setDeleteNode] = useState<Node | null>(null)
    const [editDataOriginNode, setEditDataOriginNode] = useState<Node | null>(
        null,
    )
    const [editPasteFormNode, setEditPasteFormNode] = useState<Node | null>(
        null,
    )
    const [viewDataField, setViewDataField] = useState<any>(null)
    const [optionType, setOptionType] = useState<OptionType>(
        OptionType.NoOption,
    )
    const [editBusinessFormId, setEditBusinessFormId] = useState<string>('')
    const [viewBusinessField, setViewBusinessField] = useState<any>(null)
    const [viewTableNode, setViewTableNode] = useState<Node | null>(null)
    const [pasteNodeIds, setPasteNodeIds, getPasteNodeIds] = useGetState<
        Array<string>
    >([])
    const [hasSaved, setHasSaved] = useState<boolean>(false)
    const [defaultMetaForms, setDefaultMetaForms] = useState<
        Array<SourceFormInfo>
    >([])
    const [isCompleted, setIsCompleted] = useState<boolean>(true)
    const [updateDisabled, setUpdateDisabled] = useState<boolean>(false)
    const [dataOriginConfigNode, setDataOriginConfigNode] =
        useState<Node | null>(null)
    const targetNodePortData = useMemo(() => {
        return new FormQuoteData({})
    }, [])
    const pasteNodesPortsData = useMemo(() => {
        return new FormQuoteData({})
    }, [])

    const edgeRelation = useMemo(() => {
        return new FormQuoteData({})
    }, [])

    const getYPosition = (site, index, length) => {
        if (site === 'top') {
            return 56
        }
        if (site === 'bottom') {
            return 56 + length * 40 + 14
        }
        return 56 + index * 40 + 18
    }

    useMemo(() => {
        GraphType.registerPortLayout(
            'formItemLeftPosition',
            (portsPositionArgs) => {
                return portsPositionArgs.map((_, index) => {
                    return {
                        position: {
                            x: 0,
                            y:
                                _.expand === ExpandStatus.Expand
                                    ? getYPosition(_.site, _.index, _.length)
                                    : 28,
                        },
                        zIndex: 10,
                        angle: 0,
                    }
                })
            },
        )
    }, [])
    useMemo(() => {
        GraphType.registerPortLayout(
            'formItemRightPosition',
            (portsPositionArgs) => {
                return portsPositionArgs.map((_, index) => {
                    return {
                        position: {
                            x: 400,
                            y:
                                _.expand === ExpandStatus.Expand
                                    ? getYPosition(_.site, _.index, _.length)
                                    : 28,
                        },
                        zIndex: 10,
                        angle: 0,
                    }
                })
            },
        )
    }, [])

    useMemo(() => {
        GraphType.registerPortLayout(
            'defaultOriginLeftPosition',
            (portsPositionArgs) => {
                return portsPositionArgs.map((_, index) => {
                    return {
                        position: {
                            x: 27,
                            y: 40,
                        },
                        zIndex: 10,
                        angle: 0,
                    }
                })
            },
        )
    }, [])

    useMemo(() => {
        GraphType.registerPortLayout(
            'defaultOriginRightPosition',
            (portsPositionArgs) => {
                return portsPositionArgs.map((_, index) => {
                    return {
                        position: {
                            x: 83,
                            y: 40,
                        },
                        zIndex: 10,
                        angle: 0,
                    }
                })
            },
        )
    }, [])

    const formBusinessNodeName = businessFormNode([
        () => graphCase,
        () => (node: Node) => {
            const standardNode = getStandardFormNode()
            if (standardNode) {
                loadTargetPort(standardNode)
                updateAllPortAndEdge()
            }
        },
        () => optionGraphData,
        () => setViewTableNode,
        () => pasteNodesPortsData,
        () => loadPortsForPasteForm,
        () => model,
        () => edgeRelation,
        () => getStandardFormNode,
    ])
    // 注册目标表节点
    const formTargetNodeName = standardFormNodeRegistry([
        () => graphCase,
        () =>
            (node: Node, needUpdate = true) => {
                if (needUpdate) {
                    loadTargetPort(node)
                    updateAllPortAndEdge()
                }
                setUpdateDisabled(
                    node.data.formInfo.checked !== PasteSourceChecked.New,
                )
            },
        () => optionGraphData,
        () => getFormNodeOfBusiness,
        () => pasteNodesPortsData,
        () => loadPortsForPasteForm,
        () => model,
        () => edgeRelation,
        () => refreshDataTables,
        () => getFormNodeOfBusiness,
        () => (node: Node) => {
            setDataOriginConfigNode(node)
        },
    ])

    const formPasteNodeName = formPasteNode([
        () => graphCase,
        () => model,
        () => (node: Node) => {
            setDataOriginConfigNode(node)
        },
        () => (field) => {
            setViewDataField(field)
            setOptionType(OptionType.ViewPasteFieldInfo)
        },
        () => (node: Node, deleteField?) => {
            loadPortsForPasteForm(node)
            updateAllPortAndEdge()
            if (deleteField) {
                deleteFieldRelation([deleteField])
            }
        },
        () => (node) => {
            if (checkCurrentNodeExistRelation(node)) {
                setDeleteNode(node)
            } else {
                // deleteFieldRelation(node.data.items)
                graphCase?.current?.removeCell(node.id)
            }
        },
        () => (node) => {
            setEditPasteFormNode(node)
            setOptionType(OptionType.ViewPasteFormInfo)
        },
        () => noop,
        () => noop,
        () => edgeRelation,
    ])

    useUnmount(() => {
        if (graphCase && graphCase.current) {
            graphCase.current.dispose()
        }
        GraphType.unregisterPortLayout('formItemRightPosition')
        GraphType.unregisterPortLayout('formItemLeftPosition')
        GraphType.unregisterPortLayout('defaultOriginLeftPosition')
        GraphType.unregisterPortLayout('defaultOriginRightPosition')
    })

    useEffect(() => {
        initEditStatus()
        const graph = instancingGraph(container.current, {
            interacting: true,
            embedding: false,
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
                snap: {
                    radius: 30,
                },
                router: {
                    name: 'er',
                    args: {
                        offset: 25,
                        direction: 'H',
                    },
                },
                createEdge() {
                    return new Shape.Edge({
                        attrs: {
                            line: {
                                stroke: '#979797',
                                strokeWidth: 1,
                            },
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
                    Plugins.Scroller,
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
            loadOriginTable()
            dndCase.current = new Dnd({
                target: graph,
                scaled: false,
                dndContainer: dndContainer.current || undefined,
            })

            graph.on('edge:connected', ({ isNew, edge }) => {
                const sourcePortId = edge.getSourcePortId()
                const targetPortId = edge.getTargetPortId()
                const sourceCell = edge.getSourceNode()
                const targetCell = edge.getTargetNode()
                const sourcPort = sourceCell?.getPort(sourcePortId || '')
                const targetPort = targetCell?.getPort(targetPortId || '')
                if (sourceCell && sourceCell?.shape === formPasteNodeName) {
                    if (targetCell?.shape === formTargetNodeName) {
                        if (targetPortId && sourcePortId) {
                            addTargetSourceId(
                                pasteNodesPortsData.quoteData[sourcePortId]
                                    .fieldId,
                                targetNodePortData.quoteData[targetPortId]
                                    .fieldId,
                                edge,
                                sourceCell.data.items.find(
                                    (item) =>
                                        item.id ===
                                        pasteNodesPortsData.quoteData[
                                            sourcePortId
                                        ].fieldId,
                                ).type,
                                sourceCell.id,
                            )
                        }
                    } else {
                        graph.removeCell(edge.id)
                    }
                } else {
                    graph.removeCell(edge.id)
                }
            })

            graph.on('node:added', ({ node }) => {
                if (node.shape === 'table-paste-node') {
                    loadPortsForPasteForm(node)
                    if (!getPasteNodeIds().includes(node.data.formInfo.id)) {
                        setPasteNodeIds([
                            ...getPasteNodeIds(),
                            node.data.formInfo.id,
                        ])
                    }
                }
            })

            graph.on('node:removed', ({ node }) => {
                if (node.shape === 'table-paste-node') {
                    setPasteNodeIds(
                        getPasteNodeIds().filter(
                            (pasteId) => pasteId !== node.data.formInfo.id,
                        ),
                    )
                }
            })
        }
    }, [])

    useEffect(() => {
        if (deleteNode) {
            if (deleteNode.data.type === 'pasteSource') {
                confirm({
                    title: __('确认要移除数据表吗？'),
                    icon: (
                        <ExclamationCircleFilled style={{ color: '#F5222D' }} />
                    ),
                    content: __(
                        '移除后数据表中字段及其所有映射关系均被删除无法找回，请谨慎操作！',
                    ),
                    okText: __('确认'),
                    cancelText: __('取消'),
                    onOk: () => {
                        deleteFieldRelation(deleteNode.data.items)
                        graphCase?.current?.removeCell(deleteNode.id)
                        setDeleteNode(null)
                    },
                    onCancel: () => {
                        setDeleteNode(null)
                    },
                })
            }
        }
    }, [deleteNode])

    const initEditStatus = () => {
        const querySearch = getQueryData(search)
        if (querySearch?.defaultModel === 'view') {
            if (
                querySearch.taskStatus &&
                querySearch.taskStatus === TaskStatus.COMPLETED
            ) {
                setModel(ViewModel.ModelView)
            } else {
                setModel(ViewModel.Processing)
            }
        } else {
            setModel(ViewModel.ModelEdit)
        }
    }

    const getCollectCompleteStatus = () => {
        if (graphCase && graphCase.current) {
            const pasteNode = graphCase.current
                .getNodes()
                .find((allNode) => allNode.shape === 'table-standard-node')

            setIsCompleted(
                pasteNode?.data?.formInfo.checked !== PasteSourceChecked.New &&
                    !getFormInfo().processing_warn,
            )
        }
    }

    /**
     * 加载目标表
     */
    const loadOriginTable = async () => {
        try {
            if (graphCase?.current) {
                const info = await getFormQueryItem(fid)
                setFormInfo(info)

                const [{ content }, { entries }, { tables }] =
                    await Promise.all([
                        getCanvasProcessing(fid, {
                            version:
                                getModel() === ViewModel.Processing
                                    ? 'published'
                                    : 'draft',
                        }),
                        getFormsFieldsList(fid, {
                            limit: 999,
                            version:
                                getModel() === ViewModel.Processing
                                    ? 'published'
                                    : 'draft',
                        }),
                        getFirstProcessingTables(info.id),
                    ])

                if (content) {
                    setHasSaved(true)
                    const graphDatas = JSON.parse(content)
                    setPasteNodeIds(
                        graphDatas
                            .filter(
                                (graphData) =>
                                    graphData.data.type === 'pasteSource',
                            )
                            .map((graphData) => graphData.data.fid),
                    )
                    await Promise.all(
                        graphDatas.map((graphData) => {
                            if (graphData.data.type === 'business') {
                                return initLoadBusinessForm(
                                    graphData,
                                    entries,
                                    info,
                                )
                            }
                            if (graphData.data.type === 'standard') {
                                return initLoadStandardForm(
                                    graphData,
                                    getModel() === ViewModel.Processing
                                        ? 'published'
                                        : 'draft',
                                    entries,
                                )
                            }
                            if (graphData.data.type === 'pasteSource') {
                                return initLoadPasteForm(graphData, 'published')
                            }
                            return noop
                        }),
                    )

                    if (graphDatas.length > 1) {
                        updateAllPortAndEdge()
                        getCollectCompleteStatus()
                        initDefaultMetaForm()
                    }
                } else {
                    setHasSaved(false)
                    initLoadBusinessForm(
                        {
                            ...FormBusinessNodeTemplate,
                            position: {
                                x: 950,
                                y: 100,
                            },
                        },
                        entries,
                        info,
                    )
                    if (entries.length) {
                        initFirstLoadStandardForm(
                            {
                                ...FormStandardNodeTemplate,
                                position: {
                                    x: 500,
                                    y: 100,
                                },
                            },
                            entries,
                            {
                                checked: PasteSourceChecked.New,
                                description: info.description,
                                id: uuidv4(),
                                name: '',
                            },
                            tables,
                        )
                        if (tables.length) {
                            let countHeight = 0
                            tables.forEach((pasteData, index) => {
                                initLoadQuotePasteForm(
                                    {
                                        ...FormPasteSourceTemplate,
                                        position: {
                                            x: 50,
                                            y: 50 + countHeight + 20,
                                        },
                                    },
                                    pasteData,
                                )
                                countHeight =
                                    pasteData.fields.length * 40 +
                                    56 +
                                    countHeight
                            })
                        }
                        updateAllPortAndEdge()
                    }
                }

                movedToCenter()
            }
        } catch (ex) {
            formatError(ex)
        }
    }

    /**
     * 加载引用表
     */
    const initLoadQuotePasteForm = (template, pasteForm) => {
        try {
            if (graphCase && graphCase.current) {
                const { fields, ...formInfos } = pasteForm
                const pasteNode = graphCase.current.addNode({
                    ...template,
                    data: {
                        ...template.data,
                        offset: 0,
                        expand: ExpandStatus.Expand,
                        items: pasteForm.fields || [],
                        formInfo: formInfos,
                    },
                })
                loadPortsForPasteForm(pasteNode)
            }
        } catch (ex) {
            formatError(ex)
        }
    }

    /**
     * 加载贴原表
     */
    const initLoadPasteForm = async (graphData, version) => {
        try {
            if (graphCase && graphCase.current) {
                const { fields, ...formInfos } = await getSourceTables(
                    graphData.data.fid,
                    {
                        version,
                    },
                )
                const pasteNode = graphCase.current.addNode({
                    ...graphData,
                    data: {
                        ...graphData.data,
                        offset: 0,
                        expand: ExpandStatus.Expand,
                        items: fields || [],
                        formInfo: formInfos,
                        singleSelectedId: '',
                        errorStatus: false,
                        selectedId: [],
                    },
                })
                loadPortsForPasteForm(pasteNode)
            }
        } catch (ex) {
            formatError(ex)
        }
    }
    /**
     * 贴原表建桩
     */
    const loadPortsForPasteForm = (node: Node) => {
        node.removePorts()
        // addPasteNodeFormPort(node)
        updateDataOriginReletion(node)
        clearPastePortRecord(node)
        const site = formNodeOfBusiness
            ? getPastePosition(node, formNodeOfBusiness)
            : 'rightPorts'
        const showData = getCurrentShowData(
            node.data.offset,
            node.data.items,
            10,
        )
        showData.forEach((item, index) => {
            if (node.data.expand === ExpandStatus.Retract) {
                const portId = getOriginNodeHeaderPorts(node, site)
                if (!portId) {
                    node.addPort(getPortByNode(site, -1, '', node.data.expand))
                    addPasteNodePortData(
                        last(node.getPorts())?.id,
                        node.id,
                        item.id,
                    )
                } else {
                    addPasteNodePortData(portId, node.id, item.id)
                }
            } else {
                node.addPort(getPortByNode(site, index))
                addPasteNodePortData(
                    last(node.getPorts())?.id,
                    node.id,
                    item.id,
                )
            }
        })
    }

    /**
     * 清除制定贴原表的数据
     */
    const clearPastePortRecord = (node: Node) => {
        Object.keys(pasteNodesPortsData.quoteData).forEach((portId) => {
            if (pasteNodesPortsData.quoteData[portId].nodeId === node.id) {
                pasteNodesPortsData.deleteData(portId)
            }
        })
    }

    /**
     *  更新数据源的关系
     */
    const updateDataOriginReletion = (pasteNode: Node) => {
        if (pasteNode.data.infoId && graphCase.current) {
            const allNodes = graphCase.current.getNodes()
            const originNode = allNodes.find(
                (allNode) =>
                    allNode.data.type === 'dataOrigin' &&
                    allNode.data.dataInfo.id === pasteNode.data.infoId,
            )
            const site = originNode
                ? getPastePosition(originNode, pasteNode)
                : 'rightPorts'
            const originsPort = originNode
                ? originNode.getPorts().find((port) => port.group === site)
                : null
            const pastePort = pasteNode
                .getPorts()
                .find(
                    (port) => port.group !== site && port.args?.type === 'form',
                )
            if (originsPort && pastePort) {
                const edge = new Shape.Edge({
                    source: {
                        cell: originNode?.id,
                        port: originsPort.id,
                    },
                    target: {
                        cell: pasteNode.id,
                        port: pastePort.id,
                    },

                    attrs: {
                        line: {
                            stroke: '#979797',
                            strokeWidth: 1,
                        },
                    },
                })
                graphCase.current.addEdge(edge)
            }
        }
    }

    /**
     * 当前贴原表基于目标表的位置
     */
    const getPastePosition = (node: Node, targetNode: Node) => {
        const { x, y } = node.getPosition()
        if (targetNode) {
            const targetNodeSite = targetNode.getPosition()
            if (x > targetNodeSite.x) {
                return 'leftPorts'
            }
        }
        return 'rightPorts'
    }

    /**
     * 更新贴原表数据
     */
    const addPasteNodePortData = (portId, nodeId, fieldId) => {
        if (portId) {
            pasteNodesPortsData.addData({
                [portId]: {
                    nodeId,
                    fieldId,
                },
            })
        }
    }

    /**
     * 加载目标表数据
     * @param targetNodeData 目标表
     * @param itemsData 数据
     */
    const initLoadBusinessForm = (targetNodeData, itemsData, info) => {
        try {
            if (graphCase?.current) {
                const targetNode = graphCase.current.addNode({
                    ...targetNodeData,
                    data: {
                        ...targetNodeData.data,
                        expand: ExpandStatus.Expand,
                        fid,
                        mid,
                        offset: 0,
                        items: itemsData.map((itemData, index) => {
                            const {
                                created_at,
                                created_by,
                                updated_at,
                                updated_by,
                                ...restData
                            } = itemData
                            return {
                                ...restData,
                            }
                        }),
                        formInfo: info,
                        singleSelectedId: '',
                        keyWord: '',
                    },
                })
                setFormNodeOfBusiness(targetNode)
            }
        } catch (ex) {
            formatError(ex)
        }
    }

    const initFirstLoadStandardForm = (
        targetNodeData,
        itemsData,
        info,
        tables,
    ) => {
        try {
            if (graphCase?.current) {
                const targetNode = graphCase.current.addNode({
                    ...targetNodeData,
                    data: {
                        ...targetNodeData.data,
                        expand: ExpandStatus.Expand,
                        fid,
                        mid,
                        offset: 0,
                        items: itemsData.map((itemData, index) => {
                            return {
                                id: itemData.id,
                                name: itemData.name_en,
                                field_precision:
                                    getDefaultType(
                                        itemData.data_type,
                                        itemData.data_length,
                                    ) === 'decimal'
                                        ? itemData.data_accuracy || 0
                                        : null,
                                length:
                                    itemData.data_length === 0
                                        ? null
                                        : itemData.data_length,
                                type: getDefaultType(
                                    itemData.data_type,
                                    itemData.data_length,
                                ),
                                processing_source_id: hasProcessedPasteFieldId(
                                    itemData.ref_id,
                                    tables,
                                )
                                    ? [itemData.ref_id]
                                    : [],
                            }
                        }),
                        formInfo: info,
                        singleSelectedId: '',
                    },
                })
                setStandardFormNode(targetNode)
                targetNode.removePorts()
                loadTargetPort(targetNode)
            }
        } catch (ex) {
            formatError(ex)
        }
    }

    const hasProcessedPasteFieldId = (refId, tables): boolean => {
        return !!tables.find((table) =>
            table.fields.find((field) => field.id === refId),
        )
    }

    const initLoadStandardForm = async (graphData, version, entries) => {
        try {
            if (graphCase && graphCase.current) {
                const { fields, ...formInfos } = await getSourceTables(
                    graphData.data.fid,
                    {
                        version,
                    },
                )
                setUpdateDisabled(formInfos.checked !== PasteSourceChecked.New)
                const targetNode = graphCase.current.addNode({
                    ...graphData,
                    data: {
                        ...graphData.data,
                        offset: 0,
                        expand: ExpandStatus.Expand,
                        items: checkUpdateStandardFields(entries, fields),
                        formInfo: formInfos,
                        singleSelectedId: '',
                        errorStatus: false,
                        errorFieldsId: [],
                    },
                })
                setStandardFormNode(targetNode)
                targetNode.removePorts()
                loadTargetPort(targetNode)
            }
        } catch (ex) {
            formatError(ex)
        }
    }

    /**
     *  检查更新业务表
     * @param businessFields
     * @param standardFields
     * @param tables
     * @returns
     */
    const checkUpdateStandardFields = (businessFields, standardFields) => {
        const standardMapData = standardFields.reduce(
            (preData, standardField) => {
                return {
                    ...preData,
                    [standardField.id]: standardField,
                }
            },
            {},
        )
        return businessFields.reduce((preData, businessField) => {
            const existStandardField = standardMapData[businessField.id]
            if (existStandardField) {
                return [
                    ...preData,
                    {
                        ...existStandardField,
                        name: businessField.name_en,
                        length:
                            businessField.data_length === 0
                                ? null
                                : businessField.data_length,
                        field_precision:
                            getDefaultType(
                                businessField.data_type,
                                businessField.data_length,
                            ) === 'decimal'
                                ? businessField.data_accuracy || 0
                                : null,
                        type: getNewStandardType(
                            businessField.data_type,
                            businessField.data_length,
                            existStandardField.type,
                        ),
                    },
                ]
            }
            return [
                ...preData,
                {
                    id: businessField.id,
                    name: businessField.name_en,
                    field_precision:
                        getDefaultType(
                            businessField.data_type,
                            businessField.data_length,
                        ) === 'decimal'
                            ? businessField.data_accuracy || 0
                            : null,
                    length:
                        businessField.data_length === 0
                            ? null
                            : businessField.data_length,
                    type: getDefaultType(
                        businessField.data_type,
                        businessField.data_length,
                    ),
                    processing_source_id: [],
                },
            ]
        }, [])
    }

    const getNewStandardType = (businessType, businessLength, standardType) => {
        const numberType = [
            'tinyint',
            'smallint',
            'int',
            'bigint',
            'float',
            'double',
        ]
        switch (true) {
            case getDefaultType(businessType, businessLength) === standardType:
                return standardType
            case standardType === 'char' && businessLength > 255:
                return getDefaultType(businessType, businessLength)
            case numberType.includes(standardType) &&
                getDefaultType(businessType, businessLength) === 'int':
                return standardType
            default:
                return getDefaultType(businessType, businessLength)
        }
    }

    const getDefaultType = (data_type, length) => {
        switch (data_type) {
            case 'char':
                if (length) {
                    return 'varchar'
                }
                return 'string'
            case 'number':
                if (length) {
                    return 'decimal'
                }
                return 'int'
            case 'bool':
                return 'boolean'
            case 'date':
                return 'date'
            case 'datetime':
                return 'datetime'
            case 'timestamp':
                return 'timestamp'
            case 'binary':
                return 'binary'
            default:
                return ''
        }
    }

    const loadTargetPort = (node: Node) => {
        node.removePorts()
        targetNodePortData.clearData()
        const showData = getCurrentShowData(
            node.data.offset,
            searchFieldData(node.data.items, node.data.keyWord),
            10,
        )

        showData.forEach((item, index) => {
            if (node.data.expand === ExpandStatus.Retract) {
                const portLeftId = getOriginNodeHeaderPorts(node, 'leftPorts')
                const portRightId = getOriginNodeHeaderPorts(node, 'rightPorts')
                if (!portLeftId) {
                    node.addPort(
                        getPortByNode('leftPorts', -1, '', node.data.expand),
                    )
                    addTargetNodePortData(
                        last(node.getPorts())?.id,
                        node.id,
                        item.id,
                        'leftPorts',
                    )
                } else {
                    addTargetNodePortData(
                        portLeftId,
                        node.id,
                        item.id,
                        'leftPorts',
                    )
                }
                if (!portRightId) {
                    node.addPort(
                        getPortByNode('rightPorts', -1, '', node.data.expand),
                    )
                    addTargetNodePortData(
                        last(node.getPorts())?.id,
                        node.id,
                        item.id,
                        'rightPorts',
                    )
                } else {
                    addTargetNodePortData(
                        portLeftId,
                        node.id,
                        item.id,
                        'rightPorts',
                    )
                }
            } else {
                node.addPort(getPortByNode('leftPorts', index))
                addTargetNodePortData(
                    last(node.getPorts())?.id,
                    node.id,
                    item.id,
                    'leftPorts',
                )
                node.addPort(getPortByNode('rightPorts', index))
                addTargetNodePortData(
                    last(node.getPorts())?.id,
                    node.id,
                    item.id,
                    'rightPorts',
                )
            }
        })
    }

    const addTargetNodePortData = (portId, nodeId, fieldId, site) => {
        if (portId) {
            targetNodePortData.addData({
                [portId]: {
                    nodeId,
                    fieldId,
                    site,
                },
            })
        }
    }
    /**
     * 缩放画布
     * @param multiple  缩放大小
     */
    const changeGraphSize = (multiple: number) => {
        setGraphSize(multiple * 100)
        graphCase.current?.zoomTo(multiple)
    }

    /**
     * 展示所有画布内容
     */
    const showAllGraphSize = () => {
        if (graphCase.current) {
            graphCase.current.zoomToFit({ padding: 24 })
            const multiple = graphCase.current.zoom()
            const showSize = Math.round(multiple * 100)
            setGraphSize(showSize - (showSize % 5))
            return multiple
        }
        return 100
    }

    /**
     * 画布定位到中心
     */
    const movedToCenter = () => {
        graphCase.current?.centerContent()
    }
    /**
     * 增加原Id
     */
    const addTargetSourceId = (
        sourceId,
        targetId,
        edge,
        pasteType,
        pasteNodeId,
    ) => {
        let errorFieldsId = getStandardFormNode()?.data.errorFieldsId
        const newItems = getStandardFormNode()?.data.items.map((item) => {
            if (item.id === targetId) {
                if (checkFieldStandardStatus(item)) {
                    graphCase?.current?.removeCell(edge.id)
                    return item
                }
                edgeRelation.addData({
                    [sourceId]: edge,
                })
                if (errorFieldsId.length) {
                    errorFieldsId = errorFieldsId.filter(
                        (errorFieldId) => errorFieldId !== item.id,
                    )
                }
                return {
                    ...item,
                    processing_source_id: [
                        ...item.processing_source_id,
                        sourceId,
                    ],
                }
            }
            return item
        })

        getStandardFormNode()?.replaceData({
            ...getStandardFormNode()?.data,
            items: newItems,
            errorFieldsId,
        })
    }

    const checkFieldStandardStatus = (checkingField) => {
        const businessNode = getFormNodeOfBusiness()
        const fields = businessNode?.data?.items || []
        const findFields = fields.find((filed) => filed.id === checkingField.id)
        if (findFields) {
            if (findFields) {
                return (
                    findFields.is_standardization_required &&
                    findFields.standard_status !== 'normal'
                )
            }
        }
        return false
    }

    /**
     * 更新所有表格port和连线
     */
    const updateAllPortAndEdge = () => {
        if (graphCase?.current) {
            const allNodes = graphCase.current.getNodes()
            edgeRelation.clearData()
            if (allNodes.length > 1) {
                const businessNode = allNodes.filter(
                    (allNode) => allNode.data.type === 'business',
                )[0]
                const standardNode = allNodes.filter((allNode) => {
                    return allNode.data.type === 'standard'
                })[0]
                const pasteNodes = allNodes.filter((allNode) => {
                    return allNode.data.type === 'pasteSource'
                })
                setStandardAndBusinessRelative(businessNode, standardNode)
                if (pasteNodes.length) {
                    setQuoteKeyRelative(pasteNodes, standardNode)
                }
            }
        }
    }

    /**
     * 设置标准表和业务表连线关系
     * @param businessNode
     * @param standardNode
     */
    const setStandardAndBusinessRelative = (businessNode, standardNode) => {
        const businessNodeData = searchFieldData(
            businessNode.data.items,
            businessNode.data.keyWord,
        )
        const standardNodeData = searchFieldData(
            standardNode.data.items,
            standardNode.data.keyWord,
        )
        businessNode.removePorts()
        businessNodeData.forEach((item, index) => {
            if (
                standardNodeData.find(
                    (standardDataItem) => standardDataItem.id === item.id,
                )
            ) {
                createRelativeByNode(standardNode, businessNode, item, index)
            }
        })
    }

    /**
     * 查找目标字段
     */
    const setQuoteKeyRelative = (originNodes, targetNode) => {
        const targetSearchData = searchFieldData(
            targetNode.data.items,
            targetNode.data.keyWord,
        )
        targetSearchData.forEach((item, index) => {
            if (item.processing_source_id.length) {
                const pasteNodeFindeds = item.processing_source_id.map(
                    (source_id) => {
                        return originNodes.find((originNode) => {
                            return originNode.data.items.find((originItem) => {
                                if (source_id === originItem.id) {
                                    return true
                                }
                                return false
                            })
                        })
                    },
                )

                if (pasteNodeFindeds.length) {
                    pasteNodeFindeds.forEach(
                        (pasteNodeFinded, findedsIndex) => {
                            createRelativeByNode(
                                pasteNodeFinded,
                                targetNode,
                                item,
                                index,
                                item.processing_source_id[findedsIndex],
                            )
                        },
                    )
                }
            }
        })
    }

    /**
     * 创建节点关系
     * @param originNode 源节点
     * @param targetNode 目标节点
     * @param item 数据项
     * @param index 数据项下标
     */
    const createRelativeByNode = (
        originNode,
        targetNode,
        item,
        index,
        source_id?,
    ) => {
        const { origin, target } = getOriginPosition(originNode, targetNode)
        let targetNodeItemPortInfo
        if (targetNode.data.expand === ExpandStatus.Retract) {
            const portId = getOriginNodeHeaderPorts(targetNode, target)
            if (portId) {
                targetNodeItemPortInfo = {
                    portId,
                    nodeId: targetNode.id,
                }
            } else {
                targetNode.addPort(
                    getPortByNode(target, -1, '', targetNode.data.expand),
                )
            }
        } else {
            targetNodeItemPortInfo = getNodeItemPortId(
                targetNode,
                index,
                target,
                10,
                item,
            )
        }
        if (originNode.data.expand === ExpandStatus.Expand) {
            if (targetNode.data.type === 'business') {
                const pasteNodeItemPortInfo = getPasteNodePort(
                    originNode,
                    item.id,
                    origin,
                )
                addEdgeFromOriginToTarget(
                    item.id,
                    targetNode,
                    targetNodeItemPortInfo?.portId || '',
                    originNode,
                    pasteNodeItemPortInfo?.portId || '',
                )
            } else {
                const pasteNodeItemPortInfo = getPasteNodePort(
                    originNode,
                    source_id,
                    origin,
                )
                addEdgeFromOriginToTarget(
                    source_id,
                    targetNode,
                    targetNodeItemPortInfo?.portId || '',
                    originNode,
                    pasteNodeItemPortInfo?.portId || '',
                )
            }
        } else if (targetNode.data.type === 'business') {
            const portId = getOriginNodeHeaderPorts(originNode, origin)

            if (portId) {
                addEdgeFromOriginToTarget(
                    item.id,
                    targetNode,
                    targetNodeItemPortInfo?.portId,
                    originNode,
                    portId,
                )
            } else {
                const originNodeItemPortId = getPasteNodePort(
                    originNode,
                    item.id,
                    origin,
                    ExpandStatus.Retract,
                )
                addEdgeFromOriginToTarget(
                    item.id,
                    targetNode,
                    targetNodeItemPortInfo?.portId,
                    originNode,
                    originNodeItemPortId,
                )
            }
        } else {
            const portId = getOriginNodeHeaderPorts(originNode, origin)

            if (portId) {
                addEdgeFromOriginToTarget(
                    source_id,
                    targetNode,
                    targetNodeItemPortInfo?.portId,
                    originNode,
                    portId,
                )
            } else {
                const originNodeItemPortId = getPasteNodePort(
                    originNode,
                    source_id,
                    origin,
                    ExpandStatus.Retract,
                )
                addEdgeFromOriginToTarget(
                    source_id,
                    targetNode,
                    targetNodeItemPortInfo?.portId,
                    originNode,
                    originNodeItemPortId,
                )
            }
        }
    }

    /**
     *  获取左右头的桩
     */
    const getOriginNodeHeaderPorts = (originNode: Node, position) => {
        const originNodePorts = originNode.getPorts()
        let portId
        originNodePorts.forEach((originNodePort) => {
            if (
                originNodePort.group === position &&
                originNodePort.args?.type !== 'form'
            ) {
                portId = originNodePort.id || ''
            } else {
                portId = ''
            }
        })
        return portId
    }

    /**
     * 设置原节点的桩
     */
    const getPasteNodePort = (
        originNode,
        refId: string,
        position: string,
        expand: ExpandStatus = ExpandStatus.Expand,
    ) => {
        let portInfo
        const searchData = searchFieldData(
            originNode.data.items,
            originNode.data.keyWord,
        )
        searchData.forEach((originItem, index) => {
            if (originItem.id === refId) {
                if (expand === ExpandStatus.Retract) {
                    originNode.addPort(getPortByNode(position, -1, '', expand))
                } else {
                    portInfo = getNodeItemPortId(
                        originNode,
                        index,
                        position,
                        10,
                        originItem,
                    )
                }
            }
        })
        return portInfo
    }

    /**
     * 获取当前节点的portId
     * @param node 节点
     * @param index 当前下标
     * @param group port位置
     * @param limit 每页大小
     * @returns portId 找到返回对应id ，没找到生成port并返回''
     */
    const getNodeItemPortId = (node, index, group, limit, item) => {
        const itemSite = getDataShowSite(
            index,
            node.data.offset,
            limit,
            node.data.items.length,
        )
        if (itemSite === DataShowSite.CurrentPage) {
            if (node.data.type === 'business') {
                const currentIndex = getDataCurrentPageIndex(
                    index,
                    node.data.offset,
                    limit,
                    node.data.items.length,
                )
                setBusinessNodePort(node, currentIndex, group)
                return undefined
            }
            if (node.data.type === 'standard') {
                return findOriginNodeAndPort(item.id, group)
            }
            return findPasteNodeAndPort(item.id)
        }
        if (itemSite === DataShowSite.UpPage) {
            const portId = getUpPortId(group, node)
            if (portId) {
                return {
                    portId,
                    nodeId: node.id,
                }
            }
            node.addPort(getPortByNode(group, -1, 'top'))
            return undefined
        }

        const portId = getDownPort(group, node)
        if (portId) {
            return {
                portId,
                nodeId: node.id,
            }
        }
        const showData = getCurrentShowData(
            node.data.offset,
            searchFieldData(node.data.items, node.data.keyWord),
            10,
        )
        node.addPort(
            getPortByNode(
                group,
                -1,
                'bottom',
                ExpandStatus.Expand,
                'field',
                showData.length,
            ),
        )
        return undefined
    }

    /**
     * 设置业务表节点的桩
     * @param targetNode 目标节点
     * @param index 下标
     * @param position 左右位置
     * @param site 顶部位置
     */
    const setBusinessNodePort = (targetNode, index, position, site?) => {
        targetNode.addPort(
            getPortByNode(
                position,
                index,
                'target',
                ExpandStatus.Expand,
                site || '',
            ),
        )
    }

    /**
     * 获取头部对应位置的坐标
     * @param group 位置
     * @param node 节点
     * @returns 坐标 找到返回对应节点 ，找不到返回头坐标
     */
    const getUpPortId = (group, node) => {
        const currentPort = node
            .getPorts()
            .filter((port) => port.args?.site === 'top' && port.group === group)
        if (currentPort && currentPort.length) {
            return currentPort[0].id
        }
        return ''
    }

    /**
     * 获取底部对应位置的坐标
     * @param group 位置
     * @param node 节点
     * @returns 坐标 找到返回对应节点 ，找不到返回头坐标
     */
    const getDownPort = (group, node) => {
        const currentPort = node
            .getPorts()
            .filter(
                (port) => port.args?.site === 'bottom' && port.group === group,
            )
        if (currentPort && currentPort.length) {
            return currentPort[0].id
        }
        return ''
    }
    /**
     * 获取原节点的方位
     */
    const getOriginPosition = (orginNode: Node, targetNode: Node) => {
        const orginNodePosition = orginNode.getPosition()
        const targetNodePosition = targetNode.getPosition()
        if (orginNodePosition.x > targetNodePosition.x) {
            return {
                origin: 'leftPorts',
                target: 'rightPorts',
            }
        }
        return {
            origin: 'rightPorts',
            target: 'leftPorts',
        }
    }
    /**
     * 查找当前标的节点ID 和portID
     * @param sourceId
     * @returns
     */
    const findPasteNodeAndPort = (sourceId: string) => {
        const portId = Object.keys(pasteNodesPortsData.quoteData).find(
            (value) => {
                return pasteNodesPortsData.quoteData[value].fieldId === sourceId
            },
        )
        if (portId) {
            return {
                portId,
                nodeId: pasteNodesPortsData.quoteData[portId],
            }
        }
        return undefined
    }

    /**
     * 查找当前目标表的节点ID 和portID
     * @param sourceId
     * @returns
     */
    const findOriginNodeAndPort = (sourceId: string, site: string) => {
        const portId = Object.keys(targetNodePortData.quoteData).find(
            (value) => {
                return (
                    targetNodePortData.quoteData[value].fieldId === sourceId &&
                    targetNodePortData.quoteData[value].site === site
                )
            },
        )
        if (portId) {
            return {
                portId,
                nodeId: targetNodePortData.quoteData[portId],
            }
        }
        return undefined
    }

    /**
     * 添加连线
     * @param targetNode 目标节点
     * @param targetPortId 目标桩
     * @param originNode 源节点
     * @param OriginPortId 源桩
     */
    const addEdgeFromOriginToTarget = (
        originItemId,
        targetNode: Node,
        targetNodePortId: string,
        originNode: Node,
        originNodePortId: string = '',
    ) => {
        if (graphCase && graphCase.current) {
            const originNodePort = last(originNode.getPorts())
            const targetNodePort = last(targetNode.getPorts())

            if (
                originNodePort &&
                originNodePort.id &&
                targetNodePort &&
                targetNodePort.id
            ) {
                if (
                    edgeRelation.selected &&
                    edgeRelation.selected === originItemId
                ) {
                    const edge = new Shape.Edge({
                        source: {
                            cell: originNode.id,
                            port: originNodePortId || originNodePort.id,
                        },
                        target: {
                            cell: targetNode.id,
                            port: targetNodePortId || targetNodePort.id,
                        },
                        attrs: {
                            line: {
                                stroke: '#126ee3',
                                strokeWidth: 1,
                            },
                        },
                    })

                    edgeRelation.addData({
                        [originItemId]: graphCase.current.addEdge(edge),
                    })
                } else {
                    const edge = new Shape.Edge({
                        source: {
                            cell: originNode.id,
                            port: originNodePortId || originNodePort.id,
                        },
                        target: {
                            cell: targetNode.id,
                            port: targetNodePortId || targetNodePort.id,
                        },
                        attrs: {
                            line: {
                                stroke: '#979797',
                                strokeWidth: 1,
                            },
                        },
                    })
                    edgeRelation.addData({
                        [originItemId]: graphCase.current.addEdge(edge),
                    })
                }
            }
        }
    }

    /**
     * 操作触发事件
     * @param optionType
     * @param data
     * @param dataNode
     */
    const optionGraphData = (currentOptionType: OptionType, data, dataNode) => {
        setOptionType(currentOptionType)
        switch (currentOptionType) {
            case OptionType.ViewOriginFormDetail:
                setEditBusinessFormId(dataNode.data.fid)
                break
            case OptionType.ViewOriginFieldDetail:
                setViewBusinessField(data)
                break

            case OptionType.EditStandardField:
                setEditStandardField(data)
                setEditStandardNode(dataNode)
                break
            case OptionType.ViewPasteFieldInfo:
                setViewDataField(data)
                break

            default:
                break
        }
    }

    /**
     * 删除原表的字段关系
     */
    const deleteFieldRelation = (sourcesData) => {
        const formNode = getStandardFormNode()
        if (formNode) {
            const newItems = formNode.data.items.map((item) => {
                if (!item.processing_source_id.length) {
                    return item
                }
                return {
                    ...item,
                    processing_source_id: item.processing_source_id.filter(
                        (id) =>
                            !sourcesData.find(
                                (sourceData) => sourceData.id === id,
                            ),
                    ),
                }
            })
            formNode.replaceData({
                ...formNode.data,
                items: newItems,
                formInfo: {
                    ...formNode.data.formInfo,
                    checked: PasteSourceChecked.New,
                },
            })
            setUpdateDisabled(false)
        }
    }

    /**
     * 拖拽来源表
     * @param e 事件
     */
    const startDrag = async (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        pasteData:
            | SourceFormInfo
            | {
                  id: string
                  name: string
              },
    ) => {
        let pasteFormInfos
        if (pasteData && Object.keys(pasteData).includes('metadata_table_id')) {
            pasteFormInfos = pasteData
        } else {
            pasteFormInfos = await getSourceTables(pasteData.id, {
                version: 'published',
            })
        }
        const { fields, ...formInfos } = pasteFormInfos
        const node = graphCase?.current?.createNode({
            ...FormPasteSourceTemplate,
            height: 52 + (fields.length > 10 ? 400 : fields.length * 40) + 24,
            data: {
                ...FormPasteSourceTemplate.data,
                items: fields,
                formInfo: formInfos,
            },
        })
        if (node) {
            dndCase?.current?.start(node, e.nativeEvent as any)
        }
    }

    /**
     * 画布中加入元数据平台贴源表
     * @param sourceForms
     */
    const addMetaDataSourceTable = (sourceForms: Array<SourceFormInfo>) => {
        if (graphCase && graphCase.current) {
            const allNodes = graphCase.current.getNodes()
            const nodes = allNodes.filter(
                (allNode) => allNode.shape !== 'data-origin-node',
            )
            const center = {
                x: (bodySize?.width || 1300) / 2,
                y: ((bodySize?.height || 800) - 200) / 2,
            }
            const centerLocal = graphCase.current.clientToLocal(center)
            let currentPosition
            sourceForms.forEach(({ fields, ...formInfos }, index) => {
                currentPosition = getNewPastePosition(
                    nodes,
                    centerLocal,
                    currentPosition,
                )
                if (graphCase && graphCase.current) {
                    graphCase.current.addNode({
                        ...FormPasteSourceTemplate,
                        position: currentPosition,
                        data: {
                            ...FormPasteSourceTemplate.data,
                            formInfo: formInfos,
                            items: fields,
                            expand: ExpandStatus.Retract,
                        },
                    })
                }
            })
            setPasteNodeIds([
                ...getPasteNodeIds(),
                ...sourceForms.map((sourceForm) => sourceForm.id),
            ])
        }
    }

    /**
     * 保存加工模型
     */
    const handleSaveGraph = async (
        action: 'saving' | 'publishing' = 'saving',
    ) => {
        if (graphCase && graphCase.current) {
            if (action === 'saving') {
                const standardNode = getStandardFormNode()
                const standardFormFields = standardNode?.data.items || []
                const getRepeatNameData = getRepeatData(standardFormFields)
                if (
                    standardNode &&
                    (!standardNode.data.formInfo.name ||
                        !enBeginNameReg.test(standardNode.data.formInfo.name))
                ) {
                    message.error('数据表名称为空或者不合法')
                    return
                }
            }

            try {
                const allNodes = graphCase.current.getNodes()
                const graphData = graphCase.current.toJSON()
                const content = JSON.stringify(
                    graphData.cells
                        .filter((cell) => cell.shape !== 'edge')
                        .map((cell) => ({
                            ...cell,
                            data:
                                cell.data.type === 'standard' ||
                                cell.data.type === 'pasteSource'
                                    ? {
                                          fid:
                                              cell.data.formInfo?.id ||
                                              cell.data.formInfo?.fid,
                                          type: cell.data.type,
                                          infoId: cell.data.infoId,
                                          version:
                                              cell.data.type === 'standard' &&
                                              action === 'saving'
                                                  ? 'draft'
                                                  : 'published',
                                      }
                                    : {
                                          fid:
                                              cell.data.formInfo?.id ||
                                              cell.data.formInfo?.fid,
                                          type: cell.data.type,
                                      },
                        })),
                )
                const params: ProcessingTableDataParams = {
                    action,
                    map_table: {
                        ...getStandardFormNode()?.data.formInfo,
                        fields: getStandardFormNode()?.data.items || [],
                    },

                    source_tables: allNodes
                        .filter(
                            (allNode) => allNode.shape === 'table-paste-node',
                        )
                        .map((allNode) => ({
                            ...allNode.data.formInfo,
                            fields: allNode.data.items,
                        })),
                    task_id: taskId,
                }
                if (hasSaved) {
                    await saveProcessingDataTable(fid, params)
                } else {
                    await saveFirstProcessingDataTable(fid, params)
                }
                await saveProcessingCanvas(fid, {
                    action,
                    content,
                    task_id: taskId,
                })
                navigator(combUrl(queryData))

                if (action === 'saving') {
                    message.success(__('保存成功'))
                } else {
                    message.success(
                        formInfo.collection_published
                            ? __('更新成功')
                            : __('发布成功'),
                    )
                }
            } catch (ex) {
                formatError(ex)
            }
        }
    }

    /**
     * 发布
     */
    const handlePublishGraph = async () => {
        if (graphCase && graphCase.current) {
            try {
                const allNodes = graphCase.current.getNodes()
                if (
                    !checkPublishContent(
                        allNodes.filter(
                            (allNode) => allNode.shape === 'table-paste-node',
                        ),
                    )
                ) {
                    return
                }
                handleSaveGraph('publishing')
            } catch (ex) {
                formatError(ex)
            }
        }
    }

    const checkPublishContent = (allPasteNodes) => {
        const bussinessNode = getFormNodeOfBusiness()
        const businessFormFields = bussinessNode?.data.items || []
        const standardNode = getStandardFormNode()
        const standardFormFields = standardNode?.data.items || []
        const unStanadardFields = businessFormFields.filter(
            (businessFormField) =>
                businessFormField.is_standardization_required &&
                businessFormField.standard_status !== 'normal',
        )

        const unProcessingFields = standardFormFields.filter(
            (businessFormField) =>
                !businessFormField.processing_source_id.length,
        )
        const getRepeatNameData = getRepeatData(standardFormFields)

        const usedFieldsId = standardFormFields
            .map(
                (currentBusinessField) =>
                    currentBusinessField.processing_source_id,
            )
            .flat()
        const notUsedPasteForm = allPasteNodes.filter(
            (singleNodeForm) =>
                !singleNodeForm.data.items.find((singlePasteField) =>
                    usedFieldsId.includes(singlePasteField.id),
                ),
        )

        if (
            standardNode &&
            (!standardNode.data.formInfo.name ||
                !enBeginNameRegNew.test(standardNode.data.formInfo.name))
        ) {
            message.error('数据表名称不存在或者不合法')
            return false
        }

        if (standardNode && !standardNode.data.formInfo.datasource_id) {
            message.error('存在数据表未配置数据源')
            return false
        }
        if (unStanadardFields.length) {
            standardNode?.replaceData({
                ...standardNode.data,
                errorFieldsId: unStanadardFields.map(
                    (unStanadardField) => unStanadardField.id,
                ),
            })
            message.error('存在未标准化字段，请先进行标准化')
            return false
        }

        if (getRepeatNameData.length) {
            standardNode?.replaceData({
                ...standardNode.data,
                errorFieldsId: getRepeatNameData,
            })
            message.error('字段存在同名，请去业务表修改英文名')
            return false
        }
        if (unProcessingFields.length) {
            standardNode?.replaceData({
                ...standardNode.data,
                errorFieldsId: unProcessingFields.map(
                    (unProcessingField) => unProcessingField.id,
                ),
            })
            message.error('数据表中存在字段未配置映射关系')
            return false
        }
        if (notUsedPasteForm.length) {
            message.error(__('存在未使用的数据表'))
            notUsedPasteForm.forEach((pasteNode) => {
                pasteNode.replaceData({
                    ...pasteNode.data,
                    errorStatus: true,
                })
            })
            return false
        }
        return true
    }

    /**
     * 获取重复数据
     * @param standardData
     * @returns
     */
    const getRepeatData = (standardData) => {
        let repeatDataIds: Array<string> = []
        standardData.forEach((singleData) => {
            const repeatData = standardData.find(
                (currentData) =>
                    currentData.id !== singleData.id &&
                    currentData.name === singleData.name,
            )
            if (repeatData) {
                repeatDataIds = [...repeatDataIds, singleData.id]
            }
        })
        return repeatDataIds
    }
    /**
     * 刷新图
     */
    const refreshDataTables = async (
        pasteNode: Node,
        isOptionComplete = false,
    ) => {
        if (taskId) {
            try {
                const result = (
                    await checkDataTables({
                        ids: [pasteNode.data.formInfo.id],
                        task_id: taskId,
                    })
                )[0]
                pasteNode.replaceData({
                    ...pasteNode.data,
                    formInfo: {
                        ...pasteNode.data.formInfo,
                        checked: result.is_consistent
                            ? PasteSourceChecked.Created
                            : pasteNode.data.formInfo.checked,
                    },
                })
                getCollectCompleteStatus()
                if (!result.is_consistent) {
                    message.error(
                        __('${formNames}未完成加工', {
                            formNames: pasteNode.data.formInfo.name,
                        }),
                    )
                } else if (isOptionComplete) {
                    await completeCollectOrProcess(fid, {
                        task_id: taskId || '',
                    })
                    navigator(combUrl(queryData))
                }
            } catch (ex) {
                formatError(ex)
                return null
            }
        }
        return null
    }
    /**
     * 检查当前贴源表是否被使用
     * @param node 贴源表节点
     * @returns true 用到，false 未用到
     */
    const checkCurrentNodeExistRelation = (node) => {
        const businessNode = getStandardFormNode()
        const findData = businessNode?.data.items.find((fieldItem) =>
            node.data.items.find((pasteFieldItem) =>
                fieldItem.processing_source_id.includes(pasteFieldItem.id),
            ),
        )
        return !!findData
    }

    /**
     * 初始化侧边的元数据平台数据表
     */
    const initDefaultMetaForm = () => {
        if (graphCase && graphCase.current) {
            const pasteMetaNodes = graphCase.current
                .getNodes()
                .filter(
                    (singlePasteNode) =>
                        singlePasteNode.shape === 'table-paste-node' &&
                        singlePasteNode.data.formInfo.checked ===
                            PasteSourceChecked.FromDW,
                )
            setDefaultMetaForms(
                pasteMetaNodes.map((pasteMetaNode) => ({
                    fields: pasteMetaNode.data.items,
                    ...pasteMetaNode.data.formInfo,
                })),
            )
        }
    }
    return (
        <div className={styles.main}>
            <GraphToolBar
                targetFormInfo={formInfo}
                onSaveGraph={() => {
                    handleSaveGraph()
                }}
                onPublishGraph={() => {
                    handlePublishGraph()
                }}
                onChangeGraphSize={changeGraphSize}
                onShowAllGraphSize={showAllGraphSize}
                graphSize={graphSize}
                onUpdateFormInfo={(data) => {}}
                model={model}
                originNode={formNodeOfBusiness}
                queryData={{ ...queryData }}
                onMovedToCenter={movedToCenter}
                isShowEdit={false}
                infoStatus={formInfo?.processing_published}
                updateDisabled={updateDisabled}
                onSwitchModel={() => {
                    if (graphCase && graphCase.current) {
                        graphCase.current.getNodes().forEach((currentNode) => {
                            currentNode.replaceData({
                                ...currentNode.data,
                                switchStatus: true,
                            })
                        })
                    }
                }}
                onComplete={async () => {
                    if (graphCase && graphCase.current) {
                        const pasteNodes = graphCase.current
                            .getNodes()
                            .filter(
                                (allNode) =>
                                    allNode.shape === 'table-standard-node' &&
                                    allNode.data.formInfo.checked ===
                                        PasteSourceChecked.New,
                            )
                        if (!pasteNodes.length) {
                            await completeCollectOrProcess(fid, {
                                task_id: taskId || '',
                            })
                            navigator(combUrl(queryData))
                        } else {
                            refreshDataTables(pasteNodes[0], true)
                        }
                    }
                }}
                isComplete={isCompleted}
            />
            <div
                className={styles.graphContent}
                style={{
                    height: 'calc(100% - 52px)',
                }}
            >
                <DragBox
                    defaultSize={
                        model !== ViewModel.ModelEdit ? [0, 100] : defaultSize
                    }
                    minSize={
                        model !== ViewModel.ModelEdit ? [0, 500] : [250, 500]
                    }
                    maxSize={[300, Infinity]}
                    onDragEnd={(size) => {
                        setDefaultSize(size)
                    }}
                    gutterStyles={{
                        background: '#EFF2F5',
                        width: model !== ViewModel.ModelEdit ? 0 : '5px',
                        cursor: 'ew-resize',
                    }}
                    hiddenElement={model !== ViewModel.ModelEdit ? 'left' : ''}
                    gutterSize={model !== ViewModel.ModelEdit ? 1 : 5}
                    existPadding={false}
                >
                    {model !== ViewModel.ModelEdit ? (
                        <div />
                    ) : (
                        <div
                            ref={dndContainer}
                            className={styles.dndDrag}
                            onClick={() => {
                                if (optionType !== OptionType.NoOption) {
                                    setOptionType(OptionType.NoOption)
                                    setEditBusinessFormId('')
                                    setViewBusinessField(null)
                                }
                            }}
                        >
                            <SelectPasteSourceMenu
                                onStartDrag={startDrag}
                                onClick={() => {
                                    // setSelectFormType()
                                }}
                                onSelectMetaData={addMetaDataSourceTable}
                                existFormIds={pasteNodeIds}
                                defaultMetaForms={defaultMetaForms}
                                fid={fid}
                            />
                        </div>
                    )}
                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            height: '100%',
                        }}
                        ref={graphBody}
                        onClick={() => {
                            if (optionType !== OptionType.NoOption) {
                                setOptionType(OptionType.NoOption)
                                setEditBusinessFormId('')
                                setViewBusinessField(null)
                            }
                        }}
                    >
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
                    </div>
                </DragBox>
                {optionType === OptionType.ViewOriginFormDetail && (
                    <ViewFormDetail
                        formId={editBusinessFormId}
                        mid={mid}
                        onClose={() => {
                            setEditBusinessFormId('')
                            setOptionType(OptionType.NoOption)
                        }}
                    />
                )}
                {optionType === OptionType.ViewOriginFieldDetail && (
                    <ViewFieldDetail
                        data={{
                            ...viewBusinessField,
                            data_length:
                                viewBusinessField.data_length === 0
                                    ? '0'
                                    : viewBusinessField.data_length,
                            data_accuracy:
                                viewBusinessField.data_accuracy === 0
                                    ? '0'
                                    : viewBusinessField.data_accuracy,
                        }}
                        node={formOriginNode}
                        onClose={() => {
                            setViewBusinessField(null)
                            setOptionType(OptionType.NoOption)
                        }}
                    />
                )}
                {!!editPasteFormNode &&
                optionType === OptionType.ViewPasteFormInfo ? (
                    <ViewPasteFormDetail
                        formInfo={editPasteFormNode.data.formInfo}
                        onClose={() => {
                            setOptionType(OptionType.NoOption)
                            setEditPasteFormNode(null)
                        }}
                    />
                ) : null}

                {!!viewDataField &&
                optionType === OptionType.ViewPasteFieldInfo ? (
                    <ViewPasteFieldDetail
                        fieldInfo={viewDataField}
                        onClose={() => {
                            setOptionType(OptionType.NoOption)
                            setViewDataField(null)
                        }}
                    />
                ) : null}
            </div>
            {optionType === OptionType.EditStandardField && (
                <EditStandardField
                    open={optionType === OptionType.EditStandardField}
                    fieldInfo={editStandardField}
                    businessField={getFormNodeOfBusiness()?.data.items.find(
                        (currentItem) =>
                            currentItem.id === editStandardField?.id,
                    )}
                    onCancel={() => {
                        setEditStandardField(null)
                        setEditStandardNode(null)
                        setOptionType(OptionType.NoOption)
                    }}
                    onConfirm={(values, isChanged) => {
                        if (isChanged) {
                            editStandardNode?.replaceData({
                                ...editStandardNode.data,
                                items: editStandardNode.data.items.map(
                                    (item) => {
                                        if (item.id === editStandardField.id) {
                                            return {
                                                ...editStandardField,
                                                ...values,
                                            }
                                        }
                                        return item
                                    },
                                ),
                                formInfo: {
                                    ...editStandardNode.data.formInfo,
                                    checked: PasteSourceChecked.New,
                                },
                            })
                            setUpdateDisabled(false)
                        }
                        setOptionType(OptionType.NoOption)
                        setEditStandardField(null)
                        setEditStandardNode(null)
                    }}
                />
            )}
            {viewTableNode && (
                <FieldTableView
                    node={viewTableNode}
                    formId={viewTableNode?.data?.fid}
                    onClose={() => {
                        setViewTableNode(null)
                    }}
                    items={viewTableNode.data.items}
                    model="view"
                />
            )}
            {dataOriginConfigNode && (
                <ConfigDataOrigin
                    node={dataOriginConfigNode}
                    onClose={() => {
                        setDataOriginConfigNode(null)
                    }}
                    editStatus={dataOriginConfigNode.data?.type === 'standard'}
                />
            )}
        </div>
    )
}

export default DataProcessing
