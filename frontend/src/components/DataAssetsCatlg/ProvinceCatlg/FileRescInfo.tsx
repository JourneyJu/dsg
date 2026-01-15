import { memo, useEffect, useState } from 'react'
import Icon from '@ant-design/icons'
import classnames from 'classnames'
import { DetailsLabel, Loader } from '@/ui'
import { formatError, getPrvcDataCatlgFileById } from '@/core'

import styles from './styles.module.less'
import __ from './locale'
import {
    dayOfWeek,
    fileDetailConfig,
    ScheduleTypeEnum,
    scheduleTypeMap,
} from './helper'
import { ReactComponent as icon1 } from '@/assets/DataAssetsCatlg/icon1.svg'

interface IFileRescInfo {
    rescId: string
}

const FileRescInfo = ({ rescId }: IFileRescInfo) => {
    const [loading, setLoading] = useState(false)
    const [fileDetail, setFileDetail] = useState<any>({})

    useEffect(() => {
        getRescDetail()
    }, [rescId])

    const getRescDetail = async () => {
        if (!rescId) return
        try {
            setLoading(true)
            const res = await getPrvcDataCatlgFileById(rescId)
            setFileDetail(res)
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className={classnames(
                styles.rescInfoWrapper,
                styles.fileRescInfoWrapper,
            )}
        >
            <div className={styles.infoHeader}>
                <Icon component={icon1} className={styles.icon} />
                <div>{__('资源信息')}</div>
            </div>

            <div className={styles.infoContentWrapper}>
                {loading ? (
                    <div className={styles.loading}>
                        <Loader />
                    </div>
                ) : (
                    <div className={styles.infoContent}>
                        <div className={styles.modTitle}>{__('基本信息')}</div>

                        <DetailsLabel
                            wordBreak
                            detailsList={fileDetailConfig?.map((item: any) => {
                                const { key, subKey } = item
                                const value =
                                    item.value ||
                                    (subKey
                                        ? fileDetail?.[item.key]?.[subKey]
                                        : fileDetail?.[item.key])
                                if (key === 'schedule_type') {
                                    let showContent = value
                                    const {
                                        minute,
                                        minute_of_hour,
                                        hour_of_day,
                                        weekday,
                                        day_of_month,
                                    } = fileDetail
                                    switch (value) {
                                        case ScheduleTypeEnum.NONE:
                                            showContent = '一次性'
                                            break
                                        case ScheduleTypeEnum.MINUTE:
                                            showContent = `每${minute}分钟 调度一次`
                                            break

                                        case ScheduleTypeEnum.HOUR_OF_DAY:
                                            showContent = `${
                                                scheduleTypeMap[
                                                    ScheduleTypeEnum.HOUR_OF_DAY
                                                ]
                                            }${
                                                hour_of_day &&
                                                minute_of_hour &&
                                                `，${hour_of_day}:${minute_of_hour}`
                                            } 调度一次`
                                            break

                                        case ScheduleTypeEnum.WEEKDAY:
                                            showContent = `${
                                                scheduleTypeMap[
                                                    ScheduleTypeEnum
                                                        .DAY_OF_MONTH
                                                ] +
                                                dayOfWeek(fileDetail?.weekday)
                                            }，${hour_of_day}:${minute_of_hour} 调度一次`
                                            break
                                        case ScheduleTypeEnum.DAY_OF_MONTH:
                                            showContent = `${
                                                scheduleTypeMap[
                                                    ScheduleTypeEnum
                                                        .DAY_OF_MONTH
                                                ]
                                            }${day_of_month}日，${hour_of_day}:${minute_of_hour} 调度一次`
                                            break
                                        default:
                                            showContent = '--'
                                            break
                                    }
                                    return {
                                        ...item,
                                        value: showContent,
                                    }
                                }
                                return {
                                    ...item,
                                    value,
                                }
                            })}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default memo(FileRescInfo)
