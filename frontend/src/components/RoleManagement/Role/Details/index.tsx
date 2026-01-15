import { Descriptions, Drawer, type DrawerProps } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { isEmpty, omit } from 'lodash'
import {
    formatError,
    getRoleDetails,
    IRoleDetails,
    PermissionCategory,
    PermissionScope,
    RoleType,
} from '@/core'
import __ from './locale'
import styles from './styles.module.less'
import { formatTime } from '@/utils'
import {
    permissionCategoryText,
    permissionScopeText,
    roleTypeText,
} from '../../const'
import AuthTag from './AuthTag'
import RoleAvatar from '@/components/UserManagement/RoleAvatar'

interface DetailsProps extends DrawerProps {
    id?: string
}

const Details = ({ open, id, ...rest }: DetailsProps) => {
    const [details, setDetails] = useState<IRoleDetails>()

    const pers = useMemo(() => {
        if (!details?.permissions) return {}
        const res = details.permissions.reduce((acc, permission) => {
            const { category } = permission
            if (!acc[category]) {
                acc[category] = []
            }
            acc[category].push(permission)
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
            const res = await getRoleDetails(id!)
            setDetails(res)
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        if (open && id) {
            getDetails()
            return
        }
        setDetails(undefined)
    }, [open, id])

    return (
        <Drawer
            open={open}
            title={__('角色详情')}
            placement="right"
            width={400}
            maskClosable
            destroyOnClose
            className={styles.roleDetails}
            {...rest}
        >
            <Descriptions
                column={1}
                labelStyle={{
                    width: '80px',
                    color: 'rgba(0, 0, 0, 0.45)',
                }}
            >
                <Descriptions.Item
                    label={__('角色名称')}
                    contentStyle={{ alignItems: 'flex-start', columnGap: 8 }}
                >
                    <RoleAvatar role={details} style={{ marginTop: 1 }} />
                    {details?.name || '--'}
                </Descriptions.Item>
                <Descriptions.Item label={__('角色类型')}>
                    {roleTypeText[details?.type || ''] || '--'}
                </Descriptions.Item>
                <Descriptions.Item label={__('描述')}>
                    {details?.description || '--'}
                </Descriptions.Item>
                <Descriptions.Item label={__('更新人')}>
                    {details?.updated_by?.name || '--'}
                </Descriptions.Item>
                <Descriptions.Item label={__('更新时间')}>
                    {details?.updated_at
                        ? formatTime(details.updated_at)
                        : '--'}
                </Descriptions.Item>
                <Descriptions.Item
                    label={__('角色权限')}
                    contentStyle={{ flexDirection: 'column' }}
                >
                    {isEmpty(pers) ? (
                        '--'
                    ) : (
                        <>
                            {details?.type === RoleType.Custom && (
                                <div className={styles.authTitle}>
                                    {__('权限范围为“${name}”', {
                                        name: permissionScopeText[
                                            details?.scope || ''
                                        ],
                                    })}
                                </div>
                            )}
                            <Descriptions
                                column={1}
                                layout="vertical"
                                className={styles.innerDescriptions}
                            >
                                {Object.entries(pers).map(([key, value]) => (
                                    <Descriptions.Item
                                        label={`「${permissionCategoryText[key]}」`}
                                        key={key}
                                        contentStyle={{
                                            flexWrap: 'wrap',
                                            gap: 8,
                                        }}
                                    >
                                        {value.map((it) => (
                                            <AuthTag key={it.id} auth={it} />
                                        ))}
                                    </Descriptions.Item>
                                ))}
                            </Descriptions>
                        </>
                    )}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    )
}

export default Details
