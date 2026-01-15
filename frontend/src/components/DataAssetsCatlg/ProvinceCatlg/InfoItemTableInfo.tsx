import React, { useEffect, useState, useMemo } from 'react'

import Icon from '@ant-design/icons'
import { Table } from 'antd'
import { useAntdTable } from 'ahooks'
import { noop, trim } from 'lodash'
import classnames from 'classnames'
import styles from './styles.module.less'
import { ReactComponent as icon1 } from '@/assets/DataAssetsCatlg/icon1.svg'
import dataEmpty from '@/assets/dataEmpty.svg'
import __ from './locale'
import Empty from '@/ui/Empty'
import { getPrvcDataCatlgInfoItemById } from '@/core'
import Loader from '@/ui/Loader'
import { DataCatlgTabKey, formatCatlgError } from '../helper'
import {
    pCatlgDataTypeMap,
    pCatlgShareTypeMap,
    PCatlgShareTypeEnum,
    PCatlgOpenTypeEnum,
    pCatlgOpenTypeMap,
    pCatlgSensitiveLevelMap,
    pCatlgSystemClassMap,
} from './helper'
import { SearchInput } from '@/ui'

const DEFAULTPAGESIZE = 10

interface IInfoItemTableInfoParams {
    tableInfoType: string
    id: string
    errorCallback?: (error?: any) => void
}

const InfoItemTableInfo: React.FC<IInfoItemTableInfoParams> = ({
    tableInfoType,
    id,
    errorCallback = noop,
}) => {
    const [searchCondition, setSearchConditon] = useState<any>({
        // id: id || '',
        // limit: DEFAULTPAGESIZE,
        // offset: 1,
        keyword: '',
        // sort: SortType.CREATED,
        // direction: SortDirection.DESC,
    })

    const columns = [
        {
            title: __('信息项中文名称'),
            dataIndex: 'column_name_cn',
            key: 'column_name_cn',
            render: (text, record) => (
                <div className={styles.tableTrContainer} title={text || ''}>
                    <div className={styles.itemTitle}>{text || '--'}</div>
                    {record?.primary_key === '是' && (
                        <span className={styles.primaryKey}>唯一标识</span>
                    )}
                </div>
            ),
        },

        {
            title: __('信息项英文名称'),
            dataIndex: 'column_name_en',
            key: 'column_name_en',

            render: (text) => text || '--',
        },
        {
            title: __('数据类型'),
            dataIndex: 'data_format',
            key: 'data_format',
            width: '220px',
            render: (text, record) => (
                <div className={styles.tableTrContainer}>
                    <div className={styles.itemTitle}>
                        {text
                            ? `${pCatlgDataTypeMap[text] || ''}（长度：${
                                  record?.length
                              }）`
                            : '--'}
                    </div>
                </div>
            ),
        },
        {
            title: __('共享类型'),
            dataIndex: 'column_access_limit',
            key: 'column_access_limit',

            render: (text, record) =>
                text
                    ? `${pCatlgShareTypeMap[text]}${
                          text === PCatlgShareTypeEnum.NOSHARE
                              ? `（${record.column_access_condition}）`
                              : ''
                      }`
                    : '--',
        },
        {
            title: __('开放类型'),
            dataIndex: 'column_open_limit',
            key: 'column_open_limit',
            render: (text, record) =>
                text
                    ? `${pCatlgOpenTypeMap[text]}${
                          text !== PCatlgOpenTypeEnum.NOTOPEN &&
                          record.column_open_condition
                              ? `（${record.column_open_condition}）`
                              : ''
                      }`
                    : '--',
        },
        {
            title: __('值域'),
            dataIndex: 'range',
            key: 'range',
            render: (text) => text || '--',
        },
        {
            title: __('分级'),
            dataIndex: 'sensitive_level',
            key: 'sensitive_level',

            render: (text) => (text ? pCatlgSensitiveLevelMap[text] : '--'),
        },
        {
            title: __('应用系统'),
            dataIndex: 'system',
            key: 'system',

            render: (text) => text || '--',
        },
        {
            title: __('应用系统分类'),
            dataIndex: 'system_class',
            key: 'system_class',
            render: (text) => (text ? pCatlgSystemClassMap[text] : '--'),
        },
    ]

    useEffect(() => {
        if (tableInfoType !== DataCatlgTabKey.SAMPLTDATA) {
            run({ ...pagination, ...searchCondition })
        }
    }, [tableInfoType])

    useEffect(() => {
        setSearchConditon({
            ...searchCondition,
            // offset: 1,
        })
        run({ ...pagination, ...searchCondition, current: 1 })
    }, [id])

    const getDataCatlgTableList = async (params: any) => {
        try {
            const { current: offset, pageSize: limit, keyword } = params

            const res = await getPrvcDataCatlgInfoItemById(id, {
                offset,
                limit,
                keyword,
            })
            return {
                total: res.total_count || 0,
                list: res?.entries || [],
            }
        } catch (error) {
            formatCatlgError(error, errorCallback)
            return { total: 0, list: [] }
        }
    }

    const { tableProps, run, pagination } = useAntdTable(
        getDataCatlgTableList,
        {
            defaultPageSize: DEFAULTPAGESIZE,
            manual: true,
        },
    )

    const props: any = useMemo(() => {
        const p: { dataSource; loading; onChange; [key: string]: any } =
            tableProps
        return p
    }, [tableProps])

    return (
        <div
            className={classnames(
                styles.rescInfoWrapper,
                styles.rescItemWrapper,
            )}
        >
            <div className={styles.infoHeader}>
                <div className={styles.infoTitle}>
                    <Icon component={icon1} className={styles.icon} />
                    <div>{__('资源信息')}</div>
                </div>
                <div className={styles.infoHeaderRight}>
                    <SearchInput
                        placeholder={__('搜索中英文名称')}
                        onKeyChange={(val: string) => {
                            const keyword = trim(val)
                            if (keyword === searchCondition.keyword) return
                            setSearchConditon({
                                ...searchCondition,
                                keyword,
                            })
                            run({
                                ...pagination,
                                ...searchCondition,
                                keyword,
                                current: 1,
                            })
                        }}
                        className={styles.searchInput}
                        style={{ width: 272 }}
                    />
                </div>
            </div>
            <div className={styles.infoContentWrapper}>
                {tableProps?.loading ? (
                    <div className={styles.loading}>
                        <Loader />
                    </div>
                ) : tableProps?.dataSource?.length > 0 ||
                  searchCondition.keyword ? (
                    <div className={styles.tableWrapper}>
                        <Table
                            {...props}
                            className={styles.fieldTable}
                            rowKey={(record) => record.id || record.index}
                            columns={columns}
                            scroll={{
                                y:
                                    tableProps?.dataSource?.length >
                                    DEFAULTPAGESIZE
                                        ? 'calc(100vh - 444px)'
                                        : 'calc(100vh - 482px)',
                            }}
                            pagination={{
                                ...tableProps.pagination,
                                // showSizeChanger: true,
                                hideOnSinglePage: true,
                                showQuickJumper: true,
                                showTotal: (count) => {
                                    return `共 ${count} 条记录`
                                },
                            }}
                            bordered={false}
                        />
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <Empty desc={__('暂无数据')} iconSrc={dataEmpty} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default InfoItemTableInfo
