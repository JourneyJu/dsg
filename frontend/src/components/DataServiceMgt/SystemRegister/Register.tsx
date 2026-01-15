import { Button, Form, Input, message, Modal, Select } from 'antd'
import { useEffect, useState } from 'react'
import { useDebounceFn } from 'ahooks'
import { InfoCircleFilled } from '@ant-design/icons'
import __ from '../locale'
import styles from './styles.module.less'
import { getFirstLetters } from './const'
import { getActualUrl } from '@/utils'
import {
    checkSystemIdentifierRepeat,
    formatError,
    getObjectDetails,
    getUsersFrontendList,
    ISystemItem,
    IUserDetails,
    registerSystem,
    reqInfoSystemList,
} from '@/core'
import DepartmentAndOrgSelect from '@/components/DepartmentAndOrgSelect'

interface RegisterProps {
    open: boolean
    onCancel: () => void
    onOk?: () => void
    defaultValues?: ISystemItem
}

const Register = ({ open, onCancel, onOk, defaultValues }: RegisterProps) => {
    const [form] = Form.useForm()

    const [systemList, setSystemList] = useState<ISystemItem[]>([])
    const [isRepeat, setIsRepeat] = useState<boolean>(false)
    const [users, setUsers] = useState<{ id: string; name: string }[]>([])

    const handleSystemIdentifierChange = async (value: string) => {
        if (!value) {
            setIsRepeat(false)
            return
        }
        try {
            await checkSystemIdentifierRepeat({
                identifier: value,
            })
            setIsRepeat(false)
        } catch (error) {
            setIsRepeat(true)
        }
    }

    const { run: debouncedHandleSystemIdentifierChange } = useDebounceFn(
        handleSystemIdentifierChange,
        { wait: 500 },
    )

    useEffect(() => {
        if (defaultValues) {
            form.setFieldsValue({
                department_id: defaultValues.department_id,
                info_system_id: defaultValues.id,
                system_identifier: defaultValues.system_identifier,
                system_description: defaultValues.description,
                responsible_uids: defaultValues.responsiblers?.map(
                    (item) => item.id,
                ),
            })
            getSystemList(defaultValues.department_id!)
            getUsers(defaultValues.department_id!)
        }
    }, [defaultValues])

    const getUsers = async (depId: string) => {
        const res = await getObjectDetails(depId, { type: 1 })
        const userList =
            res.user_ids?.split(',').map((item, index) => {
                return {
                    id: item,
                    name: res.user_names.split(',')[index],
                }
            }) || []
        setUsers(userList)
    }

    const getSystemList = async (id: string) => {
        const res = await reqInfoSystemList({
            department_id: id,
            limit: 2000,
            offset: 1,
            is_register_gateway: !!defaultValues,
        })
        setSystemList(res.entries)
    }

    const handleSystemChange = async (value: string) => {
        const target = systemList.find((item) => item.id === value)
        if (target) {
            const systemFlag = getFirstLetters(target.name)
            form.setFieldsValue({
                system_identifier: systemFlag,
                system_description: target.description,
            })
            try {
                await checkSystemIdentifierRepeat({
                    identifier: systemFlag,
                })
                setIsRepeat(false)
            } catch (error) {
                setIsRepeat(true)
            }
        }
    }

    const onFinish = async (values: any) => {
        try {
            if (isRepeat) return
            await registerSystem(values)
            message.success(defaultValues ? __('编辑成功') : __('系统注册成功'))
            onCancel()
            onOk?.()
        } catch (error) {
            message.error(__('系统注册失败，请重试'))
        }
    }

    const handleValuesChange = (values) => {
        // 获取表单的键
        const formKeys = Object.keys(values)
        if (formKeys.includes('department_id') && values.department_id) {
            getSystemList(values.department_id)
            getUsers(values.department_id)
        }
    }

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={__('系统注册')}
            width={640}
            maskClosable={false}
            onOk={() => form.submit()}
        >
            <div className={styles['register-form']}>
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={onFinish}
                    autoComplete="off"
                    onValuesChange={handleValuesChange}
                >
                    <Form.Item
                        label={__('所属部门')}
                        name="department_id"
                        required
                        rules={[{ required: true, message: __('请选择') }]}
                    >
                        <DepartmentAndOrgSelect
                            disabled={!!defaultValues}
                            defaultValue={defaultValues?.department_id}
                            checkUnRegistered
                        />
                    </Form.Item>
                    <Form.Item
                        label={__('信息系统')}
                        name="info_system_id"
                        required
                        rules={[{ required: true, message: __('请选择') }]}
                        className={styles['system-form-item']}
                    >
                        <Select
                            options={systemList}
                            fieldNames={{ label: 'name', value: 'id' }}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.name ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            placeholder={__('请选择')}
                            allowClear
                            disabled={!!defaultValues}
                            onChange={(value) => handleSystemChange(value)}
                        />
                    </Form.Item>
                    <Button
                        type="link"
                        className={styles['system-link']}
                        onClick={() =>
                            window.open(
                                getActualUrl(
                                    '/systemConfig/infoSystem',
                                    true,
                                    8,
                                ),
                                '_blank',
                            )
                        }
                    >
                        {__('找不到系统？请到信息系统列表进行添加>>')}
                    </Button>
                    <Form.Item
                        label={__('系统标识')}
                        name="system_identifier"
                        required
                        className={
                            isRepeat
                                ? styles['system-flag-form-item-repeat']
                                : styles['system-flag-form-item']
                        }
                        rules={[
                            { required: true, message: __('请输入系统标识') },
                            {
                                pattern: /^[a-z0-9]+$/,
                                message:
                                    __('系统标识只能包含小写英文字母和数字'),
                            },
                        ]}
                    >
                        <Input
                            maxLength={20}
                            disabled={!!defaultValues}
                            className={
                                isRepeat ? styles['flag-repeat-input'] : ''
                            }
                            onChange={(e) =>
                                debouncedHandleSystemIdentifierChange(
                                    e.target.value,
                                )
                            }
                        />
                    </Form.Item>
                    {isRepeat && (
                        <div className={styles['repeat-tip']}>
                            <InfoCircleFilled
                                className={styles['repeat-tip-icon']}
                            />
                            {__('该系统标识已重复，请重新填写')}
                        </div>
                    )}
                    <Form.Item
                        label={__('负责人')}
                        name="responsible_uids"
                        required
                        rules={[{ required: true, message: __('请选择') }]}
                    >
                        <Select
                            options={users}
                            fieldNames={{ label: 'name', value: 'id' }}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.name ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            placeholder={__('请选择')}
                            mode="multiple"
                            allowClear
                            getPopupContainer={(node) =>
                                node.parentNode as HTMLElement
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        label={__('信息系统描述')}
                        name="system_description"
                    >
                        <Input.TextArea
                            disabled
                            className={styles['system-description']}
                        />
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    )
}

export default Register
