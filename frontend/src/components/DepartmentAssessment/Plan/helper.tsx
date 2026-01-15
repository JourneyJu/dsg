import { Space } from 'antd'
import __ from '../locale'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { AssessmentPlanTypeEnum } from '@/core'

export const PlanResNumColumn = {
    title: __('计划归集资源数量'),
    dataIndex: 'collection_count',
    key: 'collection_count',
    render: (num: number, record: any) => `${num} ${__('个')}`,
}

export const DataAcquisitionColumns = [
    PlanResNumColumn,
    // {
    //     title: __('关联已有数据归集计划'),
    //     dataIndex: 'related_plans',
    //     key: 'related_plans',
    //     render: (relatedPlans: { id: string; name: string }[], record: any) => {
    //         return Array.isArray(relatedPlans) && relatedPlans.length > 0 ? (
    //             <Space size={8}>
    //                 <FontIcon
    //                     name="icon-jihua"
    //                     type={IconType.COLOREDICON}
    //                     style={{ fontSize: 20 }}
    //                 />
    //                 {relatedPlans.map((plan) => plan.name).join(',')}
    //             </Space>
    //         ) : (
    //             '-'
    //         )
    //     },
    // },
]

export const DataAcquisitionEndedColumns = [
    PlanResNumColumn,
    {
        title: __('已归集资源数量'),
        dataIndex: 'actual_collection_count',
        key: 'actual_collection_count',
        render: (num: number, record: any) => `${num} ${__('个')}`,
    },
]

export const DataQualityImprovementColumns = [
    {
        title: __('计划整改表数量'),
        dataIndex: 'collection_count',
        key: 'collection_count',
        render: (num: number, record: any) => `${num} ${__('张')}`,
    },
]

export const DataQualityImprovementEndedColumns = [
    ...DataQualityImprovementColumns,
    {
        title: __('已整改表数量'),
        dataIndex: 'actual_collection_count',
        key: 'actual_collection_count',
        render: (num: number, record: any) => `${num} ${__('个')}`,
    },
]

export const DataCatalogingColumns = [
    {
        title: __('计划编目数量'),
        dataIndex: 'collection_count',
        key: 'collection_count',
        render: (num: number, record: any) => `${num} ${__('个')}`,
    },
]

export const DataCatalogingEndedColumns = [
    ...DataCatalogingColumns,
    {
        title: __('已编目数量'),
        dataIndex: 'actual_collection_count',
        key: 'actual_collection_count',
        render: (num: number, record: any) => `${num} ${__('个')}`,
    },
]

export const ModelNumColumn = {
    title: __('计划构建业务模型数量'),
    dataIndex: 'model_target_count',
    key: 'model_target_count',
    width: 200,
    render: (modelNum: number, record: any) =>
        record.model_target_count || record.model_count
            ? `${record.model_target_count || record.model_count} ${__('个')}`
            : '--',
}

export const ProcessNumColumn = {
    title: __('计划梳理业务流程图数量'),
    dataIndex: 'flow_target_count',
    key: 'flow_target_count',
    width: 200,
    render: (processNum: number, record: any) =>
        record.flow_target_count || record.flow_count
            ? `${record.flow_target_count || record.flow_count} ${__('个')}`
            : '--',
}

export const TableNumColumn = {
    title: __('计划设计业务表数量'),
    dataIndex: 'table_target_count',
    key: 'table_target_count',
    width: 200,
    render: (tableNum: number, record: any) =>
        record.table_target_count || record.table_count
            ? `${record.table_target_count || record.table_count} ${__('个')}`
            : '--',
}

export const BusinessAnalysisColumns = [
    ModelNumColumn,
    ProcessNumColumn,
    TableNumColumn,
]

export const BusinessAnalysisEndedColumns = [
    ModelNumColumn,
    {
        title: __('已构建业务模型数量'),
        dataIndex: 'model_actual_count',
        key: 'model_actual_count',
        render: (tableNum: number, record: any) =>
            tableNum ? `${tableNum} ${__('个')}` : '--',
    },
    ProcessNumColumn,
    {
        title: __('已梳理业务流程图数量'),
        dataIndex: 'flow_actual_count',
        key: 'flow_actual_count',
        render: (tableNum: number, record: any) =>
            tableNum ? `${tableNum} ${__('个')}` : '--',
    },
    TableNumColumn,
    {
        title: __('已设计业务表数量'),
        dataIndex: 'table_actual_count',
        key: 'table_actual_count',
        render: (tableNum: number, record: any) =>
            tableNum ? `${tableNum} ${__('个')}` : '--',
    },
]

export const PlanTableColumnsMap = {
    [AssessmentPlanTypeEnum.DataAcquisition]: DataAcquisitionColumns,
    [AssessmentPlanTypeEnum.DataQualityImprovement]:
        DataQualityImprovementColumns,
    [AssessmentPlanTypeEnum.DataResourceCataloging]: DataCatalogingColumns,
    [AssessmentPlanTypeEnum.BusinessAnalysis]: BusinessAnalysisColumns,
}

// 目标已结束的 planList 的表格特有列
export const PlanTableEndedColumnsMap = {
    [AssessmentPlanTypeEnum.DataAcquisition]: DataAcquisitionEndedColumns,
    [AssessmentPlanTypeEnum.DataQualityImprovement]:
        DataQualityImprovementEndedColumns,
    [AssessmentPlanTypeEnum.DataResourceCataloging]: DataCatalogingEndedColumns,
    [AssessmentPlanTypeEnum.BusinessAnalysis]: BusinessAnalysisEndedColumns,
}

// 计划类型数据信息 -- 已结束目标的 planList 的头部信息
export const PlanTypeDataInfoMap = {
    [AssessmentPlanTypeEnum.DataAcquisition]: [
        [
            {
                label: __('计划归集资源总数量'),
                value: '100',
                key: 'collection_count',
            },
            {
                label: __('已归集'),
                value: '100',
                key: 'actual_collection_count',
            },
        ],
    ],
    [AssessmentPlanTypeEnum.DataQualityImprovement]: [
        [
            {
                label: __('计划整改表总数量'),
                value: '100',
                key: 'collection_count',
            },
            {
                label: __('已整改'),
                value: '100',
                key: 'actual_collection_count',
            },
        ],
    ],
    [AssessmentPlanTypeEnum.DataResourceCataloging]: [
        [
            {
                label: __('计划编目总数量'),
                value: '100',
                key: 'collection_count',
            },
            {
                label: __('已编目'),
                value: '100',
                key: 'actual_collection_count',
            },
        ],
    ],
    [AssessmentPlanTypeEnum.BusinessAnalysis]: [
        [
            {
                label: __('计划构建业务模型总数量'),
                value: '100',
                key: 'model_target_count',
            },
            {
                label: __('已构建'),
                value: '100',
                key: 'model_actual_count',
            },
        ],
        [
            {
                label: __('计划梳理业务流程图总数量'),
                value: '100',
                key: 'flow_target_count',
            },
            {
                label: __('已梳理'),
                value: '100',
                key: 'flow_actual_count',
            },
        ],
        [
            {
                label: __('计划设计业务表总数量'),
                value: '100',
                key: 'table_target_count',
            },
            {
                label: __('已设计'),
                value: '100',
                key: 'table_actual_count',
            },
        ],
    ],
}
