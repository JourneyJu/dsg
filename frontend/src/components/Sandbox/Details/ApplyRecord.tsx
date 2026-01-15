import React from 'react'
import { Table } from 'antd'
import __ from '../locale'
import { ISandboxApplyRecord, SandboxCreateTypeEnum } from '@/core'
import { SandboxAuditStatus, SandboxAuditStatusMap } from '../const'
import { formatTime } from '@/utils'

interface IApplyRecord {
    data: ISandboxApplyRecord[]
}
const ApplyRecord: React.FC<IApplyRecord> = ({ data }) => {
    const columns = [
        {
            title: __('申请人'),
            dataIndex: 'applicant_name',
            key: 'applicant_name',
        },
        {
            title: __('申请类型'),
            dataIndex: 'operation',
            key: 'operation',
            render: (val) =>
                val === SandboxCreateTypeEnum.Apply
                    ? __('沙箱申请')
                    : __('沙箱扩容'),
        },
        {
            title: __('申请容量'),
            dataIndex: 'request_space',
            key: 'request_space',
            render: (val) => (val ? `${val}G` : '--'),
        },
        {
            title: __('申请结果'),
            dataIndex: 'audit_state',
            key: 'audit_state',
            render: (val) => SandboxAuditStatusMap[val]?.text,
        },
        {
            title: __('申请原因'),
            dataIndex: 'reason',
            key: 'reason',
            ellipsis: true,
        },
        {
            title: __('申请时间'),
            dataIndex: 'apply_time',
            key: 'apply_time',
            render: (val: number) => (val ? formatTime(val) : '--'),
        },
    ]

    return <Table dataSource={data} columns={columns} pagination={false} />
}

export default ApplyRecord
