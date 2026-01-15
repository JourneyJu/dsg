import { Button, Drawer, Input, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import DrawerHeader from '@/components/CitySharing/component/DrawerHeader'
import styles from './styles.module.less'
import TargetInfoCard from '../Overview/TargetInfoCard'
import PlanList from '../Plan/PlanList'
import CommonAnchor from '../Components/CommonAnchor'
import { PlanAnchorConfig } from '../Plan/const'
import { PlanListUseSceneEnum } from '../const'
import __ from '../locale'
import {
    AssessmentPlanTypeEnum,
    AssessmentTargetStatus,
    evaluateTarget,
    formatError,
    getTargetEvaluationDetail,
    IAssessmentTargetBaseInfo,
    ITargetEvaluationPlans,
} from '@/core'
import EvaluateContent from './EvaluateContent'

interface IEvaluate {
    open: boolean
    onClose: () => void
    targetId?: string
    onSuccess?: () => void
}

const Evaluate = ({ open, onClose, targetId, onSuccess }: IEvaluate) => {
    const anchorRef = useRef(null)
    const planListRef = useRef<any>()
    const evaluateContentRef = useRef<any>()
    const [dataSource, setDataSource] = useState<ITargetEvaluationPlans[]>([])
    const [targetDetail, setTargetDetail] =
        useState<IAssessmentTargetBaseInfo>()

    const getTargetDetail = async () => {
        const res = await getTargetEvaluationDetail(targetId!)
        setTargetDetail(res.entries)
        setDataSource(res.evaluation_plans)
    }

    useEffect(() => {
        if (targetId) {
            getTargetDetail()
        }
    }, [targetId])

    const handleSubmit = async () => {
        const formData = await planListRef.current.getFormData()
        if (formData === 'error') {
            message.info(
                <span>
                    有带
                    <ExclamationCircleOutlined
                        style={{ color: '#F5222D', marginLeft: 8 }}
                    />
                    的异常项需要修改，无法提交评价
                </span>,
            )
            return
        }
        try {
            await evaluateTarget(targetId!, {
                evaluation_content:
                    evaluateContentRef.current.getEvaluateContent(),
                ...formData,
            })
            onClose()
            message.success(
                targetDetail?.status === AssessmentTargetStatus.Ended
                    ? __('评价修改成功')
                    : __('评价成功'),
            )
            onSuccess?.()
        } catch (error) {
            formatError(error)
        }
    }

    return (
        <Drawer
            open={open}
            onClose={onClose}
            width="100%"
            headerStyle={{ display: 'none' }}
            bodyStyle={{ padding: 0, backgroundColor: '#F0F2F6' }}
        >
            <div className={styles['evaluate-drawer-container']}>
                <DrawerHeader
                    title={targetDetail?.target_name}
                    onClose={onClose}
                />
                <div className={styles['evaluate-container']}>
                    <div className={styles.content} ref={anchorRef}>
                        <TargetInfoCard
                            targetDetail={targetDetail!}
                            useScene={PlanListUseSceneEnum.TargetEvaluation}
                        />
                        <div className={styles['plan-list-container']}>
                            <PlanList
                                useScene={PlanListUseSceneEnum.TargetEvaluation}
                                plans={dataSource}
                                targetStatus={targetDetail?.status!}
                                onRefresh={() => getTargetDetail()}
                                ref={planListRef}
                            />
                        </div>
                        <div className={styles['evaluate-content-container']}>
                            <EvaluateContent
                                ref={evaluateContentRef}
                                initContent={
                                    targetDetail?.evaluation_content || ''
                                }
                            />
                        </div>
                    </div>
                    {dataSource.length > 0 && (
                        <CommonAnchor
                            config={PlanAnchorConfig}
                            container={anchorRef}
                        />
                    )}
                </div>
                <div className={styles['evaluate-footer']}>
                    <Button onClick={onClose}>{__('取消')}</Button>
                    <Button type="primary" onClick={handleSubmit}>
                        {__('提交')}
                    </Button>
                </div>
            </div>
        </Drawer>
    )
}

export default Evaluate
