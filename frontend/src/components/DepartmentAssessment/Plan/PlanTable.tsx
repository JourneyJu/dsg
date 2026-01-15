import {
    ExclamationCircleFilled,
    ExclamationCircleOutlined,
} from '@ant-design/icons'
import { Button, Form, Input, message, Space, Table, Tooltip } from 'antd'
import classNames from 'classnames'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import DetailModal from '@/components/DataPlanManage/PlanCollection/DetailModal'
import {
    AssessmentPlanTypeEnum,
    AssessmentTargetStatus,
    deleteAssessmentPlan,
    formatError,
    ITargetEvaluationPlanItem,
} from '@/core'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { Empty } from '@/ui'
import { confirm } from '@/utils/modalHelper'
import { PlanListUseSceneEnum } from '../const'
import { MultiColumn } from '../helper'
import __ from '../locale'
import Create from './Create'
import {
    DataCatalogingColumns,
    DataQualityImprovementColumns,
    ModelNumColumn,
    PlanResNumColumn,
    PlanTableColumnsMap,
    PlanTableEndedColumnsMap,
    ProcessNumColumn,
    TableNumColumn,
} from './helper'
import styles from './styles.module.less'
import TitleFilter from './TitleFilter'

interface PlanTableProps {
    planType: AssessmentPlanTypeEnum
    dataSource: ITargetEvaluationPlanItem[]
    useScene?: PlanListUseSceneEnum
    targetStatus?: AssessmentTargetStatus
    onRefresh?: () => void
    targetId: string
}

type TableItem = ITargetEvaluationPlanItem & {
    actual_quantity?: number
}

// 渲染表单字段错误的后缀图标
function renderFieldErrorSuffix(
    form: ReturnType<typeof Form.useForm>[0],
    namePath: (string | number)[],
) {
    const errs = form.getFieldError(namePath)
    if (!errs.length) return null
    return (
        <Tooltip
            title={errs[0]}
            placement="right"
            color="#fff"
            overlayInnerStyle={{
                color: 'rgba(0,0,0,0.85)',
            }}
            arrowPointAtCenter
            autoAdjustOverflow
        >
            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
        </Tooltip>
    )
}

const PlanTable = forwardRef(
    (
        {
            planType,
            dataSource,
            useScene = PlanListUseSceneEnum.PlanList,
            targetStatus = AssessmentTargetStatus.Ended,
            onRefresh,
            targetId,
        }: PlanTableProps,
        ref,
    ) => {
        const [form] = Form.useForm()
        const [operateItem, setOperateItem] = useState<TableItem>()
        const [tableData, setTableData] = useState<TableItem[]>([])
        const [detailOpen, setDetailOpen] = useState(false)
        const [relatedPlanId, setRelatedPlanId] = useState('')
        const [currentPage, setCurrentPage] = useState(1) // 当前页码
        // 保存多个字段的筛选状态
        const [filterStates, setFilterStates] = useState<
            Record<
                string,
                {
                    status: string // 筛选状态: '', '1', '2', '3'
                    actualField: string // 实际数量字段名 (field1)
                    targetField: string // 计划数量字段名 (field2)
                }
            >
        >({})

        useImperativeHandle(ref, () => ({
            getFormData: async () => {
                try {
                    await form.validateFields()
                    // 先同步当前表单数据到 tableData
                    const currentFormData =
                        form.getFieldValue('dataSource') || []
                    const baseData =
                        tableData.length > 0 ? tableData : currentFormData
                    const updatedTableData = baseData.map((item) => {
                        const formItem = currentFormData.find(
                            (d) => d.id === item.id,
                        )
                        return formItem || item
                    })
                    // 返回完整的数据，而不是筛选后的数据
                    return updatedTableData
                } catch (error) {
                    return 'error'
                }
            },
        }))

        useEffect(() => {
            const data = dataSource.map((item) => ({
                ...item,
                actual_quantity: item.actual_collection_count || undefined,
            }))
            setTableData(data)
            form.setFieldsValue({
                dataSource: data,
            })
        }, [dataSource])

        const handleDelete = async (planId: string) => {
            try {
                await deleteAssessmentPlan(planId)
                message.success('删除成功')
                onRefresh?.()
            } catch (error) {
                formatError(error)
            }
        }

        const handleConfimDelete = (planId: string) => {
            confirm({
                title: __('确定删除考核计划吗？'),
                icon: (
                    <ExclamationCircleFilled
                        style={{ color: 'rgb(250, 173, 20)' }}
                    />
                ),
                content: <div style={{ height: 36 }} />,
                okText: __('确定'),
                cancelText: __('取消'),
                onOk: () => handleDelete(planId),
            })
        }

        const filterData = (
            status: string,
            field1: string = 'actual_quantity',
            field2: string = 'collection_count',
        ) => {
            // 1. 先获取当前表单数据（包含用户修改）
            const currentFormData = form.getFieldValue('dataSource') || []

            // 2. 将用户的修改同步回 tableData
            // 如果 tableData 为空，使用 currentFormData 作为基础
            const baseData = tableData.length > 0 ? tableData : currentFormData
            const updatedTableData = baseData.map((item) => {
                const formItem = currentFormData.find((d) => d.id === item.id)
                return formItem || item
            })

            // 更新 tableData
            if (tableData.length === 0 && updatedTableData.length > 0) {
                setTableData(updatedTableData)
            } else if (tableData.length > 0) {
                setTableData(updatedTableData)
            }

            // 3. 更新当前字段的筛选状态
            const newFilterStates = { ...filterStates }

            if (status === '') {
                // 如果是"不限"，删除该字段的筛选状态
                delete newFilterStates[field1]
            } else {
                // 否则更新该字段的筛选状态
                newFilterStates[field1] = {
                    status,
                    actualField: field1,
                    targetField: field2,
                }
            }
            setFilterStates(newFilterStates)

            // 4. 应用所有字段的筛选条件（组合筛选）
            let filteredData = updatedTableData

            Object.values(newFilterStates).forEach((filter) => {
                if (!filter.status || filter.status === '') {
                    // 跳过"不限"的筛选
                    return
                }

                filteredData = filteredData.filter((item) => {
                    const actualValue = item[filter.actualField]
                    const targetValue = item[filter.targetField]

                    switch (filter.status) {
                        case '1':
                            // 未填项：有计划量但未填实际量
                            if (!targetValue) return false
                            return !actualValue
                        case '2':
                            // 已填项：已填写实际量
                            return !!actualValue
                        case '3':
                            // 异常项：未填项、超量、无效数字
                            if (!targetValue) return false
                            return (
                                !actualValue ||
                                actualValue === '0' ||
                                Number(actualValue || 0) >
                                    Number(targetValue) ||
                                !/^[0-9]+$/.test(String(actualValue || ''))
                            )
                        default:
                            return true
                    }
                })
            })

            // 5. 更新表单显示的数据
            form.setFieldsValue({
                dataSource: filteredData,
            })

            // 6. 重置分页到第1页
            setCurrentPage(1)

            // 7. 重新验证表单，确保错误提示正确显示
            setTimeout(() => {
                form.validateFields().catch(() => {
                    // 忽略验证错误，只是为了触发错误提示的显示
                })
            }, 0)
        }

        const getRelatedPlansTitle = (
            relatedPlans: { id: string; name: string }[],
        ) => {
            return (
                <div className={styles['related-plans-container']}>
                    {relatedPlans.map((plan, index) => (
                        <div
                            key={plan.id}
                            className={styles['related-plans-item']}
                        >
                            <div className={styles['plan-index']}>
                                {index + 1}
                            </div>
                            <div
                                className={styles['plan-name']}
                                onClick={() => {
                                    setDetailOpen(true)
                                    setRelatedPlanId(plan.id)
                                }}
                            >
                                {plan.name}
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        const getRules = (record: any, field: string = 'collection_count') => [
            {
                required: true,
                message: __('此项不允许为空'),
            },
            {
                pattern: /^[0-9]+$/,
                message: __('请输入≥0的整数'),
            },
            {
                validator: (rule, value, callback) => {
                    if (Number(value) === 0) {
                        callback(__('请输入≥0的整数'))
                    }
                    if (Number(value) > Number(record[field])) {
                        callback(__('实际完成量不能大于之前的计划量'))
                    }
                    callback()
                },
            },
        ]

        const getIndex = (id: string) => {
            // 使用表单当前的 dataSource 查找索引，而不是 tableData
            const currentData = form.getFieldValue('dataSource') || []
            return currentData.findIndex((item) => item.id === id)
        }

        const columns = () => {
            const commonColumns = [
                {
                    title: (
                        <div>
                            {__('考核计划名称')}
                            <span className={styles['name-desc-title']}>
                                {__('（描述）')}
                            </span>
                        </div>
                    ),
                    dataIndex: 'plan_name',
                    key: 'plan_name',
                    width: 300,
                    ellipsis: true,
                    render: (text: string, record: any) => {
                        return (
                            <MultiColumn
                                record={record}
                                firstField="plan_name"
                                secondField="description"
                            />
                        )
                    },
                },
                {
                    title: __('责任人'),
                    dataIndex: 'owner',
                    key: 'owner',
                    width: 150,
                    ellipsis: true,
                },
            ]

            const operateColumns = [
                {
                    title: __('操作'),
                    dataIndex: 'operate',
                    key: 'operate',
                    render: (text: string, record: any) => {
                        return (
                            <Space size={16}>
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setOperateItem(record)
                                    }}
                                >
                                    {__('编辑')}
                                </Button>
                                <Button
                                    type="link"
                                    onClick={() => {
                                        handleConfimDelete(record.id)
                                    }}
                                >
                                    {__('删除')}
                                </Button>
                            </Space>
                        )
                    },
                },
            ]

            const relatedPlansColumn =
                planType === AssessmentPlanTypeEnum.DataAcquisition
                    ? [
                          {
                              title: __('关联已有数据归集计划'),
                              dataIndex: 'related_plans',
                              key: 'related_plans',
                              render: (
                                  relatedPlans: { id: string; name: string }[],
                                  record: any,
                              ) => {
                                  return Array.isArray(relatedPlans) &&
                                      relatedPlans.length > 0 ? (
                                      <div
                                          className={
                                              styles['related-plans-info']
                                          }
                                      >
                                          <FontIcon
                                              name="icon-jihua"
                                              type={IconType.COLOREDICON}
                                              style={{ fontSize: 20 }}
                                          />
                                          <Tooltip
                                              color="#fff"
                                              getPopupContainer={(node) =>
                                                  node.parentElement as HTMLElement
                                              }
                                              overlayInnerStyle={{ padding: 0 }}
                                              title={
                                                  relatedPlans.length > 1
                                                      ? getRelatedPlansTitle(
                                                            relatedPlans,
                                                        )
                                                      : ''
                                              }
                                          >
                                              <div
                                                  className={classNames(
                                                      styles[
                                                          'related-plans-name'
                                                      ],
                                                      relatedPlans.length ===
                                                          1 &&
                                                          styles[
                                                              'single-related-plan'
                                                          ],
                                                  )}
                                                  onClick={() => {
                                                      if (
                                                          relatedPlans.length ===
                                                          1
                                                      ) {
                                                          setDetailOpen(true)
                                                          setRelatedPlanId(
                                                              relatedPlans[0]
                                                                  .id,
                                                          )
                                                      }
                                                  }}
                                              >
                                                  {relatedPlans
                                                      .map((plan) => plan.name)
                                                      .join(',')}
                                              </div>
                                          </Tooltip>
                                      </div>
                                  ) : (
                                      '--'
                                  )
                              },
                          },
                      ]
                    : []

            if (useScene === PlanListUseSceneEnum.PlanList) {
                const op =
                    targetStatus === AssessmentTargetStatus.NoExpired
                        ? operateColumns
                        : []
                return [
                    ...commonColumns,
                    ...PlanTableColumnsMap[planType],
                    ...relatedPlansColumn,
                    ...op,
                ]
            }

            if (useScene === PlanListUseSceneEnum.TargetDetail) {
                return [
                    ...commonColumns,
                    ...(targetStatus === AssessmentTargetStatus.Ended
                        ? PlanTableEndedColumnsMap[planType]
                        : PlanTableColumnsMap[planType]),
                    ...(targetStatus === AssessmentTargetStatus.Ended
                        ? []
                        : relatedPlansColumn),
                ]
            }

            if (useScene === PlanListUseSceneEnum.TargetEvaluation) {
                const dataAcquisitionEvaluationColumns = [
                    PlanResNumColumn,
                    {
                        title: (
                            <TitleFilter
                                title={__('已归集资源数量')}
                                getFilterStatus={filterData}
                            />
                        ),
                        dataIndex: 'resNum',
                        key: 'resNum',
                        render: (
                            resNum: number,
                            record: any,
                            index: number,
                        ) => {
                            return (
                                <Form.Item
                                    label=""
                                    name={[
                                        'dataSource',
                                        getIndex(record.id),
                                        'actual_quantity',
                                    ]}
                                    rules={getRules(record, 'collection_count')}
                                    help=""
                                    validateTrigger={['onChange', 'onBlur']}
                                >
                                    <Input
                                        placeholder={__('请输入≥0的整数')}
                                        style={{ width: 200 }}
                                        suffix={
                                            <Form.Item
                                                noStyle
                                                dependencies={[
                                                    [
                                                        'dataSource',
                                                        getIndex(record.id),
                                                        'actual_quantity',
                                                    ],
                                                ]}
                                            >
                                                {() =>
                                                    renderFieldErrorSuffix(
                                                        form,
                                                        [
                                                            'dataSource',
                                                            getIndex(record.id),
                                                            'actual_quantity',
                                                        ],
                                                    )
                                                }
                                            </Form.Item>
                                        }
                                    />
                                </Form.Item>
                            )
                        },
                    },
                    ...relatedPlansColumn,
                ]

                const dataQualityImprovementEvaluationColumns = [
                    ...DataQualityImprovementColumns,
                    {
                        title: (
                            <TitleFilter
                                title={__('已整改表数量')}
                                getFilterStatus={filterData}
                            />
                        ),
                        dataIndex: 'resNum',
                        key: 'resNum',
                        render: (resNum: number, record: any, index) => {
                            return (
                                <Form.Item
                                    label=""
                                    name={[
                                        'dataSource',
                                        getIndex(record.id),
                                        'actual_quantity',
                                    ]}
                                    rules={getRules(record, 'collection_count')}
                                    help=""
                                    validateTrigger={['onChange', 'onBlur']}
                                >
                                    <Input
                                        placeholder={__('请输入≥0的整数')}
                                        style={{ width: 200 }}
                                        suffix={
                                            <Form.Item
                                                noStyle
                                                dependencies={[
                                                    [
                                                        'dataSource',
                                                        getIndex(record.id),
                                                        'actual_quantity',
                                                    ],
                                                ]}
                                            >
                                                {() =>
                                                    renderFieldErrorSuffix(
                                                        form,
                                                        [
                                                            'dataSource',
                                                            getIndex(record.id),
                                                            'actual_quantity',
                                                        ],
                                                    )
                                                }
                                            </Form.Item>
                                        }
                                    />
                                </Form.Item>
                            )
                        },
                    },
                ]

                const dataCatalogingEvaluationColumns = [
                    ...DataCatalogingColumns,
                    {
                        title: (
                            <TitleFilter
                                title={__('已编目数量')}
                                getFilterStatus={filterData}
                            />
                        ),
                        dataIndex: 'resNum',
                        key: 'resNum',
                        render: (resNum: number, record: any, index) => {
                            return (
                                <Form.Item
                                    label=""
                                    name={[
                                        'dataSource',
                                        getIndex(record.id),
                                        'actual_quantity',
                                    ]}
                                    rules={getRules(record, 'collection_count')}
                                    help=""
                                    validateTrigger={['onChange', 'onBlur']}
                                >
                                    <Input
                                        placeholder={__('请输入≥0的整数')}
                                        style={{ width: 200 }}
                                        suffix={
                                            <Form.Item
                                                noStyle
                                                dependencies={[
                                                    [
                                                        'dataSource',
                                                        getIndex(record.id),
                                                        'actual_quantity',
                                                    ],
                                                ]}
                                            >
                                                {() =>
                                                    renderFieldErrorSuffix(
                                                        form,
                                                        [
                                                            'dataSource',
                                                            getIndex(record.id),
                                                            'actual_quantity',
                                                        ],
                                                    )
                                                }
                                            </Form.Item>
                                        }
                                    />
                                </Form.Item>
                            )
                        },
                    },
                ]

                const businessAnalysisEvaluationColumns = [
                    ModelNumColumn,
                    {
                        title: (
                            <TitleFilter
                                title={__('已构建业务模型数量')}
                                getFilterStatus={(status) =>
                                    filterData(
                                        status,
                                        'model_actual_count',
                                        'model_target_count',
                                    )
                                }
                            />
                        ),
                        dataIndex: 'resNum',
                        key: 'resNum',
                        width: 260,
                        render: (resNum: number, record: any, index) => {
                            return record.model_target_count ? (
                                <Form.Item
                                    label=""
                                    name={[
                                        'dataSource',
                                        getIndex(record.id),
                                        'model_actual_count',
                                    ]}
                                    rules={getRules(
                                        record,
                                        'model_target_count',
                                    )}
                                    help=""
                                    validateTrigger={['onChange', 'onBlur']}
                                >
                                    <Input
                                        placeholder={__('请输入≥0的整数')}
                                        style={{ width: 200 }}
                                        suffix={
                                            <Form.Item
                                                noStyle
                                                dependencies={[
                                                    [
                                                        'dataSource',
                                                        getIndex(record.id),
                                                        'model_actual_count',
                                                    ],
                                                ]}
                                            >
                                                {() =>
                                                    renderFieldErrorSuffix(
                                                        form,
                                                        [
                                                            'dataSource',
                                                            getIndex(record.id),
                                                            'model_actual_count',
                                                        ],
                                                    )
                                                }
                                            </Form.Item>
                                        }
                                    />
                                </Form.Item>
                            ) : (
                                <span className={styles['no-fill-text']}>
                                    {__('无需填写')}
                                </span>
                            )
                        },
                    },
                    ProcessNumColumn,
                    {
                        title: (
                            <TitleFilter
                                title={__('已梳理业务流程图数量')}
                                getFilterStatus={(status) =>
                                    filterData(
                                        status,
                                        'flow_actual_count',
                                        'flow_target_count',
                                    )
                                }
                            />
                        ),
                        dataIndex: 'resNum',
                        key: 'resNum',
                        width: 260,
                        render: (resNum: number, record: any, index) => {
                            return record.flow_target_count ? (
                                <Form.Item
                                    label=""
                                    name={[
                                        'dataSource',
                                        getIndex(record.id),
                                        'flow_actual_count',
                                    ]}
                                    rules={getRules(
                                        record,
                                        'flow_target_count',
                                    )}
                                    help=""
                                    validateTrigger={['onChange', 'onBlur']}
                                >
                                    <Input
                                        placeholder={__('请输入≥0的整数')}
                                        style={{ width: 200 }}
                                        suffix={
                                            <Form.Item
                                                noStyle
                                                dependencies={[
                                                    [
                                                        'dataSource',
                                                        getIndex(record.id),
                                                        'flow_actual_count',
                                                    ],
                                                ]}
                                            >
                                                {() =>
                                                    renderFieldErrorSuffix(
                                                        form,
                                                        [
                                                            'dataSource',
                                                            getIndex(record.id),
                                                            'flow_actual_count',
                                                        ],
                                                    )
                                                }
                                            </Form.Item>
                                        }
                                    />
                                </Form.Item>
                            ) : (
                                <span className={styles['no-fill-text']}>
                                    {__('无需填写')}
                                </span>
                            )
                        },
                    },
                    TableNumColumn,
                    {
                        title: (
                            <TitleFilter
                                title={__('已设计业务表数量')}
                                getFilterStatus={(status) =>
                                    filterData(
                                        status,
                                        'table_actual_count',
                                        'table_target_count',
                                    )
                                }
                            />
                        ),
                        dataIndex: 'resNum',
                        key: 'resNum',
                        width: 260,
                        render: (resNum: number, record: any, index) => {
                            return record.table_target_count ? (
                                <Form.Item
                                    label=""
                                    name={[
                                        'dataSource',
                                        getIndex(record.id),
                                        'table_actual_count',
                                    ]}
                                    rules={getRules(
                                        record,
                                        'table_target_count',
                                    )}
                                    help=""
                                    validateTrigger={['onChange', 'onBlur']}
                                >
                                    <Input
                                        placeholder={__('请输入≥0的整数')}
                                        style={{ width: 200 }}
                                        suffix={
                                            <Form.Item
                                                noStyle
                                                dependencies={[
                                                    [
                                                        'dataSource',
                                                        getIndex(record.id),
                                                        'table_actual_count',
                                                    ],
                                                ]}
                                            >
                                                {() =>
                                                    renderFieldErrorSuffix(
                                                        form,
                                                        [
                                                            'dataSource',
                                                            getIndex(record.id),
                                                            'table_actual_count',
                                                        ],
                                                    )
                                                }
                                            </Form.Item>
                                        }
                                    />
                                </Form.Item>
                            ) : (
                                <span className={styles['no-fill-text']}>
                                    {__('无需填写')}
                                </span>
                            )
                        },
                    },
                ]

                const EvaluationColumnsMap = {
                    [AssessmentPlanTypeEnum.DataAcquisition]:
                        dataAcquisitionEvaluationColumns,
                    [AssessmentPlanTypeEnum.DataQualityImprovement]:
                        dataQualityImprovementEvaluationColumns,
                    [AssessmentPlanTypeEnum.DataResourceCataloging]:
                        dataCatalogingEvaluationColumns,
                    [AssessmentPlanTypeEnum.BusinessAnalysis]:
                        businessAnalysisEvaluationColumns,
                }
                return [...commonColumns, ...EvaluationColumnsMap[planType]]
            }
            return []
        }

        return (
            <div className={styles['plan-table']}>
                <Form form={form} autoComplete="off">
                    <Form.Item
                        name="dataSource"
                        valuePropName="dataSource"
                        trigger="onTableChange"
                        getValueFromEvent={() =>
                            form.getFieldValue('dataSource')
                        }
                    >
                        <Table
                            locale={{
                                emptyText: <Empty />,
                            }}
                            columns={columns()}
                            pagination={{
                                current: currentPage,
                                showQuickJumper: true,
                                showSizeChanger: true,
                                showTotal: (count) =>
                                    __('共${count}条', { count }),
                            }}
                            scroll={{
                                x: columns().length * 150,
                            }}
                            onChange={(pagination) => {
                                // 更新当前页码
                                setCurrentPage(pagination.current || 1)
                                // 翻页后重新验证表单，确保错误提示正确显示
                                setTimeout(() => {
                                    form.validateFields().catch(() => {
                                        // 忽略验证错误，只是为了触发错误提示的显示
                                    })
                                }, 0)
                            }}
                        />
                    </Form.Item>
                </Form>
                {operateItem && (
                    <Create
                        open={!!operateItem}
                        planId={operateItem?.id}
                        onClose={() => {
                            setOperateItem(undefined)
                        }}
                        targetId={targetId}
                        onOk={() => {
                            setOperateItem(undefined)
                            onRefresh?.()
                        }}
                        isEdit
                    />
                )}
                {detailOpen && (
                    <DetailModal
                        id={relatedPlanId}
                        onClose={() => {
                            setDetailOpen(false)
                            setRelatedPlanId('')
                        }}
                    />
                )}
            </div>
        )
    },
)

export default PlanTable
