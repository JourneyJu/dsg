import { FC, useEffect, useRef, useState } from 'react'
import { Modal } from 'antd'
import __ from './locale'
import {
    formatError,
    getProcessTaskData,
    getResultTableDetailData,
} from '@/core'
import {
    ProcessTaskSourceConfig,
    ProcessTaskStatusConfig,
    ResultTableDetailConfig,
} from './const'
import { generatePie } from './helper'
import styles from './styles.module.less'

interface IProcessViewModal {
    open: boolean
    onClose: () => void
    modalType?: string
    myDepartment: boolean
}
const ProcessViewModal: FC<IProcessViewModal> = ({
    open,
    onClose,
    modalType = 'processingTask',
    myDepartment,
}) => {
    const [loading, setLoading] = useState(false)
    // 状态分布
    const statusPieRef = useRef<HTMLDivElement>(null)
    const [statusPieData, setStatusPieData] = useState<any[] | null>(null)
    // 来源分布
    const sourcePieRef = useRef<HTMLDivElement>(null)
    const [sourcePieData, setSourcePieData] = useState<any[] | null>(null)

    // 成果表详情
    const resultTableDetailRef = useRef<HTMLDivElement>(null)
    const [resultTableDetailData, setResultTableDetailData] = useState<
        any[] | null
    >(null)

    const [totalCount, setTotalCount] = useState(0)

    // 加工任务数据
    useEffect(() => {
        if (modalType === 'processingTask') {
            getProcessData()
        } else {
            getResultTableData()
        }
    }, [myDepartment, modalType])

    useEffect(() => {
        if (statusPieRef.current && statusPieData) {
            generatePie(
                statusPieData,
                statusPieRef.current,
                __('任务总数'),
                totalCount,
                ProcessTaskStatusConfig.map((item) => item.color),
            )
        }
    }, [statusPieData])

    useEffect(() => {
        if (sourcePieRef.current && sourcePieData) {
            generatePie(
                sourcePieData,
                sourcePieRef.current,
                __('任务总数'),
                totalCount,
                ProcessTaskSourceConfig.map((item) => item.color),
            )
        }
    }, [sourcePieData])

    useEffect(() => {
        if (resultTableDetailRef.current && resultTableDetailData) {
            generatePie(
                resultTableDetailData,
                resultTableDetailRef.current,
                __('任务总数'),
                totalCount,
                ResultTableDetailConfig.map((item) => item.color),
            )
        }
    }, [resultTableDetailData])

    /**
     * 获取加工任务数据
     */
    const getProcessData = async () => {
        try {
            const res = await getProcessTaskData({
                my_department: myDepartment,
            })
            setTotalCount(res.work_order_task_count)
            setStatusPieData(
                ProcessTaskStatusConfig.map((item) => ({
                    type: item.label,
                    value: res[item.key],
                })),
            )
            setSourcePieData(
                ProcessTaskSourceConfig.map((item) => ({
                    type: item.label,
                    value: res[item.key],
                })),
            )
        } catch (err) {
            formatError(err)
        } finally {
            setLoading(false)
        }
    }

    const getResultTableData = async () => {
        try {
            const res = await getResultTableDetailData({
                my_department: myDepartment,
            })
            setTotalCount(res.work_order_task_count)
            setResultTableDetailData(
                ResultTableDetailConfig.map((item) => ({
                    type: item.label,
                    value: res[item.key],
                })),
            )
        } catch (err) {
            formatError(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={1000}
            title={
                modalType === 'processingTask'
                    ? __('加工任务详情')
                    : __('成果表详情')
            }
        >
            {modalType === 'processingTask' ? (
                <div className={styles.processViewModalContainer}>
                    <div className={styles.processViewModalContent}>
                        <div
                            ref={statusPieRef}
                            className={styles.processViewModalContentContent}
                        />
                        <div className={styles.processViewModalContentTitle}>
                            {__('状态分布')}
                        </div>
                    </div>

                    <div className={styles.processViewModalContent}>
                        <div
                            ref={sourcePieRef}
                            className={styles.processViewModalContentContent}
                        />
                        <div className={styles.processViewModalContentTitle}>
                            {__('来源分布')}
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.resultTableDetailContainer}>
                    <div
                        ref={resultTableDetailRef}
                        className={styles.resultTableDetailContent}
                    />
                    <div className={styles.processViewModalContentTitle}>
                        {__('来源分布')}
                    </div>
                </div>
            )}
        </Modal>
    )
}

export default ProcessViewModal
