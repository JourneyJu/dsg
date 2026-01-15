import React, { memo, useEffect, useMemo, useState } from 'react'

import { CloseCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons'
import { message, Popover, Tooltip } from 'antd'
import classnames from 'classnames'
import moment from 'moment'
import {
    formatError,
    IMember,
    IWorkItem,
    messageError,
    TaskConfigStatus,
    TaskStatus,
    TaskTypeGroups,
} from '@/core'

import { editTask as editTaskReq, syncWorkOrder } from '@/core/apis/taskCenter'
import { EditTaskParam } from '@/core/apis/taskCenter/index.d'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { ProjectStatus } from '../ProjectManage/types'
import { WorkOrderStatus } from '../TaskCenterGraph/helper'
import UserSearch from '../TaskCenterGraph/UserSearch'
import WorkOrderCardMenu from '../TaskCenterGraph/WorkOrderCardMenu'
import DatePickerSelect from '../TaskComponents/DatePickerSelect'
import {
    TaskConfigStatusText,
    WorkOrderTypeColor,
} from '../TaskComponents/helper'
import { EditItemType } from './const'
import styles from './styles.module.less'
import __ from './locale'
import { AuditType } from '../WorkOrder/helper'
import { AuditOptions } from '../WorkOrder/WorkOrderManage/helper'

interface IWorkOrder {
    handleClickWorkOrder: (id: string) => void
    transferWorkOrder: (id: string) => void
    updateWorkOrder: () => void
    executors: IMember[]
    innerRef: any
    data: IWorkItem
    projectId?: string
}
const WorkOrder: React.FC<IWorkOrder> = ({
    innerRef,
    data,
    projectId,
    executors,
    handleClickWorkOrder,
    transferWorkOrder,
    updateWorkOrder,
}) => {
    const [deadline, setDeadline] = useState(data.deadline)
    const [executorId, setExecutorId] = useState(data.executor_id)
    const [noUserBorder, setNoUserBorder] = useState<any>({})

    useEffect(() => {
        // 初始化时如果执行人被移除，则执行人框变红
        if (
            data.status === TaskStatus.ONGOING &&
            !data.executor_id &&
            [TaskConfigStatus.EXECUTORDELETE].includes(
                data.config_status as any,
            )
        ) {
            setNoUserBorder({ border: '1px solid #F5222D' })
        } else {
            setNoUserBorder({})
        }
    }, [data.status])

    useEffect(() => {
        setDeadline(data.deadline)
    }, [data.deadline])

    useEffect(() => {
        setExecutorId(data.executor_id)
    }, [data.executor_id])

    const getUsers = useMemo(() => {
        // const res = roleGroups.find(
        //     (group: TaskTypeGroups) => group.task_type === data.sub_type,
        // )
        // return res?.members || []
        return executors
    }, [executors])

    const updateWorkOrderInfo = async (
        params: EditTaskParam,
        editItem: EditItemType,
    ) => {
        if (!projectId) return
        try {
            await editTaskReq(data.id!, { ...params, project_id: projectId })
            message.success('编辑成功')
        } catch (error) {
            switch (error?.data?.code) {
                case 'TaskCenter.Task.TaskDomainNotExist':
                    messageError('关联业务域被删除，可删除重建任务')
                    break
                default:
                    formatError(error)
            }
            switch (editItem) {
                case EditItemType.DEADLINE:
                    setDeadline(data.deadline)
                    break
                case EditItemType.EXECUTOR:
                    setExecutorId(data.executor_id)
                    break
                default:
            }
        }
    }

    const handleDateChange = (date) => {
        updateWorkOrderInfo(
            {
                deadline: date?.endOf('day').unix(),
                name: data.name,
            },
            EditItemType.DEADLINE,
        )
        setDeadline(date?.endOf('day').unix())
    }

    const handleSync = async (_id: string) => {
        try {
            await syncWorkOrder(_id)
            message.success(__('同步成功'))
            // 刷新
            updateWorkOrder()
        } catch (error) {
            message.error(__('同步失败'))
        }
    }

    const contentComp = (
        <div onClick={() => handleClickWorkOrder(data.id || '')}>
            <div
                className={styles.leftColor}
                style={{
                    borderLeftColor: `${WorkOrderTypeColor[data.sub_type!]}`,
                }}
            />
            <div className={styles.titleWrapper}>
                <div className={styles.taskIcon}>
                    <FontIcon
                        name="icon-gongdan"
                        type={IconType.COLOREDICON}
                        style={{ fontSize: 16 }}
                    />
                </div>
                <div
                    title={data.name}
                    className={classnames({
                        [styles.taskTitle]: true,
                        [styles.taskTitleDisabled]: !executorId,
                    })}
                    onClick={() => handleClickWorkOrder(data.id || '')}
                >
                    <div className={styles.it}>
                        {data.name!.length > 29
                            ? `${data.name!.substring(0, 29)}...`
                            : data.name}
                    </div>
                    <div
                        hidden={
                            ![AuditType.AUDITING, AuditType.REJECT].includes(
                                data?.audit_status as any,
                            )
                        }
                        className={classnames(
                            styles.it,
                            data?.audit_status === AuditType.REJECT
                                ? styles['is-reject']
                                : undefined,
                        )}
                    >
                        {
                            AuditOptions.find(
                                (o) => o.value === data?.audit_status,
                            )?.label
                        }
                        {data?.audit_status === AuditType.REJECT &&
                            data?.audit_description && (
                                <Popover
                                    placement="bottomLeft"
                                    arrowPointAtCenter
                                    overlayClassName={styles.PopBox}
                                    content={
                                        <div className={styles.PopTip}>
                                            <div>
                                                <span
                                                    className={
                                                        styles.popTipIcon
                                                    }
                                                >
                                                    <CloseCircleFilled />
                                                </span>
                                                {__('审核未通过')}
                                            </div>
                                            <div
                                                style={{
                                                    wordBreak: 'break-all',
                                                }}
                                            >
                                                {data?.audit_description}
                                            </div>
                                        </div>
                                    }
                                >
                                    <FontIcon
                                        name="icon-xinxitishi"
                                        type={IconType.FONTICON}
                                        style={{
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                        }}
                                    />
                                </Popover>
                            )}
                    </div>
                </div>
                <div
                    onClick={(e) => e.stopPropagation()}
                    hidden={data.status === ProjectStatus.COMPLETED}
                >
                    <WorkOrderCardMenu
                        status={data.status || ''}
                        type={data.sub_type || ''}
                        audit_status={data.audit_status || ''}
                        needSync={data.need_sync}
                        onTriggerTransfer={() =>
                            transferWorkOrder(data.id || '')
                        }
                        onTriggerDetail={() =>
                            handleClickWorkOrder(data.id || '')
                        }
                        onTriggerSync={() => handleSync(data.id || '')}
                    />
                </div>
            </div>
            <div className={styles.otherInfo}>
                <div className={styles.rowInfo}>
                    <UserSearch
                        projectId=""
                        nodeId=""
                        userid={executorId}
                        allUsers={getUsers}
                        style={noUserBorder}
                        status={data.status as ProjectStatus}
                        userName={data.executor_name}
                        taskType={data.sub_type || ''}
                        disabled
                    />
                    {WorkOrderStatus[data.status]}
                </div>
                <div className={styles.taskConfig} hidden={!deadline}>
                    {deadline ? (
                        <DatePickerSelect
                            date={moment(deadline * 1000)}
                            onChange={handleDateChange}
                            overdue={data.overdue}
                            disabled
                        />
                    ) : (
                        <div />
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div className={styles.taskCard} ref={innerRef}>
            {contentComp}
        </div>
    )
}

export default memo(WorkOrder)
