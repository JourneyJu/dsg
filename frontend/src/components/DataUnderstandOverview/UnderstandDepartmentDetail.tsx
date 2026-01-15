import { FC, useEffect, useState } from 'react'
import { Modal, Table } from 'antd'
import { OverviewRangeEnum } from './const'
import __ from './locale'
import { Empty, Loader } from '@/ui'
import styles from './styles.module.less'
import dataEmpty from '@/assets/dataEmpty.svg'
import { formatError, getDataUnderstandDepartTop } from '@/core'
import DepartmentAndOrgSelect from '../DepartmentAndOrgSelect'

const InitialSearchCondition: {
    department_id?: string
    my_department?: boolean
    offset: number
    limit: number
    sort?: 'completion_rate' | 'name'
    direction?: 'asc' | 'desc'
} = {
    department_id: undefined,
    my_department: false,
    offset: 1,
    limit: 10,
    sort: 'name',
    direction: 'asc',
}

interface UnderstandDepartmentDetailProps {
    activeRange: OverviewRangeEnum
    open: boolean
    onClose: () => void
}

const UnderstandDepartmentDetail: FC<UnderstandDepartmentDetailProps> = ({
    activeRange,
    open,
    onClose,
}) => {
    const [searchCondition, setSearchCondition] = useState<{
        department_id?: string
        my_department?: boolean
        offset: number
        limit: number
        sort?: 'completion_rate' | 'name'
        direction?: 'asc' | 'desc'
    }>(InitialSearchCondition)
    const [departmentData, setDepartmentData] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const columns = [
        {
            title: __('部门名称'),
            dataIndex: 'name',
            key: 'name',
            width: 120,
            ellipsis: true,
            render: (text, record) => <span title={text}>{text || '--'}</span>,
        },
        {
            title: __('已理解目录'),
            dataIndex: 'completed_count',
            key: 'completed_count',
            width: 120,
            ellipsis: true,
            render: (text, record) => (
                <span title={text}>
                    {text?.toLocaleString('en-US') || '--'}
                </span>
            ),
        },
        {
            title: __('未理解目录'),
            dataIndex: 'uncompleted_count',
            key: 'uncompleted_count',
            width: 120,
            ellipsis: true,
            render: (text, record) => (
                <span title={text}>
                    {text?.toLocaleString('en-US') || '--'}
                </span>
            ),
        },
        {
            title: __('完成率'),
            dataIndex: 'completion_rate',
            key: 'completion_rate',
            width: 120,
            ellipsis: true,
            render: (text, record) => (
                <span title={text}>{text ? `${text}%` : '--'}</span>
            ),
        },
    ]

    useEffect(() => {
        setSearchCondition({
            ...searchCondition,
            offset: 1,
            my_department: activeRange === OverviewRangeEnum.DEPARTMENT,
        })
    }, [activeRange])

    useEffect(() => {
        getDepartmentData()
    }, [searchCondition])

    /**
     * 获取部门数据
     */
    const getDepartmentData = async () => {
        try {
            setLoading(true)
            const res = await getDataUnderstandDepartTop({
                ...searchCondition,
            })
            setDepartmentData(res.entries)
            setTotal(res.total_count)
        } catch (err) {
            formatError(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            width={1000}
            open={open}
            onCancel={onClose}
            footer={null}
            title={__('数据理解部门详情')}
            maskClosable={false}
        >
            {departmentData.length > 0 && !searchCondition.department_id ? (
                <div className={styles.understandDepartmentDetail}>
                    <div className={styles.searchContainer}>
                        <DepartmentAndOrgSelect
                            onChange={(value) => {
                                setSearchCondition({
                                    ...searchCondition,
                                    department_id: value,
                                    offset: 1,
                                })
                            }}
                            placeholder={__('搜索部门')}
                            style={{ width: '200px' }}
                            value={searchCondition.department_id}
                            allowClear
                        />
                    </div>
                    <div>
                        <Table
                            dataSource={departmentData}
                            columns={columns}
                            pagination={{
                                pageSize: searchCondition.limit,
                                current: searchCondition.offset,
                                hideOnSinglePage: total < 10,
                                showQuickJumper: true,
                                total,
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
                            scroll={{ y: 400 }}
                        />
                    </div>
                </div>
            ) : loading ? (
                <div className={styles.loadingAndEmptyContainer}>
                    <Loader />
                </div>
            ) : (
                <div className={styles.loadingAndEmptyContainer}>
                    <Empty desc={__('暂无数据')} iconSrc={dataEmpty} />
                </div>
            )}
        </Modal>
    )
}

export default UnderstandDepartmentDetail
