import { SortDirection, TaskType } from '@/core'
import { ProjectStatus, Priority } from '../ProjectManage/types'

export interface IFilter {
    status?: ProjectStatus | ''
    priority?: Priority | ''
    executor_id?: string
    task_type?: TaskType | ''
    views?: any[]
    workitem_type?: string
}

export interface ISearchCondition extends IFilter {
    limit?: number
    keyword?: string
    sort?: string
    direction?: SortDirection
}
