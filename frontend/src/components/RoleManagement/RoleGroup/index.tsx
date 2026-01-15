import React, { useRef, useState } from 'react'
import classnames from 'classnames'
import dataEmpty from '@/assets/dataEmpty.svg'
import styles from './styles.module.less'
import Empty from '@/ui/Empty'
import __ from './locale'
import { OperateType } from '@/utils'
import CreateRoleGroupModal from './CreateRoleGroupModal'
import RoleGroupTable from './RoleGroupTable'
import { renderLoader } from '../helper'
import Role from '../Role'

const RoleGroup = () => {
    const roleGroupTableRef = useRef<any>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [createVisible, setCreateVisible] = useState<boolean>(false)
    // 整体是否为空
    const [isDataEmpty, setIsDataEmpty] = useState<boolean>(false)
    // 选中的角色组
    const [selectedRoleGroup, setSelectedRoleGroup] = useState<any>(null)

    return (
        <div className={styles.roleGroup}>
            {loading
                ? renderLoader()
                : isDataEmpty && (
                      <Empty
                          iconSrc={dataEmpty}
                          desc={
                              <div style={{ textAlign: 'center' }}>
                                  {__('点击【新建角色组】按钮创建角色组后，')}
                                  <br />
                                  {__('添加角色至角色组中')}
                              </div>
                          }
                          style={{ marginTop: 36, width: '100%' }}
                          iconHeight={144}
                          onAdd={() => setCreateVisible(true)}
                          btnText={__('新建角色组')}
                      />
                  )}
            <div
                className={classnames(styles['roleGroup-content'], {
                    [styles.contentHidden]: isDataEmpty || loading,
                })}
            >
                <RoleGroupTable
                    ref={roleGroupTableRef}
                    onInitEmpty={(empty) => {
                        setLoading(false)
                        setIsDataEmpty(empty)
                    }}
                    onSelect={(value) => {
                        setSelectedRoleGroup(value)
                    }}
                    selectedRoleGroup={selectedRoleGroup}
                />

                {selectedRoleGroup && (
                    <Role inRoleGroup selectedRoleGroup={selectedRoleGroup} />
                )}
            </div>

            {/* 新建 */}
            <CreateRoleGroupModal
                open={createVisible}
                operate={OperateType.CREATE}
                onClose={(refresh) => {
                    if (refresh) {
                        setLoading(true)
                        roleGroupTableRef?.current?.refresh()
                    }
                    setCreateVisible(false)
                }}
            />
        </div>
    )
}

export default RoleGroup
