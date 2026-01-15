import { Button, Space, Table } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'ahooks'
import { SortOrder } from 'antd/lib/table/interface'
import { omit } from 'lodash'
import { Empty, Loader } from '@/ui'
import {
    formatError,
    getDwhDataAuthRequestAuditList,
    IDwhDataAuthAuditListItem,
    SortDirection,
} from '@/core'
import { formatTime } from '@/utils'
import { RefreshBtn } from '@/components/ToolbarComponents'
import dataEmpty from '@/assets/dataEmpty.svg'
import __ from '../locale'
import styles from './styles.module.less'
import AuditDrawer from './AuditDrawer'

const AuthAuditList = () => {
    // 初始化 load
    const [loading, setLoading] = useState<boolean>(true)
    // 加载数据 load
    const [fetching, setFetching] = useState<boolean>(false)
    // 表格数据
    const [tableData, setTableData] = useState<IDwhDataAuthAuditListItem[]>([])
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
    })
    // 审核抽屉
    const [auditDrawerVisible, setAuditDrawerVisible] = useState(false)
    const [auditRecordId, setAuditRecordId] = useState<string | null>(null)
    const [auditProcInstId, setAuditProcInstId] = useState<string | undefined>(
        undefined,
    )

    // 是否有过滤值
    const isSearchStatus = useMemo(() => {
        const ignoreAttr = ['offset', 'limit', 'sort', 'direction']
        return Object.values(omit(searchCondition, ignoreAttr)).some(
            (item) => item,
        )
    }, [searchCondition])

    // 获取表格数据
    const getTableList = async (params: any) => {
        try {
            setFetching(true)
            const res = await getDwhDataAuthRequestAuditList({
                target: 'tasks',
                ...params,
            })
            setTableData(res?.entries || [])
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
                dataIndex: 'name',
                key: 'name',
                ellipsis: true,
                width: 200,
            },
            {
                title: __('关联库表名称'),
                dataIndex: 'data_business_name',
                key: 'data_business_name',
                ellipsis: true,
                width: 300,
            },
            {
                title: __('申请人'),
                dataIndex: 'applicant_name',
                key: 'applicant_name',
                ellipsis: true,
                width: 150,
            },
            {
                title: __('申请时间'),
                dataIndex: 'apply_time',
                key: 'apply_time',
                width: 180,
                ellipsis: true,
                render: (val: string) =>
                    val ? formatTime(new Date(val).getTime()) : '--',
            },
            {
                title: __('操作'),
                key: 'action',
                width: 100,
                fixed: 'right' as const,
                render: (_: any, record: IDwhDataAuthAuditListItem) => {
                    return (
                        <Button
                            type="link"
                            onClick={() => {
                                setAuditRecordId(record.id)
                                setAuditProcInstId(record.proc_inst_id)
                                setAuditDrawerVisible(true)
                            }}
                        >
                            {__('审核')}
                        </Button>
                    )
                },
            },
        ]
    }, [tableSort])

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
            newSort[key] = sorter.order || 'ascend'
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
            <RefreshBtn onClick={handleRefresh} />
        </div>
    )

    return (
        <div className={styles.auditList}>
            {loading ? (
                renderLoader()
            ) : (
                <>
                    <div className={styles.auditOperation}>
                        <div className={styles.topLeft}>
                            <div className={styles.title}>
                                {__('权限申请审核')}
                            </div>
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
                            // onChange={onTableChange}
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
            <AuditDrawer
                visible={auditDrawerVisible}
                recordId={auditRecordId}
                procInstId={auditProcInstId}
                onClose={() => {
                    setAuditDrawerVisible(false)
                    setAuditRecordId(null)
                    setAuditProcInstId(undefined)
                }}
                onSuccess={() => {
                    handleRefresh()
                }}
            />
        </div>
    )
}

export default AuthAuditList
