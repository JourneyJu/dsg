import React from 'react'
import { Pie } from '@antv/g2plot'
import { Button } from 'antd'
import { noop } from 'lodash'
import { dataProcessColumns, dataQualityOptions } from './const'
import styles from './styles.module.less'
import __ from './locale'

// 工单卡片
export const WorkOrderCard = ({ data }: { data: any }) => {
    return (
        <div className={styles.workOrderCard}>
            <div className={styles.workOrderCardTitle}>
                {
                    dataProcessColumns.find((item) => item.key === data.type)
                        ?.title
                }
            </div>
            <div className={styles.workOrderCardValue}>
                {data.value?.toLocaleString('en-US')}
            </div>
            <div className={styles.workOrderCardValueLine}>
                <span className={styles.workOrderCardValueLineItem}>
                    <span className={styles.workOrderCardValueLineItemTitle}>
                        {__('质量检测：')}
                    </span>
                    <span className={styles.workOrderCardValueLineItemValue}>
                        {data.dataQuality}
                    </span>
                </span>
                <span className={styles.workOrderCardValueLineItem}>
                    <span className={styles.workOrderCardValueLineItemTitle}>
                        {__('数据融合：')}
                    </span>
                    <span className={styles.workOrderCardValueLineItemValue}>
                        {data.dataFusion}
                    </span>
                </span>
            </div>
        </div>
    )
}

/**
 * 数据质量卡片
 * @param param0 {data: any, onDetail?: (detail: any) => void}
 * @returns
 */
export const DataQualityCard = ({
    data,
    onDetail = noop,
    key = '',
    options = dataQualityOptions,
}: {
    data: any
    onDetail?: (detail: any) => void
    key: string | number
    options?: any[]
}) => {
    return (
        <div className={styles.dataQualityCard} key={key}>
            <div className={styles.dataQualityCardTitle}>
                <span>
                    {options.find((item) => item.key === data.type)?.title}
                </span>
                {data.hasDetail && (
                    <Button type="link" onClick={() => onDetail(data)}>
                        {__('详情')}
                    </Button>
                )}
            </div>
            <div className={styles.dataQualityCardValue}>{data.value}</div>
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
    rightNode = null,
}: {
    title: string
    description?: string
    onDetail?: () => void
    rightNode?: React.ReactNode | null
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
            {rightNode && <div className={styles.rightNode}>{rightNode}</div>}
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
        value >= 0.85
            ? {
                  color: '#009944',
                  label: __('优'),
              }
            : value >= 0.6
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
            {value === null ? (
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

export const generatePie = (
    data: any,
    domRef: string | HTMLElement,
    title: string,
    totalCount: number = 0,
    color: string[] = ['#5B91FF', '#A5D9E8'],
) => {
    const piePlot = new Pie(domRef, {
        appendPadding: 10,
        data,
        angleField: 'value',
        colorField: 'type',
        radius: 1,
        innerRadius: 0.8,
        meta: {
            value: {
                formatter: (v) => `${v}`,
            },
        },
        color,
        label: {
            type: 'inner',
            offset: '-50%',
            content: '{value}',
            style: {
                textAlign: 'center',
                fontSize: 14,
            },
        },
        statistic: {
            title: false,
            content: {
                customHtml: (container, view, datum) => {
                    return `<div style="margin-top:4px;font-size:14px;display:flex;align-items:center;justify-content:center; flex-direction: column; color: #78839F; font-weight: 400;">
                    <div>${title}</div>
                    <div style="color: #000000;font-size:20px; font-weight: 550;">${totalCount.toLocaleString(
                        'en-US',
                    )}</div>
                    </div>`
                },
            },
        },
    })
    piePlot.render()
    return piePlot
}
