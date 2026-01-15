import { ExclamationCircleFilled } from '@ant-design/icons'
import { useSize } from 'ahooks'
import { Button, List, Space, message } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import dataEmpty from '@/assets/dataEmpty.svg'
import { RefreshBtn, SortBtn } from '@/components/ToolbarComponents'
import { useUserPermCtx } from '@/context/UserPermissionProvider'
import {
    IProject,
    SortDirection,
    deleteProject,
    editProject,
    exportTable,
    formatError,
    getProjects,
} from '@/core'
import { AddOutlined } from '@/icons'
import {
    LightweightSearch,
    ListDefaultPageSize,
    ListPagination,
    ListType,
    SearchInput,
} from '@/ui'
import Empty from '@/ui/Empty'
import Loader from '@/ui/Loader'
import { OperateType, streamToFile } from '@/utils'
import { confirm } from '@/utils/modalHelper'
import DropDownFilter from '../DropDownFilter'
import { defaultMenu, menus, searchData, statusNextInfo } from './const'
import CreateProject from './CreateProject'
import __ from './locale'
import Project from './Project'
import styles from './styles.module.less'
import { ISearchCondition, ProjectStatus } from './types'

const initSearchCondition: ISearchCondition = {
    offset: 1,
    limit: ListDefaultPageSize[ListType.CardList],
    name: '',
    status: '',
    project_type: '',
    sort: 'created_at',
    direction: SortDirection.DESC,
}
const ProjectManage = () => {
    const [searchCondition, setSearchCondition] =
        useState<ISearchCondition>(initSearchCondition)
    const [projects, setProjects] = useState<IProject[]>([])

    const [total, setTotal] = useState(0)

    const [createVisible, setCreateVisible] = useState(false)

    const [projectId, setProjectId] = useState<string>('')

    const [operateType, setOperateType] = useState<OperateType>(
        OperateType.CREATE,
    )

    const [loading, setLoading] = useState(false)

    const { checkPermission } = useUserPermCtx()

    const getProjectsList = async (condition?: ISearchCondition) => {
        try {
            setLoading(true)
            const res = await getProjects({ ...searchCondition, ...condition })
            setProjects(res.entries)
            setTotal(res.total_count)
            setLoading(false)
        } catch (error) {
            formatError(error)
        }
    }
    useEffect(() => {
        getProjectsList()
    }, [JSON.stringify(searchCondition)])

    const ref = useRef<HTMLDivElement>(null)

    // 列表大小
    const size = useSize(ref)
    const col = useMemo(() => {
        const refOffsetWidth = ref?.current?.offsetWidth || size?.width || 0
        return refOffsetWidth >= 1272
            ? 4
            : refOffsetWidth >= 948
            ? 3
            : undefined
    }, [size?.width])

    // 项目条件改变
    const handleFilterChange = (items: any) => {
        setSearchCondition({
            ...searchCondition,
            offset: 1,
            ...items,
        })
    }

    // 项目名称搜索
    const handleSearchChange = (kw: string) => {
        setSearchCondition({
            ...searchCondition,
            offset: 1,
            name: kw,
        })
    }

    // 筛选顺序变化
    const handleMenuChange = (selectedMenu) => {
        setSearchCondition({
            ...searchCondition,
            offset: 1,
            sort: selectedMenu.key,
            direction: selectedMenu.sort,
        })
    }

    // 页码变化
    const handlePageChange = (offset: number, limit: number) => {
        setSearchCondition({ ...searchCondition, offset, limit })
    }

    const handleCreateProject = () => {
        setCreateVisible(true)
        setOperateType(OperateType.CREATE)
    }

    const handleEditProject = (pid: string) => {
        setCreateVisible(true)
        setProjectId(pid)
        setOperateType(OperateType.EDIT)
    }

    // 删除项目请求
    const handleDeleteProject = async (pid: string) => {
        try {
            await deleteProject(pid)
            message.success(__('删除成功'))
        } catch (e) {
            formatError(e)
        } finally {
            const param = {
                ...searchCondition,
                offset:
                    projects.length === 1
                        ? searchCondition.offset! - 1 || 1
                        : searchCondition.offset!,
            }
            setSearchCondition(param)
            getProjectsList(param)
        }
    }

    // 编辑项目状态
    const handleEditStatus = async (project) => {
        try {
            setLoading(true)
            const { status } = project
            const res = await editProject(project.id, {
                name: project.name,
                owner_id: project.owner_id,
                status: statusNextInfo[status].value,
            })
            if (status === ProjectStatus.UNSTART) {
                message.success(__('项目进行中'))
            } else {
                message.success(__('项目已完成'))
            }
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
            getProjectsList()
        }
    }

    const exportBusinessTable = async (
        project: any,
        type: 'business' | 'data',
    ) => {
        try {
            const res = await exportTable({
                project_id: project.id,
                model_type: type,
                business_model_id: '',
            })
            const businessTableMap = {
                business: __('业务表清单'),
                data: __('数据表清单'),
            }
            streamToFile(
                res,
                `${project.name}_${
                    businessTableMap[type]
                }_${new Date().getTime()}.xlsx`,
            )
        } catch (error) {
            formatError(error)
        }
    }

    // 菜单项相关操作
    const handleOperate = (op, project) => {
        switch (op) {
            case OperateType.EDIT:
                handleEditProject(project.id)
                break
            case OperateType.DELETE:
                confirm({
                    title: __('确定要删除该项目吗？'),
                    icon: (
                        <ExclamationCircleFilled
                            style={{ color: 'rgb(250 173 20)' }}
                        />
                    ),
                    content: __('该项目删除后将无法找回，请谨慎操作!'),
                    onOk() {
                        handleDeleteProject(project.id)
                    },
                })
                break
            case 'editStatus':
                handleEditStatus(project)
                break
            case 'business':
            case 'data':
                exportBusinessTable(project, op)
                break
            default:
                break
        }
    }

    const renderEmpty = () => {
        const { name, status } = searchCondition
        if ((name || status) && projects.length === 0) return <Empty />
        if (projects.length === 0 && !(name && status)) {
            const descComp = (
                <div className={styles.emptyDesc}>
                    <div> {__('暂无数据')}</div>
                    {/* <div
                        hidden={
                            !getAccess(
                                `${ResourceType.project}.${RequestType.post}`,
                            )
                        }
                    >
                        {__('点击')}
                        <span
                            className={styles.operate}
                            onClick={() => setCreateVisible(true)}
                        >
                            【{__('新建')}】
                        </span>
                        {__('按钮可新建项目')}
                    </div> */}
                </div>
            )

            return <Empty iconSrc={dataEmpty} desc={descComp} />
        }
        return null
    }

    const searchChange = (data, key) => {
        if (key === 'status') {
            setSearchCondition({
                ...searchCondition,
                offset: 1,
                status: data.status || undefined,
            })
        } else if (key === 'project_type') {
            setSearchCondition({
                ...searchCondition,
                offset: 1,
                project_type: data.project_type || undefined,
            })
        } else {
            setSearchCondition({
                ...searchCondition,
                offset: 1,
                status: '',
                project_type: '',
            })
        }

        // handleFilterChange(params)
    }

    return (
        <div className={styles.projectWrapper} ref={ref}>
            <div className={styles.operateWrapper}>
                <Button
                    type="primary"
                    icon={<AddOutlined />}
                    onClick={handleCreateProject}
                    style={{
                        visibility: checkPermission(
                            'manageDataOperationProject',
                        )
                            ? 'visible'
                            : 'hidden',
                    }}
                >
                    {__('新建项目')}
                </Button>
                <Space>
                    <SearchInput
                        placeholder={__('搜索项目名称')}
                        value={searchCondition.name}
                        onKeyChange={handleSearchChange}
                        className={styles.projectName}
                    />
                    <LightweightSearch
                        formData={searchData}
                        onChange={(data, key) => {
                            searchChange(data, key)
                        }}
                        defaultValue={{ status: '', project_type: '' }}
                    />
                    <Space size={0}>
                        <SortBtn
                            contentNode={
                                <DropDownFilter
                                    menus={menus}
                                    defaultMenu={defaultMenu}
                                    menuChangeCb={handleMenuChange}
                                />
                            }
                        />
                        <RefreshBtn onClick={() => getProjectsList()} />
                    </Space>
                </Space>
            </div>

            {loading ? (
                <Loader />
            ) : projects.length === 0 ? (
                <div className={styles.empty}>{renderEmpty()}</div>
            ) : (
                <div
                    className={styles.projects}
                    ref={ref}
                    hidden={loading || projects?.length === 0}
                >
                    <div className={styles.listWrapper}>
                        <List
                            grid={{
                                gutter: 24,
                                column: col,
                            }}
                            dataSource={projects}
                            renderItem={(project) => (
                                <List.Item
                                    style={{
                                        maxWidth: col
                                            ? (size?.width ||
                                                  0 - (col - 1) * 24) / col
                                            : undefined,
                                    }}
                                >
                                    <Project
                                        project={project}
                                        key={project.id}
                                        handleOperate={(op) =>
                                            handleOperate(op, project)
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>

                    <ListPagination
                        listType={ListType.CardList}
                        queryParams={searchCondition}
                        totalCount={total}
                        onChange={handlePageChange}
                    />
                </div>
            )}
            <CreateProject
                visible={createVisible}
                onCancel={() => setCreateVisible(false)}
                projectId={projectId}
                operateType={operateType}
                updateProjectsList={getProjectsList}
            />
        </div>
    )
}

export default ProjectManage
