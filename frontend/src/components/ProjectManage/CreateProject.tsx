import React, { useEffect, useMemo, useState } from 'react'
import {
    Modal,
    Form,
    Input,
    Row,
    Col,
    Select,
    DatePicker,
    message,
    Button,
} from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import type { RangePickerProps } from 'antd/es/date-picker'
import { Rule } from 'antd/lib/form'
import moment from 'moment'
import { trim, remove } from 'lodash'
import classnames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { ErrorInfo, keyboardRegEnter, OperateType, getActualUrl } from '@/utils'
import { AvatarOutlined } from '@/icons'
import { ICreateProject, ProjectStatus, Priority } from './types'
import ProjectCover from './ProjectCover'
import { projectStatus, statusInfo, getUserName } from './const'
import {
    checkProjectName,
    getFlowchart,
    createProject,
    formatError,
    getProjectDetails,
    editProject,
    IMember,
    IFlowchart,
    IProjectDetails,
    IRoleGroup,
    getProjectManagers,
} from '@/core'
import styles from './styles.module.less'
import __ from './locale'
import { PrioritySelect } from '../TaskComponents/PrioritySelect'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useUserPermCtx } from '@/context/UserPermissionProvider'
import AddMember from './AddVisitorModal'

const CreateProject: React.FC<ICreateProject> = ({
    visible,
    operateType = OperateType.CREATE,
    onCancel,
    projectId,
    updateProjectsList,
    isJump = true,
}) => {
    const navigator = useNavigate()
    const [form] = Form.useForm()
    const [chooseMemberVisible, setChooseMemberVisible] = useState(false)
    const [roleGroups, setRoleGroups] = useState<IRoleGroup[]>([])
    const [members, setMembers] = useState<IMember[]>([])
    const [flowcharts, setFlowcharts] = useState<IFlowchart[]>([])
    const [searchOwnerValue, setSearchOwnerValue] = useState('')
    const [searchFlowchartValue, setSearchFlowchartValue] = useState('')
    const [details, setDetails] = useState<IProjectDetails>()
    const [loading, setLoading] = useState(false)
    const [statusList, setStatusList] = useState(projectStatus)
    const { checkPermission } = useUserPermCtx()
    const [userInfos] = useCurrentUser()

    const isThirdParty = useMemo(() => {
        return (
            operateType === OperateType.EDIT &&
            details?.project_type === 'thirdParty'
        )
    }, [details, operateType])

    // 获取角色下的成员
    // const getCandidates = async (
    //     flowchartId: string,
    //     versionId: string,
    //     projectMembers?: IMember[],
    // ) => {
    //     const res = await getCandidate(flowchartId, versionId)
    //     setRoleGroups(res.role_groups)
    //     let allMembers: IMember[] = []
    //     res?.role_groups?.forEach((roleGroup) => {
    //         allMembers = [...allMembers, ...roleGroup.members]
    //     })

    //     // 回显成员信息
    //     if (projectMembers) {
    //         const tempMembers: IMember[] = []
    //         projectMembers.forEach((pm) => {
    //             const memberInfo = allMembers.find(
    //                 (member) => member.id === pm.id,
    //             )
    //             // 若在全部成员中没找到，则说明该用户已经从角色中被移除
    //             if (memberInfo) {
    //                 tempMembers.push({ ...pm, ...memberInfo })
    //             }
    //         })
    //         form.setFieldsValue({ members: tempMembers })
    //     }
    // }

    // 获取所有成员
    const getAllMembers = async (ownerId?: string) => {
        try {
            const res = await getProjectManagers()
            setMembers(res)
            if (ownerId) {
                const isExistOwner = res.find((user) => user.id === ownerId)
                form.setFields([
                    {
                        name: 'owner_id',
                        errors: isExistOwner
                            ? undefined
                            : ['该项目负责人已被移除，请重新选择'],
                        value: isExistOwner ? ownerId : undefined,
                    },
                ])
            }
        } catch (error) {
            formatError(error)
        }
    }

    // 获取工作流程列表
    const getFlowchartList = async () => {
        try {
            const res = await getFlowchart()
            setFlowcharts(res.entries)
        } catch (error) {
            formatError(error)
        }
    }

    // 获取项目详情
    const getDetails = async () => {
        const res = await getProjectDetails(projectId)
        const {
            name,
            description,
            flow_id: flowchart_id,
            flow_version,
            image,
            deadline,
            owner_id,
            priority,
            status,
            flow_name,
            members: projectMembers,
            department_id,
        } = res
        // getCandidates(flowchart_id, flow_version, projectMembers)

        getAllMembers(owner_id)
        setDetails(res)
        form.setFieldsValue({
            name,
            description,
            flowchart_id: flow_name,
            image,
            deadline: deadline
                ? moment(moment(deadline * 1000).format('YYYY-MM-DD'))
                : undefined,
            // owner_id,
            priority,
            status,
            department_id: department_id || undefined,
            members: projectMembers,
        })
        if (status === ProjectStatus.UNSTART) {
            const filterRes = projectStatus.filter(
                (s) =>
                    s.key === ProjectStatus.UNSTART ||
                    s.key === ProjectStatus.PROGRESS,
            )
            setStatusList(filterRes)
        } else if (status === ProjectStatus.PROGRESS) {
            const filterRes = projectStatus.filter(
                (s) =>
                    s.key === ProjectStatus.PROGRESS ||
                    s.key === ProjectStatus.COMPLETED,
            )
            setStatusList(filterRes)
        } else {
            const filterRes = projectStatus.filter(
                (s) => s.key === ProjectStatus.COMPLETED,
            )
            setStatusList(filterRes)
        }
    }

    useEffect(() => {
        if (visible) {
            if (operateType === OperateType.CREATE) {
                getFlowchartList()
                getAllMembers()
            }
        } else {
            form.resetFields()
            setRoleGroups([])
            setMembers([])
            setChooseMemberVisible(false)
        }
    }, [visible])

    useEffect(() => {
        if (visible && operateType === OperateType.EDIT) {
            getDetails()
        }
    }, [visible, operateType])

    const getData = async () => {
        try {
            form.setFieldsValue({
                owner_id: userInfos?.ID,
            })
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        // 创建项目时 登录人默认为项目负责人
        if (operateType === OperateType.CREATE && visible) {
            // getData()

            // const { userID } = JSON.parse(
            //     window.sessionStorage.getItem('userInfo') || '',
            // )
            // form.setFieldsValue({
            //     owner_id: res?.ID,
            // })
            // 新建时处理状态下拉列表为全部数据
            setStatusList(projectStatus)
        } else {
            setDetails(undefined)
        }
    }, [visible])

    // 设置不可选日期 - 当天之前不可选
    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
        return current < moment().subtract(1, 'days')
    }

    // 工作流程变化时查成员
    const handleFlowchartChange = async (flowchartId: string) => {
        form.resetFields(['members'])
        if (flowchartId) {
            const { version_id } =
                flowcharts.find((fc) => fc.id === flowchartId) || {}
            // if (version_id) getCandidates(flowchartId, version_id)
        } else {
            setRoleGroups([])
            // setMembers([])
        }
    }

    const getRules = (
        required: boolean,
        regExp: RegExp | null,
        regExpMessage: string = ErrorInfo.ONLYSUP,
    ) => {
        const rules: Rule[] = []
        if (required) {
            rules.push({
                required: true,
                transform: (value) => trim(value),
                message: ErrorInfo.NOTNULL,
            })
        }
        if (regExp) {
            rules.push({
                pattern: regExp,
                message: regExpMessage,
                transform: (value) => trim(value),
            })
        }

        return rules
    }

    const validateNameRepeat = async (value: string): Promise<void> => {
        const trimValue = trim(value)
        try {
            await checkProjectName(
                trimValue,
                operateType === OperateType.CREATE ? '' : projectId,
            )
            return Promise.resolve()
        } catch (error) {
            return Promise.reject(new Error(error.data.description))
        }
    }

    // 删除某个成员
    const handleDeleteMember = (allMembers: IMember[], member: IMember) => {
        remove(allMembers, (o) => {
            return o.id === member.id
        })

        form.setFieldsValue({ members: allMembers })
    }

    // 搜索过滤项目负责人
    const filterOwner = (inputValue: string, option) => {
        const res = members
            .filter(
                (m) =>
                    m.name &&
                    m.name
                        .toLowerCase()
                        .includes(trim(inputValue.toLowerCase())),
            )
            .filter((m) => m.id === option?.value)
        return res.length > 0
    }

    // 点击添加成员 必选工作流程 否则不能选人
    const handleAddMembers = () => {
        form.validateFields(['flowchart_id'])
        if (form.getFieldValue('flowchart_id')) {
            setChooseMemberVisible(true)
        }
    }

    const onFinish = async (values) => {
        if (
            operateType === OperateType.EDIT &&
            details?.status === ProjectStatus.COMPLETED
        ) {
            onCancel()
            return
        }

        const deadline = values.deadline
            ? Date.parse(values.deadline.format('YYYY-MM-DD 23:59:59')) / 1000
            : undefined
        const { version_id: flowchart_version } =
            flowcharts.find((fc) => fc.id === values.flowchart_id) || {}
        const mbers = values?.members?.map((item) => {
            const obj = {
                name: item.name,
                user_id: item.id,
            }
            return obj
        })
        const params = {
            ...values,
            deadline,
            flowchart_version,
            ...{ members: mbers },
        }
        try {
            setLoading(true)
            const res = await (operateType === OperateType.CREATE
                ? createProject(params)
                : editProject(projectId, params))

            if (operateType === OperateType.CREATE) {
                message.success(__('新建成功'))
                if (isJump) {
                    navigator(`/taskContent/project/${res.id}/content`)
                } else {
                    updateProjectsList()
                    onCancel()
                }
            } else {
                message.success(__('编辑成功'))
                onCancel()
                updateProjectsList()
            }
            setLoading(false)
        } catch (error) {
            if (
                error?.code ===
                'TaskCenter.Project.ProjectRelatedFlowChartValid'
            ) {
                form.setFields([
                    {
                        name: 'flowchart_id',
                        errors: [__('关联工作流程失效，请重新选择')],
                    },
                ])
            }
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    // 项目负责人
    const membersEmpty = () => {
        if (checkPermission('manageUserAndRole')) {
            // 有系统管理员身份
            return (
                <>
                    <div>{__('暂无项目管理员')}</div>
                    <div>
                        {__('可前往')}
                        <a
                            href={getActualUrl('/systemConfig/userRole')}
                            style={{ color: '#126ee3' }}
                        >
                            {__('「用户管理」')}
                        </a>
                        {__('配置权限')}
                    </div>
                </>
            )
        }
        return <div>{__('暂无项目管理员，可联系系统管理员添加用户')}</div>
    }

    return (
        <div className={styles.createProjectWrapper}>
            <Modal
                open={visible}
                onCancel={() => {
                    if (chooseMemberVisible) {
                        setChooseMemberVisible(false)
                    } else {
                        onCancel()
                    }
                }}
                title={
                    operateType === OperateType.CREATE
                        ? __('新建项目')
                        : details?.status === ProjectStatus.COMPLETED
                        ? __('项目详情')
                        : __('编辑项目')
                }
                onOk={() => {
                    if (chooseMemberVisible) {
                        setChooseMemberVisible(false)
                    } else {
                        form.submit()
                    }
                }}
                maskClosable={false}
                destroyOnClose
                getContainer={false}
                width={800}
                bodyStyle={
                    chooseMemberVisible
                        ? { maxHeight: 484, paddingBottom: 0 }
                        : { maxHeight: 484, overflow: 'auto', paddingBottom: 0 }
                }
                okButtonProps={{ disabled: loading }}
            >
                <Form
                    form={form}
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                >
                    <div
                        className={classnames(
                            chooseMemberVisible
                                ? styles.contentHidden
                                : undefined,
                        )}
                    >
                        <Form.Item label={__('项目封面')} name="image">
                            <ProjectCover
                                status={details?.status}
                                isThirdParty={isThirdParty}
                            />
                        </Form.Item>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item
                                    label={__('项目名称')}
                                    name="name"
                                    validateTrigger={['onChange', 'onBlur']}
                                    validateFirst
                                    rules={[
                                        ...getRules(
                                            details?.status !==
                                                ProjectStatus.COMPLETED,
                                            null,
                                            ErrorInfo.ONLYSUP,
                                        ),
                                        {
                                            validateTrigger: ['onBlur'],
                                            validator: (e, value) =>
                                                validateNameRepeat(value),
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder={__('请输入项目名称')}
                                        maxLength={128}
                                        disabled={
                                            details?.status ===
                                                ProjectStatus.COMPLETED ||
                                            isThirdParty
                                        }
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={__('关联工作流程')}
                                    name="flowchart_id"
                                    rules={[
                                        {
                                            required:
                                                operateType !==
                                                OperateType.EDIT,
                                            message: __('请选择关联工作流程'),
                                        },
                                    ]}
                                >
                                    <Select
                                        placeholder={__('请选择关联工作流程')}
                                        onChange={handleFlowchartChange}
                                        disabled={
                                            operateType === OperateType.EDIT
                                        }
                                        searchValue={searchFlowchartValue}
                                        showSearch
                                        allowClear
                                        optionFilterProp="name"
                                        onSearch={(value) =>
                                            setSearchFlowchartValue(
                                                value.substring(0, 128),
                                            )
                                        }
                                        getPopupContainer={(node) =>
                                            node.parentNode
                                        }
                                        options={flowcharts.map((fc) => {
                                            return {
                                                label: (
                                                    <div
                                                        className={
                                                            styles.flowSelectItem
                                                        }
                                                    >
                                                        {fc.name}
                                                    </div>
                                                ),
                                                value: fc.id,
                                                name: fc.name,
                                            }
                                        })}
                                        notFoundContent={
                                            <div
                                                className={
                                                    styles.notFoundContent
                                                }
                                            >
                                                {searchFlowchartValue
                                                    ? __('未找到匹配的结果')
                                                    : __('暂无数据')}
                                            </div>
                                        }
                                    />
                                </Form.Item>
                            </Col>
                            {/* <Col span={12}>
                                <Form.Item
                                    label={__('所属部门')}
                                    name="department_id"
                                >
                                    <DepartmentSelected
                                        placeholder={__('请选择所属部门')}
                                        dropdownStyle={{
                                            width: '100%',
                                            maxHeight: 400,
                                            overflow: 'auto',
                                        }}
                                        dropdownMatchSelectWidth={false}
                                        getInitValueError={(result) => {
                                            if (result) {
                                                form.setFields([
                                                    {
                                                        name: ['department_id'],
                                                        errors: [result],
                                                        value: null,
                                                    },
                                                ])
                                            }
                                        }}
                                        disabled={
                                            details?.status ===
                                            ProjectStatus.COMPLETED
                                        }
                                    />
                                </Form.Item>
                            </Col> */}
                            <Col span={12}>
                                <Form.Item
                                    label={__('项目状态')}
                                    name="status"
                                    initialValue={ProjectStatus.UNSTART}
                                >
                                    <Select
                                        placeholder={__('请选择项目状态')}
                                        getPopupContainer={(node) =>
                                            node.parentNode
                                        }
                                        disabled={
                                            operateType ===
                                                OperateType.CREATE ||
                                            details?.status ===
                                                ProjectStatus.COMPLETED ||
                                            isThirdParty
                                        }
                                    >
                                        {statusList.map((status) => (
                                            <Select.Option
                                                key={status.key}
                                                value={status.key}
                                            >
                                                <div
                                                    className={
                                                        styles[
                                                            statusInfo[
                                                                status.key
                                                            ].class
                                                        ]
                                                    }
                                                >
                                                    {status.value}
                                                </div>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={__('截止时间')}
                                    name="deadline"
                                >
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        placeholder={__('请选择截止时间')}
                                        disabledDate={disabledDate}
                                        format="YYYY-MM-DD"
                                        disabled={
                                            details?.status ===
                                                ProjectStatus.COMPLETED ||
                                            isThirdParty
                                        }
                                        getPopupContainer={(node) =>
                                            node.parentNode as HTMLElement
                                        }
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={__('项目优先级')}
                                    name="priority"
                                    initialValue={Priority.COMMON}
                                >
                                    <PrioritySelect
                                        disabled={
                                            details?.status ===
                                                ProjectStatus.COMPLETED ||
                                            isThirdParty
                                        }
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={__('项目负责人')}
                                    name="owner_id"
                                    rules={[
                                        {
                                            required:
                                                details?.status !==
                                                ProjectStatus.COMPLETED,
                                            message: __('请选择项目负责人'),
                                        },
                                    ]}
                                >
                                    <Select
                                        placeholder={__('请选择项目负责人')}
                                        searchValue={searchOwnerValue}
                                        showSearch
                                        allowClear
                                        optionFilterProp="children"
                                        filterOption={filterOwner}
                                        onSearch={(value) =>
                                            setSearchOwnerValue(
                                                value.substring(0, 128),
                                            )
                                        }
                                        getPopupContainer={(node) =>
                                            node.parentNode
                                        }
                                        notFoundContent={
                                            <div
                                                className={
                                                    styles.notFoundContent
                                                }
                                            >
                                                {searchOwnerValue
                                                    ? __('未找到匹配的结果')
                                                    : membersEmpty()}
                                            </div>
                                        }
                                        disabled={
                                            details?.status ===
                                                ProjectStatus.COMPLETED ||
                                            isThirdParty
                                        }
                                    >
                                        {members?.map((member) => (
                                            <Select.Option
                                                key={member.id}
                                                value={member.id}
                                            >
                                                <div
                                                    className={styles.ownerItem}
                                                >
                                                    <div
                                                        className={
                                                            styles.avatarWrapper
                                                        }
                                                    >
                                                        <AvatarOutlined />
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.ownerName
                                                        }
                                                        title={getUserName(
                                                            member,
                                                        )}
                                                    >
                                                        {getUserName(member)}
                                                    </div>
                                                </div>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    noStyle
                                    shouldUpdate={(pre, cur) =>
                                        pre.members !== cur.members
                                    }
                                >
                                    {({ getFieldValue }) => {
                                        const proMembers =
                                            getFieldValue('members')

                                        return (
                                            <Form.Item label={__('项目成员')}>
                                                <div
                                                    className={
                                                        styles.membersWrapper
                                                    }
                                                >
                                                    <div
                                                        className={classnames(
                                                            styles.showMembers,
                                                            (!proMembers ||
                                                                proMembers.length ===
                                                                    0) &&
                                                                styles.showNoMember,
                                                        )}
                                                    >
                                                        {Array.isArray(
                                                            proMembers,
                                                        ) &&
                                                        proMembers.length >
                                                            0 ? (
                                                            proMembers?.map(
                                                                (member) => (
                                                                    <div
                                                                        title={
                                                                            member.name
                                                                        }
                                                                        className={
                                                                            styles.memberInfo
                                                                        }
                                                                    >
                                                                        <div
                                                                            className={
                                                                                styles.avatarWrapper
                                                                            }
                                                                        >
                                                                            <AvatarOutlined />
                                                                        </div>
                                                                        <span
                                                                            className={
                                                                                styles.memberName
                                                                            }
                                                                        >
                                                                            {getUserName(
                                                                                member,
                                                                            )}
                                                                        </span>
                                                                        <CloseOutlined
                                                                            onClick={() => {
                                                                                if (
                                                                                    details?.status ===
                                                                                    ProjectStatus.COMPLETED
                                                                                ) {
                                                                                    return
                                                                                }
                                                                                handleDeleteMember(
                                                                                    proMembers,
                                                                                    member,
                                                                                )
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ),
                                                            )
                                                        ) : (
                                                            <span
                                                                className={
                                                                    styles.memberPlaceholder
                                                                }
                                                            >
                                                                {__(
                                                                    '请选择项目成员',
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Button
                                                        onClick={
                                                            handleAddMembers
                                                        }
                                                        disabled={
                                                            details?.status ===
                                                            ProjectStatus.COMPLETED
                                                        }
                                                    >
                                                        {__('添加成员')}
                                                    </Button>
                                                </div>
                                            </Form.Item>
                                        )
                                    }}
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={__('项目描述')}
                                    name="description"
                                    validateTrigger={['onChange', 'onBlur']}
                                    validateFirst
                                    rules={getRules(
                                        false,
                                        keyboardRegEnter,
                                        ErrorInfo.EXCEPTEMOJI,
                                    )}
                                >
                                    <Input.TextArea
                                        placeholder={__('请输入项目描述')}
                                        maxLength={255}
                                        style={{ height: 80, resize: 'none' }}
                                        disabled={
                                            details?.status ===
                                                ProjectStatus.COMPLETED ||
                                            isThirdParty
                                        }
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    <Form.Item
                        name="members"
                        className={classnames(
                            chooseMemberVisible
                                ? undefined
                                : styles.contentHidden,
                        )}
                    >
                        <AddMember visible={chooseMemberVisible} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default CreateProject
