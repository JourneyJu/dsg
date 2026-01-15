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

export const detailsFields = [
    {
        label: __('应用名称'),
        key: 'name',
    },
    {
        label: __('应用标识（PASSID）'),
        key: 'pass_id',
    },
    {
        label: __('信息系统'),
        key: 'info_system_name',
    },
    {
        label: __('是否微应用'),
        key: 'app_type',
        render: (value: AppTypeEnum) => {
            return value === AppTypeEnum.MICRO_TYPE ? __('是') : __('否')
        },
    },
    {
        label: __('负责人'),
        key: 'responsiblers',
        render: (value: { id: string; name: string }[]) => {
            return value?.map((item) => item.name).join(',') || '--'
        },
    },
    {
        label: __('所属部门'),
        key: 'department_name',
        titleKey: 'department_path',
    },
    {
        label: __('IP及端口'),
        key: 'ip_addr',
    },
    {
        label: __('应用描述'),
        key: 'description',
    },
    {
        label: __('注册时间'),
        key: 'register_at',
        render: (value) => {
            return value ? formatTime(value) : '--'
        },
    },
]

export const getSearchFilters = (systemOptions: any[]) => [
    {
        label: '',
        key: 'keyword',
        type: SearchTypeLayout.Input,
        isAlone: true,
        itemProps: {
            placeholder: __('搜索应用名称'),
        },
    },
    {
        label: __('所属组织架构'),
        key: 'department_id',
        type: SearchTypeLayout.DepartmentAndOrgSelect,
        itemProps: {
            allowClear: true,
            // unCategorizedObj: {
            //     id: '00000000-0000-0000-0000-000000000000',
            //     name: __('未分类'),
            // },
        },
    },
    {
        label: __('所属系统'),
        key: 'info_system_id',
        type: SearchTypeLayout.Select,
        itemProps: {
            options: systemOptions,
            fieldNames: { label: 'name', value: 'id' },
            showSearch: true,
            filterOption: (input, option) =>
                (option?.name ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase()),
        },
    },
    {
        label: __('是否微应用'),
        key: 'app_type',
        type: SearchTypeLayout.Select,
        itemProps: {
            options: [
                { label: __('是'), value: AppTypeEnum.MICRO_TYPE },
                { label: __('否'), value: AppTypeEnum.NON_MICRO_TYPE },
            ],
            showSearch: false,
        },
    },
    {
        label: __('注册时间'),
        key: 'register_at',
        type: SearchTypeLayout.RangePicker,
        itemProps: {
            format: 'YYYY-MM-DD',
        },
        startTime: 'started_at',
        endTime: 'finished_at',
    },
]
