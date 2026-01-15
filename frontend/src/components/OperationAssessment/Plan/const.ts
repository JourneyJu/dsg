import __ from '../locale'

export const PlanAnchorConfig = [
    {
        key: 'target-info',
        title: __('目标基本信息'),
    },
    {
        key: 'data_acquisition',
        title: __('数据获取'),
    },
    {
        key: 'data_processing',
        title: __('数据处理'),
    },
    {
        key: 'data_understanding',
        title: __('数据理解'),
    },
]

export const BusinessItemTypeMap = {
    0: 'data_process_explore_quantity',
    1: 'data_process_fusion_quantity',
}

export const MAX_QUANTITY = 9999999999
