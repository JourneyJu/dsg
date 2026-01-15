import { Empty, Table } from 'antd'
import React, {
    Ref,
    forwardRef,
    useEffect,
    useState,
    useImperativeHandle,
} from 'react'
import moment from 'moment'
import { useAntdTable } from 'ahooks'
import styles from './styles.module.less'
import { formatError, queryLicenseInfoItems } from '@/core'
import __ from './locale'
import { basicInfoDetailsList } from './helper'
import { DetailsLabel, Loader } from '@/ui'
import { LabelTitle } from '@/components/ResourcesDir/BaseInfo'
import { onlineStatusList } from '../helper'
import { getState } from '@/components/DatasheetView/helper'
import { typeOptoins } from '@/components/ResourcesDir/const'
import dataEmpty from '@/assets/dataEmpty.svg'

interface IDirBasicInfo {
    // 开放目录id
    id: string
    isMarket?: boolean
    basicInfoLoading?: boolean
    basicInfo?: any
}
// DirDetailContent传参数
const BasicInfo = forwardRef((props: IDirBasicInfo, ref: Ref<any>) => {
    const { id, isMarket, basicInfoLoading, basicInfo } = props
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
        getBasicInfo: () => {
            return basicInfo
        },
    }))

    const getInfoItems = async (params: any) => {
        try {
            const { current: offset, pageSize: limit, ...rest } = params
            const res = await queryLicenseInfoItems(id, {
                offset,
                limit,
            })
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
                if (['updated_at', 'online_time'].includes(it.key)) {
                    obj.value = data[it.key]
                        ? moment(data[it.key]).format('YYYY-MM-DD HH:mm:ss')
                        : '--'
                }
                if (it.key === 'online_status') {
                    obj.render = () => {
                        return (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {getState(data[it.key], onlineStatusList)}
                            </div>
                        )
                    }
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

    return basicInfoLoading ? (
        <Loader />
    ) : (
        <div className={styles.basicContentWrapper}>
            <div className={styles.basicContent}>
                {basicInfoDetailsData.map((item) => {
                    return (
                        <div key={item.key}>
                            <LabelTitle label={item.label} />
                            <div style={{ marginBottom: '20px' }}>
                                <DetailsLabel
                                    wordBreak
                                    labelWidth="160px"
                                    detailsList={item.list}
                                    border={isMarket}
                                />
                            </div>
                        </div>
                    )
                })}
                <div>
                    <LabelTitle label={__('信息项')} />
                    <div style={{ marginBottom: '20px' }}>
                        <Table
                            {...tableProps}
                            columns={infoItemsColumns}
                            locale={{
                                emptyText: !tableLoading && (
                                    <Empty
                                        description={__('暂无数据')}
                                        image={dataEmpty}
                                    />
                                ),
                            }}
                            pagination={{
                                ...tableProps.pagination,
                                hideOnSinglePage:
                                    tableProps.pagination.total <= 10,
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
        </div>
    )
})

export default BasicInfo
