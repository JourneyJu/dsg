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

export const RelatedPlansColumn = {
    title: __('关联已有数据归集计划'),
    dataIndex: 'related_plans',
    key: 'related_plans',
    ellipsis: true,
    render: (relatedPlans: { id: string; name: string }[], record: any) => {
        return Array.isArray(relatedPlans) && relatedPlans.length > 0 ? (
            <Space size={8}>
                <FontIcon
                    name="icon-jihua"
                    type={IconType.COLOREDICON}
                    style={{ fontSize: 20 }}
                />
                {relatedPlans.map((plan) => plan.name).join(',')}
            </Space>
        ) : (
            '--'
        )
    },
}

export const DataAcquisitionColumns = [PlanResNumColumn]

export const DataAcquisitionEndedColumns = [
    PlanResNumColumn,
    {
        title: __('已归集资源数量'),
        dataIndex: 'actual_collection_count',
        key: 'actual_collection_count',
        render: (num: number, record: any) => `${num} ${__('个')}`,
    },
]

export const ExploreNumColumn = {
    title: __('计划探查表数量'),
    dataIndex: 'data_process_explore_target',
    key: 'data_process_explore_target',
    render: (exploreNum: number, record: any) =>
        `${record.data_process_explore_target || 0} ${__('个')}`,
}

export const FusionNumColumn = {
    title: __('计划融合表数量'),
    dataIndex: 'data_process_fusion_target',
    key: 'data_process_fusion_target',
    render: (fusionNum: number, record: any) =>
        `${record.data_process_fusion_target || 0} ${__('个')}`,
}

export const DataProcessingColumns = [ExploreNumColumn, FusionNumColumn]

export const DataProcessingEndedColumns = [
    ExploreNumColumn,
    {
        title: __('已探查表数量'),
        dataIndex: 'data_process_explore_actual',
        key: 'data_process_explore_actual',
        render: (num: number, record: any) => `${num} ${__('个')}`,
    },
    FusionNumColumn,
    {
        title: __('已融合表数量'),
        dataIndex: 'data_process_fusion_actual',
        key: 'data_process_fusion_actual',
        render: (num: number, record: any) => `${num} ${__('个')}`,
    },
]

export const DataUnderstandingColumns = [
    {
        title: __('计划理解数据资源目录数量'),
        dataIndex: 'data_understanding_target',
        key: 'data_understanding_target',
        render: (num: number, record: any) => `${num || 0} ${__('个')}`,
    },
]

export const DataUnderstandingEndedColumns = [
    ...DataUnderstandingColumns,
    {
        title: __('已理解数据资源目录数量'),
        dataIndex: 'data_understanding_actual',
        key: 'data_understanding_actual',
        render: (tableNum: number, record: any) => `${tableNum} ${__('个')}`,
    },
]

export const PlanTableColumnsMap = {
    [AssessmentPlanTypeEnum.DataAcquisition]: DataAcquisitionColumns,
    [AssessmentPlanTypeEnum.DataProcessing]: DataProcessingColumns,
    [AssessmentPlanTypeEnum.DataUnderstanding]: DataUnderstandingColumns,
}

// 目标已结束的 planList 的表格特有列
export const PlanTableEndedColumnsMap = {
    [AssessmentPlanTypeEnum.DataAcquisition]: DataAcquisitionEndedColumns,
    [AssessmentPlanTypeEnum.DataProcessing]: DataProcessingEndedColumns,
    [AssessmentPlanTypeEnum.DataUnderstanding]: DataUnderstandingEndedColumns,
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
    [AssessmentPlanTypeEnum.DataProcessing]: [
        [
            {
                label: __('计划探查表总数量'),
                value: '100',
                key: 'data_process_explore_target',
            },
            {
                label: __('已探查'),
                value: '100',
                key: 'data_process_explore_actual',
            },
        ],
        [
            {
                label: __('计划融合表总数量'),
                value: '100',
                key: 'data_process_fusion_target',
            },
            {
                label: __('已融合'),
                value: '100',
                key: 'data_process_fusion_actual',
            },
        ],
    ],
    [AssessmentPlanTypeEnum.DataUnderstanding]: [
        [
            {
                label: __('计划理解数据资源目录总数量'),
                value: '100',
                key: 'data_understanding_target',
            },
            {
                label: __('已理解'),
                value: '100',
                key: 'data_understanding_actual',
            },
        ],
    ],
}
