import { Button } from 'antd'
import { BaseInfoClassificationEnum } from './const'
import styles from './styles.module.less'
import __ from './locale'

export const BaseViewCard = ({
    dataKey,
    label,
    value,
}: {
    dataKey: string
    label: string
    value: number | string
}) => {
    return (
        <div className={styles.baseViewCardWrapper} key={dataKey}>
            <div className={styles.titleWrapper}>
                <span>{label}</span>
            </div>
            <div className={styles.valueWrapper}>
                <span>
                    {dataKey === BaseInfoClassificationEnum.COMPLETION_RATE
                        ? `${value}%`
                        : value?.toLocaleString('en-US')}
                </span>
            </div>
        </div>
    )
}

/**
 * 标题标签
 * @param param0 {title: string, description?: string}
 * @returns
 */
export const TitleLabel = ({
    title,
    description,
    onDetail,
}: {
    title: string
    description?: string
    onDetail?: () => void
}) => {
    return (
        <div className={styles.titleLabel}>
            <div className={styles.titleLabelContent}>
                <div className={styles.titleIcon} />
                <div className={styles.titleLabelContent}>
                    <span className={styles.titleLabelTitle}>{title}</span>
                    {description && (
                        <span className={styles.titleLabelDescription}>
                            {description}
                        </span>
                    )}
                </div>
            </div>
            {onDetail && (
                <Button type="link" onClick={onDetail}>
                    {__('详情')}
                </Button>
            )}
        </div>
    )
}

/**
 * 数据评估标签
 * @param param0
 * @returns
 */
export const DataAssessmentLabel = ({
    value,
    label,
}: {
    value: number
    label: string
}) => {
    const tipConfig =
        value >= 85
            ? {
                  color: '#009944',
                  label: __('优'),
              }
            : value >= 60
            ? {
                  color: '#FFBA30',
                  label: __('良'),
              }
            : {
                  color: '#F5890D',
                  label: __('中'),
              }
    return (
        <div className={styles.dataAssessmentLabel}>
            <span className={styles.dataAssessmentLabelValue}>{label}</span>
            {Number.isNaN(Number(value)) ? (
                '--'
            ) : (
                <div
                    className={styles.dataAssessmentLabelTip}
                    style={{ backgroundColor: tipConfig.color }}
                >
                    {tipConfig.label}
                </div>
            )}
        </div>
    )
}
