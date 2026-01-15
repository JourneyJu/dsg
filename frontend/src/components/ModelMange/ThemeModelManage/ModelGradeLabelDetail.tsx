import React from 'react'
import { Modal, Tooltip } from 'antd'
import moment from 'moment'
import __ from '../locale'
import styles from './styles.module.less'
import { FontIcon } from '@/icons'

/**
 * 分级标签详情组件
 *
 * @description 展示分级标签的详细信息，包括主题模型、分级标签、描述等
 */
interface ModelGradeLabelDetailProps {
    visible: boolean
    data?: any
    onCancel: () => void
}

const ModelGradeLabelDetail: React.FC<ModelGradeLabelDetailProps> = ({
    visible,
    data,
    onCancel,
}) => {
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
     * 渲染分级标签
     */
    const renderGradeTag = () => {
        if (!data?.grade_label_Name) {
            return '--'
        }

        return (
            <div className={styles.selectOptionWrapper}>
                <FontIcon
                    name="icon-biaoqianicon"
                    style={{
                        fontSize: 20,
                        color: data.grade_label_icon,
                    }}
                />
                <span title={data.grade_label_Name} className={styles.name}>
                    {data.grade_label_Name}
                </span>
            </div>
        )
    }

    return (
        <Modal
            title={__('分级标签详情')}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={640}
            destroyOnClose
        >
            <div className={styles.detailContainer}>
                {renderDetailItem('主题模型名称', data?.business_name || '--')}
                {renderDetailItem('分级标签', renderGradeTag())}
                {renderDetailItem('描述', data?.description, true)}
                {renderDetailItem(
                    '创建时间',
                    data?.created_at
                        ? moment(data.created_at).format('YYYY-MM-DD HH:mm:ss')
                        : '--',
                )}
                {renderDetailItem('创建人', data?.created_name)}
                {renderDetailItem(
                    '修改时间',
                    data?.updated_at
                        ? moment(data.updated_at).format('YYYY-MM-DD HH:mm:ss')
                        : '--',
                )}
                {renderDetailItem('修改人', data?.updater_name)}
            </div>
        </Modal>
    )
}

export default ModelGradeLabelDetail
