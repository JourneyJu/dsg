import React from 'react'
import { Modal, Space, Tooltip } from 'antd'
import moment from 'moment'
import __ from './locale'
import styles from './styles.module.less'

/**
 * 标签详情组件
 *
 * @description 展示标签的详细信息，包括基本信息和关联的专题模型
 */
interface TagDetailProps {
    visible: boolean
    data?: {
        name?: string
        related_models?: Array<{ name: string; id?: string }>
        description?: string
        created_at?: string
        created_by?: string
        updated_at?: string
        updated_by?: string
    }
    onCancel: () => void
}

const TagDetail: React.FC<TagDetailProps> = ({ visible, data, onCancel }) => {
    /**
     * 渲染详情项
     */
    const renderDetailItem = (
        label: string,
        content: React.ReactNode,
        supportWrap = false,
    ) => {
        return (
            <div
                className={styles.detailItem}
                style={{ alignItems: supportWrap ? 'flex-start' : 'center' }}
            >
                <div className={styles.label}>{__(`${label}：`)}</div>
                <div
                    className={styles.content}
                    style={{ whiteSpace: supportWrap ? 'pre-wrap' : 'nowrap' }}
                >
                    {content || '--'}
                </div>
            </div>
        )
    }

    /**
     * 渲染专题模型标签
     */
    const renderModelTags = () => {
        if (!data?.related_models || data.related_models.length === 0) {
            return '--'
        }

        return (
            <Space size={[8, 8]} wrap>
                {data.related_models.map((model, index) => (
                    <Tooltip key={index} title={model.name} placement="top">
                        <span className={styles.modelTag}>{model.name}</span>
                    </Tooltip>
                ))}
            </Space>
        )
    }

    return (
        <Modal
            title={__('标签关联推荐详情')}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={640}
            destroyOnClose
        >
            <div className={styles.detailContainer}>
                {renderDetailItem('名称', data?.name)}
                {renderDetailItem('关联主题模型', renderModelTags(), true)}
                {renderDetailItem('描述', data?.description, true)}
                {renderDetailItem(
                    '创建时间',
                    data?.created_at
                        ? moment(data.created_at).format('YYYY-MM-DD HH:mm:ss')
                        : '--',
                )}
                {renderDetailItem('创建人', data?.created_by)}
                {renderDetailItem(
                    '修改时间',
                    data?.updated_at
                        ? moment(data.updated_at).format('YYYY-MM-DD HH:mm:ss')
                        : '--',
                )}
                {renderDetailItem('修改人', data?.updated_by)}
            </div>
        </Modal>
    )
}

export default TagDetail
