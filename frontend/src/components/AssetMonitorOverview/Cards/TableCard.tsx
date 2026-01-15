import React, { memo, useMemo } from 'react'
import classNames from 'classnames'
import { Table } from 'antd'
import styles from './styles.module.less'
import { formatThousand } from '@/utils/number'

interface TableCardProps {
    title: string
    data?: any[]
    showColumns?: string[]
}

/** 表格卡片组件 */
const TableCard: React.FC<TableCardProps> = ({
    title,
    data = [],
    showColumns = [],
}) => {
    const columns = [
        {
            title: '部门',
            dataIndex: 'department_name',
            key: 'department_name',
            ellipsis: true,
            render: (text, record) => <span title={text}>{text ?? '--'}</span>,
        },
        {
            title: '库表数',
            dataIndex: 'view_count',
            key: 'view_count',
            ellipsis: true,
            render: (text, record) => (
                <span title={formatThousand(text)}>
                    {formatThousand(text) ?? '--'}
                </span>
            ),
        },
        {
            title: '前置机数量',
            dataIndex: 'front_end_processor_count',
            key: 'front_end_processor_count',
            ellipsis: true,
            render: (text, record) => (
                <span title={formatThousand(text)}>
                    {formatThousand(text) ?? '--'}
                </span>
            ),
        },
        {
            title: '今日新增库表',
            dataIndex: 'new_view_count',
            key: 'new_view_count',
            ellipsis: true,
            render: (text, record) => '--',
        },
        {
            title: '数据量',
            dataIndex: 'data_size',
            key: 'data_size',
            ellipsis: true,
            render: (text, record) => '--',
        },
        {
            title: '今日新增数据量',
            dataIndex: 'new_data_size',
            key: 'new_data_size',
            ellipsis: true,
            render: (text, record) => '--',
        },
        {
            title: '7日鲜活表数',
            dataIndex: 'fresh_view_count',
            key: 'fresh_view_count',
            ellipsis: true,
            render: (text, record) => '--',
        },
        {
            title: '24小时任务异常数',
            dataIndex: 'task_error_count',
            key: 'task_error_count',
            ellipsis: true,
            render: (text, record) => '--',
        },
        {
            title: '已回收数量',
            dataIndex: 'reclaim_count',
            key: 'reclaim_count',
            ellipsis: true,
            render: (text, record) => '--',
        },
    ]

    // 根据传入的 showColumns 过滤需要展示的列
    const filteredColumns = useMemo(() => {
        if (!Array.isArray(showColumns) || showColumns.length === 0) {
            return columns
        }
        const allowSet = new Set(showColumns)
        return columns.filter((col) => allowSet.has(col.dataIndex))
    }, [showColumns, columns])

    return (
        <div className={classNames(styles['table-card'])}>
            <div className={styles['table-card-header']}>
                <div className={styles.title}>{title}</div>
            </div>
            <div className={styles['table-card-content']}>
                <Table
                    dataSource={data.slice(0, 5)}
                    columns={filteredColumns}
                    pagination={false}
                    bordered={false}
                    scroll={{
                        y: '210px',
                        x: '100%',
                    }}
                />
            </div>
        </div>
    )
}

export default memo(TableCard)
