import { OperateType } from '@/utils'
import __ from './locale'
import { IformItem, SearchType } from '@/ui/LightweightSearch/const'

/**
 * 工作流程状态
 * @param CREATING 'creating' 未发布的状态
 * @param RELEASED 'released' 已发布状态不存在变更
 * @param EDITING 'editing' 已发布存在变更
 */
export enum AssemblyLineStatus {
    CREATING = 'creating',
    RELEASED = 'released',
    EDITING = 'editing',
}

/**
 * 工作流程配置状态
 * @param CREATING 'NORMAL' 正常
 * @param RELEASED 'MISSINGROLE' 存在没有角色的工作流程
 */
export enum AssemblyLineConfigStatus {
    NORMAL = 'normal',
    MISSINGROLE = 'missingRole',
}

/**
 * 发布状态
 * @param UNRELEASED 'unreleased' 未发布
 * @param RELEASED 'released' 已发布
 */
export enum AssemblyLineReleaseState {
    UNRELEASED = 'unreleased',
    RELEASED = 'released',
}

/**
 * 变更状态
 * @param ALL '' 全部（自定义）
 * @param UNCHANGED 'unchanged' 已发布未变更
 * @param CHANGED 'changed' 已发布有变更
 */
export enum AssemblyLineChangeState {
    ALL = '',
    UNCHANGED = 'unchanged',
    CHANGED = 'changed',
}

/**
 * 排序方式
 * @param CREATED 'created_at' 按创建时间排序
 * @param UPDATED 'updated_at' 按更新时间排序
 */
export enum SortType {
    NAME = 'name',
    CREATED = 'created_at',
    UPDATED = 'updated_at',
}

/**
 * 排序菜单
 */
export const menus = [
    { key: SortType.NAME, label: __('按名称排序') },
    { key: SortType.CREATED, label: __('按创建时间排序') },
    { key: SortType.UPDATED, label: __('按更新时间排序') },
]

/**
 * 选择项
 */
export const options = [
    { value: AssemblyLineChangeState.ALL, label: __('不限') },
    {
        value: AssemblyLineChangeState.CHANGED,
        label: __('存在未发布的变更'),
    },
    { value: AssemblyLineChangeState.UNCHANGED, label: __('未存在变更') },
]

/**
 * 工作流程卡片操作菜单项
 */
export const cardOperateMenu = [
    {
        key: OperateType.EDIT,
        label: __('详细信息'),
    },
    {
        key: OperateType.PREVIEW,
        label: __('查看工作流程'),
    },
    {
        key: OperateType.DELETE,
        label: __('删除'),
    },
]

export const searchData: IformItem[] = [
    {
        label: '状态',
        key: 'state',
        options,
        type: SearchType.Radio,
    },
]
