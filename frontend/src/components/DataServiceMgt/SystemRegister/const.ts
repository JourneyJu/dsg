import { pinyin } from 'pinyin-pro'
import { ISystemItem, SortDirection } from '@/core'
import __ from '../locale'
import { formatTime } from '@/utils'

export const defaultMenus = [
    { key: 'register_at', label: __('按注册时间排序') },
    { key: 'created_at', label: __('按系统创建时间排序') },
    { key: 'updated_at', label: __('按系统更新时间排序') },
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

    // 只保留数字和英文字母，并限制为20位
    const filteredResult = result?.replace(/[^a-zA-Z0-9]/g, '') || ''
    return filteredResult.substring(0, 20).toLocaleLowerCase()
}

export const detailsFields = [
    {
        label: __('所属部门'),
        key: 'department_name',
    },
    {
        label: __('描述'),
        key: 'description',
    },
    {
        label: __('修改人/修改时间'),
        key: 'update_info',
        render: (record: ISystemItem) => {
            return record.updated_user && record.updated_at
                ? `${record.updated_user} ${__('修改于')} ${formatTime(
                      record.updated_at,
                  )}`
                : '--'
        },
    },
    {
        label: __('验收时间'),
        key: 'acceptance_at',
        render: (record: ISystemItem) => {
            return record.acceptance_at
                ? formatTime(record.acceptance_at, 'YYYY-MM-DD')
                : '--'
        },
    },
]

export const registerDetailsFields = [
    {
        label: __('信息系统名称'),
        key: 'name',
    },
    {
        label: __('所属部门'),
        key: 'department_name',
    },
    {
        label: __('负责人'),
        key: 'responsiblers',
        render: (record: ISystemItem) => {
            return record.responsiblers?.map((item) => item.name).join(',')
        },
    },
    {
        label: __('信息系统描述'),
        key: 'description',
    },
    {
        label: __('注册时间'),
        key: 'register_at',
        render: (record: ISystemItem) => {
            return record.register_at
                ? formatTime(record.register_at, 'YYYY-MM-DD')
                : '--'
        },
    },
    {
        label: __('创建时间'),
        key: 'created_at',
        render: (record: ISystemItem) => {
            return record.created_at
                ? formatTime(record.created_at, 'YYYY-MM-DD')
                : '--'
        },
    },
    {
        label: __('更新时间'),
        key: 'updated_at',
        render: (record: ISystemItem) => {
            return record.updated_at
                ? formatTime(record.updated_at, 'YYYY-MM-DD')
                : '--'
        },
    },
]
