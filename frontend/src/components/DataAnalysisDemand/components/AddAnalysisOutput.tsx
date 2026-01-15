import {
    Button,
    Drawer,
    Form,
    Input,
    InputNumber,
    Select,
    Space,
    Table,
    Tooltip,
} from 'antd'
import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import styles from './styles.module.less'
import __ from '../locale'
import { SearchInput } from '@/ui'
import { RadioBox } from '@/components/FormTableMode/helper'
import { CatalogType, formsEnumConfig, IFormEnumConfigModel } from '@/core'
import AddFieldsFromCatalog from '@/components/AddFieldsFromCatalog'
import SelDataByTypeModal from '@/components/SelDataByTypeModal'
import { filterObj } from '../helper'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { generateId } from '../const'
import DataEleDetails from '@/components/DataEleManage/Details'
import CodeTableDetails from '@/components/CodeTableManage/Details'
import CodeRuleDetails from '@/components/CodeRulesComponent/CodeRuleDetails'
import { getPopupContainer } from '@/utils'

interface AddAnalysisOutputProps {
    open: boolean
    onClose: () => void
    onOk: (values: any) => void
    initData?: { name: string; columns: any[] }
}
const AddAnalysisOutput = ({
    open,
    onClose,
    onOk,
    initData,
}: AddAnalysisOutputProps) => {
    const [form] = Form.useForm()
    const [data, setData] = useState<any>([{ id: generateId() }])
    // 字段信息的相关的后端枚举映射
    const [dataTypeOptions, setDataTypeOptions] = useState<any[]>([])
    const [addFieldsOpen, setAddFieldsOpen] = useState(false)
    // 编辑选择数据对话框（用于码表/编码规则/标准文件的选择对话框）
    const [selDataByTypeVisible, setSelDataByTypeVisible] = useState(false)
    const [selDataType, setSelDataType] = useState<CatalogType>(
        CatalogType.CODETABLE,
    )
    const selDataRef: any = useRef()
    const [selDataItems, setSelDataItems] = useState<any[]>([])
    const [selStandardItems, setSelStandardItems] = useState<any[]>([])
    const [operateIndex, setOperateIndex] = useState<number>(0)
    const [detailId, setDetailId] = useState<string | undefined>('')
    const [detailIds, setDetailIds] = useState<Array<any> | undefined>([])
    // 数据元详情
    const [dataEleDetailVisible, setDataEleDetailVisible] =
        useState<boolean>(false)
    // 用于英文名称校验的防抖定时器
    const validateTimerRef = useRef<any>(null)
    // 码表详情
    const [codeTbDetailVisible, setCodeTbDetailVisible] =
        useState<boolean>(false)
    // 编码规则详情
    const [codeRuleDetailVisible, setCodeRuleDetailVisible] =
        useState<boolean>(false)

    const [dataEleMatchType, setDataEleMatchType] = useState<number>(2)

    const getEnumConfig = async () => {
        const enumConfig = await formsEnumConfig()
        const res = (enumConfig?.data_type || []).filter(
            (item) => item.value_en !== 'number',
        )
        setDataTypeOptions(res)
    }

    /**
     * 触发所有有值的英文名称字段的重复性校验
     * @param columnsData 列数据
     * @param delay 延迟时间（毫秒）
     * @returns Promise，包含第一个报错字段的索引（如果有的话）
     */
    const validateAllNameEnFields = (
        columnsData: any[],
        delay = 100,
    ): Promise<number | null> => {
        return new Promise((resolve) => {
            setTimeout(async () => {
                let firstErrorIndex: number | null = null
                const validatePromises = columnsData?.map(
                    async (_: any, idx: number) => {
                        // 只校验已有英文名称值的字段
                        if (columnsData[idx]?.name_en) {
                            try {
                                await form.validateFields([
                                    ['columns', idx, 'name_en'],
                                ])
                                return { index: idx, hasError: false }
                            } catch (error) {
                                return { index: idx, hasError: true }
                            }
                        }
                        return { index: idx, hasError: false }
                    },
                )

                const results = await Promise.all(validatePromises || [])
                // 找到第一个报错的字段索引
                const firstError = results.find((r) => r.hasError)
                if (firstError) {
                    firstErrorIndex = firstError.index
                }
                resolve(firstErrorIndex)
            }, delay)
        })
    }

    /**
     * 滚动到指定索引的表格行
     * @param index 行索引
     */
    const scrollToErrorField = (index: number) => {
        // 增加延迟，确保 DOM 和校验信息都已渲染完成
        setTimeout(() => {
            // 查找 Drawer 内的表格体
            const drawerBody = document.querySelector(
                '.any-fabric-ant-drawer-body',
            )
            if (!drawerBody) return

            const tableBody = drawerBody.querySelector(
                '.any-fabric-ant-table-tbody',
            )
            if (!tableBody) return

            const rows = tableBody.querySelectorAll('tr')
            const targetRow = rows[index]

            if (targetRow && 'scrollIntoView' in targetRow) {
                ;(targetRow as HTMLElement).scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                })
            }
        }, 500)
    }

    useEffect(() => {
        getEnumConfig()
    }, [])

    useEffect(() => {
        if (initData) {
            form.setFieldsValue({ ...initData })
            setData(initData.columns)
        }
    }, [initData])

    // 清理定时器，避免内存泄漏
    useEffect(() => {
        return () => {
            if (validateTimerRef.current) {
                clearTimeout(validateTimerRef.current)
            }
        }
    }, [])

    const columns: any = [
        {
            title: (
                <div>
                    <span className={styles['required-field-flag']}>*</span>
                    {__('字段名称')}
                </div>
            ),
            width: 150,
            dataIndex: 'name_cn',
            key: 'name_cn',
            fixed: 'left',
            render: (text: string, record: any, index: number) => (
                <Form.Item
                    name={['columns', index, 'name_cn']}
                    rules={[
                        {
                            required: true,
                            message: __('请输入'),
                        },
                    ]}
                >
                    <Input placeholder={__('请输入')} style={{ width: 120 }} />
                </Form.Item>
            ),
        },
        {
            title: (
                <div>
                    <span className={styles['required-field-flag']}>*</span>
                    {__('英文名称')}
                </div>
            ),
            dataIndex: 'name_en',
            key: 'name_en',
            width: 140,
            render: (text: string, record: any, index: number) => (
                <Form.Item
                    name={['columns', index, 'name_en']}
                    rules={[
                        {
                            required: true,
                            message: __('请输入'),
                        },
                        {
                            // 使用 warningOnly 让校验不阻塞渲染，提升性能
                            validator: (_, value) => {
                                if (!value) {
                                    return Promise.resolve()
                                }
                                // 直接使用 data state，避免频繁调用 form.getFieldValue
                                const valueNormalized = value
                                    .trim()
                                    .toLowerCase()
                                // 检查是否存在重复的英文名称（排除当前行）
                                const duplicateExists = data.some(
                                    (col: any, idx: number) =>
                                        idx !== index &&
                                        col?.name_en &&
                                        col.name_en.trim().toLowerCase() ===
                                            valueNormalized,
                                )
                                if (duplicateExists) {
                                    return Promise.reject(
                                        new Error(__('英文名称不能重复')),
                                    )
                                }
                                return Promise.resolve()
                            },
                        },
                    ]}
                >
                    <Input placeholder={__('请输入')} style={{ width: 120 }} />
                </Form.Item>
            ),
        },
        {
            title: __('数据标准'),
            dataIndex: 'data_std_name',
            key: 'data_std_name',
            width: 140,
            render: (text: string, record: any, index: number) => (
                <Form.Item name={['columns', index, 'data_std_name']}>
                    <Input
                        placeholder={__('请输入')}
                        allowClear
                        onFocus={(e) => e.target.blur()}
                        suffix={
                            <Button
                                type="link"
                                onClick={() => {
                                    setSelDataByTypeVisible(true)
                                    const enumObj: any = {
                                        key: data[index].data_std_code,
                                        label: record?.data_std_name,
                                    }
                                    setOperateIndex(index)
                                    setSelDataType(CatalogType.DATAELE)
                                    setSelDataItems(
                                        enumObj?.label && enumObj?.key
                                            ? [enumObj]
                                            : [],
                                    )
                                }}
                            >
                                {__('选择')}
                            </Button>
                        }
                        style={{ width: 120 }}
                    />
                </Form.Item>
            ),
        },
        {
            title: __('关联码表'),
            dataIndex: 'dict_name',
            key: 'dict_name',
            width: 140,
            render: (text: string, record: any, index: number) => (
                <Form.Item name={['columns', index, 'dict_name']}>
                    <Input
                        placeholder={__('请输入')}
                        allowClear
                        onFocus={(e) => e.target.blur()}
                        suffix={
                            <Button
                                type="link"
                                onClick={() => {
                                    setSelDataByTypeVisible(true)
                                    setOperateIndex(index)
                                    const enumObj: any = {
                                        key: data[index].dict_code,
                                        label: record?.dict_name,
                                    }
                                    setSelDataType(CatalogType.CODETABLE)
                                    setSelDataItems(
                                        enumObj?.label && enumObj?.key
                                            ? [enumObj]
                                            : [],
                                    )
                                }}
                            >
                                {__('选择')}
                            </Button>
                        }
                        style={{ width: 120 }}
                    />
                </Form.Item>
            ),
        },
        {
            title: __('关联编码规则'),
            dataIndex: 'rule_name',
            key: 'rule_name',
            width: 140,
            render: (text: string, record: any, index: number) => (
                <Form.Item name={['columns', index, 'rule_name']}>
                    <Input
                        placeholder={__('请输入')}
                        allowClear
                        onFocus={(e) => e.target.blur()}
                        suffix={
                            <Button
                                type="link"
                                onClick={() => {
                                    setSelDataByTypeVisible(true)
                                    setOperateIndex(index)
                                    const enumObj: any = {
                                        key: data[index].rule_code,
                                        label: record?.rule_name,
                                    }
                                    setSelDataType(CatalogType.CODINGRULES)
                                    setSelDataItems(
                                        enumObj?.label && enumObj?.key
                                            ? [enumObj]
                                            : [],
                                    )
                                }}
                            >
                                {__('选择')}
                            </Button>
                        }
                        style={{ width: 120 }}
                    />
                </Form.Item>
            ),
        },
        {
            title: __('值域'),
            dataIndex: 'ranges',
            key: 'ranges',
            width: 140,
            render: (text: string, record: any, index: number) => (
                <Form.Item name={['columns', index, 'ranges']}>
                    <Input placeholder={__('请输入')} style={{ width: 120 }} />
                </Form.Item>
            ),
        },
        {
            title: (
                <div>
                    <span className={styles['required-field-flag']}>*</span>
                    {__('数据类型')}
                </div>
            ),
            dataIndex: 'data_type',
            key: 'data_type',
            width: 140,
            render: (text: string, record: any, index: number) => (
                <Form.Item
                    name={['columns', index, 'data_type']}
                    rules={[
                        {
                            required: true,
                            message: __('请选择'),
                        },
                    ]}
                >
                    <Select
                        placeholder={__('请选择')}
                        options={dataTypeOptions}
                        fieldNames={{ label: 'value', value: 'value_en' }}
                        style={{ width: 120 }}
                    />
                </Form.Item>
            ),
        },
        {
            title: '',
            dataIndex: 'data_length',
            key: 'data_length',
            width: 140,
            render: (text: string, record: any, index: number) =>
                ['char', 'decimal'].includes(record.data_type) ? (
                    <Form.Item
                        name={['columns', index, 'data_length']}
                        rules={[
                            {
                                required: true,
                                message: __('输入不能为空'),
                            },
                        ]}
                    >
                        <InputNumber
                            placeholder={__('数据长度')}
                            style={{ width: 120 }}
                            min={1}
                            max={record.data_type === 'decimal' ? 38 : 65535}
                            prefix={
                                <span
                                    style={{
                                        color: 'rgb(245, 34, 45)',
                                        marginTop: 6,
                                        marginRight: 4,
                                    }}
                                >
                                    *
                                </span>
                            }
                        />
                    </Form.Item>
                ) : (
                    <Form.Item>
                        <Input
                            disabled
                            placeholder={__('数据长度')}
                            style={{ width: 120 }}
                        />
                    </Form.Item>
                ),
        },
        {
            title: '',
            dataIndex: 'data_accuracy',
            key: 'data_accuracy',
            width: 140,
            render: (text: string, record: any, index: number) =>
                record.data_type !== 'decimal' ? (
                    <Form.Item>
                        <Input
                            disabled
                            placeholder={__('数据精度')}
                            style={{ width: 120 }}
                        />
                    </Form.Item>
                ) : (
                    <Form.Item
                        name={['columns', index, 'data_accuracy']}
                        rules={[
                            {
                                required: true,
                                message: __('请输入'),
                            },
                        ]}
                    >
                        <InputNumber
                            placeholder={__('精度≤长度')}
                            style={{ width: 120 }}
                            min={1}
                            max={record.data_length || 1}
                            prefix={
                                <span
                                    style={{
                                        color: 'rgb(245, 34, 45)',
                                        marginTop: 6,
                                        marginRight: 4,
                                    }}
                                >
                                    *
                                </span>
                            }
                        />
                    </Form.Item>
                ),
        },
        {
            title: __('主键'),
            dataIndex: 'is_pk',
            key: 'is_pk',
            width: 55,
            render: (text: string, record: any, index: number) => (
                <Form.Item
                    name={['columns', index, 'is_pk']}
                    valuePropName="checked"
                >
                    <RadioBox />
                </Form.Item>
            ),
        },
        {
            title: __('必填'),
            width: 55,
            dataIndex: 'is_mandatory',
            key: 'is_mandatory',
            render: (text: string, record: any, index: number) => (
                <Form.Item
                    name={['columns', index, 'is_mandatory']}
                    valuePropName="checked"
                >
                    <RadioBox />
                </Form.Item>
            ),
        },
        {
            title: (
                <Space size={2} className={styles['increment-field-title']}>
                    {__('增量字段')}
                    <Tooltip
                        title={__(
                            '是否严格参照标准定义，包括命名、值域、字段关系等',
                        )}
                    >
                        <FontIcon
                            type={IconType.FONTICON}
                            name="icon-bangzhu"
                            className={styles['info-icon']}
                        />
                    </Tooltip>
                </Space>
            ),
            dataIndex: 'is_increment_field',
            key: 'is_increment_field',
            width: 120,
            render: (text: string, record: any, index: number) => (
                <Form.Item
                    name={['columns', index, 'is_increment_field']}
                    valuePropName="checked"
                >
                    <RadioBox />
                </Form.Item>
            ),
        },
        {
            title: __('是否标准'),
            dataIndex: 'is_standardized',
            key: 'is_standardized',
            width: 100,
            render: (text: string, record: any, index: number) => (
                <Form.Item
                    name={['columns', index, 'is_standardized']}
                    valuePropName="checked"
                >
                    <RadioBox />
                </Form.Item>
            ),
        },
        {
            title: __('字段关系'),
            dataIndex: 'field_rel',
            key: 'field_rel',
            width: 240,
            render: (text: string, record: any, index: number) => (
                <Form.Item name={['columns', index, 'field_rel']}>
                    <Input
                        placeholder={
                            record.view_busi_name
                                ? __('取值${view}表${field}字段', {
                                      view: record.view_busi_name,
                                      field: record.name_cn,
                                  })
                                : __('请输入')
                        }
                        style={{ width: 216 }}
                    />
                </Form.Item>
            ),
        },
        {
            title: __('操作'),
            dataIndex: 'operation',
            key: 'operation',
            fixed: 'right',
            width: 80,
            render: (text: string, record: any) => (
                <Button
                    type="link"
                    onClick={() => {
                        setData(data.filter((item) => item.id !== record.id))
                        form.setFieldsValue({
                            columns: form
                                .getFieldValue('columns')
                                .filter((item) => item.id !== record.id),
                        })
                    }}
                >
                    {__('删除')}
                </Button>
            ),
        },
    ]

    const onFinish = (values: any) => {
        onOk({
            ...values,
            columns: values.columns.map((item, index: number) => ({
                ...item,
                data_std_code: data[index].data_std_code,
                dict_code: data[index].dict_code,
                rule_code: data[index].rule_code,
                catalog_id: data[index].catalog_id,
                catalog_name: data[index].catalog_name,
                catalog_code: data[index].catalog_code,
            })),
            id: uuidv4(),
        })
        onClose()
    }

    const handleAddField = () => {
        const newData = [...form.getFieldValue('columns'), { id: generateId() }]
        setData(newData)
        form.setFieldsValue({
            columns: newData,
        })
    }

    const handleSetOprItems = (o) => {
        const [selectData] = o
        if (selDataType === CatalogType.CODETABLE) {
            form.setFieldValue(
                ['columns', operateIndex, 'dict_name'],
                selectData?.label,
            )
            setData(
                data.map((item, index) => {
                    if (index === operateIndex) {
                        return {
                            ...item,
                            dict_name: selectData?.label,
                            dict_code: selectData?.key,
                        }
                    }
                    return item
                }),
            )
        }
        if (selDataType === CatalogType.CODINGRULES) {
            form.setFieldValue(
                ['columns', operateIndex, 'rule_name'],
                selectData?.label,
            )
            setData(
                data.map((item, index) => {
                    if (index === operateIndex) {
                        return {
                            ...item,
                            rule_name: selectData?.label,
                            rule_code: selectData?.key,
                        }
                    }
                    return item
                }),
            )
        }
        if (selDataType === CatalogType.DATAELE) {
            form.setFieldValue(
                ['columns', operateIndex, 'data_std_name'],
                selectData?.label,
            )
            setData(
                data.map((item, index) => {
                    if (index === operateIndex) {
                        return {
                            ...item,
                            data_std_name: selectData?.label,
                            data_std_code: selectData?.key,
                        }
                    }
                    return item
                }),
            )
        }
    }

    const handleFieldsChange = (field: any, allFields: any) => {
        // 同步更新 data state
        if (field[0]?.name[0] !== 'name') {
            const currentData = form.getFieldValue('columns')
            setData(
                data.map((item, index) => ({
                    ...item,
                    ...filterObj(currentData[index]),
                })),
            )
        }

        // 当英文名称字段发生变化时，触发联动校验（性能优化：延长防抖时间）
        if (
            field[0]?.name?.[0] === 'columns' &&
            field[0]?.name?.[2] === 'name_en'
        ) {
            const changedIndex = field[0]?.name?.[1]
            // 清除之前的定时器，实现防抖效果
            if (validateTimerRef.current) {
                clearTimeout(validateTimerRef.current)
            }
            // 使用更长的防抖延迟 800ms，减少频繁触发
            validateTimerRef.current = setTimeout(() => {
                // 只触发已有值的 name_en 字段重新校验
                const currentData = form.getFieldValue('columns') || []
                // 性能优化：限制校验数量，避免一次性校验太多字段
                const fieldsToValidate: any[] = []
                currentData.forEach((_: any, idx: number) => {
                    if (idx !== changedIndex && currentData[idx]?.name_en) {
                        fieldsToValidate.push(['columns', idx, 'name_en'])
                    }
                })
                // 批量校验，而不是逐个校验
                if (fieldsToValidate.length > 0) {
                    form.validateFields(fieldsToValidate).catch(() => {})
                }
            }, 800)
        }
    }

    /**
     * 展示详情页面（如编码规则/码表详情）
     * @param dataType 查看数据类型
     * @param dataId 查看的数据id
     */
    const handleShowDataDetail = (dataType: CatalogType, dataId?: string) => {
        let myDetailIds: any[] = []
        // 码表详情
        if (dataId) {
            // 选择对话框中选择列表中码表查看详情
            myDetailIds = [{ key: dataId }]
            setDetailId(dataId)
        }
        const firstId = myDetailIds.length > 0 ? myDetailIds[0] : ''
        if (myDetailIds.length && firstId !== '') {
            setDetailIds(myDetailIds)
            if (dataType === CatalogType.DATAELE) {
                setDataEleDetailVisible(true)
                setDataEleMatchType(1)
            } else if (dataType === CatalogType.CODETABLE) {
                setCodeTbDetailVisible(true)
            } else if (dataType === CatalogType.CODINGRULES) {
                setCodeRuleDetailVisible(true)
            }
        }
    }
    return (
        <Drawer
            title={__('添加分析场景产物')}
            width={1640}
            open={open}
            onClose={onClose}
            footer={
                <Space
                    size={12}
                    className={styles['add-analysis-output-footer']}
                >
                    <Button onClick={onClose}>{__('取消')}</Button>
                    <Button
                        type="primary"
                        onClick={async () => {
                            try {
                                // 提交表单，会自动触发所有字段的校验
                                await form.validateFields()
                                form.submit()
                            } catch (errorInfo: any) {
                                // 校验失败，手动滚动到第一个错误位置
                                if (errorInfo?.errorFields?.length > 0) {
                                    const firstErrorField =
                                        errorInfo.errorFields[0].name
                                    // 如果是 columns 中的字段，提取索引
                                    if (
                                        Array.isArray(firstErrorField) &&
                                        firstErrorField[0] === 'columns' &&
                                        typeof firstErrorField[1] === 'number'
                                    ) {
                                        scrollToErrorField(firstErrorField[1])
                                    } else {
                                        // 其他字段使用 scrollToField
                                        setTimeout(() => {
                                            form.scrollToField(
                                                firstErrorField,
                                                {
                                                    behavior: 'smooth',
                                                    block: 'center',
                                                },
                                            )
                                        }, 100)
                                    }
                                }
                            }
                        }}
                    >
                        {__('保存')}
                    </Button>
                </Space>
            }
        >
            <div className={styles['add-analysis-output']}>
                <Form
                    form={form}
                    onFinish={onFinish}
                    autoComplete="off"
                    onFieldsChange={handleFieldsChange}
                    scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
                >
                    <Form.Item
                        label={__('分析场景产物名称')}
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: __('请输入'),
                            },
                        ]}
                    >
                        <Input
                            placeholder={__('请输入')}
                            style={{ width: 360 }}
                        />
                    </Form.Item>
                    <div className={styles['output-operation']}>
                        <Space size={12}>
                            <Button type="primary" onClick={handleAddField}>
                                {__('添加字段')}
                            </Button>
                            <Button onClick={() => setAddFieldsOpen(true)}>
                                {__('从数据目录中添加')}
                            </Button>
                        </Space>
                        <SearchInput
                            placeholder={__('搜索字段中英文名称')}
                            style={{ width: 280 }}
                            onKeyChange={(e) => {
                                form.setFieldValue(
                                    'columns',
                                    data.filter(
                                        (item) =>
                                            item.name_cn
                                                .toLowerCase()
                                                .includes(e.toLowerCase()) ||
                                            item.name_en
                                                .toLowerCase()
                                                .includes(e.toLowerCase()),
                                    ),
                                )
                            }}
                        />
                    </div>
                    <Form.Item
                        name="columns"
                        valuePropName="dataSource"
                        initialValue={data}
                    >
                        <Table
                            columns={columns}
                            // dataSource={data}
                            pagination={false}
                            rowKey={(record) => record.id || record.column_id}
                            className={styles['analysis-output-table']}
                            scroll={{ x: 1300 }}
                        />
                    </Form.Item>
                    <Button
                        type="dashed"
                        style={{ marginTop: 16, width: '100%' }}
                        onClick={handleAddField}
                    >
                        {__('添加字段')}
                    </Button>
                </Form>
            </div>
            {addFieldsOpen && (
                <AddFieldsFromCatalog
                    open={addFieldsOpen}
                    onClose={() => setAddFieldsOpen(false)}
                    onOk={(res) => {
                        const newData = [
                            ...form.getFieldValue('columns'),
                            ...res,
                        ].map((item) => ({
                            ...item,
                            id: generateId(),
                        }))
                        setData(newData)
                        form.setFieldsValue({
                            columns: newData,
                        })
                        // 添加字段后，触发所有英文名称字段的重复性校验（不滚动）
                        // validateAllNameEnFields(newData)
                        // 滚动到错误位置（暂时注释，只在提交表单时滚动）
                        // .then((errorIndex) => {
                        //     if (errorIndex !== null) {
                        //         scrollToErrorField(errorIndex)
                        //     }
                        // })
                    }}
                    initData={form.getFieldValue('columns')}
                />
            )}
            {/* 选择码表/编码规则 */}
            {selDataByTypeVisible && (
                <SelDataByTypeModal
                    visible={selDataByTypeVisible}
                    // ref={selDataRef}
                    onClose={() => {
                        setSelDataByTypeVisible(false)
                    }}
                    dataType={selDataType}
                    oprItems={selDataItems}
                    setOprItems={handleSetOprItems}
                    handleShowDataDetail={handleShowDataDetail}
                />
            )}
            {/* 查看码表详情 */}
            {detailIds && detailIds.length > 0 && codeTbDetailVisible && (
                <CodeTableDetails
                    visible={codeTbDetailVisible}
                    title={__('码表详情')}
                    dictId={detailIds[0].key}
                    onClose={() => setCodeTbDetailVisible(false)}
                    handleError={(errorKey: string) => {
                        if (
                            errorKey ===
                            'Standardization.ResourceError.DataNotExist'
                        ) {
                            // 清空码表
                            // form.setFieldValue('dict_id', [])
                            selDataRef?.current?.reloadData()
                            setDetailIds([])
                        }
                    }}
                    getContainer={getPopupContainer()}
                />
            )}
            {/* 查看数据元详情 */}
            {dataEleDetailVisible && !!detailId && (
                <DataEleDetails
                    visible={dataEleDetailVisible}
                    dataEleId={detailId}
                    onClose={() => setDataEleDetailVisible(false)}
                    dataEleMatchType={dataEleMatchType}
                    getContainer={getPopupContainer()}
                />
            )}
            {/* 查看编码规则详情，支持多选框查看详情 */}
            {codeRuleDetailVisible && !!detailId && (
                <CodeRuleDetails
                    visible={codeRuleDetailVisible && !!detailId}
                    id={detailId}
                    mulDetailIds={detailIds}
                    onClose={() => {
                        setCodeRuleDetailVisible(false)
                    }}
                    getContainer={getPopupContainer()}
                />
            )}
        </Drawer>
    )
}

export default AddAnalysisOutput
