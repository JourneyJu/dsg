import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { register } from '@antv/x6-react-shape'
import {
    CloseCircleFilled,
    LeftOutlined,
    RightOutlined,
    SearchOutlined,
    ExclamationCircleOutlined,
    ShrinkOutlined,
    ArrowsAltOutlined,
    CaretUpOutlined,
    CaretDownOutlined,
} from '@ant-design/icons'
import classnames from 'classnames'
import { ConfigProvider, Input, Tooltip } from 'antd'
import { useDebounce } from 'ahooks'
import {
    FormDetailOutlined,
    MajorKeyOutlined,
    DefineBusinessObjOutlined,
    StandardOutlined,
    UniqueFlagColored,
} from '@/icons'
import styles from './styles.module.less'
import {
    ExpandStatus,
    getCurrentShowData,
    OptionType,
} from '../FormGraph/helper'
import __ from './locale'
import { formsEnumConfig, ViewModel } from '@/core'
import { searchFieldData } from './helper'
import { enBeginNameReg } from '@/utils'
import { SearchInput } from '@/ui'
import Icons from './Icons'
import { getFieldTypeEelment } from '../DatasheetView/helper'

let callbackColl: any = []

const BusinessFormComponent = (props: any) => {
    const { node } = props
    const { data } = node
    const [showFiledOptions, setShowFiledOptions] = useState<string>('')
    const [targetData, setTargetData] = useState<Array<any>>([])
    const [showPagTurning, setShowPageTurning] = useState<boolean>(false)
    const [singleSelected, setSingleSelected] = useState<string>('')
    const [formInfo, setFormInfo] = useState<any>(null)
    const [model, setModel] = useState<ViewModel>(ViewModel.ModelEdit)
    const [errorFieldsId, setErrorFieldsId] = useState<Array<string>>([])
    const [dataTypeOptions, setDataTypeOptions] = useState<Array<any>>([])
    const [searchKey, setSearchKey] = useState<string>('')
    const debouncedValue = useDebounce(searchKey, { wait: 500 })
    const [searchStatus, setSearchStatus] = useState<boolean>(false)
    const [formEditName, setFormEditName] = useState<string>('')
    const [formEditNameStatus, setFormEditNameStatus] = useState<boolean>(false)
    const [formNameStatus, setFormNameStatus] = useState<boolean>(true)
    // 属性不完整的字段数量
    const incompleteFieldsCount = useMemo(
        () => data.items.filter((item) => !item.name).length,
        [data],
    )

    useEffect(() => {
        getEnumConfig()
        node.setData({
            ...data,
            type: 'business',
        })
    }, [])

    useEffect(() => {
        const updateAllPortAndEdge = callbackColl[1]()
        const dataNode = callbackColl[8]()()
        if (debouncedValue !== node.data.keyWord) {
            node.setData({
                ...node.data,
                keyWord: debouncedValue,
                offset: 0,
            })
            if (dataNode) {
                dataNode.setData({
                    ...dataNode.data,
                    keyWord: debouncedValue,
                    offset: 0,
                })
            }
            updateAllPortAndEdge()
        }
    }, [debouncedValue])

    useEffect(() => {
        setModel(callbackColl[6]() || ViewModel.ModelEdit)
        setTargetData(
            getCurrentShowData(
                data.offset,
                searchFieldData(data.items, data.keyWord),
                10,
            ),
        )
        setSingleSelected(data.singleSelectedId)
        setFormInfo(data.formInfo)
        const initErrors = callbackColl[9]()
        if (initErrors) {
            setErrorFieldsId(Object.keys(initErrors))
        } else {
            setErrorFieldsId([])
        }
    }, [data])

    // useEffect()
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
        const standardNode = callbackColl[8]()()
        node.setData({
            ...data,
            offset: data.offset + 1,
        })
        standardNode.setData({
            ...standardNode.data,
            offset: data.offset + 1,
        })
        updateAllPortAndEdge()
    }

    /**
     * 上一页
     */
    const handlePageUp = () => {
        const updateAllPortAndEdge = callbackColl[1]()
        const standardNode = callbackColl[8]()()
        node.setData({
            ...data,
            offset: data.offset - 1,
        })
        standardNode.setData({
            ...standardNode.data,
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
            allNodes.forEach((currentNode) => {
                if (currentNode.shape === 'table-standard-node') {
                    const { items } = currentNode.data
                    if (items.find((pasteItem) => pasteItem.id === item.id)) {
                        currentNode.setData({
                            ...currentNode.data,
                            singleSelectedId: item.id,
                        })
                        if (edgeRelation.multipleSelected.length) {
                            edgeRelation.multipleSelected.forEach((id) => {
                                edgeRelation.quoteData[id]?.attr(
                                    'line/stroke',
                                    '#D5D5D5',
                                )
                            })
                        }
                        edgeRelation.onMultipleSelectData([item.id])
                        edgeRelation.quoteData[item.id]?.attr(
                            'line/stroke',
                            '#126EE3',
                        )
                    } else {
                        currentNode.replaceData({
                            ...currentNode.data,
                            selectedId: [],
                        })
                        if (edgeRelation.multipleSelected.length) {
                            edgeRelation.multipleSelected.forEach((id) => {
                                edgeRelation.quoteData[id]?.attr(
                                    'line/stroke',
                                    '#D5D5D5',
                                )
                            })
                        }
                    }
                }
            })
        }
    }

    /**
     * 编辑字段
     */
    const editField = (item, index) => {
        const optionGraphData = callbackColl[2]()
        optionGraphData(OptionType.EditTargetField, { ...item, index }, node)
    }

    const handleEditFirstIncompleteField = () => {
        const firstIncompleteFieldIndex = node.data.items.findIndex(
            (field) => !field.name,
        )
        editField(
            node.data.items[firstIncompleteFieldIndex],
            firstIncompleteFieldIndex,
        )
        // 设置选中项以及 编辑项的页码
        const offset = Math.floor(firstIncompleteFieldIndex / 10)
        const standardNode = callbackColl[8]()()
        const updateAllPortAndEdge = callbackColl[1]()
        if (offset === node.data.offset) {
            node.replaceData({
                ...node.data,
                singleSelectedId: node.data.items[firstIncompleteFieldIndex].id,
            })

            standardNode?.replaceData({
                ...standardNode?.data,
                singleSelectedId: node.data.items[firstIncompleteFieldIndex].id,
            })
        } else {
            node.replaceData({
                ...node.data,
                offset,
                singleSelectedId: node.data.items[firstIncompleteFieldIndex].id,
            })

            standardNode?.replaceData({
                ...standardNode?.data,
                offset,
                singleSelectedId: node.data.items[firstIncompleteFieldIndex].id,
            })
        }

        updateAllPortAndEdge(node)
    }

    /**
     * 编辑表
     */
    const editForm = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const optionGraphData = callbackColl[2]()
        optionGraphData(OptionType.ViewOriginFormDetail, formInfo, node)
    }

    /**
     * 表格展示字段
     */
    const onViewTable = () => {
        const setViewNode = callbackColl[3]()
        setViewNode(node)
    }

    /**
     * 关联业务表对象/活动
     */
    const relateBusinessObject = () => {
        callbackColl[4]()(true)
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
        return ''
    }
    // 获取枚举值
    const getEnumConfig = async () => {
        const enumConfig = await formsEnumConfig()
        setDataTypeOptions(enumConfig?.data_type)
    }
    return (
        <ConfigProvider
            prefixCls="any-fabric-ant"
            iconPrefixCls="any-fabric-anticon"
        >
            <div className={classnames(styles.formNode, styles.formOriginNode)}>
                <div
                    className={classnames(
                        styles.formOriginHeader,
                        styles.formHeader,
                    )}
                >
                    <div className={styles['top-border']} />
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
                                                    },
                                                })
                                                setFormNameStatus(
                                                    enBeginNameReg.test(
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
                                        )}
                                    >
                                        {formInfo?.name ? (
                                            <div
                                                className={
                                                    styles.formInfoWrapper
                                                }
                                            >
                                                <div className={styles.arrow}>
                                                    {node.data.expand ===
                                                    ExpandStatus.Expand ? (
                                                        <Tooltip
                                                            placement="bottom"
                                                            title={__('收起')}
                                                        >
                                                            <CaretUpOutlined
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    node.setData(
                                                                        {
                                                                            ...node.data,
                                                                            expand: ExpandStatus.Retract,
                                                                        },
                                                                    )
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
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    node.setData(
                                                                        {
                                                                            ...node.data,
                                                                            expand: ExpandStatus.Expand,
                                                                        },
                                                                    )
                                                                    onUpdateGraph()
                                                                    e.preventDefault()
                                                                    e.stopPropagation()
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                <div
                                                    className={styles.formName}
                                                    title={formInfo?.name || ''}
                                                    onClick={(e) => editForm(e)}
                                                >
                                                    {formInfo?.name || ''}
                                                </div>
                                                {errorFieldsId.length ||
                                                    (incompleteFieldsCount >
                                                        0 && (
                                                        <Tooltip
                                                            title={__(
                                                                '${count}个字段属性不完整',
                                                                {
                                                                    count:
                                                                        errorFieldsId.length ||
                                                                        incompleteFieldsCount,
                                                                },
                                                            )}
                                                        >
                                                            <ExclamationCircleOutlined
                                                                className={
                                                                    styles.incompleteIcon
                                                                }
                                                                onClick={
                                                                    handleEditFirstIncompleteField
                                                                }
                                                            />
                                                        </Tooltip>
                                                    ))}

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
                                            </div>
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
                                {/* <div className={styles.formTitleBtn}>
                                    <Tooltip
                                        placement="bottom"
                                        title={__('业务表详情')}
                                    >
                                        <FormDetailOutlined
                                            onClick={() => {
                                                onViewTable()
                                            }}
                                        />
                                    </Tooltip>
                                </div> */}
                                <div className={styles.formTitleBtn}>
                                    <Tooltip
                                        placement="bottom"
                                        title={
                                            callbackColl[5]()
                                                ? __('定义业务对象/活动')
                                                : __(
                                                      '请保存后，再定义业务对象/活动',
                                                  )
                                        }
                                    >
                                        <DefineBusinessObjOutlined
                                            className={classnames(
                                                styles.relateObjIcon,
                                                !callbackColl[5]() &&
                                                    styles.disabledRelateObjIcon,
                                            )}
                                            onClick={() => {
                                                if (!callbackColl[5]()) return
                                                relateBusinessObject()
                                            }}
                                        />
                                    </Tooltip>
                                </div>
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
                                            editField(item, index)
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                    >
                                        <div
                                            className={
                                                styles.formItemTextContent
                                            }
                                        >
                                            {/* <Icons
                                                type={item.data_type}
                                                color="rgba(0, 0, 0, 0.65)"
                                            /> */}
                                            <span
                                                style={{
                                                    marginRight: 4,
                                                    color: 'rgba(0, 0, 0, 0.65)',
                                                }}
                                            >
                                                {getFieldTypeEelment(
                                                    {
                                                        ...item,
                                                        type: item.data_type,
                                                    },
                                                    14,
                                                )}
                                            </span>
                                            <div
                                                className={classnames({
                                                    [styles.fromItemText]:
                                                        item.name,
                                                })}
                                                title={item.name}
                                            >
                                                {item.name ? (
                                                    <>
                                                        <span>{item.name}</span>
                                                        {errorFieldsId.length &&
                                                        errorFieldsId.includes(
                                                            item.id,
                                                        ) ? (
                                                            <Tooltip
                                                                title={__(
                                                                    '属性不完整',
                                                                )}
                                                            >
                                                                <ExclamationCircleOutlined
                                                                    className={
                                                                        styles.incompleteIcon
                                                                    }
                                                                />
                                                            </Tooltip>
                                                        ) : null}
                                                    </>
                                                ) : (
                                                    <>
                                                        <span
                                                            className={
                                                                styles.noFieldName
                                                            }
                                                        >
                                                            {__(
                                                                '请完善中文名称',
                                                            )}
                                                        </span>
                                                        <Tooltip
                                                            title={__(
                                                                '属性不完整',
                                                            )}
                                                        >
                                                            <ExclamationCircleOutlined
                                                                className={
                                                                    styles.incompleteIcon
                                                                }
                                                            />
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.rightContent}>
                                            {item.is_standardization_required ? (
                                                <StandardOutlined
                                                    className={classnames({
                                                        [styles.standardIcon]:
                                                            true,
                                                        [styles.standardedIcon]:
                                                            item.standardStatus ===
                                                            'normal',
                                                    })}
                                                />
                                            ) : null}
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
                                styles.originFormPageTurning,
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

const businessFormNode = (callback?: any) => {
    if (callback) {
        callbackColl = callback
    }
    register({
        shape: 'table-business-node',
        effect: ['data'],
        component: BusinessFormComponent,
    })
    return 'table-business-node'
}

export default businessFormNode
