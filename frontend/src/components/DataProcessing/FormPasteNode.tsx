import * as React from 'react'
import { useState, useEffect } from 'react'
import { register } from '@antv/x6-react-shape'
import {
    LeftOutlined,
    RightOutlined,
    ShrinkOutlined,
    ArrowsAltOutlined,
    InsertRowAboveOutlined,
} from '@ant-design/icons'
import classnames from 'classnames'
import { Button, ConfigProvider, Input, Tooltip } from 'antd'
import { useDebounce } from 'ahooks'
import {
    AddOutlined,
    EditOutlined,
    FormDetailOutlined,
    RecycleBinOutlined,
    StandardOutlined,
    CloseOutlined,
    XlsColored,
    RefreshOutlined,
    DataOriginConfigOutlined,
} from '@/icons'
import { FormFiled } from '@/core/apis/businessGrooming/index.d'
import styles from './styles.module.less'
import {
    ExpandStatus,
    getCurrentShowData,
    newFieldTemplate,
    OptionType,
    searchFieldData,
} from '../FormGraph/helper'
import __ from './locale'
import { PasteSourceChecked } from '../DataCollection/const'
import DataSourcIcons from '../DataSource/Icons'
import { ViewModel } from './const'

let callbackColl: any = []

const FormPasteNodeComponent = (props: any) => {
    const { node } = props
    const { data } = node
    const [targetData, setTargetData] = useState<Array<any>>([])
    const [selected, setSelected] = useState<Array<string>>([])
    const [showPagTurning, setShowPageTurning] = useState<boolean>(false)
    const [formInfo, setFormInfo] = useState<any>(null)
    const [model, setModel] = useState<string>('edit')
    const [errorStatus, setErrorStatus] = useState<boolean>(false)

    useEffect(() => {
        node.setData({
            ...data,
            type: 'pasteSource',
        })
    }, [])

    useEffect(() => {
        setModel(callbackColl[1]() || 'view')
        setTargetData(getCurrentShowData(data.offset, data.items, 10))
        setSelected(data.selectedId)
        setFormInfo(data.formInfo)
        setErrorStatus(data.errorStatus)
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
     * 下一页
     */
    const handlePageDown = () => {
        node.setData({
            ...data,
            offset: data.offset + 1,
        })
        onUpdateGraph()
    }

    /**
     * 上一页
     */
    const handlePageUp = () => {
        node.setData({
            ...data,
            offset: data.offset - 1,
        })
        onUpdateGraph()
    }

    /**
     * 选择当前行数据
     */
    const handleClickField = (item) => {
        const graphCase = callbackColl[0]()
        const edgeRelation = callbackColl[9]()
        node.replaceData({
            ...node.data,
            selectedId: [item.id],
        })
        if (graphCase && graphCase.current) {
            const allNodes = graphCase.current.getNodes()
            if (edgeRelation.quoteData[item.id]) {
                allNodes.forEach((currentNode) => {
                    if (currentNode.shape === 'table-standard-node') {
                        const { items } = currentNode.data
                        const originField = items.find((originItem) =>
                            originItem.processing_source_id.includes(item.id),
                        )
                        if (originField) {
                            currentNode.setData({
                                ...currentNode.data,
                                singleSelectedId: originField.id,
                            })
                            if (edgeRelation.multipleSelected.length) {
                                edgeRelation.multipleSelected.forEach((id) => {
                                    edgeRelation.quoteData[id].attr(
                                        'line/stroke',
                                        '#979797',
                                    )
                                })
                            }
                            edgeRelation.onMultipleSelectData([item.id])
                            edgeRelation.quoteData[item.id].attr(
                                'line/stroke',
                                '#126EE3',
                            )
                        } else {
                            currentNode.setData({
                                ...currentNode.data,
                                singleSelectedId: '',
                            })
                            if (edgeRelation.multipleSelected.length) {
                                edgeRelation.multipleSelected.forEach((id) => {
                                    edgeRelation.quoteData[id].attr(
                                        'line/stroke',
                                        '#979797',
                                    )
                                })
                            }
                        }
                    } else if (currentNode.shape === 'table-business-node') {
                        currentNode.setData({
                            ...currentNode.data,
                            singleSelectedId: '',
                        })
                    } else {
                        currentNode.setData({
                            ...currentNode.data,
                            selectedId: [],
                        })
                    }
                })
            } else {
                allNodes.forEach((currentNode) => {
                    if (
                        currentNode.id !== node.id &&
                        currentNode.shape === 'table-paste-node'
                    ) {
                        currentNode.setData({
                            ...currentNode.data,
                            selectedId: [],
                        })
                    } else {
                        currentNode.setData({
                            ...currentNode.data,
                            singleSelectedId: '',
                        })
                    }
                })
                if (edgeRelation.multipleSelected.length) {
                    edgeRelation.multipleSelected.forEach((id) => {
                        edgeRelation.quoteData[id].attr(
                            'line/stroke',
                            '#979797',
                        )
                    })
                }
            }
        }
    }

    /**
     * 编辑表
     */
    const editForm = (e) => {
        const setEditNode = callbackColl[6]()
        setEditNode(node)
        e.preventDefault()
        e.stopPropagation()
    }

    /**
     * 删除贴源表
     */
    const deletePasteForm = () => {
        const setDeleteNode = callbackColl[5]()
        setDeleteNode(node)
    }

    /**
     * 更新画布
     */
    const onUpdateGraph = () => {
        const onUpdate = callbackColl[4]()
        onUpdate(node)
    }

    /**
     * 获取选中颜色
     */
    const getSelectClassName = (item) => {
        if (selected.includes(item.id)) {
            return styles.formTargetItemSelected
        }
        return ''
    }

    const getFormClassName = () => {
        if (errorStatus) {
            return styles.formOriginNodeError
        }
        return styles.formOriginNode
    }

    /**
     * 编辑字段
     */
    const handleViewFields = (field) => {
        const onEditFields = callbackColl[3]()
        onEditFields(field)
    }

    return (
        <ConfigProvider
            prefixCls="any-fabric-ant"
            iconPrefixCls="any-fabric-anticon"
        >
            <div className={classnames(styles.formNode, getFormClassName())}>
                <div
                    className={classnames(
                        styles.formPastetHeader,
                        styles.formHeader,
                    )}
                >
                    <div className={styles.formTitle}>
                        <div className={styles.formTitleLabel}>
                            <InsertRowAboveOutlined
                                className={styles.iconStatusCollected}
                            />
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
                            <div
                                className={styles.formTitleText}
                                title={formInfo?.name || ''}
                            >
                                <span onClick={editForm}>
                                    {formInfo?.name || ''}
                                </span>
                            </div>
                        </div>

                        <div className={styles.formTitleTool}>
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
                                                    callbackColl[2]()
                                                setConfigDataOrigin(node)
                                            }}
                                        />
                                    </Tooltip>
                                </div>
                            )}
                            <div className={styles.formTitleBtn}>
                                {node.data.expand === ExpandStatus.Expand ? (
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
                            {model === ViewModel.ModelEdit && (
                                <div className={styles.formTitleBtn}>
                                    <Tooltip
                                        placement="bottom"
                                        title={__('删除')}
                                    >
                                        <CloseOutlined
                                            className={styles.iconBtn}
                                            onClick={(e) => {
                                                deletePasteForm()
                                                e.preventDefault()
                                                e.stopPropagation()
                                            }}
                                        />
                                    </Tooltip>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {targetData.length ? (
                    <div
                        className={styles.formContent}
                        onFocus={() => 0}
                        onBlur={() => 0}
                        onMouseOver={() => {
                            if (data.items.length > 10) {
                                setShowPageTurning(true)
                            }
                        }}
                        onMouseLeave={() => {
                            setShowPageTurning(false)
                        }}
                    >
                        {node.data.expand === ExpandStatus.Expand && (
                            <div className={styles.formContentData}>
                                {targetData.map((item, index) => {
                                    return (
                                        <div
                                            className={classnames(
                                                styles.formItem,
                                                styles.formPasteItem,
                                                getSelectClassName(item),
                                            )}
                                            key={index}
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
                                                    className={
                                                        styles.fromItemText
                                                    }
                                                    title={item.name}
                                                >
                                                    <span
                                                        onClick={(e) => {
                                                            handleViewFields(
                                                                item,
                                                            )
                                                        }}
                                                    >
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div>{item.type}</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        {node.data.expand === ExpandStatus.Expand && (
                            <div
                                className={classnames(
                                    styles.formContentPageTurning,
                                    styles.pasteFormPageTurning,
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
                                ${Math.ceil(data.items.length / 10)}`}
                                </div>

                                <RightOutlined
                                    onClick={(e) => {
                                        if (
                                            data.offset + 1 ===
                                            Math.ceil(data.items.length / 10)
                                        ) {
                                            return
                                        }
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handlePageDown()
                                    }}
                                    style={
                                        data.offset + 1 ===
                                        Math.ceil(data.items.length / 10)
                                            ? {
                                                  color: 'rgba(0,0,0,0.25)',
                                                  cursor: 'default',
                                              }
                                            : {}
                                    }
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    node.data.expand === ExpandStatus.Expand && (
                        <div className={styles.formEmpty}>
                            <div className={styles.formEmpty}>
                                {__('暂无数据')}
                            </div>
                        </div>
                    )
                )}
            </div>
        </ConfigProvider>
    )
}

const formPasteNode = (callback?: any) => {
    if (callback) {
        callbackColl = callback
    }
    register({
        shape: 'table-paste-node',
        effect: ['data'],
        component: FormPasteNodeComponent,
    })
    return 'table-paste-node'
}

export default formPasteNode
