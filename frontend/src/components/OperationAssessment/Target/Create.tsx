import React, { useEffect, useState } from 'react'
import {
    Button,
    DatePicker,
    Drawer,
    Form,
    Input,
    message,
    Select,
    Space,
    Tooltip,
} from 'antd'
import moment from 'moment'
import Icon from '@ant-design/icons'
import { useUpdateEffect } from 'ahooks'
import __ from '../locale'
import styles from './styles.module.less'
import { ErrorInfo } from '@/utils'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import {
    createOperationTarget,
    formatError,
    IAssessmentTargetItem,
    TargetTypeEnum,
    updateOperationTarget,
} from '@/core'
import ChooseResponser from './ChooseResponser'
import ChooseMembers from '../AddVisitorModal'

interface IProps {
    open: boolean
    onClose: () => void
    onSuccess?: () => void
    editItem?: IAssessmentTargetItem
}

const Create: React.FC<IProps> = ({ open, onClose, onSuccess, editItem }) => {
    const [form] = Form.useForm()
    const [responserOptions, setResponserOptions] = useState<
        { label: string; value: string }[]
    >([])
    const [membersOptions, setMembersOptions] = useState<
        { label: string; value: string }[]
    >([])
    const [chooseResponserOpen, setChooseResponserOpen] = useState(false)
    const [chooseMembersOpen, setChooseMembersOpen] = useState(false)

    useEffect(() => {
        if (editItem) {
            form.setFieldsValue({
                target_name: editItem.target_name,
                description: editItem.description,
                responsible_uid: editItem.responsible_uid,
                employee_id: editItem.employee_id.split(','),
                target_date: [
                    moment(editItem.start_date),
                    editItem.end_date ? moment(editItem.end_date) : null,
                ],
            })
            setResponserOptions([
                {
                    label: editItem.responsible_name,
                    value: editItem.responsible_uid,
                },
            ])
            setMembersOptions(
                editItem.employee_id.split(',').map((id, index) => ({
                    label: editItem.employee_name.split(',')[index],
                    value: id,
                })),
            )
        }
    }, [editItem])

    const onFinish = async (values: any) => {
        try {
            const action = editItem
                ? updateOperationTarget.bind(null, editItem.id)
                : createOperationTarget
            await action({
                target_name: values.target_name,
                description: values.description,
                target_type: TargetTypeEnum.Operation,
                responsible_uid: values.responsible_uid,
                employee_id: Array.isArray(values.employee_id)
                    ? values.employee_id.join(',')
                    : undefined,
                start_date: moment(values.target_date[0]).format('YYYY-MM-DD'),
                end_date: values.target_date[1]
                    ? moment(values.target_date[1]).format('YYYY-MM-DD')
                    : undefined,
            } as any)
            message.success(editItem ? __('编辑成功') : __('创建成功'))
            onSuccess?.()
            onClose()
        } catch (error) {
            formatError(error)
        }
    }

    return (
        <Drawer
            title={editItem ? __('编辑考核目标') : __('新建考核目标')}
            width={640}
            onClose={onClose}
            open={open}
            destroyOnClose
            maskClosable={false}
            footer={
                <div className={styles['create-target-footer']}>
                    <Button onClick={onClose}>{__('取消')}</Button>
                    <Button type="primary" onClick={() => form.submit()}>
                        {__('确定')}
                    </Button>
                </div>
            }
        >
            <div className={styles['create-target-wrapper']}>
                <div className={styles['target-type']}>
                    <div className={styles['target-type-label']}>
                        {__('目标类型')}：
                    </div>
                    <div className={styles['target-type-value']}>
                        {__('运营目标')}
                    </div>
                </div>
                <Form
                    layout="vertical"
                    autoComplete="off"
                    form={form}
                    onFinish={onFinish}
                >
                    <Form.Item
                        label={__('目标名称')}
                        name="target_name"
                        required
                        rules={[
                            {
                                required: true,
                                message: __('请输入'),
                            },
                        ]}
                    >
                        <Input placeholder={__('请输入目标名称')} />
                    </Form.Item>
                    <Form.Item label={__('描述')} name="description">
                        <Input.TextArea
                            className={styles['desc-textarea']}
                            placeholder={__('请输入目标描述')}
                            maxLength={800}
                            showCount
                        />
                    </Form.Item>
                    <Space size={8}>
                        <Form.Item
                            label={__('责任人')}
                            name="responsible_uid"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: __('请选择责任人'),
                                },
                            ]}
                        >
                            <Select
                                placeholder={__('请选择一个主要责任人')}
                                options={responserOptions}
                                className={styles['responser-select']}
                            />
                        </Form.Item>
                        <Button
                            onClick={() => setChooseResponserOpen(true)}
                            className={styles['responser-select-button']}
                        >
                            {__('选择')}
                        </Button>
                    </Space>
                    <Space size={8}>
                        <Form.Item
                            label={
                                <div>
                                    {__('协作成员')}
                                    <FontIcon
                                        name="icon-xinxitishi"
                                        type={IconType.FONTICON}
                                        className={styles['employee-info-icon']}
                                    />
                                </div>
                            }
                            name="employee_id"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: __('请选择协作成员'),
                                },
                            ]}
                        >
                            <Select
                                placeholder={__(
                                    '可设置一个或多个协助完成目标的成员',
                                )}
                                options={membersOptions}
                                mode="multiple"
                                className={styles['responser-select']}
                            />
                        </Form.Item>
                        <Button
                            onClick={() => setChooseMembersOpen(true)}
                            className={styles['responser-select-button']}
                        >
                            {__('设置')}
                        </Button>
                    </Space>
                    <Form.Item
                        className={styles['full-line']}
                        label={
                            <div className={styles['date-label']}>
                                <span>{__('目标计划时间')}</span>
                                <span className={styles['date-label-desc']}>
                                    {__('可不设置结束日期')}
                                </span>
                            </div>
                        }
                        name="target_date"
                        validateTrigger={['onChange', 'onBlur']}
                        validateFirst
                        required
                        rules={[
                            {
                                required: true,
                                message: __('请选择目标计划时间'),
                            },
                        ]}
                    >
                        <DatePicker.RangePicker
                            style={{ width: '100%' }}
                            format="YYYY-MM-DD"
                            placeholder={[__('开始日期'), __('结束日期')]}
                            disabledDate={(current) => {
                                return (
                                    current && current < moment().startOf('day')
                                )
                            }}
                            allowEmpty={[false, true]}
                            getPopupContainer={(node) =>
                                node.parentElement || document.body
                            }
                        />
                    </Form.Item>
                </Form>
            </div>
            {chooseResponserOpen && (
                <ChooseResponser
                    open={chooseResponserOpen}
                    onCancel={() => setChooseResponserOpen(false)}
                    value={form.getFieldValue('responsible_uid')}
                    onOk={(value) => {
                        setResponserOptions([
                            { label: value.name, value: value.id },
                        ])
                        form.setFieldsValue({
                            responsible_uid: value.id,
                        })
                    }}
                />
            )}
            {chooseMembersOpen && (
                <ChooseMembers
                    open={chooseMembersOpen}
                    onCancel={() => setChooseMembersOpen(false)}
                    // value={form.getFieldValue('employee_id')}
                    onOk={(members) => {
                        setMembersOptions(
                            members.map((member) => ({
                                label: member.name,
                                value: member.id,
                            })),
                        )
                        form.setFieldsValue({
                            employee_id: members.map((member) => member.id),
                        })
                    }}
                />
            )}
        </Drawer>
    )
}

export default Create
