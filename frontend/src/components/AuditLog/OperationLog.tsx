import React, { memo, useState } from 'react'
import { useEventEmitter } from 'ahooks'
import styles from './styles.module.less'
import __ from './locale'
import { useQuery } from '@/utils'
import { AuditLogType } from './helper'
import DragBox from '../DragBox'
import LogTable from './LogTable'
import FilterView from './FilterView'

/**
 * 操作日志
 */
const OperationLog = () => {
    const query = useQuery()
    const tab = query.get('tab') || AuditLogType.ManagementLog
    const [defaultSize, setDefaultSize] = useState<Array<number>>([12, 88])
    const condition$ = useEventEmitter()

    return (
        <div className={styles.managementLog}>
            <DragBox
                defaultSize={defaultSize}
                expandCloseText={__('筛选')}
                minSize={[280, 270]}
                maxSize={[800, Infinity]}
                onDragEnd={(size) => setDefaultSize(size)}
            >
                <FilterView condition$={condition$} />
                <LogTable condition$={condition$} />
            </DragBox>
        </div>
    )
}

export default memo(OperationLog)
