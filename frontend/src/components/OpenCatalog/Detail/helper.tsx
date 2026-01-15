import { DivisionCodeList } from '@/components/ResourcesDir/const'
import { openLevelList, openTypeList } from '../helper'
import __ from './locale'

/**
 * BASIC   基本信息
 * COLUMN  列属性
 */
export enum TabKey {
    BASIC = 'basic_info',
    COLUMN = 'column_info',
}

export const basicInfoDetailsList = [
    {
        label: __('基本属性'),
        key: 'basic',
        list: [
            {
                label: __('开放方式'),
                value: '',
                key: 'open_type',
                options: openTypeList,
                span: 12,
            },
            {
                label: __('开放级别'),
                value: '',
                key: 'open_level',
                options: openLevelList,
                span: 12,
            },
            {
                label: __('所属行政区划'),
                value: '',
                key: 'administrative_code',
                options: DivisionCodeList,
            },
            {
                label: __('数据提供方'),
                value: '',
                key: 'source_department',
            },
            {
                label: __('数据提供方代码'),
                value: '',
                key: 'source_department_code',
            },
            {
                label: __('更新日期'),
                value: '',
                key: 'updated_at',
            },
            {
                label: __('发布日期'),
                value: '',
                key: 'publish_at',
            },
        ],
    },
]
