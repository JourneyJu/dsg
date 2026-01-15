import * as React from 'react'
import ReactDOM from 'react-dom'
import { useState } from 'react'
import Split from 'react-split'
import { CheckCircleFilled, InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import RoleList from './RoleList'
import styles from './styles.module.less'
import __ from './locale'
import RoleUserTable from './RoleUserTable'
import { userRoleTipsConfig } from './helper'
import { useGeneralConfig } from '@/hooks/useGeneralConfig'

/** 废弃 */
const UserRoleManage = () => {
    const [selectedRole, setSelectedRole] = useState<any>(null)
    const [addUserStatus, setAddUserStatus] = useState<boolean>(false)
    const [defaultSize, setDefaultSize] = useState<Array<number>>([15, 85])

    const [{ local_app }] = useGeneralConfig()

    const getSelectedRole = (role) => {
        setSelectedRole(role)
    }

    const setAddUserState = (status: boolean) => {
        setAddUserStatus(status)
    }
    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <RoleList
                    onSelectedRole={getSelectedRole}
                    onSetAddUserState={setAddUserState}
                />
            </div>
            <div className={styles.roleUserContent}>
                <div className={styles.roleUserTitle}>
                    {selectedRole?.name || ''}
                    <Tooltip
                        autoAdjustOverflow={false}
                        color="white"
                        placement="bottom"
                        getPopupContainer={(node) =>
                            node.parentElement as HTMLElement
                        }
                        title={
                            <div className={styles.roleTipsWrapper}>
                                <div className={styles.roleName}>
                                    {selectedRole?.name}
                                </div>
                                {userRoleTipsConfig[selectedRole?.name]
                                    ?.definition && (
                                    <div className={styles.definition}>
                                        {
                                            userRoleTipsConfig[
                                                selectedRole?.name
                                            ]?.definition
                                        }
                                    </div>
                                )}
                                <div className={styles.line} />
                                <div className={styles.scopeWrapper}>
                                    <div className={styles.label}>
                                        权限范围：
                                    </div>
                                    <div className={styles.scopeItems}>
                                        {userRoleTipsConfig[
                                            selectedRole?.name
                                        ]?.authorityScope
                                            ?.filter((item, index) => {
                                                if (
                                                    !local_app &&
                                                    index === 2 &&
                                                    selectedRole?.name ===
                                                        '应用开发者'
                                                ) {
                                                    return false
                                                }
                                                return true
                                            })
                                            .map((item) => (
                                                <div
                                                    className={styles.item}
                                                    key={item}
                                                >
                                                    <CheckCircleFilled
                                                        className={
                                                            styles.tipIcon
                                                        }
                                                    />
                                                    <div>{item}</div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        }
                    >
                        <InfoCircleOutlined className={styles.titleTipIcon} />
                    </Tooltip>
                </div>

                <RoleUserTable
                    selectedRole={selectedRole}
                    addUsersStatus={addUserStatus}
                    onSetAddUserState={setAddUserState}
                />
            </div>
        </div>
    )
}

export default UserRoleManage
