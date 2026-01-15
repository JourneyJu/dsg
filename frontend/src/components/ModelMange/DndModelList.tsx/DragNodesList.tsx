import React, { FC, useEffect, useRef, useState } from 'react'
import { Checkbox } from 'antd'
import classnames from 'classnames'
import { Empty } from '@/ui'
import __ from '../locale'
import dataEmpty from '@/assets/dataEmpty.svg'
import styles from './styles.module.less'
import { DragOutlined, FontIcon } from '@/icons'
import { formatError } from '@/core'
import { ModelType } from '../const'
import { useModelGraphContext } from '../ModelGraph/ModelGraphProvider'

interface DragNodesListProps {
    models: any[]
    keyword: string
    selectedModels: any[]
    updateSelectedModels: (models: any[]) => void
    onStartDrag: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        dataIds: Array<string>,
        modelType: ModelType,
    ) => void
    dragLoading: boolean
    setDragLoading: (dragLoading: boolean) => void
    modelType: ModelType
}

const DragNodesList: FC<DragNodesListProps> = ({
    models,
    keyword,
    selectedModels,
    updateSelectedModels,
    onStartDrag,
    dragLoading,
    setDragLoading,
    modelType,
}) => {
    const [allCheckIndeterminate, setAllCheckIndeterminate] = useState(false)
    const [allChecked, setAllChecked] = useState(false)
    const timeoutIdRef = useRef<number | null>(null)
    const { modelInfo } = useModelGraphContext()

    useEffect(() => {
        if (selectedModels.length === 0) {
            setAllCheckIndeterminate(false)
            setAllChecked(false)
        } else if (selectedModels.length === models.length) {
            setAllCheckIndeterminate(false)
            setAllChecked(true)
        } else {
            setAllCheckIndeterminate(true)
            setAllChecked(false)
        }
    }, [selectedModels])

    /**
     * 模型鼠标拖拽事件
     */
    const handleMouseDown = (currentModels: any[], event: any) => {
        async function doMouseDown() {
            if (!dragLoading && currentModels?.length > 0) {
                setDragLoading(true)
                await onStartDrag(
                    event,
                    currentModels.map((m) => m.id),
                    modelType,
                )
                setDragLoading(false)
            }
        }
        timeoutIdRef.current = window.setTimeout(doMouseDown, 300)
    }

    /**
     * handleMouseUp
     */
    const handleMouseUp = () => {
        return async () => {
            try {
                if (timeoutIdRef.current !== null) {
                    clearTimeout(timeoutIdRef.current)
                }
            } catch (ex) {
                formatError(ex)
            }
        }
    }

    return models.length > 0 ? (
        <div
            className={styles['drag-list-container']}
            onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (selectedModels?.length > 0) {
                    handleMouseDown(selectedModels, e)
                }
            }}
            onMouseUp={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleMouseUp()
            }}
        >
            {modelType === ModelType.META_MODEL && (
                <div className={styles['select-all-container']}>
                    <Checkbox
                        indeterminate={allCheckIndeterminate}
                        checked={allChecked}
                        onClick={() => {
                            updateSelectedModels(allChecked ? [] : models)
                        }}
                    />
                    <span>{__('全选')}</span>
                </div>
            )}
            <div className={styles['model-list-content']}>
                {models.map((model) => (
                    <div
                        className={classnames(styles['model-list-item'], {
                            [styles['model-list-item-disabled']]:
                                modelInfo.id === model.id,
                        })}
                        key={model.id}
                        data-id={model.id}
                        onMouseDown={(e) => {
                            if (modelInfo.id === model.id) {
                                e.preventDefault()
                                e.stopPropagation()
                                return
                            }
                            if (
                                !selectedModels.find((m) => m.id === model.id)
                            ) {
                                e.preventDefault()
                                e.stopPropagation()
                                handleMouseDown([model], e)
                            }
                        }}
                        onMouseUp={handleMouseUp()}
                    >
                        {modelType === ModelType.META_MODEL && (
                            <Checkbox
                                checked={selectedModels.find(
                                    (m) => m.id === model.id,
                                )}
                                onChange={(e) => {
                                    updateSelectedModels(
                                        e.target.checked
                                            ? [...selectedModels, model]
                                            : selectedModels.filter(
                                                  (m) => m.id !== model.id,
                                              ),
                                    )
                                }}
                            />
                        )}

                        <div className={styles['model-info']}>
                            <div className={styles['model-icon']}>
                                <FontIcon
                                    name={
                                        modelType === ModelType.META_MODEL
                                            ? 'icon-yuanmoxing'
                                            : modelType ===
                                              ModelType.SPECIAL_MODEL
                                            ? 'icon-zhuantimoxing'
                                            : 'icon-zhutimoxing'
                                    }
                                />
                            </div>
                            <div
                                className={styles['model-name']}
                                title={model.business_name}
                            >
                                {model.business_name}
                            </div>
                        </div>
                        <div className={styles['drag-icon']}>
                            <DragOutlined />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ) : (
        <div className={styles.emptyContainer}>
            <Empty
                iconSrc={keyword ? undefined : dataEmpty}
                desc={keyword ? __('抱歉，没有找到相关内容') : __('暂无数据')}
            />
        </div>
    )
}

export default DragNodesList
