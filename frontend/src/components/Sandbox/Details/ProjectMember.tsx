import { Table } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { Empty, SearchInput } from '@/ui'
import __ from '../locale'
import styles from './styles.module.less'
import { ISandboxProjectMember } from '@/core'

interface IProjectMember {
    data: ISandboxProjectMember[]
}
const ProjectMember: React.FC<IProjectMember> = ({ data }) => {
    const [searchKey, setSearchKey] = useState('')

    const showDataSource = useMemo(() => {
        return (
            data?.filter((item) =>
                item.name
                    .toLocaleLowerCase()
                    .includes(searchKey.trim().toLocaleLowerCase()),
            ) || []
        )
    }, [data, searchKey])

    const columns = [
        {
            title: __('姓名'),
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: ISandboxProjectMember) => (
                <div className={styles['name-container']}>
                    <div className={styles['member-name']} title={name}>
                        {name}
                    </div>
                    {record.is_project_owner && (
                        <div className={styles['response-flag']}>
                            {__('负责人')}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: __('所属组织架构'),
            dataIndex: 'department_name',
            key: 'department_name',
            render: (val: string, record: ISandboxProjectMember) => (
                <span title={record.department_name_path}>{val}</span>
            ),
        },
        {
            title: (
                <SearchInput
                    onKeyChange={(keyword) => {
                        setSearchKey(keyword)
                    }}
                    placeholder={__('搜索姓名')}
                    allowClear
                />
            ),
            dataIndex: 'join_time',
            key: 'join_time',
            width: 320,
        },
    ]

    return (
        <Table
            dataSource={showDataSource}
            columns={columns}
            pagination={{
                hideOnSinglePage: data?.length < 10,
                showQuickJumper: true,
                showSizeChanger: true,
            }}
            locale={{ emptyText: <Empty /> }}
        />
    )
}

export default ProjectMember
