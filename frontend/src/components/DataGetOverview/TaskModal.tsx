import { Modal, Table } from 'antd'
import React, { memo, useEffect, useState } from 'react'
import { formatError, getDataGetAggregation } from '@/core'
import dataEmpty from '@/assets/dataEmpty.svg'

import { Empty } from '@/ui'
import styles from './styles.module.less'
import DepartSelect from './DepartSelect'
import DepartmentAndOrgSelect from '../DepartmentAndOrgSelect'

const DefaultQuery = {
    keyword: '', // 关键词
    limit: 10, // 每页条数
    offset: 1, // 当前页码
}

function TaskModal({
    isAll,
    visible,
    onClose,
}: {
    isAll: boolean
    visible: boolean
    onClose: () => void
}) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [departId, setDepartId] = useState<string[]>()
    const [queryParams, setQueryParams] = useState<any>(DefaultQuery)
    const [totalCount, setTotalCount] = useState<number>(0)

    useEffect(() => {
        getTasks(!isAll)
    }, [isAll, departId, queryParams])

    const getTasks = async (my_department: boolean) => {
        try {
            setLoading(true)
            const res = await getDataGetAggregation({
                deparment_id: departId,
                my_department,
                ...queryParams,
            })
            setData(res?.entries || [])
            setTotalCount(res?.total_count || 0)
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            title: '部门名称',
            dataIndex: 'department_name',
            key: 'department_name',
            ellipsis: true,
            render: (text, record) => <span title={text}>{text ?? '--'}</span>,
        },
        {
            title: '归集任务',
            dataIndex: 'completed_count',
            key: 'completed_count',
            ellipsis: true,
            render: (text, record) => {
                const { completed_count, not_completed_count } = record
                const total = completed_count + not_completed_count
                return <span title={total}>{total ?? '--'}</span>
            },
        },
        {
            title: '已完成归集任务',
            dataIndex: 'completed_count',
            key: 'completed_count',
            ellipsis: true,
            render: (text, record) => <span title={text}>{text ?? '--'}</span>,
        },
        {
            title: '未完成归集任务',
            dataIndex: 'not_completed_count',
            key: 'not_completed_count',
            ellipsis: true,
            render: (text, record) => <span title={text}>{text ?? '--'}</span>,
        },
    ]

    return (
        <Modal
            open={visible}
            footer={null}
            maskClosable={false}
            width={980}
            bodyStyle={{ height: 580, padding: 0 }}
            getContainer={false}
            onCancel={onClose}
            title="归集任务详情"
        >
            <div className={styles.modalContent}>
                {!data?.length && !loading && !departId ? (
                    <div className={styles.tableEmpty}>
                        {departId ? (
                            <Empty />
                        ) : (
                            <Empty iconSrc={dataEmpty} desc="暂无数据" />
                        )}
                    </div>
                ) : (
                    <div className={styles.modalContentTable}>
                        <div className={styles.modalContentTableHeader}>
                            <DepartmentAndOrgSelect
                                allowClear
                                placeholder="搜索部门"
                                onChange={(d) => setDepartId(d)}
                                value={departId}
                                style={{ width: '200px', height: '32px' }}
                            />
                        </div>
                        <div className={styles.modalContentTableContent}>
                            <Table
                                dataSource={data}
                                columns={columns}
                                loading={loading}
                                rowKey="id"
                                scroll={{
                                    y: '400px',
                                }}
                                pagination={{
                                    current: queryParams?.offset,
                                    pageSize: queryParams?.limit,
                                    total: totalCount,
                                    showSizeChanger: false,
                                    hideOnSinglePage: true,
                                    size: 'small',
                                    onChange: (page) => {
                                        setQueryParams((prev) => ({
                                            ...prev,
                                            offset: page,
                                        }))
                                    },
                                }}
                                onChange={(pagination, filters, sorter) => {
                                    if (
                                        pagination.current ===
                                        queryParams.offset
                                    ) {
                                        setQueryParams({
                                            ...queryParams,
                                            offset: 1,
                                            limit: pagination?.pageSize,
                                        })
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default memo(TaskModal)
