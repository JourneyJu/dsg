import React, { useState, useEffect } from 'react'
import { Input, Space, Dropdown, Menu, Select } from 'antd'
import { uniqBy } from 'lodash'
import classnames from 'classnames'
import { SearchOutlined } from '@ant-design/icons'
import { BoardTypeOutlined, RefreshOutlined } from '@/icons'
import { menus, defaultMenu, Dimension, WorkItemType } from './const'
import { IFilter, ISearchCondition } from './types'
import DropDownFilter from '../DropDownFilter'
import Filters from './Filters'
import WorkItemBoard from './WorkItemBoard'
import styles from './styles.module.less'
import TaskDetails from '../TaskComponents/TaskDetails'
import {
    getFlowchartStage,
    IStage,
    formatError,
    IMember,
    IProjectDetails,
    IRoleGroup,
    TaskTypeGroups,
} from '@/core'
import DeleteTask from '../TaskComponents/DeleteTask'
import CreateTask from '../TaskComponents/CreateTask'
import { OperateType, useQuery } from '@/utils'
import { getProjectWorkItem, getTasks, IWorkItem } from '@/core/apis/taskCenter'
import { TaskInfo } from '@/core/apis/taskCenter/index.d'
import { noExecutorAssigned } from '../TaskComponents/helper'
import { SearchInput } from '@/ui'
import WorkOrderDetail from '@/components/WorkOrder/WorkOrderManage/DetailModal'
import WorkOrderTransfer from '@/components/WorkOrder/WorkOrderManage/TransferModal'

interface IProjectTask {
    projectDetails?: IProjectDetails
}
const ProjectTask: React.FC<IProjectTask> = ({ projectDetails }) => {
    const query = useQuery()
    const [searchCondition, setSearchCondition] = useState<ISearchCondition>({
        limit: 100,
    })
    const [dimension, setDimension] = useState<Dimension>(Dimension.STAGE)
    const [detailVisible, setDetailVisible] = useState(false)
    const [editVisible, setEditVisible] = useState(false)
    const [workItemId, setWorkItemId] = useState<string>('')
    const [stageList, setStageList] = useState<IStage[]>([])
    const [tasksOrWorkOrders, setTasksOrWorkOrders] = useState<IWorkItem[]>([])

    const [executors, setExecutors] = useState<IMember[]>([])

    // 排序下拉是否展开
    const [isShowFilter, setIsShowFilter] = useState(false)
    // 维度类型下拉是否展开
    const [boardTypeOpen, setBoardTypeOpen] = useState(false)
    // 加载任务loading
    const [loading, setLoading] = useState(false)

    // const [roleGroups, setRoleGroups] = useState<TaskTypeGroups[]>([])

    const [deleteWorkItemId, setDeleteWorkItemId] = useState<string>('')
    const [editWorkItemId, setEditWorkItemId] = useState<string>('')

    const [inputStyle, setInputStyle] = useState(false)
    const [optWorkItemType, setOptWorkItemType] = useState<WorkItemType>()
    const [workOrderType, setWorkOrderType] = useState<string>()
    const [current, setCurrent] = useState<any>()

    // 获取所有角色下的人员
    const getCandidates = async (
        flowchartId: string,
        versionId: string,
        id: string,
    ) => {
        // const res = await getAllTasktypeCandidate(id)
        // setRoleGroups(res)
        const allExecutors: IMember[] = projectDetails?.members || []
        // 根据id 对相同的人进行去重
        setExecutors(
            allExecutors.filter((item, index, self) => {
                return self.findIndex((el) => el.id === item.id) === index
            }),
        )
    }

    useEffect(() => {
        if (
            projectDetails?.flow_id &&
            projectDetails?.flow_version &&
            projectDetails?.id
        ) {
            getCandidates(
                projectDetails?.flow_id,
                projectDetails?.flow_version,
                projectDetails?.id,
            )
        }
    }, [projectDetails?.flow_id])

    // 获取阶段信息列表
    const getFlowchartStages = async () => {
        if (!projectDetails?.id) return
        try {
            setLoading(true)
            const res = await getFlowchartStage(projectDetails?.id)
            if (
                Array.isArray(res.entries) &&
                res.entries.length > 0 &&
                !res.entries[0].stage_id
            ) {
                setStageList([])
                setDimension(Dimension.STATUS)
                return
            }
            setStageList(uniqBy(res.entries, 'stage_id'))
            const params = query.get('params')
            if (params) {
                const paramsArr = params.split('|')
                setDimension(paramsArr[1] as Dimension)
            }
            setLoading(false)
        } catch (error) {
            formatError(error)
        }
    }

    // 获取项目任务列表
    const getProjectTasksOrWorkOrder = async () => {
        if (!projectDetails?.id) return
        try {
            setLoading(true)
            const res = await getProjectWorkItem(projectDetails?.id, {
                project_id: projectDetails?.id,
                ...searchCondition,
            })
            setTasksOrWorkOrders(res.entries)
            setLoading(false)
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        getFlowchartStages()
    }, [projectDetails?.id])

    useEffect(() => {
        getProjectTasksOrWorkOrder()
    }, [searchCondition, projectDetails?.id])

    const handleNameChange = (kw: string) => {
        setSearchCondition({
            ...searchCondition,
            keyword: kw,
        })
    }
    // 获取排序条件
    const handleMenuChange = (selectedMenu) => {
        setSearchCondition({
            ...searchCondition,
            sort: selectedMenu.key,
            direction: selectedMenu.sort,
        })
    }

    // 获取筛选条件
    const getFilters = (filters: IFilter) => {
        const { views, ...rest } = filters
        setSearchCondition({
            ...searchCondition,
            ...rest,
            workitem_type: (views || []).join(','),
        })
    }

    // 类型条件变化
    const handleChangeType = ({ key }) => {
        // 切换维度
        setDimension(key)
        setBoardTypeOpen(false)
    }

    const items = [
        { label: '按阶段显示', key: Dimension.STAGE },
        { label: '按状态显示', key: Dimension.STATUS },
    ]

    // 点击任务/工单卡片 展示详情页
    const handleClickWorkItem = (
        type: string,
        tId: string,
        subType?: string,
    ) => {
        setOptWorkItemType(type as WorkItemType)
        setWorkItemId(tId)
        setDetailVisible(true)
        if (type === WorkItemType.WORK_ORDER) {
            setWorkOrderType(subType)
        }
    }

    const getIsShowFilter = (isShow: boolean) => {
        setIsShowFilter(isShow)
    }

    // 删除任务/工单
    const deleteWorkItem = (type: string, id: string) => {
        setOptWorkItemType(type as WorkItemType)
        setDeleteWorkItemId(id)
    }

    // 编辑任务/工单
    const editWorkItem = (type: string, id: string) => {
        setOptWorkItemType(type as WorkItemType)
        setEditWorkItemId(id)
        setEditVisible(true)
    }
    // 转派工单
    const handleTransfer = (type: string, id: string, item: IWorkItem) => {
        setOptWorkItemType(type as WorkItemType)
        setCurrent({
            ...item,
            responsible_uid: item.executor_id,
            responsible_uname: item.executor_name,
            work_order_id: item.id,
        })
    }

    // 编辑默认值
    const createEditData = () => {
        return [
            { name: 'project_id', disabled: true },
            { name: 'stage_node', disabled: true },
        ]
    }

    return (
        <div className={styles.projectTaskWrapper}>
            <div className={styles.searchCondition}>
                <SearchInput
                    prefix={<SearchOutlined className={styles.searchIcon} />}
                    placeholder="搜索工单或任务名称"
                    maxLength={32}
                    className={classnames(
                        inputStyle
                            ? styles.taskNameInputBorder
                            : styles.taskNameInput,
                        searchCondition.keyword
                            ? styles.taskNameInputBkg
                            : undefined,
                    )}
                    onKeyChange={handleNameChange}
                    onFocus={() => setInputStyle(true)}
                    onBlur={() => setInputStyle(false)}
                />
                <Space size={0} className={styles.searchWrapper}>
                    <Filters
                        getFilters={getFilters}
                        executors={[noExecutorAssigned, ...executors]}
                        dimension={dimension}
                    />
                    <div
                        className={classnames(
                            styles.filterWrapper,
                            isShowFilter && styles.filterSortWithBack,
                        )}
                    >
                        <div className={styles.sortIcon}>
                            <DropDownFilter
                                menus={menus}
                                defaultMenu={defaultMenu}
                                menuChangeCb={handleMenuChange}
                                text="排序"
                                getIsShowFilter={getIsShowFilter}
                                textStyle={{
                                    width: 80,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            />
                        </div>
                    </div>
                    {stageList?.length > 0 && (
                        <div
                            className={classnames(
                                styles.filterWrapper,
                                boardTypeOpen && styles.filterSortWithBack,
                            )}
                        >
                            <Dropdown
                                overlay={
                                    <Menu
                                        items={items}
                                        selectedKeys={[
                                            dimension === Dimension.STATUS
                                                ? Dimension.STATUS
                                                : Dimension.STAGE,
                                        ]}
                                        onClick={handleChangeType}
                                    />
                                }
                                trigger={['click']}
                                overlayStyle={{ width: 150 }}
                                onOpenChange={(open) => setBoardTypeOpen(open)}
                            >
                                <div
                                    className={classnames(
                                        styles.boardTypeWrapper,
                                    )}
                                >
                                    <BoardTypeOutlined
                                        className={styles.icon}
                                    />
                                    类型
                                </div>
                            </Dropdown>
                        </div>
                    )}

                    <div
                        className={classnames(styles.refresh)}
                        onClick={() => getProjectTasksOrWorkOrder()}
                    >
                        <RefreshOutlined className={styles.icon} />
                        刷新
                    </div>
                </Space>
            </div>
            <WorkItemBoard
                dimension={dimension}
                stageList={stageList}
                tasksOrWorkOrders={tasksOrWorkOrders}
                projectId={projectDetails?.id}
                handleClickWorkItem={handleClickWorkItem}
                updateWorkItem={getProjectTasksOrWorkOrder}
                loading={loading}
                executors={executors}
                deleteWorkItem={deleteWorkItem}
                editWorkItem={editWorkItem}
                onTransfer={handleTransfer}
            />
            {optWorkItemType === WorkItemType.TASK && workItemId && (
                <TaskDetails
                    visible={detailVisible}
                    taskId={workItemId}
                    projectId={projectDetails?.id}
                    onClose={() => {
                        setOptWorkItemType(undefined)
                        setDetailVisible(false)
                    }}
                />
            )}

            {optWorkItemType === WorkItemType.WORK_ORDER && workItemId && (
                <WorkOrderDetail
                    id={workItemId}
                    type={workOrderType}
                    onClose={() => {
                        setDetailVisible(false)
                        setOptWorkItemType(undefined)
                        setWorkItemId('')
                        setWorkOrderType(undefined)
                    }}
                />
            )}

            {optWorkItemType === WorkItemType.WORK_ORDER && current && (
                <WorkOrderTransfer
                    item={current}
                    visible={!!current}
                    onClose={(refresh?: boolean) => {
                        if (refresh) {
                            getProjectTasksOrWorkOrder()
                        }
                        setOptWorkItemType(undefined)
                        setCurrent(undefined)
                    }}
                />
            )}

            {optWorkItemType === WorkItemType.TASK && deleteWorkItemId && (
                <DeleteTask
                    projectId={projectDetails?.id || ''}
                    taskId={deleteWorkItemId}
                    onClose={(data) => {
                        setDeleteWorkItemId('')
                        if (data && data.id) {
                            getProjectTasksOrWorkOrder()
                        }
                        setOptWorkItemType(undefined)
                    }}
                />
            )}
            {optWorkItemType === WorkItemType.TASK && editWorkItemId && (
                <CreateTask
                    show={editVisible}
                    operate={OperateType.EDIT}
                    defaultData={createEditData()}
                    title="编辑任务"
                    pid={projectDetails?.id}
                    tid={editWorkItemId}
                    onClose={(info) => {
                        setEditVisible(false)
                        setEditWorkItemId('')
                        if (info) {
                            getProjectTasksOrWorkOrder()
                        }
                        setOptWorkItemType(undefined)
                    }}
                />
            )}
        </div>
    )
}

export default ProjectTask
