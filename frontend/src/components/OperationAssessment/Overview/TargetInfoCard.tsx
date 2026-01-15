import { useEffect, useState } from 'react'
import { DownOutlined, RightOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { IconType } from '@/icons/const'
import { FontIcon } from '@/icons'
import { TextAreaView } from '@/components/AutoFormView/baseViewComponents'
import { htmlDecodeByRegExp } from '@/components/ResourcesDir/const'
import styles from './styles.module.less'
import __ from '../locale'
import { PlanAnchorConfig } from '../Plan/const'
import { PlanListUseSceneEnum } from '../const'
import {
    AssessmentTargetStatus,
    formatError,
    getTargetEvaluationDetail,
    IAssessmentTargetBaseInfo,
    IAssessmentTargetDetail,
} from '@/core'

interface IProps {
    useScene?: PlanListUseSceneEnum
    targetDetail: IAssessmentTargetBaseInfo
}

const TargetInfoCard = ({ useScene, targetDetail }: IProps) => {
    const [isExpand, setIsExpand] = useState(true)

    return (
        <div
            className={styles['target-info-card']}
            id={PlanAnchorConfig[0].key}
        >
            <div className={styles['card-header']}>
                {[
                    PlanListUseSceneEnum.TargetEvaluation,
                    PlanListUseSceneEnum.Overview,
                ].includes(useScene as PlanListUseSceneEnum) && (
                    <div
                        className={styles['expand-icon']}
                        onClick={() => setIsExpand(!isExpand)}
                    >
                        {isExpand ? <DownOutlined /> : <RightOutlined />}
                    </div>
                )}

                <div className={styles['target-icon-container']}>
                    <FontIcon
                        name="icon-mubiao-cuxian"
                        type={IconType.FONTICON}
                        className={styles['target-icon']}
                    />
                </div>
                <div
                    className={styles['target-name']}
                    title={targetDetail?.target_name}
                >
                    {targetDetail?.target_name}
                </div>
                {targetDetail?.status === AssessmentTargetStatus.Ended ? (
                    <div
                        className={classNames(
                            styles['target-status'],
                            styles['target-status-ended'],
                        )}
                    >
                        {__('已结束')}
                    </div>
                ) : targetDetail?.status ===
                  AssessmentTargetStatus.ToBeEvaluated ? (
                    <div
                        className={classNames(
                            styles['target-status'],
                            styles['target-status-to-be-evaluated'],
                        )}
                    >
                        {__('待评价')}
                    </div>
                ) : null}
            </div>
            <div
                className={classNames(
                    styles['card-content'],
                    !isExpand && styles['card-content-hidden'],
                )}
            >
                <div className={styles['content-item']}>
                    <div className={styles.label}>{__('目标描述')}：</div>
                    <div
                        className={classNames(
                            styles.value,
                            styles['row-value'],
                        )}
                    >
                        {targetDetail?.description ? (
                            <TextAreaView
                                initValue={htmlDecodeByRegExp(
                                    targetDetail?.description || '',
                                )}
                                rows={3}
                                placement="end"
                            />
                        ) : (
                            '--'
                        )}
                    </div>
                </div>
                <div className={styles['content-item']}>
                    <div className={styles.label}>{__('目标类型')}：</div>
                    <div
                        className={classNames(
                            styles.value,
                            styles['left-value'],
                        )}
                    >
                        {__('运营目标')}
                    </div>
                    <div className={styles.label}>{__('责任人')}：</div>
                    <div
                        className={classNames(
                            styles.value,
                            styles['left-value'],
                        )}
                        title={targetDetail?.responsible_name}
                    >
                        {targetDetail?.responsible_name}
                    </div>
                    <div className={styles.label}>{__('协作成员')}：</div>
                    <div
                        className={styles.value}
                        title={targetDetail?.employee_name}
                    >
                        {targetDetail?.employee_name}
                    </div>
                </div>
                <div className={styles['content-item']}>
                    <div className={styles.label}>{__('计划开始日期')}：</div>
                    <div
                        className={classNames(
                            styles.value,
                            styles['left-value'],
                        )}
                    >
                        {targetDetail?.start_date}
                    </div>
                    <div className={styles.label}>{__('计划结束日期')}：</div>
                    <div className={styles.value}>
                        {targetDetail?.end_date || '--'}
                    </div>
                </div>
                <div className={styles['content-item']}>
                    <div className={styles.label}>
                        {__('目标创建人/创建时间')}：
                    </div>
                    <div
                        className={classNames(
                            styles.value,
                            styles['left-value'],
                        )}
                    >
                        {targetDetail?.created_by_name} 创建于
                        {targetDetail?.created_at}
                    </div>
                    <div className={styles.label}>
                        {__('目标更新人/更新时间')}：
                    </div>
                    <div className={styles.value}>
                        {targetDetail?.updated_by_name &&
                        targetDetail?.updated_at
                            ? `${targetDetail?.updated_by_name}更新于${targetDetail?.updated_at}`
                            : '--'}
                    </div>
                </div>
                {useScene === PlanListUseSceneEnum.TargetDetail &&
                targetDetail?.status === AssessmentTargetStatus.Ended ? null : (
                    <div className={styles['content-item']}>
                        <div className={styles.label}>{__('评价内容')}：</div>
                        <div
                            className={classNames(
                                styles.value,
                                styles['row-value'],
                            )}
                        >
                            {targetDetail?.evaluation_content || '--'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TargetInfoCard
