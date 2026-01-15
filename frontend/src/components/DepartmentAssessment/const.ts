import { AssessmentPlanTypeEnum, SortDirection } from '@/core'
import __ from './locale'

export const defaultTableSort = {
    default: 'descend',
    // target_name: null,
    // start_date: null,
    // end_date: null,
    // created_at: null,
    // updated_at: null,
}
export const defaultMenus = [
    { key: 'target_name', label: __('按目标名称排序') },
    { key: 'start_date', label: __('按计划开始日期排序') },
    { key: 'end_date', label: __('按计划结束日期排序') },
    { key: 'created_at', label: __('按目标创建时间排序') },
    { key: 'updated_at', label: __('按目标更新时间排序') },
]
export const defaultMenu = {
    key: 'default',
    sort: SortDirection.DESC,
}

export const PreViewDataConfig = [
    {
        title: '数据获取',
        key: 'data_collection',
        data1: {
            label: '计划归集资源数量',
            value: 'plan_count',
        },
        data2: {
            label: '已归集',
            value: 'actual_count',
        },
    },
    {
        title: '数据质量整改',
        key: 'quality_improve',
        data1: {
            label: '计划整改表数量',
            value: 'plan_count',
        },
        data2: {
            label: '已整改',
            value: 'actual_count',
        },
    },
    {
        title: '数据资源编目',
        key: 'resource_catalog',
        data1: {
            label: '计划编目数量',
            value: 'plan_count',
        },
        data2: {
            label: '已编目',
            value: 'actual_count',
        },
    },
]

export const PreViewBusinessConfig = [
    {
        title: '业务梳理',
        key: 'business_analysis',
        data1: {
            label: '计划构建业务模型数量',
            value: 'model_plan_count',
        },
        data2: {
            label: '已构建',
            value: 'model_actual_count',
        },
    },
    {
        title: '',
        key: 'business_analysis',
        data1: {
            label: '计划梳理业务流程图数量',
            value: 'flow_plan_count',
        },
        data2: {
            label: '已梳理',
            value: 'flow_actual_count',
        },
    },
    {
        title: '',
        key: 'business_analysis',
        data1: {
            label: '计划设计业务表数量',
            value: 'table_plan_count',
        },
        data2: {
            label: '已设计',
            value: 'table_actual_count',
        },
    },
]

export const DepAssessmentPlanTypeOptions = [
    {
        id: 'data_acquisition',
        value: AssessmentPlanTypeEnum.DataAcquisition,
        label: __('数据获取'),
    },
    {
        id: 'data_quality_improvement',
        value: AssessmentPlanTypeEnum.DataQualityImprovement,
        label: __('数据质量整改'),
    },
    {
        id: 'data_resource_cataloging',
        value: AssessmentPlanTypeEnum.DataResourceCataloging,
        label: __('数据资源编目'),
    },
    {
        id: 'business_analysis',
        value: AssessmentPlanTypeEnum.BusinessAnalysis,
        label: __('业务梳理'),
    },
]

export enum PlanListUseSceneEnum {
    // 目标详情
    TargetDetail = 'target_detail',
    // 目标评价
    TargetEvaluation = 'target_evaluation',
    // 计划列表
    PlanList = 'plan_list',
    // 概览
    Overview = 'overview',
}

export interface IPlanEvaluation {
    isError: boolean
    errorMessage: string
    id: string
    actual_quantity?: number
    plan_type: AssessmentPlanTypeEnum
    model_actual_count?: number
    table_actual_count?: number
    process_actual_count?: number
}
