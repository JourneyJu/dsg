import { Button, Checkbox, message, Space, Table, Tabs } from 'antd'

import { PlusOutlined } from '@ant-design/icons'
import { useUpdateEffect } from 'ahooks'
import classnames from 'classnames'
import { debounce, omit } from 'lodash'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { confirm } from '@/utils/modalHelper'
import {
    formatTime,
    getActualUrl,
    getPlatformNumber,
    rewriteUrl,
} from '@/utils'
import { Empty, OptionBarTool, SearchInput } from '@/ui'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import {
    cancelSignOffDataAnalRequire,
    cancelSignOffDataAnalRequireImplement,
    closeDataAnalRequire,
    DataAnalAuditStatus,
    DataAnalRequireStatus,
    DataAnalResultOutboundApplyStatusEnum,
    deleteDataAnalRequire,
    FeedbackTargetEnum,
    formatError,
    getDataAnalFeedbackCount,
    getDataAnalFeedbackList,
    getDataAnalImpConfirmList,
    getDataAnalOutboundList,
    getDataAnalPushConfirmList,
    getDataAnalRequireAnalysisList,
    getDataAnalRequireAuditList,
    getDataAnalRequireImplementList,
    getDataAnalRequireList,
    LoginPlatform,
    signOffDataAnalRequire,
    signOffDataAnalRequireImplement,
    SortDirection,
} from '@/core'
import { changeUrlData } from '../CitySharing/helper'
import Analysis from '../DataAnalysisDemand/Analysis'
import ConclusionConfirm from '../DataAnalysisDemand/Analysis/ConclusionConfirm'
import AnalysisAudit from '../DataAnalysisDemand/Audit/AnalysisAudit'
import ApplyAudit from '../DataAnalysisDemand/Audit/ApplyAudit'
import FeedbackAudit from '../DataAnalysisDemand/Audit/FeedbackAudit'
import OutboundAudit from '../DataAnalysisDemand/Audit/OutboundAudit'
import PushConfirm from '../DataAnalysisDemand/DataPush/PushConfirm'
import Details from '../DataAnalysisDemand/Details'
import Feedback from '../DataAnalysisDemand/Feedback/Feedback'
import StartFeedback from '../DataAnalysisDemand/Feedback/StartFeedback'
import Implement from '../DataAnalysisDemand/Implement'
import ApplyOutbound from '../DataAnalysisDemand/Implement/ApplyOutbound'
import ResultConfirm from '../DataAnalysisDemand/Implement/ResultConfirm'
import SearchLayout from '../SearchLayout'
import { RefreshBtn } from '../ToolbarComponents'
import {
    allOptionMenus,
    commissionTypeMap,
    DataAnalysisTab,
    FeedbackStatusEnum,
    leftMenuItems,
    recordSearchFilter,
    tabMap,
    TabOperate,
} from './const'
import {
    ContactView,
    MultiColumn,
    renderEmpty,
    renderLoader,
    StatusFilter,
    StatusView,
    SubTitle,
    timeStrToTimestamp,
} from './helper'
import __ from './locale'
import Revocate from './Revocate'
import styles from './styles.module.less'

interface IApplyTable {
    tab: string
    isPersonalCenter?: boolean
}

const ApplyTable: React.FC<IApplyTable> = ({ tab, isPersonalCenter }) => {
    const navigate = useNavigate()
    const platform = getPlatformNumber()

    // 搜索条件
    const [searchCondition, setSearchCondition] = useState<any>({})
    // 表头排序
    const [tableSort, setTableSort] = useState<any>(
        tabMap[tab].defaultTableSort,
    )

    // load
    const [loading, setLoading] = useState<boolean>(true)
    const [fetching, setFetching] = useState<boolean>(true)

    // 表格数据
    const [tableData, setTableData] = useState<any[]>([])
    // 总条数
    const [total, setTotal] = useState<number>(0)
    // 当前操作项
    const [operateItem, setOperateItem] = useState<any>()

    // 选中的状态（申请清单和分析完善左侧状态）
    const [selectStatus, setSelectStatus] = useState<DataAnalRequireStatus>(
        tabMap[tab].initStatus || DataAnalRequireStatus.All,
    )
    // 表格高度
    const [scrollY, setScrollY] = useState<string>(
        tabMap[tab].defaultScrollY || `calc(100vh - 227px)`,
    )
    const searchFormRef: any = useRef()
    // 假设从上下文或props中获取用户角色
    const [userInfo] = useCurrentUser()
    const [showAnalysis, setShowAnalysis] = useState(false)
    const [showConclusionConfirm, setShowConclusionConfirm] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [showImplement, setShowImplement] = useState(false)
    const [showImplementConfirm, setShowImplementConfirm] = useState(false)
    const [cancelOpen, setCancelOpen] = useState(false)
    const [applyAuditOpen, setApplyAuditOpen] = useState(false)
    const [analysisAuditOpen, setAnalysisAuditOpen] = useState(false)
    const [feedbackActiveTab, setFeedbackActiveTab] = useState(
        FeedbackTargetEnum.StartPending,
    )
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [selectedColumns, setSelectedColumns] = useState<any[]>([])
    const [showStartFeedback, setShowStartFeedback] = useState(false)
    const [showFeedback, setShowFeedback] = useState(false)
    const [feedbackAuditOpen, setFeedbackAuditOpen] = useState(false)
    const [outboundApplyOpen, setOutboundApplyOpen] = useState(false)
    const [pushConfirmOpen, setPushConfirmOpen] = useState(false)
    const [outboundAuditOpen, setOutboundAuditOpen] = useState(false)
    const [feedbackCountArr, setFeedbackArr] = useState<number[]>([])

    useEffect(() => {
        const config = tabMap[tab]
        const initSearch = config?.initSearch || {
            limit: 10,
            offset: 1,
            sort: 'created_at',
            direction: 'desc',
        }
        setSearchCondition(
            isPersonalCenter ? { ...initSearch, only_mine: true } : initSearch,
        )
        // setSelectedSort(tabMap[tab].defaultMenu)
        setTableSort(tabMap[tab].defaultTableSort)
        if (tab === DataAnalysisTab.StartFeedback) {
            setFeedbackActiveTab(FeedbackTargetEnum.StartPending)
        }
    }, [tab])

    const getFeedbackCount = async () => {
        try {
            const res = await getDataAnalFeedbackCount()
            setFeedbackArr([
                res.feedback_pending_num || 0,
                res.feedbacking_num || 0,
                res.feedback_pending_num || 0,
            ])
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        if (tab === DataAnalysisTab.HandleFeedback) {
            getFeedbackCount()
        }
    }, [tab])

    // 是否有过滤值
    const isSearchStatus = useMemo(() => {
        const ignoreAttr = [
            'offset',
            'limit',
            'sort',
            'direction',
            'status',
            'audit_status',
            'audit_type',
        ]
        return Object.values(omit(searchCondition, ignoreAttr))?.some(
            (item) => item,
        )
    }, [searchCondition])

    // 根据条件请求数据
    useUpdateEffect(() => {
        if (searchCondition) {
            getTableList({ ...searchCondition })
        }
    }, [searchCondition])

    // 获取表格数据
    const getTableList = async (params: any) => {
        try {
            setFetching(true)
            let res: any
            switch (tab) {
                case DataAnalysisTab.Apply:
                case DataAnalysisTab.AnalysisConfirm:
                    res = await getDataAnalRequireList(params)
                    break
                case DataAnalysisTab.ImplementResult:
                    res = await getDataAnalImpConfirmList(params)
                    break
                case DataAnalysisTab.AnalysisImprove:
                    res = await getDataAnalRequireAnalysisList(params)
                    break

                case DataAnalysisTab.ImplementData:
                    res = await getDataAnalRequireImplementList(params)
                    break

                case DataAnalysisTab.AuditDeclare:
                case DataAnalysisTab.AuditAnalysis:
                case DataAnalysisTab.AuditOutbound:
                case DataAnalysisTab.AuditFeedback:
                    res = await getDataAnalRequireAuditList(params)
                    break
                case DataAnalysisTab.StartFeedback:
                case DataAnalysisTab.HandleFeedback:
                    res = await getDataAnalFeedbackList(params)
                    break
                case DataAnalysisTab.ResultOutbound:
                    res = await getDataAnalOutboundList(params)
                    break
                case DataAnalysisTab.PushConfirm:
                    res = await getDataAnalPushConfirmList(params)
                    break
                default:
                    break
            }
            setTableData(res?.entries || [])
            setTotal(res?.total_count || 0)
        } catch (error) {
            formatError(error)
        } finally {
            setFetching(false)
            setLoading(false)
        }
    }

    // 刷新
    const handleRefresh = (refresh: boolean = true) => {
        setSearchCondition((prevCondition) => ({
            ...prevCondition,
            offset: refresh ? 1 : prevCondition.offset,
        }))
    }

    const handleAnalysisSign = async (record: any) => {
        try {
            await signOffDataAnalRequire(record.id)
            message.success(__('分析签收成功'))
            handleRefresh(false)
        } catch (error) {
            formatError(error)
        }
    }

    const handleCancelAnalysisSign = async (record: any) => {
        try {
            await cancelSignOffDataAnalRequire(record.id)
            message.success(__('取消分析签收成功'))
            handleRefresh(false)
        } catch (error) {
            formatError(error)
        }
    }

    const handleImplementSign = async (record: any) => {
        try {
            await signOffDataAnalRequireImplement(record.id)
            message.success(__('实施签收成功'))
            handleRefresh(false)
        } catch (error) {
            formatError(error)
        }
    }

    const handleCancelImplementSign = async (record: any) => {
        try {
            await cancelSignOffDataAnalRequireImplement(record.id)
            message.success(__('取消实施签收成功'))
            handleRefresh(false)
        } catch (error) {
            formatError(error)
        }
    }

    const handleDelete = async (record: any) => {
        try {
            await deleteDataAnalRequire(record.id)
            message.success(__('删除成功'))
            handleRefresh(false)
        } catch (error) {
            formatError(error)
        }
    }

    const handleClose = async (record: any) => {
        try {
            await closeDataAnalRequire(record.id)
            message.success(__('关闭成功'))
            handleRefresh(false)
        } catch (error) {
            formatError(error)
        }
    }

    const jumpToPage = (url: string) => {
        if (platform === LoginPlatform.drmp) {
            window.open(getActualUrl(url, true, 2), '_self')
        } else {
            navigate(url)
        }
    }

    // 表格操作事件
    const handleOptionTable = (key: string, record) => {
        setOperateItem(record)
        switch (key) {
            // 编辑申请
            case TabOperate.Edit:
                jumpToPage(`/dataAnalysis/apply?applyId=${record.id}`)
                break

            case TabOperate.Detail:
                rewriteUrl(
                    changeUrlData({
                        operate: TabOperate.Detail,
                        applyId: record.id,
                    }),
                )
                setShowDetails(true)
                break
            case TabOperate.Analysis:
            case TabOperate.ReAnalysis:
            case TabOperate.EditAnalysis:
                rewriteUrl(
                    changeUrlData({
                        operate: TabOperate.Analysis,
                        applyId: record.id,
                    }),
                )
                setShowAnalysis(true)
                break
            case TabOperate.AnalysisSign:
                confirm({
                    title: __('确定分析签收吗？'),
                    content: __('签收后，可取消签收'),
                    okText: __('确定'),
                    cancelText: __('取消'),
                    onOk: () => handleAnalysisSign(record),
                })
                break
            case TabOperate.CancelAnalysisSign:
                confirm({
                    title: __('确认取消签收吗？'),
                    content: __('取消后，需重新签收才能分析，请确认'),
                    okText: __('确定'),
                    cancelText: __('取消'),
                    onOk: () => handleCancelAnalysisSign(record),
                })
                break
            case TabOperate.ImplementSign:
                confirm({
                    title: __('确定实施签收吗？'),
                    content: __('签收后，进入待实施页面进行实施操作'),
                    okText: __('确定'),
                    cancelText: __('取消'),
                    onOk: () => handleImplementSign(record),
                })
                break
            case TabOperate.CancelImplementSign:
                confirm({
                    title: __('确认取消签收吗？'),
                    content: __('取消后，需重新签收才能实施，请确认'),
                    okText: __('确定'),
                    cancelText: __('取消'),
                    onOk: () => handleCancelImplementSign(record),
                })
                break
            case TabOperate.Implement:
                rewriteUrl(
                    changeUrlData({
                        operate: TabOperate.Implement,
                        applyId: record.id,
                    }),
                )
                setShowImplement(true)
                break
            case TabOperate.AnalysisConfirm:
                setShowConclusionConfirm(true)
                break
            case TabOperate.ImplementConfirm:
                setShowImplementConfirm(true)
                break
            case TabOperate.Delete:
                confirm({
                    title: __('确认删除${name}吗？', { name: record.name }),
                    content: __('需求单删除后，将无法找回，请谨慎操作！'),
                    okText: __('确定'),
                    cancelText: __('取消'),
                    onOk: () => handleDelete(record),
                })
                break
            case TabOperate.Close:
                confirm({
                    title: __('确认关闭${name}吗？', { name: record.name }),
                    content: '',
                    okText: __('确定'),
                    cancelText: __('取消'),
                    onOk: () => handleClose(record),
                })
                break
            case TabOperate.Cancel:
                setCancelOpen(true)
                break
            case TabOperate.ApplyAudit:
                setApplyAuditOpen(true)
                break
            case TabOperate.AnalysisAudit:
                setAnalysisAuditOpen(true)
                break
            case TabOperate.Feedback:
                setShowFeedback(true)
                break
            case TabOperate.FeedbackAudit:
                setFeedbackAuditOpen(true)
                break
            case TabOperate.OutboundApply:
                if (isPersonalCenter) {
                    window.open(
                        getActualUrl(
                            `/dataAnalysis/resultOutbound?applyId=${record.id}`,
                        ),
                        '_blank',
                    )
                } else {
                    setOutboundApplyOpen(true)
                }

                break
            case TabOperate.PushConfirm:
                setPushConfirmOpen(true)
                break
            case TabOperate.OutboundAudit:
                setOutboundAuditOpen(true)
                break
            case TabOperate.Catalog:
                window.open(
                    getActualUrl(
                        `/dataAnalysis/catalogData?applyId=${record.id}`,
                    ),
                    '_blank',
                )
                break
            default:
        }
    }

    // 获取操作选项
    const getOperateOptions = (record: any): any[] => {
        const {
            status,
            audit_status,
            feedback_status,
            analyser_id,
            implementer_id,
        } = record
        // 获取当前 tab 的默认操作
        const defaultOperates = {
            [DataAnalysisTab.Apply]: [TabOperate.Detail],
            [DataAnalysisTab.AnalysisImprove]: [TabOperate.Detail],
            [DataAnalysisTab.AnalysisConfirm]: [
                TabOperate.Detail,
                TabOperate.AnalysisConfirm,
            ],
            [DataAnalysisTab.ImplementData]: [TabOperate.Detail],
            [DataAnalysisTab.ImplementResult]:
                selectStatus === DataAnalRequireStatus.ImpConfirming
                    ? [TabOperate.Detail, TabOperate.ImplementConfirm]
                    : [TabOperate.Detail],
            [DataAnalysisTab.AuditDeclare]: [TabOperate.ApplyAudit],
            [DataAnalysisTab.AuditAnalysis]: [TabOperate.AnalysisAudit],
            [DataAnalysisTab.HandleFeedback]:
                searchCondition.feedback_status ===
                    FeedbackStatusEnum.PENDING ||
                (searchCondition.feedback_status ===
                    FeedbackStatusEnum.FEEDBACKING &&
                    audit_status === DataAnalAuditStatus.FeedbackAuditReject)
                    ? [TabOperate.Feedback]
                    : [TabOperate.Detail],
            [DataAnalysisTab.AuditFeedback]: [TabOperate.FeedbackAudit],
            [DataAnalysisTab.ResultOutbound]:
                searchCondition.status ===
                DataAnalResultOutboundApplyStatusEnum.OutboundPending
                    ? [TabOperate.Detail, TabOperate.OutboundApply]
                    : [TabOperate.Detail],
            [DataAnalysisTab.PushConfirm]: [
                TabOperate.Detail,
                TabOperate.PushConfirm,
            ],
            [DataAnalysisTab.AuditOutbound]: [TabOperate.OutboundAudit],
        }[tab] || [TabOperate.Detail]

        // 获取状态相关的操作规则
        const getStatusOperates = () => {
            // 根据不同的tab页返回对应的状态操作映射
            const tabStatusMap = {
                // 申请清单
                [DataAnalysisTab.Apply]: {
                    // 未申报
                    [DataAnalRequireStatus.UnReport]: () => {
                        if (
                            !audit_status ||
                            audit_status ===
                                DataAnalAuditStatus.ReportAuditReject ||
                            audit_status ===
                                DataAnalAuditStatus.ReportAuditUndone
                        ) {
                            return userInfo.ID === record.created_by
                                ? [
                                      TabOperate.Detail,
                                      TabOperate.Edit,
                                      TabOperate.Delete,
                                  ]
                                : [TabOperate.Detail]
                        }
                        if (
                            audit_status === DataAnalAuditStatus.ReportAuditing
                        ) {
                            return [TabOperate.Detail, TabOperate.Cancel]
                        }
                        return defaultOperates
                    },
                    // 分析成果待编目
                    [DataAnalRequireStatus.CatalogPending]: () =>
                        isPersonalCenter
                            ? [TabOperate.Detail, TabOperate.Catalog]
                            : defaultOperates,
                    // // 分析成果待出库
                    [DataAnalRequireStatus.OutboundPending]: () => {
                        if (
                            ![
                                DataAnalAuditStatus.OutboundAuditing,
                                DataAnalAuditStatus.OutboundAuditReject,
                            ].includes(audit_status) &&
                            isPersonalCenter
                        ) {
                            return [TabOperate.Detail, TabOperate.OutboundApply]
                        }
                        return defaultOperates
                    },
                    // 分析结论不可行
                    [DataAnalRequireStatus.AnalysisUnfeasible]: () => [
                        TabOperate.Detail,
                        TabOperate.Close,
                    ],
                    // 成效反馈审核不通过
                    [DataAnalRequireStatus.Closed]: () => {
                        if (
                            isPersonalCenter &&
                            // 成效反馈审核失败&&成效反馈中
                            ((audit_status ===
                                DataAnalAuditStatus.FeedbackAuditReject &&
                                feedback_status ===
                                    FeedbackStatusEnum.FEEDBACKING) ||
                                // 待成效反馈
                                feedback_status === FeedbackStatusEnum.PENDING)
                        ) {
                            return [TabOperate.Detail, TabOperate.Feedback]
                        }
                        return defaultOperates
                    },
                },

                // 分析完善
                [DataAnalysisTab.AnalysisImprove]: {
                    // 分析待签收
                    [DataAnalRequireStatus.AnalysisSigningOff]: () => [
                        TabOperate.Detail,
                        TabOperate.AnalysisSign,
                    ],
                    // 待分析
                    [DataAnalRequireStatus.AnalysisPending]: () =>
                        // 分析签收人与当前用户不一致 不能进行取消签收 和 分析操作
                        analyser_id !== userInfo.ID
                            ? [TabOperate.Detail]
                            : [
                                  TabOperate.Detail,
                                  TabOperate.Analysis,
                                  TabOperate.CancelAnalysisSign,
                              ],
                    // 分析中
                    [DataAnalRequireStatus.Analysing]: () => {
                        if (!audit_status) {
                            return [TabOperate.Detail, TabOperate.EditAnalysis]
                        }
                        if (
                            audit_status ===
                            DataAnalAuditStatus.AnalysisAuditReject
                        ) {
                            return [TabOperate.Detail, TabOperate.ReAnalysis]
                        }
                        return defaultOperates
                    },
                },

                // 数据资源实施
                [DataAnalysisTab.ImplementData]: {
                    // 实施待签收
                    [DataAnalRequireStatus.ImplementSigningOff]: () => [
                        TabOperate.Detail,
                        TabOperate.ImplementSign,
                    ],
                    // 待实施
                    [DataAnalRequireStatus.ImplementPending]: () =>
                        implementer_id !== userInfo.ID
                            ? [TabOperate.Detail]
                            : [
                                  TabOperate.Detail,
                                  TabOperate.Implement,
                                  TabOperate.CancelImplementSign,
                              ],
                    // 实施中
                    [DataAnalRequireStatus.Implementing]: () =>
                        audit_status ===
                        DataAnalAuditStatus.ImplementConfirmReject
                            ? [TabOperate.Detail, TabOperate.Implement]
                            : [TabOperate.Detail],
                },
            }

            return tabStatusMap[tab]?.[status]?.() || defaultOperates
        }

        // 获取最终的操作项keys
        const finalOperateKeys = getStatusOperates()

        // 从 allOptionMenus 中过滤出对应的操作项
        return [
            ...allOptionMenus.filter((item) =>
                finalOperateKeys.includes(item.key),
            ),
        ]
    }

    const columns: any = useMemo(() => {
        const cols = [
            {
                title: __('需求名称（编码）'),
                dataIndex: 'name',
                key: 'name',
                ellipsis: true,
                width: 260,
                render: (value, record) => (
                    <MultiColumn
                        record={record}
                        onClick={() =>
                            handleOptionTable(TabOperate.Detail, record)
                        }
                    />
                ),
            },
            {
                title: __('状态'),
                dataIndex: 'status',
                key: 'status',
                ellipsis: true,
                render: (value, record) => {
                    return <StatusView record={record} />
                },
            },
            {
                title: __('申请部门'),
                dataIndex: 'apply_org_name',
                key: 'apply_org_name',
                ellipsis: true,
                render: (value, record) => (
                    <span title={record.apply_org_path}>{value}</span>
                ),
            },
            {
                title: (
                    <SubTitle
                        title={__('需求联系人')}
                        subTitle={__('（联系电话）')}
                    />
                ),
                dataIndex: 'contact',
                key: 'contact',
                ellipsis: true,
                render: (value, record) => <ContactView data={record} />,
            },
            {
                title: (
                    <SubTitle
                        title={__('需求联系人')}
                        subTitle={__('（联系电话）')}
                    />
                ),
                dataIndex: 'applier',
                key: 'applier',
                ellipsis: true,
                render: (value, record) => (
                    <ContactView
                        data={{ contact: value, contact_phone: record.phone }}
                    />
                ),
            },
            {
                title: __('委托方式'),
                dataIndex: 'commission_type',
                key: 'commission_type',
                ellipsis: true,
                render: (value, record) =>
                    commissionTypeMap[value]?.text || '--',
            },
            {
                title: __('分析成果数量'),
                dataIndex: 'output_item_num',
                key: 'output_item_num',
            },
            {
                title: __('申请时间'),
                dataIndex: 'created_at',
                key: 'created_at',
                sorter: !!tabMap[tab].defaultTableSort,
                sortOrder: tableSort?.created_at,
                showSorterTooltip: false,
                sortDirections: ['descend', 'ascend', 'descend'],
                width: 180,
                ellipsis: true,
                render: (val: number) => (val ? formatTime(val) : '--'),
            },
            {
                title: __('期望完成时间'),
                dataIndex: 'finish_date',
                key: 'finish_date',
                sorter: !!tabMap[tab].defaultTableSort,
                sortOrder: tableSort?.finish_date,
                showSorterTooltip: false,
                sortDirections: ['descend', 'ascend', 'descend'],
                width: 160,
                ellipsis: true,
                render: (val: number, record) =>
                    val ? formatTime(val, 'YYYY-MM-DD') : '--',
            },
            {
                title: __('反馈内容'),
                dataIndex: 'feedback_content',
                key: 'feedback_content',
                ellipsis: true,
                render: (value, record) => value || '--',
            },
            {
                title: __('反馈时间'),
                dataIndex: 'feedback_at',
                key: 'feedback_at',
                sorter: !!tabMap[tab].defaultTableSort,
                sortOrder: tableSort?.feedback_at,
                showSorterTooltip: false,
                sortDirections: ['descend', 'ascend', 'descend'],
                width: 160,
                ellipsis: true,
                render: (val: number, record) =>
                    val ? formatTime(val, 'YYYY-MM-DD') : '--',
            },
            {
                title: __('操作'),
                key: 'action',
                width: tabMap[tab].actionWidth,
                fixed: 'right',
                render: (_, record) => {
                    return (
                        <OptionBarTool
                            menus={getOperateOptions(record) as any[]}
                            onClick={(key, e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleOptionTable(key, record)
                            }}
                        />
                    )
                },
            },
        ]

        // 根据 columnKeys 的顺序过滤和排序列
        return (
            Array.isArray(tabMap[tab].columnKeys)
                ? tabMap[tab].columnKeys
                : tabMap[tab].columnKeys(feedbackActiveTab)
        )
            .map((key) => cols.find((col) => col.key === key))
            .filter(Boolean)
    }, [tab, tableSort, searchCondition])

    // 表格排序改变
    const handleTableChange = (sorter) => {
        if (sorter.column) {
            if (sorter.columnKey === 'created_at') {
                setTableSort({
                    created_at: sorter.order || 'ascend',
                    finish_date: null,
                })
            } else if (sorter.columnKey === 'finish_date') {
                setTableSort({
                    created_at: null,
                    finish_date: sorter.order || 'ascend',
                })
            } else if (sorter.columnKey === 'feedback_at') {
                setTableSort({
                    created_at: null,
                    finish_date: null,
                    feedback_at: sorter.order || 'ascend',
                })
            }
            return {
                key: sorter.columnKey,
                sort:
                    sorter.order === 'ascend'
                        ? SortDirection.ASC
                        : SortDirection.DESC,
            }
        }
        if (searchCondition.sort === 'created_at') {
            setTableSort({
                created_at:
                    searchCondition.direction === SortDirection.ASC
                        ? 'descend'
                        : 'ascend',
                finish_date: null,
            })
        } else if (searchCondition.sort === 'finish_date') {
            setTableSort({
                created_at: null,
                finish_date:
                    searchCondition.direction === SortDirection.ASC
                        ? 'descend'
                        : 'ascend',
            })
        } else if (searchCondition.sort === 'feedback_at') {
            setTableSort({
                created_at: null,
                finish_date: null,
                feedback_at:
                    searchCondition.direction === SortDirection.ASC
                        ? 'descend'
                        : 'ascend',
            })
        } else {
            setTableSort({
                finish_date: null,
                feedback_at: null,
                created_at:
                    searchCondition.direction === SortDirection.ASC
                        ? 'descend'
                        : 'ascend',
            })
        }
        return {
            key: searchCondition.sort,
            sort:
                searchCondition.direction === SortDirection.ASC
                    ? SortDirection.DESC
                    : SortDirection.ASC,
        }
    }

    // 表格排序改变
    const onTableChange = (currentPagination, filters, sorter, extra) => {
        if (extra.action === 'sort' && !!sorter.column) {
            const selectedMenu = handleTableChange(sorter)
            setSearchCondition((prev) => ({
                ...prev,
                sort: selectedMenu.key,
                direction: selectedMenu.sort,
                offset: 1,
            }))
        }
    }

    // 分页改变
    const onPaginationChange = (page, pageSize) => {
        setSearchCondition((prev) => ({
            ...prev,
            offset: page,
            limit: pageSize,
        }))
    }

    // 筛选展开状态
    const handleExpansionStatus = (status: boolean) => {
        // 使用 requestAnimationFrame 延迟高度更新
        requestAnimationFrame(() => {
            setScrollY(
                status ? `calc(100vh - 479px)` : tabMap[tab].defaultScrollY,
            )
        })
    }

    // 切换左侧的状态状态栏
    const handleStatusChange = (status: DataAnalRequireStatus) => {
        setSearchCondition((prev) => ({
            ...prev,
            status,
            offset: 1,
        }))
        setSelectStatus(status)
    }

    // 运营人员切换是否只看我的
    const handleMyApply = (e) => {
        setSearchCondition((prev) => ({
            ...prev,
            only_mine: e.target.checked,
            offset: 1,
        }))
    }

    // 顶部左侧操作
    const getPrefixNode = () => {
        switch (tab) {
            case DataAnalysisTab.Apply:
                return (
                    <Space size={16}>
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => {
                                if (isPersonalCenter) {
                                    jumpToPage(
                                        '/dataAnalysis/apply?back=person-center',
                                    )
                                } else {
                                    jumpToPage('/dataAnalysis/apply')
                                }
                            }}
                        >
                            {__('需求申报')}
                        </Button>
                        <Checkbox onChange={handleMyApply}>
                            {__('只看我的需求')}
                        </Checkbox>
                    </Space>
                )
            case DataAnalysisTab.AnalysisImprove:
            case DataAnalysisTab.ImplementData:
            case DataAnalysisTab.ImplementResult:
                if (tabMap[tab].statusOption?.length > 0) {
                    return (
                        <StatusFilter
                            statusOptions={tabMap[tab].statusOption}
                            selectStatus={selectStatus}
                            onStatusChange={handleStatusChange}
                        />
                    )
                }
                return null
            case DataAnalysisTab.ResultOutbound:
                return (
                    <StatusFilter
                        statusOptions={tabMap[tab].statusOption}
                        selectStatus={searchCondition.status}
                        onStatusChange={handleStatusChange}
                    />
                )
            case DataAnalysisTab.AnalysisConfirm:
                return __('待确认')
            case DataAnalysisTab.StartFeedback:
                return feedbackActiveTab === FeedbackTargetEnum.StartPending ? (
                    <Button
                        icon={<PlusOutlined />}
                        type="primary"
                        disabled={selectedColumns.length === 0}
                        onClick={() => setShowStartFeedback(true)}
                    >
                        {__('发起成效反馈')}
                    </Button>
                ) : (
                    <StatusFilter
                        statusOptions={tabMap[tab].statusOption}
                        selectStatus={searchCondition.feedback_status}
                        onStatusChange={(status) =>
                            setSearchCondition((prev) => ({
                                ...prev,
                                offset: 1,
                                feedback_status: status,
                            }))
                        }
                    />
                )

            case DataAnalysisTab.HandleFeedback:
                return (
                    <StatusFilter
                        statusOptions={tabMap[tab].statusOption}
                        selectStatus={searchCondition.feedback_status}
                        onStatusChange={(status) =>
                            setSearchCondition((prev) => ({
                                ...prev,
                                offset: 1,
                                feedback_status: status,
                            }))
                        }
                        showCount
                    />
                )
            case DataAnalysisTab.AuditFeedback:
                return (
                    <div className={styles['audit-feedback-title']}>
                        {__('待审核成效反馈列表')}
                    </div>
                )
            default:
                return null
        }
    }

    // 添加防抖处理
    const handleSearch = debounce((values: any) => {
        const obj = timeStrToTimestamp(values)
        const params = {
            ...searchCondition,
            ...obj,
            offset: 1,
        }

        setSearchCondition(params)
    }, 300)

    // 获取顶部操作区域
    const getTopOperate = () => {
        if (
            [
                DataAnalysisTab.AuditDeclare,
                DataAnalysisTab.AuditAnalysis,
                DataAnalysisTab.AuditFeedback,
                DataAnalysisTab.AuditOutbound,
            ].includes(tab as DataAnalysisTab)
        ) {
            return (
                <div className={styles.top}>
                    <div className={styles['leftOperate-title']}>
                        {leftMenuItems.find((item) => item.key === tab)?.title}
                    </div>
                    <div>
                        <Space size={8}>
                            {tabMap[tab].searchPlaceholder && (
                                <SearchInput
                                    value={searchCondition?.keyword}
                                    style={{ width: 280 }}
                                    placeholder={tabMap[tab].searchPlaceholder}
                                    onKeyChange={(kw: string) => {
                                        if (kw === searchCondition?.keyword)
                                            return
                                        setSearchCondition((prev) => ({
                                            ...prev,
                                            keyword: kw,
                                            offset: 1,
                                        }))
                                    }}
                                />
                            )}

                            {tabMap[tab].refresh && (
                                <RefreshBtn onClick={() => handleRefresh()} />
                            )}
                        </Space>
                    </div>
                </div>
            )
        }

        return (
            <>
                {!isPersonalCenter &&
                    ![
                        DataAnalysisTab.StartFeedback,
                        DataAnalysisTab.AuditFeedback,
                    ].includes(tab as DataAnalysisTab) && (
                        <div className={styles['sort-title']}>
                            {
                                leftMenuItems.find((item) => item.key === tab)
                                    ?.title
                            }
                        </div>
                    )}
                <SearchLayout
                    ref={searchFormRef}
                    formData={recordSearchFilter({
                        filterKeys: tabMap[tab].filterKeys,
                        customProps: tabMap[tab].customProps,
                        placeholder: tabMap[tab].placeholder,
                    })}
                    prefixNode={getPrefixNode()}
                    onSearch={handleSearch}
                    getExpansionStatus={handleExpansionStatus}
                />
            </>
        )
    }

    const rowSelection: any = {
        type: 'checkbox',
        selectedRowKeys,
        onChange: (selRowKeys: React.Key[], selectedRows: any[]) => {
            const newSelectedRowKeys = selectedRowKeys.filter(
                (key) => !tableData.find((item) => item.id === key),
            )
            const newSelectedColumns = selectedColumns.filter(
                (item) => !tableData.find((d) => d.id === item.id),
            )
            setSelectedRowKeys([...newSelectedRowKeys, ...selRowKeys])
            setSelectedColumns([...newSelectedColumns, ...selectedRows])
        },
    }

    return (
        <div className={classnames(styles.dataAnalysisTable)}>
            {tab === DataAnalysisTab.StartFeedback && (
                <Tabs
                    items={[
                        {
                            label: __('待发起反馈'),
                            key: FeedbackTargetEnum.StartPending,
                        },
                        {
                            label: __('已发起反馈'),
                            key: FeedbackTargetEnum.Started,
                        },
                    ]}
                    activeKey={feedbackActiveTab}
                    onChange={(key) => {
                        setFeedbackActiveTab(key as FeedbackTargetEnum)
                        setSearchCondition((prev) => ({
                            ...prev,
                            target: key,
                        }))
                    }}
                />
            )}
            {loading ? (
                renderLoader()
            ) : (
                <>
                    {getTopOperate()}
                    {tableData.length === 0 && !isSearchStatus ? (
                        renderEmpty()
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            loading={fetching}
                            rowKey="id"
                            rowClassName={styles.tableRow}
                            onChange={onTableChange}
                            rowSelection={
                                tab === DataAnalysisTab.StartFeedback &&
                                feedbackActiveTab ===
                                    FeedbackTargetEnum.StartPending
                                    ? rowSelection
                                    : null
                            }
                            scroll={{
                                x: columns.length * 182,
                                y: scrollY,
                            }}
                            pagination={{
                                total,
                                pageSize: searchCondition?.limit,
                                current: searchCondition?.offset,
                                showQuickJumper: true,
                                onChange: (page, pageSize) =>
                                    onPaginationChange(page, pageSize),
                                showSizeChanger: true,
                                showTotal: (count) =>
                                    __('共${count}条', { count }),
                            }}
                            locale={{ emptyText: <Empty /> }}
                        />
                    )}
                </>
            )}
            {showAnalysis && (
                <Analysis
                    open={showAnalysis}
                    applyId={operateItem?.id}
                    onClose={() => {
                        setShowAnalysis(false)
                        rewriteUrl(changeUrlData({}, ['operate', 'applyId']))
                        handleRefresh()
                    }}
                />
            )}
            {showConclusionConfirm && (
                <ConclusionConfirm
                    applyId={operateItem?.id}
                    open={showConclusionConfirm}
                    onClose={() => setShowConclusionConfirm(false)}
                    onOk={() => handleRefresh()}
                />
            )}
            {showDetails && (
                <Details
                    open={showDetails}
                    applyId={operateItem?.id}
                    onClose={() => {
                        setShowDetails(false)
                        rewriteUrl(changeUrlData({}, ['operate', 'applyId']))
                        handleRefresh()
                    }}
                    tab={tab as DataAnalysisTab}
                />
            )}
            {showImplement && (
                <Implement
                    open={showImplement}
                    applyId={operateItem?.id}
                    onClose={() => {
                        setShowImplement(false)
                        rewriteUrl(changeUrlData({}, ['operate', 'applyId']))
                        handleRefresh()
                    }}
                />
            )}
            {showImplementConfirm && (
                <ResultConfirm
                    applyId={operateItem?.id}
                    open={showImplementConfirm}
                    onClose={() => {
                        setShowImplementConfirm(false)
                        handleRefresh()
                    }}
                />
            )}
            {cancelOpen && (
                <Revocate
                    open={cancelOpen}
                    onClose={() => setCancelOpen(false)}
                    applyId={operateItem?.id}
                    onOk={() => handleRefresh()}
                />
            )}
            {applyAuditOpen && (
                <ApplyAudit
                    auditItem={operateItem}
                    open={applyAuditOpen}
                    onClose={() => setApplyAuditOpen(false)}
                    onOk={() => handleRefresh()}
                />
            )}
            {analysisAuditOpen && (
                <AnalysisAudit
                    auditItem={operateItem}
                    open={analysisAuditOpen}
                    onClose={() => setAnalysisAuditOpen(false)}
                    onOk={() => handleRefresh()}
                />
            )}
            {showStartFeedback && (
                <StartFeedback
                    data={selectedColumns}
                    open={showStartFeedback}
                    onClose={() => setShowStartFeedback(false)}
                    onOk={() => {
                        handleRefresh()
                        setSelectedRowKeys([])
                        setSelectedColumns([])
                    }}
                />
            )}
            {showFeedback && (
                <Feedback
                    open={showFeedback}
                    onClose={() => setShowFeedback(false)}
                    applyId={operateItem?.id}
                    onOk={() => {
                        handleRefresh()
                    }}
                />
            )}
            {feedbackAuditOpen && (
                <FeedbackAudit
                    open={feedbackAuditOpen}
                    onClose={() => setFeedbackAuditOpen(false)}
                    auditItem={operateItem}
                    onOk={() => handleRefresh()}
                />
            )}
            {outboundApplyOpen && (
                <ApplyOutbound
                    open={outboundApplyOpen}
                    onClose={() => setOutboundApplyOpen(false)}
                    applyId={operateItem?.id}
                    onOk={() => handleRefresh()}
                />
            )}
            {pushConfirmOpen && (
                <PushConfirm
                    open={pushConfirmOpen}
                    onClose={() => setPushConfirmOpen(false)}
                    applyId={operateItem?.id}
                    onOk={() => handleRefresh()}
                />
            )}
            {outboundAuditOpen && (
                <OutboundAudit
                    open={outboundAuditOpen}
                    onClose={() => setOutboundAuditOpen(false)}
                    auditItem={operateItem}
                    onOk={() => handleRefresh()}
                />
            )}
        </div>
    )
}

export default ApplyTable
