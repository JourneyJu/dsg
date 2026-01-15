import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Dropdown, MenuProps } from 'antd'
import moment from 'moment'

import { EllipsisOutlined, AvatarOutlined, FontIcon } from '@/icons'
import { OperateType, getActualUrl, getOssResourceUrl } from '@/utils'
import { formatError, IProject } from '@/core'
import Status from './Status'
import styles from './styles.module.less'
import ProjectIconOutlined from '@/icons/ProjectIconOutlined'
import __ from './locale'
import { ProjectStatus } from './types'
import { useUserPermCtx } from '@/context/UserPermissionProvider'

interface IProjectItem {
    project: IProject
    handleOperate: (op) => void
}
const Project: React.FC<IProjectItem> = ({ project, handleOperate }) => {
    const {
        name,
        status,
        deadline,
        image,
        owner_name,
        complete_time,
        has_business_model_data,
        has_data_model_data,
        project_type,
    } = project
    const navigator = useNavigate()
    const [isHideMenu, setIsHideMenu] = useState(true)
    const [isloadError, setIsLoadError] = useState(false)
    const { checkPermission } = useUserPermCtx()
    const [imageUrl, setImageUrl] = useState('')

    const getImage = async (id: string) => {
        const url = await getOssResourceUrl(id)
        setImageUrl(url)
    }

    useEffect(() => {
        getImage(project.image)
    }, [project.image])

    const isDelay = useMemo(() => {
        if (deadline) {
            if (complete_time) {
                return (
                    moment(deadline * 1000).format('YYYY-MM-DD') <
                    moment(complete_time * 1000).format('YYYY-MM-DD')
                )
            }
            return (
                moment(deadline * 1000).format('YYYY-MM-DD') <
                moment(new Date()).format('YYYY-MM-DD')
            )
        }
        return false
    }, [project.deadline])

    // 菜单项
    const getItems = () => {
        let menus: any = [
            {
                key: OperateType.EDIT,
                label: (
                    <div style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                        {__('项目信息')}
                    </div>
                ),
                access: 'manageDataOperationProject',
            },
            {
                key: OperateType.DELETE,
                label: (
                    <div style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                        {__('删除')}
                    </div>
                ),
                access: 'manageDataOperationProject',
            },
            has_business_model_data && {
                key: 'business',
                label: (
                    <div style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                        {__('业务表导出')}
                    </div>
                ),
            },
            has_data_model_data && {
                key: 'data',
                label: (
                    <div style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                        {__('数据表导出')}
                    </div>
                ),
            },
        ].filter(Boolean)
        // 已完成项目不可以删除
        if (status === ProjectStatus.COMPLETED) {
            menus = menus.filter((item) => item.key !== OperateType.DELETE)
        }
        // 过滤权限操作
        return menus.filter((item) => checkPermission(item.access))
    }

    const handleClick = () => {
        navigator(`/taskContent/project/${project.id}/content`)
    }

    // 菜单项选中
    const handleMenuClick: MenuProps['onClick'] = (e) => {
        e.domEvent.stopPropagation()
        handleOperate(e.key)
        e.domEvent.preventDefault()
    }

    return (
        <Card
            className={styles.project}
            cover={
                <div className={styles.cardCover}>
                    {image && imageUrl && !isloadError ? (
                        // eslint-disable-next-line
                        <img
                            alt="project"
                            // src={`/api/task-center/v1/oss/${image}`}
                            src={imageUrl}
                            className={styles.projectCover}
                            onClick={handleClick}
                            onErrorCapture={() => setIsLoadError(true)}
                        />
                    ) : (
                        <div
                            className={styles.emptyWrapper}
                            onClick={handleClick}
                        >
                            <ProjectIconOutlined
                                className={styles.projectIcon}
                            />
                        </div>
                    )}
                    <div
                        className={styles.thirdPartyTag}
                        hidden={project_type !== 'thirdParty'}
                    >
                        <FontIcon
                            name="icon-guanlianweibiao"
                            style={{ fontSize: 10 }}
                        />
                        {__('来自第三方')}
                    </div>
                </div>
            }
            onMouseOver={() => setIsHideMenu(false)}
            onMouseLeave={() => {
                setIsHideMenu(true)
            }}
        >
            <div className={styles.titleWrapper}>
                <div
                    className={styles.title}
                    title={name}
                    onClick={handleClick}
                >
                    {name}
                </div>
                <div
                    className={styles.dropdown}
                    hidden={isHideMenu || getItems().length === 0}
                >
                    <Dropdown
                        menu={{
                            items: getItems(),
                            onClick: handleMenuClick,
                        }}
                        placement="bottomLeft"
                        trigger={['click']}
                        className={styles.itemMore}
                    >
                        <EllipsisOutlined className={styles.operateIcon} />
                    </Dropdown>
                </div>
            </div>
            <div className={styles.content}>
                <div className={styles.creatorInfo}>
                    <div className={styles.creator} title={owner_name}>
                        {__('负责人：')}
                        {owner_name}
                    </div>
                </div>
                <Status
                    status={status}
                    onSelect={() => handleOperate('editStatus')}
                />
            </div>
            {isDelay && (
                <div className={styles.overdue}>
                    <p className={styles.overdueText}>{__('已逾期')}</p>
                </div>
            )}
        </Card>
    )
}

export default Project
