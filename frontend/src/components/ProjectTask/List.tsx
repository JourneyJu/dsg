import React from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { IMember, IWorkItem, TaskTypeGroups } from '@/core'
import { Dimension, WorkItemType } from './const'
import styles from './styles.module.less'
import Task from './Task'
import WorkOrder from './WorkOrder'

interface IList {
    dimension: Dimension
    workItems: IWorkItem[]
    innerRef: any
    provided: any
    executors: IMember[]
    projectId?: string
    handleClickWorkItem: (type: string, id: string, subType?: string) => void
    updateWorkItem: () => void
    deleteWorkItem: (type: string, id: string) => void
    editWorkItem: (type: string, id: string) => void
    onTransfer: (type: string, id: string, item: IWorkItem) => void
}
const List: React.FC<IList> = ({
    dimension,
    workItems,
    innerRef,
    provided: provided1,
    handleClickWorkItem,
    executors,
    projectId,
    updateWorkItem,
    deleteWorkItem,
    editWorkItem,
    onTransfer,
}) => {
    return (
        <div className={styles.listWrapper} ref={innerRef}>
            <div>
                {workItems.map((item, index) => (
                    <Draggable
                        key={item.id}
                        draggableId={`${item.id}`}
                        index={index}
                        isDragDisabled={dimension === Dimension.STAGE}
                    >
                        {(provided) => {
                            return item.type === WorkItemType.TASK ? (
                                <Task
                                    task={item}
                                    dimension={dimension}
                                    innerRef={provided.innerRef}
                                    provided={provided}
                                    handleClickTask={(id) =>
                                        handleClickWorkItem(
                                            WorkItemType.TASK,
                                            id,
                                            item.sub_type,
                                        )
                                    }
                                    executors={executors}
                                    projectId={projectId}
                                    updateTasks={updateWorkItem}
                                    deleteTask={(id) =>
                                        deleteWorkItem(WorkItemType.TASK, id)
                                    }
                                    editTask={(id) =>
                                        editWorkItem(WorkItemType.TASK, id)
                                    }
                                />
                            ) : (
                                <WorkOrder
                                    data={item}
                                    innerRef={provided.innerRef}
                                    handleClickWorkOrder={(id) =>
                                        handleClickWorkItem(
                                            WorkItemType.WORK_ORDER,
                                            id,
                                            item.sub_type,
                                        )
                                    }
                                    executors={executors}
                                    projectId={projectId}
                                    updateWorkOrder={updateWorkItem}
                                    transferWorkOrder={(id) =>
                                        onTransfer(
                                            WorkItemType.WORK_ORDER,
                                            id,
                                            item,
                                        )
                                    }
                                />
                            )
                        }}
                    </Draggable>
                ))}
                {provided1.placeholder}
            </div>
        </div>
    )
}

export default List
