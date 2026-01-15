import { SortDirection } from '@/core'
import __ from './locale'
import { OptionMenuType } from '@/ui'

/**
 * 操作
 */
export enum OperateType {
    // 详情
    Detail = 'Detail',
}

// 操作
export const allOptionMenus = [
    {
        key: OperateType.Detail,
        label: __('详情'),
        menuType: OptionMenuType.Menu,
    },
]

// 初始化搜索条件
export const initSearch = {
    limit: 10,
    offset: 1,
    sort: 'register_at',
    direction: 'desc',
    registered: 2,
    department_id: '',
}

// 默认排序菜单
export const defaultMenu = {
    key: 'register_at',
    sort: SortDirection.DESC,
}

// 创建时的用户详情
export const userInfoDefault = [
    {
        key: 'name',
        label: __('用户名称'),
        span: 24,
        value: '',
    },
    {
        key: 'parent_deps',
        label: __('所属部门'),
        span: 24,
        value: '',
    },
    {
        key: 'login_name',
        label: __('登录账号'),
        span: 24,
        value: '',
    },
    {
        key: 'phone_number',
        label: __('手机号码'),
        span: 24,
        value: '',
    },
    {
        key: 'mail_address',
        label: __('邮箱地址'),
        span: 24,
        value: '',
    },
]

// 机构详情
export const detailsDefault = [
    ...userInfoDefault,
    {
        key: 'register_at',
        label: __('注册时间'),
        span: 24,
        value: '',
    },
]
