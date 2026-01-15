import { dataKindOptions } from '../Forms/const'
import __ from './locale'

export enum ActiveType {
    /** 全部 */
    All = 'all',
    /** 本部门 */
    Department = 'department',
}

export const TypeOptions = [
    {
        label: __('全部'),
        value: ActiveType.All,
    },
    {
        label: __('本部门'),
        value: ActiveType.Department,
    },
]

export enum DataResourceType {
    /** 库表 */
    View = '1',
    /** 接口 */
    Api = '2',
    /** 文件 */
    File = '3',
}

export const KeyMap = {
    // 资源部门
    resource_department: {
        label: __('资源部门数'),
        value: 'department_count',
    },
    // 信息目录
    info_catalog: {
        label: __('信息资源目录'),
        value: 'info_catalog_count',
        children: [
            {
                label: __('信息项'),
                value: 'info_catalog_column_count',
            },
        ],
    },
    // 数据目录
    data_catalog: {
        label: __('数据资源目录'),
        value: 'data_catalog_count',
        children: [
            {
                label: __('信息项'),
                value: 'data_catalog_column_count',
            },
        ],
    },
    // 数据资源
    data_resource: {
        label: __('数据资源'),
        value: 'data_resource_count',
        children: [
            {
                label: __('库表'),
                value: DataResourceType.View,
            },
            {
                label: __('接口'),
                value: DataResourceType.Api,
            },
            {
                label: __('文件'),
                value: DataResourceType.File,
            },
        ],
    },

    // 前置机
    front_processor: {
        label: __('前置机'),
        value: 'front_end_processor',
        children: [
            {
                label: __('使用中'),
                value: 'front_end_processor_using',
                color: 'rgb(109, 212, 0)',
            },
            {
                label: __('已回收'),
                value: 'front_end_processor_reclaim',
                color: 'rgb(255, 28, 28)',
            },
        ],
    },
    // 前置库
    front_library: {
        label: __('前置库'),
        value: 'front_end_library',
        children: [
            {
                label: __('使用中'),
                value: 'front_end_library_using',
                color: 'rgb(109, 212, 0)',
            },
            {
                label: __('已回收'),
                value: 'front_end_library_reclaim',
                color: 'rgb(255, 28, 28)',
            },
        ],
    },
    // 归集任务
    aggregation_task: {
        label: __('归集任务'),
        value: 'aggregation',
        children: [
            {
                label: __('归集任务总数'),
                value: 'aggregation_total',
            },
            {
                label: __('已完成'),
                value: 'aggregation_completed',
            },
            {
                label: __('未完成'),
                value: 'aggregation_uncompleted',
            },
        ],
    },
}

export const LineOneKeys = [
    'resource_department',
    'info_catalog',
    'data_catalog',
    'data_resource',
]

export const LineTwoKeys = [
    'front_processor',
    'front_library',
    'aggregation_task',
]

export const DataResourceTypeItems = [
    {
        label: __('库表'),
        value: DataResourceType.View,
    },
    {
        label: __('接口'),
        value: DataResourceType.Api,
    },
    {
        label: __('文件'),
        value: DataResourceType.File,
    },
]

/** 归集任务状态 */
export enum AggregationStatus {
    /** 已完成 */
    Completed = 'Completed',
    /** 进行中 */
    Running = 'Running',
    /** 失败 */
    Failed = 'Failed',
}

/** 归集任务 */
export const AggregationItems = [
    {
        label: __('归集任务总数'),
        value: 'aggregation_total',
    },
    {
        label: __('已完成'),
        value: 'aggregation_completed',
    },
    {
        label: __('未完成'),
        value: 'aggregation_uncompleted',
    },
]

export const SubjectGroupKeys = ['类别', '数据目录', '库表数量', '部门数量']

export enum SyncMechanismKey {
    /** 未定义 */
    None = '0',
    /** 增量 */
    Incremental = '1',
    /** 全量 */
    Full = '2',
}

/** 更新方式 */
export const SyncMechanismItems = [
    {
        label: __('全量'),
        value: SyncMechanismKey.Full,
        color: '#3AC4FF',
    },
    {
        label: __('增量'),
        value: SyncMechanismKey.Incremental,
        color: '#8894FF',
    },
    {
        label: __('未定义'),
        value: SyncMechanismKey.None,
        color: '#5B91FF',
    },
]

export enum CyclesKey {
    /** 实时 */
    ActualTime = '1',
    /** 每日 */
    Everyday = '2',
    /** 每周 */
    Weekly = '3',
    /** 每月 */
    Monthly = '4',
    /** 每季度 */
    Quarterly = '5',
    /** 每半年 */
    Semiannually = '6',
    /** 每年 */
    Annually = '7',
    /** 其他 */
    Other = '8',
}
/** 更新频率 */
export const UpdateCycleItems = [
    {
        label: __('实时'),
        value: CyclesKey.ActualTime,
        color: '#8C7BEB',
    },
    {
        label: __('每日'),
        value: CyclesKey.Everyday,
        color: '#8894FF',
    },
    {
        label: __('每周'),
        value: CyclesKey.Weekly,
        color: '#3AC4FF',
    },
    {
        label: __('每月'),
        value: CyclesKey.Monthly,
        color: '#5B91FF',
    },
    {
        label: __('每季度'),
        value: CyclesKey.Quarterly,
        color: '#F25D5D',
    },
    {
        label: __('每半年'),
        value: CyclesKey.Semiannually,
        color: '#FF822F',
    },
    {
        label: __('每年'),
        value: CyclesKey.Annually,
        color: '#FFBA30',
    },
    {
        label: __('其他'),
        value: CyclesKey.Other,
        color: '#14CEAA',
    },
]
/** 基础信息分类 */
export const SubjectItems = dataKindOptions

/** 数据开放 */
export const OpenItems = [
    {
        label: __('部门数量'),
        value: 'open_department_count',
    },
    {
        label: __('已开放数据目录'),
        value: 'open_count',
    },
]

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

/** 资源类型 */
export const ResourceTypeItems = [
    {
        label: __('库表'),
        key: 'view',
        children: [
            {
                label: __('部门数量'),
                value: 'view_department_count',
            },
            {
                label: __('库表数量'),
                value: 'view_count',
            },
            {
                label: __('待归集库表数量'),
                value: 'view_aggregation_count',
            },
        ],
    },
    {
        label: __('接口'),
        key: 'api',
        children: [
            {
                label: __('部门数量'),
                value: 'api_department_count',
            },
            {
                label: __('生成接口'),
                value: 'api_generate_count',
            },
            {
                label: __('注册接口'),
                value: 'api_register_count',
            },
        ],
    },
    {
        label: __('文件'),
        key: 'file',
        children: [
            {
                label: __('部门数量'),
                value: 'file_department_count',
            },
            {
                label: __('文件数量'),
                value: 'file_count',
            },
        ],
    },
]
