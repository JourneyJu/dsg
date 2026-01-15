import { Modal, Form, Input } from 'antd'
import { useEffect } from 'react'
import __ from '../locale'

interface RemarkModalProps {
    open: boolean
    initialValues?: string
    onClose: () => void
    onSubmit: (values: any) => void
}

const RemarkModal = ({
    open,
    onClose,
    onSubmit,
    initialValues,
}: RemarkModalProps) => {
    const [form] = Form.useForm()

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({ remark: initialValues })
        }
    }, [initialValues])

    return (
        <Modal
            title={__('理由说明')}
            open={open}
            width={380}
            onCancel={onClose}
            onOk={() => form.submit()}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={(values) => onSubmit(values.remark)}
            >
                <Form.Item name="remark">
                    <Input.TextArea
                        style={{ height: 120, resize: 'none' }}
                        placeholder={__('请输入')}
                        maxLength={300}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default RemarkModal
