import { useState } from 'react'
import { WorkOrderCard } from './helper'
import styles from './styles.module.less'

interface IWorkOrder {
    workOrderData: Array<any>
}

// 数据处理概览
const WorkOrder = ({ workOrderData }: IWorkOrder) => {
    return (
        <div className={styles.workOrderContainer}>
            {workOrderData.map((item) => (
                <WorkOrderCard data={item} />
            ))}
        </div>
    )
}

export default WorkOrder
