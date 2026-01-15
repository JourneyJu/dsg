import * as React from 'react'
import { useState, useEffect } from 'react'
import { register } from '@antv/x6-react-shape'
import {
    CloseCircleFilled,
    LeftOutlined,
    RightOutlined,
    SearchOutlined,
    ExclamationCircleOutlined,
    ShrinkOutlined,
    ArrowsAltOutlined,
    CheckCircleFilled,
} from '@ant-design/icons'
import classnames from 'classnames'
import { Button, ConfigProvider, Input, Tooltip } from 'antd'
import { useDebounce } from 'ahooks'
import {
    UnQuoteOutlined,
    RefreshOutlined,
    XlsColored,
    DataOriginConfigOutlined,
} from '@/icons'
import { FormFiled } from '@/core/apis/businessGrooming/index.d'
import styles from './styles.module.less'
import {
    ExpandStatus,
    getCurrentShowData,
    newFieldTemplate,
    OptionType,
} from '../FormGraph/helper'
import __ from './locale'
import { ViewModel } from './const'
import { PasteSourceChecked } from '../DataCollection/const'
import DataSourcIcons from '../DataSource/Icons'
import { searchFieldData } from './helper'
import { enBeginNameReg, enBeginNameRegNew } from '@/utils'
import { SearchInput } from '@/ui'

let callbackColl: any = []

const StandardFormComponent = (props: any) => {
    const { node } = props
    const { data } = node
    const [showFiledOptions, setShowFiledOptions] = useState<string>('')
    const [targetData, setTargetData] = useState<Array<any>>([])
    const [showPagTurning, setShowPageTurning] = useState<boolean>(false)
    const [singleSelected, setSingleSelected] = useState<string>('')
    const [formInfo, setFormInfo] = useState<any>(null)
    const [searchStatus, setSearchStatus] = useState<boolean>(false)
    const [searchKey, setSearchKey] = useState<string>('')
    const debouncedValue = useDebounce(searchKey, { wait: 500 })
    const [model, setModel] = useState<ViewModel>(ViewModel.ModelEdit)
    const [errorFieldsId, setErrorFieldsId] = useState<Array<string>>([])
    const [formEditName, setFormEditName] = useState<string>('')
    const [formEditNameStatus, setFormEditNameStatus] = useState<boolean>(false)
    const [businessFields, setBusinessFields] = useState<Array<any>>([])
    const [formNameStatus, setFormNameStatus] = useState<boolean>(true)

    useEffect(() => {
        node.setData({
            ...data,
            type: 'standard',
        })
    }, [])

    useEffect(() => {
        const updateAllPortAndEdge = callbackColl[1]()
        const businessNode = callbackColl[9]()()
        if (debouncedValue !== node.data.keyWord) {
            node.setData({
                ...node.data,
                keyWord: debouncedValue,
                offset: 0,
            })
            if (businessNode) {
                businessNode.setData({
                    ...businessNode.data,
                    keyWord: debouncedValue,
                    offset: 0,
                })
            }
            updateAllPortAndEdge(node)
        }
    }, [debouncedValue])

    useEffect(() => {
        const getBusinessNode = callbackColl[3]()
        const fields = getBusinessNode()?.data?.items || []
        setModel(callbackColl[6]() || ViewModel.ModelEdit)
        setTargetData(
            getCurrentShowData(
                data.offset,
                searchFieldData(data.items, data.keyWord),
                10,
            ),
        )
        setSingleSelected(data.singleSelectedId)
        setErrorFieldsId(data.errorFieldsId)
        setFormInfo(data.formInfo)
        setBusinessFields(fields)
    }, [data])

    useEffect(() => {
        initTargetNode()
    }, [targetData])

    const initTargetNode = () => {
        if (node.data.expand === ExpandStatus.Retract) {
            node.resize(400, 56)
        } else if (!targetData.length) {
            node.resize(400, 166)
        } else if (targetData.length <= 10) {
            node.resize(400, 56 + targetData.length * 40 + 24)
        }
    }

    /**
     * 解绑字段
     * @param items
     */
    const handleUnQuoteFields = (item) => {
        node.replaceData({
            ...node.data,
            items: node.data?.items.map((targetItem) => {
                if (item.id === targetItem.id) {
                    cancelOriginFormFiledSelected(
                        targetItem.processing_source_id,
                    )
                    return {
                        ...targetItem,
                        processing_source_id: [],
                    }
                }
                return targetItem
            }),
            formInfo: {
                ...node.data.formInfo,
                checked: PasteSourceChecked.New,
            },
        })
        updatePasteForm(item.processing_source_id)
    }

    /**
     * 取消源表单的字段选中状态
     * @param refId
     */
    const cancelOriginFormFiledSelected = (sourceId: Array<string>) => {
        // const keyAndNodeRelation = callbackColl[2]()
        // const originNode = keyAndNodeRelation.quoteData[refId]
        // originNode?.replaceData({
        //     ...originNode.data,
        //     selectedFiledsId: originNode.data.selectedFiledsId.filter(
        //         (id) => id !== refId,
        //     ),
        // })
        // keyAndNodeRelation.deleteData(refId)
    }

    /**
     * 更新贴源表
     * @param sourceId
     */
    const updatePasteForm = (sourceId: Array<string>) => {
        const graphCase = callbackColl[0]()
        const updateAllPortAndEdge = callbackColl[1]()
        const loadPortsForPasteForm = callbackColl[5]()
        if (graphCase && graphCase.current) {
            const allNodes = graphCase.current.getNodes()
            const pasteNodes = allNodes.filter(
                (allNode) => allNode.data.type === 'pasteSource',
            )
            const pasteNode = pasteNodes.find((itemNode) =>
                itemNode.data.items.find((itemField) =>
                    sourceId.includes(itemField.id),
                ),
            )
            loadPortsForPasteForm(pasteNode)
            updateAllPortAndEdge(node)
        }
    }

    /**
     * 下一页
     */
    const handlePageDown = () => {
        const updateAllPortAndEdge = callbackColl[1]()
        const businessNode = callbackColl[9]()()
        node.setData({
            ...data,
            offset: data.offset + 1,
        })
        businessNode.setData({
            ...businessNode.data,
            offset: data.offset + 1,
        })
        updateAllPortAndEdge(node)
    }

    /**
     * 上一页
     */
    const handlePageUp = () => {
        const updateAllPortAndEdge = callbackColl[1]()
        const businessNode = callbackColl[9]()()
        node.setData({
            ...data,
            offset: data.offset - 1,
        })
        businessNode.setData({
            ...businessNode.data,
            offset: data.offset - 1,
        })
        updateAllPortAndEdge(node)
    }

    /**
     * 选择当前行数据
     */
    const handleClickField = (item) => {
        const graphCase = callbackColl[0]()
        const edgeRelation = callbackColl[7]()
        node.replaceData({
            ...node.data,
            singleSelectedId: item.id,
        })
        if (graphCase && graphCase.current) {
            const allNodes = graphCase.current.getNodes()
            if (item.processing_source_id.length) {
                allNodes.forEach((currentNode) => {
                    if (currentNode.shape === 'table-paste-node') {
                        const { items } = currentNode.data
                        const selectedFileds = items.filter((pasteItem) => {
                            return item.processing_source_id.includes(
                                pasteItem.id,
                            )
                        })
                        if (selectedFileds.length) {
                            currentNode.replaceData({
                                ...currentNode.data,
                                selectedId: selectedFileds.map(
                                    (selectedFiled) => selectedFiled.id,
                                ),
                            })
                        } else {
                            currentNode.replaceData({
                                ...currentNode.data,
                                selectedId: [],
                            })
                        }
                    } else if (currentNode.shape === 'table-business-node') {
                        currentNode.replaceData({
                            ...currentNode.data,
                            singleSelectedId: item.id,
                        })
                    }
                })
                if (edgeRelation.multipleSelected.length) {
                    edgeRelation.multipleSelected.forEach((selectId) => {
                        edgeRelation.quoteData[selectId].attr(
                            'line/stroke',
                            '#979797',
                        )
                    })
                }
                edgeRelation.onMultipleSelectData([
                    ...item.processing_source_id,
                    item.id,
                ])

                edgeRelation.multipleSelected.forEach((selectId) => {
                    edgeRelation.quoteData[selectId].attr(
                        'line/stroke',
                        '#126EE3',
                    )
                })
            } else {
                allNodes.forEach((currentNode) => {
                    if (currentNode.shape === 'table-paste-node') {
                        currentNode.replaceData({
                            ...currentNode.data,
                            selectedId: [],
                        })
                    } else if (currentNode.shape === 'table-business-node') {
                        currentNode.setData({
                            ...currentNode.data,
                            singleSelectedId: item.id,
                        })
                    }
                })
                edgeRelation.multipleSelected.forEach((selectId) => {
                    edgeRelation.quoteData[selectId].attr(
                        'line/stroke',
                        '#979797',
                    )
                })
                edgeRelation.quoteData[item.id].attr('line/stroke', '#126EE3')
                edgeRelation.onMultipleSelectData([item.id])
            }
        }
    }

    /**
     * 编辑字段
     */
    const editField = (item) => {
        const optionGraphData = callbackColl[2]()
        if (model === ViewModel.ModelEdit) {
            optionGraphData(OptionType.EditStandardField, item, node)
        } else {
            optionGraphData(OptionType.ViewPasteFieldInfo, item, node)
        }
    }

    /**
     * 编辑表
     */
    const editForm = (e) => {
        setFormEditNameStatus(true)
        if (node.data.formInfo?.name) {
            setFormEditName(node.data.formInfo?.name)
        } else {
            setFormEditName('')
        }
    }
    /**
     * 更新画布
     */
    const onUpdateGraph = () => {
        const onUpdate = callbackColl[1]()
        onUpdate(node)
    }

    /**
     * 获取选中颜色
     */
    const getSelectClassName = (item) => {
        if (singleSelected === item.id) {
            return styles.formTargetItemSelected
        }
        if (errorFieldsId.includes(item.id)) {
            return styles.formTargetItemError
        }
        return ''
    }

    /**
     * 检查当前字段是否未标准化
     */
    const checkFieldStandardStatus = (item) => {
        if (businessFields.length) {
            const findBusinessFiled = businessFields.find(
                (businessField) => businessField.id === item.id,
            )
            if (
                findBusinessFiled &&
                findBusinessFiled.is_standardization_required &&
                findBusinessFiled.standard_status !== 'normal'
            ) {
                return (
                    <Tooltip
                        placement="bottom"
                        title={__('该字段“未标准化”，无法进行加工')}
                    >
                        <ExclamationCircleOutlined
                            style={{
                                color: '#F5222D',
                                marginLeft: '5px',
                            }}
                        />
                    </Tooltip>
                )
            }
            return null
        }
        return null
    }

    /**
     * 更新贴原表
     */
    const onUpdatePaste = async () => {
        const refreshDataTables = callbackColl[8]()
        refreshDataTables(node)
    }
    return (
        <ConfigProvider
            prefixCls="any-fabric-ant"
            iconPrefixCls="any-fabric-anticon"
        >
            <div className={classnames(styles.formNode, styles.formOriginNode)}>
                <div
                    className={classnames(
                        styles.formStandardtHeader,
                        styles.formHeader,
                        (!formInfo?.name || !formNameStatus) &&
                            styles.noFormName,
                    )}
                >
                    <div className={styles.formTitle}>
                        {searchStatus ? (
                            <div className={styles.formSearch}>
                                <SearchOutlined />
                                <SearchInput
                                    className={styles.formSearchInput}
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
                                        className={styles.clearInput}
                                        onClick={() => {
                                            setSearchKey('')
                                            setSearchStatus(false)
                                        }}
                                    />
                                )}
                            </div>
                        ) : (
                            <div
                                className={classnames(
                                    styles.formTitleLabel,
                                    styles.formTitleStandardLable,
                                )}
                            >
                                {data.formInfo.checked ===
                                PasteSourceChecked.New ? (
                                    <Tooltip
                                        placement="bottom"
                                        title={__('需加工')}
                                    >
                                        <div
                                            className={
                                                styles.iconStatusUncollect
                                            }
                                        />
                                    </Tooltip>
                                ) : (
                                    <Tooltip
                                        placement="bottom"
                                        title={__('已加工')}
                                    >
                                        <CheckCircleFilled
                                            className={
                                                styles.iconStatusCollected
                                            }
                                        />
                                    </Tooltip>
                                )}

                                {formInfo?.datasource_id ? (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            margin: '0 8px',
                                        }}
                                    >
                                        <DataSourcIcons
                                            type={formInfo?.datasource_type}
                                            fontSize={22}
                                            iconType="outlined"
                                        />
                                    </div>
                                ) : (
                                    ''
                                )}
                                {formEditNameStatus ? (
                                    <div className={styles.formEditName}>
                                        <Input
                                            className={styles.formEditInput}
                                            placeholder={__('请输入表名称')}
                                            bordered={false}
                                            autoFocus
                                            maxLength={255}
                                            value={formEditName}
                                            onBlur={(e) => {
                                                node.replaceData({
                                                    ...node.data,
                                                    formInfo: {
                                                        ...node.data.formInfo,
                                                        name: e.target.value,
                                                        checked:
                                                            e.target.value ===
                                                            node.data.formInfo
                                                                .name
                                                                ? node.data
                                                                      .formInfo
                                                                      .checked
                                                                : PasteSourceChecked.New,
                                                    },
                                                })
                                                setFormNameStatus(
                                                    enBeginNameRegNew.test(
                                                        e.target.value,
                                                    ),
                                                )
                                                setFormEditNameStatus(false)
                                                setFormEditName('')
                                                const updateAllPortAndEdge =
                                                    callbackColl[1]()
                                                updateAllPortAndEdge(
                                                    node,
                                                    false,
                                                )
                                            }}
                                            onChange={(e) => {
                                                setFormEditName(e.target.value)
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className={classnames(
                                            styles.formTitleStandardText,
                                            model === ViewModel.ModelEdit
                                                ? styles.formTitleStandardEdit
                                                : '',
                                        )}
                                        onClick={(e) => {
                                            if (model === ViewModel.ModelEdit) {
                                                editForm(e)
                                            }
                                        }}
                                    >
                                        {formInfo?.name ? (
                                            <span>
                                                {formInfo?.name || ''}
                                                {formNameStatus ? null : (
                                                    <Tooltip
                                                        placement="bottom"
                                                        title={__(
                                                            '仅支持英文、数字、下划线，且必须以字母开头',
                                                        )}
                                                    >
                                                        <ExclamationCircleOutlined
                                                            style={{
                                                                color: '#F5222D',
                                                                marginLeft:
                                                                    '5px',
                                                            }}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </span>
                                        ) : (
                                            <span
                                                className={styles.nameDisplay}
                                            >
                                                {__('请输入表名称')}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {!!targetData.length && (
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
                                {model === ViewModel.ModelEdit && (
                                    <div className={styles.formTitleBtn}>
                                        <Tooltip
                                            placement="bottom"
                                            title={__('配置数据源')}
                                        >
                                            <DataOriginConfigOutlined
                                                className={styles.iconBtn}
                                                style={{
                                                    fontSize: '22px',
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    const setConfigDataOrigin =
                                                        callbackColl[10]()
                                                    setConfigDataOrigin(node)
                                                }}
                                            />
                                        </Tooltip>
                                    </div>
                                )}
                                <div className={styles.formTitleBtn}>
                                    {node.data.expand ===
                                    ExpandStatus.Expand ? (
                                        <Tooltip
                                            placement="bottom"
                                            title={__('收起')}
                                        >
                                            <ShrinkOutlined
                                                onClick={(e) => {
                                                    node.setData({
                                                        ...node.data,
                                                        expand: ExpandStatus.Retract,
                                                    })
                                                    onUpdateGraph()
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                }}
                                            />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip
                                            placement="bottom"
                                            title={__('展开')}
                                        >
                                            <ArrowsAltOutlined
                                                onClick={(e) => {
                                                    node.setData({
                                                        ...node.data,
                                                        expand: ExpandStatus.Expand,
                                                    })
                                                    onUpdateGraph()
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                }}
                                            />
                                        </Tooltip>
                                    )}
                                </div>
                                {model === ViewModel.Processing &&
                                    data.formInfo.checked ===
                                        PasteSourceChecked.New && (
                                        <div className={styles.formTitleBtn}>
                                            <Tooltip
                                                placement="bottom"
                                                title={__('刷新')}
                                            >
                                                <RefreshOutlined
                                                    className={styles.iconBtn}
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        onUpdatePaste()
                                                    }}
                                                />
                                            </Tooltip>
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                </div>
                {targetData.length &&
                node.data.expand === ExpandStatus.Expand ? (
                    <div
                        className={styles.formContent}
                        onFocus={() => 0}
                        onBlur={() => 0}
                        onMouseOver={() => {
                            if (
                                searchFieldData(data.items, debouncedValue)
                                    .length > 10
                            ) {
                                setShowPageTurning(true)
                            }
                        }}
                        onMouseLeave={() => {
                            setShowPageTurning(false)
                        }}
                    >
                        <div className={styles.formContentData}>
                            {targetData.map((item, index) => {
                                return (
                                    <div
                                        className={classnames(
                                            styles.formItem,
                                            styles.formTargetItem,
                                            getSelectClassName(item),
                                        )}
                                        key={index}
                                        onFocus={() => 0}
                                        onBlur={() => 0}
                                        onMouseOver={() => {
                                            setShowFiledOptions(item.id)
                                        }}
                                        onMouseLeave={() => {
                                            setShowFiledOptions('')
                                        }}
                                        onClick={(e) => {
                                            handleClickField(item)
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                    >
                                        <div
                                            className={
                                                styles.formItemTextContent
                                            }
                                        >
                                            <div
                                                className={styles.fromItemText}
                                                title={item.name}
                                            >
                                                <span
                                                    onClick={(e) => {
                                                        editField(item)
                                                    }}
                                                >
                                                    {item.name}
                                                    {checkFieldStandardStatus(
                                                        item,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            {showFiledOptions === item.id &&
                                            model === ViewModel.ModelEdit ? (
                                                <div
                                                    className={
                                                        styles.formOptions
                                                    }
                                                >
                                                    {item.processing_source_id
                                                        .length ? (
                                                        <div
                                                            className={classnames(
                                                                styles.formLeftBtn,
                                                                styles.formTitleBtn,
                                                            )}
                                                        >
                                                            <Tooltip
                                                                placement="bottom"
                                                                title={__(
                                                                    '解绑',
                                                                )}
                                                            >
                                                                <UnQuoteOutlined
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.preventDefault()
                                                                        e.stopPropagation()
                                                                        handleUnQuoteFields(
                                                                            item,
                                                                        )
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        </div>
                                                    ) : (
                                                        <div />
                                                    )}
                                                </div>
                                            ) : (
                                                <div>{item.type}</div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div
                            className={classnames(
                                styles.formContentPageTurning,
                                styles.standardFormPageTurning,
                            )}
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
                                              color: 'rgba(0,0,0,0.25)',
                                              cursor: 'default',
                                          }
                                        : {}
                                }
                            />
                            <div>
                                {`${data.offset + 1} /
                                    ${Math.ceil(
                                        searchFieldData(
                                            data.items,
                                            debouncedValue,
                                        ).length / 10,
                                    )}`}
                            </div>
                            <RightOutlined
                                onClick={(e) => {
                                    if (
                                        data.offset + 1 ===
                                        Math.ceil(
                                            searchFieldData(
                                                data.items,
                                                debouncedValue,
                                            ).length / 10,
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
                                            debouncedValue,
                                        ).length / 10,
                                    )
                                        ? {
                                              color: 'rgba(0,0,0,0.25)',
                                              cursor: 'default',
                                          }
                                        : {}
                                }
                            />
                        </div>
                    </div>
                ) : (
                    node.data.expand === ExpandStatus.Expand && (
                        <div className={styles.formEmpty}>
                            <div className={styles.formEmpty}>
                                {debouncedValue
                                    ? __('抱歉，没有找到相关内容')
                                    : __('暂无数据')}
                            </div>
                        </div>
                    )
                )}
            </div>
        </ConfigProvider>
    )
}

const standardFormNodeRegistry = (callback?: any) => {
    if (callback) {
        callbackColl = callback
    }
    register({
        shape: 'table-standard-node',
        effect: ['data'],
        component: StandardFormComponent,
    })
    return 'table-standard-node'
}

export default standardFormNodeRegistry
