import React, { memo, useState } from 'react'
import { Tabs } from 'antd'
import { useNavigate } from 'react-router-dom'
import classnames from 'classnames'
import styles from './styles.module.less'
import __ from './locale'
import Role from './Role'
import RoleGroup from './RoleGroup'
import { useQuery } from '@/utils'

const RoleManagement = () => {
    const navigator = useNavigate()
    const query = useQuery()
    const tab = query.get('tab') || 'role'

    const handleTabChange = (key) => {
        navigator(`/systemConfig/userRole?tab=${key}`)
    }

    const tabItems = [
        {
            label: __('角色'),
            key: 'role',
            children: '',
        },
        {
            label: __('角色组'),
            key: 'roleGroup',
            children: '',
        },
    ]

    return (
        <div
            className={classnames(styles.roleManagement, {
                [styles.roleManagementInRoleGroup]: tab === 'roleGroup',
            })}
        >
            <Tabs
                defaultActiveKey="role"
                activeKey={tab}
                onChange={handleTabChange}
                items={tabItems}
                className={styles.roleManagementTabs}
            />
            <div className={classnames(styles['roleManagement-content'])}>
                {tab === 'role' && <Role />}
                {tab === 'roleGroup' && <RoleGroup />}
            </div>
        </div>
    )
}

export default memo(RoleManagement)
