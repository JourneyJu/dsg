import React, { useEffect, useMemo, useState } from 'react'
import { Checkbox, Collapse } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { formatError, getRolesList, IRoleItem, RoleType } from '@/core'
import { SearchInput } from '@/ui'
import styles from './styles.module.less'
import __ from './locale'
import { renderLoader } from '../helper'
import RoleListItem from './RoleListItem'
import { roleTypeText } from '@/components/RoleManagement/const'

const { Panel } = Collapse

interface IRolesList {
    selectedRoles: IRoleItem[]
    onSelect: (roles: IRoleItem[]) => void
}

const RolesList: React.FC<IRolesList> = ({ selectedRoles, onSelect }) => {
    const [loading, setLoading] = useState(false)
    const [activeKey, setActiveKey] = useState<string[]>([])
    const [listData, setListData] = useState<Record<string, IRoleItem[]>>({})
    const [searchValue, setSearchValue] = useState('')

    const showList = useMemo(() => {
        if (!searchValue) {
            return listData
        }
        setActiveKey(Object.keys(listData))
        const searchData: Record<string, IRoleItem[]> = {}
        Object.values(RoleType).forEach((type) => {
            if (listData[type]) {
                searchData[type] = listData[type].filter((item) =>
                    item.name.toLowerCase().includes(searchValue.toLowerCase()),
                )
            }
        })
        return searchData
    }, [listData, searchValue])

    useEffect(() => {
        getRoleListData()
    }, [])

    // 获取角色列表
    const getRoleListData = async () => {
        try {
            setLoading(true)
            const res = await getRolesList()
            const data = res?.entries?.reduce((acc, item) => {
                const { type } = item
                if (!acc[type]) {
                    acc[type] = []
                }
                acc[type].push(item)
                return acc
            }, {} as Record<string, IRoleItem[]>)
            const orderedData: Record<string, IRoleItem[]> = {}
            Object.values(RoleType).forEach((type) => {
                if (data[type]) {
                    orderedData[type] = data[type]
                } else {
                    orderedData[type] = []
                }
            })
            setListData(orderedData)
        } catch (e) {
            formatError(e)
        } finally {
            setLoading(false)
        }
    }

    const expandIcon = ({ isActive = false }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
    )

    // 处理单选
    const handleCheck = (role: IRoleItem) => (checked: boolean) => {
        if (checked) {
            onSelect([...selectedRoles, role])
        } else {
            onSelect(selectedRoles.filter((item) => item.id !== role.id))
        }
    }

    // 处理分类全选
    const handleCheckAll = (value: IRoleItem[]) => (e: CheckboxChangeEvent) => {
        let newSelectedArr = [...selectedRoles]
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
        onSelect(newSelectedArr)
    }

    // 检查分类是否全选
    const isAllChecked = (value: IRoleItem[]) => {
        return (
            value.length > 0 &&
            value.every((item) =>
                selectedRoles.find((role) => role.id === item.id),
            )
        )
    }

    // 检查分类是否部分选中
    const isIndeterminate = (value: IRoleItem[]) => {
        const checkedCount = value.filter((item) =>
            selectedRoles.find((role) => role.id === item.id),
        ).length
        return checkedCount > 0 && checkedCount < value.length
    }

    const genExtra = (type: string, value: IRoleItem[]) => {
        return (
            <Checkbox
                indeterminate={isIndeterminate(value)}
                checked={isAllChecked(value)}
                onChange={handleCheckAll(value)}
                disabled={value.length === 0}
                onClick={(e) => e.stopPropagation()}
            />
        )
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
                            placeholder={__('搜索角色名称')}
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
                                header={roleTypeText[key]}
                                key={key}
                                extra={genExtra(key, value)}
                            >
                                {value?.length > 0 ? (
                                    value.map((it) => {
                                        const checked = !!selectedRoles.find(
                                            (role) => role.id === it.id,
                                        )
                                        return (
                                            <RoleListItem
                                                key={it.id}
                                                role={it}
                                                checked={checked}
                                                onCheck={handleCheck(it)}
                                            />
                                        )
                                    })
                                ) : searchValue ? (
                                    <div className={styles.noData}>
                                        {__('抱歉，没有找到相关内容')}
                                    </div>
                                ) : (
                                    <div className={styles.noData}>
                                        {`${__('暂无')}${roleTypeText[key]}`}
                                    </div>
                                )}
                            </Panel>
                        ))}
                    </Collapse>
                </>
            )}
        </div>
    )
}

export default RolesList
