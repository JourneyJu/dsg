import { Select, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { FontIcon } from '@/icons'
import __ from '../locale'
import { IconType } from '@/icons/const'
import styles from './styles.module.less'
import TargetInfoCard from './TargetInfoCard'

import StatisticalInfo from './StatisticalInfo'
import { PlanListUseSceneEnum } from '../const'
import {
    AssessmentTargetStatus,
    formatError,
    getCurUserDepartment,
    getDepartmentAssessmentOverview,
    getObjects,
    getTargetEvaluationDetail,
    getTargetList,
    IAssessmentTargetBaseInfo,
    IAssessmentTargetItem,
    TargetTypeEnum,
} from '@/core'

const Overview = () => {
    const [departmentOptions, setDepartmentOptions] = useState<
        { label: string; value: string }[]
    >([])
    const [selectDepartmentId, setSelectDepartmentId] = useState<string>()
    const [targetList, setTargetList] = useState<IAssessmentTargetItem[]>([])
    const [selectTargetId, setSelectTargetId] = useState<string>()
    const [targetDetail, setTargetDetail] =
        useState<IAssessmentTargetBaseInfo>()
    const [overviewData, setOverviewData] = useState<any>({})

    const getTarget = async () => {
        try {
            const res = await getTargetList({
                limit: 100,
                department_id: selectDepartmentId,
                type: TargetTypeEnum.Department,
                status: AssessmentTargetStatus.Ended,
            })
            setTargetList(res?.entries || [])
            setSelectTargetId(res?.entries?.[0]?.id)
        } catch (error) {
            formatError(error)
        }
    }

    const getOverviewData = async () => {
        try {
            const res = await getDepartmentAssessmentOverview({
                department_id: selectDepartmentId!,
                target_id: selectTargetId!,
            })
            setOverviewData(res.statistics || {})
            setTargetDetail(res?.entries)
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        if (selectDepartmentId) {
            getTarget()
        }
    }, [selectDepartmentId])

    useEffect(() => {
        if (selectTargetId) {
            // getTargetDetail()
            getOverviewData()
        }
    }, [selectTargetId])

    // 获取当前部门
    const getCurDepartment = async () => {
        try {
            const curUserDepartment = await getCurUserDepartment()
            const [firstDept] = curUserDepartment ?? []
            const objRes = await getObjects({
                is_all: true,
                id: firstDept?.id,
            })
            setDepartmentOptions([
                { label: firstDept?.name, value: firstDept?.id },
                ...objRes.entries.map((item) => ({
                    label: item.name,
                    value: item.id,
                })),
            ])
            setSelectDepartmentId(firstDept?.id)
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        getCurDepartment()
    }, [])

    return (
        <div className={styles['overview-container']}>
            <div className={styles.title}>
                {__('部门考核数据概览')}
                <Tooltip
                    title={
                        <div
                            style={{ width: 255, color: 'rgba(0, 0, 0, 0.85)' }}
                        >
                            {__('考核目标评价结束后可以进行考核概览。')}
                        </div>
                    }
                    color="#fff"
                >
                    <FontIcon
                        name="icon-xinxitishi"
                        type={IconType.FONTICON}
                        className={styles['title-icon']}
                    />
                </Tooltip>
            </div>
            <div className={styles['search-container']}>
                <div className={styles['search-item']}>
                    <div className={styles['search-item-label']}>
                        {__('部门')}：
                    </div>
                    <Select
                        placeholder={__('请选择')}
                        className={styles['search-item-select']}
                        options={departmentOptions}
                        value={selectDepartmentId}
                        onChange={(value) => setSelectDepartmentId(value)}
                    />
                </div>
                <div className={styles['search-item']}>
                    <div className={styles['search-item-label']}>
                        {__('目标')}：
                    </div>
                    <Select
                        placeholder={__('请选择')}
                        className={styles['search-item-select']}
                        options={targetList}
                        fieldNames={{ label: 'target_name', value: 'id' }}
                        value={selectTargetId}
                        onChange={(value) => setSelectTargetId(value)}
                    />
                </div>
            </div>
            <div className={styles['target-info-container']}>
                <TargetInfoCard
                    useScene={PlanListUseSceneEnum.Overview}
                    targetDetail={targetDetail!}
                />
            </div>
            <StatisticalInfo overviewData={overviewData} />
        </div>
    )
}

export default Overview
