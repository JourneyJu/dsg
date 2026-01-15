import { SearchType } from '@/ui/LightweightSearch/const'
import __ from '../locale'

// 申请状态枚举
export enum ApplyStatus {
    All = '', // 不限
    Auditing = 'auditing', // 审核中
    Approved = 'pass', // 已通过
    Rejected = 'reject', // 已拒绝
    Undone = 'undone', // 已撤销
}

// 申请状态选项
export const applyStatusOptions = [
    {
        value: ApplyStatus.All,
        label: __('不限'),
    },
    {
        value: ApplyStatus.Auditing,
        label: __('审核中'),
    },
    {
        value: ApplyStatus.Approved,
        label: __('已通过'),
    },
    {
        value: ApplyStatus.Rejected,
        label: __('已拒绝'),
    },
    {
        value: ApplyStatus.Undone,
        label: __('已撤销'),
    },
]

// 状态配置
export const statusConfig = {
    [ApplyStatus.Auditing]: {
        label: __('审核中'),
        color: 'rgb(24 144 255)', // 蓝色
    },
    [ApplyStatus.Approved]: {
        label: __('已通过'),
        color: 'rgb(82 196 26)', // 绿色
    },
    [ApplyStatus.Rejected]: {
        label: __('已拒绝'),
        color: 'rgb(255 77 79)', // 红色
    },
    [ApplyStatus.Undone]: {
        label: __('已撤销'),
        color: 'rgb(0 0 0 / 25%)', // 灰色
    },
}

// 申请状态表单数据
export const formData = [
    {
        label: __('申请状态'),
        key: 'status',
        options: applyStatusOptions,
        type: SearchType.Radio,
    },
]
