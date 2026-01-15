import { SandboxCreateTypeEnum, SandboxStatus, SortDirection } from '@/core'
import { OptionMenuType } from '@/ui'
import { SearchType as SearchTypeLayout } from '@/components/SearchLayout/const'
import __ from './locale'
import { SearchType } from '@/ui/LightweightSearch/const'

export const menus = [
    { key: 'project_name', label: __('按项目名称排序') },
    { key: 'apply_time', label: __('按申请时间排序') },
    { key: 'updated_at', label: __('按更新时间排序') },
]

export const defaultMenu = {
    key: 'project_name',
    sort: SortDirection.DESC,
}

/**
 * 沙箱tab
 */
export enum SandboxTab {
    // 申请清单
    Apply = 'apply',
    // 审核
    Audit = 'audit',
    // 实施
    Implement = 'implementData',
    // 空间
    Space = 'space',
    // 日志
    Log = 'log',
}

/**
 * @enum {SandboxImpTypeEnum}
 * Apply 沙箱申请
 * Expand 增加容量
 */
export enum SandboxImpTypeEnum {
    All = 'all',
    Apply = 'apply',
    Expand = 'extend',
}

export const SandboxImpTypeOptions = [
    {
        label: __('沙箱申请'),
        value: SandboxImpTypeEnum.Apply,
    },
    {
        label: __('增加容量'),
        value: SandboxImpTypeEnum.Expand,
    },
]

export const SandboxImpTypeOptions1 = [
    {
        label: __('沙箱申请'),
        value: SandboxImpTypeEnum.Apply,
    },
    {
        label: __('扩容申请'),
        value: SandboxImpTypeEnum.Expand,
    },
]

export enum ShowModeEnum {
    Card = 'card',
    Table = 'table',
}

/**
 * 菜单
 */
export const leftMenuItems: any[] = [
    {
        title: __('数据沙箱清单'),
        key: SandboxTab.Apply,
        path: '/list',
        children: '',
    },
    {
        title: __('数据沙箱审核'),
        key: SandboxTab.Audit,
        path: '/audit-list',
        children: '',
    },
    {
        title: __('数据沙箱实施'),
        key: SandboxTab.Implement,
        path: '/implement-list',
        children: '',
    },
    {
        title: __('数据沙箱空间'),
        key: SandboxTab.Space,
        path: '/space-list',
        children: '',
    },
    {
        title: __('数据沙箱日志'),
        key: SandboxTab.Log,
        path: '/log-list',
        children: '',
    },
]

/**
 * 数据分析操作
 */
export enum TabOperate {
    // 详情
    Detail = 'Detail',
    // 沙箱申请
    Apply = 'apply',
    // 重新申请
    ReApply = 'reapply',
    // 扩容申请
    ExpandApply = 'expandApply',
    // 撤回
    Cancel = 'cancel',

    //  申报审核
    ApplyAudit = 'applyAudit',
    // 实施
    Implement = 'implement',
    // 完成
    Finish = 'finish',
}

// 操作
export const allOptionMenus = [
    {
        key: TabOperate.Detail,
        label: __('详情'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.ReApply,
        label: __('重新申请'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.ExpandApply,
        label: __('扩容申请'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.Cancel,
        label: __('撤回'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.Implement,
        label: __('实施'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.ApplyAudit,
        label: __('审核'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.Finish,
        label: __('完成'),
        menuType: OptionMenuType.Menu,
    },
]

// 状态映射
export const applyProcessMap = {
    [SandboxStatus.Applying]: (opration?: SandboxCreateTypeEnum) => ({
        text:
            opration === SandboxCreateTypeEnum.Apply
                ? __('沙箱申请中')
                : opration === SandboxCreateTypeEnum.Extend
                ? __('扩容申请中')
                : __('申请中'),
        color: 'rgba(0, 0, 0, 0.35)',
    }),
    [SandboxStatus.ImplementPending]: () => ({
        text: __('待实施'),
        color: 'rgba(250, 172, 20, 1)',
    }),
    [SandboxStatus.Implementing]: () => ({
        text: __('实施中'),
        color: 'rgba(58, 143, 240, 1)',
    }),
    [SandboxStatus.Implemented]: (
        opration?: SandboxCreateTypeEnum,
        tab?: SandboxTab,
    ) => ({
        text: tab === SandboxTab.Implement ? __('已实施') : __('已完成'),
        color: 'rgba(82, 196, 27, 1)',
    }),
}

export enum SandboxAuditTypeEnum {
    All = 'tasks,historys',
    Task = 'tasks',
    Historys = 'historys',
}

export const SandboxAuditOptions = [
    {
        value: SandboxAuditTypeEnum.Task,
        label: __('待审核'),
    },
    {
        value: SandboxAuditTypeEnum.Historys,
        label: __('已审核'),
    },
]

// 状态筛选项
export const applyProcessOptions = [
    {
        value: SandboxStatus.Applying,
        label: applyProcessMap[SandboxStatus.Applying]().text,
    },
    {
        value: SandboxStatus.ImplementPending,
        label: applyProcessMap[SandboxStatus.ImplementPending]().text,
    },
    {
        value: SandboxStatus.Implementing,
        label: applyProcessMap[SandboxStatus.Implementing]().text,
    },
    {
        value: SandboxStatus.Implemented,
        label: applyProcessMap[SandboxStatus.Implemented]().text,
    },
]

export enum SandboxAuditStatus {
    // 未审核
    Unaudited = 'unaudited',
    // 审核中
    Auditing = 'auditing',
    // 审核通过
    Approve = 'approve',
    // 未通过
    Reject = 'reject',
    // 审核撤回
    Undone = 'undone',
}

// 申请记录中的申请结果
export const SandboxAuditStatusMap = {
    [SandboxAuditStatus.Unaudited]: {
        text: __('未审核'),
    },
    [SandboxAuditStatus.Auditing]: {
        text: __('审核中'),
    },
    [SandboxAuditStatus.Approve]: {
        text: __('通过'),
    },
    [SandboxAuditStatus.Reject]: {
        text: __('未通过'),
    },
    [SandboxAuditStatus.Undone]: {
        text: __('审核撤回'),
    },
}

// 审核状态
export const auditStatusListMap = {
    [SandboxAuditStatus.Auditing]: (opration: SandboxCreateTypeEnum) => ({
        text:
            opration === SandboxCreateTypeEnum.Apply
                ? __('申请审核中')
                : __('增量审核中'),
        backgroundColor: 'rgba(24, 144, 255, 0.07)',
        color: 'rgba(24, 144, 255, 1)',
    }),
    [SandboxAuditStatus.Reject]: (opration: SandboxCreateTypeEnum) => ({
        text:
            opration === SandboxCreateTypeEnum.Apply
                ? __('申请未通过')
                : __('增量审核未通过'),
        backgroundColor: 'rgba(255, 77, 79, 0.07)',
        color: 'rgba(255, 77, 79, 1)',
    }),
}

export const implementStatusOptions = [
    {
        value: SandboxStatus.ImplementPending,
        label: __('待实施'),
    },
    {
        value: SandboxStatus.Implementing,
        label: __('实施中'),
    },
    {
        value: SandboxStatus.Implemented,
        label: __('已实施'),
    },
]

// 数据分析tab
export const tabMap = {
    // 申请清单
    [SandboxTab.Apply]: {
        // 表格列名
        columnKeys: [
            'project_name',
            'used_space',
            'total_space',
            'in_apply_space',
            'sandbox_status',
            'department_name',
            'applicant_name',
            'project_member_name',
            'apply_time',
            // 操作
            'action',
        ],
        // 操作栏宽度
        actionWidth: 160,
        // 搜索筛选项
        filterKeys: ['keyword', 'department_id', 'status', 'apply_time'],
        // 筛选项props
        customProps: {
            status: {
                itemProps: {
                    options: applyProcessOptions,
                },
            },
        },
        // 默认搜索条件
        initSearch: {
            limit: 10,
            offset: 1,
            sort: 'apply_time',
            direction: 'desc',
        },
        // 默认表头排序 - 如果不传，则不支持表示不支持表头排序
        defaultTableSort: {
            apply_time: 'descend',
            project_name: null,
        },
        defaultMenus: [
            { key: 'project_name', label: __('按项目名称排序') },
            { key: 'apply_time', label: __('按申请时间排序') },
        ],
        defaultMenu: {
            key: 'apply_time',
            sort: SortDirection.DESC,
        },
        // 表格默认滚动高度
        defaultScrollY: `calc(100vh - 291px)`,
    },
    // 审核
    [SandboxTab.Audit]: {
        // 表格列名
        columnKeys: [
            'project_name',
            'audit_type',
            'department_name',
            'applicant_name',
            'apply_time',
            'action',
        ],
        // 操作栏宽度
        actionWidth: 80,
        initSearch: {
            limit: 10,
            offset: 1,
            // 待审核状态
            target: 'tasks',
        },
        refresh: true,
        defaultScrollY: `calc(100vh - 227px)`,
    },
    // 实施列表
    [SandboxTab.Implement]: {
        // 表格列名
        columnKeys: [
            'project_name',
            'applicant_name',
            'operation',
            'execute_type',
            'executor_name',
            'execute_status',
            'executed_time',
            'action',
        ],
        // 左侧状态筛选
        statusOption: [
            { status: SandboxStatus.All, label: __('全部') },
            {
                status: SandboxStatus.ImplementPending,
                label: __('待实施'),
            },
            { status: SandboxStatus.Implementing, label: __('实施中') },
            {
                status: SandboxStatus.Implemented,
                label: __('已实施'),
            },
        ],
        searchFormData: [
            {
                label: __('实施类型'),
                key: 'execute_type',
                options: SandboxImpTypeOptions1,
                type: SearchType.Radio,
            },
            {
                label: __('状态'),
                key: 'execute_status',
                options: implementStatusOptions,
                type: SearchType.MultipleSelect,
            },
        ],
        searchFormData1: [
            {
                label: __('实施类型'),
                key: 'execute_type',
                options: [
                    {
                        label: __('全部'),
                        value: SandboxImpTypeEnum.All,
                    },
                    {
                        label: __('沙箱申请'),
                        value: SandboxImpTypeEnum.Apply,
                    },
                    {
                        label: __('扩容申请'),
                        value: SandboxImpTypeEnum.Expand,
                    },
                ],
                type: SearchType.Radio,
            },
        ],
        // 默认搜索条件
        initSearch: {
            limit: 10,
            offset: 1,
            sort: 'executed_time',
            direction: 'desc',
        },
        defaultSearch: {
            execute_status: undefined,
            execute_type: SandboxImpTypeEnum.All,
        },
        // 操作栏宽度
        actionWidth: 180,
        // 默认表头排序
        defaultTableSort: { project_name: null, executed_time: 'descend' },
        defaultMenus: [
            { key: 'project_name', label: __('按项目名称排序') },
            { key: 'executed_time', label: __('按完成时间排序') },
        ],
        defaultMenu: {
            key: 'executed_time',
            sort: SortDirection.DESC,
        },
        defaultScrollY: `calc(100vh - 291px)`,
    },
    // 沙箱空间
    [SandboxTab.Space]: {
        // 表格列名
        columnKeys: [
            'project_name',
            'used_space',
            'free_space',
            'total_space',
            'data_set_number',
            'updated_at',
            'action',
        ],
        // 筛选项
        filterKeys: [
            'keyword',
            'department_id',
            'create_time',
            'finish_time',
            'impl_time',
            'close_time',
        ],
        // 操作栏宽度
        actionWidth: 120,
        initSearch: {
            limit: 10,
            offset: 1,
            sort: 'updated_at',
            direction: 'desc',
        },
        // 默认表头排序
        defaultTableSort: { project_name: null, updated_at: 'descend' },
        defaultMenus: [
            { key: 'project_name', label: __('按项目名称排序') },
            { key: 'updated_at', label: __('按更新时间排序') },
        ],
        defaultMenu: {
            key: 'updated_at',
            sort: SortDirection.DESC,
        },
        // 筛选菜单
        searchFormData: [
            {
                label: __('更新时间'),
                key: 'updated_at',
                type: SearchType.RangePicker,
                options: [],
            },
        ],
        defaultSearch: { updated_at: null },
        defaultScrollY: `calc(100vh - 291px)`,
    },
    // 日志
    [SandboxTab.Log]: {
        // 表格列名
        columnKeys: [
            'target_table_name',
            'sandbox_project_name',
            'operator_name',
            'task_log_status',
            'sync_method',
            'sync_count',
            'sync_success_count',
            'sync_time',
            'start_time',
            'end_time',
            'action',
        ],
        // 操作栏宽度
        actionWidth: 80,
        initSearch: {
            limit: 10,
            offset: 1,
        },
        // 刷新
        refresh: true,
        defaultScrollY: `calc(100vh - 227px)`,
        // 筛选菜单
        searchFormData: [
            {
                label: __('请求时间'),
                key: 'start_time',
                type: SearchType.RangePicker,
                options: [],
            },
        ],
        // 默认表头排序
        // defaultTableSort: {
        //     // created_at: 'desc',
        //     // data_set_name: null,
        //     // end_time: null,
        // },
        // defaultMenus: [
        //     // { key: 'data_set_name', label: __('按数据集名称排序') },
        //     { key: 'created_at', label: __('按请求时间排序') },
        //     // { key: 'end_time', label: __('按完成时间排序') },
        // ],
        // defaultMenu: {
        //     key: 'created_at',
        //     sort: SortDirection.DESC,
        // },
        searchPlaceholder: __('搜索数据集名称、项目名称'),
    },
}

// 筛选项参数
export interface SearchFilterConfig {
    placeholder?: string
    // 要显示的筛选项
    filterKeys?: string[]
    customProps?: {
        // 自定义筛选项的属性
        [key: string]: any
    }
}

// 筛选项
export const recordSearchFilter = ({
    placeholder,
    filterKeys = ['keyword', 'department_id', 'status', 'create_time'],
    customProps = {},
}: SearchFilterConfig) => {
    // 定义所有可用的筛选项配置
    const allFilters = {
        keyword: {
            label: __('项目名称'),
            key: 'keyword',
            type: SearchTypeLayout.Input,
            isAlone: true,
            itemProps: {
                placeholder: placeholder || __('搜索项目名称'),
            },
        },
        target: {
            label: __('审核类型'),
            key: 'target',
            type: SearchTypeLayout.Select,
            itemProps: {
                options: SandboxAuditOptions,
                fieldNames: { label: 'label', value: 'value' },
                showSearch: false,
            },
        },
        department_id: {
            label: __('所属组织架构'),
            key: 'department_id',
            type: SearchTypeLayout.DepartmentAndOrgSelect,
            itemProps: {
                allowClear: true,
                unCategorizedObj: {
                    id: '00000000-0000-0000-0000-000000000000',
                    name: __('未分类'),
                },
            },
        },
        status: {
            label: __('状态'),
            key: 'status',
            type: SearchTypeLayout.MultipleSelect,
            itemProps: {
                options: applyProcessOptions,
                fieldNames: { label: 'label', value: 'value' },
                showSearch: false,
            },
        },
        apply_time: {
            label: __('申请时间'),
            key: 'apply_time',
            type: SearchTypeLayout.RangePicker,
            itemProps: {
                format: 'YYYY-MM-DD',
            },
            startTime: 'apply_time_start',
            endTime: 'apply_time_end',
        },
    }

    // 根据传入的 filterKeys 筛选并合并自定义属性
    return filterKeys
        .map((key) => {
            const baseFilter = allFilters[key]
            if (!baseFilter) return null

            // 合并自定义属性
            if (customProps[key]) {
                return {
                    ...baseFilter,
                    itemProps: {
                        ...baseFilter.itemProps,
                        ...customProps[key],
                    },
                }
            }

            return baseFilter
        })
        .filter(Boolean)
}
