import { Checkbox, Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import styles from './styles.module.less'
import __ from '../locale'
import DatasourceTree from '@/components/DatasheetView/DatasourceTree'
import { formatError, getDatasheetView, getDataViewDatasouces } from '@/core'
import { IconType } from '@/icons/const'
import { FontIcon } from '@/icons'
import { Empty, Loader, SearchInput } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'

interface IAddResult {
    open: boolean
    onClose: () => void
    onOk: (selectedResource: any[]) => void
    initData?: any[]
}

const AddResult: React.FC<IAddResult> = ({
    open,
    onClose,
    initData = [],
    onOk,
}) => {
    const [datasourceData, setDatasourceData] = useState<any[]>([])
    const [searchParams, setSearchParams] = useState<any>({
        offset: 1,
        limit: 1000,
        direction: 'desc',
        sort: 'updated_at',
        type: 'datasource',
        include_sub_subject: true,
        publish_status: 'publish',
        keyword: '',
    })
    const [sheetView, setSheetView] = useState<any>([])
    const [selectedResource, setSelectedResource] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const handleOk = () => {
        onClose()
        onOk(selectedResource)
    }
    const getSelectedNode = (sn?: any) => {
        setSearchParams({
            ...searchParams,
            datasource_type:
                typeof sn?.isLeaf === 'boolean' && !sn?.isLeaf
                    ? sn?.type
                    : undefined,
            datasource_id:
                (typeof sn?.isLeaf === 'boolean' && sn?.isLeaf) ||
                sn?.isLeaf === undefined
                    ? sn?.id
                    : undefined,
        })
    }

    useEffect(() => {
        getDatasourceData()
    }, [])

    useEffect(() => {
        getSheetView()
    }, [searchParams])

    const getDatasourceData = async () => {
        try {
            const res = await getDataViewDatasouces({
                limit: 1000,
                direction: 'desc',
                sort: 'updated_at',
            })

            setDatasourceData(res?.entries || [])
        } catch (err) {
            formatError(err)
        }
    }

    const getSheetView = async () => {
        try {
            setLoading(true)
            const res = await getDatasheetView(searchParams)
            setSheetView(
                res.entries?.map((item) => ({
                    ...item,
                    view_id: item.id,
                    datasource_id: item.datasource_id,
                    datasource_name: item.datasource,
                })) || [],
            )
        } catch (err) {
            formatError(err)
        } finally {
            setLoading(false)
        }
    }

    const getItem = (item: any, isShow = false) => {
        const isAdded = initData.some((i) => i.view_id === item.view_id)
        return (
            <div className={styles.item} key={item.view_id}>
                {!isShow && (
                    <Checkbox
                        value={item.id}
                        className={styles.checkbox}
                        disabled={initData.some(
                            (i) => i.view_id === item.view_id,
                        )}
                        checked={selectedResource.some(
                            (i) => i.view_id === item.view_id,
                        )}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setSelectedResource([...selectedResource, item])
                            } else {
                                setSelectedResource(
                                    selectedResource.filter(
                                        (i) => i.view_id !== item.view_id,
                                    ),
                                )
                            }
                        }}
                    />
                )}

                <FontIcon
                    name="icon-shitusuanzi"
                    type={IconType.COLOREDICON}
                    className={styles['item-icon']}
                />
                <div className={styles['name-info']}>
                    <div
                        className={styles['business-name']}
                        title={item.business_name}
                    >
                        {item.business_name}
                    </div>
                    <div
                        className={styles['technical-name']}
                        title={item.technical_name}
                    >
                        {item.technical_name}
                    </div>
                </div>
                {isShow ? (
                    <FontIcon
                        name="icon-yichu"
                        type={IconType.FONTICON}
                        className={styles['remove-icon']}
                        onClick={() => {
                            setSelectedResource(
                                selectedResource.filter(
                                    (i) => i.view_id !== item.view_id,
                                ),
                            )
                        }}
                    />
                ) : isAdded ? (
                    <div className={styles['added-flag']}>{__('已添加')}</div>
                ) : null}
            </div>
        )
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={837}
            title={__('添加分析成果')}
            destroyOnClose
            maskClosable={false}
            onOk={handleOk}
            bodyStyle={{ height: 598 }}
        >
            <div className={styles['add-result-container']}>
                <div className={styles['tree-container']}>
                    <div className={styles.title}>{__('数据源')}</div>
                    <DatasourceTree
                        getSelectedNode={getSelectedNode}
                        datasourceData={datasourceData}
                    />
                </div>
                <div className={styles['view-container']}>
                    <div className={styles['view-title']}>{__('库表')}</div>
                    <div className={styles['search-container']}>
                        <SearchInput
                            style={{ width: 240 }}
                            onKeyChange={(e) =>
                                setSearchParams({
                                    ...searchParams,
                                    keyword: e,
                                })
                            }
                            placeholder={__('搜索库表')}
                        />
                    </div>
                    <div className={styles['item-container']}>
                        {loading ? (
                            <Loader />
                        ) : sheetView.length === 0 ? (
                            <Empty iconSrc={dataEmpty} desc={__('暂无数据')} />
                        ) : (
                            sheetView.map((item: any) => {
                                return getItem(item)
                            })
                        )}
                    </div>
                </div>
                <div className={styles['selected-container']}>
                    <div className={styles['selected-title']}>{__('已选')}</div>
                    <div
                        className={classNames(
                            styles['item-container'],
                            styles['selected-item-container'],
                        )}
                    >
                        {selectedResource.map((item: any) => {
                            return getItem(item, true)
                        })}
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default AddResult
