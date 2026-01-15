import { Col, Row, Table } from 'antd'
import classNames from 'classnames'
import React, { useEffect, useMemo, useState } from 'react'
import { useAntdTable } from 'ahooks'
import { CommonTitle } from '@/ui'
import styles from './styles.module.less'
import {
    dataSource,
    formatError,
    getDataBaseDetails,
    getDatasheetViewDetails,
} from '@/core'
import { resourceDetailsFields, ResourceDetailsFieldType } from './helper'

interface ResultUseConfigDetailsProps {
    data: any
}
const ResultUseConfigDetails = ({ data }: ResultUseConfigDetailsProps) => {
    const [loading, setLoading] = useState(false)
    const [dbInfo, setDBInfo] = useState<dataSource>()
    const [tableData, setTableData] = useState<any[]>([])

    useEffect(() => {
        if (data.use_conf.dst_data_source_id) {
            getDataBaseInfo()
        }
        if (data.view_id) {
            // getDatasheetViewDetails
            getViewDetails()
        }
    }, [data])

    const getViewDetails = async () => {
        const res = await getDatasheetViewDetails(data.view_id)
        const selectedFields = JSON.parse(data.use_conf.column_ids)
        setTableData(
            res.fields.filter((item) => selectedFields.includes(item.id)),
        )
    }

    const getDataBaseInfo = async () => {
        const res = await getDataBaseDetails(data.use_conf.dst_data_source_id)
        setDBInfo(res)
    }

    const getValue = (field: any) => {
        let val = data
        if (Array.isArray(field.key)) {
            field.key.forEach((key) => {
                val = val?.[key]
            })
        } else {
            val = data[field.key]
        }

        if (field.type === ResourceDetailsFieldType.Table) {
            return (
                <Table
                    rowKey={(record) => record.id}
                    columns={field.columns}
                    dataSource={tableData}
                    pagination={
                        tableData.length < 5
                            ? false
                            : {
                                  pageSize: 5,
                                  total: tableData.length,
                                  size: 'small',
                              }
                    }
                    className={styles['table-field']}
                />
            )
        }

        if (field.type === ResourceDetailsFieldType.Other) {
            return dbInfo?.[field.key]
        }

        if (field.render) {
            return field.render(val, data)
        }
        return val || '--'
    }

    return (
        <div className={styles['resource-details-wrapper']}>
            {resourceDetailsFields.map((item, index) => {
                return (
                    <div key={index} className={styles['group-container']}>
                        <div className={styles['group-title']}>
                            <CommonTitle title={item.title} />
                        </div>
                        <Row>
                            {item.fields.map((field, fIdx) => {
                                return (
                                    <Col
                                        span={field.span || 12}
                                        key={fIdx}
                                        className={classNames(
                                            styles['field-item'],
                                            field.type ===
                                                ResourceDetailsFieldType.Table &&
                                                styles['table-field-item'],
                                        )}
                                    >
                                        <div className={styles['item-label']}>
                                            {field.label}：
                                        </div>
                                        <div className={styles['item-value']}>
                                            {getValue(field)}
                                        </div>
                                    </Col>
                                )
                            })}
                        </Row>
                    </div>
                )
            })}
        </div>
    )
}

export default ResultUseConfigDetails
