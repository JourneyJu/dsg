import React, { FC, useEffect, useState } from 'react'
import { Tabs } from 'antd'
import { useModelGraphContext } from '../ModelGraph/ModelGraphProvider'
import { ModelTabList, ModelType } from '../const'
import styles from './styles.module.less'
import { Loader, SearchInput } from '@/ui'
import __ from '../locale'
import {
    formatError,
    getModelList,
    getSubjectDomain,
    recommendModelList,
} from '@/core'
import DragNodesList from './DragNodesList'

// 推荐选项
const RECOMMEND_OPTIONS = {
    name: __('推荐'),
    id: 'recommend',
    path: '',
}
interface DndModelListProps {
    modelType: ModelType
    onStartDrag: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        dataIds: Array<string>,
        modelType: ModelType,
    ) => void
}

const DndModelList: FC<DndModelListProps> = ({ modelType, onStartDrag }) => {
    const [tabs, setTabs] = useState<any[]>([])
    const [queryParams, setQueryParams] = useState<any>({
        model_type: ModelType.META_MODEL,
        keyword: '',
        limit: 1000,
        offset: 1,
        subject_id: '',
    })
    const { modelInfo } = useModelGraphContext()
    const [domainTabItems, setDomainTabItems] = useState<any[]>([])

    const [models, setModels] = useState<any[]>([])

    const [selectedModels, setSelectedModels] = useState<any[]>([])

    const [dragLoading, setDragLoading] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        setTabs(
            ModelTabList.filter((item) => {
                if (modelType === ModelType.THEME_MODEL) {
                    return item.key !== ModelType.SPECIAL_MODEL
                }
                return true
            }),
        )
    }, [modelType])

    useEffect(() => {
        getItemsData()
    }, [])

    useEffect(() => {
        getModelsData()
    }, [queryParams])

    /**
     * 获取领域列表
     */
    const getItemsData = async () => {
        try {
            setIsLoading(true)
            const res = await getSubjectDomain({
                limit: 2000,
                parent_id: '',
                is_all: true,
                type: 'subject_domain,subject_domain_group',
            })
            const filterItems = res.entries.filter(
                (item) => item.type === 'subject_domain',
            )
            if (modelType === ModelType.THEME_MODEL) {
                setDomainTabItems(filterItems)
                setQueryParams({
                    ...queryParams,
                    subject_id: filterItems[0]?.id,
                })
            } else {
                setDomainTabItems([RECOMMEND_OPTIONS, ...filterItems])
                setQueryParams({
                    ...queryParams,
                    subject_id: RECOMMEND_OPTIONS.id,
                })
            }
        } catch (error) {
            formatError(error)
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * 获取模型列表
     */
    const getModelsData = async () => {
        try {
            if (queryParams.subject_id) {
                if (queryParams.subject_id === RECOMMEND_OPTIONS.id) {
                    // TODO 推荐模型列表
                    const res = await recommendModelList({
                        query: modelInfo?.business_name,
                    })
                    setModels(res.data)
                } else {
                    const res = await getModelList(queryParams)
                    setModels(res.entries)
                }
            }
        } catch (error) {
            formatError(error)
        }
    }
    return (
        <div className={styles.container}>
            <div className={styles.filterContainer}>
                <Tabs
                    items={tabs}
                    onChange={(key) => {
                        setQueryParams({
                            ...queryParams,
                            model_type: key,
                            keyword: '',
                            subject_id:
                                key === ModelType.THEME_MODEL &&
                                modelType === ModelType.SPECIAL_MODEL
                                    ? 'recommend'
                                    : domainTabItems.filter(
                                          (item) => item.id !== 'recommend',
                                      )?.[0]?.id || '',
                        })
                    }}
                />
            </div>
            <div className={styles['search-container']}>
                <SearchInput
                    placeholder={__('请输入${name}名称', {
                        name: tabs.find(
                            (item) => item.key === queryParams.model_type,
                        )?.label,
                    })}
                    onKeyChange={(value) => {
                        setQueryParams({ ...queryParams, keyword: value })
                    }}
                    value={queryParams.keyword}
                />
            </div>
            <div className={styles['domain-container']}>
                <Tabs
                    items={domainTabItems
                        .filter(
                            (item) =>
                                queryParams.model_type ===
                                    ModelType.THEME_MODEL ||
                                item.id !== 'recommend',
                        )
                        .map((item) => ({
                            label: (
                                <span title={item?.path_name}>{item.name}</span>
                            ),
                            key: item.id,
                        }))}
                    activeKey={queryParams.subject_id}
                    onChange={(key) => {
                        setQueryParams({ ...queryParams, subject_id: key })
                    }}
                />
            </div>
            <div className={styles['model-list-container']}>
                {isLoading ? (
                    <Loader />
                ) : (
                    <DragNodesList
                        models={models}
                        keyword={queryParams.keyword}
                        selectedModels={selectedModels}
                        updateSelectedModels={setSelectedModels}
                        onStartDrag={(e, dataIds, currentModelType) => {
                            onStartDrag(e, dataIds, currentModelType)
                        }}
                        dragLoading={dragLoading}
                        setDragLoading={setDragLoading}
                        modelType={queryParams.model_type}
                    />
                )}
            </div>
        </div>
    )
}

export default DndModelList
