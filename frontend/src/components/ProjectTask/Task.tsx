import React, { useState, useMemo, useEffect } from 'react'
import { Button, message, Tooltip } from 'antd'
import classnames from 'classnames'
import moment from 'moment'
import { useLocation, useNavigate } from 'react-router-dom'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { values } from 'lodash'
import {
    IMember,
    formatError,
    messageError,
    TaskConfigStatus,
    TaskType,
    TaskStatus,
} from '@/core'
import { Dimension, EditItemType } from './const'
import UserSearch from '../TaskCenterGraph/UserSearch'
import styles from './styles.module.less'
import StatusSelect from '../TaskComponents/StatusSelect'
import { ProjectStatus } from '../ProjectManage/types'
import DatePickerSelect from '../TaskComponents/DatePickerSelect'
import TaskCardMenu from '../TaskComponents/TaskCardMenu'
import {
    checkBeforeJumpModel,
    TaskConfigStatusText,
    TaskTypeColor,
} from '../TaskComponents/helper'
import { FontIcon, LinkOutlined } from '@/icons'
import { TabKey } from '../BusinessModeling/const'
import { EditTaskParam } from '@/core/apis/taskCenter/index.d'
import { editTask as editTaskReq, IWorkItem } from '@/core/apis/taskCenter'
import { getActualUrl } from '@/utils'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useUserPermCtx } from '@/context/UserPermissionProvider'
import { IconType } from '@/icons/const'

interface ITaskCard {
    handleClickTask: (taskId: string) => void
    updateTasks: () => void
    deleteTask: (id: string) => void
    editTask: (id: string) => void
    innerRef: any
    provided: any
    task: IWorkItem
    executors: IMember[]
    projectId?: string
    dimension: Dimension
}
const Task: React.FC<ITaskCard> = ({
    innerRef,
    provided,
    task,
    executors,
    projectId,
    dimension,
    handleClickTask,
    deleteTask = () => {},
    editTask = () => {},
    updateTasks = () => {},
}) => {
    const navigate = useNavigate()
    const [status, setStatus] = useState(task.status)
    const [deadline, setDeadline] = useState(task.deadline)
    const [executorId, setExecutorId] = useState(task.executor_id)
    const [noUserBorder, setNoUserBorder] = useState<any>({})
    const [isHideMenu, setIsHideMenu] = useState(true)
    const [ellipsis, setEllipsis] = useState(true)
    const { checkPermission } = useUserPermCtx()
    const [userInfo] = useCurrentUser()
    const userId = userInfo?.ID
    const location = useLocation()
    const hasAccess = useMemo(
        () => checkPermission('manageDataOperationProject'),
        [checkPermission],
    )

    useEffect(() => {
        setStatus(task.status)
        // 初始化时如果执行人被移除，则执行人框变红
        if (
            task.status === TaskStatus.ONGOING &&
            !task.executor_id &&
            [TaskConfigStatus.EXECUTORDELETE].includes(
                task.config_status as any,
            )
        ) {
            setNoUserBorder({ border: '1px solid #F5222D' })
        } else {
            setNoUserBorder({})
        }
    }, [task.status])

    useEffect(() => {
        setDeadline(task.deadline)
    }, [task.deadline])

    useEffect(() => {
        setExecutorId(task.executor_id)
    }, [task.executor_id])

    const getUsers = useMemo(() => {
        return executors
    }, [executors])

    const updateTaskInfo = async (
        params: EditTaskParam,
        editItem: EditItemType,
    ) => {
        if (!projectId) return
        try {
            await editTaskReq(task.id!, { ...params, project_id: projectId })
            message.success('编辑成功')
            if (editItem === EditItemType.STATUS) {
                updateTasks()
            }
        } catch (error) {
            switch (error?.data?.code) {
                case 'TaskCenter.Task.TaskDomainNotExist':
                    messageError('关联业务领域被删除，可删除重建任务')
                    break
                default:
                    formatError(error)
            }
            switch (editItem) {
                case EditItemType.STATUS:
                    setStatus(task.status)
                    break
                case EditItemType.DEADLINE:
                    setDeadline(task.deadline)
                    break
                case EditItemType.EXECUTOR:
                    setExecutorId(task.executor_id)
                    break
                default:
                    setStatus(task.status)
            }
        }
    }

    const handleUserChange = (userName: string, user: IMember) => {
        updateTaskInfo(
            { executor_id: user.id, name: task.name },
            EditItemType.EXECUTOR,
        )
        setNoUserBorder({})
        setExecutorId(user.id)
    }

    const handleStatusChange = async (s: string) => {
        // 状态不变
        if ((s as ProjectStatus) === task.status) return
        // 执行人不存在
        if (!executorId) {
            setNoUserBorder({ border: '1px solid #F5222D' })
            setStatus(task.status)
            messageError('任务不能开启，任务缺少任务执行人')
            return
        }
        updateTaskInfo(
            { status: s as ProjectStatus, name: task.name },
            EditItemType.STATUS,
        )
        setStatus(s as ProjectStatus)
    }

    const handleDateChange = (date) => {
        updateTaskInfo(
            {
                deadline: date?.endOf('day').unix(),
                name: task.name,
            },
            EditItemType.DEADLINE,
        )
        setDeadline(date?.endOf('day').unix())
    }

    const isWorkOrderTask = (task_type?: string) => {
        return [TaskType.DATACOMPREHENSIONWWORKORDER].includes(
            task_type as TaskType,
        )
    }

    const executeTask = async (e) => {
        e.stopPropagation()
        if (!executorId) {
            setNoUserBorder({ border: '1px solid #F5222D' })
            messageError('任务不能开启，任务缺少任务执行人')
            return
        }
        if (task.sub_type === TaskType.DATACOLLECTING) {
            const backUrl = `/taskContent/project/${projectId}/content?params=2|${dimension}`
            const url = `/dataDevelopment/dataSynchronization?taskId=${
                task.id
            }&projectId=${projectId}&backUrl=${backUrl}&targetTab=${
                [TaskType.DATACOLLECTING, TaskType.DATAPROCESSING].includes(
                    task?.sub_type,
                )
                    ? TabKey.FORM
                    : ''
            }`
            // 执行任务时先将任务状态改成进行中
            checkBeforeJumpModel(
                true,
                (linkUrl: string) => {
                    window.location.href = getActualUrl(linkUrl)
                },
                url,
                task.id,
                projectId || '',
                task.name,
                task.status,
                task.sub_type,
                task.executable_status,
                task.subject_domain_id,
            )
        } else if (task.sub_type === TaskType.INDICATORPROCESSING) {
            const backUrl = `/taskContent/project/${projectId}/content?params=2|${dimension}`
            const url = `/dataDevelopment/indictorManage?taskId=${task.id}&projectId=${projectId}&backUrl=${backUrl}`
            // 执行任务时先将任务状态改成进行中
            checkBeforeJumpModel(
                true,
                (linkUrl: string) => {
                    navigate(linkUrl)
                },
                url,
                task.id,
                projectId,
                task.name,
                task.status,
                task.sub_type,
                task.executable_status,
                task.domain_id,
            )
        } else {
            const backUrl = encodeURIComponent(
                location.pathname + location.search,
            ) // `/taskContent/project/${projectId}/content?params=2|${dimension}`
            const url = `/${
                isWorkOrderTask(task.sub_type)
                    ? 'complete-work-order-task'
                    : 'complete-task'
            }?taskId=${
                task.id
            }&projectId=${projectId}&backUrl=${backUrl}&targetTab=${
                [TaskType.DATACOLLECTING, TaskType.DATAPROCESSING].includes(
                    task?.sub_type as TaskType,
                )
                    ? TabKey.FORM
                    : ''
            }`
            // 执行任务时先将任务状态改成进行中
            checkBeforeJumpModel(
                true,
                (linkUrl: string) => {
                    window.location.href = getActualUrl(linkUrl)
                },
                url,
                task.id,
                projectId || '',
                task.name,
                task.status,
                task.sub_type,
                task.executable_status,
                task.subject_domain_id,
            )
        }
    }

    const contentComp = (
        <div
            onMouseEnter={() => setIsHideMenu(false)}
            onMouseLeave={() => setIsHideMenu(true)}
            onClick={() => handleClickTask(task.id || '')}
        >
            <div
                className={styles.leftColor}
                style={{
                    borderLeftColor: `${TaskTypeColor[task.sub_type!]}`,
                }}
            />
            <div className={styles.titleWrapper}>
                <div className={styles.taskIcon}>
                    <FontIcon
                        name="icon-renwu"
                        type={IconType.COLOREDICON}
                        style={{ fontSize: 16 }}
                    />
                </div>
                <div
                    title={task.name}
                    className={classnames({
                        [styles.taskTitle]: true,
                        [styles.taskTitleDisabled]:
                            values(TaskConfigStatus)
                                .filter((v) => v !== TaskConfigStatus.NORMAL)
                                .includes(task.config_status as any) &&
                            !executorId,
                    })}
                    onClick={() => handleClickTask(task.id || '')}
                >
                    {task.name!.length > 29
                        ? `${task.name!.substring(0, 29)}...`
                        : task.name}
                    {values(TaskConfigStatus)
                        .filter((v) => v !== TaskConfigStatus.NORMAL)
                        .includes(task.config_status as any) &&
                        !executorId && (
                            <Tooltip
                                title={TaskConfigStatusText[task.config_status]}
                                placement="bottom"
                            >
                                <ExclamationCircleOutlined
                                    className={styles.deleteIcon}
                                />
                            </Tooltip>
                        )}
                </div>
                <div
                    style={{ visibility: isHideMenu ? 'hidden' : 'visible' }}
                    onClick={(e) => e.stopPropagation()}
                    hidden={task.status === ProjectStatus.COMPLETED}
                >
                    <TaskCardMenu
                        status={task.status || ''}
                        isLoseEfficacy={values(TaskConfigStatus)
                            .filter(
                                (v) =>
                                    v !== TaskConfigStatus.NORMAL &&
                                    v !== TaskConfigStatus.EXECUTORDELETE,
                            )
                            .includes(task.config_status as any)}
                        onTriggerEdit={() => editTask(task.id || '')}
                        onTriggerView={() => handleClickTask(task.id || '')}
                        onTriggerDelete={() => deleteTask(task.id || '')}
                    />
                </div>
            </div>
            <div className={styles.otherInfo}>
                <div className={styles.rowInfo}>
                    <UserSearch
                        onSelect={handleUserChange}
                        projectId={projectId || ''}
                        nodeId=""
                        userid={executorId}
                        allUsers={getUsers}
                        style={noUserBorder}
                        status={task.status as ProjectStatus}
                        userName={task.executor_name}
                        taskType={task.sub_type || ''}
                        disabled={
                            !hasAccess ||
                            values(TaskConfigStatus)
                                .filter(
                                    (v) =>
                                        v !== TaskConfigStatus.NORMAL &&
                                        v !== TaskConfigStatus.EXECUTORDELETE,
                                )
                                .includes(task.config_status as any) ||
                            task.status === 'completed'
                        }
                    />
                    <StatusSelect
                        taskId={task.id}
                        disabled={
                            !hasAccess ||
                            values(TaskConfigStatus)
                                .filter((v) => v !== TaskConfigStatus.NORMAL)
                                .includes(task.config_status as any) ||
                            task.status === 'completed'
                        }
                        taskType={task.sub_type}
                        status={status || ''}
                        onChange={handleStatusChange}
                    />
                </div>
                <div className={styles.taskConfig}>
                    {deadline ? (
                        <DatePickerSelect
                            date={moment(deadline * 1000)}
                            onChange={handleDateChange}
                            overdue={task.overdue}
                            disabled={
                                !hasAccess ||
                                values(TaskConfigStatus)
                                    .filter(
                                        (v) => v !== TaskConfigStatus.NORMAL,
                                    )
                                    .includes(task.config_status as any) ||
                                task.status === 'completed'
                            }
                        />
                    ) : (
                        <div />
                    )}
                    {/* 普通任务及失效任务不展示；执行状态为可执行状态，状态为已完成态区分显示 */}
                    {task.sub_type !== TaskType.NORMAL &&
                    !values(TaskConfigStatus)
                        .filter((v) => v !== TaskConfigStatus.NORMAL)
                        .includes(task.config_status as any) ? (
                        task.status !== 'completed' &&
                        // 任务需要本人才能执行 -- bug:671851
                        userId === executorId &&
                        hasAccess ? (
                            <Button
                                type="link"
                                icon={
                                    <LinkOutlined className={styles.linkIcon} />
                                }
                                onClick={(e) => executeTask(e)}
                            >
                                执行任务
                            </Button>
                        ) : (
                            task.status === 'completed' && (
                                <Button
                                    type="link"
                                    icon={
                                        <LinkOutlined
                                            className={styles.linkIcon}
                                        />
                                    }
                                    onClick={(e) => executeTask(e)}
                                >
                                    执行结果
                                </Button>
                            )
                        )
                    ) : null}
                </div>
            </div>
            {provided.placeholder}
        </div>
    )

    return (
        <div
            className={styles.taskCard}
            ref={innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
        >
            {contentComp}
        </div>
    )
}

export default Task
