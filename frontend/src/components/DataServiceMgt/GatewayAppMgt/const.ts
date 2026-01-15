import { pinyin } from 'pinyin-pro'
import { AppTypeEnum, SortDirection } from '@/core'
import { SearchType as SearchTypeLayout } from '@/components/SearchLayout/const'

import __ from '../locale'
import { formatTime } from '@/utils'

export const defaultMenus = [
    { key: 'register_at', label: __('按注册时间排序') },
]
export const defaultMenu = {
    key: 'register_at',
    sort: SortDirection.DESC,
}

export const getFirstLetters = (str: string) => {
    const reg = /[\u4e00-\u9fa5]/g
    const result = str?.replace(reg, (match) => {
        return pinyin(match, {
            pattern: 'first',
            nonZh: 'consecutive',
            toneType: 'none',
        })
    })

    return result
}

export const detailsFields = [
    {
        title: __('基本信息'),
        key: 'basic_info',
        fields: [
            {
                label: __('应用名称'),
                key: 'name',
            },
            {
                label: __('应用描述'),
                key: 'description',
            },
            {
                label: __('信息系统'),
                key: 'info_system_name',
            },
            {
                label: __('应用类型'),
                key: 'app_type',
                render: (value: AppTypeEnum) => {
                    return value === AppTypeEnum.MICRO_TYPE
                        ? __('微应用')
                        : __('非微应用')
                },
            },
            {
                label: __('IP及端口'),
                key: 'ip_addr',
            },
            {
                label: 'PassID',
                key: 'pass_id',
            },
            {
                label: 'Token',
                key: 'token',
            },
        ],
    },
    {
        title: __('上报信息'),
        key: 'report_info',
        fields: [
            {
                label: __('应用ID'),
                key: 'app_id',
            },
            {
                label: 'Key',
                key: 'access_key',
            },
            {
                label: 'Secret',
                key: 'access_secret',
            },
            {
                label: 'URL',
                key: 'province_url',
            },
            {
                label: 'IP',
                key: 'province_ip',
            },
            {
                label: __('联系人姓名'),
                key: 'contact_name',
            },
            {
                label: __('联系方式'),
                key: 'contact_phone',
            },
            {
                label: __('应用领域'),
                key: 'area_name',
            },
            {
                label: __('应用范围'),
                key: 'range',
            },
            {
                label: __('部署地点'),
                key: 'deploy_place',
            },
            {
                label: __('所属部门'),
                key: 'department_name',
                titleKey: 'department_path',
            },
            {
                label: __('所属部门编码'),
                key: 'org_code',
            },
        ],
    },
    {
        title: __('更多信息'),
        key: 'more_info',
        fields: [
            {
                label: __('最新更新人'),
                key: 'updater_name',
            },
            {
                label: __('更新时间'),
                key: 'updated_at',
                render: (value) => {
                    return value
                        ? formatTime(value, 'YYYY-MM-DD HH:mm:ss')
                        : '--'
                },
            },
            {
                label: __('创建人'),
                key: 'creator_name',
            },
            {
                label: __('创建时间'),
                key: 'created_at',
                render: (value) => {
                    return value
                        ? formatTime(value, 'YYYY-MM-DD HH:mm:ss')
                        : '--'
                },
            },
        ],
    },
]
