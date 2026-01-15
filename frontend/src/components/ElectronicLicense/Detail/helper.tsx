import { DivisionCodeList, typeOptoins } from '@/components/ResourcesDir/const'
import __ from './locale'
import { onlineStatusList } from '../helper'

/**
 * BASIC   基本信息
 * COLUMN  列属性
 */
export enum LicenseTabKey {
    BASIC = 'basic_info',
    COLUMN = 'column_info',
}

export const basicInfoDetailsList = [
    {
        label: __('基本属性'),
        key: 'basic',
        list: [
            {
                label: __('证件名称'),
                value: '',
                key: 'name',
                // options: openTypeList,
                span: 12,
            },
            {
                label: __('编码'),
                value: '',
                key: 'code',
                span: 12,
            },
            {
                label: __('证件类型'),
                value: '',
                key: 'type',
                span: 12,
            },

            {
                label: __('发证级别'),
                value: '',
                key: 'certification_level',
                span: 12,
            },
            {
                label: __('行业'),
                value: '',
                key: 'industry_department',
                span: 12,
            },
            {
                label: __('证照主体'),
                value: '',
                key: 'holder_type',
                span: 12,
            },
            {
                label: __('管理部门'),
                value: '',
                key: 'department',
                span: 12,
            },
            {
                label: __('有效期'),
                value: '',
                key: 'expire',
                span: 12,
            },

            {
                label: __('状态'),
                value: '',
                key: 'online_status',
                options: onlineStatusList,
            },
            {
                label: __('上线时间'),
                value: '',
                key: 'online_time',
            },
            {
                label: __('更新时间'),
                value: '',
                key: 'updated_at',
            },
        ],
    },
    // {
    //     label: __('信息项'),
    //     key: 'infoItems',
    //     list: [],
    // },
]

export interface IInfoItem {
    business_name: string
    data_length?: number
    data_type?: string
}
