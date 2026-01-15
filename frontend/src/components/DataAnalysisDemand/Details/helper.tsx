import {
    FormatDataType,
    shareTypeList,
    typeOptoins,
} from '@/components/ResourcesDir/const'
import __ from '../locale'
import { applyResourceMap } from '@/components/CitySharing/const'
import { resourceUtilizationOptions } from '@/components/CitySharing/Apply/helper'

export enum ResourceDetailsFieldType {
    Link = 'link',
    TimeRange = 'time_range',
    Table = 'table',
    Other = 'other',
}

export const resourceDetailsFields = [
    {
        title: __('资源信息'),
        fields: [
            {
                key: ['view_busi_name'],
                label: __('数据资源名称'),
                span: 12,
                type: ResourceDetailsFieldType.Link,
            },
            {
                key: ['view_code'],
                label: __('编码'),
                span: 12,
            },
            {
                key: 'org_name',
                label: __('所属部门'),
                span: 12,
                titleKey: 'org_path',
            },
            {
                key: 'share_condition',
                label: __('共享条件'),
                span: 12,
            },
        ],
    },
    {
        title: __('资源使用配置'),
        fields: [
            {
                key: ['use_conf', 'supply_type'],
                label: __('资源提供方式'),
                span: 12,
                render: (value) =>
                    value ? applyResourceMap[value]?.text : '--',
            },

            {
                key: ['use_conf', 'area_range'],
                label: __('期望空间范围'),
                span: 12,
            },
            {
                key: ['use_conf', 'time_range'],
                label: __('期望时间范围'),
                span: 12,
                type: ResourceDetailsFieldType.TimeRange,
            },
            {
                key: ['use_conf', 'push_frequency'],
                label: __('期望推送频率'),
                span: 12,
            },
            {
                key: ['use_conf', 'available_date_type'],
                label: __('资源使用期限'),
                span: 12,
                render: (val: number) =>
                    val || val === 0
                        ? resourceUtilizationOptions.find(
                              (item) => item.value === val,
                          )?.label
                        : '--',
            },
        ],
    },
    {
        title: __('数据推送配置'),
        fields: [
            {
                key: ['use_conf', 'new_dst_data_source'],
                label: __('目标数据来源'),
                span: 24,
                render: (value: boolean) =>
                    value ? __('新增数据源') : __('已有数据源'),
            },
            {
                key: 'name',
                label: __('目标数据源'),
                span: 12,
                type: ResourceDetailsFieldType.Other,
            },
            {
                key: ['use_conf', 'dst_view_name'],
                label: __('目标数据表'),
                span: 12,
            },
            {
                key: ['use_conf', 'push_type'],
                label: __('推送机制'),
                span: 24,
                render: (val: string) =>
                    val === 'full' ? __('全量') : __('增量'),
            },
            {
                key: ['push_fields'],
                label: __('推送字段'),
                span: 24,
                type: ResourceDetailsFieldType.Table,
                columns: [
                    {
                        title: __('源表业务名称'),
                        dataIndex: 'business_name',
                    },
                    {
                        title: __('源表技术名称'),
                        dataIndex: 'technical_name',
                    },
                    {
                        title: __('源表数据类型'),
                        dataIndex: 'data_type',
                        key: 'data_type',
                        render: (text) => {
                            const val =
                                typeOptoins.find(
                                    (item) =>
                                        item.value === FormatDataType(text),
                                )?.label || ''
                            return <span title={val}>{val || '--'}</span>
                        },
                    },
                ],
            },
        ],
    },
]
