import React, { useState, useMemo, useEffect } from 'react'
import { Dropdown, Select, Badge, Button, Space, Checkbox } from 'antd'
import classnames from 'classnames'
import {
    projectStatus,
    statusInfo,
    priorityList,
    priorityInfo,
    getUserName,
} from '../ProjectManage/const'
import { ProjectStatus, Priority } from '../ProjectManage/types'
import { IFilter } from './types'
import { IMember, TaskType } from '@/core'
import { FiltersOutlined, FontIcon, NormalTaskColored } from '@/icons'
import { Dimension } from './const'
import __ from './locale'
import styles from './styles.module.less'
import { getTaskTypeIcon, TaskTypeLabel } from '../TaskComponents/helper'
import { PrioritySelect } from '../TaskComponents/PrioritySelect'
import { CheckType } from '../Graph/NodeConfigInfo'

interface IFilters {
    executors: IMember[]
    getFilters?: (filter: IFilter) => void
    dimension: Dimension
}

const Filters: React.FC<IFilters> = ({ getFilters, executors, dimension }) => {
    const [filter, setFilter] = useState<IFilter>({
        views: undefined,
        status: '',
        priority: '',
        executor_id: '',
        task_type: '',
    })

    const [views, setViews] = useState<any[]>()
    const [status, setStatus] = useState<ProjectStatus | ''>('')
    const [priority, setPriority] = useState<Priority | ''>('')
    const [executorId, setExecutorId] = useState<string>('')
    const [taskType, setTaskType] = useState<TaskType | ''>('')

    const [visible, setVisible] = useState(false)
    const showDot = useMemo(() => {
        return !!(
            filter.views?.length ||
            filter.executor_id ||
            filter.priority ||
            filter.status ||
            filter.task_type
        )
    }, [filter])

    const handleViewsChange = (e: any[]) => {
        setViews(e || '')
    }
    const handleStatusChange = (e: ProjectStatus) => {
        setStatus(e || '')
    }

    const handlePriorityChange = (e: Priority) => {
        setPriority(e || '')
    }

    const handleExecutorChange = (e: string) => {
        setExecutorId(e || '')
    }

    const handleTaskTypeChange = (e: TaskType) => {
        setTaskType(e || '')
    }

    const handleOk = () => {
        setVisible(false)
        setFilter({
            status,
            priority,
            executor_id: executorId,
            task_type: taskType,
            views: views?.length
                ? views
                : [CheckType.TASK, CheckType.WORK_ORDER],
        })
        getFilters?.({
            status: status || '',
            priority: priority || '',
            executor_id: executorId || '',
            task_type: taskType || '',
            views: views?.length
                ? views
                : [CheckType.TASK, CheckType.WORK_ORDER],
        })
    }

    const handleReset = () => {
        setStatus('')
        setPriority('')
        setExecutorId('')
        setTaskType('')
        setViews(undefined)
    }

    const handleOpenChange = () => {
        if (visible) {
            setVisible(false)
            setTimeout(() => {
                handleReset()
            }, 1000)
        } else {
            setVisible(true)
            setStatus(filter.status || '')
            setPriority(filter.priority || '')
            setExecutorId(filter.executor_id || '')
            setTaskType(filter.task_type || '')
        }
    }

    const statusOptions = useMemo(() => {
        return [
            {
                key: ProjectStatus.UNSTART,
                value: __('未派发/未开始'),
            },
            ...projectStatus.filter((s) => s.key !== ProjectStatus.UNSTART),
        ]
    }, [])

    const getFiltersComp = () => {
        return (
            <div className={styles.filterItems}>
                <div className={styles.filterItem}>
                    <div className={styles.labelName}>只看</div>
                    <Checkbox.Group
                        options={[
                            {
                                label: __('工单'),
                                value: CheckType.WORK_ORDER,
                            },
                            {
                                label: __('任务'),
                                value: CheckType.TASK,
                            },
                        ]}
                        value={views}
                        onChange={handleViewsChange}
                    />
                </div>
                {dimension === Dimension.STAGE && (
                    <div className={styles.filterItem}>
                        <div className={styles.labelName}>状态</div>
                        <Select
                            placeholder="请选择"
                            getPopupContainer={(node) => node.parentNode}
                            className={styles.select}
                            showArrow={false}
                            allowClear
                            value={status || null}
                            onChange={handleStatusChange}
                        >
                            {statusOptions.map((s) => (
                                <Select.Option key={s.key} value={s.key}>
                                    <div
                                        className={
                                            styles[statusInfo[s.key].class]
                                        }
                                    >
                                        {s.value}
                                    </div>
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                )}
                <div className={styles.filterItem}>
                    <div className={styles.labelName}>优先级</div>
                    <PrioritySelect
                        placeholder="请选择"
                        getPopupContainer={(node) => node.parentNode}
                        className={styles.select}
                        showArrow={false}
                        allowClear
                        value={priority || null}
                        onChange={handlePriorityChange}
                    />
                </div>
                <div className={styles.filterItem}>
                    <div className={styles.labelName}>责任人/任务执行人</div>
                    <Select
                        placeholder="请选择"
                        className={styles.select}
                        style={{ width: 124 }}
                        showArrow={false}
                        allowClear
                        value={executorId || null}
                        onChange={handleExecutorChange}
                        getPopupContainer={(node) => node.parentNode}
                        notFoundContent={
                            <div className={styles.notFoundContent}>
                                暂无数据
                            </div>
                        }
                    >
                        {executors.map((executor) => (
                            <Select.Option
                                key={executor.id}
                                value={executor.id}
                            >
                                {getUserName(executor)}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                {/* <div className={styles.filterItem}>
                    <div className={styles.labelName}>任务类型</div>
                    <Select
                        placeholder="请选择"
                        className={styles.select}
                        showArrow={false}
                        allowClear
                        value={taskType || null}
                        onChange={handleTaskTypeChange}
                        getPopupContainer={(node) => node.parentNode}
                        notFoundContent={
                            <div className={styles.notFoundContent}>
                                暂无数据
                            </div>
                        }
                    >
                        {Object.keys(TaskTypeLabel)
                            .filter(
                                (info) =>
                                    info !== TaskType.DATACOMPREHENSION &&
                                    info !== TaskType.DATAPROCESSING,
                            )
                            .map((item) => (
                                <Select.Option value={item}>
                                    <div className={styles.selectItem}>
                                        {getTaskTypeIcon(item)}
                                        <span className={styles.taskText}>
                                            {TaskTypeLabel[item]}
                                        </span>
                                    </div>
                                </Select.Option>
                            ))}
                    </Select>
                </div> */}

                <div className={styles.btnWrapper}>
                    <Space size={16}>
                        <Button onClick={handleReset} type="link">
                            重置
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleOk}
                            className={styles.btn}
                        >
                            确定
                        </Button>
                    </Space>
                </div>
            </div>
        )
    }

    return (
        <div className={classnames(styles.filtersWrapper)}>
            <Dropdown
                placement="bottomLeft"
                destroyPopupOnHide
                getPopupContainer={(node) => node.parentElement || node}
                trigger={['click']}
                overlayStyle={{
                    width: 274,
                    backgroundColor: 'white',
                    borderRadius: 3,
                    marginTop: 10,
                    marginLeft: -10,
                }}
                dropdownRender={() => getFiltersComp()}
                open={visible}
                onOpenChange={handleOpenChange}
            >
                <div
                    className={classnames(
                        styles.filterInfo,
                        visible && styles.filtersWithBack,
                    )}
                    onClick={() => setVisible(true)}
                >
                    {/* <FiltersOutlined className={styles.filterIcon} /> */}
                    <FontIcon
                        name="icon-shaixuan"
                        className={styles.filterIcon}
                        style={{ marginRight: 8 }}
                    />
                    <Badge dot={showDot} color="rgba(18, 110, 227, 1)">
                        <span className={styles.filterText}>筛选</span>
                    </Badge>
                </div>
            </Dropdown>
        </div>
    )
}

export default Filters
