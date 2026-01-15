import { ProjectStatus, Priority } from '../ProjectManage/types'
import { SortDirection } from '@/core'

export const menus = [
    { key: 'created_at', label: '按创建时间排序' },
    { key: 'updated_at', label: '按更新时间排序' },
    { key: 'deadline', label: '按截止时间排序' },
]

export const defaultMenu = {
    key: 'created_at',
    sort: SortDirection.DESC,
}

// 维度 STAGE：阶段  STATUS：状态
export const enum Dimension {
    STAGE = 'stage',
    STATUS = 'status',
}

export const enum WorkItemType {
    TASK = 'task',
    WORK_ORDER = 'work_order',
}

export const statusList = [
    {
        title: '未开始/未派发',
        id: ProjectStatus.UNSTART,
        stage_id: ProjectStatus.UNSTART,
    },
    {
        title: '进行中',
        id: ProjectStatus.PROGRESS,
        stage_id: ProjectStatus.PROGRESS,
    },
    {
        title: '已完成',
        id: ProjectStatus.COMPLETED,
        stage_id: ProjectStatus.COMPLETED,
    },
]

export const enum EditItemType {
    STATUS = 'status',
    DEADLINE = 'deadline',
    EXECUTOR = 'executor',
}
