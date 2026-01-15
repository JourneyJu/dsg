import { Button, Col, Form, Input, Modal, Row, Select } from 'antd'
import { useState } from 'react'
import { InfoCircleFilled } from '@ant-design/icons'
import __ from '../locale'
import DepartmentAndOrgSelect from '../../ConfigDataSerivce/DepartmentAndOrgSelect'
import styles from './styles.module.less'
import { getFirstLetters } from './const'
import { getActualUrl } from '@/utils'

interface RegisterProps {
    open: boolean
    onCancel: () => void
}

const UpdateRegister = ({ open, onCancel }: RegisterProps) => {
    const [form] = Form.useForm()

    const [systemList, setSystemList] = useState<any[]>([])
    const [isRepeat, setIsRepeat] = useState<boolean>(true)

    const checkSystemFlag = (value: string) => {
        // TODO: 调用接口检查系统标识是否重复
        setIsRepeat(true)
    }

    const handleSystemChange = (value: string) => {
        const target = systemList.find((item) => item.id === value)
        if (target) {
            const systemFlag = getFirstLetters(target.name)
            checkSystemFlag(systemFlag)
            form.setFieldsValue({
                system_flag: systemFlag,
            })
        }
    }

    const onFinish = (values: any) => {
        // console.log(values)
    }

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={__('应用注册')}
            width={910}
            onOk={() => form.submit()}
        >
            <div className={styles['register-form']}>
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Row gutter={60}>
                        <Col span={12}>
                            <Form.Item
                                label={__('所属部门')}
                                name="department_id"
                                required
                                rules={[
                                    { required: true, message: __('请选择') },
                                ]}
                            >
                                <DepartmentAndOrgSelect />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={__('所属系统')}
                                name="system_name"
                                required
                                rules={[
                                    { required: true, message: __('请选择') },
                                ]}
                                className={styles['app-form-item']}
                            >
                                <Select
                                    options={[]}
                                    placeholder={__('请选择')}
                                    allowClear
                                    onChange={(value) =>
                                        handleSystemChange(value)
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={__('应用')}
                                name="app_id"
                                required
                                rules={[
                                    { required: true, message: __('请选择') },
                                ]}
                                className={styles['app-form-item']}
                            >
                                <Select
                                    options={[]}
                                    placeholder={__('请选择')}
                                    allowClear
                                    onChange={(value) =>
                                        handleSystemChange(value)
                                    }
                                />
                            </Form.Item>
                            <Button
                                type="link"
                                className={styles['app-link']}
                                onClick={() =>
                                    window.open(
                                        getActualUrl(
                                            '/applicationAuth/manage',
                                            true,
                                            2,
                                        ),
                                        '_blank',
                                    )
                                }
                            >
                                {__('找不到应用？请到应用管理添加>>')}
                            </Button>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={__('应用标识（PASSID）')}
                                name="app_flag"
                                required
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={__('IP及端口')}
                                name="ip"
                                required
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={__('负责人')}
                                name="owner_id"
                                required
                                rules={[
                                    { required: true, message: __('请选择') },
                                ]}
                            >
                                <Select
                                    options={[]}
                                    placeholder={__('请选择')}
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={__('应用描述')}
                                name="app_description"
                            >
                                <Input.TextArea
                                    disabled
                                    className={styles['app-description']}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        </Modal>
    )
}

export default UpdateRegister
