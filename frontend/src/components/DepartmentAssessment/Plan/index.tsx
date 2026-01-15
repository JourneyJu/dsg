import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import DragBox from '@/components/DragBox'
import styles from './styles.module.less'
import DepartmentTargetList from './DepartmentTargetList'
import TargetInfoCard from '../Overview/TargetInfoCard'
import CommonAnchor from '../Components/CommonAnchor'
import { PlanAnchorConfig } from './const'
import PlanList from './PlanList'
import {
    formatError,
    getCurUserDepartment,
    getTargetEvaluationDetail,
    getTargetList,
    IAssessmentTargetBaseInfo,
    IAssessmentTargetItem,
    IGetTargetListParams,
    ITargetEvaluationPlans,
    TargetTypeEnum,
} from '@/core'
import { Empty, Loader } from '@/ui'
import __ from '../locale'
import dataEmpty from '@/assets/dataEmpty.svg'

const Plan = () => {
    const [defaultSize, setDefaultSize] = useState<Array<number>>([12, 88])
    const [currentTargetId, setCurrentTargetId] = useState<string>()
    const anchorRef = useRef(null)
    const [targetDetail, setTargetDetail] =
        useState<IAssessmentTargetBaseInfo>()
    const [dataSource, setDataSource] = useState<ITargetEvaluationPlans[]>([])
    const [targetList, setTargetList] = useState<IAssessmentTargetItem[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [departmentId, setDepartmentId] = useState<string>('')

    const getList = async (params: IGetTargetListParams) => {
        try {
            const res = await getTargetList(params)
            setTargetList(res.entries || [])
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    const getCurrentDepartmentTargetList = async () => {
        try {
            setLoading(true)
            const deps = await getCurUserDepartment()
            const [firstDept] = deps ?? []

            if (firstDept?.id) {
                getList({
                    department_id: firstDept.id,
                    type: TargetTypeEnum.Department,
                    limit: 100,
                    offset: 1,
                    sort: 'plan',
                })
                setDepartmentId(firstDept.id)
            } else {
                setLoading(false)
            }
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        getCurrentDepartmentTargetList()
    }, [])

    const getDetail = async () => {
        try {
            const res = await getTargetEvaluationDetail(currentTargetId!)
            setTargetDetail(res.entries)
            setDataSource(res.evaluation_plans)
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        if (currentTargetId) {
            getDetail()
        }
    }, [currentTargetId])

    return (
        <div
            className={classNames(
                styles['plan-container'],
                targetList.length === 0 && styles['empty-plan-container'],
            )}
        >
            {loading ? (
                <Loader />
            ) : targetList.length > 0 ? (
                <DragBox
                    defaultSize={defaultSize}
                    minSize={[280, 270]}
                    maxSize={[800, Infinity]}
                    onDragEnd={(size) => {
                        setDefaultSize(size)
                    }}
                >
                    <div className={styles['left-container']}>
                        <DepartmentTargetList
                            initTargetList={targetList}
                            departmentId={departmentId}
                            onSelectTarget={(id) => {
                                setCurrentTargetId(id)
                            }}
                        />
                    </div>
                    <div className={styles['right-container']}>
                        <div className={styles.content} ref={anchorRef}>
                            <TargetInfoCard targetDetail={targetDetail!} />
                            <div className={styles['plan-list-container']}>
                                <PlanList
                                    targetId={currentTargetId}
                                    targetStatus={targetDetail?.status!}
                                    plans={dataSource}
                                    onRefresh={() => {
                                        getDetail()
                                    }}
                                />
                            </div>
                        </div>
                        <CommonAnchor
                            config={PlanAnchorConfig}
                            container={anchorRef}
                        />
                    </div>
                </DragBox>
            ) : (
                <div className={styles['target-empty-container']}>
                    <div className={styles['target-empty-title']}>
                        {__('部门计划考核数据')}
                    </div>
                    <Empty
                        iconSrc={dataEmpty}
                        desc={
                            <div className={styles['target-empty-desc']}>
                                <div>
                                    {__(
                                        '考核计划必须基于考核目标拆解，您暂无可执行的考核目标',
                                    )}
                                </div>
                                <div>
                                    {__('（考核目标由目标管理人员创建）')}
                                </div>
                            </div>
                        }
                    />
                </div>
            )}
        </div>
    )
}

export default Plan
