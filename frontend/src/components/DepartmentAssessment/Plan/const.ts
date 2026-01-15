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
        key: 'data_quality_improvement',
        title: __('数据质量整改'),
    },
    {
        key: 'data_resource_cataloging',
        title: __('数据资源编目'),
    },
    {
        key: 'business_analysis',
        title: __('业务梳理'),
    },
]

export const BusinessItemTypeMap = {
    0: 'model',
    1: 'table',
    2: 'process',
}

export const MAX_QUANTITY = 9999999999
