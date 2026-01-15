import { Button, message, Tooltip } from 'antd'
import { FC, useEffect, useState } from 'react'

import { ExclamationCircleFilled } from '@ant-design/icons'
import { TextAreaView } from '@/components/AutoFormView/baseViewComponents'
import { deleteModel, formatError, getModelInfo } from '@/core'
import { EditOutlined, FontIcon } from '@/icons'
import { Loader } from '@/ui'
import { confirm } from '@/utils/modalHelper'
import __ from '../locale'
import ConfigMetaData from './ConfigMetaData'
import DataPreview from './DataPreview'
import styles from './styles.module.less'

interface IMetaModelDetail {
    metaModelId: string
    updateList: () => void
}
const MetaModelDetail: FC<IMetaModelDetail> = ({ metaModelId, updateList }) => {
    const [metaModelData, setMetaModelData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [showEditModal, setShowEditModal] = useState<boolean>(false)

    useEffect(() => {
        if (metaModelId) {
            getMetaModel()
        }
    }, [metaModelId])

    const getMetaModel = async () => {
        try {
            setIsLoading(true)
            const res = await getModelInfo(metaModelId)
            setMetaModelData(res)
        } catch (err) {
            formatError(err)
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * 删除模型
     */
    const handleDeleteModel = async () => {
        confirm({
            title: __('确定要删除该模型吗？'),
            icon: (
                <ExclamationCircleFilled
                    style={{ color: 'rgba(250, 173, 20, 1)' }}
                />
            ),
            onOk: async () => {
                try {
                    await deleteModel(metaModelId)
                    updateList()
                    message.success(__('删除成功'))
                } catch (err) {
                    formatError(err)
                }
            },
        })
    }

    return isLoading ? (
        <div className={styles['loader-container']}>
            <Loader />
        </div>
    ) : (
        <div className={styles['model-detail-container']}>
            <div className={styles['model-detail-header']}>
                <div className={styles['model-detail-header-title']}>
                    <FontIcon name="icon-yuanmoxing" />
                    <span>{metaModelData?.business_name}</span>
                </div>
                <div className={styles['model-detail-header-actions']}>
                    <Tooltip
                        title={
                            metaModelData?.used_count > 0
                                ? __('该模型已被使用，无法编辑')
                                : ''
                        }
                    >
                        <Button
                            icon={<EditOutlined />}
                            disabled={!!metaModelData?.used_count}
                            onClick={() => setShowEditModal(true)}
                        >
                            {__('编辑模型')}
                        </Button>
                    </Tooltip>
                    <Tooltip
                        title={
                            metaModelData?.used_count > 0
                                ? __('该模型已被使用，无法删除')
                                : ''
                        }
                    >
                        <Button
                            disabled={!!metaModelData?.used_count}
                            onClick={handleDeleteModel}
                        >
                            {__('删除')}
                        </Button>
                    </Tooltip>
                </div>
            </div>
            <div className={styles['model-detail-content']}>
                <div className={styles['model-detail-content-item']}>
                    <div className={styles['model-detail-content-item-title']}>
                        {__('关联库表：')}
                    </div>
                    <div className={styles['model-detail-content-item-value']}>
                        {metaModelData?.catalog_name}
                    </div>
                </div>
                <div className={styles['model-detail-content-item']}>
                    <div className={styles['model-detail-content-item-title']}>
                        {__('描述：')}
                    </div>
                    <div
                        className={
                            styles['model-detail-content-item-value-textarea']
                        }
                    >
                        <TextAreaView
                            initValue={metaModelData?.description}
                            rows={1}
                            placement="end"
                            onExpand={() => {}}
                        />
                    </div>
                </div>
            </div>
            <div className={styles['model-detail-content-item-data-preview']}>
                <div
                    className={
                        styles['model-detail-content-item-data-preview-title']
                    }
                >
                    {__('数据预览')}
                </div>
                <DataPreview
                    id={metaModelData?.id}
                    metaFields={metaModelData?.fields || []}
                    dataViewId={metaModelData?.data_view_id}
                />
            </div>
            {showEditModal && (
                <ConfigMetaData
                    open={showEditModal}
                    onClose={() => {
                        setShowEditModal(false)
                    }}
                    onConfirm={() => {
                        getMetaModel()
                        updateList()
                        setShowEditModal(false)
                    }}
                    id={metaModelId}
                />
            )}
        </div>
    )
}

export default MetaModelDetail
