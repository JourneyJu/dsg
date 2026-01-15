import React, { useEffect, useMemo, useState } from 'react'
import {
    Radio,
    Button,
    Breadcrumb,
    Checkbox,
    Tooltip,
    message,
    Drawer,
    DrawerProps,
    Popover,
    Space,
} from 'antd'
import { omit } from 'lodash'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import {
    formatError,
    getRoleDetails,
    getUserDetails,
    IPermissions,
    PermissionCategory,
    permissionMap,
    PermissionScope,
    putRolePermissions,
    putUsersPermissions,
} from '@/core'
import { permissionCategoryText, permissionScopeText } from '../const'
import styles from './styles.module.less'
import __ from './locale'
import { renderLoader } from '../helper'
import { usePermission } from '../usePermission'
import { LightweightSearch, SearchInput } from '@/ui'
import { SearchType } from '@/ui/LightweightSearch/const'
import { useGeneralConfig } from '@/hooks/useGeneralConfig'

interface IConfigPermission extends DrawerProps {
    id?: string
    fromMenu?: 'role' | 'user'
    onClose: () => void
}

/** 配置权限 */
const ConfigPermission: React.FC<IConfigPermission> = ({
    id = '',
    fromMenu = 'role',
    open,
    onClose,
}) => {
    const [{ governmentSwitch }] = useGeneralConfig()
    const [permission] = usePermission()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [searchCondition, setSearchCondition] = useState<{
        keyword: string
        type: string
    }>({
        keyword: '',
        type: '',
    })

    // 默认权限
    const defaultPermissions = ['8860f32c-e57f-4d01-979a-bd26654596fd']

    // 不需要配置的权限
    const noConfigPermissions: string[] = []

    // 不属于本组织的权限
    const noOrganizationPermissions = ['f077a70c-37c9-46fd-a805-3a4265fb28b0']

    // 上次配置权限
    const [initPermissions, setInitPermissions] = useState<{
        scope: string
        permissions_ids: string[]
    }>({
        scope: PermissionScope.Organization,
        permissions_ids: [],
    })
    // 当前配置权限
    const [configPermissions, setConfigPermissions] = useState<{
        scope: string
        permissions_ids: string[]
    }>({
        scope: PermissionScope.Organization,
        permissions_ids: [],
    })

    // 权限分类
    const categoryPers = useMemo(() => {
        const data = permission.reduce((acc, cur) => {
            const { category } = cur
            if (
                !governmentSwitch.on &&
                category === PermissionCategory.SszdZone
            ) {
                return acc
            }
            if (!acc[category]) {
                acc[category] = []
            }
            if (noConfigPermissions.includes(cur.id)) {
                return acc
            }
            if (
                configPermissions.scope === PermissionScope.Organization &&
                noOrganizationPermissions.includes(cur.id)
            ) {
                return acc
            }
            acc[category].push(cur)
            return acc
        }, {} as Record<string, IPermissions[]>)

        // 按照 PermissionCategory 定义的顺序排序
        const orderedData: Record<string, IPermissions[]> = {}
        Object.values(PermissionCategory).forEach((category) => {
            if (data[category]) {
                orderedData[category] = data[category]
            }
        })

        if (configPermissions.scope === PermissionScope.All) {
            return omit(orderedData, [PermissionCategory.BasicPermission])
        }
        return omit(orderedData, [PermissionCategory.BasicPermission])
    }, [permission, configPermissions.scope, governmentSwitch.on])

    const showCategoryPers = useMemo(() => {
        const { keyword, type } = searchCondition
        let temp = {}
        // 根据类型过滤
        if (type) {
            temp[type] = categoryPers[type]
        } else {
            temp = categoryPers
        }
        // 根据关键字过滤
        if (keyword) {
            return Object.keys(temp).reduce((acc, cur) => {
                acc[cur] = temp[cur].filter((item) => {
                    return item.name
                        .toLowerCase()
                        .includes(keyword.toLowerCase())
                })
                return acc
            }, {} as Record<string, IPermissions[]>)
        }
        return temp
    }, [categoryPers, searchCondition])

    const hasChanged = useMemo(() => {
        if (!initPermissions?.permissions_ids.length) {
            return configPermissions?.permissions_ids.length
        }
        return (
            initPermissions?.scope !== configPermissions?.scope ||
            initPermissions?.permissions_ids.length !==
                configPermissions?.permissions_ids.length ||
            !initPermissions?.permissions_ids?.every((it) =>
                configPermissions?.permissions_ids?.includes(it),
            )
        )
    }, [initPermissions, configPermissions])

    // 保存权限
    const handleSave = async () => {
        try {
            setFetching(true)
            let req
            if (fromMenu === 'role') {
                req = putRolePermissions
            } else {
                req = putUsersPermissions
            }
            let newPer =
                configPermissions?.permissions_ids?.filter((item) => {
                    const per = permission.find((it) => it.id === item)
                    if (
                        !governmentSwitch.on &&
                        per?.category === PermissionCategory.SszdZone
                    ) {
                        return false
                    }
                    return true
                }) || []
            newPer =
                newPer.length > 0 ? [...newPer, ...defaultPermissions] : newPer
            if (configPermissions.scope === PermissionScope.All) {
                await req(id, {
                    scope: configPermissions?.scope,
                    permissions: newPer,
                })
            } else {
                await req(id, {
                    scope: configPermissions?.scope,
                    permissions: newPer.filter(
                        (item) => !noOrganizationPermissions.includes(item),
                    ),
                })
            }
            message.success(__('配置成功'))
            onClose()
        } catch (error) {
            formatError(error)
        } finally {
            setFetching(false)
        }
    }

    // 获取权限
    const getPermissions = async () => {
        try {
            setLoading(true)
            let pers
            if (fromMenu === 'role') {
                const res = await getRoleDetails(id)
                pers = {
                    scope: res.scope || PermissionScope.Organization,
                    permissions_ids:
                        res?.permissions?.map((item) => item.id) || [],
                }
            } else {
                // 使用 getUserDetails 替代已废弃的 getUsersPermissions
                const res = await getUserDetails(id)
                const permissionsList = res?.permissions || []
                const scopeValue =
                    permissionsList.length > 0
                        ? (permissionsList[0].scope as PermissionScope)
                        : PermissionScope.Organization

                pers = {
                    scope: scopeValue,
                    permissions_ids: permissionsList.map((p) => p.id),
                }
            }

            setInitPermissions(pers)
            setConfigPermissions(pers)
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id && open) {
            getPermissions()
        } else {
            setSearchCondition({
                keyword: '',
                type: '',
            })
        }
    }, [id, open])

    // 处理单个权限选择
    const handlePermissionChange =
        (permissionId: string) => (e: CheckboxChangeEvent) => {
            const newSelectedPermissions = new Set(
                configPermissions.permissions_ids,
            )
            if (e.target.checked) {
                newSelectedPermissions.add(permissionId)
            } else {
                newSelectedPermissions.delete(permissionId)
            }
            setConfigPermissions({
                ...configPermissions,
                permissions_ids: Array.from(newSelectedPermissions),
            })
        }

    // 处理分类全选
    const handleCheckAll = (type: string) => (e: CheckboxChangeEvent) => {
        const newSelectedPermissions = new Set(
            configPermissions.permissions_ids,
        )
        showCategoryPers[type]?.forEach((item) => {
            if (e.target.checked) {
                newSelectedPermissions.add(item.id)
            } else {
                newSelectedPermissions.delete(item.id)
            }
        })
        setConfigPermissions({
            ...configPermissions,
            permissions_ids: Array.from(newSelectedPermissions),
        })
    }

    // 检查分类是否全选
    const isAllChecked = (type: string) => {
        if (!showCategoryPers[type]?.length) {
            return false
        }
        return showCategoryPers[type].every((item) =>
            configPermissions.permissions_ids.includes(item.id),
        )
    }

    // 检查分类是否部分选中
    const isIndeterminate = (type: string) => {
        if (!showCategoryPers[type]?.length) {
            return false
        }
        const checkedCount = showCategoryPers[type].filter((item) =>
            configPermissions.permissions_ids.includes(item.id),
        ).length
        return checkedCount > 0 && checkedCount < showCategoryPers[type].length
    }

    const permTooltip = (value: IPermissions) => {
        const desc: string[] =
            Object.values(permissionMap).find((item) => item.id === value.id)
                ?.description?.[configPermissions.scope] || []
        if (desc.length) {
            return desc.map((item) => <div key={item}>{item}</div>)
        }
        return ''
    }

    return (
        <Drawer
            open={open}
            onClose={onClose}
            width="100%"
            headerStyle={{ display: 'none' }}
            bodyStyle={{ padding: 0 }}
            getContainer={false}
            mask={false}
            zIndex={999}
            destroyOnClose
        >
            <div className={styles.configPermission}>
                <Breadcrumb className={styles.header}>
                    <Breadcrumb.Item
                        onClick={() => onClose()}
                        className={styles.breadcrumbItem}
                    >
                        {fromMenu === 'role' ? __('角色') : __('用户管理')}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className={styles.breadcrumbCurrent}>
                        {__('配置权限')}
                    </Breadcrumb.Item>
                </Breadcrumb>

                <div className={styles.permissionContainer}>
                    {loading ? (
                        renderLoader()
                    ) : (
                        <>
                            <div className={styles.permissionOperation}>
                                <div>
                                    <span>{__('权限范围：')}</span>
                                    <Radio.Group
                                        value={configPermissions.scope}
                                        onChange={(e) =>
                                            setConfigPermissions({
                                                ...configPermissions,
                                                scope: e.target.value,
                                            })
                                        }
                                    >
                                        <Radio value={PermissionScope.All}>
                                            {
                                                permissionScopeText[
                                                    PermissionScope.All
                                                ]
                                            }
                                        </Radio>
                                        <Radio
                                            value={PermissionScope.Organization}
                                        >
                                            {
                                                permissionScopeText[
                                                    PermissionScope.Organization
                                                ]
                                            }
                                        </Radio>
                                    </Radio.Group>
                                </div>
                                <Space size={8}>
                                    <SearchInput
                                        style={{
                                            width: 272,
                                        }}
                                        placeholder={__('搜索权限名称')}
                                        value={searchCondition?.keyword}
                                        onKeyChange={(val: string) => {
                                            if (
                                                val === searchCondition?.keyword
                                            )
                                                return
                                            setSearchCondition({
                                                ...searchCondition,
                                                keyword: val,
                                            })
                                        }}
                                    />
                                    <LightweightSearch
                                        formData={[
                                            {
                                                label: __('权限类型'),
                                                key: 'type',
                                                options: [
                                                    {
                                                        value: '',
                                                        label: __('不限'),
                                                    },
                                                    ...Object.values(
                                                        PermissionCategory,
                                                    )
                                                        .filter((item) => {
                                                            if (
                                                                item ===
                                                                PermissionCategory.BasicPermission
                                                            ) {
                                                                return false
                                                            }
                                                            if (
                                                                item ===
                                                                PermissionCategory.SszdZone
                                                            ) {
                                                                return governmentSwitch.on
                                                            }
                                                            return true
                                                        })
                                                        .map((item) => ({
                                                            value: item,
                                                            label: permissionCategoryText[
                                                                item as PermissionCategory
                                                            ],
                                                        })),
                                                ],
                                                type: SearchType.Radio,
                                            },
                                        ]}
                                        onChange={(data, key) => {
                                            if (!key) {
                                                // 重置
                                                setSearchCondition((prev) => ({
                                                    ...prev,
                                                    ...data,
                                                }))
                                            } else {
                                                setSearchCondition((prev) => ({
                                                    ...prev,
                                                    [key]: data[key],
                                                }))
                                            }
                                        }}
                                        defaultValue={{ type: '' }}
                                    />
                                </Space>
                            </div>
                            {Object.keys(showCategoryPers).map((type) => (
                                <div className={styles.permissionSection}>
                                    <div className={styles.sectionTitle}>
                                        <div className={styles.block} />
                                        <span>
                                            「
                                            {
                                                permissionCategoryText[
                                                    type as PermissionCategory
                                                ]
                                            }
                                            」：
                                        </span>
                                        <div className={styles.permissionItem}>
                                            <Checkbox
                                                indeterminate={isIndeterminate(
                                                    type,
                                                )}
                                                checked={isAllChecked(type)}
                                                onChange={handleCheckAll(type)}
                                                disabled={
                                                    !showCategoryPers[type]
                                                        ?.length
                                                }
                                            >
                                                {__('全选')}
                                            </Checkbox>
                                        </div>
                                    </div>
                                    <div className={styles.permissionList}>
                                        {showCategoryPers[type]?.map((it) => (
                                            <div
                                                key={it.id}
                                                className={
                                                    styles.permissionItem
                                                }
                                            >
                                                <Checkbox
                                                    checked={configPermissions.permissions_ids.includes(
                                                        it.id,
                                                    )}
                                                    onChange={handlePermissionChange(
                                                        it.id,
                                                    )}
                                                >
                                                    <Tooltip
                                                        title={permTooltip(it)}
                                                        trigger={['click']}
                                                        color="#fff"
                                                        overlayInnerStyle={{
                                                            color: 'rgba(0,0,0,0.85)',
                                                        }}
                                                    >
                                                        <span
                                                            className={
                                                                styles.permissionName
                                                            }
                                                        >
                                                            {it.name}
                                                        </span>
                                                    </Tooltip>
                                                </Checkbox>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
                <div className={styles.footer}>
                    <Button onClick={onClose}>{__('取消')}</Button>
                    <Tooltip title={!hasChanged ? __('请先勾选权限') : ''}>
                        <Button
                            type="primary"
                            onClick={handleSave}
                            disabled={!hasChanged || loading}
                            loading={fetching}
                        >
                            {__('确定')}
                        </Button>
                    </Tooltip>
                </div>
            </div>
        </Drawer>
    )
}

export default ConfigPermission
