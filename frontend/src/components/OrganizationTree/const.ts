import { IObject } from '@/core'
import __ from './locale'
/**
 * 组织部门树的类型
 */
export enum OriganizationType {
    // 组织
    Origanization = 'organization',
    // 部门
    Department = 'department',
}

const ALL = 'all'

export const allNodeInfo = {
    id: '',
    type: ALL,
    path: '',
    name: __('全部'),
}

export interface DataNode extends IObject {
    expand?: boolean
    path_id?: string
    children?: DataNode[]
    isExpand?: boolean
    level?: number
}
