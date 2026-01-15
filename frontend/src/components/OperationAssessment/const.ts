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
        title: '数据归集',
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
        title: '数据理解',
        key: 'data_understanding',
        data1: {
            label: '计划理解数据资源目录数量',
            value: 'plan_count',
        },
        data2: {
            label: '已理解',
            value: 'actual_count',
        },
    },
]

export const PreViewDataProcessConfig = [
    {
        title: '数据处理',
        key: 'data_process',
        data1: {
            label: '计划探查表数量',
            value: 'explore_plan_count',
        },
        data2: {
            label: '已探查',
            value: 'explore_actual_count',
        },
    },
    {
        title: '',
        key: 'data_process',
        data1: {
            label: '计划融合表数量',
            value: 'fusion_plan_count',
        },
        data2: {
            label: '已融合',
            value: 'fusion_actual_count',
        },
    },
]

export const OpAssessmentPlanTypeOptions = [
    {
        id: 'data_acquisition',
        value: AssessmentPlanTypeEnum.DataAcquisition,
        label: __('数据获取'),
    },
    {
        id: 'data_processing',
        value: AssessmentPlanTypeEnum.DataProcessing,
        label: __('数据处理'),
    },
    {
        id: 'data_understanding',
        value: AssessmentPlanTypeEnum.DataUnderstanding,
        label: __('数据理解'),
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
