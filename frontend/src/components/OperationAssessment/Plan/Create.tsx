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
import { OpAssessmentPlanTypeOptions } from '../const'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import {
    AssessmentPlanTypeEnum,
    createTargetAssessmentPlan,
    formatError,
    getAssessmentPlanDetail,
    getDataAggregationPlan,
    getDataComprehensionPlan,
    getDataProcessingPlan,
    getTargetEvaluationDetail,
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
        getPlanList(res.responsible_uid, res.plan_type)
        let business_items
        if (res.plan_type === AssessmentPlanTypeEnum.DataProcessing) {
            business_items = [
                {
                    checked: !!res.data_process_explore_quantity,
                    quantity: res.data_process_explore_quantity,
                },
                {
                    checked: !!res.data_process_fusion_quantity,
                    quantity: res.data_process_fusion_quantity,
                },
            ]
        }
        form.setFieldsValue({
            plan_type: res.plan_type,
            plan_name: res.plan_name,
            plan_desc: res.plan_desc,
            responsible_uid: res.responsible_uid,
            plan_quantity:
                res.plan_type === AssessmentPlanTypeEnum.DataAcquisition
                    ? res.plan_quantity
                    : undefined,
            data_understanding_quantity:
                res.plan_type === AssessmentPlanTypeEnum.DataUnderstanding
                    ? res.data_understanding_quantity
                    : undefined,
            related_data_collection_plan_id:
                res.plan_type === AssessmentPlanTypeEnum.DataAcquisition
                    ? res.related_data_collection_plan_id?.split(',')
                    : undefined,
            related_data_process_plan_id:
                res.plan_type === AssessmentPlanTypeEnum.DataProcessing
                    ? res.related_data_process_plan_id?.split(',')
                    : undefined,
            related_data_understanding_plan_id:
                res.plan_type === AssessmentPlanTypeEnum.DataUnderstanding
                    ? res.related_data_understanding_plan_id?.split(',')
                    : undefined,
            business_items,
        })
    }

    useEffect(() => {
        if (planId && isEdit) {
            getPlanDetail()
        }
    }, [planId, isEdit])

    // 根据负责人id 获取相关的计划
    const getPlanList = async (
        userId: string,
        type: AssessmentPlanTypeEnum,
    ) => {
        if (!userId) {
            setPlanList([])
            return
        }
        try {
            const action =
                type === AssessmentPlanTypeEnum.DataAcquisition
                    ? getDataAggregationPlan
                    : type === AssessmentPlanTypeEnum.DataProcessing
                    ? getDataProcessingPlan
                    : getDataComprehensionPlan
            const res = await action({
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
            getPlanList(currentId, AssessmentPlanTypeEnum.DataAcquisition)
        }
    }, [currentId, isEdit])

    const getInitData = async () => {
        try {
            const { entries } = await getTargetEvaluationDetail(targetId)
            const responser = {
                label: entries.responsible_name,
                value: entries.responsible_uid,
            }
            const employeesNameArr = entries.employee_name?.split(',') || []
            const employeesIdArr = entries.employee_id?.split(',') || []
            const employees = employeesNameArr.map((item, index) => ({
                label: item,
                value: employeesIdArr[index],
            }))
            setUserList([
                responser,
                ...employees.filter((item) => item.value !== responser.value),
            ])
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
                assessment_type: TargetTypeEnum.Operation,
                target_id: targetId,
                ...values,
                related_data_collection_plan_id: Array.isArray(
                    values.related_data_collection_plan_id,
                )
                    ? values.related_data_collection_plan_id.join(',')
                    : undefined,
                related_data_process_plan_id: Array.isArray(
                    values.related_data_process_plan_id,
                )
                    ? values.related_data_process_plan_id.join(',')
                    : undefined,
                related_data_understanding_plan_id: Array.isArray(
                    values.related_data_understanding_plan_id,
                )
                    ? values.related_data_understanding_plan_id.join(',')
                    : undefined,
                data_process_explore_quantity:
                    values.plan_type ===
                        AssessmentPlanTypeEnum.DataProcessing &&
                    values.business_items[0].checked
                        ? values.business_items[0].quantity
                        : undefined,
                data_process_fusion_quantity:
                    values.plan_type ===
                        AssessmentPlanTypeEnum.DataProcessing &&
                    values.business_items[1].checked
                        ? values.business_items[1].quantity
                        : undefined,
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
                            options={OpAssessmentPlanTypeOptions}
                            disabled={isEdit}
                            onChange={(e) => {
                                getPlanList(
                                    form.getFieldValue('responsible_uid'),
                                    e.target.value,
                                )
                            }}
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
                                                '责任人仅能分配给当前运营目标的成员。',
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
                            placeholder={__('请选择一个主要责任人')}
                            onChange={(value) => {
                                getPlanList(
                                    value,
                                    form.getFieldValue('plan_type'),
                                )
                            }}
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
                                                min={1}
                                                max={MAX_QUANTITY}
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
                    {/* 仅数据处理展示 */}
                    <Form.Item
                        noStyle
                        shouldUpdate={(pre, cur) =>
                            pre.plan_type !== cur.plan_type
                        }
                    >
                        {({ getFieldValue }) => {
                            return getFieldValue('plan_type') ===
                                AssessmentPlanTypeEnum.DataProcessing ? (
                                <>
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
                                                            (item) =>
                                                                !item.checked,
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
                                        <Row
                                            className={styles['plan-item-row']}
                                        >
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
                                                        {__('计划探查表数量')}
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
                                        <Row
                                            className={styles['plan-item-row']}
                                        >
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
                                                        {__('计划融合表数量')}
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
                                    </Form.Item>
                                    <Form.Item
                                        label={__('关联已有数理处理计划')}
                                        name="related_data_process_plan_id"
                                    >
                                        <Select
                                            placeholder={__(
                                                '请选择数据处理计划',
                                            )}
                                            options={planList}
                                            mode="multiple"
                                        />
                                    </Form.Item>
                                </>
                            ) : null
                        }}
                    </Form.Item>
                    {/* 仅数据理解展示 */}
                    <Form.Item
                        noStyle
                        shouldUpdate={(pre, cur) =>
                            pre.plan_type !== cur.plan_type
                        }
                    >
                        {({ getFieldValue }) => {
                            return getFieldValue('plan_type') ===
                                AssessmentPlanTypeEnum.DataUnderstanding ? (
                                <>
                                    <Space align="end">
                                        <Form.Item
                                            label={__(
                                                '计划理解数据资源目录数量',
                                            )}
                                            name="data_understanding_quantity"
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
                                        label={__('关联已有数据理解计划')}
                                        name="related_data_understanding_plan_id"
                                    >
                                        <Select
                                            placeholder={__(
                                                '请选择数据理解计划',
                                            )}
                                            options={planList}
                                            mode="multiple"
                                        />
                                    </Form.Item>
                                </>
                            ) : null
                        }}
                    </Form.Item>
                </Form>
            </div>
        </Drawer>
    )
}

export default Create
