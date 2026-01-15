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
    formatError,
    getOperationAssessmentOverview,
    getTargetList,
    IAssessmentTargetBaseInfo,
    IAssessmentTargetItem,
    TargetTypeEnum,
    getUsersFrontendList,
    AssessmentTargetStatus,
} from '@/core'

const Overview = () => {
    const [targetList, setTargetList] = useState<IAssessmentTargetItem[]>([])
    const [selectTargetId, setSelectTargetId] = useState<string>()
    const [targetDetail, setTargetDetail] =
        useState<IAssessmentTargetBaseInfo>()
    const [overviewData, setOverviewData] = useState<any>({})
    const [userList, setUserList] = useState<
        { label: string; value: string }[]
    >([])
    const [params, setParams] = useState({
        reponsible_id: '',
        employee_id: '',
    })

    const getTarget = async () => {
        try {
            const res = await getTargetList({
                limit: 100,
                type: TargetTypeEnum.Operation,
                status: AssessmentTargetStatus.Ended,
                ...params,
            })
            setTargetList(res?.entries || [])
            setSelectTargetId(res?.entries?.[0]?.id)
        } catch (error) {
            formatError(error)
        }
    }

    const getOverviewData = async () => {
        try {
            const res = await getOperationAssessmentOverview({
                target_id: selectTargetId!,
            })
            setOverviewData(res.statistics || {})
            setTargetDetail(res?.entries)
        } catch (error) {
            formatError(error)
        }
    }

    const getUsers = async () => {
        try {
            const res = await getUsersFrontendList()
            if (res?.entries?.length > 0) {
                setUserList([
                    {
                        value: '',
                        label: __('不限'),
                    },
                    ...(res?.entries || []).map((item) => ({
                        value: item.id,
                        label: item.name,
                    })),
                ])
            }
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        getUsers()
    }, [])

    useEffect(() => {
        getTarget()
    }, [params])

    useEffect(() => {
        if (selectTargetId) {
            getOverviewData()
        }
    }, [selectTargetId])

    return (
        <div className={styles['overview-container']}>
            <div className={styles.title}>
                {__('运营考核数据概览')}
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
                        {__('责任人')}：
                    </div>
                    <Select
                        placeholder={__('请选择')}
                        className={styles['search-item-select']}
                        options={userList}
                        value={params.reponsible_id}
                        onChange={(value) =>
                            setParams({ ...params, reponsible_id: value })
                        }
                    />
                </div>
                <div className={styles['search-item']}>
                    <div className={styles['search-item-label']}>
                        {__('协作成员')}：
                    </div>
                    <Select
                        placeholder={__('请选择')}
                        className={styles['search-item-select']}
                        options={userList}
                        value={params.employee_id}
                        onChange={(value) =>
                            setParams({ ...params, employee_id: value })
                        }
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
