import { useEffect, useState } from 'react'
import { trim } from 'lodash'
import { Form, Input, Modal } from 'antd'
import {
    formatError,
    createAddressBook,
    IAddressBookItem,
    editAddressBook,
} from '@/core'
import __ from '../locale'
import DepartmentAndOrgSelect from '@/components/DepartmentAndOrgSelect'
import { emailReg } from '@/utils'

interface IReply {
    open: boolean
    item?: IAddressBookItem
    selectedNode?: any
    onCreateSuccess: () => void
    onCreateClose: () => void
}

const regex = /^[A-HJ-NP-RT-UWXY0-9]+$/
const lengthRegex = /^.{15}(.{3})?$/
const phoneRegex = /^[0-9+-]+$/

const Create = ({
    open,
    item,
    selectedNode,
    onCreateSuccess,
    onCreateClose,
}: IReply) => {
    const [form] = Form.useForm()
    // 定义一个状态变量 defaultOrg，用于存储默认组织的信息，初始值为空字符串
    const [defaultOrg, setDefaultOrg] = useState<string>()
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        // 编辑，用原来的值填充表单
        if (item) {
            form.setFieldsValue({
                ...item,
                name: item.name,
                // department_id: {
                //     // id: item.department_id,
                //     // name: item.department,
                //     label: item?.department,
                //     value: item?.department_id,
                // },
                department_id: item?.department_id,
                // uniform_code: item.uniform_code,
                // legal_represent: item.legal_represent,
                // contact_phone: item.contact_phone,
            })
            setDefaultOrg(item.department_id || '')
        } else if (selectedNode?.id) {
            form.setFieldsValue({
                department_id:
                    selectedNode?.id && selectedNode?.name
                        ? {
                              label: selectedNode?.name,
                              value: selectedNode?.id,
                          }
                        : undefined,
            })
        }
    }, [item])

    const onFinish = async (values) => {
        if (loading) return
        try {
            setLoading(true)
            const params = {
                ...values,
            }
            if (item) {
                await editAddressBook(item.id, params)
            } else {
                await createAddressBook(params)
            }
            onCreateSuccess()
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    const handleClickSubmit = async () => {
        try {
            await form.validateFields()
            form.submit()
        } catch (error) {
            // console.log(error)
        }
    }

    return (
        <Modal
            open={open}
            title={item ? __('编辑人员信息') : __('新建人员信息')}
            width="640px"
            getContainer={false}
            maskClosable={false}
            destroyOnClose
            onOk={handleClickSubmit}
            onCancel={onCreateClose}
            confirmLoading={loading}
        >
            <Form
                name="create"
                form={form}
                layout="vertical"
                wrapperCol={{ span: 24 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    label={__('人员名称')}
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: __('输入不能为空'),
                        },
                    ]}
                    validateFirst
                >
                    <Input placeholder={__('请输入')} maxLength={128} />
                </Form.Item>
                <Form.Item
                    label={__('所属部门')}
                    name="department_id"
                    rules={[
                        {
                            required: true,
                            message: __('请选择所属部门'),
                        },
                    ]}
                    validateFirst
                >
                    {/* <DepartmentOrAgencySelect
                        placeholder={`${__('请选择')}${__('所属部门')}`}
                        isAll={false}
                        allowClear
                        labelInValue
                        onChange={(val, label: any) => {
                            const option = val || {}
                            form.setFieldValue(
                                'department_id',
                                val
                                    ? {
                                          value: option?.value,
                                          label:
                                              option?.label?.props?.children ||
                                              option?.value,
                                      }
                                    : undefined,
                            )

                            form.setFieldValue(
                                ['belong_info', 'office'],
                                undefined,
                            )
                        }}
                    /> */}
                    <DepartmentAndOrgSelect
                        placeholder={`${__('请选择')}${__('所属部门')}`}
                        allowClear
                        defaultValue={defaultOrg}
                        onChange={(val, label: any) => {
                            // const option = val || {}
                            // form.setFieldValue(
                            //     'department_id',
                            //     val
                            //         ? {
                            //               value: val,
                            //               label:
                            //                   option?.label?.props?.children ||
                            //                   option?.value,
                            //           }
                            //         : undefined,
                            // )

                            form.setFieldValue(
                                ['belong_info', 'office'],
                                undefined,
                            )
                        }}
                    />
                </Form.Item>
                <Form.Item
                    label={__('手机号码')}
                    name="contact_phone"
                    rules={[
                        {
                            required: true,
                            message: __('输入不能为空'),
                        },
                        {
                            pattern: phoneRegex,
                            message: __('仅支持输入数字及+、-'),
                        },
                        {
                            min: 3,
                            max: 20,
                            message: __('仅支持输入3~20个字符'),
                        },
                    ]}
                    validateFirst
                >
                    <Input
                        placeholder={__('请输入')}
                        minLength={3}
                        maxLength={20}
                    />
                </Form.Item>
                <Form.Item
                    label={__('邮箱地址')}
                    name="contact_mail"
                    validateFirst
                    validateTrigger={['onBlur']}
                    rules={[
                        {
                            pattern: emailReg,
                            message: __('请输入正确的邮箱地址'),
                        },
                    ]}
                >
                    <Input placeholder={__('请输入')} maxLength={128} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default Create
