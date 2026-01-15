import { Table, message } from 'antd'

import { useUpdateEffect } from 'ahooks'
import classnames from 'classnames'
import { debounce, omit } from 'lodash'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    IGetApiSubListResponse,
    SortDirection,
    SystemAccessStatus,
    formatError,
    getApiSubList,
    getAppRegisterList,
    putApiSubStatus,
    reqInfoSystemList,
} from '@/core'
import { Empty, OptionBarTool } from '@/ui'
import { formatTime } from '@/utils'
import { confirm } from '@/utils/modalHelper'
import DropDownFilter from '../DropDownFilter'
import SearchLayout from '../SearchLayout'
import { SortBtn } from '../ToolbarComponents'
import {
    TabOperate,
    allOptionMenus,
    defaultMenu,
    initSearch,
    searchFormInitData,
    sortMenus,
} from './const'
import {
    ExpireDateView,
    IpView,
    StatusView,
    renderEmpty,
    renderLoader,
    timeStrToTimestamp,
} from './helper'
import __ from './locale'
import SystemAccessDetail from './operate/Details'
import SystemAccessEdit from './operate/Edit'
import styles from './styles.module.less'

const SystemTable: React.FC = (): React.ReactElement => {
    const searchFormRef: any = useRef()
    // 搜索条件
    const [searchCondition, setSearchCondition] = useState<any>({})
    // 表头排序
    const [tableSort, setTableSort] = useState<any>({
        created_at: 'desc',
        enable_disable_at: null,
    })
    // 下拉排序
    const [selectedSort, setSelectedSort] = useState<any>(defaultMenu)

    // load
    const [loading, setLoading] = useState<boolean>(true)
    const [fetching, setFetching] = useState<boolean>(true)

    // 表格数据
    const [tableData, setTableData] = useState<IGetApiSubListResponse[]>([])
    // 总条数
    const [total, setTotal] = useState<number>(0)
    // 当前操作项
    const [operateItem, setOperateItem] = useState<IGetApiSubListResponse>()
    // 表格高度
    const [scrollY, setScrollY] = useState<string>(`calc(100vh - 270px)`)

    // 接入系统选项
    const [accessSystemOptions, setAccessSystemOptions] = useState<any[]>([])
    // 接入应用选项
    const [accessAppOptions, setAccessAppOptions] = useState<any[]>([])

    // 详情
    const [showDetails, setShowDetails] = useState(false)
    // 编辑
    const [showEdit, setShowEdit] = useState(false)

    useEffect(() => {
        setSearchCondition(initSearch)
    }, [])

    // 是否有过滤值
    const isSearchStatus = useMemo(() => {
        const ignoreAttr = [
            'offset',
            'limit',
            'sort',
            'direction',
            'keyword',
            'org_code',
            'status',
            'create_time',
            'apply_org_code',
            'system_id',
            'app_id',
        ]
        return Object.values(omit(searchCondition, ignoreAttr))?.some(
            (item) => item,
        )
    }, [searchCondition])

    // 根据条件请求数据
    useUpdateEffect(() => {
        if (searchCondition) {
            getTableList({ ...searchCondition })
        }
    }, [searchCondition])

    // 获取表格数据
    const getTableList = async (params: any) => {
        try {
            setFetching(true)
            const res = await getApiSubList(params)

            setTableData(res?.entries || [])
            setTotal(res?.total_count || 0)
        } catch (error) {
            formatError(error)
        } finally {
            setFetching(false)
            setLoading(false)
            setSelectedSort(undefined)
        }
    }

    // 获取停用/启用内容
    const getContent = (record: any) => {
        return __('应用名称：${name}', {
            name: record?.app_name,
        })
    }

    // 刷新
    const handleRefresh = (refresh: boolean = true) => {
        setSearchCondition((prevCondition) => ({
            ...prevCondition,
            offset: refresh ? 1 : prevCondition.offset,
        }))
    }

    // 停用
    const handleDisable = (record: any) => {
        return confirm({
            title: __('是否停止该应用对接口的访问服务？'),
            content: getContent(record),
            onOk: async () => {
                try {
                    await putApiSubStatus(
                        record.id,
                        SystemAccessStatus.Disabled,
                    )
                    message.success(__('已停用服务'))
                    handleRefresh(false)
                } catch (error) {
                    formatError(error)
                }
            },
        })
    }

    // 启用
    const handleEnable = (record: any) => {
        return confirm({
            title: __('是否启用该应用对接口的访问服务？'),
            content: getContent(record),
            onOk: async () => {
                try {
                    await putApiSubStatus(record.id, SystemAccessStatus.Enabled)
                    message.success(__('已启用服务'))
                    handleRefresh(false)
                } catch (error) {
                    formatError(error)
                }
            },
        })
    }

    // 表格操作事件
    const handleOptionTable = (key: string, record) => {
        setOperateItem(record)
        switch (key) {
            // 编辑申请
            case TabOperate.Edit:
                setShowEdit(true)
                break

            // 详情
            case TabOperate.Detail:
                setShowDetails(true)
                break

            // 停用
            case TabOperate.Disable:
                handleDisable(record)
                break

            // 启用
            case TabOperate.Enable:
                handleEnable(record)
                break

            default:
        }
    }

    // 获取操作选项
    const getOperateOptions = (record: any): any[] => {
        const { status } = record

        let defaultOperations = [TabOperate.Detail, TabOperate.Edit]

        if (status === SystemAccessStatus.Enabled) {
            defaultOperations = [...defaultOperations, TabOperate.Disable]
        } else if (status === SystemAccessStatus.Disabled) {
            defaultOperations = [...defaultOperations, TabOperate.Enable]
        }

        // 从 allOptionMenus 中筛选出对应的菜单项
        return allOptionMenus.filter((menu) =>
            defaultOperations.includes(menu.key),
        )
    }

    const columns: any = useMemo(() => {
        const cols = [
            {
                title: __('服务名称'),
                dataIndex: 'api_name',
                key: 'api_name',
                ellipsis: true,
                render: (value, record) => value || '--',
            },
            {
                title: __('服务所属部门'),
                dataIndex: 'org_name',
                key: 'org_name',
                ellipsis: true,
                render: (value, record) => (
                    <span title={record.org_path}>{value}</span>
                ),
            },
            {
                title: __('接入部门'),
                dataIndex: 'apply_org_name',
                key: 'apply_org_name',
                ellipsis: true,
                render: (value, record) => (
                    <span title={record.apply_org_path}>{value}</span>
                ),
            },
            {
                title: __('接入系统'),
                dataIndex: 'system_name',
                key: 'system_name',
                ellipsis: true,
                render: (value, record) => value || '--',
            },
            {
                title: __('接入应用'),
                dataIndex: 'app_name',
                key: 'app_name',
                ellipsis: true,
                render: (value, record) => value || '--',
            },
            {
                title: __('接入IP及端口'),
                dataIndex: 'ip_addr',
                key: 'ip_addr',
                ellipsis: true,
                render: (value, record) => <IpView record={record} />,
            },
            {
                title: __('接入时间'),
                dataIndex: 'created_at',
                key: 'created_at',
                sorter: true,
                sortOrder: tableSort?.created_at,
                showSorterTooltip: false,
                sortDirections: ['descend', 'ascend', 'descend'],
                width: 180,
                ellipsis: true,
                render: (val: number) => (val ? formatTime(val) : '--'),
            },
            {
                title: __('最新启用/停用时间'),
                dataIndex: 'enable_disable_at',
                key: 'enable_disable_at',
                sorter: true,
                sortOrder: tableSort?.enable_disable_at,
                showSorterTooltip: false,
                sortDirections: ['descend', 'ascend', 'descend'],
                width: 180,
                ellipsis: true,
                render: (val: number, record) => (val ? formatTime(val) : '--'),
            },
            {
                title: __('使用期限'),
                dataIndex: 'start_at',
                key: 'start_at',
                width: 220,
                ellipsis: true,
                render: (value, record) => <ExpireDateView record={record} />,
            },
            {
                title: __('状态'),
                dataIndex: 'status',
                key: 'status',
                ellipsis: true,
                render: (value, record) => {
                    return <StatusView record={record} />
                },
            },
            {
                title: __('操作'),
                key: 'action',
                width: 160,
                fixed: 'right',
                render: (_, record) => {
                    return (
                        <OptionBarTool
                            menus={getOperateOptions(record) as any[]}
                            onClick={(key, e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleOptionTable(key, record)
                            }}
                        />
                    )
                },
            },
        ]

        return cols
    }, [tableSort, searchCondition])

    // 筛选顺序变化
    const onChangeMenuToTableSort = (selectedMenu) => {
        const newSort: any = {
            created_at: null,
            enable_disable_at: null,
        }

        const key = selectedMenu?.key
        newSort[key] =
            selectedMenu.sort === SortDirection.DESC ? 'descend' : 'ascend'

        setTableSort(newSort)

        return {
            key,
            sort: selectedMenu?.sort,
        }
    }

    // 筛选顺序变化
    const handleMenuChange = (selectedMenu: any) => {
        setSearchCondition((prev) => ({
            ...prev,
            sort: selectedMenu.key,
            direction: selectedMenu.sort,
            offset: 1,
        }))
        onChangeMenuToTableSort(selectedMenu)
    }

    // 表格排序改变
    const onTableChange = (sorter) => {
        const newSort = {
            created_at: null,
            enable_disable_at: null,
        }

        if (sorter.column) {
            const key = sorter.columnKey
            newSort[key] = sorter.order || 'ascend'
        }

        setTableSort(newSort)

        return {
            key: sorter?.columnKey,
            sort:
                sorter?.order === 'ascend'
                    ? SortDirection.ASC
                    : SortDirection.DESC,
        }
    }

    // 表格排序改变
    const handleTableChange = (currentPagination, filters, sorter, extra) => {
        const selectedMenu = onTableChange(sorter)
        setSearchCondition((prev) => ({
            ...prev,
            sort: selectedMenu.key,
            direction: selectedMenu.sort,
            offset: currentPagination?.current || 1,
            limit: currentPagination?.pageSize || 10,
        }))

        // 同步 SortBtn 的选中项
        if (selectedMenu.key) {
            setSelectedSort({
                key: selectedMenu.key,
                sort: selectedMenu.sort,
            })
        } else {
            setSelectedSort(defaultMenu)
        }
    }

    // 筛选展开状态
    const handleExpansionStatus = (status: boolean) => {
        // 使用 requestAnimationFrame 延迟高度更新
        requestAnimationFrame(() => {
            setScrollY(status ? `calc(100vh - 500px)` : 'calc(100vh - 270px)')
        })
    }

    // 添加防抖处理
    const handleSearch = debounce((values: any) => {
        const obj = timeStrToTimestamp(values)
        const params = {
            ...searchCondition,
            ...obj,
            offset: 1,
        }

        setSearchCondition(params)
    }, 300)

    // 获取接入系统选项
    const loadAccessSystemOptions = async (keyword?: string) => {
        try {
            const res = await reqInfoSystemList({
                is_register_gateway: true,
                offset: 1,
                limit: 2000,
                keyword: keyword || '',
            })
            setAccessSystemOptions(res?.entries || [])
        } catch (error) {
            formatError(error)
        }
    }

    // 获取接入应用选项
    const loadAccessAppOptions = async (keyword?: string) => {
        try {
            const res = await getAppRegisterList({
                is_register_gateway: true,
                offset: 1,
                limit: 2000,
                keyword: keyword || '',
            })
            setAccessAppOptions(res?.entries || [])
        } catch (error) {
            formatError(error)
        }
    }

    // 防抖版本的搜索函数
    const debouncedLoadAccessSystemOptions = useMemo(
        () => debounce(loadAccessSystemOptions, 300),
        [],
    )

    const debouncedLoadAccessAppOptions = useMemo(
        () => debounce(loadAccessAppOptions, 300),
        [],
    )

    // 动态生成搜索表单配置
    const searchFormData = useMemo(() => {
        return searchFormInitData.map((item) => {
            if (item.key === 'system_id') {
                return {
                    ...item,
                    itemProps: {
                        ...item.itemProps,
                        options: accessSystemOptions,
                        onFocus: () => debouncedLoadAccessSystemOptions(),
                        onSearch: (keyword) =>
                            debouncedLoadAccessSystemOptions(keyword),
                        showSearch: true,
                        filterOption: false,
                    },
                }
            }
            if (item.key === 'app_id') {
                return {
                    ...item,
                    itemProps: {
                        ...item.itemProps,
                        options: accessAppOptions,
                        onFocus: () => debouncedLoadAccessAppOptions(),
                        onSearch: (keyword) =>
                            debouncedLoadAccessAppOptions(keyword),
                        showSearch: true,
                        filterOption: false,
                    },
                }
            }
            return item
        })
    }, [accessSystemOptions, accessAppOptions])

    // 获取顶部操作区域
    const getTopOperate = () => {
        return (
            <>
                <div className={styles.top}> {__('系统接入')}</div>
                <SearchLayout
                    ref={searchFormRef}
                    formData={searchFormData}
                    onSearch={handleSearch}
                    suffixNode={
                        <SortBtn
                            contentNode={
                                <DropDownFilter
                                    menus={sortMenus}
                                    defaultMenu={defaultMenu}
                                    menuChangeCb={handleMenuChange}
                                    changeMenu={selectedSort}
                                />
                            }
                        />
                    }
                    getExpansionStatus={handleExpansionStatus}
                />
            </>
        )
    }

    return (
        <div className={classnames(styles.systemAccessTable)}>
            {loading ? (
                renderLoader()
            ) : (
                <>
                    {getTopOperate()}
                    {tableData.length === 0 && !isSearchStatus ? (
                        renderEmpty()
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            loading={fetching}
                            rowKey="id"
                            onChange={handleTableChange}
                            scroll={{ x: columns.length * 182, y: scrollY }}
                            pagination={{
                                total,
                                pageSize: searchCondition?.limit,
                                current: searchCondition?.offset,
                                showQuickJumper: true,
                                showSizeChanger: true,
                                showTotal: (count) =>
                                    __('共${count}条', { count }),
                            }}
                            locale={{ emptyText: <Empty /> }}
                        />
                    )}
                </>
            )}
            {showDetails && operateItem && (
                <SystemAccessDetail
                    open={showDetails}
                    item={operateItem}
                    onDetailsClose={() => setShowDetails(false)}
                />
            )}
            {showEdit && operateItem && (
                <SystemAccessEdit
                    open={showEdit}
                    item={operateItem}
                    onCancel={() => setShowEdit(false)}
                    onSuccess={() => {
                        setShowEdit(false)
                        setSearchCondition((prev) => ({
                            ...prev,
                            offset: 1,
                        }))
                    }}
                />
            )}
        </div>
    )
}

export default SystemTable
