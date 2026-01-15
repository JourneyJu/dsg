import { Modal, Table } from 'antd'
import { FC, useEffect, useState } from 'react'
import dataEmpty from '@/assets/dataEmpty.svg'
import __ from './locale'
import { Empty, Loader, SearchInput } from '@/ui'
import styles from './styles.module.less'
import {
    formatError,
    getDepartmentQualityProcessData,
    getQualityDepartmentData,
    ProcessDepartmentData,
    QualityDepartmentData,
} from '@/core'

const InitialSearchCondition = {
    keyword: '',
    my_department: false,
    offset: 1,
    limit: 10,
}

interface IQualityDepartment {
    open: boolean
    myDepartment?: boolean
    onClose: () => void
    formType?: 'quality' | 'process'
}
const QualityDepartment: FC<IQualityDepartment> = ({
    open,
    myDepartment = false,
    onClose,
    formType = 'quality',
}) => {
    const [searchCondition, setSearchCondition] = useState(
        InitialSearchCondition,
    )
    const [departmentData, setDepartmentData] = useState<
        QualityDepartmentData[] | ProcessDepartmentData[]
    >([])
    const [loading, setLoading] = useState(true)

    const [total, setTotal] = useState(0)

    useEffect(() => {
        setSearchCondition({
            ...searchCondition,
            offset: 1,
            limit: 10,
            my_department: myDepartment,
        })
    }, [myDepartment])

    useEffect(() => {
        setSearchCondition({
            ...searchCondition,
            offset: 1,
            limit: 10,
        })
    }, [formType])

    useEffect(() => {
        if (formType === 'quality') {
            getDepartmentData()
        } else {
            getProcessDepartmentData()
        }
    }, [searchCondition])

    /**
     * 获取部门数据
     */
    const getDepartmentData = async () => {
        try {
            const res = await getQualityDepartmentData(searchCondition)
            setDepartmentData(res.entries)
            setTotal(res.total_count)
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    /**
     * 获取部门整改数据
     */
    const getProcessDepartmentData = async () => {
        try {
            const res = await getDepartmentQualityProcessData(searchCondition)
            setDepartmentData(res.entries)
            setTotal(res.total_count)
        } catch (err) {
            formatError(err)
        } finally {
            setLoading(false)
        }
    }

    const qualityColumns = [
        {
            title: __('部门名称'),
            dataIndex: 'department_name',
            key: 'department_name',
            width: 120,
            ellipsis: true,
            render: (text, record) => <span title={text}>{text || '--'}</span>,
        },
        {
            title: __('应检测表'),
            dataIndex: 'table_count',
            key: 'table_count',
            width: 100,
            render: (text, record) => (
                <span title={text.toString()}>{text.toString() || '--'}</span>
            ),
        },
        {
            title: __('已检测表'),
            dataIndex: 'qualitied_table_count',
            key: 'qualitied_table_count',
            width: 100,
            render: (text, record) => (
                <span title={text.toString()}>{text.toString() || '--'}</span>
            ),
        },
        {
            title: __('已整改表'),
            dataIndex: 'processed_table_count',
            key: 'processed_table_count',
            width: 100,
            render: (text, record) => (
                <span title={text.toString()}>{text.toString() || '--'}</span>
            ),
        },
        {
            title: __('问题表'),
            dataIndex: 'question_table_count',
            key: 'question_table_count',
            width: 100,
            render: (text, record) => (
                <span title={text.toString()}>{text.toString() || '--'}</span>
            ),
        },
        {
            title: __('已响应表'),
            dataIndex: 'start_process_table_count',
            key: 'start_process_table_count',
            width: 100,
            render: (text, record) => (
                <span title={text.toString()}>{text.toString() || '--'}</span>
            ),
        },
        {
            title: __('整改中表'),
            dataIndex: 'processing_table_count',
            key: 'processing_table_count',
            width: 100,
            render: (text, record) => (
                <span title={text.toString()}>{text.toString() || '--'}</span>
            ),
        },
        {
            title: __('未整改表'),
            dataIndex: 'not_process_table_count',
            key: 'not_process_table_count',
            width: 100,
            render: (text, record) => (
                <span title={text.toString()}>{text.toString() || '--'}</span>
            ),
        },
    ]
    const processColumns = [
        {
            title: __('部门名称'),
            dataIndex: 'department_name',
            key: 'department_name',
            width: 120,
            ellipsis: true,
            render: (text, record) => <span title={text}>{text || '--'}</span>,
        },
        {
            title: __('待整改表'),
            dataIndex: 'question_table_count',
            key: 'question_table_count',
            width: 120,
            ellipsis: true,
            render: (text, record) => (
                <span title={text?.toString()}>{text?.toString() || '--'}</span>
            ),
        },
        {
            title: __('已整改表'),
            dataIndex: 'processed_table_count',
            key: 'processed_table_count',
            width: 120,
            render: (text, record) => (
                <span title={text?.toString()}>{text?.toString() || '--'}</span>
            ),
        },
        {
            title: __('整改率'),
            dataIndex: 'quality_rate',
            key: 'quality_rate',
            width: 120,
            render: (text, record) => <span>{text ? `${text}%` : '--'}</span>,
        },
    ]

    return (
        <Modal
            width={1000}
            open={open}
            onCancel={onClose}
            footer={null}
            title={
                formType === 'quality'
                    ? __('应检测部门详情')
                    : __('部门整改情况详情')
            }
            maskClosable={false}
        >
            {departmentData.length > 0 || searchCondition.keyword ? (
                <div className={styles.qualityDepartmentContainer}>
                    <div className={styles.searchContainer}>
                        <SearchInput
                            placeholder={__('搜索部门')}
                            value={searchCondition.keyword}
                            onChange={(e) =>
                                setSearchCondition({
                                    ...searchCondition,
                                    keyword: e.target.value,
                                    offset: 1,
                                })
                            }
                            className={styles.searchInput}
                        />
                    </div>
                    <div>
                        <Table
                            dataSource={departmentData}
                            columns={
                                formType === 'quality'
                                    ? qualityColumns
                                    : processColumns
                            }
                            pagination={{
                                pageSize: searchCondition.limit,
                                current: searchCondition.offset,
                                hideOnSinglePage: total <= 10,
                                total,
                                showQuickJumper: true,
                                onChange: (page, pageSize) => {
                                    setSearchCondition({
                                        ...searchCondition,
                                        offset: page,
                                        limit: pageSize,
                                    })
                                },
                                showSizeChanger: true,
                                showTotal: (count) =>
                                    __('共${count}条', { count }),
                            }}
                            scroll={{ y: 430 }}
                        />
                    </div>
                </div>
            ) : loading ? (
                <div className={styles.qualityLoadingAndEmptyContainer}>
                    <Loader />
                </div>
            ) : (
                <div className={styles.qualityLoadingAndEmptyContainer}>
                    <Empty desc={__('暂无数据')} iconSrc={dataEmpty} />
                </div>
            )}
        </Modal>
    )
}

export default QualityDepartment
