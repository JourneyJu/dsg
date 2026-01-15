import { Button, message, Space, Table, Tooltip } from 'antd'

import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons'
import { useUpdateEffect } from 'ahooks'
import { SortOrder } from 'antd/lib/table/interface'
import { omit, trim } from 'lodash'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import dataEmpty from '@/assets/dataEmpty.svg'
import { getSelectedProcess } from '@/components/AuditPolicy/helper'
import { RefreshBtn } from '@/components/ToolbarComponents'
import {
    deleteDwhDataAuthRequest,
    formatError,
    getDwhDataAuthRequestList,
    getPolicyProcessList,
    revokeDwhDataAuthRequest,
    SortDirection,
} from '@/core'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { Empty, LightweightSearch, Loader, SearchInput } from '@/ui'
import { formatTime } from '@/utils'
import { confirm } from '@/utils/modalHelper'
import __ from '../locale'
import Create from './Create'
import Detail from './Detail'
import { ApplyStatus, formData, statusConfig } from './helper'
import styles from './styles.module.less'

interface IApplyListItem {
    id: string
    application_name: string
    table_name: string
    status: ApplyStatus
    applicant: string
    apply_time: number
    // 保留原始数据以便访问拒绝原因
    statusMessage?: string
}

const AuthApplyList = () => {
    const [createOpen, setCreateOpen] = useState<boolean>(false)
    const [editRecordId, setEditRecordId] = useState<string | null>(null)
    // 初始化 load
    const [loading, setLoading] = useState<boolean>(true)
    // 加载数据 load
    const [fetching, setFetching] = useState<boolean>(false)
    // 表格数据
    const [tableData, setTableData] = useState<IApplyListItem[]>([])
    // 总条数
    const [total, setTotal] = useState<number>(0)
    // 表头排序
    const [tableSort, setTableSort] = useState<{
        [key: string]: SortOrder
    }>({})
    // 搜索条件
    const [searchCondition, setSearchCondition] = useState<any>({
        limit: 10,
        offset: 1,
        status: ApplyStatus.All,
    })
    // 是否配置了审核流程（用于控制新建/编辑按钮的禁用状态）
    const [hasAuditProcess, setHasAuditProcess] = useState<boolean>(false)
    const searchRef = useRef<any>(null)

    // 是否有过滤值
    const isSearchStatus = useMemo(() => {
        const ignoreAttr = ['offset', 'limit', 'sort', 'direction']
        return Object.values(omit(searchCondition, ignoreAttr)).some(
            (item) => item,
        )
    }, [searchCondition])

    const getData = async () => {
        try {
            const auditProcess = await getPolicyProcessList({
                audit_type: 'af-dwh-data-auth-request',
            })
            const auditData = getSelectedProcess(
                auditProcess?.entries,
                'af-dwh-data-auth-request',
            )
            setHasAuditProcess(auditData?.length > 0)
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    // 获取表格数据
    const getTableList = async (params: any) => {
        try {
            setFetching(true)
            // 将status字段映射为phase
            const { status, ...restParams } = params
            const requestParams = {
                ...restParams,
                ...(status && status !== ApplyStatus.All
                    ? { phase: status }
                    : {}),
            }
            const res = await getDwhDataAuthRequestList(requestParams)
            // 映射接口返回的字段到组件使用的字段
            const mappedData: IApplyListItem[] = (res?.entries || []).map(
                (item) => {
                    // 将 undone 和 revoked 状态都映射为 Undone，以便统一处理
                    const phase = item.status?.phase || ''
                    const mappedStatus =
                        phase === 'undone' || phase === 'revoked'
                            ? ApplyStatus.Undone
                            : (phase as ApplyStatus)
                    return {
                        ...item,
                        application_name: item.name,
                        table_name: item.data_business_name,
                        status: mappedStatus,
                        applicant: item.applicant_name,
                        apply_time: item.apply_time || 0,
                        // 保留拒绝原因（从 status.message 或其他字段获取）
                        statusMessage: (item.status as any)?.message || '',
                    }
                },
            )
            setTableData(mappedData)
            setTotal(res?.total_count || 0)
        } catch (error) {
            formatError(error)
        } finally {
            setFetching(false)
            setLoading(false)
        }
    }

    // 组件挂载时初始化加载数据
    useEffect(() => {
        if (searchCondition) {
            getTableList({ ...searchCondition })
        }
    }, [])

    // 搜索条件变化时重新加载数据
    useUpdateEffect(() => {
        if (searchCondition) {
            getTableList({ ...searchCondition })
        }
    }, [searchCondition])

    // 轻量级搜索状态变化处理
    const handleLightWeightSearchChange = (values: any) => {
        const { status } = values

        let searchParams = { ...searchCondition }

        if (status === ApplyStatus.All || !status) {
            searchParams = omit(searchParams, 'status')
        } else {
            searchParams.status = status
        }

        searchParams.offset = 1
        setSearchCondition(searchParams)
    }

    // 表格列定义
    const columns: any = useMemo(() => {
        const sortableColumn = (dataIndex: string) => ({
            sorter: true,
            sortOrder: tableSort?.[dataIndex],
            showSorterTooltip: false,
            sortDirections: ['descend', 'ascend'] as SortOrder[],
        })

        return [
            {
                title: __('申请单名称'),
                dataIndex: 'application_name',
                key: 'application_name',
                ellipsis: true,
                width: 200,
            },
            {
                title: __('申请库表名称'),
                dataIndex: 'table_name',
                key: 'table_name',
                ellipsis: true,
                width: 250,
            },
            {
                title: __('申请状态'),
                dataIndex: 'status',
                key: 'status',
                width: 120,
                render: (status: ApplyStatus, record: IApplyListItem) => {
                    const config = statusConfig[status]
                    if (!config) return '--'
                    const isRejected = status === ApplyStatus.Rejected
                    const rejectReason = record.statusMessage || ''
                    return (
                        <div className={styles.statusView}>
                            <div
                                className={styles.statusDot}
                                style={{ background: config.color }}
                            />
                            <span className={styles.statusText}>
                                {config.label}
                            </span>
                            {isRejected && rejectReason && (
                                <Tooltip
                                    title={__('拒绝原因：') + rejectReason}
                                    placement="bottom"
                                >
                                    <FontIcon
                                        name="icon-shenheyijian"
                                        type={IconType.COLOREDICON}
                                        style={{
                                            marginLeft: 4,
                                            fontSize: 16,
                                            cursor: 'pointer',
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </div>
                    )
                },
            },
            {
                title: __('申请人'),
                dataIndex: 'applicant',
                key: 'applicant',
                ellipsis: true,
                width: 150,
            },
            {
                title: __('申请时间'),
                dataIndex: 'apply_time',
                key: 'apply_time',
                width: 180,
                ellipsis: true,
                render: (val: number) => (val ? formatTime(val) : '--'),
            },
            {
                title: __('操作'),
                key: 'action',
                width: 180,
                fixed: 'right' as const,
                render: (_: any, record: IApplyListItem) => {
                    const { status } = record
                    const canEdit =
                        status === ApplyStatus.Approved ||
                        status === ApplyStatus.Rejected ||
                        status === ApplyStatus.Undone
                    const canDelete =
                        status === ApplyStatus.Approved ||
                        status === ApplyStatus.Rejected ||
                        status === ApplyStatus.Undone
                    const canRevoke = status === ApplyStatus.Auditing

                    return (
                        <Space size={8}>
                            {/* 详情按钮：无论什么状态都有 */}
                            <Button
                                type="link"
                                onClick={() => handleDetail(record)}
                            >
                                {__('详情')}
                            </Button>
                            {/* 撤回按钮：仅审核中状态显示 */}
                            {canRevoke && (
                                <Button
                                    type="link"
                                    onClick={() => handleRevoke(record)}
                                >
                                    {__('撤销')}
                                </Button>
                            )}
                            {/* 编辑按钮：已通过、已拒绝、已撤销状态可用 */}
                            <Tooltip
                                title={
                                    !hasAuditProcess
                                        ? __('请联系管理员配置权限申请审核流程')
                                        : ''
                                }
                                placement="bottom"
                            >
                                <Button
                                    type="link"
                                    disabled={!canEdit || !hasAuditProcess}
                                    onClick={() => handleEdit(record)}
                                >
                                    {__('编辑')}
                                </Button>
                            </Tooltip>
                            {/* 删除按钮：已通过、已拒绝、已撤销状态可用 */}
                            <Button
                                type="link"
                                disabled={!canDelete}
                                onClick={() => handleDelete(record)}
                            >
                                {__('删除')}
                            </Button>
                        </Space>
                    )
                },
            },
        ]
    }, [tableSort, hasAuditProcess])

    // 撤回申请
    const handleRevoke = async (record: IApplyListItem) => {
        try {
            await revokeDwhDataAuthRequest(record.id)
            message.success(__('撤销成功'))
            handleRefresh()
        } catch (error) {
            formatError(error)
        }
    }

    // 编辑申请
    const handleEdit = (record: IApplyListItem) => {
        setEditRecordId(record.id)
        setCreateOpen(true)
    }

    // 删除申请
    const handleDelete = (record: IApplyListItem) => {
        confirm({
            icon: <ExclamationCircleFilled style={{ color: '#faad14' }} />,
            title: __('确定要删除权限申请单吗？'),
            content: __('删除后该权限申请单将无法找回，请谨慎操作！'),
            okText: __('确定'),
            cancelText: __('取消'),
            onOk: async () => {
                try {
                    await deleteDwhDataAuthRequest(record.id)
                    message.success(__('删除成功'))
                    handleRefresh()
                } catch (error) {
                    formatError(error)
                }
            },
        })
    }

    // 详情抽屉
    const [detailOpen, setDetailOpen] = useState(false)
    const [detailRecordId, setDetailRecordId] = useState<string | null>(null)

    // 查看详情
    const handleDetail = (record: IApplyListItem) => {
        setDetailRecordId(record.id)
        setDetailOpen(true)
    }

    // 关键字搜索
    const handleKwSearch = (kw: string) => {
        if (kw === searchCondition?.keyword) return
        setSearchCondition({
            ...searchCondition,
            keyword: kw,
            offset: 1,
        })
    }

    // 刷新
    const handleRefresh = (refresh: boolean = true) => {
        setSearchCondition({
            ...searchCondition,
            offset: refresh ? 1 : searchCondition?.offset,
        })
    }

    // 表格排序改变
    const handleTableChange = (sorter: any) => {
        const newSort: { [key: string]: SortOrder } = {}

        if (sorter.column) {
            const key = sorter.columnKey
            newSort[key] = sorter.order || 'descend'
        }

        setTableSort(newSort)

        return {
            key: sorter?.columnKey,
            sort:
                sorter?.order === 'ascend'
                    ? SortDirection.ASC
                    : SortDirection.DESC,
        }
    }

    // 表格排序改变
    const onTableChange = (
        currentPagination: any,
        filters: any,
        sorter: any,
        extra: any,
    ) => {
        const selectedMenu = handleTableChange(sorter)
        if (extra.action === 'sort' && !!sorter.column) {
            setSearchCondition({
                ...searchCondition,
                sort: selectedMenu.key,
                direction: selectedMenu.sort,
                offset: 1,
            })
        }
    }

    // 分页改变
    const onPaginationChange = (page: number, pageSize: number) => {
        setSearchCondition({
            ...searchCondition,
            offset: page || 1,
            limit: pageSize,
        })
    }

    // 空数据
    const renderEmpty = () => (
        <Empty
            iconSrc={dataEmpty}
            desc={__('暂无数据')}
            style={{ marginTop: 36, width: '100%' }}
        />
    )

    // 加载中
    const renderLoader = () => (
        <div style={{ marginTop: 104, width: '100%' }}>
            <Loader />
        </div>
    )

    // 顶部右侧操作
    const rightOperate = (tableData.length > 0 || isSearchStatus) && (
        <div className={styles.topRight}>
            <Space size={8}>
                <SearchInput
                    value={searchCondition?.keyword}
                    style={{ width: 280 }}
                    placeholder={__('搜索申请单名称、申请库表名称')}
                    onKeyChange={(kw: string) => {
                        handleKwSearch(kw)
                    }}
                    onPressEnter={(
                        e: React.KeyboardEvent<HTMLInputElement>,
                    ) => {
                        handleKwSearch(trim(e.currentTarget.value))
                    }}
                />
                <LightweightSearch
                    ref={searchRef}
                    formData={formData}
                    onChange={handleLightWeightSearchChange}
                    defaultValue={{ status: ApplyStatus.All }}
                />
                <RefreshBtn onClick={handleRefresh} />
            </Space>
        </div>
    )

    return (
        <div className={styles.applyList}>
            {loading ? (
                renderLoader()
            ) : (
                <>
                    <div className={styles.applyOperation}>
                        <div className={styles.topLeft}>
                            <Tooltip
                                title={
                                    !hasAuditProcess
                                        ? __('请联系管理员配置权限申请审核流程')
                                        : ''
                                }
                                placement="bottom"
                            >
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => {
                                        setCreateOpen(true)
                                    }}
                                    disabled={!hasAuditProcess}
                                >
                                    {__('新建申请')}
                                </Button>
                            </Tooltip>
                        </div>
                        {rightOperate}
                    </div>

                    {tableData.length === 0 && !isSearchStatus ? (
                        renderEmpty()
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            loading={fetching}
                            rowKey="id"
                            onChange={onTableChange}
                            scroll={{
                                x: columns.length * 180,
                                y: 'calc(100vh - 270px)',
                            }}
                            pagination={{
                                total,
                                pageSize: searchCondition?.limit,
                                current: searchCondition?.offset,
                                showQuickJumper: true,
                                onChange: onPaginationChange,
                                showSizeChanger: true,
                                showTotal: (count) =>
                                    __('共${count}条', { count }),
                            }}
                            locale={{ emptyText: <Empty /> }}
                        />
                    )}
                </>
            )}
            {createOpen && (
                <Create
                    open={createOpen}
                    recordId={editRecordId}
                    onClose={() => {
                        setCreateOpen(false)
                        setEditRecordId(null)
                        handleRefresh()
                    }}
                />
            )}
            <Detail
                open={detailOpen}
                recordId={detailRecordId}
                onClose={() => {
                    setDetailOpen(false)
                    setDetailRecordId(null)
                }}
            />
        </div>
    )
}

export default AuthApplyList
