import { Button, Collapse, Space, Tooltip } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react'
import { FontIcon } from '@/icons'
import __ from '../locale'
import styles from './styles.module.less'
import { IconType } from '@/icons/const'
import { Empty, LightweightSearch, SearchInput } from '@/ui'
import { SearchType } from '@/ui/LightweightSearch/const'
import { RefreshBtn } from '@/components/ToolbarComponents'
import {
    DepAssessmentPlanTypeOptions,
    IPlanEvaluation,
    PlanListUseSceneEnum,
} from '../const'
import PlanTable from './PlanTable'
import Create from './Create'
import dataEmpty from '@/assets/dataEmpty.svg'
import { PlanTypeDataInfoMap } from './helper'
import {
    AssessmentPlanTypeEnum,
    AssessmentTargetStatus,
    getTargetEvaluationDetail,
    ITargetEvaluationPlanItem,
    ITargetEvaluationPlans,
} from '@/core'

const { Panel } = Collapse

interface IPlanList {
    useScene?: PlanListUseSceneEnum
    targetId?: string
    plans: ITargetEvaluationPlans[]
    targetStatus: AssessmentTargetStatus
    onRefresh?: () => void
}

const PlanList = forwardRef(
    (
        {
            useScene = PlanListUseSceneEnum.PlanList,
            plans,
            targetId = '',
            targetStatus,
            onRefresh,
        }: IPlanList,
        ref,
    ) => {
        const [responsers, setResponsers] = useState<
            { label: string; value: string }[]
        >([])
        const [createPlanOpen, setCreatePlanOpen] = useState(false)
        const [searchCondition, setSearchCondition] = useState({
            keyword: '',
            owner: '',
        })
        const dataAcquisitionRef = useRef<any>()
        const dataQualityImprovementRef = useRef<any>()
        const dataResourceCatalogingRef = useRef<any>()
        const businessAnalysisRef = useRef<any>()

        const [dataSource, setDataSource] = useState<ITargetEvaluationPlans[]>(
            [],
        )

        useImperativeHandle(ref, () => ({
            getFormData: async () => {
                const dataCollectionData =
                    (await dataAcquisitionRef.current?.getFormData()) || []
                const dataQualityImprovementData =
                    (await dataQualityImprovementRef.current?.getFormData()) ||
                    []
                const dataResourceCatalogingData =
                    (await dataResourceCatalogingRef.current?.getFormData()) ||
                    []
                const businessAnalysisData =
                    (await businessAnalysisRef.current?.getFormData()) || []

                if (
                    dataCollectionData === 'error' ||
                    dataQualityImprovementData === 'error' ||
                    dataResourceCatalogingData === 'error' ||
                    businessAnalysisData === 'error'
                ) {
                    return 'error'
                }
                return {
                    data_collection: dataCollectionData?.map((item) => ({
                        id: item.id,
                        actual_quantity: Number(item.actual_quantity || 0),
                    })),
                    quality_improve: dataQualityImprovementData?.map(
                        (item) => ({
                            id: item.id,
                            actual_quantity: Number(item.actual_quantity || 0),
                        }),
                    ),
                    resource_catalog: dataResourceCatalogingData?.map(
                        (item) => ({
                            id: item.id,
                            actual_quantity: Number(item.actual_quantity || 0),
                        }),
                    ),
                    business_analysis: businessAnalysisData?.map((item) => ({
                        id: item.id,
                        flow_actual_count: Number(item.flow_actual_count || 0),
                        model_actual_count: Number(
                            item.model_actual_count || 0,
                        ),
                        table_actual_count: Number(
                            item.table_actual_count || 0,
                        ),
                    })),
                }
            },
        }))

        const initData = async () => {
            setDataSource(plans)
            const owners: string[] = []
            plans.forEach((plan) => {
                plan.plans.list.forEach((p) => {
                    if (!owners.includes(p.owner)) {
                        owners.push(p.owner)
                    }
                })
            })
            setResponsers(
                owners.map((owner) => ({
                    label: owner,
                    value: owner,
                })),
            )
        }

        useEffect(() => {
            if (plans) {
                initData()
            }
        }, [plans])

        const filterComponent = (
            <Space size={8}>
                <SearchInput
                    style={{ width: 280 }}
                    placeholder={__('搜索计划名称')}
                    value={searchCondition?.keyword}
                    onKeyChange={(val: string) => {
                        if (val === searchCondition?.keyword) return
                        setSearchCondition({
                            ...searchCondition,
                            keyword: val,
                        })
                    }}
                />
                <LightweightSearch
                    formData={[
                        {
                            label: __('责任人'),
                            key: 'owner',
                            options: [
                                { value: '', label: __('不限') },
                                ...responsers,
                            ],
                            type: SearchType.Radio,
                        },
                    ]}
                    onChange={(data, key) => {
                        if (!key) {
                            // 重置
                            setSearchCondition((prev) => ({
                                ...prev,
                                ...data,
                            }))
                        } else {
                            setSearchCondition((prev) => ({
                                ...prev,
                                [key]: data[key],
                            }))
                        }
                    }}
                    defaultValue={{ owner: '' }}
                />
                <RefreshBtn onClick={() => onRefresh?.()} />
            </Space>
        )

        const tooltipContent = (
            <div className={styles['header-tooltip']}>
                <div className={styles['header-tooltip-title']}>
                    {__('部门考核计划')}
                </div>
                <div className={styles['header-tooltip-content']}>
                    {__(
                        '1、部门考核计划由部门成员在「部门考核计划」页面自行创建，若用户不可见「部门考核计划」，可能是其用户权限不足。',
                    )}
                </div>
                <div className={styles['header-tooltip-content']}>
                    {__(
                        '2、当部门目标处于【待评价】或【已结束】状态，不可进行考核计划变更。',
                    )}
                </div>
            </div>
        )

        const headerComponent = (
            <div className={styles['plan-list-header']}>
                {__('考核计划')}
                <Tooltip
                    color="#fff"
                    placement="bottomRight"
                    arrowPointAtCenter
                    getPopupContainer={(n) => n.parentElement as HTMLElement}
                    title={tooltipContent}
                >
                    <FontIcon
                        name="icon-xinxitishi"
                        type={IconType.FONTICON}
                        className={styles['header-icon']}
                    />
                </Tooltip>
            </div>
        )

        const getEndedHeader = (
            planItem: (typeof DepAssessmentPlanTypeOptions)[number],
            allPlans: ITargetEvaluationPlanItem[],
        ) => {
            return (
                <div className={styles['plan-header-ended']}>
                    <div>{planItem.label}</div>
                    <div className={styles['right-plan-info']}>
                        {PlanTypeDataInfoMap[planItem.value].map(
                            (items, itemsIndex) => (
                                <>
                                    <div
                                        key={itemsIndex}
                                        className={styles['plan-info-group']}
                                    >
                                        {items.map((item, itemIndex) => {
                                            const count = allPlans.reduce(
                                                (acc, curr) => {
                                                    return (
                                                        acc +
                                                        (curr[item.key] || 0)
                                                    )
                                                },
                                                0,
                                            )
                                            return (
                                                <div
                                                    key={itemIndex}
                                                    className={
                                                        styles['plan-info-item']
                                                    }
                                                >
                                                    <div
                                                        className={styles.label}
                                                    >
                                                        {item.label}：
                                                    </div>
                                                    <div
                                                        className={styles.value}
                                                    >
                                                        {count}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {itemsIndex !==
                                        PlanTypeDataInfoMap[planItem.value]
                                            .length -
                                            1 && (
                                        <div
                                            className={
                                                styles['plan-info-divider']
                                            }
                                        />
                                    )}
                                </>
                            ),
                        )}
                    </div>
                </div>
            )
        }

        return (
            <div className={styles['plan-list']}>
                {useScene === PlanListUseSceneEnum.PlanList && headerComponent}
                <div className={styles['operation-container']}>
                    {useScene !== PlanListUseSceneEnum.PlanList &&
                        headerComponent}
                    {useScene === PlanListUseSceneEnum.PlanList &&
                    targetStatus === AssessmentTargetStatus.NoExpired ? (
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => {
                                setCreatePlanOpen(true)
                            }}
                        >
                            {__('添加考核计划')}
                        </Button>
                    ) : (
                        <div />
                    )}
                    {!dataSource || dataSource.length === 0
                        ? null
                        : filterComponent}
                </div>
                {!dataSource || dataSource.length === 0 ? (
                    <div>
                        <Empty
                            iconSrc={dataEmpty}
                            desc={
                                <div className={styles['empty-desc-container']}>
                                    <div>{__('当前目标暂无考核计划')}</div>
                                    {useScene ===
                                        PlanListUseSceneEnum.TargetDetail &&
                                    targetStatus ===
                                        AssessmentTargetStatus.Ended
                                        ? null
                                        : useScene !==
                                              PlanListUseSceneEnum.PlanList &&
                                          targetStatus !==
                                              AssessmentTargetStatus.ToBeEvaluated && (
                                              <div>
                                                  （
                                                  {__(
                                                      '如何创建考核计划？可查看',
                                                  )}
                                                  <Tooltip
                                                      color="#fff"
                                                      placement="bottomRight"
                                                      arrowPointAtCenter
                                                      getPopupContainer={(n) =>
                                                          n.parentElement as HTMLElement
                                                      }
                                                      title={tooltipContent}
                                                  >
                                                      <Button type="link">
                                                          {__('考核计划说明')}
                                                      </Button>
                                                  </Tooltip>
                                                  ）
                                              </div>
                                          )}
                                </div>
                            }
                        />
                    </div>
                ) : (
                    <Collapse
                        bordered={false}
                        collapsible="icon"
                        defaultActiveKey={DepAssessmentPlanTypeOptions.map(
                            (item) => item.id,
                        )}
                        className={styles['custom-collapse']}
                    >
                        {DepAssessmentPlanTypeOptions.map((item) => {
                            const planInfo = dataSource.find(
                                (p) => p.plan_type === item.value,
                            )
                            const allPlans = planInfo?.plans.list || []

                            const filteredPlans = allPlans.filter((p) => {
                                if (
                                    searchCondition.owner &&
                                    searchCondition.keyword
                                ) {
                                    return (
                                        p.owner === searchCondition.owner &&
                                        p.plan_name
                                            .toLocaleLowerCase()
                                            .includes(
                                                searchCondition.keyword.toLocaleLowerCase(),
                                            )
                                    )
                                }
                                if (searchCondition.owner) {
                                    return p.owner === searchCondition.owner
                                }
                                if (searchCondition.keyword) {
                                    return p.plan_name
                                        .toLocaleLowerCase()
                                        .includes(
                                            searchCondition.keyword.toLocaleLowerCase(),
                                        )
                                }
                                return true
                            })
                            return allPlans.length === 0 ? null : (
                                <Panel
                                    header={
                                        targetStatus ===
                                            AssessmentTargetStatus.Ended &&
                                        useScene ===
                                            PlanListUseSceneEnum.TargetDetail
                                            ? getEndedHeader(item, allPlans)
                                            : item.label
                                    }
                                    key={item.id}
                                    className={styles['custom-panel']}
                                    id={item.id}
                                >
                                    <PlanTable
                                        ref={
                                            item.value ===
                                            AssessmentPlanTypeEnum.DataAcquisition
                                                ? dataAcquisitionRef
                                                : item.value ===
                                                  AssessmentPlanTypeEnum.DataQualityImprovement
                                                ? dataQualityImprovementRef
                                                : item.value ===
                                                  AssessmentPlanTypeEnum.DataResourceCataloging
                                                ? dataResourceCatalogingRef
                                                : businessAnalysisRef
                                        }
                                        planType={item.value}
                                        dataSource={filteredPlans}
                                        useScene={useScene}
                                        targetStatus={targetStatus}
                                        onRefresh={() => onRefresh?.()}
                                        targetId={targetId}
                                    />
                                </Panel>
                            )
                        })}
                    </Collapse>
                )}

                {createPlanOpen && targetId && (
                    <Create
                        open={createPlanOpen}
                        onClose={() => {
                            setCreatePlanOpen(false)
                        }}
                        targetId={targetId}
                        onOk={() => onRefresh?.()}
                    />
                )}
            </div>
        )
    },
)

export default PlanList
