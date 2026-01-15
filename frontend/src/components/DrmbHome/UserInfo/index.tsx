import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Popover, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import classnames from 'classnames'
import { useSize } from 'ahooks'
import { DownOutlined, RightOutlined } from '@ant-design/icons'
import styles from './styles.module.less'
import __ from '../locale'
import { formatError, getUserDetails, IRole } from '@/core'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { DevelopingTip, getTextWidth } from '../helper'
import GradientSvgIcon from '../GradientSvgIcon'
import { findFirstPathByModule, useMenus } from '@/hooks/useMenus'

interface UserInfoProps {
    onMenuModuleClick: (module: string) => void
}

const UserInfo: React.FC<UserInfoProps> = (props) => {
    const { onMenuModuleClick } = props
    const [menus] = useMenus()
    const navigate = useNavigate()
    const [info] = useCurrentUser()
    const [roleList, setRoleList] = useState<Array<IRole>>([])
    const roleRef = useRef<HTMLDivElement>(null)
    const size = useSize(roleRef)
    const [showExpandBtn, setShowExpandBtn] = useState(false)
    const [foldCount, setFoldCount] = useState(0)
    const tagsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        getUserInfo()
    }, [])

    useEffect(() => {
        if (
            size?.width &&
            roleList &&
            roleList?.length > 0 &&
            tagsRef.current
        ) {
            // const fCount = getTagFoldCount({
            //     tags: roleList,
            //     gap: 8,
            //     len: 2,
            //     parentWidth: size?.width || 0,
            // })
            const otherWid = 16 + 8
            const maxWid = Math.max(128, size.width - otherWid)
            const minWid = Math.min(200, (size.width - otherWid) / 2 - otherWid)
            const dataTextWidList = roleList.map((item) => {
                const wid = getTextWidth(item.name, 12)
                return (wid > maxWid ? maxWid : wid) + otherWid
            })
            const tags = tagsRef.current.children
            let maxInd = 0
            let prevTop: number | null = null
            for (let i = 0; i < tags.length; i += 1) {
                const tag = tags[i]
                const rect = tag.getBoundingClientRect()
                if (prevTop !== null && rect.top !== prevTop) {
                    maxInd = i - 1
                    break
                }
                prevTop = rect.top
            }
            const firstInd = maxInd
            const totalWid = dataTextWidList.reduce((pre, cur, index) => {
                if (index <= maxInd) {
                    return pre
                }
                if (index === roleList.length - 1) {
                    if (pre + cur <= size.width) {
                        maxInd = index
                    }
                } else if (pre + cur <= size.width - 56 - 8) {
                    maxInd = index
                } else if (pre + cur <= size.width && index === firstInd + 1) {
                    maxInd = index
                }
                return pre + cur
            }, 0)
            setFoldCount(maxInd)
            setShowExpandBtn(roleList.length > maxInd + 1)
        }
    }, [roleList, size?.width, tagsRef.current])

    const getUserInfo = async () => {
        try {
            const res = await getUserDetails(info?.ID)
            if (res) {
                const { roles = [], role_groups = [] } = res
                const totalRoles: any[] = [
                    ...roles,
                    ...role_groups.map((item) => item.roles || []).flat(),
                ]
                const roleMap = new Map()
                totalRoles.forEach((role) => {
                    if (!roleMap.has(role.id)) {
                        roleMap.set(role.id, role)
                    }
                })
                const allRoles = Array.from(roleMap.values()).map((item) => {
                    const wid = getTextWidth(item.name, 12)
                    return { ...item, width: Math.min(wid, 184) }
                })
                setRoleList(allRoles)
            }
        } catch (error) {
            formatError(error)
        }
    }

    const showPlatform = useMemo(() => {
        const url = findFirstPathByModule('md-platform', menus, true)
        return !!url
    }, [menus])

    const renderContent = () => {
        return (
            <div className={styles.tagWrap}>
                {roleList.slice(foldCount + 1).map((role, index) => (
                    <Tag className={styles.tag} key={index} title={role.name}>
                        {role.name}
                    </Tag>
                ))}
            </div>
        )
    }

    return (
        <div
            className={styles.userWrap}
            // onClick={() => navigate('/taskCenter/task')}
        >
            <div>
                <DevelopingTip menu={{ isDeveloping: true }}>
                    <GradientSvgIcon
                        className={classnames(styles.userIcon, {
                            [styles.userIconDisabled]: true,
                        })}
                        name="icon-wubeijingtouxiang"
                        colors={['#fff', '#fff']}
                        bgColors={['#73C0FF', '#1890FF']}
                    />
                </DevelopingTip>
            </div>
            <div className={styles.userWrapper} ref={roleRef}>
                <div
                    title={info?.VisionName || '--'}
                    className={styles.userName}
                >
                    <span className={styles.userText}>
                        {info?.VisionName || '--'}
                    </span>
                    {showPlatform && (
                        <a
                            className={styles.platform}
                            onClick={() => onMenuModuleClick('md-platform')}
                        >
                            {__('平台管理')}
                            <RightOutlined />
                        </a>
                    )}
                </div>
                {/* 暂时没有部门信息 */}
                {/* <div className={styles.depInfo}>项目管理部 | 运营部</div> */}
                <div className={styles.roleInfo} ref={tagsRef}>
                    {roleList
                        .slice(0, (foldCount || roleList.length) + 1)
                        .map((role, index) => (
                            <Tag
                                className={styles.tag}
                                key={index}
                                title={role.name}
                                style={{
                                    maxWidth:
                                        index === foldCount
                                            ? 'calc(100% - 64px)'
                                            : '100%',
                                }}
                            >
                                {role.name}
                            </Tag>
                        ))}
                    {showExpandBtn && (
                        <Popover
                            content={renderContent()}
                            placement="bottom"
                            trigger={['click']}
                        >
                            <Tag
                                className={classnames(
                                    styles.tag,
                                    styles.expandBtn,
                                )}
                            >
                                <span className={styles.expandText}>
                                    {__('更多')}
                                </span>
                                <span>
                                    <DownOutlined />
                                </span>
                            </Tag>
                        </Popover>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserInfo
