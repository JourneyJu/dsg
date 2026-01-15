import { useEffect, useState } from 'react'
import classnames from 'classnames'
import { Button, Tooltip } from 'antd'
import Filters from '../Filters'
import styles from './styles.module.less'
import dataEmpty from '@/assets/dataEmpty.svg'
import { Empty, Loader, SearchInput } from '@/ui'
import __ from '../locale'
import { AddOutlined, FontIcon } from '@/icons'
import DragBox from '../../DragBox'
import { useModalManageContext } from '../ModalManageProvider'
import MetaModelDetail from './MetaModelDetail'
import ConfigMetaData from './ConfigMetaData'
import { formatError, getModelList } from '@/core'
import { ModelType } from '../const'

const MetaModelManage = () => {
    const [metaModels, setMetaModels] = useState<any[]>([])
    const [isCreateMetaModel, setIsCreateMetaModel] = useState<boolean>(false)
    const [defaultSize, setDefaultSize] = useState<Array<number>>([12, 88])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { filterKey, setFilterKey } = useModalManageContext()
    const [selectedMetaModel, setSelectedMetaModel] = useState<any>(null)
    const [query, setQuery] = useState<any>({
        keyword: '',
        subject_id: '',
        model_type: ModelType.META_MODEL,
        limit: 1000,
        offset: 1,
    })

    useEffect(() => {
        if (filterKey) {
            setQuery({
                ...query,
                subject_id: filterKey,
            })
        }
    }, [filterKey])

    useEffect(() => {
        if (query.subject_id) {
            getMetaModels()
        } else {
            setIsLoading(false)
        }
    }, [query])

    /**
     * 获取元模型列表
     */
    const getMetaModels = async () => {
        try {
            setIsLoading(true)
            const res = await getModelList(query)
            setMetaModels(res.entries)
            if (res.entries.length > 0) {
                setSelectedMetaModel(res.entries[0])
            }
        } catch (err) {
            formatError(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles['filters-container']}>
                <Filters />
            </div>
            {metaModels.length === 0 && !query.keyword ? (
                isLoading ? (
                    <div className={styles['empty-container']}>
                        <Loader />
                    </div>
                ) : (
                    <div className={styles['empty-container']}>
                        <Empty
                            desc={
                                filterKey ? (
                                    <div className={styles['empty-desc']}>
                                        <div>
                                            {__(
                                                '可点击【新建元模型】按钮创建元模型',
                                            )}
                                        </div>
                                        <div>
                                            <Button
                                                type="primary"
                                                icon={<AddOutlined />}
                                                onClick={() => {
                                                    setIsCreateMetaModel(true)
                                                }}
                                            >
                                                {__('新建元模型')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles['empty-desc']}>
                                        {__('无业务对象，需要先创建业务对象')}
                                    </div>
                                )
                            }
                            iconSrc={dataEmpty}
                        />
                    </div>
                )
            ) : (
                <div className={styles['data-container']}>
                    <div className={styles['meta-model-container']}>
                        <div className={styles['toolbar-container']}>
                            <div className={styles['search-container']}>
                                <SearchInput
                                    onKeyChange={(value) => {
                                        setQuery({
                                            ...query,
                                            keyword: value.trim(),
                                        })
                                    }}
                                    placeholder={__('元数据模型名称')}
                                />
                            </div>
                            <Tooltip
                                title={__('新建元模型')}
                                placement="bottom"
                            >
                                <div
                                    className={styles['create-container']}
                                    onClick={() => {
                                        setIsCreateMetaModel(true)
                                    }}
                                >
                                    <AddOutlined />
                                </div>
                            </Tooltip>
                        </div>
                        <div className={styles['list-container']}>
                            {isLoading ? (
                                <Loader />
                            ) : metaModels.length > 0 ? (
                                metaModels.map((item) => {
                                    return (
                                        <div
                                            key={item.id}
                                            className={classnames({
                                                [styles['item-container']]:
                                                    true,
                                                [styles['item-selected']]:
                                                    selectedMetaModel?.id ===
                                                    item.id,
                                            })}
                                            onClick={() => {
                                                setSelectedMetaModel(item)
                                            }}
                                        >
                                            <div
                                                className={
                                                    styles['icon-container']
                                                }
                                            >
                                                <FontIcon name="icon-yuanmoxing" />
                                            </div>
                                            <div
                                                className={styles['item-name']}
                                                title={item.business_name}
                                            >
                                                {item.business_name}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <Empty />
                            )}
                        </div>
                    </div>
                    <div className={styles['meta-model-detail-container']}>
                        <MetaModelDetail
                            metaModelId={selectedMetaModel?.id}
                            updateList={() => {
                                setQuery({
                                    ...query,
                                    offset: 1,
                                })
                            }}
                        />
                    </div>
                </div>
            )}
            {isCreateMetaModel && (
                <ConfigMetaData
                    open={isCreateMetaModel}
                    onClose={() => {
                        setIsCreateMetaModel(false)
                    }}
                    onConfirm={() => {
                        setQuery({
                            ...query,
                            offset: 1,
                        })
                        setIsCreateMetaModel(false)
                    }}
                />
            )}
        </div>
    )
}

export default MetaModelManage
