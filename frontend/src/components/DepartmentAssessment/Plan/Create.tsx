import {
    Checkbox,
    Drawer,
    Form,
    Input,
    InputNumber,
    Radio,
    Select,
    Space,
    Row,
    Col,
    Button,
    Tooltip,
    message,
} from 'antd'
import { useEffect, useState } from 'react'
import __ from '../locale'
import styles from './styles.module.less'
import { DepAssessmentPlanTypeOptions } from '../const'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import {
    AssessmentPlanTypeEnum,
    createTargetAssessmentPlan,
    formatError,
    getAssessmentPlanDetail,
    getDataAggregationPlan,
    getTargetEvaluationDetail,
    getUserByDepartId,
    ICreateTargetAssessmentPlanParams,
    ITargetEvaluationPlanItem,
    TargetTypeEnum,
    updateTargetAssessmentPlan,
} from '@/core'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { BusinessItemTypeMap, MAX_QUANTITY } from './const'

interface ICreate {
    open: boolean
    onClose: () => void
    onOk?: () => void
    targetId: string
    planId?: string
    isEdit?: boolean
}

const Create = ({
    open,
    onClose,
    onOk,
    targetId,
    planId,
    isEdit = false,
}: ICreate) => {
    const [form] = Form.useForm()
    const [userList, setUserList] = useState<
        { value: string; label: string }[]
    >([])
    const [currentId] = useCurrentUser('ID')
    const [planList, setPlanList] = useState<
        {
            value: string
            label: string
        }[]
    >([])

    const getPlanDetail = async () => {
        const res = await getAssessmentPlanDetail(planId!)
        getPlanList(res.responsible_uid)
        let business_items
        if (res.plan_type === AssessmentPlanTypeEnum.BusinessAnalysis) {
            const modelItem = res.business_items.find(
                (item) => item.type === 'model',
            )
            const tableItem = res.business_items.find(
                (item) => item.type === 'table',
            )
            const processItem = res.business_items.find(
                (item) => item.type === 'process',
            )
            business_items = [
                {
                    checked: modelItem?.type === 'model',
                    quantity: modelItem?.quantity,
                },
                {
                    checked: tableItem?.type === 'table',
                    quantity: tableItem?.quantity,
                },
                {
                    checked: processItem?.type === 'process',
                    quantity: processItem?.quantity,
                },
            ]
        }
        form.setFieldsValue({
            plan_type: res.plan_type,
            plan_name: res.plan_name,
            plan_desc: res.plan_desc,
            responsible_uid: res.responsible_uid,
            plan_quantity: res.plan_quantity,
            related_data_collection_plan_id:
                res.plan_type === AssessmentPlanTypeEnum.DataAcquisition &&
                res.related_data_collection_plan_id
                    ? res.related_data_collection_plan_id?.split(',')
                    : undefined,
            business_items,
        })
    }

    useEffect(() => {
        if (planId && isEdit) {
            getPlanDetail()
        }
    }, [planId, isEdit])

    // 根据负责人id 获取相关的归集计划
    const getPlanList = async (userId: string) => {
        try {
            const res = await getDataAggregationPlan({
                limit: 1000,
                user_id: userId,
                audit_status: 'pass',
            })
            setPlanList(
                res.entries?.map((item) => ({
                    value: item.id,
                    label: item.name,
                })) || [],
            )
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        if (currentId && !isEdit) {
            form.setFieldsValue({
                responsible_uid: currentId,
            })
            getPlanList(currentId)
        }
    }, [currentId, isEdit])

    const getInitData = async () => {
        try {
            const targetDetail = await getTargetEvaluationDetail(targetId)
            const users = await getUserByDepartId({
                depart_id: targetDetail.entries.department_id,
                is_depart_in_need: true,
            })
            setUserList(
                users.map((item) => ({
                    value: item.id,
                    label: item.name,
                })),
            )
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        if (targetId) {
            getInitData()
        }
    }, [targetId])

    const onFinish = async (values: any) => {
        try {
            const action = isEdit
                ? updateTargetAssessmentPlan.bind(null, planId!)
                : createTargetAssessmentPlan

            await action({
                assessment_type: TargetTypeEnum.Department,
                target_id: targetId,
                plan_type: values.plan_type,
                plan_name: values.plan_name,
                plan_desc: values.plan_desc,
                responsible_uid: values.responsible_uid,
                plan_quantity: values.plan_quantity,
                related_data_collection_plan_id: Array.isArray(
                    values.related_data_collection_plan_id,
                )
                    ? values.related_data_collection_plan_id.join(',')
                    : '',
                business_items:
                    values.business_items
                        ?.map((item, index) => ({
                            type: BusinessItemTypeMap[index],
                            quantity: item.quantity,
                            checked: item.checked,
                        }))
                        ?.filter((item) => item.checked && item.quantity)
                        ?.map(({ type, quantity }) => ({
                            type,
                            quantity,
                        })) || [],
            })
            message.success(isEdit ? __('编辑成功') : __('添加成功'))
            onClose()
            onOk?.()
        } catch (error) {
            formatError(error)
        }
    }

    return (
        <Drawer
            title={__('添加考核计划')}
            width={640}
            open={open}
            onClose={onClose}
            maskClosable={false}
            footer={
                <div className={styles['create-footer']}>
                    <Button onClick={onClose}>{__('取消')}</Button>
                    <Button type="primary" onClick={() => form.submit()}>
                        {__('确定')}
                    </Button>
                </div>
            }
        >
            <div className={styles['create-container']}>
                <Form
                    layout="vertical"
                    autoComplete="off"
                    form={form}
                    onFinish={onFinish}
                    initialValues={{
                        plan_type: AssessmentPlanTypeEnum.DataAcquisition,
                        business_items: [
                            { checked: false, quantity: undefined },
                            { checked: false, quantity: undefined },
                            { checked: false, quantity: undefined },
                        ],
                    }}
                >
                    <Form.Item
                        label={__('类型')}
                        name="plan_type"
                        className={styles['horizontal-form-item']}
                    >
                        <Radio.Group
                            optionType="button"
                            options={DepAssessmentPlanTypeOptions}
                            disabled={isEdit}
                        />
                    </Form.Item>

                    <Form.Item
                        label={__('考核计划名称')}
                        name="plan_name"
                        required
                        rules={[
                            {
                                required: true,
                                message: __('请输入'),
                            },
                        ]}
                    >
                        <Input
                            placeholder={__('请输入考核计划名称')}
                            maxLength={128}
                        />
                    </Form.Item>
                    <Form.Item label={__('描述')} name="plan_desc">
                        <Input.TextArea
                            placeholder={__('请输入描述')}
                            maxLength={800}
                            showCount
                            className={styles['desc-textarea']}
                        />
                    </Form.Item>
                    <Form.Item
                        label={
                            <div>
                                {__('责任人')}
                                <Tooltip
                                    color="#fff"
                                    title={
                                        <div style={{ color: '#000' }}>
                                            {__(
                                                '当前计划属于部门目标，责任人仅能分配给同部门的用户。',
                                            )}
                                        </div>
                                    }
                                >
                                    <FontIcon
                                        name="icon-xinxitishi"
                                        type={IconType.FONTICON}
                                        className={
                                            styles['responser-info-icon']
                                        }
                                    />
                                </Tooltip>
                            </div>
                        }
                        name="responsible_uid"
                    >
                        <Select
                            options={userList}
                            placeholder={__('请选择责任人')}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                    {/* 仅数据获取展示 */}
                    <Form.Item
                        noStyle
                        shouldUpdate={(pre, cur) =>
                            pre.plan_type !== cur.plan_type
                        }
                    >
                        {({ getFieldValue }) => {
                            return getFieldValue('plan_type') ===
                                AssessmentPlanTypeEnum.DataAcquisition ? (
                                <>
                                    <Space align="end">
                                        <Form.Item
                                            label={__('计划归集资源数量')}
                                            name="plan_quantity"
                                            required
                                            rules={[
                                                {
                                                    required: true,
                                                    message: __('请输入'),
                                                },
                                            ]}
                                        >
                                            <InputNumber
                                                placeholder={__(
                                                    '请输入≥1的整数',
                                                )}
                                                style={{ width: 570 }}
                                                max={MAX_QUANTITY}
                                                min={1}
                                                precision={0}
                                            />
                                        </Form.Item>
                                        <Form.Item>{__('个')}</Form.Item>
                                    </Space>
                                    <Form.Item
                                        label={__('关联已有数据归集计划')}
                                        name="related_data_collection_plan_id"
                                    >
                                        <Select
                                            placeholder={__(
                                                '请选择数据归集计划',
                                            )}
                                            options={planList}
                                            mode="multiple"
                                        />
                                    </Form.Item>
                                </>
                            ) : null
                        }}
                    </Form.Item>
                    {/* 仅数据质量整改展示 */}
                    <Form.Item
                        noStyle
                        shouldUpdate={(pre, cur) =>
                            pre.plan_type !== cur.plan_type
                        }
                    >
                        {({ getFieldValue }) => {
                            return getFieldValue('plan_type') ===
                                AssessmentPlanTypeEnum.DataQualityImprovement ? (
                                <Space align="end">
                                    <Form.Item
                                        label={__('计划整改表数量')}
                                        name="plan_quantity"
                                        required
                                        rules={[
                                            {
                                                required: true,
                                                message: __('请输入'),
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            placeholder={__('请输入≥1的整数')}
                                            style={{ width: 570 }}
                                            max={MAX_QUANTITY}
                                            min={1}
                                            precision={0}
                                        />
                                    </Form.Item>
                                    <Form.Item>{__('个')}</Form.Item>
                                </Space>
                            ) : null
                        }}
                    </Form.Item>
                    {/* 仅数据资源编目展示 */}
                    <Form.Item
                        noStyle
                        shouldUpdate={(pre, cur) =>
                            pre.plan_type !== cur.plan_type
                        }
                    >
                        {({ getFieldValue }) => {
                            return getFieldValue('plan_type') ===
                                AssessmentPlanTypeEnum.DataResourceCataloging ? (
                                <Space align="end">
                                    <Form.Item
                                        label={__('计划编目数量')}
                                        name="plan_quantity"
                                        required
                                        rules={[
                                            {
                                                required: true,
                                                message: __('请输入'),
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            placeholder={__('请输入≥1的整数')}
                                            style={{ width: 570 }}
                                            max={MAX_QUANTITY}
                                            min={1}
                                            precision={0}
                                        />
                                    </Form.Item>
                                    <Form.Item>{__('个')}</Form.Item>
                                </Space>
                            ) : null
                        }}
                    </Form.Item>
                    {/* 仅业务梳理展示 */}
                    <Form.Item
                        noStyle
                        shouldUpdate={(pre, cur) =>
                            pre.plan_type !== cur.plan_type
                        }
                    >
                        {({ getFieldValue }) => {
                            return getFieldValue('plan_type') ===
                                AssessmentPlanTypeEnum.BusinessAnalysis ? (
                                <Form.Item
                                    label={
                                        <div>
                                            {__('计划事项')}
                                            <span
                                                className={
                                                    styles['plan-item-desc']
                                                }
                                            >
                                                {__(
                                                    '（至少要选择一个计划完成的事项）',
                                                )}
                                            </span>
                                        </div>
                                    }
                                    name="business_items"
                                    required
                                    rules={[
                                        {
                                            validator: (_, value) => {
                                                if (
                                                    value.length === 0 ||
                                                    value.every(
                                                        (item) => !item.checked,
                                                    )
                                                ) {
                                                    return Promise.reject(
                                                        new Error(
                                                            __(
                                                                '请选择计划事项',
                                                            ),
                                                        ),
                                                    )
                                                }
                                                return Promise.resolve()
                                            },
                                        },
                                    ]}
                                >
                                    <Row className={styles['plan-item-row']}>
                                        <Space>
                                            <Form.Item
                                                name={[
                                                    'business_items',
                                                    '0',
                                                    'checked',
                                                ]}
                                                valuePropName="checked"
                                            >
                                                <Checkbox>
                                                    {__('计划构建业务模型数量')}
                                                </Checkbox>
                                            </Form.Item>
                                            <Form.Item
                                                noStyle
                                                shouldUpdate={(pre, cur) =>
                                                    pre.business_items !==
                                                    cur.business_items
                                                }
                                            >
                                                {() => {
                                                    return getFieldValue([
                                                        'business_items',
                                                        '0',
                                                        'checked',
                                                    ]) ? (
                                                        <Space align="end">
                                                            <Form.Item
                                                                name={[
                                                                    'business_items',
                                                                    '0',
                                                                    'quantity',
                                                                ]}
                                                                rules={[
                                                                    {
                                                                        required:
                                                                            true,
                                                                        message:
                                                                            __(
                                                                                '请输入',
                                                                            ),
                                                                    },
                                                                ]}
                                                            >
                                                                <InputNumber
                                                                    placeholder={__(
                                                                        '请输入≥1的整数',
                                                                    )}
                                                                    style={{
                                                                        width: 380,
                                                                    }}
                                                                    max={
                                                                        MAX_QUANTITY
                                                                    }
                                                                    min={1}
                                                                    precision={
                                                                        0
                                                                    }
                                                                />
                                                            </Form.Item>
                                                            <Form.Item>
                                                                个
                                                            </Form.Item>
                                                        </Space>
                                                    ) : null
                                                }}
                                            </Form.Item>
                                        </Space>
                                    </Row>
                                    <Row className={styles['plan-item-row']}>
                                        <Space>
                                            <Form.Item
                                                name={[
                                                    'business_items',
                                                    '1',
                                                    'checked',
                                                ]}
                                                valuePropName="checked"
                                            >
                                                <Checkbox>
                                                    {__('计划梳理业务流程数量')}
                                                </Checkbox>
                                            </Form.Item>
                                            <Form.Item
                                                noStyle
                                                shouldUpdate={(pre, cur) =>
                                                    pre.business_items !==
                                                    cur.business_items
                                                }
                                            >
                                                {() => {
                                                    return getFieldValue([
                                                        'business_items',
                                                        '1',
                                                        'checked',
                                                    ]) ? (
                                                        <Space align="end">
                                                            <Form.Item
                                                                name={[
                                                                    'business_items',
                                                                    '1',
                                                                    'quantity',
                                                                ]}
                                                                rules={[
                                                                    {
                                                                        required:
                                                                            true,
                                                                        message:
                                                                            __(
                                                                                '请输入',
                                                                            ),
                                                                    },
                                                                ]}
                                                            >
                                                                <InputNumber
                                                                    placeholder={__(
                                                                        '请输入≥1的整数',
                                                                    )}
                                                                    style={{
                                                                        width: 380,
                                                                    }}
                                                                    max={
                                                                        MAX_QUANTITY
                                                                    }
                                                                    min={1}
                                                                    precision={
                                                                        0
                                                                    }
                                                                />
                                                            </Form.Item>
                                                            <Form.Item>
                                                                个
                                                            </Form.Item>
                                                        </Space>
                                                    ) : null
                                                }}
                                            </Form.Item>
                                        </Space>
                                    </Row>
                                    <Row className={styles['plan-item-row']}>
                                        <Space>
                                            <Form.Item
                                                name={[
                                                    'business_items',
                                                    '2',
                                                    'checked',
                                                ]}
                                                valuePropName="checked"
                                            >
                                                <Checkbox>
                                                    {__('计划设计业务表数量')}
                                                </Checkbox>
                                            </Form.Item>
                                            <Form.Item
                                                noStyle
                                                shouldUpdate={(pre, cur) =>
                                                    pre.business_items !==
                                                    cur.business_items
                                                }
                                            >
                                                {() => {
                                                    return getFieldValue([
                                                        'business_items',
                                                        '2',
                                                        'checked',
                                                    ]) ? (
                                                        <Space align="end">
                                                            <Form.Item
                                                                name={[
                                                                    'business_items',
                                                                    '2',
                                                                    'quantity',
                                                                ]}
                                                                rules={[
                                                                    {
                                                                        required:
                                                                            true,
                                                                        message:
                                                                            __(
                                                                                '请输入',
                                                                            ),
                                                                    },
                                                                ]}
                                                            >
                                                                <InputNumber
                                                                    placeholder={__(
                                                                        '请输入≥1的整数',
                                                                    )}
                                                                    style={{
                                                                        width: 380,
                                                                    }}
                                                                    max={
                                                                        MAX_QUANTITY
                                                                    }
                                                                    min={1}
                                                                    precision={
                                                                        0
                                                                    }
                                                                />
                                                            </Form.Item>
                                                            <Form.Item>
                                                                个
                                                            </Form.Item>
                                                        </Space>
                                                    ) : null
                                                }}
                                            </Form.Item>
                                        </Space>
                                    </Row>
                                </Form.Item>
                            ) : null
                        }}
                    </Form.Item>
                </Form>
            </div>
        </Drawer>
    )
}

export default Create
