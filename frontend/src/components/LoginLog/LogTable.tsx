import React, { useEffect, useMemo, useState } from 'react'
import { Space, Spin, Table } from 'antd'
import { ColumnsType, SortOrder } from 'antd/lib/table/interface'
import { forIn, omit } from 'lodash'
import { EventEmitter } from 'ahooks/lib/useEventEmitter'
import moment from 'moment'
import classnames from 'classnames'
import styles from './styles.module.less'
import __ from './locale'
import { SortDirection, formatError, postAuditEventsQuery } from '@/core'
import dataEmpty from '@/assets/dataEmpty.svg'
import { Empty, ListPagination, ListType } from '@/ui'
import { logOptionMap } from './helper'
import DetailsDrawer from './DetailsDrawer'
import { RefreshBtn } from '../ToolbarComponents'

const LogTableRow = (props: any) => {
    const { selected, className } = props

    return (
        <tr
            {...props}
            className={
                selected
                    ? `${className} tableSelectRow`
                    : `${className} tableRow`
            }
        />
    )
}

interface ILogTable {
    condition$: EventEmitter<any>
}

/**
 * 日志表格
 */
const LogTable: React.FC<ILogTable> = ({ condition$ }) => {
    // 初始params
    const initialQueryParams = {
        offset: 1,
        limit: 20,
        filter: {
            type: 'Login',
        },
        sort: 'timestamp',
        direction: SortDirection.DESC,
    }
    const [loading, setLoading] = useState<boolean>(true)
    const [fetching, setFetching] = useState<boolean>(true)
    // 总数
    const [total, setTotal] = useState<number>(0)
    // 日志数据
    const [logs, setLogs] = useState<any[]>([])
    // 修改表头排序
    const [updateSortOrder, setUpdateSortOrder] = useState<SortOrder>('descend')
    // 查询参数
    const [queryParams, setQueryParams] = useState<any>(initialQueryParams)
    // 详情
    const [detailsItem, setDetailsItem] = useState<any>()

    condition$.useSubscription((value) => {
        setQueryParams((prev) => ({
            ...prev,
            filter: { ...value, type: 'Login' },
            offset: 1,
        }))
    })

    useEffect(() => {
        getLogData()
    }, [queryParams])

    const isEmpty = useMemo(() => {
        let hasCondition = false
        forIn(omit(queryParams.filter, ['type']), (value, key) => {
            if (value) {
                hasCondition = true
            }
        })
        return !hasCondition && total === 0
    }, [queryParams, total])

    // 获取日志数据
    const getLogData = async () => {
        try {
            setFetching(true)
            setDetailsItem(undefined)
            const res = await postAuditEventsQuery(queryParams)
            setTotal(res?.total_count || 0)
            setLogs(res?.entries || [])
        } catch (e) {
            formatError(e)
        } finally {
            setLoading(false)
            setFetching(false)
        }
    }

    // 表格排序变化
    const handleTableSort = (sorter) => {
        setUpdateSortOrder(sorter.order)
        setQueryParams((prev) => ({
            ...prev,
            direction:
                sorter.order === 'descend'
                    ? SortDirection.DESC
                    : SortDirection.ASC,
            offset: 1,
        }))
    }

    const handleShowDetails = (record, index) => {
        setDetailsItem({
            ...record?.detail,
            index,
            operation: record.operation,
        })
    }

    // 表格项
    const columns: ColumnsType<any> = [
        {
            title: __('登录账号'),
            dataIndex: 'login_name',
            key: 'login_name',
            ellipsis: true,
            render: (value, record, idx) => (
                <span
                    onClick={() => handleShowDetails(record, idx)}
                    className={classnames(styles.opRow)}
                    title={record.operator?.login_name}
                >
                    {record.operator?.login_name || '--'}
                </span>
            ),
        },
        {
            title: __('用户名'),
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            render: (value, record, idx) => record.operator?.name || '--',
        },
        {
            title: __('所属部门'),
            dataIndex: 'operator_departments',
            key: 'operator_departments',
            ellipsis: true,
            render: (value, record) =>
                record.operator?.department
                    ?.map((item) => item.name)
                    .join('；') || '--',
        },
        {
            title: __('部门编号'),
            dataIndex: 'department_code',
            key: 'department_code',
            ellipsis: true,
            render: (value, record) => record.operator?.department_code || '--',
        },
        {
            title: __('操作类型'),
            dataIndex: 'operation',
            key: 'operation',
            ellipsis: true,
            render: (value, record) => logOptionMap[value]?.text || '--',
        },
        {
            title: __('描述'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            width: '26%',
            render: (value, record) => value || '--',
        },
        {
            title: __('IP'),
            dataIndex: 'operator_agent_ip',
            key: 'operator_agent_ip',
            ellipsis: true,
            render: (value, record) => record.operator?.agent?.ip || '--',
        },
        {
            title: __('操作时间'),
            dataIndex: 'timestamp',
            key: 'timestamp',
            ellipsis: true,
            sorter: true,
            sortOrder: updateSortOrder,
            sortDirections: ['descend', 'ascend', 'descend'],
            showSorterTooltip: false,
            width: 190,
            render: (value, record) =>
                value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '--',
        },
        {
            title: __('操作'),
            key: 'action',
            width: 60,
            render: (_, record, idx) => (
                <a onClick={() => handleShowDetails(record, idx)}>
                    {__('详情')}
                </a>
            ),
        },
    ]

    const showEmpty = () => {
        return (
            <div className={styles.load}>
                <Empty desc={__('暂无数据')} iconSrc={dataEmpty} />
            </div>
        )
    }

    return (
        <div className={styles.logTable}>
            <div className={styles['logTable-top']}>
                <div className={styles['logTable-top-title']}>
                    {__('登录日志列表')}
                </div>
                <Space size={0}>
                    <RefreshBtn
                        onClick={() => {
                            setQueryParams((prev) => ({
                                ...prev,
                                offset: 1,
                            }))
                        }}
                    />
                </Space>
            </div>
            {loading ? (
                <Spin className={styles.load} />
            ) : isEmpty ? (
                showEmpty()
            ) : (
                <>
                    <Table
                        columns={columns}
                        dataSource={logs}
                        loading={fetching}
                        rowClassName={styles.tableRow}
                        pagination={false}
                        scroll={{
                            x: 1280,
                            y: 'calc(100vh - 223px)',
                        }}
                        components={{
                            body: {
                                row: LogTableRow,
                            },
                        }}
                        rowKey={(record, index) => `${index}` || ''}
                        onRow={(record, index) => {
                            const attr = {
                                index,
                                selected: detailsItem?.index === index,
                            }
                            return attr as React.HTMLAttributes<any>
                        }}
                        locale={{
                            emptyText: <Empty />,
                        }}
                        onChange={(pagination, filters, sorter: any) => {
                            handleTableSort(sorter)
                        }}
                    />
                    <ListPagination
                        listType={ListType.NarrowList}
                        queryParams={queryParams}
                        totalCount={total}
                        onChange={(page, pageSize) => {
                            setQueryParams((prev) => ({
                                ...prev,
                                offset: page,
                                limit: pageSize,
                            }))
                        }}
                        className={styles.pagination}
                    />
                </>
            )}
            {detailsItem && (
                <DetailsDrawer
                    data={detailsItem}
                    onClose={() => setDetailsItem(undefined)}
                />
            )}
        </div>
    )
}

export default LogTable
