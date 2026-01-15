import { Descriptions, Drawer, type DrawerProps } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { isEmpty, last, omit } from 'lodash'
import {
    formatError,
    getUserDetails,
    IUserDetails,
    PermissionCategory,
    PermissionScope,
} from '@/core'
import __ from './locale'
import styles from './styles.module.less'
import { formatTime } from '@/utils'
import RoleTag from './RoleTag'
import RoleGroupDetails from './RoleGroupDetails'
import AuthTag from '../RoleManagement/Role/Details/AuthTag'
import {
    permissionCategoryText,
    permissionScopeText,
} from '../RoleManagement/const'
import { renderLoader } from './helper'

interface DetailsProps extends DrawerProps {
    userId?: string
}

const Details = ({ open, userId, ...rest }: DetailsProps) => {
    const [loading, setLoading] = useState(false)
    const [details, setDetails] = useState<IUserDetails>()
    const [opItem, setOpItem] = useState<any>()

    const pers = useMemo(() => {
        if (!details?.permissions) return {}
        const res = details.permissions.reduce((acc, cur) => {
            const { category } = cur
            if (!acc[category]) {
                acc[category] = []
            }
            const index = acc[category].findIndex((it) => it.id === cur.id)
            if (index !== -1) {
                if (cur.scope === PermissionScope.All) {
                    acc[category].splice(index, 1, cur)
                }
            } else {
                acc[category].push(cur)
            }
            return acc
        }, {} as Record<string, any[]>)
        const orderedData: Record<string, any[]> = {}
        Object.values(PermissionCategory).forEach((category) => {
            if (res[category]) {
                orderedData[category] = res[category]
            }
        })
        return omit(orderedData, [PermissionCategory.BasicPermission])
    }, [details])

    const getDetails = async () => {
        try {
            setLoading(true)
            const res = await getUserDetails(userId!)
            setDetails(res)
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open && userId) {
            getDetails()
        }
        setDetails(undefined)
    }, [open, userId])

    return (
        <Drawer
            open={open}
            title={__('用户详情')}
            placement="right"
            width={408}
            maskClosable
            destroyOnClose
            className={styles.userDetails}
            {...rest}
        >
            {loading ? (
                renderLoader()
            ) : (
                <Descriptions
                    column={1}
                    labelStyle={{
                        width: '80px',
                        color: 'rgba(0, 0, 0, 0.45)',
                    }}
                >
                    <Descriptions.Item label={__('用户名称')}>
                        {details?.name || '--'}
                    </Descriptions.Item>
                    <Descriptions.Item label={__('所属部门')}>
                        <span title={details?.parent_deps?.[0]?.path || '--'}>
                            {last(
                                details?.parent_deps?.[0]?.path?.split('/') ||
                                    [],
                            ) || '--'}
                        </span>
                    </Descriptions.Item>
                    <Descriptions.Item label={__('登录账号')}>
                        {details?.login_name || '--'}
                    </Descriptions.Item>
                    <Descriptions.Item label={__('手机号码')}>
                        {details?.phone_number || '--'}
                    </Descriptions.Item>
                    <Descriptions.Item label={__('邮箱地址')}>
                        {details?.mail_address || '--'}
                    </Descriptions.Item>
                    <Descriptions.Item label={__('性别')}>
                        {details?.sex || '--'}
                    </Descriptions.Item>
                    <Descriptions.Item label={__('更新人')}>
                        {details?.updated_by?.name || '--'}
                    </Descriptions.Item>
                    <Descriptions.Item label={__('更新时间')}>
                        {details?.updated_at
                            ? formatTime(details.updated_at)
                            : '--'}
                    </Descriptions.Item>
                    <Descriptions.Item label={__('用户角色')}>
                        {!details?.roles?.length &&
                        !details?.role_groups?.length ? (
                            '--'
                        ) : (
                            <Descriptions
                                column={1}
                                layout="vertical"
                                className={styles.innerDescriptions}
                            >
                                {details?.roles?.length && (
                                    <Descriptions.Item
                                        label={__('「角色」')}
                                        contentStyle={{
                                            flexWrap: 'wrap',
                                            gap: 8,
                                        }}
                                    >
                                        {details.roles.map((it) => (
                                            <RoleTag role={it} key={it.id} />
                                        ))}
                                    </Descriptions.Item>
                                )}
                                {details?.role_groups?.length && (
                                    <Descriptions.Item
                                        label={__('「角色组」')}
                                        contentStyle={{
                                            flexWrap: 'wrap',
                                            gap: 8,
                                        }}
                                    >
                                        {details?.role_groups?.map((it) => (
                                            <RoleTag
                                                key={it.id}
                                                roleGroup={it}
                                                onClick={() => setOpItem(it)}
                                            />
                                        ))}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item
                        label={__('用户权限')}
                        contentStyle={{ flexDirection: 'column' }}
                    >
                        {isEmpty(pers) ? (
                            '--'
                        ) : (
                            <>
                                <div className={styles.authTitle}>
                                    <span className={styles.authBlock1} />
                                    <span>
                                        {__('为“${name}”范围；', {
                                            name: permissionScopeText[
                                                PermissionScope.All
                                            ],
                                        })}
                                    </span>
                                    <span className={styles.authBlock2} />
                                    <span>
                                        {__('为“${name}”范围', {
                                            name: permissionScopeText[
                                                PermissionScope.Organization
                                            ],
                                        })}
                                    </span>
                                </div>
                                <Descriptions
                                    column={1}
                                    layout="vertical"
                                    className={styles.innerDescriptions}
                                >
                                    {Object.entries(pers).map(
                                        ([key, value]) => (
                                            <Descriptions.Item
                                                label={`「${permissionCategoryText[key]}」`}
                                                key={key}
                                                contentStyle={{
                                                    flexWrap: 'wrap',
                                                    gap: 8,
                                                }}
                                            >
                                                {value.map((it) => (
                                                    <AuthTag
                                                        key={it.id}
                                                        auth={it}
                                                        diffScope
                                                    />
                                                ))}
                                            </Descriptions.Item>
                                        ),
                                    )}
                                </Descriptions>
                            </>
                        )}
                    </Descriptions.Item>
                </Descriptions>
            )}
            <RoleGroupDetails
                open={!!opItem}
                data={opItem}
                onCancel={() => setOpItem(undefined)}
            />
        </Drawer>
    )
}

export default Details
