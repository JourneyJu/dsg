import { ExclamationCircleFilled } from '@ant-design/icons'
import {
    Button,
    Col,
    DatePicker,
    Form,
    Input,
    message,
    Row,
    Select,
    Space,
    Tooltip,
} from 'antd'
import { trim } from 'lodash'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ApplyAnchor from '@/components/CitySharing/Apply/ApplyAnchor'
import DrawerHeader from '@/components/CitySharing/component/DrawerHeader'
import DepartmentAndOrgSelect from '@/components/DepartmentAndOrgSelect'
import {
    formatError,
    getCurUserDepartment,
    getDataAnalRequireDetail,
    getDataAnalRequireUniqueCheck,
    getUserByDepartId,
    IAnalOutputItem,
    ICatalog,
    IDataAnalRequire,
    IDataAnalRequireDetail,
    postDataAnalRequire,
    putDataAnalRequire,
} from '@/core'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { CommonTitle } from '@/ui'
import { ErrorInfo, phoneNumberReg } from '@/utils'
import { confirm } from '@/utils/modalHelper'
import AnalysisOutputTable from '../components/AnalysisOutputTable'
import {
    anchorConfig,
    CommissionType,
    commissionTypeOptions,
    ID_SUFFIX,
    OutputType,
    outputTypeOptions,
    SubmitType,
} from '../const'
import __ from '../locale'
import UploadAttachment from '../Upload'
import styles from './styles.module.less'

const Apply = () => {
    const [form] = Form.useForm()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const applyId = searchParams.get('applyId')
    const back = searchParams.get('back')
    const container = useRef(null)
    const [users, setUsers] = useState<any[]>([])
    const analysisOutputTableRef = useRef<any>(null)
    const [commissionType, setCommissionType] = useState<CommissionType>()
    const [detail, setDetail] = useState<IDataAnalRequireDetail>()
    const [initAnalysisOutput, setInitAnalysisOutput] = useState<any[]>([])
    const [firstDep, setFirstDep] = useState<any>()
    const [userInfo] = useCurrentUser()

    const goBack = () => {
        if (back === 'person-center') {
            navigate(`/personal-center?leftTab=myApplys&subTabKey=SJFX`)
        } else {
            navigate('/dataAnalysis/applyList')
        }
    }

    // 获取当前部门
    const getCurDepartment = async () => {
        try {
            const deps = await getCurUserDepartment()
            const [firstDept] = deps ?? []
            setFirstDep(firstDept)

            if (firstDept?.id) {
                form.setFieldsValue({ apply_org_code: firstDept.id })
                const userRes = await getUserByDepartId({
                    depart_id: firstDept.id,
                })
                setUsers(userRes)
            }
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        getCurDepartment()
    }, [])

    useEffect(() => {
        if (!applyId && userInfo?.VisionName) {
            form.setFieldsValue({ contact: userInfo?.VisionName })
        }
    }, [applyId, userInfo])

    const getDetails = async () => {
        try {
            const res = await getDataAnalRequireDetail(applyId!, {
                fields: 'base',
            })
            setDetail(res)
            const { anal_output_items, commission_type, finish_date, ...rest } =
                res.base
            form.setFieldsValue({
                ...rest,
                commission_type,
                finish_date: finish_date ? moment(finish_date) : undefined,
            })
            setCommissionType(commission_type as any as CommissionType)
            setInitAnalysisOutput(
                anal_output_items?.map((item) => {
                    const { name, id, catalogs } = item
                    const columns: any[] = []
                    catalogs.forEach((catalog) => {
                        catalog.columns.forEach((column) => {
                            columns.push({ ...column, ...catalog })
                        })
                    })
                    return {
                        name,
                        id,
                        columns,
                    }
                }),
            )
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        if (applyId) {
            getDetails()
        }
    }, [applyId])

    const handleConfirm = async (type: SubmitType) => {
        const outputData = analysisOutputTableRef.current?.getItems()
        if (type === SubmitType.Submit) {
            const values = await form.validateFields()
            if (
                values.commission_type === CommissionType.SelfService &&
                !(outputData?.length > 0)
            ) {
                message.error(__('请添加分析场景产物'))
                return
            }

            confirm({
                title: __('确认提交${name}吗？', { name: values.name }),
                icon: <ExclamationCircleFilled style={{ color: '#FAAD14' }} />,
                content:
                    values.commission_type === CommissionType.CommissionBased
                        ? __('提交后，需部门审核，请确认')
                        : '',
                onOk: () => handleSubmit(type, values, outputData),
            })
        } else {
            const values = await form.getFieldsValue()
            if (!values.name?.trim()) {
                form.validateFields(['name'])
                return
            }
            handleSubmit(type, values, outputData)
        }
    }

    const handleSubmit = async (type: SubmitType, values, outputData) => {
        try {
            const analOutputItems: IAnalOutputItem[] = []
            outputData?.forEach((opdItem) => {
                const catalogs: ICatalog[] = []
                opdItem?.columns?.forEach((item) => {
                    const target = catalogs.find(
                        (c) => c.catalog_id === item.catalog_id,
                    )
                    const {
                        catalog_id,
                        catalog_code,
                        catalog_name,
                        view_id,
                        view_code,
                        view_busi_name,
                        view_tech_name,
                        is_increment_field,
                        is_mandatory,
                        is_pk,
                        is_standardized,
                        id,
                        ...rest
                    } = item
                    const col = {
                        is_increment_field: !!is_increment_field,
                        is_mandatory: !!is_mandatory,
                        is_pk: !!is_pk,
                        is_standardized: !!is_standardized,
                        // 创建自定义数据时，前端会加一个id，需要删除
                        id: id
                            ? id.includes(ID_SUFFIX)
                                ? undefined
                                : id
                            : undefined,
                        ...rest,
                    }
                    if (!target) {
                        catalogs.push({
                            catalog_id,
                            catalog_code,
                            catalog_name,
                            view_id,
                            view_code,
                            view_busi_name,
                            view_tech_name,
                            columns: [col],
                        })
                    } else {
                        target.columns.push(col)
                    }
                })
                analOutputItems.push({
                    name: opdItem.name,
                    catalogs,
                })
            })
            const params: IDataAnalRequire = {
                submit_type: type,
                ...values,
                attachments: undefined,
                finish_date: values.finish_date?.endOf('day').valueOf(),
                attachment_ids: values.attachments
                    ?.map((item) => item.id)
                    .join(','),
                // 仅自助型必填，委托型不传或传null）
                anal_output_items:
                    values.commission_type === CommissionType.SelfService
                        ? analOutputItems.length > 0
                            ? analOutputItems
                            : null
                        : null,
            }

            await (applyId
                ? putDataAnalRequire(applyId, params)
                : postDataAnalRequire(params))
            message.success(
                type === SubmitType.Submit ? __('提交成功') : __('暂存成功'),
            )
            goBack()
        } catch (error) {
            formatError(error)
        }
    }

    // 检查申请名称是否重复
    const checkNameRepeat = async (value: string) => {
        try {
            if (trim(value)) {
                const res = await getDataAnalRequireUniqueCheck({ name: value })
                if (res.is_repeated) {
                    return Promise.reject(
                        new Error(__('该名称已存在，请重新输入')),
                    )
                }
            }
            return Promise.resolve()
        } catch (ex) {
            formatError(ex)
            return Promise.resolve()
        }
    }

    const handleFieldsChange = (field) => {
        if (field[0]?.name[0]?.includes('commission_type')) {
            setCommissionType(field[0].value)
            form.setFieldsValue({ output_type: undefined })
        }
    }

    return (
        <div className={styles.apply}>
            {/* 导航头部 */}
            <DrawerHeader title={__('需求申报')} onClose={goBack} />
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
                                onFieldsChange={handleFieldsChange}
                            >
                                <div id="baseInfo">
                                    <div className={styles['content-title']}>
                                        <CommonTitle title={__('需求信息')} />
                                    </div>
                                    <Row gutter={129}>
                                        <Col span={24}>
                                            <Form.Item
                                                name="name"
                                                label={__('需求名称')}
                                                required
                                                validateTrigger={[
                                                    'onChange',
                                                    'onBlur',
                                                ]}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: __('请输入'),
                                                    },
                                                    applyId
                                                        ? {}
                                                        : {
                                                              validateTrigger:
                                                                  'onBlur',
                                                              validator: (
                                                                  e,
                                                                  value,
                                                              ) =>
                                                                  checkNameRepeat(
                                                                      value,
                                                                  ),
                                                          },
                                                ]}
                                            >
                                                <Input
                                                    placeholder={__('请输入')}
                                                    maxLength={128}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="commission_type"
                                                label={
                                                    <>
                                                        {__('委托方式')}
                                                        <Tooltip
                                                            title={
                                                                <div>
                                                                    <div>
                                                                        {__(
                                                                            '委托型：不具备数据分析能力的政务部门，可向市数据资源管理局申请，由第三方团队通过数据分析平台协助完成业务分析。',
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        {__(
                                                                            '自助型：具备数据分析能力的政务部门，依托市级数据管理及分析平台开展业务，由市数据资源管理局提供数据及工具支持。',
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            }
                                                        >
                                                            <FontIcon
                                                                name="icon-xinxitishi"
                                                                type={
                                                                    IconType.FONTICON
                                                                }
                                                                className={
                                                                    styles[
                                                                        'commission-type-tip'
                                                                    ]
                                                                }
                                                            />
                                                        </Tooltip>
                                                    </>
                                                }
                                                required
                                                validateTrigger={[
                                                    'onChange',
                                                    'onBlur',
                                                ]}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: __('请输入'),
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    placeholder={__('请选择')}
                                                    options={
                                                        commissionTypeOptions
                                                    }
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="finish_date"
                                                label={__('期望完成时间')}
                                                required
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            __('请选择日期'),
                                                    },
                                                ]}
                                            >
                                                <DatePicker
                                                    placeholder={__(
                                                        '请选择日期',
                                                    )}
                                                    style={{ width: '100%' }}
                                                    getPopupContainer={(n) => n}
                                                    disabledDate={(current) => {
                                                        return (
                                                            current &&
                                                            current <
                                                                moment().startOf(
                                                                    'day',
                                                                )
                                                        )
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                noStyle
                                                shouldUpdate={(pre, cur) =>
                                                    pre.commission_type !==
                                                    cur.commission_type
                                                }
                                            >
                                                {({ getFieldValue }) => {
                                                    return (
                                                        <Form.Item
                                                            name="output_type"
                                                            label={__(
                                                                '期望分析成果',
                                                            )}
                                                            required
                                                            validateTrigger={[
                                                                'onChange',
                                                                'onBlur',
                                                            ]}
                                                            rules={[
                                                                {
                                                                    required:
                                                                        true,
                                                                    message:
                                                                        __(
                                                                            '请选择',
                                                                        ),
                                                                },
                                                            ]}
                                                        >
                                                            <Select
                                                                placeholder={__(
                                                                    '请选择',
                                                                )}
                                                                options={
                                                                    getFieldValue(
                                                                        'commission_type',
                                                                    ) ===
                                                                    CommissionType.SelfService
                                                                        ? outputTypeOptions.filter(
                                                                              (
                                                                                  item,
                                                                              ) =>
                                                                                  item.value !==
                                                                                  OutputType.Api,
                                                                          )
                                                                        : outputTypeOptions
                                                                }
                                                            />
                                                        </Form.Item>
                                                    )
                                                }}
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item
                                                name="business_scene"
                                                label={__('业务场景描述')}
                                                required
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: __('请输入'),
                                                    },
                                                ]}
                                                style={{ marginBottom: 40 }}
                                            >
                                                <Input.TextArea
                                                    placeholder={__(
                                                        '请详细描述计划的业务用途，例如：在我的xxAPP生活服务中开辟专题，市民可查询全xx市已开放的养老院的名称、地址、联系电话等信息。',
                                                    )}
                                                    autoSize={{
                                                        minRows: 4,
                                                        maxRows: 4,
                                                    }}
                                                    showCount
                                                    maxLength={500}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item
                                                name="expect_effect"
                                                label={__('预期应用成效')}
                                                required
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: __('请输入'),
                                                    },
                                                ]}
                                                style={{ marginBottom: 40 }}
                                            >
                                                <Input.TextArea
                                                    placeholder={__(
                                                        '请填写实施支撑服务政务事项多少个，少填少报信息项多少个，办事减少跑动多少次，产生多少经济价值等可预期效果等，例如：支撑我的xxAPP专题办理。',
                                                    )}
                                                    autoSize={{
                                                        minRows: 4,
                                                        maxRows: 4,
                                                    }}
                                                    showCount
                                                    maxLength={500}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item
                                                noStyle
                                                shouldUpdate={(pre, cur) =>
                                                    pre.commission_type !==
                                                    cur.commission_type
                                                }
                                            >
                                                {({ getFieldValue }) => (
                                                    <Form.Item
                                                        label={__('附件')}
                                                        name="attachments"
                                                        rules={[
                                                            {
                                                                required:
                                                                    getFieldValue(
                                                                        'commission_type',
                                                                    ) ===
                                                                    CommissionType.CommissionBased,
                                                                message:
                                                                    __(
                                                                        '请上传附件',
                                                                    ),
                                                            },
                                                        ]}
                                                    >
                                                        <UploadAttachment />
                                                    </Form.Item>
                                                )}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                                {commissionType ===
                                    CommissionType.SelfService && (
                                    <div id="sceneProduct">
                                        <div
                                            className={styles['content-title']}
                                        >
                                            <CommonTitle
                                                title={__('分析场景产物')}
                                            />
                                        </div>
                                        <AnalysisOutputTable
                                            ref={analysisOutputTableRef}
                                            data={initAnalysisOutput}
                                        />
                                    </div>
                                )}

                                <div id="departmentInfo">
                                    <div className={styles['content-title']}>
                                        <CommonTitle title={__('部门信息')} />
                                    </div>
                                    <Row gutter={48}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="apply_org_code"
                                                label={__('申请部门')}
                                                required
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: __('请选择'),
                                                    },
                                                ]}
                                            >
                                                <DepartmentAndOrgSelect
                                                    placeholder={__('请选择')}
                                                    disabled
                                                    defaultValue={firstDep?.id}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={48}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="contact"
                                                label={__('需求联系人')}
                                                required
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: __('请选择'),
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    placeholder={__('请选择')}
                                                    options={users}
                                                    fieldNames={{
                                                        label: 'name',
                                                        value: 'name',
                                                    }}
                                                    onChange={(val) => {
                                                        const user = users.find(
                                                            (u) =>
                                                                u.name === val,
                                                        )
                                                        if (user.phone_number) {
                                                            form.setFieldsValue(
                                                                {
                                                                    contact_phone:
                                                                        user.phone_number,
                                                                },
                                                            )
                                                        }
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="contact_phone"
                                                label={__('联系电话')}
                                                required
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: __('请输入'),
                                                    },
                                                    {
                                                        pattern: phoneNumberReg,
                                                        message:
                                                            ErrorInfo.PHONENUMBER,
                                                    },
                                                ]}
                                            >
                                                <Input
                                                    placeholder={__('请输入')}
                                                    maxLength={11}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            </Form>
                        </div>
                        {/* 锚点 */}
                        <ApplyAnchor
                            container={container}
                            config={
                                commissionType === CommissionType.SelfService
                                    ? anchorConfig
                                    : anchorConfig.filter(
                                          (item) => item.key !== 'sceneProduct',
                                      )
                            }
                        />
                    </div>

                    <div className={styles.footer}>
                        <Space>
                            <Button className={styles.btn} onClick={goBack}>
                                {__('取消')}
                            </Button>
                            <Button
                                className={styles.btn}
                                onClick={() => handleConfirm(SubmitType.Draft)}
                            >
                                {__('暂存')}
                            </Button>
                            <Button
                                type="primary"
                                className={styles.btn}
                                // loading={saveLoading}
                                onClick={() => handleConfirm(SubmitType.Submit)}
                            >
                                {__('提交')}
                            </Button>
                        </Space>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Apply
