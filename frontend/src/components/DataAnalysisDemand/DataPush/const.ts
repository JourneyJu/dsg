import __ from '../locale'

export enum ImplementGroupKeys {
    DATA_RESOURCE_INFO = 'data_resource_info',
    RESOURCE_USAGE_CONFIG = 'resource_usage_config',
    DATA_PUSH_CONFIG = 'data_push_config',
    PUSH_STRATEGY = 'push_strategy',
}
/**
 * 实施状态配置
 */
export const ImplementStatusConfig = [
    {
        label: __('数据资源信息'),
        key: ImplementGroupKeys.DATA_RESOURCE_INFO,
    },
    {
        label: __('资源使用配置'),
        key: ImplementGroupKeys.RESOURCE_USAGE_CONFIG,
    },
    {
        label: __('数据推送配置'),
        key: ImplementGroupKeys.DATA_PUSH_CONFIG,
    },
    {
        label: __('推送策略'),
        key: ImplementGroupKeys.PUSH_STRATEGY,
    },
]

export const ImplementGroupConfig = {
    [ImplementGroupKeys.DATA_RESOURCE_INFO]: [
        {
            label: __('数据资源名称：'),
            key: 'data_res_name',
            span: 12,
            value: '--',
        },
        {
            label: __('数据资源编码：'),
            key: 'data_res_code',
            span: 12,
            value: '--',
        },
        {
            label: __('所属目录：'),
            key: 'res_name',
            span: 12,
            value: '--',
        },
        {
            label: __('关联需求：'),
            key: 'name',
            span: 12,
            value: '--',
        },
    ],
    [ImplementGroupKeys.RESOURCE_USAGE_CONFIG]: [
        {
            label: __('资源提供方式：'),
            key: 'supply_type',
            span: 12,
            value: __('库表交换'),
        },
        {
            label: __('期望空间范围：'),
            key: 'area_range',
            span: 12,
            value: '--',
        },
        {
            label: __('期望时间范围：'),
            key: 'time_range',
            span: 12,
            value: '--',
        },
        {
            label: __('期望推送频率：'),
            key: 'push_frequency',
            span: 12,
            value: '--',
        },
        {
            label: __('资源使用期限：'),
            key: 'available_date_type',
            span: 12,
            value: '--',
        },
    ],
}

export const ImplementDataPushConfig = [
    {
        label: __('源端信息'),
        key: 'source_info',
        configs: [
            {
                label: __('源数据源：'),
                key: 'datasource_name',
                span: 12,
                value: '--',
            },
            {
                label: __('源数据表：'),
                key: 'name',
                span: 12,
                value: '--',
            },
            {
                label: __('数据库类型：'),
                key: 'datasource_type',
                span: 12,
                value: '--',
            },
        ],
    },
    {
        label: __('目标端信息'),
        key: 'target_info',
        configs: [
            {
                label: __('目标数据源：'),
                key: 'datasource_name',
                span: 12,
                value: '--',
            },
            {
                label: __('目标数据表：'),
                key: 'name',
                span: 12,
                value: '--',
            },
            {
                label: __('数据库类型：'),
                key: 'datasource_type',
                span: 12,
                value: '--',
            },
        ],
    },
    {
        label: __('推送字段'),
        key: 'push_field',
    },
    {
        label: __('过滤规则'),
        key: 'filter_rule',
    },
]

export const ImplementDataPushStrategy = [
    {
        label: __('推送机制'),
        key: 'push_strategy',
    },
    {
        label: __('推送频率'),
        key: 'push_frequency',
    },
]
