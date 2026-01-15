import React from 'react'
import ScrollLoadSelect from '@/components/ScrollLoadSelect'
import { getUsersFrontendList, IUserDetails } from '@/core'
import __ from '../locale'

interface LeaderSelectProps {
    value?: string
    onChange?: (value: string) => void
    orgInfo?: any
}

const LeaderSelect: React.FC<LeaderSelectProps> = ({
    value,
    onChange,
    orgInfo,
}) => {
    const fetchOptions = async ({ offset, limit, keyword }) => {
        if (!orgInfo?.dept_id) return []
        const res = await getUsersFrontendList({
            offset,
            limit,
            department_id: orgInfo?.dept_id,
            keyword,
            registered: 2,
            include_sub_departments: true,
        })
        return (
            res?.entries?.filter((item) => item.registered === 2) || []
        ).map((leader: IUserDetails) => ({
            id: leader?.id,
            name: leader?.name,
        }))
    }

    return (
        <ScrollLoadSelect
            mode="multiple"
            key={orgInfo?.dept_id || 'empty'}
            fetchOptions={fetchOptions}
            value={value}
            onChange={onChange}
            disabled={!orgInfo?.dept_id}
            placeholder={__('请选择')}
            fieldValueKey="id"
            fieldNameKey="name"
            disableDetailFetch
        />
    )
}

export default LeaderSelect
