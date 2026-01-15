import {
    Space,
    Table,
    Button,
    Checkbox,
    Modal,
    message,
    Tooltip,
    Row,
    Col,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useUpdateEffect } from 'ahooks'
import classnames from 'classnames'
import { omit, debounce } from 'lodash'
import { useNavigate } from 'react-router-dom'
import __ from './locale'
import {
    leftMenuItems,
    TabOperate,
    SandboxTab,
    tabMap,
    recordSearchFilter,
    allOptionMenus,
    defaultMenu,
    menus,
    ShowModeEnum,
    SandboxAuditStatus,
    SandboxImpTypeEnum,
} from './const'
import styles from './styles.module.less'
import { Empty, LightweightSearch, OptionBarTool, SearchInput } from '@/ui'
import {
    SortDirection,
    formatError,
    getSandboxApplyList,
    SandboxCreateTypeEnum,
    SandboxExecuteTypeEnum,
    SandboxStatus,
    getSandboxAuditList,
    getSandboxImplementList,
    getSandboxLogList,
    getSandboxSpaceList,
    revocateSandboxApply,
    getDataPushMonitorList,
} from '@/core'
import { formatTime, rewriteUrl, useQuery } from '@/utils'
import { RefreshBtn, SortBtn } from '../ToolbarComponents'
import {
    StatusView,
    renderEmpty,
    renderLoader,
    StatusFilter,
    timeStrToTimestamp,
    AuditStatusTag,
} from './helper'
import SearchLayout from '../SearchLayout'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { changeUrlData } from '../CitySharing/helper'
import Details from './Details'
import Revocate from './Revocate'
import ApplyAudit from './Audit/ApplyAudit'
import ApplyModal from './Apply/ApplyModal'
import ExpandCapacity from './Apply/ExpandCapacity'
import ImplementInfoModal from './Implement/ImplementInfoModal'
import { IconType } from '@/icons/const'
import { FontIcon } from '@/icons'
import DropDownFilter from '../DropDownFilter'
import InfoCard from './InfoCard'
import dataEmpty from '@/assets/dataEmpty.svg'
import FinishModal from './Implement/FinishModal'
import { StatusDot } from '../DataPush/helper'
import { jobStatusMap } from '../DataPush/const'

interface IApplyTable {
    tab: string
}

const ApplyTable: React.FC<IApplyTable> = ({ tab }) => {
    const navigate = useNavigate()
    // 搜索条件
    const [searchCondition, setSearchCondition] = useState<any>()
    // 表头排序
    const [tableSort, setTableSort] = useState<any>(
        tabMap[tab].defaultTableSort,
    )
    // tabMap[tab].defaultMenu
    const [selectedSort, setSelectedSort] = useState<any>()

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
    const [selectStatus, setSelectStatus] = useState<SandboxStatus>(
        SandboxStatus.All,
    )
    // 表格高度
    const [scrollY, setScrollY] = useState<string>(
        tabMap[tab].defaultScrollY || `calc(100vh - 227px)`,
    )
    const searchFormRef: any = useRef()
    // 假设从上下文或props中获取用户角色
    const [userInfo] = useCurrentUser()
    const [showDetails, setShowDetails] = useState(false)
    const [showImplement, setShowImplement] = useState(false)
    const [showImpFinish, setShowImpFinish] = useState(false)
    const [cancelOpen, setCancelOpen] = useState(false)
    const [applyAuditOpen, setApplyAuditOpen] = useState(false)
    const [applyOpen, setApplyOpen] = useState(false)
    const [expandOpen, setExpandOpen] = useState(false)
    const [showMode, setShowMode] = useState<ShowModeEnum>(ShowModeEnum.Table)

    useEffect(() => {
        const config = tabMap[tab]
        const initSearch = config?.initSearch || {
            limit: 10,
            offset: 1,
            sort: 'apply_time',
            direction: 'desc',
        }
        setSearchCondition(initSearch)
        // setSelectedSort(tabMap[tab].defaultMenu)
        setTableSort(tabMap[tab].defaultTableSort)
        setShowMode(ShowModeEnum.Table)
        setSelectStatus(SandboxStatus.All)
    }, [tab])

    // 是否有过滤值
    const isSearchStatus = useMemo(() => {
        const ignoreAttr = ['offset', 'limit', 'sort', 'direction', 'target']
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
                case SandboxTab.Apply:
                    res = await getSandboxApplyList(params)
                    break
                case SandboxTab.Audit:
                    res = await getSandboxAuditList(params)
                    break

                case SandboxTab.Implement:
                    res = await getSandboxImplementList(params)
                    break

                case SandboxTab.Log:
                    // res = await getSandboxLogList(params)
                    res = await getDataPushMonitorList({
                        ...params,
                        with_sandbox_info: true,
                    })
                    break
                case SandboxTab.Space:
                    res = await getSandboxSpaceList(params)
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
            setSelectedSort(undefined)
        }
    }

    // 刷新
    const handleRefresh = (refresh: boolean = true) => {
        setSearchCondition((prevCondition) => ({
            ...prevCondition,
            offset: refresh ? 1 : prevCondition.offset,
        }))
    }

    const revocate = async (record) => {
        try {
            await revocateSandboxApply({ id: record.apply_id })
            message.success(__('撤回成功'))
            handleRefresh()
        } catch (error) {
            formatError(error)
        }
    }

    // 表格操作事件
    const handleOptionTable = (key: string, record) => {
        setOperateItem(record)
        switch (key) {
            case TabOperate.Detail:
                rewriteUrl(
                    changeUrlData({
                        operate: TabOperate.Detail,
                        applyId: record.sandbox_id,
                        tab,
                    }),
                )
                setShowDetails(true)
                break

            case TabOperate.Implement:
                setShowImplement(true)
                break
            case TabOperate.Finish:
                setShowImpFinish(true)
                break
            case TabOperate.Cancel:
                // setCancelOpen(true)
                revocate(record)
                break
            case TabOperate.ApplyAudit:
                setApplyAuditOpen(true)
                break
            case TabOperate.ReApply:
                if (record.operation === SandboxCreateTypeEnum.Apply) {
                    setApplyOpen(true)
                } else {
                    setExpandOpen(true)
                }
                break
            case TabOperate.ExpandApply:
                setExpandOpen(true)
                break
            default:
                break
        }
    }

    // 获取操作选项
    const getOperateOptions = (record: any): any[] => {
        // 获取当前 tab 的默认操作
        const defaultOperates = {
            [SandboxTab.Apply]: [TabOperate.Detail],
            [SandboxTab.Space]: [TabOperate.Detail],
            [SandboxTab.Log]: [TabOperate.Detail],
            [SandboxTab.Implement]: [TabOperate.Detail],
            [SandboxTab.Audit]: [TabOperate.ApplyAudit],
        }[tab] || [TabOperate.Detail]

        // 获取状态相关的操作规则
        const getStatusOperates = () => {
            const { sandbox_status, audit_state, execute_status, operation } =
                record

            // 根据不同的tab页返回对应的状态操作映射
            const tabStatusMap = {
                [SandboxTab.Apply]: {
                    [SandboxStatus.Applying]: () => {
                        if (audit_state === SandboxAuditStatus.Reject) {
                            return [TabOperate.Detail, TabOperate.ReApply]
                        }
                        if (audit_state === SandboxAuditStatus.Auditing) {
                            return [TabOperate.Detail, TabOperate.Cancel]
                        }
                        return defaultOperates
                    },
                    [SandboxStatus.Implemented]: () => {
                        return [TabOperate.Detail, TabOperate.ExpandApply]
                    },
                    [SandboxStatus.Undone]: () => {
                        if (operation === SandboxCreateTypeEnum.Apply) {
                            return [TabOperate.Detail, TabOperate.ReApply]
                        }
                        return [TabOperate.Detail, TabOperate.ExpandApply]
                    },
                },

                // 数据资源实施
                [SandboxTab.Implement]: {
                    // 待实施
                    [SandboxStatus.ImplementPending]: () => [
                        TabOperate.Detail,
                        TabOperate.Implement,
                    ],
                    // 实施中
                    [SandboxStatus.Implementing]: () => [
                        TabOperate.Detail,
                        TabOperate.Finish,
                    ],
                    // 已实施
                    [SandboxStatus.Implemented]: () => [TabOperate.Detail],
                },
            }

            return (
                tabStatusMap[tab]?.[sandbox_status || execute_status]?.() ||
                defaultOperates
            )
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
        const sortableColumn = (dataIndex: string) => ({
            sorter: true,
            sortOrder: tableSort?.[dataIndex],
            showSorterTooltip: false,
            sortDirections: ['descend', 'ascend', 'descend'],
        })
        const sortProject = [
            SandboxTab.Apply,
            SandboxTab.Implement,
            SandboxTab.Space,
        ].includes(tab as SandboxTab)
            ? sortableColumn('project_name')
            : {}
        const sortApplyTime =
            tab === SandboxTab.Audit ? {} : sortableColumn('apply_time')
        const cols = [
            {
                title: __('数据集名称'),
                dataIndex: 'target_table_name',
                key: 'target_table_name',
                ellipsis: true,
                width: 260,
                // ...sortableColumn('target_table_name'),
            },
            {
                title: tab === SandboxTab.Log ? __('所属项目') : __('项目名称'),
                dataIndex:
                    tab === SandboxTab.Log
                        ? 'sandbox_project_name'
                        : 'project_name',
                key:
                    tab === SandboxTab.Log
                        ? 'sandbox_project_name'
                        : 'project_name',
                ellipsis: true,
                width: 260,
                ...sortProject,
                render: (val, record) => (
                    <div className={styles['table-project-name-container']}>
                        <div className={styles['project-name']} title={val}>
                            {val}
                        </div>
                        {tab === SandboxTab.Apply &&
                            [
                                SandboxAuditStatus.Auditing,
                                SandboxAuditStatus.Reject,
                            ].includes(record.audit_state) && (
                                <AuditStatusTag
                                    auditStatus={record.audit_state}
                                    reason={record.audit_advice}
                                />
                            )}
                    </div>
                ),
            },
            {
                title: __('操作人'),
                dataIndex: 'creator_name',
                key: 'creator_name',
                ellipsis: true,
            },
            {
                title: __('状态'),
                dataIndex: 'task_log_status',
                key: 'task_log_status',
                render: (value, record) => (
                    <StatusDot data={jobStatusMap[record.status]} />
                ),
            },
            {
                title: __('审核类型'),
                dataIndex: 'audit_type',
                key: 'audit_type',
                render: (val, record) =>
                    record.operation === SandboxCreateTypeEnum.Apply
                        ? __('沙箱申请')
                        : __('扩容申请'),
            },
            {
                title: __('实施类型'),
                dataIndex: 'operation',
                key: 'operation',
                render: (val) =>
                    val === SandboxCreateTypeEnum.Apply
                        ? __('沙箱申请')
                        : __('扩容申请'),
            },
            {
                title: __('实施方式'),
                dataIndex: 'execute_type',
                key: 'execute_type',
                render: (val) =>
                    val === SandboxExecuteTypeEnum.Online
                        ? __('线上')
                        : __('线下'),
            },
            {
                title: __('实施人'),
                dataIndex: 'executor_name',
                key: 'executor_name',
            },
            {
                title: __('实施阶段'),
                dataIndex: 'execute_status',
                key: 'execute_status',
                render: (value, record) => {
                    return (
                        <StatusView
                            record={record}
                            field="execute_status"
                            tab={tab as SandboxTab}
                        />
                    )
                },
            },
            {
                title: __('完成时间'),
                dataIndex: 'executed_time',
                key: 'executed_time',
                ...sortableColumn('executed_time'),
                width: 180,
                ellipsis: true,
                render: (val: number) => (val ? formatTime(val) : '--'),
            },
            {
                title: __('已用空间'),
                dataIndex: 'used_space',
                key: 'used_space',
                render: (val) => (val === 0 ? 0 : val ? `${val}G` : '--'),
            },
            {
                title: __('剩余空间'),
                dataIndex: 'free_space',
                key: 'free_space',
                render: (val, record) =>
                    record.total_space
                        ? `${record.total_space - (record.used_space || 0)}G`
                        : '--',
            },
            {
                title: __('总空间'),
                dataIndex: 'total_space',
                key: 'total_space',
                render: (val) => (val ? `${val}G` : '--'),
            },
            {
                title: __('已增加容量'),
                dataIndex: 'in_apply_space',
                key: 'in_apply_space',
                render: (val) => (val ? `${val}G` : '--'),
            },
            {
                title: __('数据集数'),
                dataIndex: 'data_set_number',
                key: 'data_set_number',
            },
            {
                title: __('状态'),
                dataIndex: 'sandbox_status',
                key: 'sandbox_status',
                ellipsis: true,
                render: (value, record) => {
                    return <StatusView record={record} />
                },
            },
            {
                title: __('执行方式'),
                dataIndex: 'sync_method',
                key: 'sync_method',
            },
            {
                title: __('推送总数'),
                dataIndex: 'sync_count',
                key: 'sync_count',
            },
            {
                title: __('推送成功数'),
                dataIndex: 'sync_success_count',
                key: 'sync_success_count',
            },
            {
                title: __('耗时'),
                dataIndex: 'sync_time',
                key: 'sync_time',
                render: (val) => (val === 0 ? 0 : `${val / 1000}s`),
            },
            {
                title: __('请求时间'),
                dataIndex: 'start_time',
                key: 'start_time',
                ...([SandboxTab.Log].includes(tab as SandboxTab)
                    ? {}
                    : sortableColumn('start_time')),
                ellipsis: true,
                render: (val: number) => (val ? formatTime(val) : '--'),
            },
            // 日志中的完成时间
            {
                title: __('完成时间'),
                dataIndex: 'end_time',
                key: 'end_time',
                // ...sortableColumn('end_time'),
                ellipsis: true,
                render: (val: number) => (val ? formatTime(val) : '--'),
            },
            {
                title: __('所属组织架构'),
                dataIndex: 'department_name',
                key: 'department_name',
                ellipsis: true,
            },
            {
                title: (
                    <div className={styles['applier-title']}>
                        {__('申请人')}
                        <span className={styles.phone}>
                            {__('（联系电话）')}
                        </span>
                    </div>
                ),
                dataIndex: 'applicant_name',
                key: 'applicant_name',
                ellipsis: true,
                width: 180,
                render: (val, record) => (
                    <div className={styles['applier-info']}>
                        <div
                            className={styles.name}
                            title={record.applicant_name}
                        >
                            {record.applicant_name}
                        </div>
                        <div
                            className={styles.phone}
                            title={record.applicant_phone}
                        >
                            {record.applicant_phone}
                        </div>
                    </div>
                ),
            },
            {
                title: __('项目成员'),
                dataIndex: 'project_member_name',
                key: 'project_member_name',
                ellipsis: true,
                render: (members: string[]) =>
                    Array.isArray(members) ? members.join('、') : '--',
            },
            {
                title: __('申请时间'),
                dataIndex: 'apply_time',
                key: 'apply_time',
                // ...sortableColumn('apply_time'),
                ...sortApplyTime,
                width: 180,
                ellipsis: true,
                render: (val: number) => (val ? formatTime(val) : '--'),
            },
            {
                title: __('更新时间'),
                dataIndex: 'updated_at',
                key: 'updated_at',
                ...sortableColumn('updated_at'),
                width: 180,
                ellipsis: true,
                render: (val: number) => (val ? formatTime(val) : '--'),
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
        return tabMap[tab].columnKeys
            .map((key) => cols.find((col) => col.key === key))
            .filter(Boolean)
    }, [tab, tableSort])

    // 表格排序改变
    const handleTableChange = (sorter) => {
        if ([SandboxTab.Audit, SandboxTab.Log].includes(tab as SandboxTab)) {
            setTableSort({})
            return {}
        }
        if (sorter.column) {
            setTableSort({
                apply_time: null,
                project_name: null,
                [sorter.columnKey]: sorter.order || 'ascend',
            })
            return {
                key: sorter.columnKey,
                sort:
                    sorter.order === 'ascend'
                        ? SortDirection.ASC
                        : SortDirection.DESC,
            }
        }

        setTableSort({
            apply_time: null,
            project_name: null,
            [sorter.columnKey]:
                searchCondition.direction === SortDirection.ASC
                    ? 'descend'
                    : 'ascend',
        })

        return {
            key: searchCondition.sort,
            sort:
                searchCondition.direction === SortDirection.ASC
                    ? SortDirection.DESC
                    : SortDirection.ASC,
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
    const handleStatusChange = (status: SandboxStatus) => {
        setSearchCondition((prev) => ({
            ...prev,
            execute_status: status,
            offset: 1,
        }))
        setSelectStatus(status)
    }

    // 运营人员切换是否只看我的
    const handleMyApply = (e) => {
        setSearchCondition((prev) => ({
            ...prev,
            only_self: e.target.checked,
            offset: 1,
        }))
    }

    // 顶部左侧操作
    const getPrefixNode = useMemo(() => {
        switch (tab) {
            case SandboxTab.Apply:
                return (
                    <Space size={16}>
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => setApplyOpen(true)}
                        >
                            {__('沙箱申请')}
                        </Button>
                        <Checkbox onChange={handleMyApply}>
                            {__('只看我的需求')}
                        </Checkbox>
                    </Space>
                )
            case SandboxTab.Implement:
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
            default:
                return null
        }
    }, [tab, selectStatus])

    // 筛选顺序变化
    const handleMenuChange = (selectedMenu) => {
        setSearchCondition({
            ...searchCondition,
            sort: selectedMenu.key,
            direction: selectedMenu.sort,
            offset: 1,
        })
        onChangeMenuToTableSort(selectedMenu)
    }

    const onChangeMenuToTableSort = (selectedMenu) => {
        setTableSort({
            project_name: null,
            apply_time: null,
            [selectedMenu.key]:
                selectedMenu.sort === SortDirection.ASC ? 'ascend' : 'descend',
        })
    }

    const getSuffixNode = useMemo(() => {
        switch (tab) {
            case SandboxTab.Space:
                return (
                    <>
                        <div className={styles['mode-container']}>
                            <Tooltip title={__('切换模式')}>
                                <FontIcon
                                    name={
                                        showMode === ShowModeEnum.Table
                                            ? 'icon-tubiaomoshi'
                                            : 'icon-liebiaomoshi'
                                    }
                                    type={IconType.FONTICON}
                                    className={styles['mode-icon']}
                                    onClick={() => {
                                        setShowMode(
                                            showMode === ShowModeEnum.Table
                                                ? ShowModeEnum.Card
                                                : ShowModeEnum.Table,
                                        )
                                        if (showMode === ShowModeEnum.Table) {
                                            setSearchCondition({
                                                ...searchCondition,
                                                sort: 'updated_at',
                                                direction: SortDirection.DESC,
                                                offset: 1,
                                                limit: 1000,
                                            })
                                        } else {
                                            setSearchCondition(
                                                tabMap[tab].initSearch,
                                            )
                                        }
                                    }}
                                />
                            </Tooltip>
                        </div>
                        <SortBtn
                            contentNode={
                                <DropDownFilter
                                    menus={tabMap[tab].defaultMenus}
                                    defaultMenu={tabMap[tab].defaultMenu}
                                    menuChangeCb={handleMenuChange}
                                    changeMenu={selectedSort}
                                />
                            }
                        />
                    </>
                )
            case SandboxTab.Log:
                return null
            default:
                return (
                    <SortBtn
                        contentNode={
                            <DropDownFilter
                                menus={tabMap[tab].defaultMenus}
                                defaultMenu={tabMap[tab].defaultMenu}
                                menuChangeCb={handleMenuChange}
                                changeMenu={selectedSort}
                            />
                        }
                    />
                )
        }
    }, [tab, selectedSort, showMode])

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

    const getFormData = () => {
        return tab === SandboxTab.Implement
            ? selectStatus === SandboxStatus.All
                ? tabMap[tab].searchFormData
                : tabMap[tab].searchFormData1
            : tabMap[tab].searchFormData
    }

    // 获取顶部操作区域
    const getTopOperate = useMemo(() => {
        return (
            <div
                className={
                    [SandboxTab.Audit].includes(tab as SandboxTab)
                        ? styles['title-container']
                        : ''
                }
            >
                <div className={styles['sort-title']}>
                    {leftMenuItems.find((item) => item.key === tab)?.title}
                </div>
                {[
                    SandboxTab.Implement,
                    SandboxTab.Space,
                    SandboxTab.Log,
                ].includes(tab as SandboxTab) && (
                    <div className={styles['operate-container']}>
                        <div>{getPrefixNode}</div>
                        <div className={styles['search-container']}>
                            <SearchInput
                                value={searchCondition?.keyword}
                                style={{ width: 280, marginRight: 8 }}
                                placeholder={
                                    tabMap[tab].searchPlaceholder ||
                                    __('搜索项目名称')
                                }
                                onKeyChange={(kw: string) => {
                                    if (kw === searchCondition?.keyword) return
                                    setSearchCondition((prev) => ({
                                        ...prev,
                                        keyword: kw,
                                        offset: 1,
                                    }))
                                }}
                            />
                            <LightweightSearch
                                //   ref={searchRef}
                                formData={getFormData()}
                                onChange={(data, key) => {
                                    if (!key) {
                                        // 重置
                                        setSearchCondition((prev) => ({
                                            ...prev,
                                            offset: 1,
                                            ...data,
                                            status: undefined,
                                            type: undefined,
                                            execute_type:
                                                prev.execute_type ===
                                                SandboxImpTypeEnum.All
                                                    ? ''
                                                    : undefined,
                                        }))
                                    } else if (key === 'status') {
                                        setSearchCondition((prev) => ({
                                            ...prev,
                                            offset: 1,
                                            ...data,
                                            status: data.status,
                                        }))
                                    } else if (key === 'execute_type') {
                                        setSearchCondition((prev) => ({
                                            ...prev,
                                            offset: 1,
                                            execute_type:
                                                data.execute_type ===
                                                SandboxImpTypeEnum.All
                                                    ? ''
                                                    : data.execute_type,
                                        }))
                                    } else if (key === 'execute_status') {
                                        setSearchCondition((prev) => ({
                                            ...prev,
                                            offset: 1,
                                            ...data,
                                            execute_status:
                                                data.execute_status?.join(','),
                                        }))
                                    } else if (key === 'start_time') {
                                        setSearchCondition((prev) => ({
                                            ...prev,
                                            offset: 1,
                                            ...data,
                                            start_time: data.start_time?.[0]
                                                ? data.start_time[0].valueOf()
                                                : undefined,
                                            end_time: data.start_time?.[1]
                                                ? data.start_time[1].valueOf()
                                                : undefined,
                                        }))
                                    } else if (key === 'updated_at') {
                                        setSearchCondition((prev) => ({
                                            ...prev,
                                            offset: 1,
                                            ...data,
                                            updated_at: undefined,
                                            update_start_time: data
                                                .updated_at?.[0]
                                                ? data.updated_at[0].valueOf()
                                                : undefined,
                                            update_end_time: data
                                                .updated_at?.[1]
                                                ? data.updated_at[1].valueOf()
                                                : undefined,
                                        }))
                                    }
                                }}
                                defaultValue={tabMap[tab].defaultSearch}
                            />
                            {getSuffixNode}
                            <RefreshBtn onClick={() => handleRefresh()} />
                        </div>
                    </div>
                )}
                {[SandboxTab.Audit].includes(tab as SandboxTab) && (
                    <RefreshBtn onClick={() => handleRefresh()} />
                )}
                {[SandboxTab.Apply].includes(tab as SandboxTab) && (
                    <SearchLayout
                        ref={searchFormRef}
                        formData={recordSearchFilter({
                            filterKeys: tabMap[tab].filterKeys,
                            customProps: tabMap[tab].customProps,
                        })}
                        prefixNode={getPrefixNode}
                        suffixNode={getSuffixNode}
                        onSearch={handleSearch}
                        getExpansionStatus={handleExpansionStatus}
                    />
                )}
            </div>
        )
    }, [tab, selectStatus, showMode, searchCondition, selectedSort])

    return (
        <div className={classnames(styles.applyTable)}>
            {loading ? (
                renderLoader()
            ) : (
                <>
                    {getTopOperate}
                    {tableData.length === 0 && !isSearchStatus ? (
                        renderEmpty()
                    ) : showMode === ShowModeEnum.Table ? (
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            loading={fetching}
                            rowKey="id"
                            rowClassName={styles.tableRow}
                            onChange={(newPagination, filters, sorter) => {
                                const selectedMenu = handleTableChange(sorter)
                                setSelectedSort(selectedMenu)
                                setSearchCondition((prev) => ({
                                    ...prev,
                                    sort: selectedMenu.key,
                                    direction: selectedMenu.sort,
                                    offset: newPagination.current,
                                    limit: newPagination.pageSize,
                                }))
                            }}
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
                            locale={{
                                emptyText: isSearchStatus ? (
                                    <Empty />
                                ) : (
                                    <Empty
                                        iconSrc={dataEmpty}
                                        desc={__('暂无数据')}
                                    />
                                ),
                            }}
                        />
                    ) : (
                        <Row gutter={[16, 16]}>
                            {tableData.map((item) => (
                                <Col span={8} key={item.id}>
                                    <InfoCard data={item} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            )}
            {applyOpen && (
                <ApplyModal
                    open={applyOpen}
                    onClose={() => {
                        setApplyOpen(false)
                        setOperateItem(undefined)
                    }}
                    onOk={() => handleRefresh()}
                    data={operateItem}
                />
            )}

            {expandOpen && (
                <ExpandCapacity
                    open={expandOpen}
                    onClose={() => {
                        setExpandOpen(false)
                        setOperateItem(undefined)
                    }}
                    onOk={() => handleRefresh()}
                    data={operateItem}
                />
            )}

            {showDetails && (
                <Details
                    open={showDetails}
                    applyId={operateItem?.apply_id}
                    sandboxId={operateItem?.sandbox_id}
                    excuteId={
                        tab === SandboxTab.Implement ? operateItem.id : ''
                    }
                    tab={tab as SandboxTab}
                    data={operateItem}
                    onClose={() => {
                        setShowDetails(false)
                        rewriteUrl(
                            changeUrlData({}, ['operate', 'applyId', 'tab']),
                        )
                        handleRefresh()
                        setOperateItem(undefined)
                    }}
                />
            )}

            {cancelOpen && (
                <Revocate
                    open={cancelOpen}
                    onClose={() => {
                        setCancelOpen(false)
                        setOperateItem(undefined)
                    }}
                    applyId={operateItem?.sandbox_id}
                    onOk={() => handleRefresh()}
                />
            )}
            {applyAuditOpen && (
                <ApplyAudit
                    auditItem={operateItem}
                    open={applyAuditOpen}
                    onClose={() => {
                        setApplyAuditOpen(false)
                        setOperateItem(undefined)
                    }}
                    onOk={() => handleRefresh()}
                />
            )}
            {showImplement && (
                <ImplementInfoModal
                    open={showImplement}
                    onClose={() => {
                        setShowImplement(false)
                        setOperateItem(undefined)
                    }}
                    onOk={() => handleRefresh()}
                    data={operateItem}
                />
            )}
            {showImpFinish && (
                <FinishModal
                    open={showImpFinish}
                    onClose={() => {
                        setShowImpFinish(false)
                        setOperateItem(undefined)
                    }}
                    onOk={() => handleRefresh()}
                    data={operateItem}
                />
            )}
        </div>
    )
}

export default ApplyTable
