import React, { useEffect, useMemo, useState } from 'react'
import { Drawer, Table } from 'antd'
import styles from './styles.module.less'
import __ from './locale'
import { getPlatformNumber, useQuery } from '@/utils'
import { AuditLogType, fieldsMap, logOptionAll, namesMap } from './helper'
import { Empty } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'
import { LoginPlatform } from '@/core'

interface IDetailsDrawer {
    data?: any
    onClose: () => void
}

/**
 * 日志详情
 */
const DetailsDrawer: React.FC<IDetailsDrawer> = ({ data, onClose }) => {
    const query = useQuery()
    const tab = query.get('tab') || AuditLogType.ManagementLog
    const platform = getPlatformNumber()

    const listData = useMemo(() => {
        const showKeys =
            logOptionAll(platform !== LoginPlatform.default)
                .find((item) => item.value === data.operation)
                ?.detailsList?.filter((item) => data[item]) || []
        if (showKeys.length === 0) {
            return []
        }
        return showKeys
            .map((item) => {
                const field = fieldsMap(platform !== LoginPlatform.default)[
                    item
                ]
                if (!field) {
                    return undefined
                }

                // 标题转换
                let { label } = field
                if (['id', 'api'].includes(item)) {
                    const name = namesMap(
                        platform !== LoginPlatform.default,
                    ).find((it) => it.keys.includes(data.operation))
                    label = name ? `${name.label}${label}` : label
                }

                // 内容转换
                let value = data[item]
                if (field.render) {
                    value = field.render(data[item])
                }

                return {
                    ...field,
                    label,
                    value,
                }
            })
            .filter((item) => !!item)
    }, [data])

    // const renderContent = (value) => {
    //     switch (typeof value) {
    //         case 'string':
    //         case 'boolean':
    //         case 'number':
    //             return value
    //         case 'object':
    //             if (Array.isArray(value)) {
    //                 const cols = value
    //                     .map((item) => keys(item))
    //                     .flat()
    //                     .map((item) => ({
    //                         title: item,
    //                         dataIndex: item,
    //                         key: item,
    //                         ellipsis: true,
    //                         width: 200,
    //                     }))
    //                 return (
    //                     <Table
    //                         dataSource={value}
    //                         columns={cols}
    //                         scroll={{ x: cols.length * 200, y: 400 }}
    //                         pagination={false}
    //                     />
    //                 )
    //             }
    //             return toPairs(value)
    //                 .filter((item) => !!item?.[1])
    //                 .map((item, idx) => renderItem(item, idx))
    //         default:
    //             return ''
    //     }
    // }

    // const renderItem = (item, index) => {
    //     return (
    //         <div className={styles.logDetails_item} key={index}>
    //             <div className={styles.title}>{item?.[0]}</div>
    //             <div className={styles.content}>{renderContent(item?.[1])}</div>
    //         </div>
    //     )
    // }

    return (
        <Drawer
            title={
                tab === AuditLogType.ManagementLog
                    ? __('管理日志详情')
                    : __('操作日志详情')
            }
            placement="right"
            maskClosable
            onClose={onClose}
            open={!!data}
            destroyOnClose
            bodyStyle={{ padding: '16px 16px 8px' }}
            contentWrapperStyle={{ maxWidth: '80%' }}
            className={styles.logDetails}
        >
            {listData.length > 0 ? (
                listData.map((item, idx) => {
                    return (
                        <div className={styles.logDetails_item} key={idx}>
                            <div className={styles.title}>{item.label}</div>
                            <div className={styles.content}>{item.value}</div>
                        </div>
                    )
                })
            ) : (
                <Empty desc={__('暂无数据')} iconSrc={dataEmpty} />
            )}
        </Drawer>
    )
}

export default DetailsDrawer
