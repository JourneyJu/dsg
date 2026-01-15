import React, { useEffect, useState } from 'react'
import {
    Button,
    DatePicker,
    Drawer,
    Form,
    Input,
    message,
    Select,
    Tooltip,
} from 'antd'
import moment from 'moment'
import Icon from '@ant-design/icons'
import __ from '../locale'
import styles from './styles.module.less'
import { ErrorInfo } from '@/utils'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import {
    createDepartmentTarget,
    formatError,
    getCurUserDepartment,
    getObjects,
    IAssessmentTargetItem,
    TargetTypeEnum,
    updateDepartmentTarget,
} from '@/core'

interface IProps {
    open: boolean
    onClose: () => void
    onSuccess?: () => void
    editItem?: IAssessmentTargetItem
}

const Create: React.FC<IProps> = ({ open, onClose, onSuccess, editItem }) => {
    const [form] = Form.useForm()
    const [departmentOptions, setDepartmentOptions] = useState<
        { label: string; value: string }[]
    >([])

    useEffect(() => {
        if (editItem) {
            form.setFieldsValue({
                target_name: editItem.target_name,
                description: editItem.description,
                department_id: editItem.department_id,
                target_date: [
                    moment(editItem.start_date),
                    moment(editItem.end_date),
                ],
            })
        }
    }, [editItem])

    // 获取当前部门
    const getCurDepartment = async () => {
        try {
            const curUserDepartment = await getCurUserDepartment()
            const [firstDept] = curUserDepartment ?? []
            const objRes = await getObjects({
                is_all: true,
                id: firstDept?.id,
            })
            setDepartmentOptions([
                { label: firstDept?.name, value: firstDept?.id },
                ...objRes.entries.map((item) => ({
                    label: item.name,
                    value: item.id,
                })),
            ])
            if (!editItem) {
                form.setFieldsValue({
                    department_id: firstDept?.id,
                })
            }
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        getCurDepartment()
    }, [])

    const onFinish = async (values: any) => {
        try {
            const action = editItem
                ? updateDepartmentTarget.bind(null, editItem.id)
                : createDepartmentTarget
            await action({
                target_name: values.target_name,
                description: values.description,
                target_type: TargetTypeEnum.Department,
                department_id: values.department_id,
                start_date: moment(values.target_date[0]).format('YYYY-MM-DD'),
                end_date: values.target_date[1]
                    ? moment(values.target_date[1]).format('YYYY-MM-DD')
                    : undefined,
            })
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
                        {__('部门目标')}
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
                    <Form.Item
                        label={
                            <div>
                                {__('责任部门')}
                                <Tooltip
                                    color="#fff"
                                    placement="bottom"
                                    title={
                                        <div style={{ color: '#000' }}>
                                            {__('目标仅能分配给您所在的部门')}
                                        </div>
                                    }
                                >
                                    <FontIcon
                                        name="icon-xinxitishi"
                                        type={IconType.FONTICON}
                                        className={
                                            styles['department-info-icon']
                                        }
                                    />
                                </Tooltip>
                            </div>
                        }
                        name="department_id"
                    >
                        <Select
                            placeholder={__('请选择责任部门')}
                            options={departmentOptions}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
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
        </Drawer>
    )
}

export default Create
