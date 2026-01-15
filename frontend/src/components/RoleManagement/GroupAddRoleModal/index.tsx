import React, { useEffect, useState } from 'react'
import { Button, message, Modal, Tooltip } from 'antd'
import {
    formatError,
    getRolesFrontendList,
    IRoleItem,
    putRoleGroupRoleBindings,
} from '@/core'
import __ from './locale'
import styles from './styles.module.less'
import RolesList from './RolesList'
import SelectedList from './SelectedList'

interface IAddRoleModal {
    open: boolean
    // 角色组id
    id?: string
    onClose: (refresh?: boolean) => void
}

/** 角色组添加角色 */
const GroupAddRoleModal: React.FC<IAddRoleModal> = ({ open, id, onClose }) => {
    const [loading, setLoading] = useState(false)
    // 当前角色组角色列表
    const [groupRoleList, setGroupRoleList] = useState<any[]>([])
    // 本次添加角色列表
    const [selectedRoles, setSelectedRoles] = useState<any[]>([])

    useEffect(() => {
        if (open && id) {
            getRoleList()
        } else {
            setGroupRoleList([])
            setSelectedRoles([])
        }
    }, [open])

    const getRoleList = async () => {
        try {
            const res = await getRolesFrontendList({
                role_group_id: id,
            })
            setGroupRoleList(res?.entries || [])
        } catch (e) {
            formatError(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setLoading(true)
            await putRoleGroupRoleBindings({
                role_group_ids: [id!],
                role_ids: selectedRoles.map((role) => role.id),
                state: 'Present',
            })
            message.success(__('添加成功'))
            onClose(true)
        } catch (e) {
            if (e.errorFields) {
                return
            }
            formatError(e)
        }
    }

    const handleRemove = (value: IRoleItem[]) => {
        setSelectedRoles((prev) =>
            prev.filter((role) => !value.find((r) => r.id === role.id)),
        )
    }

    return (
        <Modal
            title={__('添加角色')}
            width={640}
            maskClosable={false}
            open={open}
            onCancel={() => onClose()}
            destroyOnClose
            getContainer={false}
            bodyStyle={{ height: 484, padding: '16px 24px' }}
            className={styles.groupAddRoleModal}
            footer={[
                <Button onClick={() => onClose()} key="cancel">
                    {__('取消')}
                </Button>,
                <Tooltip
                    title={
                        selectedRoles.length === 0
                            ? __('请先勾选需添加的角色')
                            : ''
                    }
                >
                    <Button
                        type="primary"
                        onClick={handleSave}
                        loading={loading}
                        key="confirm"
                        disabled={selectedRoles.length === 0}
                    >
                        {__('确定')}
                    </Button>
                </Tooltip>,
            ]}
        >
            <div className={styles['groupAddRoleModal-content']}>
                <RolesList
                    selectedRoles={selectedRoles}
                    onSelect={setSelectedRoles}
                    disabledRoleIds={groupRoleList.map((role) => role.id)}
                />
                <SelectedList
                    selectedRoles={selectedRoles}
                    onRemove={handleRemove}
                />
            </div>
        </Modal>
    )
}

export default GroupAddRoleModal
