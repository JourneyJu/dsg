import React, { useEffect, useMemo, useState } from 'react'
import { Button, message, Modal, Tabs, Tooltip } from 'antd'
import {
    formatError,
    getUserDetails,
    IRoleGroupItem,
    IRoleItem,
    IUserDetails,
    putUsersRoleBindings,
} from '@/core'
import __ from './locale'
import styles from './styles.module.less'
import RolesList from './RolesList'
import SelectedList from './SelectedList'
import { OperateType } from '@/utils'
import RoleGroupList from './RoleGroupList'

interface IConfigRoleModal {
    open: boolean
    operate?: OperateType
    userId?: string
    userIds?: string[]
    onClose: (refresh?: boolean) => void
}

/** 配置角色 */
const ConfigRoleModal: React.FC<IConfigRoleModal> = ({
    open,
    operate,
    userId,
    userIds,
    onClose,
}) => {
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('role')
    // 当前用户角色列表
    const [userDetails, setUserDetails] = useState<IUserDetails>()
    // 本次添加角色列表
    const [selectedRoles, setSelectedRoles] = useState<IRoleItem[]>([])
    // 本次添加角色组列表
    const [selectedRoleGroups, setSelectedRoleGroups] = useState<
        IRoleGroupItem[]
    >([])

    // 是否可以保存
    const canSave = useMemo(() => {
        if (operate === OperateType.CONFIG_ROLE) {
            const { roles = [], role_groups = [] } = userDetails || {}
            const isRolesEqual =
                selectedRoles.length === roles.length &&
                selectedRoles.every((role) =>
                    roles.some((r) => r.id === role.id),
                )
            const isRoleGroupsEqual =
                selectedRoleGroups.length === role_groups.length &&
                selectedRoleGroups.every((group) =>
                    role_groups.some((g) => g.id === group.id),
                )
            return !(isRolesEqual && isRoleGroupsEqual)
        }
        return selectedRoles.length > 0 || selectedRoleGroups.length > 0
    }, [operate, selectedRoles, selectedRoleGroups, userDetails])

    useEffect(() => {
        if (open) {
            if (operate === OperateType.CONFIG_ROLE && userId) {
                getUserDetailsData()
            }
            return
        }
        setUserDetails(undefined)
        setSelectedRoles([])
        setSelectedRoleGroups([])
        setActiveTab('role')
    }, [open])

    // 获取用户详情
    const getUserDetailsData = async () => {
        try {
            const res = await getUserDetails(userId!)
            setUserDetails(res)
            setSelectedRoles(res?.roles || [])
            setSelectedRoleGroups(res?.role_groups || [])
        } catch (e) {
            formatError(e)
        }
    }

    const handleSave = async () => {
        try {
            setLoading(true)
            if (operate === OperateType.CONFIG_ROLE) {
                const { roles = [], role_groups = [] } = userDetails || {}
                const addRoles = selectedRoles.filter(
                    (role) => !roles.some((r) => r.id === role.id),
                )
                const removeRoles = roles.filter(
                    (role) => !selectedRoles.some((r) => r.id === role.id),
                )
                const addRoleGroups = selectedRoleGroups.filter(
                    (roleGroup) =>
                        !role_groups.some((g) => g.id === roleGroup.id),
                )
                const removeRoleGroups = role_groups.filter(
                    (roleGroup) =>
                        !selectedRoleGroups.some((g) => g.id === roleGroup.id),
                )
                await putUsersRoleBindings({
                    bindings: [
                        ...addRoles.map((role) => ({
                            user_id: userId!,
                            role_id: role.id,
                            state: 'Present',
                        })),
                        ...addRoleGroups.map((roleGroup) => ({
                            user_id: userId!,
                            role_group_id: roleGroup.id,
                            state: 'Present',
                        })),
                        ...removeRoles.map((role) => ({
                            user_id: userId!,
                            role_id: role.id,
                            state: 'Absent',
                        })),
                        ...removeRoleGroups.map((roleGroup) => ({
                            user_id: userId!,
                            role_group_id: roleGroup.id,
                            state: 'Absent',
                        })),
                    ],
                })
                message.success(__('配置成功'))
            } else {
                await putUsersRoleBindings({
                    user_ids: userIds!,
                    role_ids: selectedRoles.map((role) => role.id),
                    role_group_ids: selectedRoleGroups.map(
                        (roleGroup) => roleGroup.id,
                    ),
                    state: 'Present',
                })
                message.success(__('添加成功'))
            }
            onClose(true)
        } catch (e) {
            if (e.errorFields) {
                return
            }
            formatError(e)
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = (value: any[]) => {
        setSelectedRoles((prev) =>
            prev.filter((role) => !value.find((r) => r.id === role.id)),
        )
        setSelectedRoleGroups((prev) =>
            prev.filter(
                (roleGroup) => !value.find((r) => r.id === roleGroup.id),
            ),
        )
    }

    const tabs = [
        {
            key: 'role',
            label: __('角色'),
            children: '',
        },
        {
            key: 'roleGroup',
            label: __('角色组'),
            children: '',
        },
    ]

    return (
        <Modal
            title={
                operate === OperateType.CONFIG_ROLE
                    ? __('配置角色')
                    : __('添加角色')
            }
            width={640}
            maskClosable={false}
            open={open}
            onCancel={() => onClose()}
            destroyOnClose
            getContainer={false}
            bodyStyle={{
                height: 484,
                padding: '0 24px 16px 24px',
                display: 'flex',
                flexDirection: 'column',
            }}
            className={styles.configRoleModal}
            footer={[
                <Button onClick={() => onClose()} key="cancel">
                    {__('取消')}
                </Button>,
                <Tooltip
                    title={
                        !canSave
                            ? operate === OperateType.CONFIG_ROLE
                                ? __('请先选择需配置的角色/角色组')
                                : __('请先勾选需添加的角色/角色组')
                            : ''
                    }
                >
                    <Button
                        type="primary"
                        onClick={handleSave}
                        loading={loading}
                        key="confirm"
                        disabled={!canSave}
                    >
                        {__('确定')}
                    </Button>
                </Tooltip>,
            ]}
        >
            <Tabs
                items={tabs}
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key)}
            />
            <div className={styles['configRoleModal-content']}>
                {activeTab === 'role' && (
                    <RolesList
                        selectedRoles={selectedRoles}
                        onSelect={setSelectedRoles}
                    />
                )}
                {activeTab === 'roleGroup' && (
                    <RoleGroupList
                        selectedRoleGroups={selectedRoleGroups}
                        onSelect={setSelectedRoleGroups}
                    />
                )}
                <SelectedList
                    title={
                        operate === OperateType.CONFIG_ROLE
                            ? __('拥有的角色/角色组')
                            : __('已选角色/角色组')
                    }
                    selectedRoles={selectedRoles}
                    selectedRoleGroups={selectedRoleGroups}
                    onRemove={handleRemove}
                />
            </div>
        </Modal>
    )
}

export default ConfigRoleModal
