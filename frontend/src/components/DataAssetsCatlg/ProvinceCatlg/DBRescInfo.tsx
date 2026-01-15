import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useAntdTable } from 'ahooks'
import { Anchor, Table } from 'antd'
import Icon from '@ant-design/icons'

import classnames from 'classnames'
import { DetailsLabel, Loader } from '@/ui'
import { formatError, getPrvcDataCatlgDBById } from '@/core'

import styles from './styles.module.less'
import __ from './locale'
import { ReactComponent as icon1 } from '@/assets/DataAssetsCatlg/icon1.svg'
import {
    dayOfWeek,
    dbRescBasicDetailConfig,
    ScheduleTypeEnum,
    scheduleTypeMap,
} from './helper'

interface IDBRescInfo {
    rescId: string
}

const DBRescInfo = ({ rescId }: IDBRescInfo) => {
    const [loading, setLoading] = useState(false)
    const [rescDetail, setRescDetail] = useState<any>({})

    const container = useRef<any>(null)
    const { Link } = Anchor

    const columns = [
        {
            title: __('库表字段'),
            dataIndex: 'db_column_en_name',
            key: 'db_column_en_name',
            render: (text) => (
                <div className={styles.tableTrContainer} title={text || ''}>
                    <div className={styles.itemTitle}>{text || '--'}</div>
                </div>
            ),
        },
        {
            title: <div className={styles.divider} />,
            dataIndex: 'xxx',
            key: 'xxx',
            render: () => <div className={styles.divider} />,
        },
        {
            title: __('信息项英文名称'),
            dataIndex: 'info_item_en_name',
            key: 'info_item_en_name',
            render: (text) => text || '--',
        },
    ]

    useEffect(() => {
        getRescDetail()
    }, [rescId])

    const getRescDetail = async () => {
        if (!rescId) return
        try {
            setLoading(true)
            const res = await getPrvcDataCatlgDBById(rescId)
            setRescDetail(res || {})
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    const getDataCatlgTableList = async (params: any) => {
        try {
            const { current, pageSize, catalogID } = params

            const data = rescDetail?.column_mapping || []
            const totalSize = data?.length ?? 0
            const start =
                (current - 1) * pageSize >= 0 ? (current - 1) * pageSize : 0
            const count =
                current * pageSize <= totalSize
                    ? pageSize
                    : totalSize % pageSize
            const end = start + count
            return {
                total: data?.length || 0,
                list: data?.slice(start, end) || [],
            }
        } catch (error) {
            formatError(error)
            return { total: 0, list: [] }
        }
    }

    const { tableProps, run, pagination } = useAntdTable(
        getDataCatlgTableList,
        {
            defaultPageSize: 10,
            manual: true,
        },
    )

    const props: any = useMemo(() => {
        const p: { dataSource; loading; onChange; [key: string]: any } =
            tableProps
        return p
    }, [tableProps])

    useEffect(() => {
        run(pagination)
    }, [rescDetail])

    return (
        <div
            className={classnames(
                styles.rescInfoWrapper,
                styles.dbRescInfoWrapper,
            )}
        >
            <div className={styles.infoHeader}>
                <Icon component={icon1} className={styles.icon} />

                <div>{__('资源信息')}</div>
            </div>
            <div className={styles.infoContentWrapper} ref={container}>
                {loading ? (
                    <div className={styles.loading}>
                        <Loader />
                    </div>
                ) : (
                    <>
                        <div className={styles.infoContent}>
                            <div id="basic-info">
                                <div className={styles.modTitle}>
                                    {__('基本信息')}
                                </div>

                                <DetailsLabel
                                    wordBreak
                                    detailsList={dbRescBasicDetailConfig?.map(
                                        (item: any) => {
                                            const { key, subKey } = item
                                            const value =
                                                item.value ||
                                                (subKey
                                                    ? rescDetail?.[item.key]?.[
                                                          subKey
                                                      ]
                                                    : rescDetail?.[item.key])
                                            if (key === 'schedule_type') {
                                                let showContent = value
                                                const {
                                                    minute,
                                                    minute_of_hour,
                                                    hour_of_day,
                                                    weekday,
                                                    day_of_month,
                                                } = rescDetail
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
                                                                ScheduleTypeEnum
                                                                    .HOUR_OF_DAY
                                                            ]
                                                        }，${hour_of_day}:${minute_of_hour} 调度一次`
                                                        break

                                                    case ScheduleTypeEnum.WEEKDAY:
                                                        showContent = `${
                                                            scheduleTypeMap[
                                                                ScheduleTypeEnum
                                                                    .DAY_OF_MONTH
                                                            ] +
                                                            dayOfWeek(
                                                                rescDetail?.weekday,
                                                            )
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
                                        },
                                    )}
                                />
                            </div>

                            <div id="field-relation">
                                <div
                                    className={styles.modTitle}
                                    // id="field-relation"
                                >
                                    {__('字段关联关系')}
                                </div>
                                <Table
                                    {...props}
                                    className={styles.fieldTable}
                                    rowKey={(record) =>
                                        record.rescId || record.index
                                    }
                                    columns={columns}
                                    pagination={{
                                        ...tableProps.pagination,
                                        hideOnSinglePage: true,
                                        showQuickJumper: true,
                                        showTotal: (count) => {
                                            return `共 ${count} 条记录`
                                        },
                                    }}
                                    bordered={false}
                                />
                            </div>
                        </div>
                        <div className={styles.menuContainer}>
                            <Anchor
                                targetOffset={160}
                                getContainer={() =>
                                    (container.current as HTMLElement) || window
                                }
                                className={styles.anchorWrapper}
                                onClick={(e: any) => {
                                    e.preventDefault()
                                }}
                            >
                                <Link
                                    href="#basic-info"
                                    title={__('基本信息')}
                                />
                                <Link
                                    href="#field-relation"
                                    title={__('字段关联关系')}
                                />
                            </Anchor>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default memo(DBRescInfo)
