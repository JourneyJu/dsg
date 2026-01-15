import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import {
    Button,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Row,
    Select,
} from 'antd'
import moment from 'moment'
import DepartmentAndOrgSelect from '../../DepartmentAndOrgSelect'
import {
    formatError,
    getCurUserDepartment,
    getProjects,
    IProject,
    ISandboxApplyItem,
    postSandboxApply,
} from '@/core'
import __ from '../locale'
import styles from './styles.module.less'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { SearchInput } from '@/ui'
import CreateProject from '../../ProjectManage/CreateProject'

interface ApplyModalProps {
    open: boolean
    onClose: () => void
    onOk: () => void
    data?: ISandboxApplyItem
}
const ApplyModal: React.FC<ApplyModalProps> = ({
    open,
    onClose,
    onOk,
    data,
}) => {
    const [form] = Form.useForm()
    const [firstDep, setFirstDep] = useState<any>()
    const [useInfo] = useCurrentUser()
    const [projects, setProjects] = useState<IProject[]>([])
    const [searchKey, setSearchKey] = useState('')
    const [createProOpen, setCreateProOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const projectOptions = useMemo(() => {
        return projects.filter((p) =>
            p.name
                .toLocaleLowerCase()
                .includes(searchKey.trim().toLocaleLowerCase()),
        )
    }, [projects, searchKey])

    useEffect(() => {
        if (useInfo) {
            form.setFieldsValue({ name: useInfo.Account })
        }
    }, [useInfo])

    useEffect(() => {
        if (data) {
            form.setFieldsValue({
                name: data.applicant_name,
                department_id: data.department_id,
                project_id: data.project_id,
                request_space: data.in_apply_space || data.last_apply_space,
                valid_time: data.valid_start
                    ? [moment(data.valid_start), moment(data.valid_end)]
                    : undefined,
                reason: data.reason,
            })
        }
    }, [data])

    // 获取当前部门
    const getCurDepartment = async () => {
        try {
            const deps = await getCurUserDepartment()
            const [firstDept] = deps ?? []
            setFirstDep(firstDept)
            form.setFieldsValue({ department_id: firstDept?.id })
        } catch (error) {
            formatError(error)
        }
    }

    const getProjectList = async () => {
        const res = await getProjects({ limit: 120, offset: 1 })
        setProjects(res.entries)
    }

    useEffect(() => {
        getCurDepartment()
        getProjectList()
    }, [])

    const onFinish = async (values) => {
        try {
            setLoading(true)
            await postSandboxApply({
                ...values,
                name: undefined,
                valid_start: values.valid_time
                    ? values.valid_time[0].valueOf()
                    : undefined,
                valid_end: values.valid_time
                    ? values.valid_time[1].valueOf()
                    : undefined,
                valid_time: undefined,
            })
            message.success(__('申请成功'))
            onOk()
            onClose()
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    const dropdownRender = (originNode: ReactNode) => {
        return (
            <div className={styles['projects-dropdown-container']}>
                <div className={styles['search-input']}>
                    <SearchInput
                        onKeyChange={(keyword) => {
                            setSearchKey(keyword)
                        }}
                        placeholder={__('搜索项目名称')}
                        allowClear
                    />
                </div>
                {projectOptions.length === 0 ? (
                    <div className={styles['empty-container']}>
                        <div className={styles['empty-text']}>
                            {searchKey
                                ? __('抱歉，没有找到相关内容')
                                : __('暂无数据')}
                        </div>
                        <div className={styles['create-text']}>
                            {__('点击')}
                            <Button
                                type="link"
                                onClick={() => setCreateProOpen(true)}
                            >
                                【{__('按钮')}】
                            </Button>
                            {__('按钮可新建项目')}
                        </div>
                    </div>
                ) : (
                    originNode
                )}
            </div>
        )
    }

    return (
        <Modal
            title={__('沙箱申请')}
            width={640}
            bodyStyle={{ height: 450 }}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okButtonProps={{ loading }}
        >
            <Form
                form={form}
                autoComplete="off"
                layout="vertical"
                onFinish={onFinish}
            >
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item label={__('申请人')} name="name">
                            <Input placeholder={__('请输入')} disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="department_id"
                            label={__('所属组织架构')}
                            required
                            rules={[
                                {
                                    required: true,
                                    message: __('请选择'),
                                },
                            ]}
                        >
                            <DepartmentAndOrgSelect
                                placeholder={__('请选择')}
                                disabled
                                defaultValue={firstDep?.id}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label={__('项目名称')}
                            name="project_id"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: __('请选择'),
                                },
                            ]}
                        >
                            <Select
                                placeholder={__('请选择')}
                                options={projectOptions}
                                fieldNames={{ label: 'name', value: 'id' }}
                                getPopupContainer={(node) => node.parentNode}
                                dropdownRender={dropdownRender}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={__('申请容量')}
                            name="request_space"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: __('请输入'),
                                },
                            ]}
                        >
                            <InputNumber
                                placeholder={__('请输入')}
                                addonAfter="G"
                                style={{ width: '100%' }}
                                min={1}
                                precision={0}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="valid_time" label={__('有效期')}>
                            <DatePicker.RangePicker
                                getPopupContainer={(node) =>
                                    node.parentNode as HTMLElement
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="reason"
                            label={__('申请原因')}
                            required
                            rules={[
                                {
                                    required: true,
                                    message: __('请输入'),
                                },
                            ]}
                        >
                            <Input.TextArea
                                placeholder={__('请输入')}
                                autoSize={{
                                    minRows: 4,
                                    maxRows: 4,
                                }}
                                showCount
                                maxLength={800}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            {createProOpen && (
                <CreateProject
                    visible={createProOpen}
                    onCancel={() => setCreateProOpen(false)}
                    projectId=""
                    updateProjectsList={() => getProjectList()}
                    isJump={false}
                />
            )}
        </Modal>
    )
}

export default ApplyModal
