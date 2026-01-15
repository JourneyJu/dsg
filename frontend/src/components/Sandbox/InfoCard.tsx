import React from 'react'
import { Progress } from 'antd'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import __ from './locale'
import styles from './styles.module.less'
import { ISandboxSpaceItem } from '@/core'

interface CardProps {
    data: ISandboxSpaceItem
}
const InfoCard: React.FC<CardProps> = ({ data }) => {
    return (
        <div className={styles['card-wrapper']}>
            <div className={styles['card-header']}>
                <FontIcon
                    name="icon-shujuyuan1"
                    type={IconType.COLOREDICON}
                    className={styles['sandbox-icon']}
                />
                <div className={styles.name} title={data.project_name}>
                    {data.project_name}
                </div>
            </div>
            <div className={styles['space-container']}>
                <div className={styles['space-desc']}>
                    {__('已使用${used}G（剩余${free}G/总共${total}G）', {
                        used: data.used_space || '0',
                        free: data.total_space - data.used_space || '0',
                        total: data.total_space || '0',
                    })}
                    <Progress
                        percent={(data.used_space || 0) / data.total_space}
                        showInfo={false}
                        strokeColor="#3A8FF0"
                    />
                </div>
            </div>
            <div className={styles['info-container']}>
                <div className={styles['info-name']}>
                    {data.recent_data_set || '--'}
                </div>
                <div className={styles['update-time']}>
                    {__('更新于')} {data.updated_at}
                </div>
            </div>
        </div>
    )
}

export default InfoCard
