import { Button, message, Space, Table, Tooltip } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ExclamationCircleFilled, InfoCircleFilled } from '@ant-design/icons'
import { useAntdTable } from 'ahooks'
import { toNumber } from 'lodash'
import moment from 'moment'
import {
    chgLicenseOnlineStatus,
    exportLicenseFile,
    formatError,
    queryLicenseList,
    SortDirection,
} from '@/core'
import { Empty, Loader } from '@/ui'
import { formatTime, OperateType, streamToFile } from '@/utils'
import { confirm } from '@/utils/modalHelper'
import { SortOrder } from '../ApplicationAuth/ApplicationAudit'
import { PolicyType } from '../AuditPolicy/const'
import { getState } from '../DatasheetView/helper'
import DragBox from '../DragBox'
import DropDownFilter from '../DropDownFilter'
import { onLineStatus } from '../ResourcesDir/const'
import { renderEmpty } from '../ResourceSharing/helper'
import SearchLayout from '../SearchLayout'
import { SortBtn } from '../ToolbarComponents'
import { allNodeInfo } from './const'
import Detail from './Detail'
import {
    defaultMenu,
    menus,
    onlineStatusList,
    searchFormInitData,
    timeStrToTimestamp,
} from './helper'
import LicenseTree from './LicenseTree'
import __ from './locale'
import styles from './styles.module.less'

const ElectronicLicense = () => {
    const [defaultSize, setDefaultSize] = useState<Array<number>>([12, 88])
    const [detailOpen, setDetailOpen] = useState(false)
    const [operateItem, setOperateItem] = useState<any>()

    // 搜索条件
    const [searchFormData, setSearchFormData] = useState(searchFormInitData)
    const [searchIsExpansion, setSearchIsExpansion] = useState<boolean>(false)
    const [init, setInit] = useState<boolean>(true)

    const searchFormRef: any = useRef()
    // 排序
    const [selectedSort, setSelectedSort] = useState<any>(defaultMenu)

    // 选中行
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
    // 同步时间
    const [lastSysncTime, setLastSysncTime] = useState<number>(0)

    const initParams = {
        keyword: '',
        offset: 1,
        limit: 10,
        sort: 'updated_at',
        classify_id: '',
        direction: SortDirection.DESC,
    }

    const [searchCondition, setSearchCondition] = useState<any>({
        ...initParams,
    })

    // 表头排序
    const [tableSort, setTableSort] = useState<{
        [key: string]: SortOrder
    }>({
        name: null,
        updated_at: 'descend',
    })

    const hasSearchCondition = useMemo(() => {
        return (
            searchCondition.keyword ||
            searchCondition.online_status ||
            searchCondition.updated_at_start
        )
    }, [searchCondition])

    useEffect(() => {
        run(searchCondition)
    }, [])

    useEffect(() => {
        if (!init) {
            run({
                ...searchCondition,
                current: searchCondition.offset,
                pageSize: searchCondition.limit,
            })
        }
    }, [searchCondition])

    // 列表项
    const columns: any = [
        {
            title: (
                <Tooltip title={__('按证照名称排序')}>{__('证照名称')}</Tooltip>
            ),
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            sortOrder: tableSort.name,
            showSorterTooltip: false,
            render: (value, record) => value || '--',
            ellipsis: true,
        },
        {
            title: __('状态'),
            dataIndex: 'online_status',
            key: 'online_status',
            ellipsis: true,
            render: (status, record) => {
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {getState(status, onlineStatusList)}
                    </div>
                )
            },
        },
        {
            title: __('行业类别'),
            dataIndex: 'industry_department',
            key: 'industry_department',
            ellipsis: true,
            render: (value: string, record: any) => {
                return value || '--'
            },
        },
        {
            title: __('管理部门'),
            dataIndex: 'department',
            key: 'department',
            ellipsis: true,
            render: (value: string, record: any) => (
                <span title={record?.department_path}>{value || '--'}</span>
            ),
        },
        {
            title: __('证件类型'),
            dataIndex: 'type',
            key: 'type',
            ellipsis: true,
            render: (value: string, record: any) => {
                return value || '--'
            },
        },
        {
            title: __('更新时间'),
            dataIndex: 'updated_at',
            key: 'updated_at',
            width: 180,
            ellipsis: true,
            sorter: true,
            sortOrder: tableSort.updated_at,
            showSorterTooltip: false,
            render: (value) => {
                return formatTime(toNumber(value)) || '--'
            },
        },
        {
            title: __('操作'),
            key: 'action',
            width: 180,
            fixed: 'right',
            render: (_, record) => {
                const { online_status } = record
                const menuList = [
                    {
                        key: OperateType.DETAIL,
                        label: __('详情'),
                    },
                    {
                        key:
                            online_status === onLineStatus.Online
                                ? OperateType.ONLINE
                                : OperateType.OFFLINE,
                        label:
                            online_status === onLineStatus.Online
                                ? __('下线')
                                : __('上线'),
                        show: [
                            onLineStatus.Online,
                            onLineStatus.Offline,
                        ].includes(online_status),
                    },
                ]
                return (
                    <Space size={16}>
                        {menuList.map((item) => (
                            <Button
                                key={item.key}
                                type="link"
                                ghost
                                style={{ padding: 0 }}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleOperate(
                                        item.key as OperateType,
                                        record,
                                    )
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Space>
                )
            },
        },
    ]

    const getListData = async (params: any) => {
        try {
            const { current, pageSize, ...rest } = params
            const res = await queryLicenseList(rest)
            setLastSysncTime(res.last_sync_time)
            return { total: res.total_count || 0, list: res.entries || [] }
        } catch (error) {
            formatError(error)
            return { total: 0, list: [] }
        } finally {
            setSelectedSort(undefined)
            setInit(false)
        }
    }

    const changeOnlineStatus = async (op: OperateType, item?: any) => {
        const toOnline = op === OperateType.OFFLINE
        try {
            confirm({
                title: (
                    <span style={{ fontWeight: 550, color: '#000' }}>
                        {toOnline ? __('确认要上线吗？') : __('确认要下线吗？')}
                    </span>
                ),
                icon: toOnline ? (
                    <InfoCircleFilled style={{ color: '#126ee3' }} />
                ) : (
                    <ExclamationCircleFilled style={{ color: '#faac14' }} />
                ),
                content: (
                    <div>
                        {toOnline
                            ? __('上线成功后，目录会上线到服务超市。')
                            : __(
                                  '下线后，若此电子证照目录被其他功能所用，也会导致其不能正常使用给，请确认操作。',
                              )}
                    </div>
                ),
                okText: __('确定'),
                cancelText: __('取消'),
                onOk: async () => {
                    await chgLicenseOnlineStatus(
                        item?.id,
                        toOnline
                            ? PolicyType.ElecLicenceOnline
                            : PolicyType.ElecLicenceOffline,
                    )
                    run(searchCondition)

                    message.success(toOnline ? __('上线成功') : __('下线成功'))
                },
            })
        } catch (e) {
            formatError(e)
        }
    }

    const handleOperate = async (op: OperateType, item?: any) => {
        setOperateItem(item)
        switch (op) {
            case OperateType.DETAIL:
                setDetailOpen(true)
                break
            case OperateType.ONLINE:
            case OperateType.OFFLINE:
                changeOnlineStatus(op, item)
                break
            case OperateType.EXPORT:
                exportLicenseList()
                break
            default:
                break
        }
    }

    // 获取选中的节点
    const getSelectedNode = (sn?: any) => {
        // if: 在树结构中操作后获取选中项 else: 在列表中操作后 选中项不变，但要更新列表及详情
        let node
        if (sn) {
            node = { ...sn }
        } else {
            node = allNodeInfo
        }
        if (sn.id !== searchCondition.industry_departments?.[0]) {
            setSearchCondition({
                ...searchCondition,
                classify_id: sn.id,
                offset: 1,
            })
        }
    }

    const { tableProps, run, pagination, loading } = useAntdTable(getListData, {
        defaultPageSize: 10,
        manual: true,
    })

    const scrollY = useMemo(() => {
        if (tableProps.dataSource?.length === 0) return undefined
        return tableProps.pagination.total <= 10
            ? `calc(100vh - 172px - ${searchIsExpansion ? 150 : 0}px)`
            : `calc(100vh - 236px - ${searchIsExpansion ? 150 : 0}px)`
    }, [
        searchIsExpansion,
        tableProps.dataSource?.length,
        tableProps.pagination.total,
    ])

    // 筛选顺序变化
    const handleMenuChange = (selectedMenu) => {
        setSearchCondition({
            ...searchCondition,
            sort: selectedMenu.key,
            direction: selectedMenu.sort,
            offset: 1,
        })
        setSelectedSort(selectedMenu)
        onChangeMenuToTableSort(selectedMenu)
    }

    const onChangeMenuToTableSort = (selectedMenu) => {
        switch (selectedMenu.key) {
            case 'name':
                setTableSort({
                    name:
                        selectedMenu.sort === SortDirection.ASC
                            ? 'ascend'
                            : 'descend',
                    createAt: null,
                    updatedAt: null,
                })
                break
            case 'updated_at':
                setTableSort({
                    name: null,
                    updatedAt:
                        selectedMenu.sort === SortDirection.ASC
                            ? 'ascend'
                            : 'descend',
                    createAt: null,
                })
                break
            default:
                setTableSort({
                    name: null,
                    updatedAt: null,
                    createAt: null,
                })
                break
        }
    }

    // 表格排序改变
    const handleTableChange = (sorter) => {
        if (sorter.column) {
            setTableSort({
                updated_at: null,
                name: null,
                [sorter.columnKey]: sorter.order || 'ascend',
            })
            return {
                key: sorter.columnKey,
                sort:
                    sorter.order === 'ascend'
                        ? SortDirection.ASC
                        : SortDirection.DESC,
            }
        }

        setTableSort({
            updated_at: null,
            name: null,
            [sorter.columnKey]:
                searchCondition.direction === SortDirection.ASC
                    ? 'descend'
                    : 'ascend',
        })
        return {
            key: searchCondition.sort,
            sort:
                searchCondition.direction === SortDirection.ASC
                    ? SortDirection.DESC
                    : SortDirection.ASC,
        }
    }

    // 通过选中id导出码表
    const exportLicenseList = async () => {
        if (!selectedRowKeys || !selectedRowKeys.length) return
        try {
            const res = await exportLicenseFile(selectedRowKeys)
            if (typeof res === 'object' && res.byteLength) {
                streamToFile(
                    res,
                    `电子证照目录_${moment(new Date()).format(
                        'YYYYMMDDHHmmss',
                    )}.xlsx`,
                )
                message.success(__('导出成功'))
            } else {
                message.error(__('导出失败'))
            }
        } catch (error: any) {
            formatError(error)
        }
    }

    return (
        <div className={styles.catlgResourceWrapper}>
            <DragBox
                defaultSize={defaultSize}
                minSize={[220, 270]}
                maxSize={[800, Infinity]}
                onDragEnd={(size) => {
                    setDefaultSize(size)
                }}
            >
                <div className={styles.left}>
                    <LicenseTree onChange={getSelectedNode} />
                </div>
                <div className={styles.right}>
                    <div className={styles.topOprWrapper}>
                        <SearchLayout
                            ref={searchFormRef}
                            prefixNode={
                                <Space size={8} align="center">
                                    <Tooltip
                                        title={
                                            selectedRowKeys?.length > 0
                                                ? __('已选择 ${num} 项', {
                                                      num: selectedRowKeys?.length,
                                                  })
                                                : __('可勾选证照导出')
                                        }
                                    >
                                        <Button
                                            type="primary"
                                            onClick={() =>
                                                handleOperate(
                                                    OperateType.EXPORT,
                                                )
                                            }
                                            disabled={!selectedRowKeys?.length}
                                        >
                                            {__('导出')}
                                        </Button>
                                    </Tooltip>
                                    {/* 后端暂不支持 */}
                                    {/* <Button
                                        onClick={() =>
                                            handleOperate(OperateType.EXPORT)
                                        }
                                        icon={
                                            <FontIcon
                                                name="icon-shujutongbu"
                                                className={styles.synchIcon}
                                            />
                                        }
                                    >
                                        {__('数据同步')}
                                    </Button> */}
                                    {/* <div className={styles.synchTime}>
                                        {__('数据同步时间：') +
                                            formatTime(lastSysncTime)}
                                    </div> */}
                                </Space>
                            }
                            suffixNode={
                                <SortBtn
                                    contentNode={
                                        <DropDownFilter
                                            menus={menus}
                                            defaultMenu={defaultMenu}
                                            menuChangeCb={handleMenuChange}
                                            changeMenu={selectedSort}
                                        />
                                    }
                                />
                            }
                            formData={searchFormData}
                            onSearch={(object, isRefresh) => {
                                const obj = timeStrToTimestamp(object)
                                // 开放方式选择无条件开放时，不能选择开放级别
                                const params = {
                                    ...searchCondition,
                                    ...obj,
                                    offset: isRefresh
                                        ? searchCondition.offset
                                        : 1,
                                }
                                setSearchCondition(params)
                            }}
                            getExpansionStatus={setSearchIsExpansion}
                        />
                    </div>
                    {loading || tableProps.dataSource === undefined ? (
                        <div style={{ marginTop: '56px' }}>
                            <Loader />
                        </div>
                    ) : tableProps.dataSource?.length ||
                      hasSearchCondition ||
                      (!tableProps.dataSource?.length &&
                          tableProps.pagination.current !== 1) ? (
                        <Table
                            rowKey="id"
                            rowSelection={{
                                type: 'checkbox',
                                selectedRowKeys,
                                onChange: (rowKeys, selectedRows) => {
                                    setSelectedRowKeys(rowKeys as string[])
                                },
                            }}
                            columns={columns}
                            {...tableProps}
                            dataSource={tableProps.dataSource}
                            scroll={{
                                x: 1000,
                                y: scrollY,
                            }}
                            pagination={{
                                ...tableProps.pagination,
                                current: searchCondition.offset,
                                pageSize: searchCondition.limit,
                                hideOnSinglePage:
                                    tableProps.pagination.total <= 10,
                                pageSizeOptions: [10, 20, 50, 100],
                                showQuickJumper: true,
                                responsive: true,
                                showLessItems: true,
                                showSizeChanger: true,
                                showTotal: (count) => {
                                    return `共 ${count} 条记录 第 ${
                                        searchCondition.offset
                                    }/${Math.ceil(
                                        count / searchCondition.limit,
                                    )} 页`
                                },
                            }}
                            bordered={false}
                            locale={{
                                emptyText: <Empty />,
                            }}
                            onChange={(newPagination, filters, sorter) => {
                                const selectedMenu = handleTableChange(sorter)
                                // setSelectedSort(selectedMenu)
                                setSearchCondition((prev) => ({
                                    ...prev,
                                    sort: selectedMenu.key,
                                    direction: selectedMenu.sort,
                                    offset: newPagination.current,
                                    limit: newPagination.pageSize,
                                }))
                            }}
                        />
                    ) : (
                        <div className={styles.emptyWrapper}>
                            {renderEmpty()}
                        </div>
                    )}
                </div>
            </DragBox>

            {/* 电子证照详情 */}
            {detailOpen && (
                <Detail
                    open={detailOpen}
                    id={operateItem?.id}
                    onCancel={() => setDetailOpen(false)}
                />
            )}
        </div>
    )
}

export default ElectronicLicense
