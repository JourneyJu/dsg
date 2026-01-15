import __ from './locale'

export enum TabKey {
    /** 基础信息 */
    SubjectGroup = 'subjectGroup',
    /** 目录层级 */
    DataRange = 'dataRange',
}

export enum DataResourceType {
    /** 库表 */
    View = '1',
    /** 接口 */
    Api = '2',
    /** 文件 */
    File = '3',
}

/** 归集任务状态 */
export enum AggregationStatus {
    /** 已完成 */
    Completed = 'Completed',
    /** 进行中 */
    Running = 'Running',
    /** 失败 */
    Failed = 'Failed',
}

export const SubjectGroupKeys = ['类别', '数据目录', '库表数量', '部门数量']

export enum DataRangeKey {
    /** 国家级 */
    National = '1',
    /** 省级 */
    Province = '2',
    /** 市级 */
    City = '3',
    /** 县区级 */
    Country = '4',
}

/** 目录层级 */
export const DataRangeItems = [
    {
        label: __('国家级'),
        value: DataRangeKey.National,
        color: '#5B91FF',
    },
    {
        label: __('省级'),
        value: DataRangeKey.Province,
        color: '#3AC4FF',
    },
    {
        label: __('市级'),
        value: DataRangeKey.City,
        color: '#8894FF',
    },
    {
        label: __('县区级'),
        value: DataRangeKey.Country,
        color: '#8C7BEB',
    },
]
