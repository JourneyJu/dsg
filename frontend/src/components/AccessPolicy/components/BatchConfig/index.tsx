import { useEffect } from 'react'
import { Form, Input, Modal, Select } from 'antd'
import __ from '../../locale'
import { calcByte, OptType } from '../VisitAccessSelect/helper'
import VisitAccessSelect from '../VisitAccessSelect'
import { AssetTypeEnum } from '@/core'
import ExpiredTimeSelect from '../ExpiredTimeSelect'
import { FontIcon, UserOutlined } from '@/icons'
import styles from './styles.module.less'
import TagsGroup from './TagsGroup'

interface BatchConfigProps {
    visible: boolean
    onCancel: () => void
    selectItems: any[]
    type: AssetTypeEnum
    onConfirm: (values: any) => void
}

const BatchConfig = ({
    visible,
    onCancel,
    selectItems,
    type,
    onConfirm,
}: BatchConfigProps) => {
    const [form] = Form.useForm()
    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            title={__('批量配置')}
            width={520}
            onOk={() => {
                form.submit()
            }}
        >
            <div className={styles.container}>
                <div className={styles.visitorContainer}>
                    <div>{__('访问者')}</div>
                    <TagsGroup
                        data={selectItems.map((item) => ({
                            name: item.subject_name,
                            type: item.subject_type,
                        }))}
                    />
                </div>
                <div>
                    <Form form={form} layout="vertical" onFinish={onConfirm}>
                        {![
                            AssetTypeEnum.Api,
                            AssetTypeEnum.Indicator,
                            // AssetTypeEnum.Dim,
                        ].includes(type as AssetTypeEnum) && (
                            <Form.Item
                                label={__('访问权限')}
                                name="permissions"
                            >
                                <VisitAccessSelect
                                    canCustom={false}
                                    allowClear
                                />
                            </Form.Item>
                        )}
                        <Form.Item label={__('有效期')} name="expired_at">
                            <ExpiredTimeSelect defaultSelectedTimeType={null} />
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </Modal>
    )
}

export default BatchConfig
