import React from 'react'
import { Button } from 'antd'
import { IRoleGroupItem, IRoleItem } from '@/core'
import styles from './styles.module.less'
import __ from './locale'
import RoleListItem from './RoleListItem'
import { renderEmpty } from '../helper'

interface ISelectedList {
    title?: string
    selectedRoles: IRoleItem[]
    selectedRoleGroups: IRoleGroupItem[]
    onRemove: (value: any[]) => void
}

const SelectedList: React.FC<ISelectedList> = ({
    title = __('已选角色/角色组'),
    selectedRoles,
    selectedRoleGroups,
    onRemove,
}) => {
    return (
        <div className={styles.selectedList}>
            <div className={styles.top}>
                <span>{title}</span>
                <Button
                    size="small"
                    type="link"
                    onClick={() =>
                        onRemove([...selectedRoles, ...selectedRoleGroups])
                    }
                    disabled={
                        selectedRoles.length === 0 &&
                        selectedRoleGroups.length === 0
                    }
                >
                    {__('全部移除')}
                </Button>
            </div>
            <div className={styles.content}>
                {selectedRoles.length > 0 || selectedRoleGroups.length > 0 ? (
                    <>
                        {selectedRoles.map((role) => (
                            <RoleListItem
                                key={role.id}
                                role={role}
                                onRemove={() => onRemove([role])}
                                style={{ padding: '8px 8px 8px 16px' }}
                            />
                        ))}
                        {selectedRoleGroups.map((roleGroup) => (
                            <RoleListItem
                                key={roleGroup.id}
                                roleGroup={roleGroup}
                                onRemove={() => onRemove([roleGroup])}
                                style={{ padding: '8px 8px 8px 16px' }}
                            />
                        ))}
                    </>
                ) : (
                    renderEmpty()
                )}
            </div>
        </div>
    )
}

export default SelectedList
