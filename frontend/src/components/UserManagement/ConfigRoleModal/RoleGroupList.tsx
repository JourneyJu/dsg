import React, { useEffect, useMemo, useState } from 'react'
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import {
    formatError,
    getRoleGroupsList,
    IRoleGroupItem,
    IRoleItem,
} from '@/core'
import { Empty, SearchInput } from '@/ui'
import styles from './styles.module.less'
import __ from './locale'
import { renderLoader } from '../helper'
import RoleListItem from './RoleListItem'
import dataEmpty from '@/assets/dataEmpty.svg'

interface IRoleGroupList {
    selectedRoleGroups: IRoleGroupItem[]
    onSelect: (roleGroups: IRoleGroupItem[]) => void
}

const RoleGroupList: React.FC<IRoleGroupList> = ({
    selectedRoleGroups,
    onSelect,
}) => {
    const [loading, setLoading] = useState(false)
    const [listData, setListData] = useState<IRoleGroupItem[]>([])
    const [searchValue, setSearchValue] = useState('')

    const showList = useMemo(() => {
        if (!searchValue) {
            return listData
        }
        return listData.filter((item) =>
            item.name.toLowerCase().includes(searchValue.toLowerCase()),
        )
    }, [listData, searchValue])

    useEffect(() => {
        getRoleGroupListData()
    }, [])

    // 获取角色组列表
    const getRoleGroupListData = async () => {
        try {
            setLoading(true)
            const res = await getRoleGroupsList()
            setListData(res.entries || [])
        } catch (e) {
            formatError(e)
        } finally {
            setLoading(false)
        }
    }

    // 处理单选
    const handleCheck = (roleGroup: IRoleGroupItem) => (checked: boolean) => {
        if (checked) {
            onSelect([...selectedRoleGroups, roleGroup])
        } else {
            onSelect(
                selectedRoleGroups.filter((item) => item.id !== roleGroup.id),
            )
        }
    }

    // 处理分类全选
    const handleCheckAll =
        (value: IRoleGroupItem[]) => (e: CheckboxChangeEvent) => {
            let newSelectedArr = [...selectedRoleGroups]
            value.forEach((item) => {
                if (e.target.checked) {
                    if (
                        !newSelectedArr.find(
                            (roleGroup) => roleGroup.id === item.id,
                        )
                    ) {
                        newSelectedArr = [...newSelectedArr, item]
                    }
                } else {
                    newSelectedArr = newSelectedArr.filter(
                        (roleGroup) => roleGroup.id !== item.id,
                    )
                }
            })
            onSelect(newSelectedArr)
        }

    // 检查分类是否全选
    const isAllChecked = (value: IRoleGroupItem[]) => {
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
    const isIndeterminate = (value: IRoleGroupItem[]) => {
        const checkedCount = value.filter((item) =>
            selectedRoleGroups.find((roleGroup) => roleGroup.id === item.id),
        ).length
        return checkedCount > 0 && checkedCount < value.length
    }

    return (
        <div className={styles.rolesList}>
            {loading ? (
                renderLoader()
            ) : (
                <>
                    <div className={styles.searchInput}>
                        <SearchInput
                            style={{ width: '100%' }}
                            placeholder={__('搜索角色组名称')}
                            value={searchValue}
                            onKeyChange={(val: string) => {
                                if (val === searchValue) return
                                setSearchValue(val)
                            }}
                        />
                    </div>
                    {showList.length > 0 ? (
                        <>
                            <div className={styles.checkAll}>
                                <span>{__('全选')}</span>
                                <Checkbox
                                    indeterminate={isIndeterminate(showList)}
                                    checked={isAllChecked(showList)}
                                    onChange={handleCheckAll(showList)}
                                    disabled={showList.length === 0}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                            <div className={styles.listContent}>
                                {showList.map((item) => {
                                    const checked = !!selectedRoleGroups.find(
                                        (roleGroup) => roleGroup.id === item.id,
                                    )
                                    return (
                                        <RoleListItem
                                            key={item.id}
                                            roleGroup={item}
                                            checked={checked}
                                            onCheck={handleCheck(item)}
                                        />
                                    )
                                })}
                            </div>
                        </>
                    ) : searchValue ? (
                        <Empty style={{ marginTop: 36 }} />
                    ) : (
                        <Empty
                            iconSrc={dataEmpty}
                            desc={__('暂无角色组')}
                            style={{ marginTop: 36 }}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default RoleGroupList
