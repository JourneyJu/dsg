import { v4 as uuidv4 } from 'uuid'
import { formatTime } from '@/utils'
import __ from './locale'

export const anchorConfig = [
    {
        key: 'baseInfo',
        title: __('需求信息'),
    },
    {
        key: 'sceneProduct',
        title: __('分析场景产物'),
    },
    {
        key: 'departmentInfo',
        title: __('部门信息'),
    },
]

export enum CommissionType {
    CommissionBased = 'commission-based',
    SelfService = 'self-service',
}

export const commissionTypeOptions = [
    {
        label: __('委托型'),
        value: CommissionType.CommissionBased,
    },
    {
        label: __('自助型'),
        value: CommissionType.SelfService,
    },
]

export enum OutputType {
    Table = 'table',
    Report = 'report',
    Api = 'api',
}

export const outputTypeOptions = [
    {
        label: __('数据表'),
        value: OutputType.Table,
    },
    {
        label: __('分析报告'),
        value: OutputType.Report,
    },
    {
        label: __('接口'),
        value: OutputType.Api,
    },
]

export const analysisConclusionConfig = [
    {
        label: __('可行'),
        value: 'feasible',
    },
    {
        label: __('不可行'),
        value: 'unfeasible',
    },
]

export enum SubmitType {
    Submit = 'submit',
    Draft = 'draft',
}

export const ID_SUFFIX = 'DATA_ANALYSIS_DEMAND'
export const generateId = () => `${ID_SUFFIX}_${uuidv4()}`
