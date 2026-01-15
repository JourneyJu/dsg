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

export enum DataProcessTypeEnum {
    DATA_PROCESS_WORK_ORDER = 'dataProcessWorkOrder',
    FINISHED_WORK_ORDER = 'finishedWorkOrder',
    PROCESSING_WORK_ORDER = 'processingWorkOrder',
    UNASSIGNED_WORK_ORDER = 'unassignedWorkOrder',
}
//

export const dataProcessColumns = [
    {
        title: __('数据处理工单'),
        key: DataProcessTypeEnum.DATA_PROCESS_WORK_ORDER,
    },
    {
        title: __('已完成工单'),
        key: DataProcessTypeEnum.FINISHED_WORK_ORDER,
    },
    {
        title: __('进行中工单'),
        key: DataProcessTypeEnum.PROCESSING_WORK_ORDER,
    },
    {
        title: __('未派发工单'),
        key: DataProcessTypeEnum.UNASSIGNED_WORK_ORDER,
    },
]
// 数据加工视图
export enum DataQualityTypeEnum {
    SHOULD_CHECK_DEPARTMENT = 'shouldCheckDepartment',
    SHOULD_CHECK_TABLE = 'shouldCheckTable',
    CHECKED_TABLE = 'checkedTable',
    REPAIRED_TABLE = 'repairedTable',
    PROBLEM_TABLE = 'problemTable',
    RESPONDED_TABLE = 'respondedTable',
    REPAIRING_TABLE = 'repairingTable',
    UNREPAIRED_TABLE = 'unrepairedTable',
}

export const dataQualityOptions = [
    {
        title: __('应检测部门'),
        key: DataQualityTypeEnum.SHOULD_CHECK_DEPARTMENT,
    },
    {
        title: __('应检测表'),
        key: DataQualityTypeEnum.SHOULD_CHECK_TABLE,
    },
    {
        title: __('已检测表'),
        key: DataQualityTypeEnum.CHECKED_TABLE,
    },
    {
        title: __('已整改表'),
        key: DataQualityTypeEnum.REPAIRED_TABLE,
    },
    {
        title: __('问题表'),
        key: DataQualityTypeEnum.PROBLEM_TABLE,
    },
    {
        title: __('已响应表'),
        key: DataQualityTypeEnum.RESPONDED_TABLE,
    },
    {
        title: __('整改中表'),
        key: DataQualityTypeEnum.REPAIRING_TABLE,
    },
    {
        title: __('未整改表'),
        key: DataQualityTypeEnum.UNREPAIRED_TABLE,
    },
]

export enum DataProcessViewTypeEnum {
    // 来源部门
    SOURCE_DEPARTMENT = 'sourceDepartment',
    // 来源表
    SOURCE_TABLE = 'sourceTable',
    // 加工任务
    PROCESSING_TASK = 'processingTask',
    // 成果表部门
    RESULT_TABLE_DEPARTMENT = 'resultTableDepartment',
    // 成果表
    RESULT_TABLE = 'resultTable',
}

// 数据加工视图配置
export const dataProcessViewConfig = [
    {
        title: __('来源部门'),
        key: DataProcessViewTypeEnum.SOURCE_DEPARTMENT,
    },
    {
        title: __('来源表'),
        key: DataProcessViewTypeEnum.SOURCE_TABLE,
    },
    {
        title: __('加工任务'),
        key: DataProcessViewTypeEnum.PROCESSING_TASK,
    },
    {
        title: __('成果表部门'),
        key: DataProcessViewTypeEnum.RESULT_TABLE_DEPARTMENT,
    },
    {
        title: __('成果表'),
        key: DataProcessViewTypeEnum.RESULT_TABLE,
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
    NULL = 0,
    INCREMENT = 1,
    FULL = 2,
}

export const updateTypeOptions = [
    { label: __('增量'), value: UpdateTypeEnum.INCREMENT },
    { label: __('全量'), value: UpdateTypeEnum.FULL },
    { label: '--', value: UpdateTypeEnum.NULL },
]

/**
 * 加工任务状态配置
 */
export const ProcessTaskStatusConfig = [
    {
        label: __('进行中'),
        key: 'running_task_count',
        color: '#3AC4FF',
        value: 0,
    },
    {
        label: __('已完成'),
        key: 'completed_task_count',
        color: '#14CEAA',
        value: 0,
    },

    {
        label: __('异常'),
        key: 'failed_task_count',
        color: '#F25D5D',
        value: 0,
    },
]

/**
 * 加工任务来源配置
 */
export const ProcessTaskSourceConfig = [
    {
        label: __('数据分析'),
        key: 'standalone_task_count',
        color: '#3AC4FF',
        value: 0,
    },
    {
        label: __('处理计划'),
        key: 'plan_task_count',
        color: '#8894FF',
        value: 0,
    },
    {
        label: __('日常任务'),
        key: 'data_analysis_task_count',
        color: '#5B91FF',
        value: 0,
    },
]

/**
 * 成果表详情配置
 */
export const ResultTableDetailConfig = [
    {
        label: __('数据分析'),
        key: 'standalone_task_count',
        color: '#3AC4FF',
        value: 0,
    },
    {
        label: __('处理计划'),
        key: 'plan_task_count',
        color: '#8894FF',
        value: 0,
    },
    {
        label: __('日常任务'),
        key: 'data_analysis_task_count',
        color: '#5B91FF',
        value: 0,
    },
]

export const XAxisLabelLimit = {
    len: 7,
    width: 120,
}
