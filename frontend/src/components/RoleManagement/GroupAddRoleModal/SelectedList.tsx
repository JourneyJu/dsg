import React from 'react'
import { Button } from 'antd'
import { IRoleItem } from '@/core'
import styles from './styles.module.less'
import __ from './locale'
import RoleListItem from './RoleListItem'
import { renderEmpty } from '../helper'

interface ISelectedList {
    selectedRoles: IRoleItem[]
    onRemove: (value: IRoleItem[]) => void
}

const SelectedList: React.FC<ISelectedList> = ({ selectedRoles, onRemove }) => {
    return (
        <div className={styles.selectedList}>
            <div className={styles.top}>
                <span>{__('本次添加角色')}</span>
                <Button
                    size="small"
                    type="link"
                    onClick={() => onRemove(selectedRoles)}
                    disabled={selectedRoles.length === 0}
                >
                    {__('全部移除')}
                </Button>
            </div>
            <div className={styles.content}>
                {selectedRoles.length > 0
                    ? selectedRoles.map((role) => (
                          <RoleListItem
                              key={role.id}
                              role={role}
                              onRemove={() => onRemove([role])}
                              style={{ padding: '8px 8px 8px 16px' }}
                          />
                      ))
                    : renderEmpty()}
            </div>
        </div>
    )
}

export default SelectedList
