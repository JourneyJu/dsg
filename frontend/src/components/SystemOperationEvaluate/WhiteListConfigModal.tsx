import { Checkbox, message, Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import { formatError, updateSystemOperationWhiteList } from '@/core'
import __ from './locale'
import styles from './styles.module.less'

const CheckboxGroup = Checkbox.Group

interface IWhiteListConfigModal {
    item: any
    // 显示/隐藏
    open: boolean
    onClose: () => void
    onSure: () => void
}

/**
 * 白名单配置
 */
const WhiteListConfigModal: React.FC<IWhiteListConfigModal> = ({
    open,
    onClose,
    onSure,
    item,
}) => {
    const [loading, setLoading] = useState(false)
    const [checkedList, setCheckedList] = useState<any[]>([])
    const [indeterminate, setIndeterminate] = useState(false)
    const [checkAll, setCheckAll] = useState(false)

    useEffect(() => {
        if (item?.form_view_id) {
            const list: string[] = []
            if (item?.quality_check) {
                list.push('quality_check')
            }
            if (item?.data_update) {
                list.push('data_update')
            }
            setIndeterminate(list.length === 1)
            setCheckAll(list.length === 2)
            setCheckedList(list)
        }
    }, [item])

    const plainOptions = [
        {
            label: __('质量检测白名单'),
            value: 'quality_check',
        },
        {
            label: __('数据更新白名单'),
            value: 'data_update',
        },
    ]

    const onChange = (list: any[]) => {
        setCheckedList(list)
        setIndeterminate(!!list.length && list.length < plainOptions.length)
        setCheckAll(list.length === plainOptions.length)
    }

    const onCheckAllChange = (e: any) => {
        setCheckedList(
            e.target.checked ? plainOptions?.map((o) => o.value) : [],
        )
        setIndeterminate(false)
        setCheckAll(e.target.checked)
    }

    // 对话框onOk
    const handleModalOk = async () => {
        try {
            setLoading(true)
            await updateSystemOperationWhiteList({
                form_view_id: item?.form_view_id,
                data_update: checkedList?.includes('data_update'),
                quality_check: checkedList?.includes('quality_check'),
            })
            message.success(__('设置成功'))
            onSure()
        } catch (e) {
            formatError(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            title={__('白名单设置')}
            width={424}
            maskClosable={false}
            open={open}
            onCancel={onClose}
            onOk={handleModalOk}
            destroyOnClose
            getContainer={false}
            okText={__('确定')}
            cancelText={__('取消')}
            bodyStyle={{ padding: '16px 24px' }}
            okButtonProps={{ loading, style: { width: 80 } }}
            cancelButtonProps={{ style: { width: 80 } }}
        >
            <div className={styles.whitelistWrapper}>
                <div style={{ marginBottom: 24 }}>
                    <Checkbox
                        indeterminate={indeterminate}
                        onChange={onCheckAllChange}
                        checked={checkAll}
                    >
                        {__('全选')}
                    </Checkbox>
                </div>
                <CheckboxGroup
                    options={plainOptions}
                    value={checkedList}
                    onChange={onChange}
                />
            </div>
        </Modal>
    )
}

export default WhiteListConfigModal
