import __ from './locale'
import { OptionMenuType } from '@/ui'
import { SortDirection } from '@/core'

/**
 * 操作
 */
export enum OperateType {
    // 详情
    Detail = 'Detail',
    // 编辑
    Edit = 'Edit',
}

// 操作
export const allOptionMenus = [
    {
        key: OperateType.Detail,
        label: __('详情'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: OperateType.Edit,
        label: __('编辑'),
        menuType: OptionMenuType.Menu,
    },
]

// 初始化搜索条件
export const initSearch = {
    limit: 10,
    offset: 1,
    sort: 'register_at',
    direction: 'desc', // 直接使用API格式
    is_all: true,
    registered: 2,
}

// 默认排序菜单
export const defaultMenu = {
    key: 'register_at',
    sort: SortDirection.DESC,
}

// 详情
export const detailsDefault = [
    {
        key: 'name',
        label: __('机构名称'),
        span: 24,
        value: '',
    },
    {
        key: 'dept_tag',
        label: __('机构标识'),
        span: 24,
        value: '',
    },
    {
        key: 'user_name',
        label: __('机构负责人'),
        span: 24,
        value: '',
    },
    {
        key: 'business_duty',
        label: __('机构业务责任'),
        span: 24,
        value: '',
    },
    {
        key: 'register_at',
        label: __('注册时间'),
        span: 24,
        value: '',
    },
]
