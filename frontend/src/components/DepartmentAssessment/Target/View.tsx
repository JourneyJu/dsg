import { Button, Drawer } from 'antd'
import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import DrawerHeader from '@/components/CitySharing/component/DrawerHeader'
import styles from './styles.module.less'
import TargetInfoCard from '../Overview/TargetInfoCard'
import PlanList from '../Plan/PlanList'
import CommonAnchor from '../Components/CommonAnchor'
import { PlanAnchorConfig } from '../Plan/const'
import { PlanListUseSceneEnum } from '../const'
import __ from '../locale'
import {
    AssessmentTargetStatus,
    getTargetEvaluationDetail,
    IAssessmentTargetBaseInfo,
    ITargetEvaluationPlans,
} from '@/core'
import Evaluate from './Evaluate'

interface IEvaluate {
    open: boolean
    onClose: () => void
    targetId?: string
    onRefresh: () => void
}

const View = ({ open, onClose, targetId, onRefresh }: IEvaluate) => {
    const anchorRef = useRef(null)
    const [dataSource, setDataSource] = useState<ITargetEvaluationPlans[]>([])
    const [targetDetail, setTargetDetail] =
        useState<IAssessmentTargetBaseInfo>()
    const [evaluateOpen, setEvaluateOpen] = useState<boolean>(false)

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

    return (
        <Drawer
            open={open}
            onClose={onClose}
            width="100%"
            headerStyle={{ display: 'none' }}
            bodyStyle={{ padding: 0, backgroundColor: '#F0F2F6' }}
        >
            <div
                className={classNames(
                    styles['evaluate-drawer-container'],
                    styles['view-drawer-container'],
                )}
            >
                <DrawerHeader
                    title={targetDetail?.target_name}
                    onClose={onClose}
                />
                <div className={styles['evaluate-container']}>
                    <div className={styles.content} ref={anchorRef}>
                        <TargetInfoCard
                            useScene={PlanListUseSceneEnum.TargetDetail}
                            targetDetail={targetDetail!}
                        />
                        <div className={styles['plan-list-container']}>
                            <PlanList
                                useScene={PlanListUseSceneEnum.TargetDetail}
                                plans={dataSource}
                                targetStatus={targetDetail?.status!}
                            />
                        </div>
                        {targetDetail?.status ===
                            AssessmentTargetStatus.Ended && (
                            <div className={styles['evaluate-content']}>
                                <div className={styles.title}>
                                    {__('评价内容')}
                                </div>
                                <div className={styles.content}>
                                    {targetDetail?.evaluation_content ||
                                        __('暂无评价内容')}
                                </div>
                            </div>
                        )}
                    </div>
                    {dataSource.length > 0 && (
                        <CommonAnchor
                            config={PlanAnchorConfig}
                            container={anchorRef}
                        />
                    )}
                </div>
                {targetDetail?.status ===
                    AssessmentTargetStatus.ToBeEvaluated && (
                    <Button
                        type="primary"
                        onClick={() => setEvaluateOpen(true)}
                        className={styles['evaluate-btn']}
                    >
                        {__('开始评价')}
                    </Button>
                )}
                {targetDetail?.status === AssessmentTargetStatus.Ended && (
                    <Button
                        onClick={() => setEvaluateOpen(true)}
                        className={styles['evaluate-btn']}
                    >
                        {__('修改评价')}
                    </Button>
                )}
                {evaluateOpen && (
                    <Evaluate
                        open={evaluateOpen}
                        onClose={() => {
                            setEvaluateOpen(false)
                            onClose()
                        }}
                        onSuccess={() => onRefresh()}
                        targetId={targetId}
                    />
                )}
            </div>
        </Drawer>
    )
}

export default View
