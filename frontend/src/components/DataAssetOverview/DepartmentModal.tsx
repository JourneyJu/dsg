import { Modal, Table, TreeSelect } from 'antd'
import React, { useEffect, useState } from 'react'
import { formatError, getDataAssetDepartment } from '@/core'
import dataEmpty from '@/assets/dataEmpty.svg'
import { Empty, SearchInput } from '@/ui'
import DepartmentAndOrgSelect from '../DepartmentAndOrgSelect'
import styles from './styles.module.less'

function DepartmentModal({
    visible,
    onClose,
}: {
    visible: boolean
    onClose: () => void
}) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState<number>(1)
    const [searchCondition, setSearchCondition] = useState<any>({
        offset: 1,
        limit: 10,
    })
    useEffect(() => {
        getDeparts()
    }, [searchCondition])

    const getDeparts = async () => {
        try {
            setLoading(true)
            const res = await getDataAssetDepartment(searchCondition)
            setData(res?.entries || [])
            setTotal(res?.total_count)
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
            title: '信息资源目录',
            dataIndex: 'info_resource_count',
            key: 'info_resource_count',
            ellipsis: true,
            render: (text, record) => <span title={text}>{text ?? '--'}</span>,
        },
        {
            title: '数据资源目录',
            dataIndex: 'data_resource_count',
            key: 'data_resource_count',
            ellipsis: true,
            render: (text, record) => <span title={text}>{text ?? '--'}</span>,
        },
        {
            title: '库表',
            dataIndex: 'database_table_count',
            key: 'database_table_count',
            ellipsis: true,
            render: (text, record) => <span title={text}>{text ?? '--'}</span>,
        },
        {
            title: '接口',
            dataIndex: 'api_count',
            key: 'api_count',
            ellipsis: true,
            render: (text, record) => <span title={text}>{text ?? '--'}</span>,
        },
        {
            title: '文件',
            dataIndex: 'file_count',
            key: 'file_count',
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
            getContainer={false}
            bodyStyle={{ height: 560, padding: 0 }}
            onCancel={onClose}
            title="资源部门详情"
        >
            <div className={styles.modalContent}>
                {!data?.length && !searchCondition?.departmentId ? (
                    <div className={styles.tableEmpty}>
                        <Empty iconSrc={dataEmpty} desc="暂无数据" />
                    </div>
                ) : (
                    <div className={styles.modalContentTable}>
                        <div className={styles.modalContentTableHeader}>
                            <DepartmentAndOrgSelect
                                onChange={(id) => {
                                    setSearchCondition((per) => ({
                                        ...per,
                                        department_id: id,
                                        offset: 1,
                                    }))
                                }}
                                allowClear
                                placeholder="搜索部门"
                                style={{ width: '200px' }}
                            />
                        </div>
                        <div className={styles.modalContentTableContent}>
                            <Table
                                dataSource={data}
                                columns={columns}
                                loading={loading}
                                rowKey="id"
                                scroll={{
                                    y: '380px',
                                }}
                                pagination={{
                                    showSizeChanger: false,
                                    hideOnSinglePage: true,
                                    current: searchCondition.offset,
                                    pageSize: searchCondition.limit,
                                    size: 'small',
                                    total,
                                    showTotal: (count) => {
                                        return `共 ${count} 条记录 第 ${
                                            searchCondition.offset
                                        }/${Math.ceil(
                                            count / searchCondition.limit,
                                        )} 页`
                                    },
                                }}
                                onChange={(newPagination, filters, sorter) => {
                                    setSearchCondition((prev) => ({
                                        ...prev,
                                        offset: newPagination.current,
                                        limit: newPagination.pageSize,
                                    }))
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default DepartmentModal
