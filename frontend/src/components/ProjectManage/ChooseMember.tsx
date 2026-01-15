import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Checkbox, Collapse } from 'antd'
import Icon, { CaretRightOutlined, CloseOutlined } from '@ant-design/icons'
import classnames from 'classnames'
import { useSize } from 'ahooks'
import { cloneDeep, remove } from 'lodash'
import { IMember, IRoleGroup, getRoleIcons } from '@/core'
import Empty from '@/ui/Empty'
import styles from './styles.module.less'
import { getUserName } from './const'
import { AvatarOutlined } from '@/icons'
import { conbineSvg, getCurrentRoleIcon } from '../UserRoleManage/helper'
import __ from './locale'
import { SearchInput } from '@/ui'

const { Panel } = Collapse

interface IChooseMember {
    roleGroups: IRoleGroup[]
    onReturn: () => void
    value?: IMember[]
    onChange?: (value: IMember[]) => void
    visible: boolean
}
const ChooseMembers: React.FC<IChooseMember> = ({
    onReturn,
    value,
    onChange,
    roleGroups,
    visible,
}) => {
    const [dataSource, setDataSource] = useState<IRoleGroup[]>(roleGroups)

    const [selecedMembers, setSelectedMembers] = useState<IMember[]>(
        value || [],
    )

    const [searchValue, setSearchValue] = useState<string>()

    const [searchMembers, setSearchMembers] = useState<IMember[]>([])
    const [allRoleIcons, setAllRoleIcons] = useState<Array<any>>([])

    const collapseRef = useRef(null)
    const collapseWrapperRef = useRef(null)
    const collapseSize = useSize(collapseRef)
    const collapseWrapperSize = useSize(collapseWrapperRef)

    useEffect(() => {
        if (!visible) {
            setSearchValue('')
        }
    }, [visible])

    useEffect(() => {
        if (value) {
            setSelectedMembers(value)
        }
        getAllIcons()
    }, [value])

    // 全部成员列表
    const totalMembers = useMemo(() => {
        const roleGroupsData: Array<IMember> = dataSource
            .map((roleGroupData) => {
                return roleGroupData.members.map((member) => ({
                    ...member,
                    roles: [member.role_id],
                }))
            })
            .flat(1)
        const memberData: Array<IMember> = roleGroupsData.reduce(
            (preData: Array<IMember>, currentData): Array<IMember> => {
                if (
                    preData.length &&
                    preData.find((userData) => userData.id === currentData.id)
                ) {
                    return preData.map((userData) =>
                        userData.id === currentData.id
                            ? {
                                  ...userData,
                                  roles: [
                                      ...(userData?.roles || []),
                                      currentData.role_id,
                                  ],
                              }
                            : userData,
                    )
                }
                return [...preData, currentData]
            },
            [],
        )
        return memberData
    }, [dataSource])

    // 搜索成员
    useEffect(() => {
        const members: IMember[] = []
        dataSource.forEach((data) => {
            data.members.forEach((member) => members.push(member))
        })
        setSearchMembers(
            members.filter((m) =>
                m.name
                    ?.toLocaleLowerCase()
                    .includes((searchValue ?? '').toLocaleLowerCase()),
            ),
        )
    }, [searchValue])

    const triggerOnChange = (data) => {
        onChange?.(data)
    }

    useEffect(() => {
        setDataSource(roleGroups)
    }, [roleGroups])

    const expandIcon = ({ isActive }: any) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
    )

    // 选择成员
    const checkMember = (e, roleId, memberInfo) => {
        const { checked } = e.target
        const currentMember = selecedMembers.find(
            (selectedMember) => selectedMember.id === memberInfo?.id,
        )
        if (checked) {
            if (currentMember) {
                const temp = [
                    ...selecedMembers.map((selectedMember) =>
                        selectedMember.id === memberInfo?.id
                            ? {
                                  ...selectedMember,
                                  roles: [
                                      ...(selectedMember?.roles || []),
                                      roleId,
                                  ],
                              }
                            : selectedMember,
                    ),
                ]
                setSelectedMembers(temp)
                triggerOnChange(temp)
            } else {
                const temp = [
                    ...selecedMembers,
                    {
                        ...memberInfo,
                        roles: [roleId],
                    },
                ]
                setSelectedMembers(temp)
                triggerOnChange(temp)
            }
        } else if (
            currentMember &&
            currentMember.roles &&
            currentMember.roles.length > 1
        ) {
            const temp = [
                ...selecedMembers.map((selectedMember) => {
                    return selectedMember.id === memberInfo.id
                        ? {
                              ...currentMember,
                              roles: currentMember?.roles?.filter(
                                  (currentRoleId) => currentRoleId !== roleId,
                              ),
                          }
                        : selectedMember
                }),
            ]
            setSelectedMembers(temp)
            triggerOnChange(temp)
        } else {
            const temp = selecedMembers.filter((m) => m.id !== memberInfo.id)
            setSelectedMembers(temp)
            triggerOnChange(temp)
        }
    }

    const getAllIcons = async () => {
        const icons = await getRoleIcons()
        setAllRoleIcons(icons)
    }
    // 点击角色后的checkbox回调(批量选中或取消)
    const checkRole = (e, roleInfo) => {
        const { checked } = e.target
        let temp = cloneDeep(selecedMembers)

        if (!checked) {
            // 取消选中时， 去掉当前角色下的所有成员
            roleInfo.members.forEach((member) => {
                if (temp.find((m) => m.id === member.id)) {
                    temp = temp
                        .filter((selectedMember) => {
                            if (
                                selectedMember.id === member.id &&
                                selectedMember.roles &&
                                selectedMember.roles?.length === 1 &&
                                selectedMember.roles.includes(roleInfo.role_id)
                            ) {
                                return false
                            }
                            return true
                        })
                        .map((selectedMember) => {
                            if (
                                selectedMember.id === member.id &&
                                selectedMember.roles &&
                                selectedMember.roles?.length > 1
                            ) {
                                return {
                                    ...selectedMember,
                                    roles: selectedMember.roles?.filter(
                                        (courentRole) =>
                                            courentRole !== roleInfo.role_id,
                                    ),
                                }
                            }
                            return selectedMember
                        })
                }
            })
        } else {
            // 选中时，当前角色下的全部成员都选中
            roleInfo.members.forEach((member) => {
                if (!temp.find((m) => m.id === member.id)) {
                    temp.push({
                        ...member,
                        roles: [roleInfo.role_id],
                    })
                } else {
                    temp = temp.map((selectedMember) => {
                        if (
                            selectedMember.id === member.id &&
                            !selectedMember?.roles?.includes(roleInfo.role_id)
                        ) {
                            return {
                                ...selectedMember,
                                roles: [
                                    ...(selectedMember?.roles || []),
                                    roleInfo.role_id,
                                ],
                            }
                        }
                        return selectedMember
                    })
                }
            })
        }
        setSelectedMembers(temp)
        triggerOnChange(temp)
    }

    // 点击选中全部
    const checkAll = (e) => {
        const { checked } = e.target
        // 搜索时
        if (searchValue) {
            let temp = cloneDeep(selecedMembers)
            if (checked) {
                // 选中时，将当前搜索结果下的所有成员添加到选中列表
                searchMembers.forEach((searchMember) => {
                    const res = temp.find((m) => m.id === searchMember.id)
                    if (!res) {
                        temp.push({
                            ...searchMember,
                            roles: [searchMember.role_id],
                        })
                    } else if (
                        res &&
                        !res.roles?.includes(searchMember.role_id)
                    ) {
                        temp = temp.map((tempMember) =>
                            res?.id === tempMember.id
                                ? {
                                      ...tempMember,
                                      roles: [
                                          ...(tempMember.roles || []),
                                          searchMember.role_id,
                                      ],
                                  }
                                : tempMember,
                        )
                    }
                })
            } else {
                // 取消选中时， 去掉当前搜索结果下的所有成员
                remove(temp, (t) => {
                    return searchMembers.find((m) => m.id === t.id)
                })
            }
            setSelectedMembers(temp)
            triggerOnChange(temp)
            return
        }
        // 非搜索时
        if (checked) {
            setSelectedMembers(totalMembers)
            triggerOnChange(totalMembers)
        } else {
            setSelectedMembers([])
            triggerOnChange([])
        }
    }

    // 获取某角色下的成员中 已选的成员 eg: [1,2,3] in [1,5,6,7,8] => [1]
    const getSelectedRoleMembers = (members) => {
        return members.filter((m) => {
            const index = selecedMembers.findIndex((sm) => {
                return m.id === sm.id && sm?.roles?.includes(m.role_id)
            })
            return index !== -1
        })
    }

    // 获取角色checkbox中间状态
    const getIndeterminate = (roleInfo) => {
        const res = getSelectedRoleMembers(roleInfo.members)
        if (res.length !== 0 && res.length !== roleInfo.members.length) {
            return true
        }
        return false
    }

    // 获取角色checkbox选中状态
    const getRoleChecked = (roleInfo) => {
        const res = getSelectedRoleMembers(roleInfo.members)
        if (res.length === 0) {
            return false
        }
        return true
    }

    // 点击删除
    const handleDelete = (mId: string) => {
        const data = selecedMembers.filter((m) => m.id !== mId)
        setSelectedMembers(data)
        triggerOnChange(data)
    }

    // 全部清除
    const handleClearAll = () => {
        setSelectedMembers([])
        triggerOnChange([])
    }

    /**
     * 根据成员的角色id 获取角色字符串
     * @param rolesId 角色id
     * @param roles 当前项目相关的角色
     * @returns 角色名显示内容
     */
    const getRoleNamesFromIRoleGroup = (
        rolesId: Array<string>,
        roles: Array<IRoleGroup>,
    ) => {
        return rolesId
            .map((roleId) => {
                return roles.find((roleInfo) => roleInfo.role_id === roleId)
                    ?.role_name
            })
            .join('，')
    }

    // 成员项
    const getItem = (roleId, member: IMember) => {
        return (
            <div className={styles.item} key={`${member.id}-${member.role_id}`}>
                <div className={styles.memberWrapper}>
                    <div className={styles.avator}>
                        <AvatarOutlined />
                    </div>
                    <div className={styles.name} title={getUserName(member)}>
                        {getUserName(member)}
                    </div>
                </div>
                <Checkbox
                    onChange={(e) => checkMember(e, roleId, member)}
                    checked={
                        !!selecedMembers.find(
                            (selecedMember) =>
                                selecedMember.id === member.id &&
                                selecedMember.roles?.includes(roleId),
                        )
                    }
                    style={{
                        lineHeight: '44px',
                        width: 32,
                    }}
                />
            </div>
        )
    }

    // 搜索成员项
    const getSearchItem = (roleId, member: IMember) => {
        return (
            <div
                className={classnames(styles.item, styles.searchItem)}
                key={`${member.id}-${member.role_id}`}
            >
                <div className={styles.memberWrapper}>
                    <div className={styles.avator}>
                        <AvatarOutlined />
                    </div>
                    <div>
                        <div
                            className={styles.name}
                            title={getUserName(member)}
                        >
                            {getUserName(member)}
                        </div>
                        <div
                            className={styles.rolesName}
                            title={`${__('角色')}${__(
                                '：',
                            )} ${getRoleNamesFromIRoleGroup(
                                [member.role_id],
                                dataSource,
                            )}`}
                        >
                            {`${__('角色')}${__(
                                '：',
                            )} ${getRoleNamesFromIRoleGroup(
                                [member.role_id],
                                dataSource,
                            )}`}
                        </div>
                    </div>
                </div>
                <Checkbox
                    onChange={(e) => checkMember(e, roleId, member)}
                    checked={
                        !!selecedMembers.find(
                            (selecedMember) =>
                                selecedMember.id === member.id &&
                                selecedMember.roles?.includes(roleId),
                        )
                    }
                    style={{
                        lineHeight: '44px',
                        marginLeft: 14,
                    }}
                />
            </div>
        )
    }

    // 全选组件  搜索时控制搜索的数据  非搜索时控制全部数据
    const getCheckAllComp = () => {
        let indeterminate = false
        let checked = false
        // 搜索时，全选的checkbo中间状态
        if (totalMembers.length === 0 || selecedMembers.length === 0) {
            indeterminate = false
            checked = false
        } else if (searchValue) {
            let searchMemberSelectedCount = 0
            selecedMembers.forEach((selectedMember) => {
                searchMembers.forEach((searchMemeber) => {
                    if (searchMemeber.id === selectedMember.id) {
                        searchMemberSelectedCount += 1
                        if (
                            !selectedMember.roles?.includes(
                                searchMemeber.role_id,
                            )
                        ) {
                            indeterminate = true
                        }
                    }
                })
            })
            checked = searchMemberSelectedCount > 0 && !indeterminate
        } else if (
            selecedMembers.length !== 0 &&
            selecedMembers.length !== totalMembers.length
        ) {
            indeterminate = true
        } else {
            selecedMembers.forEach((selectedMember) => {
                totalMembers.forEach((totalMember) => {
                    if (
                        selectedMember.id === totalMember.id &&
                        selectedMember.roles?.length !==
                            totalMember.roles?.length
                    ) {
                        indeterminate = true
                    }
                })
            })
            checked = !indeterminate
        }
        return searchValue && searchMembers.length === 0 ? null : (
            <div
                className={classnames(
                    styles.checkWrapper,
                    // (collapseSize?.height || 0) >
                    //     (collapseWrapperSize?.height || 0) &&
                    //     styles.checkWrapperScroll,
                )}
            >
                <div>全选</div>
                <Checkbox
                    indeterminate={indeterminate}
                    checked={checked}
                    onChange={(e) => checkAll(e)}
                />
            </div>
        )
    }
    return (
        <div className={styles.chooseMemberWrapper}>
            {/* <div className={styles.return} onClick={onReturn}>
                <LeftOutlined className={styles.arrow} />
                <div className={styles.returnText}>{__('返回')}</div>
            </div> */}
            <div className={styles.chooseMemberTitle}>{__('选择成员')}</div>
            <div className={styles.content}>
                <div className={styles.left}>
                    <div className={styles.top}>
                        <SearchInput
                            placeholder={__('搜索成员')}
                            className={styles.memberName}
                            value={searchValue}
                            onKeyChange={(kw: string) => setSearchValue(kw)}
                        />
                        {getCheckAllComp()}
                    </div>

                    <div
                        className={styles.collapseWrapper}
                        ref={collapseWrapperRef}
                    >
                        <div className={styles.collapse} ref={collapseRef}>
                            {searchValue ? (
                                searchMembers.length > 0 ? (
                                    <>
                                        {searchMembers.map((member) =>
                                            getSearchItem(
                                                member.role_id,
                                                member,
                                            ),
                                        )}
                                    </>
                                ) : (
                                    <Empty />
                                )
                            ) : (
                                <>
                                    {dataSource.map((data) => {
                                        return (
                                            <Collapse
                                                ghost
                                                collapsible="header"
                                                key={data.role_id}
                                                expandIcon={(d) =>
                                                    expandIcon(d)
                                                }
                                            >
                                                <Panel
                                                    header={
                                                        <div
                                                            className={
                                                                styles.header
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    styles.listItem
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        styles.listIcon
                                                                    }
                                                                    style={{
                                                                        background:
                                                                            data?.role_color?.concat(
                                                                                'D9',
                                                                            ),
                                                                    }}
                                                                >
                                                                    <Icon
                                                                        component={() => {
                                                                            return conbineSvg(
                                                                                getCurrentRoleIcon(
                                                                                    allRoleIcons,
                                                                                    data.role_icon,
                                                                                ),
                                                                            )
                                                                        }}
                                                                        className={
                                                                            styles.icon
                                                                        }
                                                                    />
                                                                </div>
                                                                <div
                                                                    className={
                                                                        styles.listName
                                                                    }
                                                                    title={`${data?.role_name}(${data?.members?.length})`}
                                                                >
                                                                    {`${data?.role_name} (${data?.members?.length})`}
                                                                </div>
                                                            </div>
                                                            <Checkbox
                                                                indeterminate={getIndeterminate(
                                                                    data,
                                                                )}
                                                                checked={getRoleChecked(
                                                                    data,
                                                                )}
                                                                onChange={(e) =>
                                                                    checkRole(
                                                                        e,
                                                                        data,
                                                                    )
                                                                }
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                                disabled={
                                                                    data.members
                                                                        ?.length ===
                                                                    0
                                                                }
                                                            />
                                                        </div>
                                                    }
                                                    key={data.role_id}
                                                >
                                                    {data.members.length > 0 ? (
                                                        data.members.map(
                                                            (member) =>
                                                                getItem(
                                                                    data.role_id,
                                                                    member,
                                                                ),
                                                        )
                                                    ) : (
                                                        <div
                                                            className={
                                                                styles.noUserTips
                                                            }
                                                        >
                                                            {__(
                                                                '角色下暂无用户，请联系管理员添加',
                                                            )}
                                                        </div>
                                                    )}
                                                </Panel>
                                            </Collapse>
                                        )
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.right}>
                    <div className={styles.selectedAll}>
                        <span className={styles.count}>
                            {__('已选择')}
                            {__('：')}
                            {selecedMembers.length} {__('人')}
                        </span>
                        <span
                            className={classnames(
                                styles.clearAll,
                                selecedMembers.length === 0 &&
                                    styles.disabledClearAll,
                            )}
                            onClick={handleClearAll}
                        >
                            {__('全部移除')}
                        </span>
                    </div>
                    <div className={styles.selectedMemberWrapper}>
                        {selecedMembers.map((member) => (
                            <div
                                className={styles.selectedMember}
                                key={member.id}
                            >
                                <div className={styles.memberWrapper}>
                                    <div className={styles.avator}>
                                        <AvatarOutlined />
                                    </div>
                                    <div>
                                        <div
                                            className={styles.name}
                                            title={getUserName(member)}
                                        >
                                            {getUserName(member)}
                                        </div>
                                        <div
                                            className={styles.rolesName}
                                            title={`${__('角色')}${__(
                                                '：',
                                            )} ${getRoleNamesFromIRoleGroup(
                                                member?.roles || [],
                                                dataSource,
                                            )}`}
                                        >
                                            {`${__('角色')}${__(
                                                '：',
                                            )} ${getRoleNamesFromIRoleGroup(
                                                member?.roles || [],
                                                dataSource,
                                            )}`}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={styles.delIconContainer}
                                    onClick={() => handleDelete(member.id)}
                                >
                                    <CloseOutlined className={styles.delIcon} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChooseMembers
