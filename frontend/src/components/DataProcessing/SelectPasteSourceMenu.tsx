import * as React from 'react'
import { useState, useEffect } from 'react'
import { useDebounce, useGetState } from 'ahooks'
import { Modal, Form, Select, Tooltip } from 'antd'
import { RightOutlined, DownOutlined } from '@ant-design/icons'
import classnames from 'classnames'
import { v4 as uuidv4 } from 'uuid'
import {
    AddOutlined,
    DragOutlined,
    FormDetailOutlined,
    DepartmentOutlined,
} from '@/icons'
import __ from './locale'
import styles from './styles.module.less'
// import { addFormType } from './const'
import {
    getCollectTablesForProcess,
    getCurrentDepartmentDataTable,
    getMetaDataTables,
    searchDataTablesFromMetaData,
} from '@/core'
import {
    MetaDataFormInfo,
    SourceFormInfo,
} from '@/core/apis/businessGrooming/index.d'

interface SelectPasteSourceMenuType {
    onClick: () => void
    onStartDrag: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        pasteData:
            | SourceFormInfo
            | {
                  name: string
                  id: string
              },
    ) => void
    existFormIds: Array<string>
    onSelectMetaData: (forms: Array<SourceFormInfo>) => void
    defaultMetaForms: Array<SourceFormInfo>
    fid: string
}

const SelectPasteSourceMenu = ({
    onClick,
    onStartDrag,
    existFormIds,
    onSelectMetaData,
    defaultMetaForms,
    fid,
}: SelectPasteSourceMenuType) => {
    const [form] = Form.useForm()
    const [collectedData, setCollectedData] = useState<
        Array<{
            name: string
            id: string
        }>
    >([])
    const [addMetaFormStatus, setAddMetaFormStatus] = useState<boolean>(false)
    const [selectMetaFormData, setSelectMetaFormData] = useState<
        Array<MetaDataFormInfo>
    >([])
    const [metaForms, setMetaForms] = useState<Array<SourceFormInfo>>([])
    const [options, setOptions] = useState<Array<any>>([])
    const [keyword, setKeyword] = useState<string>('')
    const debouncedValue = useDebounce(keyword, { wait: 500 })
    const [loading, setLoading] = useState<boolean>(false)
    const [hoverItem, setHoverItem] = useState<string>('')
    const [metaFormsExpand, setMetaFormsExpand] = useState<boolean>(true)
    const [collectDataExpand, setCollectDataExpand] = useState<boolean>(true)
    const [metaFormsHover, setMetaFormsHover] = useState<boolean>(false)
    const [selectedMetaData, setSelectedMetaData, getSelectedMetaData] =
        useGetState<Array<string>>([])
    const [departmentTables, setDepartmentTables] = useState<
        Array<{ name: string; id: string }>
    >([])
    const [departmentName, setDepartmentName] = useState<string>('')
    const [departmentTablesExpand, setDepartmentTablesExpand] =
        useState<boolean>(true)
    const [departmentExpand, setDepartmentExpand] = useState<boolean>(true)
    const [metaFormTotal, setMetaFormTotal] = useState<number>(0)

    useEffect(() => {
        getRecentlySyncedData()
        getDepartmentTables()
    }, [])

    useEffect(() => {
        if (addMetaFormStatus) {
            searchMetaDataForm([])
        }
    }, [debouncedValue, addMetaFormStatus])

    useEffect(() => {
        setMetaForms(defaultMetaForms)
    }, [defaultMetaForms])

    useEffect(() => {
        setSelectedMetaData(
            metaForms
                .filter((metaForm) => existFormIds.includes(metaForm.id))
                .map((metaForm) => metaForm.metadata_table_id),
        )
    }, [metaForms])

    useEffect(() => {
        setSelectedMetaData(
            metaForms
                .filter((metaForm) => existFormIds.includes(metaForm.id))
                .map((metaForm) => metaForm.metadata_table_id),
        )
    }, [existFormIds])

    /**
     * 获取最近同步
     */
    const getRecentlySyncedData = async () => {
        const { entries } = await getCollectTablesForProcess(fid)
        setCollectedData(entries)
        setLoading(false)
    }

    const getDepartmentTables = async () => {
        const { department_name, tables } = await getCurrentDepartmentDataTable(
            fid,
        )

        setDepartmentTables(tables)
        setDepartmentName(department_name)
    }

    /**
     * 搜索元数据的表
     */
    const searchMetaDataForm = async (initOptions) => {
        const { entries, total_count } = await searchDataTablesFromMetaData(
            debouncedValue || '',
            initOptions.length ? initOptions.length / 20 + 1 : 1,
        )
        setMetaFormTotal(total_count)
        setOptions([
            ...initOptions,
            ...entries.map((tableData) => ({
                label: getOptionLabel(tableData.name),
                value: tableData.metadata_table_id,
                data: tableData,
                disabled: getSelectedMetaData().includes(
                    tableData.metadata_table_id,
                ),
            })),
        ])
    }

    /**
     * 获取下拉选项标签
     * @param name 名称
     * @returns
     */
    const getOptionLabel = (name) => {
        return (
            <div className={styles.selectMetaOptions} title={name}>
                <FormDetailOutlined />
                <div className={styles.name}>{name}</div>
            </div>
        )
    }

    /**
     * 从元数据平台选择贴源表
     */
    const addMetaDataSourceTable = async () => {
        if (selectMetaFormData.length) {
            const metaSourceData = await Promise.all(
                selectMetaFormData.map((selectMetaForm) =>
                    getMetaDataTables(selectMetaForm.metadata_table_id, {
                        data_source_id: selectMetaForm.data_source_id,
                        schema_id: selectMetaForm.schema_id,
                    }),
                ),
            )

            const sourceDataInfo = metaSourceData.map((item) => ({
                ...item,
                id: uuidv4(),
                fields: item.fields.map((field) => ({
                    ...field,
                    id: uuidv4(),
                })),
            }))

            setMetaForms([
                ...sourceDataInfo,
                ...metaForms.filter(
                    (metaForm) =>
                        !sourceDataInfo.find(
                            (item) =>
                                item.metadata_table_id ===
                                metaForm.metadata_table_id,
                        ),
                ),
            ])
            onSelectMetaData(sourceDataInfo)
        }
    }

    /**
     * 滚动加载
     * @param e
     */
    const getMetaFormsByScroll = (e) => {
        const { target } = e
        if (
            target.scrollTop + target.offsetHeight === target.scrollHeight &&
            metaFormTotal > options.length
        ) {
            searchMetaDataForm(options)
        }
    }

    return (
        <div className={styles.selectMenu}>
            <div>
                <div className={styles.menuTitle}>{__('数据表列表')}</div>
            </div>
            <div
                style={{
                    height: 'calc(100vh - 90px)',
                    overflowY: 'auto',
                }}
            >
                <Tooltip
                    placement="bottom"
                    title={metaFormsExpand ? __('点击收起') : __('点击展开')}
                >
                    <div
                        className={styles.tltleBar}
                        onClick={(e) => {
                            setMetaFormsExpand(!metaFormsExpand)
                        }}
                        onFocus={() => 0}
                        onBlur={() => 0}
                        onMouseOver={() => {
                            setMetaFormsHover(true)
                        }}
                        onMouseLeave={() => {
                            setMetaFormsHover(false)
                        }}
                    >
                        <div>{__('来自元数据平台')}</div>

                        {metaFormsHover ? (
                            <Tooltip placement="bottom" title={__('添加')}>
                                <div
                                    className={styles.titleBtn}
                                    onClick={(e) => {
                                        form.resetFields()
                                        setSelectMetaFormData([])
                                        setAddMetaFormStatus(true)
                                        e.preventDefault()
                                        e.stopPropagation()
                                    }}
                                >
                                    <AddOutlined />
                                </div>
                            </Tooltip>
                        ) : (
                            <div />
                        )}
                    </div>
                </Tooltip>
                {metaFormsExpand && (
                    <div className={styles.formDataList}>
                        {metaForms.map((pasteData) => {
                            return (
                                <div
                                    className={classnames(
                                        styles.formDataItem,
                                        existFormIds.includes(pasteData.id) &&
                                            styles.formDataItemDisabled,
                                    )}
                                    onMouseDown={(e) => {
                                        if (
                                            !existFormIds.includes(pasteData.id)
                                        ) {
                                            onStartDrag(e, pasteData)
                                        }
                                    }}
                                    onFocus={() => 0}
                                    onBlur={() => 0}
                                    onMouseOver={() => {
                                        setHoverItem(pasteData.id)
                                    }}
                                    onMouseLeave={() => {
                                        setHoverItem('')
                                    }}
                                    key={pasteData.id}
                                >
                                    <FormDetailOutlined />
                                    <div
                                        className={styles.name}
                                        title={pasteData.name}
                                    >
                                        {pasteData.name}
                                    </div>
                                    {hoverItem === pasteData.id && (
                                        <DragOutlined
                                            className={styles.dragButton}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
                <Tooltip
                    placement="bottom"
                    title={
                        departmentTablesExpand ? __('点击收起') : __('点击展开')
                    }
                >
                    <div
                        className={styles.tltleBar}
                        onClick={() => {
                            setDepartmentTablesExpand(!departmentTablesExpand)
                        }}
                    >
                        <div>{__('来自所属部门')}</div>
                    </div>
                </Tooltip>
                {departmentTablesExpand && (
                    <div className={styles.formDataList}>
                        <div
                            className={styles.formDepartment}
                            onClick={() => {
                                setDepartmentExpand(!departmentExpand)
                            }}
                        >
                            {departmentExpand ? (
                                <DownOutlined
                                    style={{
                                        fontSize: '12px',
                                    }}
                                />
                            ) : (
                                <RightOutlined
                                    style={{
                                        fontSize: '12px',
                                    }}
                                />
                            )}
                            <div className={styles.department}>
                                <DepartmentOutlined />
                                <div
                                    className={styles.departmentName}
                                    title={departmentName}
                                >
                                    {departmentName}
                                </div>
                            </div>
                        </div>
                        {departmentExpand &&
                            departmentTables.map((departmentTable) => {
                                return (
                                    <div
                                        className={classnames(
                                            styles.formDataItem,
                                            styles.formDepartmentItem,
                                            existFormIds.includes(
                                                departmentTable.id,
                                            ) && styles.formDataItemDisabled,
                                        )}
                                        onMouseDown={(e) => {
                                            if (
                                                !existFormIds.includes(
                                                    departmentTable.id,
                                                )
                                            ) {
                                                onStartDrag(e, departmentTable)
                                            }
                                        }}
                                        onFocus={() => 0}
                                        onBlur={() => 0}
                                        onMouseOver={() => {
                                            setHoverItem(departmentTable.id)
                                        }}
                                        onMouseLeave={() => {
                                            setHoverItem('')
                                        }}
                                        key={departmentTable.id}
                                    >
                                        <FormDetailOutlined />
                                        <div
                                            className={styles.name}
                                            title={departmentTable.name}
                                        >
                                            {departmentTable.name}
                                        </div>
                                        {hoverItem === departmentTable.id && (
                                            <DragOutlined
                                                className={styles.dragButton}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                    </div>
                )}
                <Tooltip
                    placement="bottom"
                    title={collectDataExpand ? __('点击收起') : __('点击展开')}
                >
                    <div
                        className={styles.tltleBar}
                        onClick={() => {
                            setCollectDataExpand(!collectDataExpand)
                        }}
                    >
                        <div>{__('来自数据采集模型')}</div>
                    </div>
                </Tooltip>
                {collectDataExpand && (
                    <div className={styles.formDataList}>
                        {collectedData.map((pasteData) => {
                            return (
                                <div
                                    className={classnames(
                                        styles.formDataItem,
                                        existFormIds.includes(pasteData.id) &&
                                            styles.formDataItemDisabled,
                                    )}
                                    onMouseDown={(e) => {
                                        if (
                                            !existFormIds.includes(pasteData.id)
                                        ) {
                                            onStartDrag(e, pasteData)
                                        }
                                    }}
                                    onFocus={() => 0}
                                    onBlur={() => 0}
                                    onMouseOver={() => {
                                        setHoverItem(pasteData.id)
                                    }}
                                    onMouseLeave={() => {
                                        setHoverItem('')
                                    }}
                                    key={pasteData.id}
                                >
                                    <FormDetailOutlined />
                                    <div
                                        className={styles.name}
                                        title={pasteData.name}
                                    >
                                        {pasteData.name}
                                    </div>
                                    {hoverItem === pasteData.id && (
                                        <DragOutlined
                                            className={styles.dragButton}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <Modal
                open={addMetaFormStatus}
                width={640}
                onCancel={() => {
                    setAddMetaFormStatus(false)
                    form.resetFields()
                    setOptions([])
                    setKeyword('')
                }}
                title={__('添加数据表')}
                onOk={() => {
                    form.submit()
                }}
                maskClosable={false}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(values) => {
                        addMetaDataSourceTable()
                        setAddMetaFormStatus(false)
                        setOptions([])
                        setKeyword('')
                    }}
                    className={styles.selectMetaForm}
                >
                    <Form.Item
                        required
                        label={__('数据表名称')}
                        name="dataForm"
                        rules={[
                            {
                                required: true,
                                message: __('请选择数据表名称'),
                            },
                        ]}
                    >
                        <Select
                            mode="multiple"
                            onSearch={(value) => {
                                setKeyword(value)
                            }}
                            placeholder={__('请选择数据表名称')}
                            searchValue={keyword}
                            options={options}
                            filterOption={false}
                            onBlur={() => {
                                setKeyword('')
                            }}
                            onChange={(value, option) => {
                                setSelectMetaFormData(
                                    option.map((item) => item.data),
                                )
                                setKeyword('')
                            }}
                            onPopupScroll={getMetaFormsByScroll}
                            className={styles.selectText}
                            showArrow
                            allowClear
                            notFoundContent={
                                debouncedValue
                                    ? __('未找到匹配的结果')
                                    : __('暂无数据')
                            }
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default SelectPasteSourceMenu
