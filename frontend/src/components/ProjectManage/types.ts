import { OperateType } from '@/utils'
import { SortDirection } from '@/core'

export enum ProjectStatus {
    UNSTART = 'ready',
    PROGRESS = 'ongoing',
    COMPLETED = 'completed',
}

/**
 * urgency 非常紧急
 * emergency 紧急
 * common 普通
 */
export enum Priority {
    URGENCY = 'urgent',
    EMERGENCY = 'emergent',
    COMMON = 'common',
}

export interface ISearchCondition {
    offset?: number
    limit?: number
    direction?: SortDirection
    sort?: string
    name?: string
    status?: ProjectStatus | ''
    project_type?: string | ''
}

export interface ICreateProject {
    visible: boolean
    operateType?: OperateType
    onCancel: () => void
    projectId: string
    updateProjectsList: (condition?: ISearchCondition) => void
    isJump?: boolean
}
