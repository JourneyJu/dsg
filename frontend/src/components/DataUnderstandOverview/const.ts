import __ from './locale'

export enum OverviewRangeEnum {
    // 数据处理概览
    ALL = 'all',

    // 本部门
    DEPARTMENT = 'department',
}

export const operationOptions = [
    { label: __('全部'), value: OverviewRangeEnum.ALL },
    { label: __('本部门'), value: OverviewRangeEnum.DEPARTMENT },
]

// 服务领域
export const serviceAreaOptions = [
    {
        title: __('信用信息'),
        dataIndex: '信用信息',
        key: '信用信息',
    },
    {
        title: __('金融信息'),
        dataIndex: '金融信息',
        key: '金融信息',
    },
    {
        title: __('医疗健康'),
        dataIndex: '医疗健康',
        key: '医疗健康',
    },
    {
        title: __('城市交通'),
        dataIndex: '城市交通',
        key: '城市交通',
    },
    {
        title: __('文化旅游'),
        dataIndex: '文化旅游',
        key: '文化旅游',
    },
    {
        title: __('行政执法'),
        dataIndex: '行政执法',
        key: '行政执法',
    },
    {
        title: __('党的建设'),
        dataIndex: '党的建设',
        key: '党的建设',
    },
]

export enum ServiceAreaEnum {
    // 数据目录
    DATA_CATALOG = 'data_catalog',
    // 库表数量
    TABLE = 'table',
    // 理解任务
    BUSINESS_OBJECT = 'business_object',
}

export const serviceAreaEnumOptions = [
    { label: __('数据目录数量'), value: ServiceAreaEnum.DATA_CATALOG },
    { label: __('库表数量'), value: ServiceAreaEnum.TABLE },
    { label: __('业务对象数量'), value: ServiceAreaEnum.BUSINESS_OBJECT },
]

export enum BaseInfoClassificationEnum {
    DEPARTMENT = 'department',
    UNDERSTOOD_DATA_CATALOG = 'understood_data_catalog',
    NOT_UNDERSTOOD_DATA_CATALOG = 'not_understood_data_catalog',
    COMPLETION_RATE = 'completion_rate',
}

export const baseInfoClassificationEnumOptions = [
    {
        label: __('数据理解部门'),
        key: BaseInfoClassificationEnum.DEPARTMENT,
        value: 0,
    },
    {
        label: __('已理解数据目录'),
        key: BaseInfoClassificationEnum.UNDERSTOOD_DATA_CATALOG,
        value: 0,
    },
    {
        label: __('未理解数据目录'),
        key: BaseInfoClassificationEnum.NOT_UNDERSTOOD_DATA_CATALOG,
        value: 0,
    },
    {
        label: __('完成率'),
        key: BaseInfoClassificationEnum.COMPLETION_RATE,
        value: 0,
    },
]

export enum TimeRangeEnum {
    // 按年
    YEAR = 'year',
    // 按季度
    QUARTER = 'quarter',
    // 按月
    MONTH = 'month',
}

export const timeRangeEnumOptions = [
    { label: __('按年度'), key: TimeRangeEnum.YEAR },
    { label: __('按季度'), key: TimeRangeEnum.QUARTER },
    { label: __('按月度'), key: TimeRangeEnum.MONTH },
]

export const TaskDataConfig = [
    {
        label: __('理解任务总数'),
        key: 'total_task_count',
        value: 0,
    },
    {
        label: __('已完成'),
        key: 'completed_task_count',
        value: 0,
    },
    {
        label: __('进行中'),
        key: 'in_progress_task_count',
        value: 0,
    },
    {
        label: __('异常'),
        key: 'abnormal_task_count',
        value: 0,
    },
]

export const dataAssessmentConfigs = [
    // 库表
    {
        label: __('完整性'),
        key: 'completeness_score',
    },
    // 接口
    {
        label: __('准确性'),
        key: 'accuracy_score',
    },
    // 文件
    {
        label: __('及时性'),
        key: 'timeliness_score',
    },
]

export enum UpdateTypeEnum {
    INCREMENT = 1,
    FULL = 2,
}

export const updateTypeOptions = [
    { label: __('增量'), value: UpdateTypeEnum.INCREMENT },
    { label: __('全量'), value: UpdateTypeEnum.FULL },
]

export enum CatalogStatus {
    // 已处理
    PROCESSED = 'processed',
    // 未处理
    UNPROCESSED = 'unprocessed',
}

export const catalogStatusOptions = [
    { label: __('已处理'), key: CatalogStatus.PROCESSED },
    { label: __('未处理'), key: CatalogStatus.UNPROCESSED },
]

export enum TaskStatus {
    READY = 1,
    ONGOING = 2,
    COMPLETED = 3,
    All = 999,
}

export const taskStatusOptions = [
    { label: __('全部'), key: TaskStatus.All },
    { label: __('进行中'), key: TaskStatus.ONGOING },
    { label: __('已完成'), key: TaskStatus.COMPLETED },
    { label: __('未开始'), key: TaskStatus.READY },
]
