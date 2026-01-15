import React from 'react'
import styles from './styles.module.less'
import { priorityInfo } from '../ProjectManage/const'
import { Priority } from '../ProjectManage/types'

interface IPriority {
    priority: Priority
    fontSize?: number
}
const Prioritys: React.FC<IPriority> = ({ priority, fontSize }) => {
    return (
        <div className={styles.priorityWrapper}>
            <div
                className={styles[priorityInfo[priority].class]}
                style={{ fontSize }}
            >
                {priorityInfo[priority].text}
            </div>
        </div>
    )
}

export default Prioritys
