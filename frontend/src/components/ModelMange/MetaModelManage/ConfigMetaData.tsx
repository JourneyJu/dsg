import { Col, Form, Input, message, Modal, Row, Select } from 'antd'
import { useEffect, useState } from 'react'
import { InfoCircleOutlined } from '@ant-design/icons'
import { useDebounce } from 'ahooks'
import __ from '../locale'
import styles from './styles.module.less'
import { MetaDataConfigs } from './const'
import {
    createDataModel,
    formatError,
    getCatalogedResourceList,
    getModelInfo,
    getRescCatlgList,
    updateModel,
} from '@/core'
import { useModalManageContext } from '../ModalManageProvider'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { Empty } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'
import FieldsSelectList from './FieldsSelectList'
import { ModelType, validateModelNameRepeat } from '../const'
import { dataModelNameReg, modelBusinessNameReg, nameReg } from '@/utils'

interface ConfigMetaDataProps {
    // 数据库表id
    id?: string
    open: boolean
    onClose: () => void
    onConfirm: () => void
}
const ConfigMetaData = ({
    id,
    open,
    onClose,
    onConfirm,
}: ConfigMetaDataProps) => {
    const [form] = Form.useForm()
    const { filterKey, setFilterKey } = useModalManageContext()

    const [catalogList, setCatalogList] = useState<any[]>([])
    const [catalogKeyword, setCatalogKeyword] = useState<string>('')
    const debouncedCatalogKeyword = useDebounce(catalogKeyword, {
        wait: 500,
    })
    const [fieldsIsEmpty, setFieldsIsEmpty] = useState<boolean>(false)
    const [hasPrimaryKey, setHasPrimaryKey] = useState<boolean>(false)
    const [fieldsHasError, setFieldsHasError] = useState<boolean>(false)
    useEffect(() => {
        getCatalogList()
    }, [debouncedCatalogKeyword])

    /**
     * 获取数据资源列表
     */
    const getCatalogList = async () => {
        try {
            const res = await getCatalogedResourceList({
                offset: 1,
                limit: 2000,
                keyword: debouncedCatalogKeyword,
                subject_id: filterKey,
            })
            setCatalogList(
                res.entries.map((item) => ({
                    value: item.catalog_id,
                    label: (
                        <div className={styles['catalog-label']}>
                            <FontIcon
                                name="icon-shujubiaoshitu"
                                type={IconType.COLOREDICON}
                            />
                            <span title={item.name}>{item.name}</span>
                        </div>
                    ),
                    data: item,
                })),
            )
        } catch (err) {
            formatError(err)
        }
    }

    /**
     * 配置表单项
     */
    const ConfigFormItem = {
        /**
         * 关联库表
         */
        catalog_id: (
            <Form.Item
                name="catalog_id"
                label={
                    <div>
                        <span>{__('关联库表')}</span>
                        <span className={styles['form-item-label-info']}>
                            {__(
                                '（您可选择绑定当前主题域进行编目，且已发布上线的库表）',
                            )}
                        </span>
                    </div>
                }
                required
                rules={[{ required: true, message: __('请选择关联库表') }]}
            >
                <Select
                    options={catalogList}
                    placeholder={__('请选择关联库表')}
                    showSearch
                    onSearch={(value) => {
                        setCatalogKeyword(value)
                    }}
                    filterOption={false}
                />
            </Form.Item>
        ),
        /**
         * 元模型业务名称
         */
        business_name: (
            <Form.Item
                name="business_name"
                label={__('元模型业务名称')}
                required
                validateFirst
                rules={[
                    { required: true, message: __('请输入元模型业务名称') },
                    {
                        pattern: modelBusinessNameReg,
                        message: __('仅支持中英文、数字及下划线'),
                    },
                    {
                        validator: (rule, value, callback) => {
                            return validateModelNameRepeat({
                                business_name: value,
                                id: id || undefined,
                            })
                        },
                    },
                ]}
            >
                <Input
                    placeholder={__('请输入元模型业务名称')}
                    maxLength={50}
                />
            </Form.Item>
        ),
        /**
         * 元模型技术名称
         */
        technical_name: (
            <Form.Item
                name="technical_name"
                label={__('元模型技术名称')}
                required
                validateFirst
                rules={[
                    { required: true, message: __('请输入元模型技术名称') },
                    {
                        pattern: dataModelNameReg,
                        message: __(
                            '仅支持英文、数字及下划线且只能以大小写字母开头',
                        ),
                    },
                    {
                        validator: (rule, value, callback) => {
                            return validateModelNameRepeat({
                                technical_name: value,
                                id: id || undefined,
                            })
                        },
                    },
                ]}
            >
                <Input
                    placeholder={__('请输入元模型技术名称')}
                    maxLength={255}
                />
            </Form.Item>
        ),
        /**
         * 描述
         */
        description: (
            <Form.Item name="description" label={__('描述')}>
                <Input placeholder={__('请输入描述')} />
            </Form.Item>
        ),
        /**
         * 字段配置
         */
        fields: (
            <Form.Item
                shouldUpdate={(cur, pre) => cur.catalog_id !== pre.catalog_id}
                noStyle
            >
                {({ getFieldValue }) => {
                    const dataView = getFieldValue('catalog_id')
                    return (
                        <Form.Item
                            name="fields"
                            label={
                                <div className={styles['fields-label']}>
                                    <span>{__('字段配置')}</span>
                                    <InfoCircleOutlined
                                        className={
                                            fieldsIsEmpty
                                                ? styles['empty-icon']
                                                : styles['info-icon']
                                        }
                                    />
                                    {fieldsIsEmpty ? (
                                        <span
                                            className={
                                                styles['fields-label-empty']
                                            }
                                        >
                                            {__('请至少勾选一个字段')}
                                        </span>
                                    ) : hasPrimaryKey ? (
                                        <span
                                            className={
                                                styles['fields-label-info']
                                            }
                                        >
                                            {__('选中字段中必须有主键')}
                                        </span>
                                    ) : (
                                        <span
                                            className={
                                                styles['fields-label-info']
                                            }
                                        >
                                            {__(
                                                '勾选所需库表字段作为模型属性自字段',
                                            )}
                                        </span>
                                    )}
                                </div>
                            }
                            required
                            initialValue={[]}
                        >
                            {dataView ? (
                                <FieldsSelectList
                                    catalogId={dataView}
                                    form={id ? undefined : form}
                                    onFieldsError={setFieldsHasError}
                                />
                            ) : (
                                <div
                                    className={
                                        styles['form-item-empty-container']
                                    }
                                >
                                    <Empty
                                        iconSrc={dataEmpty}
                                        desc={__('请选择关联库表')}
                                    />
                                </div>
                            )}
                        </Form.Item>
                    )
                }}
            </Form.Item>
        ),
    }

    useEffect(() => {
        if (id) {
            getModelDetail(id)
        }
    }, [id])

    const getModelDetail = async (modelId: string) => {
        try {
            const res = await getModelInfo(modelId)
            form.setFieldsValue({
                catalog_id: res.catalog_id,
                business_name: res.business_name,
                technical_name: res.technical_name,
                description: res.description,
                fields:
                    res?.fields?.map((item) => ({
                        field_id: item.field_id,
                        business_name: item.business_name,
                        primary_key: item.primary_key,
                    })) || [],
            })
        } catch (err) {
            formatError(err)
        }
    }

    const checkFieldsName = (fields: any[]) => {
        let isBusinessNameEmpty = false
        fields.forEach((item) => {
            if (!item.business_name) {
                isBusinessNameEmpty = true
            }
        })

        return isBusinessNameEmpty
    }
    /**
     * 提交表单
     * @param values 表单数据
     */
    const handleFinish = async (values: any) => {
        try {
            if (values.fields.length === 0) {
                setFieldsIsEmpty(true)
                return
            }
            setFieldsIsEmpty(false)
            // if (checkFieldsName(values.fields)) {
            //     return
            // }
            if (fieldsHasError) {
                return
            }
            const value = values.fields.find((item: any) => item.primary_key)
            if (!value) {
                setHasPrimaryKey(true)
                return
            }
            setHasPrimaryKey(false)

            if (id) {
                await updateModel(id, values)
                onConfirm()
                message.success(__('编辑成功'))
            } else {
                await createDataModel({
                    ...values,
                    subject_id: filterKey,
                    model_type: ModelType.META_MODEL,
                })
                onConfirm()
                message.success(__('新建成功'))
            }
        } catch (err) {
            formatError(err)
        }
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={640}
            title={id ? __('编辑元模型') : __('新建元模型')}
            onOk={() => {
                form.submit()
            }}
            maskClosable={false}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                autoComplete="off"
            >
                <Row gutter={16}>
                    {MetaDataConfigs.map((item) => (
                        <Col span={item.span}>{ConfigFormItem[item.key]}</Col>
                    ))}
                </Row>
            </Form>
        </Modal>
    )
}

export default ConfigMetaData
