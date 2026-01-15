import React, { memo, useMemo } from 'react'
import classNames from 'classnames'
import { Table } from 'antd'
import styles from './styles.module.less'
import { formatThousand } from '@/utils/number'

interface TableCardProps {
    title: string
    data?: any[]
    extra?: React.ReactNode
    className?: string
}

/** 表格卡片组件 */
const TableCard: React.FC<TableCardProps> = ({
    title,
    data = [],
    extra,
    className,
}) => {
    const columns = useMemo(() => {
        if (!data || data.length === 0) return []

        return (
            data[0]?.map((item, index) => {
                return {
                    title: item,
                    width: index === 0 ? 100 : 80,
                    fixed: index === 0 ? 'left' : undefined,
                    dataIndex: `column_${index}`,
                    key: `column_${index}`,
                    align: 'center',
                    ellipsis: true,
                }
            }) || []
        )
    }, [data])

    const dataSource = useMemo(() => {
        if (!data || data.length <= 1) return []

        return data.slice(1).map((row, rowIndex) => {
            const rowData: Record<string, any> = {}
            row.forEach((cell, cellIndex) => {
                rowData[`column_${cellIndex}`] = formatThousand(cell ?? 0, '0')
            })
            return {
                ...rowData,
                key: `row_${rowIndex}`,
            }
        })
    }, [data])

    return (
        <div className={classNames(styles['table-card'], className)}>
            <div className={styles['table-card-header']}>
                <div className={styles.title}>{title}</div>
                <div className={styles.extra}>{extra}</div>
            </div>
            <div className={styles['table-card-content']}>
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                    bordered={false}
                    scroll={{
                        y: '180px',
                        x: '100%',
                    }}
                />
            </div>
        </div>
    )
}

export default memo(TableCard)
