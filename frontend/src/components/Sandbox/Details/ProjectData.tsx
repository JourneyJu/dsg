import React, { useEffect, useState } from 'react'
import { Table } from 'antd'
import { CommonTitle, SearchInput } from '@/ui'
import __ from '../locale'
import styles from './styles.module.less'
import { formatError, getDataPushMonitorList } from '@/core'

interface IProjectData {
    sandboxId: string
}
const ProjectData: React.FC<IProjectData> = ({ sandboxId }) => {
    const [searchCondition, setSearchCondition] = useState({
        offset: 1,
        limit: 10,
        with_sandbox_info: true,
        authed_sandbox_id: sandboxId,
        keyword: '',
    })
    const [dataSource, setDataSource] = useState<any[]>([])
    const [total, setTotal] = useState(0)

    useEffect(() => {
        getProjectData()
    }, [searchCondition])

    const getProjectData = async () => {
        try {
            const res = await getDataPushMonitorList({
                ...searchCondition,
                with_sandbox_info: true,
                authed_sandbox_id: sandboxId,
            })

            setTotal(res?.total_count || 0)
            setDataSource(res?.entries || [])
        } catch (error) {
            formatError(error)
        }
    }

    const columns = [
        {
            title: __('数据集名称'),
            dataIndex: 'target_table_name',
            key: 'target_table_name',
        },
        {
            title: __('资源目录名称'),
            dataIndex: 'data_catalog_name',
            key: 'data_catalog_name',
        },
        {
            title: __('数据来源'),
            dataIndex: 'form',
            key: 'form',
            render: () => __('数据推送'),
        },
        {
            title: __('数据记录数'),
            dataIndex: 'sync_count',
            key: 'sync_count',
        },
    ]

    // 分页改变
    const onPaginationChange = (page, pageSize) => {
        setSearchCondition((prev) => ({
            ...prev,
            offset: page,
            limit: pageSize,
        }))
    }

    return (
        <div className={styles['project-data-wrapper']}>
            <div className={styles['common-title']}>
                <CommonTitle title={__('项目数据')} />
            </div>
            <div className={styles['search-container']}>
                <SearchInput
                    placeholder={__('搜索数据集名称')}
                    onKeyChange={(keyword) => {
                        setSearchCondition({
                            ...searchCondition,
                            keyword,
                            offset: 1,
                        })
                    }}
                    style={{ width: 280 }}
                />
            </div>
            <Table
                dataSource={dataSource}
                columns={columns}
                style={{ padding: '0 16px' }}
                pagination={{
                    total,
                    hideOnSinglePage: total < 10,
                    pageSize: searchCondition?.limit,
                    current: searchCondition?.offset,
                    showQuickJumper: true,
                    onChange: (page, pageSize) =>
                        onPaginationChange(page, pageSize),
                    showSizeChanger: true,
                    showTotal: (count) => __('共${count}条', { count }),
                }}
            />
        </div>
    )
}

export default ProjectData
