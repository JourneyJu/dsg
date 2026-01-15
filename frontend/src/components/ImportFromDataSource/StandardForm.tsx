import * as React from 'react'
import { useState, useEffect } from 'react'
import { register } from '@antv/x6-react-shape'
import {
    CloseCircleFilled,
    LeftOutlined,
    RightOutlined,
    SearchOutlined,
    CaretDownOutlined,
    CaretUpOutlined,
} from '@ant-design/icons'
import classnames from 'classnames'
import { ConfigProvider, Input, Tooltip } from 'antd'
import { useDebounce } from 'ahooks'
import { MysqlOutlined, MajorKeyOutlined, UniqueFlagColored } from '@/icons'
import styles from './styles.module.less'
import {
    ExpandStatus,
    getCurrentShowData,
    OptionType,
} from '../FormGraph/helper'
import __ from './locale'
import { ViewModel } from '@/core'
import { getDataTableSearchFields, searchFieldData } from './helper'
import Icons from '../DataSource/Icons'
import { DataBaseType } from '../DataSource/const'
import { SearchInput } from '@/ui'
import DataTypeIcons from '../DataSynchronization/Icons'
import { getFieldTypeEelment } from '../DatasheetView/helper'

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
    const [businessFields, setBusinessFields] = useState<Array<any>>([])
    const [filterDSTableData, setFilterDSTableData] = useState<any[]>([])

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

        const searchFields = getDataTableSearchFields(
            data.items,
            fields,
            data.keyWord,
        )
        setFilterDSTableData(searchFields)

        setTargetData(getCurrentShowData(data.offset, searchFields, 10))
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
            node.resize(284, 42)
        } else if (!targetData.length) {
            node.resize(284, 166)
        } else if (targetData.length <= 10) {
            node.resize(284, 42 + targetData.length * 28 + 20)
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
                            '#D5D5D5',
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
                        '#D5D5D5',
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
        if (errorFieldsId?.includes(item.id)) {
            return styles.formTargetItemError
        }
        return ''
    }

    return (
        <ConfigProvider
            prefixCls="any-fabric-ant"
            iconPrefixCls="any-fabric-anticon"
        >
            <div
                className={classnames(
                    styles.formNode,
                    styles.formOriginNode,
                    styles.dataFormNode,
                )}
            >
                <div
                    className={classnames(
                        styles.formStandardtHeader,
                        styles.formHeader,
                    )}
                >
                    <div className={styles['top-border']} />
                    <div
                        className={classnames(
                            styles.formTitle,
                            styles.standardFormTitle,
                        )}
                    >
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
                            <>
                                {!!targetData.length &&
                                node.data.expand === ExpandStatus.Expand ? (
                                    <Tooltip
                                        placement="bottom"
                                        title={__('收起')}
                                    >
                                        <CaretUpOutlined
                                            className={styles.arrow}
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
                                        <CaretDownOutlined
                                            className={styles.arrow}
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
                                <span
                                    title={data.formInfo.name}
                                    className={styles.formName}
                                >
                                    {data.formInfo.name}
                                </span>
                            </>
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
                            if (filterDSTableData.length > 10) {
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
                                                className={styles['type-icon']}
                                            >
                                                {/* <DataTypeIcons
                                                    type={item.type}
                                                    color="rgba(0, 0, 0, 0.65)"
                                                /> */}
                                                {getFieldTypeEelment(
                                                    {
                                                        ...item,
                                                        type: item.type,
                                                    },
                                                    14,
                                                )}
                                            </div>
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
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            {item.is_primary_key ? (
                                                <UniqueFlagColored
                                                    className={styles.majorKey}
                                                />
                                            ) : null}
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
                            <div className={styles['page-info']}>
                                {`${data.offset + 1} /
                                    ${Math.ceil(
                                        filterDSTableData.length / 10,
                                    )}`}
                            </div>
                            <RightOutlined
                                onClick={(e) => {
                                    if (
                                        data.offset + 1 ===
                                        Math.ceil(filterDSTableData.length / 10)
                                    ) {
                                        return
                                    }
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handlePageDown()
                                }}
                                style={
                                    data.offset + 1 ===
                                    Math.ceil(filterDSTableData.length / 10)
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
                                {data.keyword
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
