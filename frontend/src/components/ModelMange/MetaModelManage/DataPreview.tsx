import { useEffect, useState } from 'react'
import { Table } from 'antd'
import classnames from 'classnames'
import styles from './styles.module.less'
import {
    formatDataType,
    getFieldTypeIcon,
} from '@/components/DatasheetView/helper'
import {
    formatError,
    getDatasheetViewDetails,
    getDataViewPreview,
} from '@/core'
import { Empty, Loader } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'
import __ from '../locale'

interface DataPreviewProps {
    id: string
    metaFields: any[]
    dataViewId: string
}
const DataPreview = ({ id, metaFields, dataViewId }: DataPreviewProps) => {
    const [columns, setColumns] = useState<any[]>([])
    const [data, setData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (id && metaFields && dataViewId) {
            getColumns()
        }
    }, [id, metaFields, dataViewId])

    const columnsFormat = (columnsData: any[]) => {
        return columnsData.map((item) => {
            const fieldData = metaFields.find(
                (field) => field.technical_name === item.name,
            )
            const type = formatDataType(item?.type)
            return {
                title: (
                    <div>
                        <div className={styles.tableTDContnet}>
                            <span className={styles.nameIcon}>
                                {getFieldTypeIcon({ ...fieldData, type }, 20)}
                            </span>
                            <span
                                title={`${fieldData?.business_name}`}
                                className={styles.businessTitle}
                            >
                                {fieldData?.business_name}
                            </span>
                        </div>
                        <div
                            className={classnames(
                                styles.tableTDContnet,
                                styles.subTableTDContnet,
                            )}
                            title={`${fieldData?.technical_name}`}
                        >
                            {fieldData?.technical_name}
                        </div>
                    </div>
                ),
                dataIndex: item.name,
                key: item.name,
                ellipsis: true,
                width: 100,
                render: (text) => {
                    const name =
                        text === ''
                            ? '--'
                            : text === false || text === true || text === 0
                            ? `${text}`
                            : text
                    return (
                        <div className={styles.tableTDContnet}>
                            <span
                                title={`${name}`}
                                className={styles.businessTitle}
                            >
                                {name}
                            </span>
                        </div>
                    )
                },
            }
        })
    }

    /**
     * 获取数据预览
     */
    const getColumns = async () => {
        try {
            setIsLoading(true)
            const res = await getDataViewPreview({
                form_view_id: dataViewId,
                fields: metaFields.map((item) => item.field_id),
                limit: 10,
                offset: 1,
            })
            setColumns(columnsFormat(res.columns))
            const names = res?.columns?.map((item) => item.name)
            const list: any[] = []
            res?.data?.forEach((item) => {
                const obj: any = {}
                names.forEach((it, inx) => {
                    // 二进制大对象不显示
                    obj[it] = it === 'long_blob_data' ? '[Record]' : item[inx]
                })
                list.push(obj)
            })
            setData(list)
        } catch (err) {
            formatError(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles['data-preview-container']}>
            {isLoading ? (
                <div className={styles.loading}>
                    <Loader />
                </div>
            ) : data.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    scroll={{ y: 500, x: 1000 }}
                />
            ) : (
                <Empty iconSrc={dataEmpty} desc={__('暂无数据')} />
            )}
        </div>
    )
}

export default DataPreview
