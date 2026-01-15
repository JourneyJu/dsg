import { PermissionCategory, PermissionScope, RoleType } from '@/core'
import __ from './locale'

/** 角色类型文本 */
export const roleTypeText = {
    [RoleType.Internal]: __('内置角色'),
    [RoleType.Custom]: __('自定义角色'),
}

/** 角色类型选项 */
export const roleTypeOptions = Object.entries(roleTypeText).map(
    ([key, value]) => ({
        value: key,
        label: value,
    }),
)

/** 权限分类文本 */
export const permissionCategoryText = {
    [PermissionCategory.BasicPermission]: __('基础权限'),
    [PermissionCategory.Basic]: __('基础类'),
    [PermissionCategory.Operation]: __('运营类'),
    [PermissionCategory.Service]: __('服务类'),
    [PermissionCategory.Information]: __('信息类'),
    [PermissionCategory.SszdZone]: __('省直达专区'),
}

export const permissionScopeText = {
    [PermissionScope.All]: __('全部'),
    [PermissionScope.Organization]: __('仅本组织'),
}
