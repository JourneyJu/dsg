import { SystemAccessStatus, SortDirection } from '@/core'
import { OptionMenuType } from '@/ui'
import { SearchType as SearchTypeLayout } from '@/components/SearchLayout/const'

import __ from './locale'

// 初始化搜索条件
export const initSearch = {
    limit: 10,
    offset: 1,
    sort: 'created_at',
    direction: 'desc',
}

// 默认排序菜单
export const defaultMenu = {
    key: 'created_at',
    sort: SortDirection.DESC,
}

// 排序菜单
export const sortMenus = [
    {
        key: 'created_at',
        label: __('按接入时间排序'),
    },
    {
        key: 'enable_disable_at',
        label: __('按最新启用/停用时间排序'),
    },
]

/**
 * 操作
 */
export enum TabOperate {
    // 详情
    Detail = 'Detail',
    // 编辑
    Edit = 'Edit',
    // 停用
    Disable = 'Disable',
    // 启用
    Enable = 'Enable',
}

// 操作
export const allOptionMenus = [
    {
        key: TabOperate.Detail,
        label: __('详情'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.Edit,
        label: __('编辑'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.Disable,
        label: __('停用'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.Enable,
        label: __('启用'),
        menuType: OptionMenuType.Menu,
    },
]

// 状态映射
export const statusMap = {
    [SystemAccessStatus.Enabled]: {
        text: __('已启用'),
        color: 'rgba(82, 196, 27, 1)',
    },
    [SystemAccessStatus.Disabled]: {
        text: __('已停用'),
        color: 'rgba(255, 77, 79, 1)',
    },
}

// 状态筛选项
export const statusOptions = [
    {
        value: SystemAccessStatus.Enabled,
        label: statusMap[SystemAccessStatus.Enabled].text,
    },
    {
        value: SystemAccessStatus.Disabled,
        label: statusMap[SystemAccessStatus.Disabled].text,
    },
]

// 生成方式 映射
export const serviceTypeMap = {
    service_generate: {
        text: __('接口生成'),
    },
    service_register: {
        text: __('接口注册'),
    },
}

// 筛选项
export const searchFormInitData = [
    {
        label: __('服务名称'),
        key: 'keyword',
        type: SearchTypeLayout.Input,
        isAlone: true,
        itemProps: {
            placeholder: __('搜索服务名称'),
        },
    },
    {
        label: __('服务所属部门'),
        key: 'org_code',
        type: SearchTypeLayout.DepartmentAndOrgSelect,
        itemProps: {
            allowClear: true,
            unCategorizedObj: {
                id: '00000000-0000-0000-0000-000000000000',
                name: __('未分类'),
            },
        },
    },
    {
        label: __('状态'),
        key: 'status',
        type: SearchTypeLayout.Select,
        itemProps: {
            options: statusOptions,
            fieldNames: { label: 'label', value: 'value' },
            showSearch: false,
        },
    },
    {
        label: __('接入时间'),
        key: 'create_time',
        type: SearchTypeLayout.RangePicker,
        itemProps: {
            format: 'YYYY-MM-DD',
        },
        startTime: 'create_begin_time',
        endTime: 'create_end_time',
    },
    {
        label: __('接入部门'),
        key: 'apply_org_code',
        type: SearchTypeLayout.DepartmentAndOrgSelect,
        itemProps: {
            allowClear: true,
            unCategorizedObj: {
                id: '00000000-0000-0000-0000-000000000000',
                name: __('未分类'),
            },
        },
    },
    {
        label: __('接入系统'),
        key: 'system_id',
        type: SearchTypeLayout.Select,
        itemProps: {
            options: [],
            fieldNames: { label: 'name', value: 'id' },
            showSearch: false,
        },
    },
    {
        label: __('接入应用'),
        key: 'app_id',
        type: SearchTypeLayout.Select,
        itemProps: {
            options: [],
            fieldNames: { label: 'name', value: 'id' },
            showSearch: false,
        },
    },
]

// 基本信息
export const baseDefault = [
    {
        key: 'service_name',
        label: __('服务名称'),
        span: 24,
        value: '',
    },
    {
        key: 'service_code',
        label: __('服务编码'),
        span: 24,
        value: '',
    },
    {
        key: 'service_path',
        label: __('服务地址'),
        span: 24,
        value: '',
    },
    {
        key: 'service_type',
        label: __('服务类型'),
        span: 24,
        value: '',
    },
    {
        key: 'info_system_name',
        label: __('所属系统'),
        span: 24,
        value: '',
    },
    {
        key: 'apps_name',
        label: __('所属应用'),
        span: 24,
        value: '',
    },
    {
        key: 'description',
        label: __('服务描述'),
        span: 24,
        value: '',
    },
]

// 接入信息
export const accessDefault = [
    {
        key: 'apply_org_name',
        label: __('接入部门'),
        span: 24,
        value: '',
    },
    {
        key: 'system_name',
        label: __('接入系统'),
        span: 24,
        value: '',
    },
    {
        key: 'app_name',
        label: __('接入应用'),
        span: 24,
        value: '',
    },
    {
        key: 'ip_addr',
        label: __('接入IP及端口'),
        span: 24,
        value: '',
    },
    {
        key: 'status',
        label: __('状态'),
        span: 24,
        value: '',
    },
    {
        key: 'created_at',
        label: __('接入时间'),
        span: 24,
        value: '',
    },
    {
        key: 'enable_disable_at',
        label: __('最新启用/停用时间'),
        span: 24,
        value: '',
    },
    {
        key: 'start_at',
        label: __('使用期限'),
        span: 24,
        value: '',
    },
]
