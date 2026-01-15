import { Table } from 'antd'
import React, {
    forwardRef,
    useEffect,
    useState,
    useImperativeHandle,
    useContext,
} from 'react'
import moment from 'moment'
import { useAntdTable, useUpdateEffect } from 'ahooks'
import styles from './styles.module.less'
import {
    formatError,
    queryFontendLicenseDetail,
    queryLicenseInfoItems,
} from '@/core'
import __ from './locale'
import { DetailsLabel, Empty, Loader } from '@/ui'
import { basicInfoDetailsList } from './helper'
import { typeOptoins } from '@/components/ResourcesDir/const'
import { MicroWidgetPropsContext } from '@/context'
import dataEmpty from '@/assets/dataEmpty.svg'

interface ILicenseBasicInfo {
    // 开放目录id
    id: string
    details?: any
    isMarket?: boolean
}

const BasicInfo = forwardRef((props: ILicenseBasicInfo, ref) => {
    const { id, details, isMarket } = props
    const { microWidgetProps } = useContext(MicroWidgetPropsContext)

    const [loading, setLoading] = useState(false)

    const [basicInfo, setBasicInfo] = useState<any>()
    const [infoItems, setInfoItems] = useState<any[]>([])
    // 信息项查询参数
    const [searchCondition, setSearchCondition] = useState({
        offset: 1,
        limit: 10,
    })

    const [basicInfoDetailsData, setBasicInfoDetailsData] =
        useState<any[]>(basicInfoDetailsList)

    const infoItemsColumns = [
        {
            title: __('信息项业务名称'),
            dataIndex: 'business_name',
            key: 'business_name',
            render: (text: string) => <span>{text || '--'}</span>,
        },
        {
            title: __('数据类型'),
            dataIndex: 'data_type',
            key: 'data_type',
            render: (data_type: string, record: any) => {
                const data_length = record?.data_length
                    ? `（${__('长度')}：${record?.data_length}）`
                    : ''
                const val =
                    typeOptoins.find((item: any) => item.strValue === data_type)
                        ?.label || ''
                const title = `${val}${data_length}`
                return <span title={title}>{title || '--'}</span>
            },
        },
    ]

    useImperativeHandle(ref, () => ({
        basicInfo,
    }))

    const getDetails = async () => {
        if (!id) return
        try {
            setLoading(true)
            const res = await queryFontendLicenseDetail(id)
            setBasicInfo(res)
        } catch (err) {
            formatError(err, microWidgetProps?.components?.toast)
        } finally {
            setLoading(false)
        }
    }

    const getInfoItems = async (params: any) => {
        try {
            const { current: offset, pageSize: limit } = params
            const res = await queryLicenseInfoItems(id, {
                offset,
                limit,
            })
            setInfoItems(
                res.entries?.slice((offset - 1) * limit, offset * limit),
            )
            return {
                list: res?.entries || [],
                total: res?.total_count || 0,
            }
        } catch (error) {
            formatError(error)
            return { total: 0, list: [] }
        }
    }

    const {
        tableProps,
        run,
        pagination,
        loading: tableLoading,
    } = useAntdTable(getInfoItems, {
        defaultPageSize: 10,
        manual: true,
    })

    useEffect(() => {
        run({
            ...pagination,
            ...searchCondition,
        })
    }, [searchCondition])

    useUpdateEffect(() => {
        if (details) {
            setBasicInfo(details)
        } else if (id) {
            getDetails()
        }
    }, [details])

    useEffect(() => {
        if (basicInfo) {
            valueBasicInfo(basicInfo)
        }
    }, [basicInfo])

    const valueBasicInfo = (data: any) => {
        const filterKeys: string[] = []
        const list = basicInfoDetailsData?.map((item) => {
            const itemList = item?.list.map((it) => {
                const obj = { ...it, value: data[it.key] }
                if (['updated_at'].includes(it.key)) {
                    obj.value = data[it.key]
                        ? moment(data[it.key]).format('YYYY-MM-DD HH:mm:ss')
                        : '--'
                }
                return obj
            })
            return {
                ...item,
                list: itemList.filter((it) => !filterKeys.includes(it.key)),
            }
        })
        setBasicInfoDetailsData(list.filter((item) => item.list?.length))
    }

    return loading ? (
        <Loader />
    ) : (
        <div className={styles.basicContentWrapper}>
            <div className={styles.basicContent}>
                {basicInfoDetailsData.map((item) => {
                    return (
                        <div key={item.key}>
                            <div
                                style={{
                                    marginBottom: '20px',
                                    fontWeight: 550,
                                }}
                            >
                                {item.label}
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <DetailsLabel
                                    wordBreak
                                    isNeedColon={false}
                                    labelWidth="160px"
                                    detailsList={item.list}
                                    border={isMarket}
                                />
                            </div>
                        </div>
                    )
                })}

                <div>
                    <div
                        style={{
                            marginBottom: '20px',
                            fontWeight: 550,
                        }}
                    >
                        {__('信息项')}
                    </div>
                    <Table
                        {...tableProps}
                        columns={infoItemsColumns}
                        locale={{
                            emptyText: (
                                <Empty
                                    desc={__('暂无数据')}
                                    iconSrc={dataEmpty}
                                />
                            ),
                        }}
                        pagination={{
                            ...tableProps.pagination,
                            hideOnSinglePage: tableProps.pagination.total <= 10,
                            pageSizeOptions: [10, 20, 50, 100],
                            showQuickJumper: true,
                            responsive: true,
                            showLessItems: true,
                            showSizeChanger: true,
                            showTotal: (count) => {
                                return `共 ${count} 条记录 第 ${
                                    tableProps.pagination.current
                                }/${Math.ceil(
                                    count / tableProps.pagination.pageSize,
                                )} 页`
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    )
})

export default BasicInfo
