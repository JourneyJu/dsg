import { Modal, Table } from 'antd'
import { useEffect, useState } from 'react'
import dataEmpty from '@/assets/dataEmpty.svg'
import { formatError, getDataGetDepartment } from '@/core'
import { Empty } from '@/ui'
import DepartSelect from './DepartSelect'
import styles from './styles.module.less'
import DepartmentAndOrgSelect from '../DepartmentAndOrgSelect'

function DepartmentModal({
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
    const [departId, setDepartId] = useState<string>()

    useEffect(() => {
        getDeparts(!isAll)
    }, [isAll, departId])

    const getDeparts = async (my_department: boolean) => {
        try {
            setLoading(true)
            const res = await getDataGetDepartment({
                deparment_id: departId,
                my_department,
                limit: 10,
                offset: 1,
            })
            setData(res?.entries || [])
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
            render: (text, record) => text ?? '--',
        },
        {
            title: '信息资源目录',
            dataIndex: 'info_catalog_count',
            key: 'info_catalog_count',
            ellipsis: true,
            textAlign: 'center',
            render: (text, record) => text ?? '--',
        },
        {
            title: '数据资源目录',
            dataIndex: 'data_catalog_count',
            key: 'data_catalog_count',
            ellipsis: true,
            textAlign: 'center',
            render: (text, record) => text ?? '--',
        },
        {
            title: '数据资源',
            dataIndex: 'data_resource_count',
            key: 'data_resource_count',
            ellipsis: true,
            width: 100,
            textAlign: 'center',
            render: (text, record) => text ?? '--',
        },
        {
            title: '库表',
            dataIndex: 'view_count',
            key: 'view_count',
            ellipsis: true,
            width: 90,
            textAlign: 'center',
            render: (text, record) => text ?? '--',
        },
        {
            title: '接口',
            dataIndex: 'api_count',
            key: 'api_count',
            ellipsis: true,
            width: 90,
            textAlign: 'center',
            render: (text, record) => text ?? '--',
        },
        {
            title: '文件',
            dataIndex: 'file_count',
            key: 'file_count',
            ellipsis: true,
            width: 90,
            textAlign: 'center',
            render: (text, record) => text ?? '--',
        },
        {
            title: '前置机',
            dataIndex: 'front_end_processor_count',
            key: 'front_end_processor_count',
            ellipsis: true,
            width: 90,
            textAlign: 'center',
            render: (text, record) => text ?? '--',
        },
        {
            title: '前置库',
            dataIndex: 'front_end_library_count',
            key: 'front_end_library_count',
            ellipsis: true,
            width: 90,
            textAlign: 'center',
            render: (text, record) => text ?? '--',
        },
    ]

    return (
        <Modal
            open={visible}
            footer={null}
            maskClosable={false}
            width={980}
            getContainer={false}
            bodyStyle={{ height: 580, padding: 0 }}
            onCancel={onClose}
            title="资源部门详情"
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
                                    pageSize: 10,
                                    showSizeChanger: false,
                                    hideOnSinglePage: true,
                                    size: 'small',
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
