import {
    useState,
    useRef,
    useEffect,
    useMemo,
    FC,
    forwardRef,
    useImperativeHandle,
} from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { Graph as GraphType, Node, Shape } from '@antv/x6'
import { Dnd } from '@antv/x6-plugin-dnd'
import { last, noop } from 'lodash'
import { useUnmount, useGetState, useSize } from 'ahooks'
import { Radio, Tooltip, message } from 'antd'
import { instancingGraph } from '@/core/graph/graph-config'
import { loadPlugins, Plugins } from '@/core/graph/plugin'
import {
    combUrl,
    DataShowSite,
    EditFormModel,
    ExpandStatus,
    generateFullPathData,
    getCurrentShowData,
    getDataCurrentPageIndex,
    getDataShowSite,
    getQueryData,
    newFieldTemplate,
    OptionType,
    SecurityClassification,
    Sensibility,
    wheellDebounce,
} from '../FormGraph/helper'
import styles from './styles.module.less'
import GraphToolBar from './GraphToolBar'
import {
    getFormQueryItem,
    getFormsFieldsList,
    saveBusinessFormFields,
    formatError,
    getSourceTables,
    TaskType,
    IBusinTableField,
    addToPending,
    IGradeLabel,
    getDataGradeLabel,
    getDataGradeLabelStatus,
    GradeLabelStatusEnum,
    ViewModel,
    dataTypeMapping,
} from '@/core'
import FormQuoteData from '../FormGraph/formDataQuoteData'
import { getPortByNode } from '../DataCollection/helper'
import __ from './locale'
import FieldTableView from '../FormGraph/FieldTableView'
import businessFormNode from './BusinessForm'
import {
    FormBusinessNodeTemplate,
    FormStandardNodeTemplate,
    searchFieldData,
    getDataTableSearchFields,
} from './helper'
import standardFormNodeRegistry from './StandardForm'
import FieldConfig from '../FormGraph/FieldConfig'
import { NewFormType, ToBeCreStdStatus } from '../Forms/const'
import CreateForm from '../Forms/CreateForm'
import EditFormConfig from '../FormGraph/EditFormConfig'
import { getActualUrl } from '@/utils'
import { X6PortalProvider } from '@/core/graph/helper'
import FormTableMode from '../FormTableMode'
import { FormListModelOutlined, FormTableModelOutlined } from '@/icons'
import { getErrorDatas } from '../FormTableMode/const'
import TypeShow from './TypeShow'
import BusinessFormDefineObj from '../BusinessFormDefineObj'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface IImportFormFromDataSource {
    ref: any
    initData?: any
    errorFields?: any
    isStart: boolean
    tagData: IGradeLabel[]
}
const ImportFormFromDataSource: FC<IImportFormFromDataSource> = forwardRef(
    (
        {
            initData,
            errorFields,
            isStart,
            tagData,
        }: Omit<IImportFormFromDataSource, 'ref'>,
        ref,
    ) => {
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
        const [formInfo, setFormInfo, getFormInfo] = useGetState<any>(null)
        const [graphSize, setGraphSize] = useState(100)
        const [searchParams, setSearchParams] = useSearchParams()
        const { search } = useLocation()
        const [queryData, setQueryData] = useState<any>(getQueryData(search))
        const fid = searchParams.get('fid') || ''
        const dfid = searchParams.get('dfid') || ''
        const mid = searchParams.get('mid') || ''
        const redirect = searchParams.get('redirect')
        const taskId = searchParams.get('taskId') || ''
        const taskType = searchParams.get('Task') || ''
        const defaultModel = searchParams.get('defaultModel') || ''
        const isCompleted = searchParams.get('isComplete') === 'true'
        const [
            formNodeOfBusiness,
            setFormNodeOfBusiness,
            getFormNodeOfBusiness,
        ] = useGetState<Node | null>(null)
        const [standardFormNode, setStandardFormNode, getStandardFormNode] =
            useGetState<Node | null>(null)

        const [optionType, setOptionType] = useState<OptionType>(
            OptionType.NoOption,
        )
        const [editBusinessFormId, setEditBusinessFormId] = useState<string>('')
        const [viewTableNode, setViewTableNode] = useState<Node | null>(null)

        const [updateDisabled, setUpdateDisabled] = useState<boolean>(false)

        // 编辑业务表时的数据
        const [editFormField, setEditFormField] = useState<any>(null)
        // 编辑业务表时的画布节点
        const [editFormNode, setEditFormNode] = useState<Node | null>(null)
        // 完善业务表
        const [completeFormOpen, setCompleteFormOpen] = useState(false)
        // 关联业务表对象/活动
        const [relateBusinessObject, setRelateBusinessObject] = useState(false)
        const [fieldsErrors, setFieldsError] = useState<any>(null)
        const [userInfo] = useCurrentUser()

        const targetNodePortData = useMemo(() => {
            return new FormQuoteData({})
        }, [])
        const pasteNodesPortsData = useMemo(() => {
            return new FormQuoteData({})
        }, [])

        const edgeRelation = useMemo(() => {
            return new FormQuoteData({})
        }, [])

        useEffect(() => {
            setFieldsError(errorFields)
        }, [errorFields])

        const getYPosition = (site, index, length) => {
            if (site === 'top') {
                return 42
            }
            if (site === 'bottom') {
                return 42 + length * 28 + 10
            }
            return 42 + index * 28 + 14
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
                                        ? getYPosition(
                                              _.site,
                                              _.index,
                                              _.length,
                                          )
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
                                x: 284,
                                y:
                                    _.expand === ExpandStatus.Expand
                                        ? getYPosition(
                                              _.site,
                                              _.index,
                                              _.length,
                                          )
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
                const businessTableNode = getFormNodeOfBusiness()
                if (standardNode) {
                    loadTargetPort(standardNode, businessTableNode)
                    updateAllPortAndEdge()
                }
            },
            () => optionGraphData,
            () => setViewTableNode,
            () => setRelateBusinessObject,
            () => isCompleted,
            () => model,
            () => edgeRelation,
            () => getStandardFormNode,
            () => fieldsErrors,
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
                },
            () => optionGraphData,
            () => getFormNodeOfBusiness,
            () => pasteNodesPortsData,
            () => noop,
            () => model,
            () => edgeRelation,
            () => noop,
            () => getFormNodeOfBusiness,
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
                    // snap: {
                    //     radius: 30,
                    // },
                    router: {
                        name: 'er',
                        args: {
                            offset: 25,
                            direction: 'H',
                        },
                    },
                    targetAnchor: {
                        name: 'right',
                        args: {},
                    },
                    createEdge() {
                        return new Shape.Edge({
                            attrs: {
                                line: {
                                    stroke: '#D5D5D5',
                                    strokeWidth: 1,
                                    targetMarker: {
                                        name: 'block',
                                        // size: 0,
                                    },
                                    // strokeDasharray: '5 5',
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
            }
        }, [])

        const initEditStatus = () => {
            setModel(
                defaultModel === 'view'
                    ? ViewModel.ModelView
                    : ViewModel.ModelEdit,
            )
        }

        const getDataType = (type: string) => {
            let tempType = ''
            Object.keys(dataTypeMapping).forEach((key) => {
                if (dataTypeMapping[key].includes(type)) {
                    tempType = key
                }
            })
            return tempType
        }

        // 使用数据表的数据 映射出 业务表的数据  并赋初始数据
        const initDefaultDataOfBusForm = (dataFormsFields, fInfo) => {
            return dataFormsFields.map((dfField) => {
                const type = getDataType(dfField.type)
                return {
                    ...newFieldTemplate,
                    id: dfField.id,
                    name: dfField.description || undefined,
                    name_en: dfField.name,
                    data_type: type === 'binary' ? 'char' : type,
                    data_length: ['char', 'decimal'].includes(type)
                        ? dfField.length
                        : undefined,
                    data_accuracy: ['decimal'].includes(type)
                        ? dfField.field_precision
                        : undefined,
                    is_primary_key: dfField.is_primary_key ? 1 : 0,
                    is_incremental_field: 0,
                    is_required: dfField.is_required ? 1 : 0,
                    is_standardization_required: 0,
                    description: dfField.description,
                    is_current_business_generation: 0,
                    sensitive_attribute: Sensibility.Insensitive,
                    confidential_attribute:
                        SecurityClassification.NotConfidential,
                    shared_attribute: fInfo.shared_attribute,
                    open_attribute: fInfo.open_attribute,
                    shared_condition: fInfo.shared_condition,
                    open_condition: fInfo.open_condition,
                }
            })
        }

        /**
         * 加载目标表
         */
        const loadOriginTable = async () => {
            try {
                if (graphCase?.current) {
                    let info
                    let initFields: Array<any> = []
                    let dataFormInfo
                    if (initData) {
                        const { fields, ...rest } = initData
                        info = rest
                        initFields = fields
                        dataFormInfo = await getSourceTables(dfid, {
                            version: 'published',
                        })
                    } else {
                        info = await getFormQueryItem(fid)

                        const [dataSourceFormInfo, { entries }] =
                            await Promise.all([
                                // 获取数据表信息
                                getSourceTables(dfid, { version: 'published' }),
                                getFormsFieldsList(fid, { limit: 999 }),
                            ])
                        dataFormInfo = dataSourceFormInfo
                        initFields = entries
                    }
                    setFormInfo(info)

                    // 获取业务表数据，无数据时：使用数据表初始化 有数据时：直接渲染
                    let businessFormData: any[]
                    if (initFields?.length > 0) {
                        businessFormData = initFields
                    } else {
                        businessFormData = initDefaultDataOfBusForm(
                            dataFormInfo.fields,
                            info,
                        )
                    }

                    initLoadBusinessForm(
                        {
                            ...FormBusinessNodeTemplate,
                            position: {
                                x: 958,
                                y: 100,
                            },
                        },
                        businessFormData,
                        info,
                    )
                    initLoadDataForm(
                        {
                            ...FormStandardNodeTemplate,
                            position: {
                                x: 500,
                                y: 100,
                            },
                        },
                        dataFormInfo.fields,
                        {
                            description: dataFormInfo.description,
                            id: uuidv4(),
                            name: dataFormInfo.name,
                            datasourceType: dataFormInfo.datasource_type,
                        },
                    )

                    updateAllPortAndEdge()

                    movedToCenter()
                }
            } catch (ex) {
                formatError(ex)
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

        const initLoadDataForm = (targetNodeData, itemsData, info) => {
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
                            items: itemsData,
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

        useImperativeHandle(ref, () => ({
            getTargetData: () => {
                return {
                    ...getFormNodeOfBusiness()?.data?.formInfo,
                    fields: getFormNodeOfBusiness()?.data?.items || [],
                }
            },
        }))

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

        const getNewStandardType = (
            businessType,
            businessLength,
            standardType,
        ) => {
            const numberType = [
                'tinyint',
                'smallint',
                'int',
                'bigint',
                'float',
                'double',
            ]
            switch (true) {
                case getDefaultType(businessType, businessLength) ===
                    standardType:
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

        const loadTargetPort = (
            node: Node,
            businessTableNode?: Node | null,
        ) => {
            node.removePorts()
            targetNodePortData.clearData()

            const showData =
                node.data.type === 'standard' && businessTableNode
                    ? getCurrentShowData(
                          node.data.offset,
                          getDataTableSearchFields(
                              node.data.items,
                              businessTableNode?.data?.items || [],
                              node.data.keyWord,
                          ),
                          10,
                      )
                    : getCurrentShowData(
                          node.data.offset,
                          searchFieldData(node.data.items, node.data.keyWord),
                          10,
                      )

            showData.forEach((item, index) => {
                if (node.data.expand === ExpandStatus.Retract) {
                    const portRightId = getOriginNodeHeaderPorts(
                        node,
                        'rightPorts',
                    )

                    if (!portRightId) {
                        node.addPort(
                            getPortByNode(
                                'rightPorts',
                                -1,
                                '',
                                node.data.expand,
                            ),
                        )
                        addTargetNodePortData(
                            last(node.getPorts())?.id,
                            node.id,
                            item.id,
                            'rightPorts',
                        )
                    } else {
                        addTargetNodePortData(
                            portRightId,
                            node.id,
                            item.id,
                            'rightPorts',
                        )
                    }
                } else {
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

        const checkFieldStandardStatus = (checkingField) => {
            const businessNode = getFormNodeOfBusiness()
            const fields = businessNode?.data?.items || []
            const findFields = fields.find(
                (filed) => filed.id === checkingField.id,
            )
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

                    setStandardAndBusinessRelative(businessNode, standardNode)
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
            const standardNodeData = getDataTableSearchFields(
                standardNode.data.items,
                businessNode.data.items,
                standardNode.data.keyWord,
            )

            businessNode.removePorts()
            businessNodeData.forEach((item, index) => {
                if (
                    standardNodeData.find(
                        (standardDataItem) => standardDataItem.id === item.id,
                    )
                ) {
                    createRelativeByNode(
                        standardNode,
                        businessNode,
                        item,
                        index,
                    )
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

            const searchData = getDataTableSearchFields(
                originNode.data.items,
                getFormNodeOfBusiness()?.data.items,
                originNode.data.keyWord,
            )

            searchData.forEach((originItem, index) => {
                if (originItem.id === refId) {
                    if (expand === ExpandStatus.Retract) {
                        originNode.addPort(
                            getPortByNode(position, -1, '', expand),
                        )
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
            const showData =
                node.data.type === 'standard'
                    ? getCurrentShowData(
                          node.data.offset,
                          getDataTableSearchFields(
                              node.data.items,
                              getFormNodeOfBusiness()?.data?.items || [],
                              node.data.keyWord,
                          ),
                          10,
                      )
                    : getCurrentShowData(
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
                .filter(
                    (port) => port.args?.site === 'top' && port.group === group,
                )
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
                    (port) =>
                        port.args?.site === 'bottom' && port.group === group,
                )
            if (currentPort && currentPort.length) {
                return currentPort[0].id
            }
            return ''
        }
        /**
         * 获取原节点的方位 （数据表的桩始终在右侧，业务表的桩在左侧）
         */
        const getOriginPosition = (orginNode: Node, targetNode: Node) => {
            const orginNodePosition = orginNode.getPosition()
            const targetNodePosition = targetNode.getPosition()
            // if (orginNodePosition.x > targetNodePosition.x) {
            //     return {
            //         origin: 'leftPorts',
            //         target: 'rightPorts',
            //     }
            // }
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
                    return (
                        pasteNodesPortsData.quoteData[value].fieldId ===
                        sourceId
                    )
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
                        targetNodePortData.quoteData[value].fieldId ===
                            sourceId &&
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
                    if (edgeRelation.multipleSelected?.includes(originItemId)) {
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
                                    stroke: '#D5D5D5',
                                    strokeWidth: 1,
                                    targetMarker: {
                                        name: 'block',
                                        offset: -10,
                                    },
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
                                    stroke: '#D5D5D5',
                                    strokeWidth: 1,
                                    targetMarker: {
                                        name: 'block',
                                        offset: -10,
                                    },
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
        const optionGraphData = (
            currentOptionType: OptionType,
            data,
            dataNode,
        ) => {
            setOptionType(currentOptionType)
            switch (currentOptionType) {
                // 编辑业务表字段
                case OptionType.EditTargetField:
                    setEditFormField(data)
                    setEditFormNode(dataNode)
                    break
                case OptionType.ViewOriginFormDetail:
                    setEditFormField('')
                    setEditFormNode(null)
                    setEditBusinessFormId(dataNode.data.fid)
                    break

                default:
                    break
            }
        }

        /**
         * 保存
         */
        const handleSaveGraph = async () => {
            if (graphCase && graphCase.current && getFormInfo()?.id) {
                if (
                    (getFormNodeOfBusiness()?.data.items || []).find(
                        (item) => !item.name,
                    ) ||
                    fieldsErrors
                ) {
                    message.error(__('信息不完整，请完善后再保存'))
                    return
                }
                try {
                    await saveBusinessFormFields(mid, getFormInfo().id, {
                        fields: getFormNodeOfBusiness()?.data.items || [],
                        task_id: taskId,
                    })
                    // 同时更新 待新建 中字段值
                    updateReqAddStandard()

                    message.success(__('保存成功'))
                    if (searchParams.get('jumpMode') === 'win') {
                        window.open(getActualUrl(combUrl(queryData)), '_self')
                        return
                    }
                    navigator(combUrl(queryData))
                } catch (error) {
                    if (
                        error?.data?.code ===
                        'BusinessGrooming.Form.InvalidParameter'
                    ) {
                        message.error(__('信息不完整，请完善后再保存'))
                        return
                    }
                    formatError(error)
                }
            }
        }

        // 修改字段信息时，需同步修改 标准化-待新建 原始字段信息
        const updateReqAddStandard = async () => {
            try {
                const fieldData = getFormNodeOfBusiness()?.data.items || []

                const selFields: Array<IBusinTableField> =
                    fieldData
                        ?.filter((item) =>
                            [ToBeCreStdStatus?.WAITING].includes(
                                item?.standard_create_status,
                            ),
                        )
                        ?.map((fItem) => ({
                            id: fItem?.id || '',
                            business_table_name: formInfo?.name,
                            business_table_id: fid || '',
                            business_table_type: formInfo?.form_type || '',
                            create_user: userInfo?.VisionName || '',
                            business_table_field_id: fItem?.id || '',
                            business_table_field_current_name:
                                fItem?.changedField?.name || fItem?.name || '',
                            business_table_field_origin_name: fItem?.name || '',
                            business_table_field_current_name_en:
                                fItem?.changedField?.name_en ||
                                fItem?.name_en ||
                                '',
                            business_table_field_origin_name_en:
                                fItem?.name_en || '',
                            business_table_field_current_std_type:
                                fItem?.changedField?.formulate_basis ||
                                fItem?.formulate_basis,
                            business_table_field_origin_std_type:
                                fItem?.formulate_basis,
                            business_table_field_data_type: fItem?.data_type,
                            business_table_field_data_length:
                                fItem?.data_length,
                            business_table_field_data_precision:
                                fItem?.data_accuracy,

                            business_table_field_dict_name: '',
                            business_table_field_description:
                                fItem?.description || '',
                            data_element_id: '',
                        })) || []

                if (selFields?.length) {
                    // 修改 待发起 中字段信息
                    await addToPending(mid, selFields)
                }
            } catch (error) {
                formatError(error)
            }
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

        const getJumpUrl = () => {
            return `/formGraph${
                window.location.href.split('/formGraph')[1]
            }`.replace('defaultModel=view', 'defaultModel=edit')
        }

        // 预览到编辑更新完善后的数据
        const onUpdate = (values) => {
            setCompleteFormOpen(false)
            setModel(ViewModel.ModelEdit)
            getFormNodeOfBusiness()?.replaceData({
                ...getFormNodeOfBusiness()?.data,
                items: getFormNodeOfBusiness()?.data.items.map((item) => ({
                    ...item,
                    shared_attribute: values.shared_attribute,
                    open_attribute: values.open_attribute,
                    shared_condition: values.shared_condition,
                    open_condition: values.open_condition,
                })),
            })
        }

        const getBusinessFormFields = () => {
            const businessNode = getFormNodeOfBusiness()
            return businessNode?.data?.items || []
        }

        return (
            <div className={styles.main}>
                <GraphToolBar
                    targetFormInfo={formInfo}
                    onSaveGraph={() => {
                        handleSaveGraph()
                    }}
                    onChangeGraphSize={changeGraphSize}
                    onShowAllGraphSize={showAllGraphSize}
                    graphSize={graphSize}
                    onUpdateFormInfo={(data) => {}}
                    model={model}
                    originNode={formNodeOfBusiness}
                    queryData={{ ...queryData }}
                    onMovedToCenter={movedToCenter}
                    infoStatus={formInfo?.processing_published}
                    updateDisabled={updateDisabled}
                    onSwitchModel={() => {
                        const locationUrl = window.location.href
                        const regx = /defaultModel=view/i

                        window.history.replaceState(
                            {},
                            'title',
                            locationUrl.replace(regx, 'defaultModel=edit'),
                        )
                        // if (!formInfo.update_cycle) {
                        //     setCompleteFormOpen(true)
                        //     return
                        // }
                        setModel(ViewModel.ModelEdit)
                    }}
                    saveDisabled={
                        optionType !== OptionType.NoOption ||
                        relateBusinessObject
                    }
                />
                <div
                    className={styles.graphContent}
                    style={{
                        height: 'calc(100% - 52px)',
                    }}
                >
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
                        <div
                            style={{
                                position: 'absolute',
                                left: 30,
                                bottom: 24,
                            }}
                        >
                            <TypeShow />
                        </div>
                    </div>
                    {optionType === OptionType.ViewOriginFormDetail && (
                        <EditFormConfig
                            formId={editBusinessFormId}
                            mid={mid}
                            model={model}
                            taskId={taskId}
                            onClose={() => {
                                setEditBusinessFormId('')
                                setOptionType(OptionType.NoOption)
                            }}
                            onUpdate={(info) => {
                                getFormNodeOfBusiness()?.replaceData({
                                    ...getFormNodeOfBusiness()?.data,
                                    formInfo: { ...formInfo, ...info },
                                })
                                setFormInfo({ ...formInfo, ...info })
                            }}
                        />
                    )}

                    {editFormField && (
                        <FieldConfig
                            data={editFormField}
                            node={editFormNode}
                            model={model}
                            onClose={() => {
                                setEditFormField(null)
                                setOptionType(OptionType.NoOption)
                            }}
                            isStart={isStart}
                            tagData={tagData}
                            onUpdateGraph={() => {
                                loadTargetPort(
                                    getStandardFormNode() as Node,
                                    getFormNodeOfBusiness() as Node,
                                )
                                updateAllPortAndEdge()
                            }}
                            taskId={taskId}
                            formType={NewFormType.DSIMPORT}
                            getDSFormNode={getStandardFormNode}
                            validateEnName
                            updateErrorFields={(id) => {
                                if (
                                    fieldsErrors &&
                                    Object.keys(fieldsErrors).includes(
                                        id.toString(),
                                    )
                                ) {
                                    const newFieldsErrors = fieldsErrors
                                    delete newFieldsErrors[id]
                                    if (Object.keys(newFieldsErrors).length) {
                                        setFieldsError(newFieldsErrors)
                                    } else {
                                        setFieldsError(null)
                                    }
                                }
                            }}
                        />
                    )}

                    {relateBusinessObject && (
                        <BusinessFormDefineObj
                            open={relateBusinessObject}
                            onClose={() => setRelateBusinessObject(false)}
                            getBusinessFormFields={getBusinessFormFields}
                            formId={fid}
                            formName={formInfo.name}
                            mode={model as any}
                        />
                    )}
                </div>

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
                {completeFormOpen && (
                    <CreateForm
                        onClose={() => {
                            setCompleteFormOpen(false)
                        }}
                        mid={mid}
                        onUpdate={(values) => onUpdate(values)}
                        taskId={taskId}
                        taskType={taskType as TaskType}
                        formType={NewFormType.DSIMPORT}
                        formInfo={formInfo}
                        isJump={false}
                    />
                )}
            </div>
        )
    },
)
interface IImportFromDataSource {}

const ImportFromDataSource: FC<IImportFromDataSource> = () => {
    const [editModel, setEditModel] = useState<EditFormModel>(
        EditFormModel.GraphModel,
    )

    // 图内方法
    const graphRef: any = useRef()
    // 表内方法
    const tableRef: any = useRef()
    // 业务表数据
    const [formData, setFormDatas] = useState<any>()

    const [changeBtnStatus, setChangeBtnStatus] = useState<boolean>(false)

    const [fromTableErrors, setFromTableErrors] = useState<any>(null)

    // 是否开启数据分级
    const [isStart, setIsStart] = useState(false)
    const [tagData, setTagData] = useState<IGradeLabel[]>([])

    const getClassificationTag = async () => {
        try {
            const res = await getDataGradeLabel({ keyword: '' })
            generateFullPathData(res?.entries || [], [])
            setTagData(res?.entries || [])
        } catch (error) {
            formatError(error)
        }
    }

    const getTagStatus = async () => {
        try {
            const res = await getDataGradeLabelStatus()
            setIsStart(res === GradeLabelStatusEnum.Open)
            if (res === GradeLabelStatusEnum.Open) {
                getClassificationTag()
            }
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        getTagStatus()
    }, [])

    return (
        <div className={styles.formGraphWrapper}>
            {editModel === EditFormModel.GraphModel ? (
                <ImportFormFromDataSource
                    ref={graphRef}
                    initData={formData}
                    errorFields={fromTableErrors}
                    isStart={isStart}
                    tagData={tagData}
                />
            ) : (
                <FormTableMode
                    ref={tableRef}
                    initData={formData}
                    formType={NewFormType.DSIMPORT}
                    updateChangeBtn={setChangeBtnStatus}
                    isStart={isStart}
                    tagData={tagData}
                />
            )}
            <Tooltip
                title={changeBtnStatus ? __('请先完成或取消批量配置属性') : ''}
                placement="bottom"
            >
                <Radio.Group
                    defaultValue={EditFormModel.GraphModel}
                    value={editModel}
                    onChange={async (e) => {
                        if (e?.target?.value === EditFormModel.TableModel) {
                            if (graphRef?.current?.getTargetData) {
                                setFormDatas(graphRef?.current?.getTargetData())
                                setEditModel(EditFormModel.TableModel)

                                graphRef.current = null
                            }
                        } else {
                            let errorInfo = {}
                            try {
                                await tableRef.current?.validateFields()
                            } catch (err) {
                                errorInfo = getErrorDatas(
                                    err?.values?.fields || [],
                                    err?.errorFields || [],
                                    'id',
                                )
                                setFromTableErrors(errorInfo)
                            }
                            if (tableRef.current?.getTargetData) {
                                setFormDatas(tableRef.current?.getTargetData())
                            }
                            setEditModel(EditFormModel.GraphModel)
                        }
                    }}
                    buttonStyle="solid"
                    className={styles.switchButton}
                    disabled={changeBtnStatus}
                >
                    <Tooltip
                        title={changeBtnStatus ? '' : __('切换为图表模式')}
                        placement="bottom"
                    >
                        <Radio.Button value={EditFormModel.GraphModel}>
                            <FormTableModelOutlined />
                        </Radio.Button>
                    </Tooltip>
                    <Tooltip
                        title={changeBtnStatus ? '' : __('切换为列表模式')}
                        placement="bottom"
                    >
                        <Radio.Button value={EditFormModel.TableModel}>
                            <FormListModelOutlined />
                        </Radio.Button>
                    </Tooltip>
                </Radio.Group>
            </Tooltip>
        </div>
    )
}
export default ImportFromDataSource
