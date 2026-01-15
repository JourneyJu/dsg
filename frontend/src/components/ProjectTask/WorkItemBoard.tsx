import React, { useMemo } from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { Dimension, statusList } from './const'
import List from './List'
import { IStage, formatError, messageError } from '@/core'
import { ProjectStatus } from '../ProjectManage/types'
import styles from './styles.module.less'
import Loader from '@/ui/Loader'
import { EditTaskParam } from '@/core/apis/taskCenter/index.d'
import {
    editTask as editTaskReq,
    IMember,
    IWorkItem,
} from '@/core/apis/taskCenter'

interface IWorkItemBoard {
    dimension: Dimension
    stageList: IStage[]
    tasksOrWorkOrders: IWorkItem[]
    projectId?: string
    handleClickWorkItem: (type: string, id: string, subType?: string) => void
    updateWorkItem: () => void
    deleteWorkItem: (type: string, id: string, subType?: string) => void
    editWorkItem: (type: string, id: string, subType?: string) => void
    onTransfer: (type: string, id: string, item: any) => void
    loading: boolean
    executors: IMember[]
}
const WorkItemBoard: React.FC<IWorkItemBoard> = ({
    dimension,
    stageList,
    tasksOrWorkOrders,
    projectId,
    handleClickWorkItem,
    updateWorkItem,
    deleteWorkItem,
    editWorkItem,
    onTransfer,
    loading,
    executors,
}) => {
    const titleList: any[] = useMemo(() => {
        return dimension === Dimension.STAGE
            ? stageList.length > 0
                ? stageList
                : statusList
            : statusList
    }, [dimension, stageList])

    const getWorkItems = (list) => {
        return tasksOrWorkOrders.filter((task) => {
            return dimension === Dimension.STAGE
                ? task.stage_id === list.stage_id
                : task.status === list.id
        })
    }

    const updateWorkItems = async (taskId: string, params: EditTaskParam) => {
        if (!projectId) return
        try {
            await editTaskReq(taskId, { ...params, project_id: projectId })
            updateWorkItem()
        } catch (error) {
            formatError(error)
        }
    }

    const onDragEnd = ({ source, destination, draggableId }) => {
        if (dimension === Dimension.STAGE) return
        // 未开始->进行中   进行中->完成
        if (
            (source.droppableId === ProjectStatus.UNSTART &&
                destination.droppableId === ProjectStatus.PROGRESS) ||
            (source.droppableId === ProjectStatus.PROGRESS &&
                destination.droppableId === ProjectStatus.COMPLETED)
        ) {
            const taskName = tasksOrWorkOrders.find(
                (t) => t.id === draggableId,
            )?.name
            updateWorkItems(draggableId, {
                name: taskName,
                status: destination.droppableId,
            })
        } else {
            messageError(
                '切换任务状态失败，只能按照未开始->进行中->已完成的流程切换',
            )
        }
    }

    return (
        <div className={styles.boardWrapper}>
            <div className={styles.listTitleWrapper}>
                {titleList.map((list) => (
                    <div className={styles.listTitle} key={list.stage_id}>{`${
                        dimension === Dimension.STAGE
                            ? list.stage_name || ''
                            : list.title
                    }${
                        loading
                            ? ''
                            : `${
                                  getWorkItems(list).length > 0
                                      ? `(${getWorkItems(list).length})`
                                      : ''
                              }`
                    }`}</div>
                ))}
            </div>
            <div className={styles.boardContent}>
                {loading && (
                    <div className={styles.taskLoader}>
                        <Loader />
                    </div>
                )}
                {!loading && (
                    <DragDropContext onDragEnd={onDragEnd}>
                        {titleList.map((list) => (
                            <Droppable
                                droppableId={`${
                                    dimension === Dimension.STAGE
                                        ? list.stage_id
                                        : list.id
                                }`}
                                key={list.stage_id}
                            >
                                {(provided) => (
                                    <List
                                        dimension={dimension}
                                        workItems={getWorkItems(list)}
                                        innerRef={provided.innerRef}
                                        provided={provided}
                                        handleClickWorkItem={
                                            handleClickWorkItem
                                        }
                                        executors={executors}
                                        projectId={projectId}
                                        updateWorkItem={updateWorkItem}
                                        deleteWorkItem={deleteWorkItem}
                                        editWorkItem={editWorkItem}
                                        onTransfer={onTransfer}
                                    />
                                )}
                            </Droppable>
                        ))}
                    </DragDropContext>
                )}
            </div>
        </div>
    )
}

export default WorkItemBoard
