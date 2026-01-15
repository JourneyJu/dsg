import { Button, Col, Form, Input, message, Modal, Row, Select } from 'antd'
import { useEffect, useState } from 'react'
import { InfoCircleFilled } from '@ant-design/icons'
import __ from '../locale'
import styles from './styles.module.less'
import { getActualUrl } from '@/utils'
import {
    IAppRegisterListItem,
    formatError,
    getAppRegisterList,
    ISystemItem,
    reqInfoSystemList,
    registerApp,
    getAppsDetail,
} from '@/core'
import DepartmentAndOrgSelect from '@/components/DepartmentAndOrgSelect'

interface RegisterProps {
    open: boolean
    onCancel: () => void
    onOk?: () => void
    data?: IAppRegisterListItem
}

const Register = ({ open, onCancel, onOk, data }: RegisterProps) => {
    const [form] = Form.useForm()
    const [systemList, setSystemList] = useState<ISystemItem[]>([])
    const [appList, setAppList] = useState<IAppRegisterListItem[]>([])
    const [ipAddr, setIpAddr] = useState<{ ip: string; port: string }[]>([])
    const [users, setUsers] = useState<{ id: string; name: string }[]>([])

    const getDetail = async () => {
        if (!data) return
        const res = await getAppsDetail(data?.id!, { version: 'editing' })
        getSystems(data.department_id, res.info_systems.id)
        form.setFieldsValue({
            department_id: data.department_id,
            system_id: res.info_systems.id,
            id: data.id,
            pass_id: res.pass_id,
            responsible_uids: res.responsiblers?.map((item) => item.id) || [],
            app_description: res.description,
        })
        setIpAddr(res.ip_addr || [])
        getApps(data.info_system_id)
    }
    useEffect(() => {
        if (data?.id) {
            getDetail()
        }
    }, [data])

    const getApps = async (infoSystemId: string) => {
        try {
            const res = await getAppRegisterList({
                limit: 2000,
                offset: 1,
                info_system_id: infoSystemId,
                is_register_gateway: data ? data.is_register_gateway : false,
            })
            setAppList(res.entries || [])
        } catch (error) {
            formatError(error)
        }
    }

    const getSystems = async (depId: string, infoSystemId?: string) => {
        try {
            if (!depId) {
                setSystemList([])
                return
            }
            const res = await reqInfoSystemList({
                limit: 2000,
                offset: 1,
                department_id: depId,
                is_register_gateway: true,
            })
            setSystemList(res.entries || [])
            if (infoSystemId) {
                const target = res.entries?.find(
                    (item) => item.id === infoSystemId,
                )
                if (target) {
                    setUsers(target.responsiblers || [])
                }
            }
        } catch (error) {
            formatError(error)
        }
    }

    const handleSystemChange = (value: string) => {
        getApps(value)
        const target = systemList.find((item) => item.id === value)
        if (target) {
            setUsers(target.responsiblers || [])
        }
    }

    const handleAppChange = (value: string) => {
        const target = appList.find((item) => item.id === value)
        if (target) {
            form.setFieldsValue({
                pass_id: target.pass_id,
                app_description: target.description,
            })
            setIpAddr(target.ip_addr || [])
        }
    }

    const onFinish = async (values: any) => {
        try {
            const { id, responsible_uids } = values
            await registerApp({ id, responsible_uids })
            message.success(data ? __('注册成功') : __('系统注册成功'))
            onCancel()
            onOk?.()
        } catch (error) {
            message.error(__('系统注册失败，请重试'))
        }
    }

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={__('应用注册')}
            width={910}
            maskClosable={false}
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
                                <DepartmentAndOrgSelect
                                    disabled={!!data}
                                    defaultValue={data?.department_id}
                                    checkUnRegistered
                                    onChange={(value) => getSystems(value)}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={__('所属系统')}
                                name="system_id"
                                required
                                rules={[
                                    { required: true, message: __('请选择') },
                                ]}
                                className={styles['app-form-item']}
                            >
                                <Select
                                    options={systemList}
                                    showSearch
                                    fieldNames={{
                                        label: 'name',
                                        value: 'id',
                                    }}
                                    filterOption={(input, option) =>
                                        (option?.name ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    placeholder={__('请选择')}
                                    allowClear
                                    onChange={(value) =>
                                        handleSystemChange(value)
                                    }
                                    disabled={!!data}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={__('应用')}
                                name="id"
                                required
                                rules={[
                                    { required: true, message: __('请选择') },
                                ]}
                                className={styles['app-form-item']}
                            >
                                <Select
                                    options={appList}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.name ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    fieldNames={{
                                        label: 'name',
                                        value: 'id',
                                    }}
                                    placeholder={__('请选择')}
                                    allowClear
                                    disabled={!!data}
                                    onChange={(value) => handleAppChange(value)}
                                />
                            </Form.Item>
                            <Button
                                type="link"
                                className={styles['app-link']}
                                onClick={() =>
                                    window.open(
                                        getActualUrl(
                                            '/dataServiceMgmt/gatewayAppMgt',
                                            true,
                                            2,
                                        ),
                                        '_blank',
                                    )
                                }
                            >
                                {__('找不到应用？请到网关应用管理添加>>')}
                            </Button>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={__('应用标识（PASSID）')}
                                name="pass_id"
                                required
                            >
                                <Input disabled placeholder={__('系统带出')} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={__('IP及端口')} required>
                                <div className={styles['ip-addr-wrapper']}>
                                    {ipAddr.map((item) => (
                                        <div
                                            key={item.ip}
                                            className={styles['ip-addr']}
                                        >{`${item.ip}:${item.port}`}</div>
                                    ))}
                                </div>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={__('负责人')}
                                name="responsible_uids"
                                required
                                rules={[
                                    { required: true, message: __('请选择') },
                                ]}
                            >
                                <Select
                                    options={users}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.name ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    fieldNames={{
                                        label: 'name',
                                        value: 'id',
                                    }}
                                    placeholder={__(
                                        '请选择所属系统中已注册的负责人',
                                    )}
                                    mode="multiple"
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
                                    placeholder={__('系统带出')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        </Modal>
    )
}

export default Register
