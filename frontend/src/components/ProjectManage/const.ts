import { IMember, SortDirection } from '@/core'
import { ProjectStatus, Priority } from './types'
import __ from './locale'
import { IformItem, SearchType } from '@/ui/LightweightSearch/const'

export const menus = [
    { key: 'created_at', label: __('按创建时间排序') },
    { key: 'updated_at', label: __('按更新时间排序') },
]

export const defaultMenu = {
    key: 'created_at',
    sort: SortDirection.DESC,
}
export const statusInfo = {
    ready: {
        text: __('未开始'),
        class: 'unstart',
    },
    ongoing: {
        text: __('进行中'),
        class: 'progress',
    },
    completed: {
        text: __('已完成'),
        class: 'completed',
    },
}

export const statusNextInfo = {
    ready: {
        text: __('开始'),
        class: 'unstart_next',
        value: ProjectStatus.PROGRESS,
    },
    ongoing: {
        text: __('完成'),
        class: 'progress_next',
        value: ProjectStatus.COMPLETED,
    },
}

export const projectStatus = [
    {
        key: ProjectStatus.UNSTART,
        value: __('未开始'),
    },
    {
        key: ProjectStatus.PROGRESS,
        value: __('进行中'),
    },
    {
        key: ProjectStatus.COMPLETED,
        value: __('已完成'),
    },
]

export const priorityList = [
    {
        key: Priority.URGENCY,
        value: __('非常紧急'),
    },
    {
        key: Priority.EMERGENCY,
        value: __('紧急'),
    },
    {
        key: Priority.COMMON,
        value: __('普通'),
    },
]

export const priorityInfo = {
    urgent: {
        text: __('非常紧急'),
        class: 'urgency',
    },
    emergent: {
        text: __('紧急'),
        class: 'emergency',
    },
    common: {
        text: __('普通'),
        class: 'common',
    },
}

export const getUserName = (user: IMember) => {
    return user.name
}
export const searchData: IformItem[] = [
    {
        label: '状态',
        key: 'status',
        options: [
            { value: '', label: '不限' },
            ...projectStatus.map((item) => {
                return {
                    value: item.key,
                    label: item.value,
                }
            }),
        ],
        type: SearchType.Radio,
    },
    {
        label: '来源',
        key: 'project_type',
        options: [
            { value: '', label: '不限' },
            { value: 'thirdParty', label: '第三方' },
            { value: 'local', label: '自建' },
        ],
        type: SearchType.Radio,
    },
]
