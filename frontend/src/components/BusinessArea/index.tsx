import { Button, Space, Spin, Table, message } from 'antd'
import { useEffect, useState } from 'react'
import __ from './locale'
import styles from './styles.module.less'
import { Empty, OptionBarTool, OptionMenuType, SearchInput } from '@/ui'
import { AddOutlined } from '@/icons'
import {
    BusinessDomainLevelTypes,
    IBusinessDomainItem,
    IBusinessDomainTreeParams,
    deleteBusinessDomainTreeNode,
    formatError,
    getBusinessDomainLevel,
    getBusinessDomainTree,
    getBusinessDomainTreeNodeDetails,
    BusinessAuditStatus,
    cancelBusinessAreaAudit,
    BusinessAuditType,
    getAuditProcessFromConfCenter,
} from '@/core'
import dataEmpty from '@/assets/dataEmpty.svg'
import BusinessDomainLevelIcon from '../BusinessDomainLevel/BusinessDomainLevelIcon'
import { OperateType } from '@/utils'
import CreateArchitecture from '../BusiArchitecture/CreateArchitecture'
import {
    addTreeData,
    getParentNode,
    removeNode,
    replaceNode,
} from '../BusiArchitecture'
import Confirm from '../Confirm'
import { LevelTypeNameMap } from '../BusinessDomainLevel/const'
import Details from '../BusiArchitecture/Details'
import Move from '../BusiArchitecture/Move'
import { AuditStatusTag, getDisabledTooltip } from '../BusinessAudit/helper'
import { useUserPermCtx } from '@/context/UserPermissionProvider'
import { RefreshBtn } from '../ToolbarComponents'

const BusinessArea = () => {
    const { checkPermission } = useUserPermCtx()
    const [data, setData] = useState<IBusinessDomainItem[]>([])
    const [fetching, setFetching] = useState(false)
    const [domainLevels, setDomainLevels] = useState<
        BusinessDomainLevelTypes[]
    >([])
    const [expandedRowKeys, setExpandedRowKeys] = useState<any[]>([])
    const [searchExpandedKeys, setSearchExpandedKeys] = useState<any[]>([])

    const [operateType, setOperateType] = useState<OperateType>(
        OperateType.CREATE,
    )
    const [createType, setCreateType] = useState<BusinessDomainLevelTypes>(
        BusinessDomainLevelTypes.DomainGrouping,
    )
    const [operateData, setOperateData] = useState<IBusinessDomainItem>()

    const [open, setOpen] = useState(false)
    const [delOpen, setDelOpen] = useState(false)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [moveOpen, setMoveOpen] = useState(false)

    const [searchCondition, setSearchCondition] =
        useState<IBusinessDomainTreeParams>({
            keyword: '',
            parent_id: '',
            getall: false,
            business_system: '',
            // 创建业务领域时获取所有状态的节点
            status: 'all',
        })

    const getData = async (params: IBusinessDomainTreeParams) => {
        const res = await getBusinessDomainTree(params)
        if (params.parent_id) {
            setData((prev: IBusinessDomainItem[] | undefined) =>
                addTreeData(
                    prev!,
                    params.parent_id!,
                    res.entries.map((child) => {
                        if (child.expand) {
                            return { ...child, children: [] }
                        }
                        return child
                    }),
                ),
            )
        } else {
            setData(
                res.entries.map((item) => {
                    if (item.expand) {
                        return {
                            ...item,
                            children: searchCondition.keyword ? undefined : [],
                        }
                    }
                    return item
                }),
            )
        }
    }

    // 获取业务域层级模板
    const getDomainLevel = async () => {
        try {
            const res = await getBusinessDomainLevel()
            setDomainLevels(res)
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        getDomainLevel()
    }, [])

    useEffect(() => {
        getData(searchCondition)
        setExpandedRowKeys([])
    }, [searchCondition])

    const renderEmpty = () => {
        return (
            <Spin spinning={fetching}>
                <Empty
                    desc={fetching ? undefined : __('暂无数据')}
                    iconSrc={fetching ? undefined : dataEmpty}
                />
            </Spin>
        )
    }

    const getOptionMenus = (record: IBusinessDomainItem) => {
        const level = record.path_id.split('/').length

        // 未审核
        const isUnpublished =
            record.audit_status === BusinessAuditStatus.Unpublished

        // 审核中
        const isAuditing = [
            BusinessAuditStatus.PubAuditing,
            BusinessAuditStatus.ChangeAuditing,
            BusinessAuditStatus.DeleteAuditing,
        ].includes(record?.audit_status)

        // 审核未通过
        const isAuditRejected =
            record.audit_status === BusinessAuditStatus.PubReject

        const optionMenus: any[] = [
            {
                key: OperateType.REVOCATION,
                label: __('撤回'),
                menuType: OptionMenuType.Menu,
                access: 'manageBusinessArchitecture',
            },
            {
                key: OperateType.CREATE,
                label: __('新建业务领域'),
                menuType: OptionMenuType.Menu,
                access: 'manageBusinessArchitecture',
                disabled: isAuditing || isAuditRejected || isUnpublished,
                title: isAuditing
                    ? getDisabledTooltip(__('新建'), __('审核中'))
                    : isAuditRejected
                    ? getDisabledTooltip(__('新建'), __('审核未通过'))
                    : isUnpublished
                    ? getDisabledTooltip(__('新建'), __('未审核'))
                    : undefined,
            },
            {
                key: OperateType.DETAIL,
                label: __('详情'),
                menuType: OptionMenuType.Menu,
                access: 'manageBusinessArchitecture',
            },
            {
                key: OperateType.MOVE,
                label: __('移动'),
                menuType: OptionMenuType.Menu,
                access: 'manageBusinessArchitecture',
                disabled: isAuditing || isAuditRejected || isUnpublished,
                title: isAuditing
                    ? getDisabledTooltip(__('移动'), __('审核中'))
                    : isAuditRejected
                    ? getDisabledTooltip(__('移动'), __('审核未通过'))
                    : isUnpublished
                    ? getDisabledTooltip(__('移动'), __('未审核'))
                    : undefined,
            },
            {
                key: OperateType.EDIT,
                label: __('编辑'),
                menuType: OptionMenuType.Menu,
                access: 'manageBusinessArchitecture',
                disabled: isAuditing,
                title: isAuditing
                    ? getDisabledTooltip(__('编辑'), __('审核中'))
                    : undefined,
            },
            {
                key: OperateType.DELETE,
                label: __('删除'),
                menuType: OptionMenuType.Menu,
                access: 'manageBusinessArchitecture',
                disabled: isAuditing || record?.expand,
                title: isAuditing
                    ? getDisabledTooltip(__('删除'), __('审核中'))
                    : undefined,
            },
        ]

        return optionMenus
            .filter((op) => {
                // 权限检查
                if (!checkPermission(op.access)) return false

                // 新建按钮只在下一级是业务域类型时显示
                if (
                    op.key === OperateType.CREATE &&
                    domainLevels[record.path.split('/').length] !==
                        BusinessDomainLevelTypes.Domain
                ) {
                    return false
                }

                if (
                    BusinessDomainLevelTypes.DomainGrouping === record.type &&
                    op.key === OperateType.MOVE
                ) {
                    return false
                }
                // 撤回按钮只在审核状态下显示
                if (op.key === OperateType.REVOCATION && !isAuditing)
                    return false

                return true
            })
            .map((m, i, arr) => {
                if (arr.length > 4 && i > 2) {
                    return { ...m, menuType: OptionMenuType.More }
                }
                return m
            })
    }

    const columns = [
        {
            title: __('业务领域名称'),
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            render: (_: string, record: IBusinessDomainItem) => (
                <span className={styles['name-container']}>
                    <BusinessDomainLevelIcon
                        isColored
                        type={record.type}
                        className={styles['architecture-type-icon']}
                    />
                    <span
                        title={record.name}
                        className={styles['process-name']}
                        onClick={() =>
                            handleOperate(
                                OperateType.DETAIL,
                                record,
                                BusinessDomainLevelTypes.Domain,
                            )
                        }
                    >
                        {record.name}
                    </span>
                    <AuditStatusTag record={record} />
                </span>
            ),
        },
        // {
        //     title: __('所属部门'),
        //     dataIndex: 'department_name',
        //     key: 'department_name',
        //     render: (val: string) => val || '--',
        //     ellipsis: true,
        // },
        {
            title: __('业务模型数量'),
            dataIndex: 'model_cnt',
            key: 'model_cnt',
        },
        {
            title: __('数据模型数量'),
            dataIndex: 'data_model_cnt',
            key: 'model_cnt',
        },
        {
            title: __('操作'),
            dataIndex: 'operate',
            key: 'operate',
            width: 260,
            render: (_, record) => {
                return (
                    <OptionBarTool
                        menus={getOptionMenus(record) as any[]}
                        onClick={(key, e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleOperate(
                                key as OperateType,
                                record,
                                BusinessDomainLevelTypes.Domain,
                            )
                        }}
                    />
                )
            },
        },
    ]

    const onExpand = (expanded: boolean, record: IBusinessDomainItem) => {
        const d = expanded
            ? [...expandedRowKeys, record.id]
            : expandedRowKeys.filter((item) => item !== record.id)
        setExpandedRowKeys(d)
        if (expanded && !((record.children?.length || 0) > 0)) {
            getData({
                ...searchCondition,
                parent_id: record.id,
            })
        }
    }

    /**
     * 业务域树操作统一处理方法
     * @param op 操作类型
     * @param od 操作数据
     * @param ct 创建类型
     */
    const handleOperate = (
        op: OperateType,
        od?: IBusinessDomainItem,
        ct?: BusinessDomainLevelTypes,
    ) => {
        setOperateData(od)
        setOperateType(op)
        switch (op) {
            case OperateType.CREATE:
                setOpen(true)
                if (ct) {
                    setCreateType(ct)
                } else if (od) {
                    // TODO: 根据定义的层级 来判断要创建的类型 (业务域 | 子业务域)
                } else {
                    setCreateType(BusinessDomainLevelTypes.DomainGrouping)
                }
                break
            case OperateType.EDIT:
                if (od?.type) {
                    setCreateType(od?.type)
                }
                setOpen(true)
                break
            case OperateType.DELETE:
                setDelOpen(true)
                break
            case OperateType.DETAIL:
                setDetailsOpen(true)
                break
            case OperateType.MOVE:
                setMoveOpen(true)
                break
            case OperateType.REVOCATION:
                handleRevocation(od)
                break
            default:
                break
        }
    }

    // 更新节点状态
    const updateNodeStatus = (
        nodes: IBusinessDomainItem[],
        targetId: string,
        newStatus: BusinessAuditStatus,
    ): IBusinessDomainItem[] => {
        return nodes.map((node) => {
            if (node.id === targetId) {
                // 使用展开运算符 ...node 保留节点的所有现有属性
                // 只更新 audit_status 属性为新状态
                return {
                    ...node,
                    audit_status: newStatus,
                }
            }
            if (node.children) {
                // 如果有子节点，递归处理子节点
                return {
                    ...node,
                    children: updateNodeStatus(
                        node.children,
                        targetId,
                        newStatus,
                    ),
                }
            }
            // 如果不是目标节点且没有子节点，直接返回原节点
            return node
        })
    }

    // 撤回
    const handleRevocation = async (item: any) => {
        try {
            await cancelBusinessAreaAudit(
                item?.id,
                BusinessAuditType.BusinessAreaPublish,
            )
            message.success(__('撤回成功'))

            // 根据当前审核状态决定撤回后的状态
            let newStatus = BusinessAuditStatus.Unpublished
            if (
                item?.audit_status === BusinessAuditStatus.ChangeAuditing ||
                item?.audit_status === BusinessAuditStatus.DeleteAuditing
            ) {
                newStatus = BusinessAuditStatus.Published
            }

            // 更新节点审核状态
            setData((prev) => updateNodeStatus(prev, item.id, newStatus))
        } catch (e) {
            formatError(e)
        }
    }

    const updateProecessTree = async (
        op: OperateType,
        nodeId: string,
        parentId: string,
    ) => {
        try {
            // 获取新创建节点或编辑节点的最新信息
            const res = await getBusinessDomainTreeNodeDetails(nodeId)
            if (op === OperateType.CREATE) {
                if (parentId) {
                    setData((prev: IBusinessDomainItem[] | undefined) =>
                        addTreeData(prev!, parentId!, [
                            res as IBusinessDomainItem,
                        ]),
                    )
                } else {
                    setData((prev: IBusinessDomainItem[] | undefined) => [
                        ...(prev || []),
                        res as IBusinessDomainItem,
                    ])
                }
            }
            if (op === OperateType.EDIT) {
                setData((prev) =>
                    replaceNode(prev, nodeId, res as IBusinessDomainItem),
                )
            }
        } catch (error) {
            formatError(error)
        }
    }

    const onOk = async (
        type: OperateType,
        newData: any,
        currentData?: IBusinessDomainItem,
    ) => {
        const { business_system_id } = newData

        if (type === OperateType.CREATE) {
            if (newData.id) {
                updateProecessTree(type, newData.id, currentData?.id!)
            }

            setExpandedRowKeys(
                Array.from(new Set([...expandedRowKeys, currentData?.id])),
            )
        }
        if (type === OperateType.EDIT) {
            updateProecessTree(type, newData.id, '')
        }
    }

    const handleDelete = async () => {
        if (!operateData) return
        try {
            await deleteBusinessDomainTreeNode(operateData.id)

            // 检查是否配置了删除审核流程
            const hasAuditProcess = await getAuditProcessFromConfCenter({
                audit_type: BusinessAuditType.BusinessAreaDelete,
            })

            if (
                hasAuditProcess?.total_count === 1 &&
                operateData?.published_status === 'published'
            ) {
                // 配置了删除审核流程 且 发布状态为已发布，则更新节点状态为审核中，不执行实际删除
                setData((prev) =>
                    updateNodeStatus(
                        prev,
                        operateData.id,
                        BusinessAuditStatus.DeleteAuditing,
                    ),
                )
            } else {
                message.success(__('删除成功'))
                if (data.find((item) => item.id === operateData.id)) {
                    setData(data.filter((item) => item.id !== operateData.id))
                } else {
                    const parentNode = getParentNode(data, operateData.id)
                    // 移除时父级只有一个节点，则父级展开箭头去掉
                    if (parentNode.children?.length === 1) {
                        setExpandedRowKeys(
                            expandedRowKeys.filter(
                                (key) => key !== parentNode.id,
                            ),
                        )
                    }
                    setData((prev) =>
                        removeNode(prev, parentNode?.id, operateData.id),
                    )
                }
            }
            setDelOpen(false)
        } catch (error) {
            formatError(error)
        }
    }

    const onMove = async (
        moveData: IBusinessDomainItem,
        targetData: IBusinessDomainItem,
    ) => {
        setSearchCondition({ ...searchCondition })
        setExpandedRowKeys([])
        setSearchExpandedKeys([])
    }

    return (
        <div className={styles['business-area-wrapper']}>
            <div className={styles.title}>{__('业务领域')}</div>
            <div className={styles['operate-row']}>
                <Button
                    type="primary"
                    icon={<AddOutlined />}
                    onClick={() =>
                        handleOperate(
                            OperateType.CREATE,
                            undefined,
                            BusinessDomainLevelTypes.DomainGrouping,
                        )
                    }
                >
                    {__('新建业务领域分组')}
                </Button>
                <Space size={12}>
                    <SearchInput
                        placeholder={__('搜索业务领域')}
                        value={searchCondition.keyword}
                        onKeyChange={(keyword: string) =>
                            setSearchCondition({
                                ...searchCondition,
                                keyword,
                            })
                        }
                        className={styles.searchInput}
                        style={{ width: 282 }}
                    />
                    <RefreshBtn
                        onClick={() => {
                            setSearchCondition({
                                ...searchCondition,
                                keyword: '',
                            })
                        }}
                    />
                </Space>
            </div>
            {!searchCondition.keyword && data.length === 0 ? (
                <div className={styles.emptyWrapper}>{renderEmpty()}</div>
            ) : (
                <Table
                    columns={columns}
                    expandable={{
                        expandedRowKeys: searchCondition.keyword
                            ? searchExpandedKeys
                            : expandedRowKeys,
                        indentSize: 20,
                        rowExpandable: (record) => true,
                        // searchCondition.keyword ? false : record.expand,
                    }}
                    onExpand={(
                        expanded: boolean,
                        record: IBusinessDomainItem,
                    ) => onExpand(expanded, record)}
                    dataSource={data}
                    pagination={false}
                    rowKey="id"
                    loading={fetching}
                    locale={{
                        emptyText: <Empty />,
                    }}
                    scroll={{
                        y:
                            data.length === 0
                                ? undefined
                                : 'calc(100vh - 284px)',
                    }}
                />
            )}
            <CreateArchitecture
                open={open}
                levelType={createType}
                operateType={operateType as OperateType}
                // viewMode={viewMode}
                operateData={operateData}
                onClose={() => {
                    setOpen(false)
                    setOperateData(undefined)
                }}
                onOk={onOk}
                domainLevels={domainLevels}
                quote="businessArea"
                // selectedNode={selectedNode}
            />

            <Confirm
                onOk={handleDelete}
                onCancel={() => setDelOpen(false)}
                open={delOpen}
                title={__('确认要删除${name}吗？', {
                    name: LevelTypeNameMap[
                        operateData?.type ||
                            BusinessDomainLevelTypes.DomainGrouping
                    ],
                })}
                content={__(
                    '删除后，本${name}下所有子节点将一并删除，子节点关联的业务模型在业务架构下归为未分组',
                    {
                        name: LevelTypeNameMap[
                            operateData?.type ||
                                BusinessDomainLevelTypes.DomainGrouping
                        ],
                    },
                )}
                width={432}
                okText={__('确定')}
                cancelText={__('取消')}
            />
            {operateData && (
                <Details
                    open={detailsOpen}
                    data={operateData}
                    onClose={() => setDetailsOpen(false)}
                />
            )}

            <Move
                open={moveOpen}
                data={operateData!}
                onClose={() => setMoveOpen(false)}
                domainLevels={domainLevels}
                onOk={onMove}
                isBusinessArea
            />
        </div>
    )
}

export default BusinessArea
