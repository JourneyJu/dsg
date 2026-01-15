import {
    DataAnalRequireStatus,
    DataAnalAuditStatus,
    DataAnalCommissionType,
    DataAnalAuditType,
    FeedbackTargetEnum,
    DataAnalResultOutboundApplyStatusEnum,
    DataAnalCatalogPublishStatusEnum,
} from '@/core'
import { OptionMenuType } from '@/ui'
import { SearchType as SearchTypeLayout } from '@/components/SearchLayout/const'
import __ from './locale'

/**
 * 数据分析tab
 */
export enum DataAnalysisTab {
    // 共享申请清单
    Apply = 'apply',
    // 分析完善
    AnalysisImprove = 'analysisImprove',
    // 分析结论确认
    AnalysisConfirm = 'analysisConfirm',
    // 数据资源实施
    ImplementData = 'implementData',
    // 实施结果确认
    ImplementResult = 'implementResult',
    // 申报审核
    AuditDeclare = 'auditDeclare',
    // 分析结论审核
    AuditAnalysis = 'auditAnalysis',
    // 发起成效反馈
    StartFeedback = 'startFeedback',
    // 处理成效反馈
    HandleFeedback = 'handleFeedback',
    // 成效反馈审核
    AuditFeedback = 'auditFeedback',
    // 分析成果出库申请
    AuditOutbound = 'auditOutbound',
    // 分析成果出库
    ResultOutbound = 'resultOutbound',
    // 数据资源编目
    CatalogData = 'catalogData',
    // 数据资源推送
    PushConfirm = 'pushConfirm',
}

/**
 * 菜单
 */
export const leftMenuItems: any[] = [
    {
        title: __('需求申请清单'),
        key: DataAnalysisTab.Apply,
        path: '/applyList',
        children: '',
    },
    {
        title: __('分析完善'),
        key: DataAnalysisTab.AnalysisImprove,
        path: '/analysisImprove',
        children: '',
    },
    {
        title: __('分析结论确认'),
        key: DataAnalysisTab.AnalysisConfirm,
        path: '/analysisConfirm',
        children: '',
    },
    {
        title: __('数据资源实施'),
        key: DataAnalysisTab.ImplementData,
        path: '/implementData',
        children: '',
    },
    {
        title: __('分析成果确认'),
        key: DataAnalysisTab.ImplementResult,
        path: '/implementResult',
        children: '',
    },
    {
        title: __('申报待审核列表'),
        key: DataAnalysisTab.AuditDeclare,
        path: '/auditDeclare',
        children: '',
    },
    {
        title: __('分析结论待审核列表'),
        key: DataAnalysisTab.AuditAnalysis,
        path: '/auditAnalysis',
        children: '',
    },
    {
        title: __('发起成效反馈'),
        key: DataAnalysisTab.StartFeedback,
        path: '/feedbackStart',
        children: '',
    },
    {
        title: __('处理成效反馈'),
        key: DataAnalysisTab.HandleFeedback,
        path: '/feedbackHandle',
        children: '',
    },
    {
        title: __('成效反馈审核'),
        key: DataAnalysisTab.AuditFeedback,
        path: '/feedbackAudit',
        children: '',
    },
    {
        title: __('分析成果出库待审核列表'),
        key: DataAnalysisTab.AuditOutbound,
        path: '/auditOutbound',
        children: '',
    },
    {
        title: __('分析成果出库'),
        key: DataAnalysisTab.ResultOutbound,
        path: '/resultOutbound',
        children: '',
    },
    {
        title: __('数据资源编目'),
        key: DataAnalysisTab.CatalogData,
        path: '/catalogData',
        children: '',
    },
    {
        title: __('数据推送待确认列表'),
        key: DataAnalysisTab.PushConfirm,
        path: '/pushConfirm',
        children: '',
    },
]

/**
 * 数据分析操作
 */
export enum TabOperate {
    // 详情
    Detail = 'Detail',
    // 编辑
    Edit = 'Edit',
    // 删除
    Delete = 'Delete',
    // 撤回
    Cancel = 'cancel',
    // 关闭
    Close = 'close',
    // 分析签收
    AnalysisSign = 'analysisSign',
    // 取消分析签收
    CancelAnalysisSign = 'cancelAnalysisSign',
    // 分析
    Analysis = 'analysis',
    // 编辑（分析）
    EditAnalysis = 'editAnalysis',
    // 重新分析
    ReAnalysis = 'reAnalysis',
    // 分析结论确认
    AnalysisConfirm = 'analysisConfirm',
    // 实施签收
    ImplementSign = 'implSign',
    // 实施
    Implement = 'implement',
    // 分析成果确认
    ImplementConfirm = 'implementConfirm',
    // 取消实施签收
    CancelImplementSign = 'cancelImplementSign',
    // 创建
    Create = 'create',
    //  申报审核
    ApplyAudit = 'ApplyAudit',
    // 分析审核
    AnalysisAudit = 'AnalysisAudit',
    // 反馈
    Feedback = 'Feedback',
    // 反馈审核
    FeedbackAudit = 'feedbackAudit',
    // 出库申请
    OutboundApply = 'outboundApply',
    // 推送确认
    PushConfirm = 'pushConfirm',
    // 出库审核
    OutboundAudit = 'outboundAudit',
    // 编目
    Catalog = 'catalog',
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
        key: TabOperate.Delete,
        label: __('删除'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.Cancel,
        label: __('撤回'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.Close,
        label: __('关闭'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.AnalysisSign,
        label: __('签收'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.Analysis,
        label: __('分析'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.CancelAnalysisSign,
        label: __('取消签收'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.EditAnalysis,
        label: __('编辑'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.ReAnalysis,
        label: __('重新分析'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.AnalysisConfirm,
        label: __('确认'),
        menuType: 'menu',
    },
    {
        key: TabOperate.ImplementSign,
        label: __('签收'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.Implement,
        label: __('实施'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.CancelImplementSign,
        label: __('取消签收'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.ImplementConfirm,
        label: __('确认'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.ApplyAudit,
        label: __('审核'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.AnalysisAudit,
        label: __('审核'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.FeedbackAudit,
        label: __('审核'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.OutboundApply,
        label: __('成果出库申请'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.PushConfirm,
        label: __('确认'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.Feedback,
        label: __('反馈'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.OutboundAudit,
        label: __('审核'),
        menuType: OptionMenuType.Menu,
    },
    {
        key: TabOperate.Catalog,
        label: __('编目'),
        menuType: OptionMenuType.Menu,
    },
]

// 状态映射
export const applyProcessMap = {
    [DataAnalRequireStatus.UnReport]: {
        text: __('未申报'),
        color: 'rgba(0, 0, 0, 0.3)',
    },
    [DataAnalRequireStatus.AnalysisSigningOff]: {
        text: __('分析待签收'),
        color: 'rgba(24, 144, 255, 1)',
    },
    [DataAnalRequireStatus.AnalysisPending]: {
        text: __('待分析'),
        color: 'rgba(24, 144, 255, 1)',
    },
    [DataAnalRequireStatus.Analysing]: {
        text: __('分析中'),
        color: 'rgba(24, 144, 255, 1)',
    },
    [DataAnalRequireStatus.AnalysisUnfeasible]: {
        text: __('分析结论不可行'),
        color: 'rgba(255, 77, 79, 1)',
    },
    [DataAnalRequireStatus.AnalysisConfirming]: {
        text: __('分析结论待确认'),
        color: 'rgba(250, 173, 20, 1)',
    },
    [DataAnalRequireStatus.ImplementSigningOff]: {
        text: __('实施待签收'),
        color: 'rgba(24, 144, 255, 1)',
    },
    [DataAnalRequireStatus.ImplementPending]: {
        text: __('待实施'),
        color: 'rgba(24, 144, 255, 1)',
    },
    [DataAnalRequireStatus.Implementing]: {
        text: __('实施中'),
        color: 'rgba(24, 144, 255, 1)',
    },
    [DataAnalRequireStatus.ImplementAccepting]: {
        text: __('分析成果待确认'),
        color: 'rgba(250, 173, 20, 1)',
    },
    [DataAnalRequireStatus.Closed]: {
        text: __('已完结'),
        color: 'rgba(82, 196, 27, 1)',
    },
    [DataAnalRequireStatus.Analysed]: {
        text: __('已分析'),
        color: 'rgba(82, 196, 27, 1)',
    },
    [DataAnalRequireStatus.Implemented]: {
        text: __('已实施'),
        color: 'rgba(82, 196, 27, 1)',
    },
    [DataAnalRequireStatus.CatalogPending]: {
        text: __('分析成果待编目'),
        color: 'rgba(250, 173, 20, 1)',
    },
    [DataAnalRequireStatus.Cataloging]: {
        text: __('分析成果编目中'),
        color: 'rgba(250, 173, 20, 1)',
    },
    [DataAnalRequireStatus.OutboundPending]: {
        text: __('分析成果待出库'),
        color: 'rgba(250, 173, 20, 1)',
    },
    [DataAnalRequireStatus.PushPending]: {
        text: __('分析成果待推送'),
        color: 'rgba(250, 173, 20, 1)',
    },
    [DataAnalRequireStatus.DataPushing]: {
        text: __('分析成果推送中'),
        color: 'rgba(250, 173, 20, 1)',
    },
}

// 状态筛选项
export const applyProcessOptions = [
    {
        value: DataAnalRequireStatus.UnReport,
        label: applyProcessMap[DataAnalRequireStatus.UnReport].text,
    },
    {
        value: DataAnalRequireStatus.AnalysisSigningOff,
        label: applyProcessMap[DataAnalRequireStatus.AnalysisSigningOff].text,
    },
    {
        value: DataAnalRequireStatus.AnalysisPending,
        label: applyProcessMap[DataAnalRequireStatus.AnalysisPending].text,
    },
    {
        value: DataAnalRequireStatus.Analysing,
        label: applyProcessMap[DataAnalRequireStatus.Analysing].text,
    },
    {
        value: DataAnalRequireStatus.AnalysisUnfeasible,
        label: applyProcessMap[DataAnalRequireStatus.AnalysisUnfeasible].text,
    },
    {
        value: DataAnalRequireStatus.AnalysisConfirming,
        label: applyProcessMap[DataAnalRequireStatus.AnalysisConfirming].text,
    },
    {
        value: DataAnalRequireStatus.ImplementSigningOff,
        label: applyProcessMap[DataAnalRequireStatus.ImplementSigningOff].text,
    },
    {
        value: DataAnalRequireStatus.ImplementPending,
        label: applyProcessMap[DataAnalRequireStatus.ImplementPending].text,
    },
    {
        value: DataAnalRequireStatus.Implementing,
        label: applyProcessMap[DataAnalRequireStatus.Implementing].text,
    },
    {
        value: DataAnalRequireStatus.ImplementAccepting,
        label: applyProcessMap[DataAnalRequireStatus.ImplementAccepting].text,
    },
    {
        value: DataAnalRequireStatus.CatalogPending,
        label: applyProcessMap[DataAnalRequireStatus.CatalogPending].text,
    },
    {
        value: DataAnalRequireStatus.Cataloging,
        label: applyProcessMap[DataAnalRequireStatus.Cataloging].text,
    },
    {
        value: DataAnalRequireStatus.OutboundPending,
        label: applyProcessMap[DataAnalRequireStatus.OutboundPending].text,
    },
    {
        value: DataAnalRequireStatus.PushPending,
        label: applyProcessMap[DataAnalRequireStatus.PushPending].text,
    },
    {
        value: DataAnalRequireStatus.DataPushing,
        label: applyProcessMap[DataAnalRequireStatus.DataPushing].text,
    },
    {
        value: DataAnalRequireStatus.Closed,
        label: applyProcessMap[DataAnalRequireStatus.Closed].text,
    },
    // {
    //     value: DataAnalRequireStatus.Analysed,
    //     label: applyProcessMap[DataAnalRequireStatus.Analysed].text,
    // },
]

export const CatalogPublishStatusMap = {
    [DataAnalCatalogPublishStatusEnum.Unpublished]: {
        text: __('未发布'),
        color: 'rgba(217, 217, 217, 1)',
    },
    [DataAnalCatalogPublishStatusEnum.Published]: {
        text: __('已发布'),
        color: 'rgba(82, 196, 27, 1)',
    },
    [DataAnalCatalogPublishStatusEnum.PubAuditing]: {
        text: __('发布审核中'),
        color: 'rgba(24, 144, 255, 1)',
    },
    [DataAnalCatalogPublishStatusEnum.PubReject]: {
        text: __('发布审核未通过'),
        color: 'rgba(255, 77, 79, 1)',
    },
    [DataAnalCatalogPublishStatusEnum.ChangeAuditing]: {
        text: __('变更审核中'),
        color: 'rgba(24, 144, 255, 1)',
    },
    [DataAnalCatalogPublishStatusEnum.ChangeReject]: {
        text: __('变更审核未通过'),
        color: 'rgba(255, 77, 79, 1)',
    },
}

// 审核状态
export const auditStatusListMap = {
    [DataAnalAuditStatus.ReportAuditing]: {
        text: __('申报审核中'),
        backgroundColor: 'rgba(24, 144, 255, 0.2)',
        color: 'rgba(24, 144, 255, 1)',
    },
    [DataAnalAuditStatus.ReportAuditReject]: {
        text: __('申报未通过'),
        backgroundColor: 'rgba(255, 77, 79, 0.2)',
        color: 'rgba(255, 77, 79, 1)',
    },
    [DataAnalAuditStatus.ReportAuditUndone]: {
        text: __('已撤回'),
        backgroundColor: 'rgba(255, 77, 79, 0.2)',
        color: 'rgba(255, 77, 79, 1)',
    },
    [DataAnalAuditStatus.AnalysisAuditing]: {
        text: __('分析结论审核中'),
        backgroundColor: 'rgba(24, 144, 255, 0.2)',
        color: 'rgba(24, 144, 255, 1)',
    },
    [DataAnalAuditStatus.AnalysisAuditReject]: {
        text: __('分析结论未通过'),
        backgroundColor: 'rgba(255, 77, 79, 0.2)',
        color: 'rgba(255, 77, 79, 1)',
    },
    [DataAnalAuditStatus.ImplementConfirmReject]: {
        text: __('分析成果未通过'),
        backgroundColor: 'rgba(255, 77, 79, 0.2)',
        color: 'rgba(255, 77, 79, 1)',
    },
    [DataAnalAuditStatus.FeedbackAuditing]: {
        text: __('反馈审核中'),
        backgroundColor: 'rgba(24, 144, 255, 0.2)',
        color: 'rgba(24, 144, 255, 1)',
    },
    [DataAnalAuditStatus.FeedbackAuditReject]: {
        text: __('反馈未通过'),
        backgroundColor: 'rgba(255, 77, 79, 0.2)',
        color: 'rgba(255, 77, 79, 1)',
    },
    [DataAnalAuditStatus.OutboundAuditReject]: {
        text: __('数据出库未通过'),
        backgroundColor: 'rgba(255, 77, 79, 0.2)',
        color: 'rgba(255, 77, 79, 1)',
    },
    [DataAnalAuditStatus.OutboundAuditing]: {
        text: __('数据出库审核中'),
        backgroundColor: 'rgba(24, 144, 255, 0.2)',
        color: 'rgba(24, 144, 255, 1)',
    },
}

// 委托方式
export const commissionTypeMap = {
    [DataAnalCommissionType.COMMISSION_BASED]: {
        text: __('委托型'),
    },
    [DataAnalCommissionType.SELF_SERVICE]: {
        text: __('自助型'),
    },
}

// 委托方式筛选项
export const commissionTypeOptions = [
    {
        label: commissionTypeMap[DataAnalCommissionType.COMMISSION_BASED].text,
        value: DataAnalCommissionType.COMMISSION_BASED,
    },
    {
        label: commissionTypeMap[DataAnalCommissionType.SELF_SERVICE].text,
        value: DataAnalCommissionType.SELF_SERVICE,
    },
]

export enum FeedbackStatusEnum {
    ALL = '',
    // 待成效反馈（待处理）
    PENDING = 'feedback-pending',
    // 成效反馈中（进行中）
    FEEDBACKING = 'feedbacking',
    // 成效反馈完成（已完成）
    FINISHED = 'feedback-finished',
}

// 数据分析tab
export const tabMap = {
    // 共享申请清单
    [DataAnalysisTab.Apply]: {
        // 表格列名
        columnKeys: [
            // 申请名称（编码）
            'name',
            // 状态
            'status',
            // 申请部门
            'apply_org_name',
            // 需求联系人（联系电话）
            'contact',
            // 委托方式
            'commission_type',
            // 申请时间
            'created_at',
            // 期望完成时间
            'finish_date',
            // 操作
            'action',
        ],
        // 操作栏宽度
        actionWidth: 160,
        // 搜索筛选项
        filterKeys: [
            'keyword',
            'apply_org_code',
            'status',
            'commission_type',
            'create_time',
            'finish_time',
            'impl_time',
            'close_time',
        ],
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
            sort: 'created_at',
            direction: 'desc',
        },
        // 默认表头排序 - 如果不传，则不支持表示不支持表头排序
        defaultTableSort: { created_at: 'descend', finish_time: null },
        // 表格默认滚动高度
        defaultScrollY: `calc(100vh - 291px)`,
    },
    // 分析完善
    [DataAnalysisTab.AnalysisImprove]: {
        // 表格列名
        columnKeys: [
            // 需求名称（编码）
            'name',
            // 申请部门
            'apply_org_name',
            // 需求联系人（联系电话）
            'contact',
            // 委托方式
            'commission_type',
            // 申请时间
            'created_at',
            // 期望完成时间
            'finish_date',
            // 分析状态
            'status',
            // 操作
            'action',
        ],
        // 操作栏宽度
        actionWidth: 200,
        // 默认表头排序 - 如果不传，则不支持表示不支持表头排序
        defaultTableSort: { created_at: 'descend', finish_date: null },
        // 左侧状态筛选
        statusOption: [
            { status: DataAnalRequireStatus.All, label: __('全部') },
            {
                status: DataAnalRequireStatus.AnalysisSigningOff,
                label: __('待签收'),
            },
            {
                status: DataAnalRequireStatus.AnalysisPending,
                label: __('待分析'),
            },
            { status: DataAnalRequireStatus.Analysing, label: __('分析中') },
            {
                status: DataAnalRequireStatus.Analysed,
                label: __('已分析'),
            },
        ],
        // 筛选项
        filterKeys: [
            'keyword',
            'apply_org_code',
            'commission_type',
            'create_time',
            'finish_time',
            'impl_time',
            'close_time',
        ],
        // 表格默认滚动高度
        defaultScrollY: `calc(100vh - 291px)`,
    },
    // 分析结果确认
    [DataAnalysisTab.AnalysisConfirm]: {
        // 表格列名
        columnKeys: [
            // 需求名称（编码）
            'name',
            // 申请部门
            'apply_org_name',
            // 需求联系人（联系电话）
            'contact',
            // 申请时间
            'created_at',
            // 期望完成时间
            'finish_date',
            // 操作
            'action',
        ],
        // 操作栏宽度
        actionWidth: 120,
        // 筛选项
        filterKeys: [
            'keyword',
            'apply_org_code',
            'commission_type',
            'create_time',
            'finish_time',
        ],
        initSearch: {
            limit: 10,
            offset: 1,
            sort: 'created_at',
            direction: 'desc',
            status: DataAnalRequireStatus.AnalysisConfirming,
        },
        // 默认表头排序
        defaultTableSort: { created_at: 'descend', finish_date: null },
        defaultScrollY: `calc(100vh - 291px)`,
    },
    // 数据资源实施列表
    [DataAnalysisTab.ImplementData]: {
        // 表格列名
        columnKeys: [
            // 需求名称（编码）
            'name',
            // 申请部门
            'apply_org_name',
            // 需求联系人（联系电话）
            'contact',
            // 委托方式
            'commission_type',
            // 申请时间
            'created_at',
            // 期望完成时间
            'finish_date',
            // 状态
            'status',
            // 操作
            'action',
        ],
        // 筛选项
        filterKeys: [
            'keyword',
            'apply_org_code',
            'create_time',
            'finish_time',
            'impl_time',
            'close_time',
        ],
        // 左侧状态筛选
        statusOption: [
            { status: DataAnalRequireStatus.All, label: __('全部') },
            {
                status: DataAnalRequireStatus.ImplementSigningOff,
                label: __('待签收'),
            },
            {
                status: DataAnalRequireStatus.ImplementPending,
                label: __('待实施'),
            },
            { status: DataAnalRequireStatus.Implementing, label: __('实施中') },
            {
                status: DataAnalRequireStatus.Implemented,
                label: __('已实施'),
            },
        ],
        // 操作栏宽度
        actionWidth: 180,
        // 默认表头排序
        defaultTableSort: { created_at: 'descend', finish_date: null },
        defaultScrollY: `calc(100vh - 291px)`,
    },
    // 实施结果确认
    [DataAnalysisTab.ImplementResult]: {
        // 表格列名
        columnKeys: [
            // 需求名称（编码）
            'name',
            // 申请部门
            'apply_org_name',
            // 需求联系人（联系电话）
            'contact',
            // 申请时间
            'created_at',
            // 期望完成时间
            'finish_date',
            // 操作
            'action',
        ],
        // 筛选项
        filterKeys: [
            'keyword',
            'apply_org_code',
            'create_time',
            'finish_time',
            'impl_time',
            'close_time',
        ],
        statusOption: [
            {
                status: DataAnalRequireStatus.ImpConfirming,
                label: __('待确认'),
            },
            {
                status: DataAnalRequireStatus.ImpConfirmed,
                label: __('已确认'),
            },
        ],
        initStatus: DataAnalRequireStatus.ImpConfirming,
        // 操作栏宽度
        actionWidth: 120,
        initSearch: {
            limit: 10,
            offset: 1,
            sort: 'created_at',
            direction: 'desc',
            status: DataAnalRequireStatus.ImpConfirming,
        },
        // 默认表头排序
        defaultTableSort: { created_at: 'descend', finish_date: null },
        defaultScrollY: `calc(100vh - 291px)`,
    },
    [DataAnalysisTab.ResultOutbound]: {
        // 表格列名
        columnKeys: [
            // 需求名称（编码）
            'name',
            // 申请部门
            'apply_org_name',
            // 需求联系人（联系电话）
            'contact',
            // 申请时间
            'created_at',
            // 期望完成时间
            'finish_date',
            // 操作
            'action',
        ],
        filterKeys: [],
        // 左侧状态筛选
        statusOption: [
            {
                status: DataAnalResultOutboundApplyStatusEnum.OutboundPending,
                label: __('待申请'),
            },
            {
                status: DataAnalResultOutboundApplyStatusEnum.Outbound,
                label: __('已申请'),
            },
        ],
        // 操作栏宽度
        actionWidth: 200,
        initSearch: {
            limit: 10,
            offset: 1,
            status: DataAnalResultOutboundApplyStatusEnum.OutboundPending,
        },
        refresh: true,
        defaultScrollY: `calc(100vh - 227px)`,
    },
    // 审计申报
    [DataAnalysisTab.AuditDeclare]: {
        // 表格列名
        columnKeys: [
            // 需求名称（编码）
            'name',
            // 申请部门
            'apply_org_name',
            // 需求联系人（联系电话）
            'contact',
            // 申请时间
            'created_at',
            // 期望完成时间
            'finish_date',
            // 操作
            'action',
        ],
        // opMap: auditOperateRules,
        // 操作栏宽度
        actionWidth: 80,
        initSearch: {
            limit: 10,
            offset: 1,
            audit_type: DataAnalAuditType.AfDataAnalRequireReport,
        },
        refresh: true,
        defaultScrollY: `calc(100vh - 227px)`,
    },
    // 分析结论审核
    [DataAnalysisTab.AuditAnalysis]: {
        // 表格列名
        columnKeys: [
            // 需求名称（编码）
            'name',
            // 申请部门
            'apply_org_name',
            // 需求联系人（联系电话）
            'contact',
            // 申请时间
            'created_at',
            // 期望完成时间
            'finish_date',
            // 操作
            'action',
        ],
        // 操作栏宽度
        actionWidth: 80,
        initSearch: {
            limit: 10,
            offset: 1,
            audit_type: DataAnalAuditType.AfDataAnalRequireAnalysis,
        },
        // 刷新
        refresh: true,
        defaultScrollY: `calc(100vh - 227px)`,
    },
    [DataAnalysisTab.AuditOutbound]: {
        // 表格列名
        columnKeys: [
            // 需求名称（编码）
            'name',
            // 申请部门
            'apply_org_name',
            // 需求联系人（联系电话）
            'contact',
            // 申请时间
            'created_at',
            // 期望完成时间
            'finish_date',
            // 操作
            'action',
        ],
        // opMap: auditOperateRules,
        // 操作栏宽度
        actionWidth: 80,
        initSearch: {
            limit: 10,
            offset: 1,
            audit_type: DataAnalAuditType.AfDataAnalRequireOutbound,
        },
        refresh: true,
        defaultScrollY: `calc(100vh - 227px)`,
    },
    // 发起成效反馈
    [DataAnalysisTab.StartFeedback]: {
        // 表格列名
        columnKeys: (tab: FeedbackTargetEnum) =>
            tab === FeedbackTargetEnum.StartPending
                ? [
                      // 申请名称（编码）
                      'name',
                      // 申请部门
                      'apply_org_name',
                      // 申请联系人（联系电话）
                      'applier',
                      // 委托方式
                      'commission_type',
                      // 申请资源个数
                      'output_item_num',
                      // 申请时间
                      'created_at',
                  ]
                : [
                      // 申请名称（编码）
                      'name',
                      // 申请部门
                      'apply_org_name',
                      // 反馈内容
                      'feedback_content',
                      // 反馈时间
                      'feedback_at',
                      // 操作
                      'action',
                  ],
        // 操作栏宽度
        actionWidth: 160,
        // 搜索筛选项
        filterKeys: ['keyword'],
        // 默认搜索条件
        initSearch: {
            limit: 10,
            offset: 1,
            // sort: 'feedback_at',
            // direction: 'desc',
            target: FeedbackTargetEnum.StartPending,
            feedback_status: FeedbackStatusEnum.ALL,
        },
        // 默认表头排序 - 如果不传，则不支持表示不支持表头排序
        defaultTableSort: { feedback_at: 'descend' },
        // 表格默认滚动高度
        defaultScrollY: `calc(100vh - 291px)`,
        searchPlaceholder: __('搜索需求名称、需求编码'),
        // 左侧状态筛选
        statusOption: [
            { status: FeedbackStatusEnum.ALL, label: __('全部') },
            { status: FeedbackStatusEnum.PENDING, label: __('待处理') },
            { status: FeedbackStatusEnum.FEEDBACKING, label: __('进行中') },
            { status: FeedbackStatusEnum.FINISHED, label: __('已完成') },
        ],
    },
    // 发起成效反馈
    [DataAnalysisTab.HandleFeedback]: {
        // 表格列名
        columnKeys: [
            // 申请名称（编码）
            'name',
            // 申请部门
            'apply_org_name',
            // 反馈内容
            'feedback_content',
            // 反馈时间
            'feedback_at',
            // 操作
            'action',
        ],
        // 操作栏宽度
        actionWidth: 160,
        // 搜索筛选项
        filterKeys: ['keyword'],
        // 默认搜索条件
        initSearch: {
            limit: 10,
            offset: 1,
            // sort: 'feedback_at',
            // direction: 'desc',
            target: FeedbackTargetEnum.Process,
            feedback_status: FeedbackStatusEnum.PENDING,
        },
        // 默认表头排序 - 如果不传，则不支持表示不支持表头排序
        defaultTableSort: { feedback_at: 'descend' },
        // 表格默认滚动高度
        defaultScrollY: `calc(100vh - 291px)`,
        searchPlaceholder: __('搜索申请单名称'),
        // 左侧状态筛选
        statusOption: [
            { status: FeedbackStatusEnum.PENDING, label: __('待处理') },
            { status: FeedbackStatusEnum.FEEDBACKING, label: __('进行中') },
            { status: FeedbackStatusEnum.FINISHED, label: __('已完成') },
        ],
    },
    // 发起成效反馈
    [DataAnalysisTab.AuditFeedback]: {
        // 表格列名
        columnKeys: [
            // 申请名称（编码）
            'name',
            // 申请部门
            'apply_org_name',
            // 反馈内容
            'feedback_content',
            // 反馈时间
            'feedback_at',
            // 操作
            'action',
        ],
        // 操作栏宽度
        actionWidth: 160,
        // 搜索筛选项
        filterKeys: ['keyword'],
        // 默认搜索条件
        initSearch: {
            limit: 10,
            offset: 1,
            audit_type: DataAnalAuditType.AfDataAnalRequireFeedback,
        },
        // 表格默认滚动高度
        defaultScrollY: `calc(100vh - 291px)`,
        searchPlaceholder: __('搜索申请单名称'),
    },
    // 数据资源编目
    [DataAnalysisTab.CatalogData]: {
        // 搜索筛选项
        filterKeys: [
            'keyword',
            'apply_org_code',
            'status',
            'commission_type',
            'create_time',
        ],
        // 左侧状态筛选
        // statusOption: [
        //     {
        //         status: DataAnalResultOutboundApplyStatusEnum.OutboundPending,
        //         label: __('待编目'),
        //     },
        //     {
        //         status: DataAnalResultOutboundApplyStatusEnum.Outbound,
        //         label: __('已编目'),
        //     },
        // ],
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
            sort: 'created_at',
            direction: 'desc',
        },
    },
    // 共享申请清单
    [DataAnalysisTab.PushConfirm]: {
        // 表格列名
        columnKeys: [
            // 申请名称（编码）
            'name',
            // 申请部门
            'apply_org_name',
            // 需求联系人（联系电话）
            'contact',
            // 委托方式
            'commission_type',
            // 申请时间
            'created_at',
            // 期望完成时间
            'finish_date',
            // 操作
            'action',
        ],
        // 操作栏宽度
        actionWidth: 160,
        // 搜索筛选项
        filterKeys: [
            'keyword',
            'apply_org_code',
            'status',
            'commission_type',
            'create_time',
            'finish_time',
            'impl_time',
            'close_time',
        ],
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
            sort: 'created_at',
            direction: 'desc',
        },
        // 默认表头排序 - 如果不传，则不支持表示不支持表头排序
        defaultTableSort: { created_at: 'descend', finish_time: null },
        // 表格默认滚动高度
        defaultScrollY: `calc(100vh - 291px)`,
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
    filterKeys = [
        'keyword',
        'apply_org_code',
        'status',
        'commission_type',
        'create_time',
        'finish_time',
        'impl_time',
        'close_time',
    ],
    customProps = {},
}: SearchFilterConfig) => {
    // 定义所有可用的筛选项配置
    const allFilters = {
        keyword: {
            label: __('资源名称'),
            key: 'keyword',
            type: SearchTypeLayout.Input,
            isAlone: true,
            itemProps: {
                placeholder:
                    placeholder || __('搜索需求编码、需求名称、预期成效'),
            },
        },
        apply_org_code: {
            label: __('申请部门'),
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
        commission_type: {
            label: __('委托方式'),
            key: 'commission_type',
            type: SearchTypeLayout.MultipleSelect,
            itemProps: {
                options: commissionTypeOptions,
                fieldNames: { label: 'label', value: 'value' },
                showSearch: false,
            },
        },
        create_time: {
            label: __('申请时间'),
            key: 'create_time',
            type: SearchTypeLayout.RangePicker,
            itemProps: {
                format: 'YYYY-MM-DD',
            },
            startTime: 'create_begin_time',
            endTime: 'create_end_time',
        },
        finish_time: {
            label: __('期望完成时间'),
            key: 'finish_time',
            type: SearchTypeLayout.RangePicker,
            itemProps: {
                format: 'YYYY-MM-DD',
            },
            startTime: 'finish_begin_time',
            endTime: 'finish_end_time',
        },
        impl_time: {
            label: __('需求实施时间'),
            key: 'impl_time',
            type: SearchTypeLayout.RangePicker,
            itemProps: {
                format: 'YYYY-MM-DD',
            },
            startTime: 'impl_begin_time',
            endTime: 'impl_end_time',
        },
        close_time: {
            label: __('需求完结时间'),
            key: 'close_time',
            type: SearchTypeLayout.RangePicker,
            itemProps: {
                format: 'YYYY-MM-DD',
            },
            startTime: 'close_begin_time',
            endTime: 'close_end_time',
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
