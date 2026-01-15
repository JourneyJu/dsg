import {
    Button,
    Col,
    Collapse,
    DatePicker,
    Drawer,
    Form,
    Input,
    message,
    Row,
    Select,
    Space,
} from 'antd'
import { CaretDownFilled } from '@ant-design/icons'
import classnames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import DrawerHeader from '@/components/CitySharing/component/DrawerHeader'
import styles from './styles.module.less'
import __ from '../locale'
import { CommonTitle, Loader } from '@/ui'

import {
    createDwhDataAuthRequest,
    updateDwhDataAuthRequest,
    getDwhDataAuthRequestDetail,
    formatError,
    getDatasheetViewDetails,
    getExploreReport,
    getVirtualEngineExample,
} from '@/core'
import ChooseTable from './ChooseTable'
import RowAndColFilter from '@/components/RowAndColFilter/RowAndColFilter'

interface IApply {
    open: boolean
    onClose: () => void
    recordId?: string | null
}
const Apply = ({ open, onClose, recordId }: IApply) => {
    const [form] = Form.useForm()
    const navigate = useNavigate()
    const container = useRef(null)
    const [chooseTableOpen, setChooseTableOpen] = useState(false)
    const filterRef = useRef<any>()
    const [fields, setFields] = useState<any[]>([])
    const [exampleData, setExampleData] = useState<any>({})
    const [tableInfo, setTableInfo] = useState<any>({})
    const [openProbe, setOpenProbe] = useState<boolean>()
    const [ruleDetail, setRuleDetail] = useState<any>()
    const [baseInfoExpanded, setBaseInfoExpanded] = useState(true)
    const [timeRangeType, setTimeRangeType] = useState<string>('permanent')
    const [loading, setLoading] = useState(false)

    // 获取详情数据并回显
    useEffect(() => {
        if (open && recordId) {
            fetchDetail()
        } else if (open && !recordId) {
            // 新建模式，重置表单
            form.resetFields()
            setTableInfo({})
            setFields([])
            setRuleDetail(null)
            setTimeRangeType('permanent')
        }
    }, [open, recordId])

    const fetchDetail = async () => {
        if (!recordId) return
        try {
            const res = await getDwhDataAuthRequestDetail(recordId)
            // 草稿判断：draft_spec 存在即视为草稿版本
            const isDraft = !!res.draft_spec
            // 草稿优先使用 draft_* 字段回显
            const expiredAtValue = (
                isDraft ? res.draft_expired_at : res.expired_at
            ) as string | number | null
            const requestType = isDraft
                ? res.draft_request_type || res.request_type
                : res.request_type
            const isPermanent =
                !expiredAtValue ||
                expiredAtValue === 0 ||
                expiredAtValue === '0' ||
                expiredAtValue === null
            // 设置表单值
            form.setFieldsValue({
                name: res.name,
                applyType: requestType,
                applyTable: res.data_business_name,
                timeRange: isPermanent ? 'permanent' : 'specific',
                expiredAt: isPermanent
                    ? null
                    : moment(
                          typeof expiredAtValue === 'number'
                              ? expiredAtValue
                              : expiredAtValue
                              ? new Date(expiredAtValue).getTime()
                              : Date.now(),
                      ),
            })
            setTimeRangeType(isPermanent ? 'permanent' : 'specific')
            // 设置库表信息
            setTableInfo({
                id: res.data_id,
                name: res.data_business_name,
            })
            setRuleDetail(isDraft ? res.draft_spec : res.spec)
        } catch (error) {
            formatError(error)
        }
    }

    const getFields = async () => {
        try {
            setLoading(true)
            setExampleData(undefined)
            setFields([])
            const res = await getDatasheetViewDetails(tableInfo?.id)
            const [catalog, schema] = res.view_source_catalog_name.split('.')
            const exampleRes = await getVirtualEngineExample({
                catalog,
                schema,
                table: res?.technical_name,
                limit: 10,
            })
            const exaData = {}
            const { columns, data } = exampleRes
            columns.forEach((item, index) => {
                exaData[item.name] = Array.from(
                    new Set(data.map((it) => it[index])),
                )
            })
            setExampleData(exaData)
            setFields(res.fields || [])
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    // 判断是否有探查报告
    const judgeProbe = async () => {
        try {
            const res = await getExploreReport({ id: tableInfo?.id })
            setOpenProbe(!!res)
        } catch (err) {
            setOpenProbe(false)
            // formatError(err)
        }
    }

    useEffect(() => {
        if (tableInfo?.id) {
            form.setFieldsValue({
                applyTable: tableInfo?.name,
            })
            getFields()
            judgeProbe()
        }
    }, [tableInfo?.id])

    // 设置表单默认值（仅新建模式）
    useEffect(() => {
        if (open && !recordId) {
            form.setFieldsValue({
                applyType: 'check',
                timeRange: 'permanent',
                expiredAt: null,
            })
            setTimeRangeType('permanent')
        }
    }, [open, form, recordId])

    const handleConfirm = async () => {
        try {
            // 验证表单
            const isPass = await onValidateRule()
            if (!isPass) {
                return
            }

            // 获取表单值
            const values = await form.validateFields()
            if (!tableInfo?.id) {
                message.error(__('请选择申请库表'))
                return
            }

            // 获取行列限定配置
            const detail = await filterRef.current?.onFinish()

            const detailData = JSON.parse(detail) || {}
            if (!detail || detailData.fields?.length === 0) {
                message.error(__('请选择限定列'))
                return
            }

            // 构建请求参数
            const params = {
                name: values.name,
                data_id: tableInfo.id,
                request_type: values.applyType, // 使用表单中选择的申请类型
                expired_at:
                    timeRangeType === 'permanent'
                        ? 0
                        : values.expiredAt?.valueOf() || null, // 永久有效时为0，具体时间时为时间戳（毫秒）
                spec: detail, // spec 直接是 JSON 字符串
            }

            // 调用接口
            if (recordId) {
                // 编辑模式，调用更新接口
                await updateDwhDataAuthRequest(recordId, params)
                message.success(__('更新成功'))
            } else {
                // 新建模式，调用创建接口
                await createDwhDataAuthRequest(params)
                message.success(__('提交成功'))
            }
            onClose()
        } catch (error) {
            if (error?.errorFields) {
                // 表单验证错误，不显示错误提示
                return
            }
            formatError(error)
        }
    }

    const getRule = async (isValidate?: boolean) => {
        const isPass = await onValidateRule()
        const detail = await filterRef.current?.onSnapshot()
        return {
            detail,
            isPass,
        }
    }

    const onValidateRule = async () => {
        let isPass = await filterRef.current?.onValidateFilter()
        try {
            await form.validateFields()
        } catch (error) {
            if (!error.errorFields) {
                formatError(error)
            }
            isPass = false
        }
        return isPass
    }

    // 标题
    const headerRender = (title: string, desc: string) => {
        return (
            <div className={styles['filter-header']}>
                <span className={styles['filter-header-title']}>{title}</span>
                <span className={styles['filter-header-desc']}>({desc})</span>
            </div>
        )
    }

    return (
        <Drawer
            open={open}
            onClose={onClose}
            width="100%"
            bodyStyle={{ padding: 0 }}
            headerStyle={{ display: 'none' }}
            footer={null}
        >
            <div className={styles.apply}>
                {/* 导航头部 */}
                <DrawerHeader
                    title={
                        recordId ? __('编辑权限申请单') : __('新建权限申请单')
                    }
                    onClose={onClose}
                />
                {/* 内容 */}
                <div className={styles.bottom}>
                    <div className={styles.content}>
                        <div className={styles.form_content}>
                            <div className={styles.applyForm} ref={container}>
                                <Form
                                    form={form}
                                    name="baseInfo"
                                    layout="vertical"
                                    autoComplete="off"
                                    scrollToFirstError
                                    className={styles.form}
                                    // onFinish={handleSubmit}
                                >
                                    <div id="baseInfo">
                                        <Collapse
                                            activeKey={
                                                baseInfoExpanded
                                                    ? ['baseInfo']
                                                    : []
                                            }
                                            onChange={(keys) => {
                                                setBaseInfoExpanded(
                                                    keys.includes('baseInfo'),
                                                )
                                            }}
                                            ghost
                                            className={styles.baseInfoCollapse}
                                        >
                                            <Collapse.Panel
                                                key="baseInfo"
                                                showArrow={false}
                                                header={
                                                    <div
                                                        className={
                                                            styles[
                                                                'filter-header-box'
                                                            ]
                                                        }
                                                    >
                                                        <CaretDownFilled
                                                            className={classnames(
                                                                styles[
                                                                    'filter-header-box-icon'
                                                                ],
                                                                baseInfoExpanded &&
                                                                    styles.expand,
                                                            )}
                                                        />
                                                        <span
                                                            className={
                                                                styles[
                                                                    'filter-header-title'
                                                                ]
                                                            }
                                                        >
                                                            {__('基本信息')}
                                                        </span>
                                                    </div>
                                                }
                                            >
                                                <Row gutter={40}>
                                                    <Col span={12}>
                                                        <Form.Item
                                                            name="name"
                                                            label={__(
                                                                '申请单名称',
                                                            )}
                                                            required
                                                            rules={[
                                                                {
                                                                    required:
                                                                        true,
                                                                    message:
                                                                        __(
                                                                            '请输入申请单名称',
                                                                        ),
                                                                },
                                                            ]}
                                                        >
                                                            <Input
                                                                placeholder={__(
                                                                    '请输入申请单名称',
                                                                )}
                                                                maxLength={128}
                                                            />
                                                        </Form.Item>
                                                        <Form.Item
                                                            label={__(
                                                                '申请权限',
                                                            )}
                                                        >
                                                            <Input
                                                                disabled
                                                                value={__(
                                                                    '读取',
                                                                )}
                                                            />
                                                        </Form.Item>
                                                        <Form.Item
                                                            name="applyType"
                                                            label={__(
                                                                '申请类型',
                                                            )}
                                                            required
                                                            rules={[
                                                                {
                                                                    required:
                                                                        true,
                                                                    message:
                                                                        __(
                                                                            '请选择申请类型',
                                                                        ),
                                                                },
                                                            ]}
                                                        >
                                                            <Select
                                                                placeholder={__(
                                                                    '请选择申请类型',
                                                                )}
                                                            >
                                                                <Select.Option value="check">
                                                                    {__(
                                                                        '数据校核',
                                                                    )}
                                                                </Select.Option>
                                                                <Select.Option value="query">
                                                                    {__(
                                                                        '数据查询',
                                                                    )}
                                                                </Select.Option>
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item
                                                            name="applyTable"
                                                            label={__(
                                                                '申请库表',
                                                            )}
                                                            required
                                                            rules={[
                                                                {
                                                                    required:
                                                                        true,
                                                                    message:
                                                                        __(
                                                                            '请选择申请库表',
                                                                        ),
                                                                },
                                                            ]}
                                                        >
                                                            <Input
                                                                placeholder={__(
                                                                    '请选择申请库表',
                                                                )}
                                                                onClick={() => {
                                                                    if (
                                                                        !recordId
                                                                    ) {
                                                                        setChooseTableOpen(
                                                                            true,
                                                                        )
                                                                    }
                                                                }}
                                                                readOnly
                                                                disabled={
                                                                    !!recordId
                                                                }
                                                                title={
                                                                    tableInfo?.name
                                                                }
                                                                suffix={
                                                                    <Button
                                                                        size="small"
                                                                        type="link"
                                                                        onClick={() => {
                                                                            if (
                                                                                !recordId
                                                                            ) {
                                                                                setChooseTableOpen(
                                                                                    true,
                                                                                )
                                                                            }
                                                                        }}
                                                                    >
                                                                        {__(
                                                                            '选择',
                                                                        )}
                                                                    </Button>
                                                                }
                                                            />
                                                        </Form.Item>
                                                        <Form.Item
                                                            name="timeRange"
                                                            label={__(
                                                                '时间范围',
                                                            )}
                                                            required
                                                        >
                                                            <Select
                                                                value={
                                                                    timeRangeType
                                                                }
                                                                onChange={(
                                                                    value,
                                                                ) => {
                                                                    setTimeRangeType(
                                                                        value,
                                                                    )
                                                                    if (
                                                                        value ===
                                                                        'permanent'
                                                                    ) {
                                                                        form.setFieldsValue(
                                                                            {
                                                                                timeRange:
                                                                                    'permanent',
                                                                                expiredAt:
                                                                                    null,
                                                                            },
                                                                        )
                                                                    } else {
                                                                        form.setFieldsValue(
                                                                            {
                                                                                timeRange:
                                                                                    'specific',
                                                                            },
                                                                        )
                                                                    }
                                                                }}
                                                            >
                                                                <Select.Option value="permanent">
                                                                    {__(
                                                                        '永久有效',
                                                                    )}
                                                                </Select.Option>
                                                                <Select.Option value="specific">
                                                                    {__(
                                                                        '具体时间',
                                                                    )}
                                                                </Select.Option>
                                                            </Select>
                                                        </Form.Item>
                                                        {timeRangeType ===
                                                            'specific' && (
                                                            <Form.Item
                                                                name="expiredAt"
                                                                label={__(
                                                                    '过期时间',
                                                                )}
                                                                required
                                                                rules={[
                                                                    {
                                                                        required:
                                                                            true,
                                                                        message:
                                                                            __(
                                                                                '请选择过期时间',
                                                                            ),
                                                                    },
                                                                ]}
                                                            >
                                                                <DatePicker
                                                                    showTime
                                                                    format="YYYY-MM-DD HH:mm"
                                                                    placeholder={__(
                                                                        '请选择过期时间',
                                                                    )}
                                                                    style={{
                                                                        width: '100%',
                                                                    }}
                                                                />
                                                            </Form.Item>
                                                        )}
                                                    </Col>
                                                </Row>
                                            </Collapse.Panel>
                                        </Collapse>
                                    </div>
                                </Form>
                                <div className={styles.form}>
                                    {loading ? (
                                        <div style={{ marginTop: 50 }}>
                                            <Loader />
                                        </div>
                                    ) : (
                                        <RowAndColFilter
                                            ref={filterRef}
                                            value={ruleDetail}
                                            canEditExtend
                                            col={{
                                                title: headerRender(
                                                    __('限定列'),
                                                    __('勾选赋予权限的列字段'),
                                                ),
                                                field: {
                                                    name: 'business_name',
                                                },
                                                value: (fields as any) || [],
                                                loading: fields === undefined,
                                                // onChange: handleChange,
                                            }}
                                            row={{
                                                title: headerRender(
                                                    __('限定行'),
                                                    __('配置赋予权限的行数据'),
                                                ),
                                                value: (fields as any) || [],
                                                loading: fields === undefined,
                                                // onChange: handleChange,
                                                exampleData,
                                                openProbe,
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <Space>
                                <Button
                                    className={styles.btn}
                                    onClick={onClose}
                                >
                                    {__('取消')}
                                </Button>
                                <Button
                                    type="primary"
                                    className={styles.btn}
                                    disabled={loading}
                                    onClick={() => handleConfirm()}
                                >
                                    {__('提交')}
                                </Button>
                            </Space>
                        </div>
                    </div>
                </div>
            </div>
            {chooseTableOpen && (
                <ChooseTable
                    open={chooseTableOpen}
                    onClose={() => setChooseTableOpen(false)}
                    onConfirm={(selectedTable) => {
                        setTableInfo(selectedTable)
                    }}
                />
            )}
        </Drawer>
    )
}

export default Apply
