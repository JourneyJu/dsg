import React, { useState } from 'react'
import { Modal, Space, Button, Checkbox, Tooltip, message } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import __ from '../locale'
import styles from './styles.module.less'
import { deleteDepartmentAssessmentTarget, formatError } from '@/core'

interface DeleteProps {
    id: string
    open: boolean
    onCancel: () => void
    onSuccess: () => void
}
const Delete: React.FC<DeleteProps> = ({ id, open, onCancel, onSuccess }) => {
    const [deleteChecked, setDeleteChecked] = useState(false)

    const handleDelete = async () => {
        try {
            await deleteDepartmentAssessmentTarget(id)
            message.success('删除成功')
            onCancel()
            onSuccess()
        } catch (error) {
            formatError(error)
        }
    }

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={null}
            footer={null}
            width={416}
            bodyStyle={{ height: 252, padding: 0 }}
            closable={false}
        >
            <div className={styles['delete-modal']}>
                <div className={styles.title}>
                    <ExclamationCircleFilled className={styles.icon} />
                    {__('确定删除考核目标吗？')}
                </div>
                <Space
                    direction="vertical"
                    size={20}
                    className={styles.content}
                >
                    {__(
                        '删除后，目标和下方的考核计划将一并删除，若目标已结束，对应的数据考核概览也无法再查看。目标删除后不可恢复，请确认操作。',
                    )}
                    <Checkbox
                        checked={deleteChecked}
                        onChange={(e) => setDeleteChecked(e.target.checked)}
                    >
                        {__('删除')}
                    </Checkbox>
                </Space>
                <Space size={8} className={styles.footer}>
                    <Button onClick={onCancel}>{__('取消')}</Button>
                    <Tooltip
                        placement="bottom"
                        title={deleteChecked ? '' : __('需要先勾选“删除”')}
                    >
                        <Button
                            type="primary"
                            onClick={() => handleDelete()}
                            disabled={!deleteChecked}
                        >
                            {__('确定')}
                        </Button>
                    </Tooltip>
                </Space>
            </div>
        </Modal>
    )
}

export default Delete
