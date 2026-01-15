import React, { useEffect, useMemo, useState } from 'react'
import {
    Button,
    Checkbox,
    Collapse,
    message,
    Modal,
    Space,
    Tooltip,
} from 'antd'
import { CaretRightOutlined, InfoCircleFilled } from '@ant-design/icons'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import {
    formatError,
    getRoleGroupsFrontendList,
    getRolesFrontendList,
    IRoleGroupItem,
    IRoleItem,
    IUserDetails,
    putUsersRoleBindings,
} from '@/core'
import __ from './locale'
import styles from './styles.module.less'
import { renderEmpty, renderLoader } from '../helper'
import { SearchInput } from '@/ui'
import RoleListItem from '../ConfigRoleModal/RoleListItem'

const { Panel } = Collapse

enum CategoryType {
    Roles = 'roles',
    RoleGroups = 'role_groups',
}

const categoryTypeText = {
    [CategoryType.Roles]: __('角色'),
    [CategoryType.RoleGroups]: __('角色组'),
}

interface IRemoveRoleModal {
    open: boolean
    userIds?: string[]
    onClose: (refresh?: boolean) => void
}

/** 移除角色 */
const RemoveRoleModal: React.FC<IRemoveRoleModal> = ({
    open,
    userIds = [],
    onClose,
}) => {
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [activeKey, setActiveKey] = useState<string[]>([])
    const [searchValue, setSearchValue] = useState('')
    // 本次添加角色列表
    const [selectedRoles, setSelectedRoles] = useState<IRoleItem[]>([])
    // 本次添加角色组列表
    const [selectedRoleGroups, setSelectedRoleGroups] = useState<
        IRoleGroupItem[]
    >([])
    // 列表数据
    const [listData, setListData] = useState<Record<string, any[]>>({})

    const canSave = useMemo(() => {
        return selectedRoles.length > 0 || selectedRoleGroups.length > 0
    }, [selectedRoles, selectedRoleGroups])

    const showList = useMemo(() => {
        if (!searchValue) {
            return listData
        }
        setActiveKey(Object.keys(listData))
        const searchData: Record<string, any[]> = {}
        Object.values(CategoryType).forEach((type) => {
            if (listData[type]) {
                searchData[type] = listData[type].filter((item) =>
                    item.name.toLowerCase().includes(searchValue.toLowerCase()),
                )
            }
        })
        return searchData
    }, [listData, searchValue])

    useEffect(() => {
        if (open && userIds.length) {
            getUserRelatedData()
        } else {
            setActiveKey([])
            setListData({})
            setSelectedRoles([])
            setSelectedRoleGroups([])
            setSearchValue('')
        }
    }, [open])

    // 获取用户关联角色/角色组数据
    const getUserRelatedData = async () => {
        try {
            setFetching(true)
            const [res1, res2] = await Promise.all([
                getRolesFrontendList({
                    user_ids: userIds.join(','),
                }),
                getRoleGroupsFrontendList({
                    user_ids: userIds.join(','),
                }),
            ])
            setListData({
                roles: res1?.entries || [],
                role_groups: res2?.entries || [],
            })
        } catch (e) {
            formatError(e)
        } finally {
            setFetching(false)
        }
    }

    const handleSave = async () => {
        try {
            setLoading(true)
            await putUsersRoleBindings({
                user_ids: userIds!,
                role_ids: selectedRoles.map((role) => role.id),
                role_group_ids: selectedRoleGroups.map(
                    (roleGroup) => roleGroup.id,
                ),
                state: 'Absent',
            })
            message.success(__('移除成功'))
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

    // 处理单选
    const handleCheck = (role: any, key: string) => (checked: boolean) => {
        if (checked) {
            if (key === CategoryType.Roles) {
                setSelectedRoles([...selectedRoles, role])
            } else {
                setSelectedRoleGroups([...selectedRoleGroups, role])
            }
        } else if (key === CategoryType.Roles) {
            setSelectedRoles(
                selectedRoles.filter((item) => item.id !== role.id),
            )
        } else {
            setSelectedRoleGroups(
                selectedRoleGroups.filter((item) => item.id !== role.id),
            )
        }
    }

    // 处理分类全选
    const handleCheckAll =
        (value: any[], key: string) => (e: CheckboxChangeEvent) => {
            let newSelectedArr: any[] =
                key === CategoryType.Roles
                    ? [...selectedRoles]
                    : [...selectedRoleGroups]
            value.forEach((item) => {
                if (e.target.checked) {
                    if (!newSelectedArr.find((role) => role.id === item.id)) {
                        newSelectedArr = [...newSelectedArr, item]
                    }
                } else {
                    newSelectedArr = newSelectedArr.filter(
                        (role) => role.id !== item.id,
                    )
                }
            })
            if (key === CategoryType.Roles) {
                setSelectedRoles(newSelectedArr)
            } else {
                setSelectedRoleGroups(newSelectedArr)
            }
        }

    // 检查分类是否全选
    const isAllChecked = (value: any[], key: string) => {
        if (key === CategoryType.Roles) {
            return (
                value.length > 0 &&
                value.every((item) =>
                    selectedRoles.find((role) => role.id === item.id),
                )
            )
        }
        return (
            value.length > 0 &&
            value.every((item) =>
                selectedRoleGroups.find(
                    (roleGroup) => roleGroup.id === item.id,
                ),
            )
        )
    }

    // 检查分类是否部分选中
    const isIndeterminate = (value: any[], key: string) => {
        if (key === CategoryType.Roles) {
            const checkedCount = value.filter((item) =>
                selectedRoles.find((role) => role.id === item.id),
            ).length
            return checkedCount > 0 && checkedCount < value.length
        }

        const checkedCount = value.filter((item) =>
            selectedRoleGroups.find((roleGroup) => roleGroup.id === item.id),
        ).length
        return checkedCount > 0 && checkedCount < value.length
    }

    const expandIcon = ({ isActive = false }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
    )

    const genExtra = (type: string, value: any[]) => {
        return (
            <Checkbox
                indeterminate={isIndeterminate(value, type)}
                checked={isAllChecked(value, type)}
                onChange={handleCheckAll(value, type)}
                disabled={value.length === 0}
                onClick={(e) => e.stopPropagation()}
            />
        )
    }

    const footer = (
        <div className={styles.footer}>
            <span className={styles.info}>
                <InfoCircleFilled style={{ color: '#1890ff', fontSize: 16 }} />
                {__('以上为勾选用户所拥有角色/角色组的并集')}
            </span>
            <Space size={8}>
                <Button onClick={() => onClose()} key="cancel">
                    {__('取消')}
                </Button>
                <Tooltip
                    title={!canSave ? __('请先勾选需移除的角色/角色组') : ''}
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
                </Tooltip>
            </Space>
        </div>
    )

    return (
        <Modal
            title={__('移除角色')}
            width={640}
            maskClosable={false}
            open={open}
            onCancel={() => onClose()}
            destroyOnClose
            getContainer={false}
            bodyStyle={{
                height: 484,
                padding: '16px 24px',
                display: 'flex',
                flexDirection: 'column',
            }}
            className={styles.removeRoleModal}
            footer={footer}
        >
            <div className={styles['removeRoleModal-content']}>
                {fetching ? (
                    renderLoader()
                ) : listData?.roles?.length || listData?.role_groups?.length ? (
                    <>
                        <div className={styles.searchInput}>
                            <SearchInput
                                style={{ width: '100%' }}
                                placeholder={__('搜索角色、角色组名称')}
                                value={searchValue}
                                onKeyChange={(val: string) => {
                                    if (val === searchValue) return
                                    setSearchValue(val)
                                }}
                            />
                        </div>
                        <Collapse
                            ghost
                            accordion={!searchValue}
                            expandIcon={expandIcon}
                            activeKey={activeKey}
                            onChange={(key) => {
                                setActiveKey(key as string[])
                            }}
                        >
                            {Object.entries(showList).map(([key, value]) => (
                                <Panel
                                    header={categoryTypeText[key]}
                                    key={key}
                                    extra={genExtra(key, value)}
                                >
                                    {value?.length > 0 ? (
                                        value.map((it) => {
                                            const checked =
                                                !!selectedRoles.find(
                                                    (role) => role.id === it.id,
                                                ) ||
                                                !!selectedRoleGroups.find(
                                                    (roleGroup) =>
                                                        roleGroup.id === it.id,
                                                )
                                            return (
                                                <RoleListItem
                                                    key={it.id}
                                                    role={
                                                        key ===
                                                        CategoryType.Roles
                                                            ? it
                                                            : undefined
                                                    }
                                                    roleGroup={
                                                        key ===
                                                        CategoryType.RoleGroups
                                                            ? it
                                                            : undefined
                                                    }
                                                    checked={checked}
                                                    onCheck={handleCheck(
                                                        it,
                                                        key,
                                                    )}
                                                />
                                            )
                                        })
                                    ) : searchValue ? (
                                        <div className={styles.noData}>
                                            {__('抱歉，没有找到相关内容')}
                                        </div>
                                    ) : (
                                        <div className={styles.noData}>
                                            {`${__('暂无')}${
                                                categoryTypeText[key]
                                            }`}
                                        </div>
                                    )}
                                </Panel>
                            ))}
                        </Collapse>
                    </>
                ) : (
                    renderEmpty(72, 144, __('暂无可移除角色/角色组'))
                )}
            </div>
        </Modal>
    )
}

export default RemoveRoleModal
