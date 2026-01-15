import { useEffect, useRef, useState } from 'react'
import { Button, Space, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import moment from 'moment'
import styles from './styles.module.less'
import __ from '../locale'
import { Empty } from '@/ui'
import { SortBtn } from '../../ToolbarComponents'
import DropDownFilter from '../../DropDownFilter'
import { defaultMenu, defaultMenus, getSearchFilters } from './const'
import {
    AppTypeEnum,
    formatError,
    getAppRegisterList,
    IAppRegisterListItem,
    IAppRegisterListParams,
    ISystemItem,
    reqInfoSystemList,
    SortDirection,
} from '@/core'
import Register from './Register'
import Details from './Details'
import SearchLayout from '../../SearchLayout'
import { formatTime } from '@/utils'
import IpDetails from '../GatewayAppMgt/IpDetails'

const AppRegister = () => {
    const searchFormRef: any = useRef()
    const [searchCondition, setSearchCondition] =
        useState<IAppRegisterListParams>({
            is_register_gateway: true,
            keyword: '',
            offset: 1,
            limit: 10,
        })
    const [selectedSort, setSelectedSort] = useState<any>({
        key: 'register_at',
        sort: SortDirection.DESC,
    })
    const [tableSort, setTableSort] = useState<any>({
        register_at: 'descend',
    })
    const [open, setOpen] = useState<boolean>(false)
    const [openDetails, setOpenDetails] = useState<boolean>(false)
    // 表格高度
    const [scrollY, setScrollY] = useState<string>(`calc(100vh - 227px)`)

    const [tableData, setTableData] = useState<IAppRegisterListItem[]>([])
    const [fetching, setFetching] = useState<boolean>(false)
    const [total, setTotal] = useState<number>(0)
    const [editData, setEditData] = useState<IAppRegisterListItem>()
    const [systemList, setSystemList] = useState<ISystemItem[]>([])
    const [openIpDetails, setOpenIpDetails] = useState<boolean>(false)

    const getData = async () => {
        try {
            setFetching(true)
            const res = await getAppRegisterList({
                ...searchCondition,
            })
            setTableData(res.entries)
            setTotal(res.total_count)
        } catch (error) {
            formatError(error)
        } finally {
            setFetching(false)
            setSelectedSort(undefined)
        }
    }

    const getSystems = async () => {
        try {
            const res = await reqInfoSystemList({
                limit: 2000,
                offset: 1,
            })
            setSystemList(res.entries || [])
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        getSystems()
    }, [])

    useEffect(() => {
        getData()
    }, [searchCondition])

    // 筛选顺序变化
    const handleMenuChange = (selectedMenu) => {
        setSearchCondition({
            ...searchCondition,
            sort: selectedMenu.key,
            direction: selectedMenu.sort,
            offset: 1,
        })
        onChangeMenuToTableSort(selectedMenu)
    }

    const onChangeMenuToTableSort = (selectedMenu) => {
        setTableSort({
            [selectedMenu.key]:
                selectedMenu.sort === SortDirection.ASC ? 'ascend' : 'descend',
        })
    }

    const sortableColumn = (dataIndex: string) => ({
        sorter: true,
        sortOrder: tableSort?.[dataIndex],
        showSorterTooltip: false,
        sortDirections: ['descend', 'ascend', 'descend'],
    })

    // 表格排序改变
    const handleTableChange = (sorter) => {
        if (sorter.column) {
            setTableSort({
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

    const columns: any[] = [
        {
            title: __('应用名称'),
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            width: 260,
        },
        {
            title: __('应用标识（PASSID）'),
            dataIndex: 'pass_id',
            key: 'pass_id',
            ellipsis: true,
        },
        {
            title: __('所属系统'),
            dataIndex: 'info_system_name',
            key: 'info_system_name',
            ellipsis: true,
        },
        {
            title: __('是否微应用'),
            dataIndex: 'app_type',
            key: 'app_type',
            render: (appType: AppTypeEnum) => {
                return appType === AppTypeEnum.MICRO_TYPE ? __('是') : __('否')
            },
        },
        {
            title: __('所属部门'),
            dataIndex: 'department_name',
            key: 'department_name',
            ellipsis: true,
            render: (departmentName: string, record) => {
                return (
                    <span title={record.department_path}>{departmentName}</span>
                )
            },
        },
        {
            title: __('IP及端口'),
            dataIndex: 'ip_addr',
            key: 'ip_addr',
            width: 200,
            render: (ipAddr, record) => {
                return Array.isArray(ipAddr) && ipAddr.length > 0 ? (
                    <Space size={4} className={styles['ip-addr-wrapper']}>
                        <div
                            className={styles['ip-addr']}
                            title={`${ipAddr[0].ip}:${ipAddr[0].port}`}
                        >
                            {ipAddr[0].ip}:{ipAddr[0].port}
                        </div>
                        {ipAddr.length > 1 && (
                            <div
                                className={styles['ip-addr-length']}
                                onClick={() => {
                                    setOpenIpDetails(true)
                                    setEditData(record)
                                }}
                            >
                                +{ipAddr.length - 1}
                            </div>
                        )}
                    </Space>
                ) : (
                    '--'
                )
            },
        },

        {
            title: __('注册时间'),
            dataIndex: 'register_at',
            key: 'register_at',
            ellipsis: true,
            ...sortableColumn('register_at'),
            render: (registerAt: string) => {
                return registerAt ? formatTime(registerAt) : '--'
            },
        },
        {
            title: __('操作'),
            key: 'action',
            width: 160,
            fixed: 'right',
            render: (_, record) => {
                return (
                    <Space size={10}>
                        <Button
                            type="link"
                            onClick={() => {
                                setOpenDetails(true)
                                setEditData(record)
                            }}
                        >
                            {__('详情')}
                        </Button>
                        <Button
                            type="link"
                            onClick={() => {
                                setEditData(record)
                                setOpen(true)
                            }}
                        >
                            {__('编辑')}
                        </Button>
                    </Space>
                )
            },
        },
    ]

    // 分页改变
    const onPaginationChange = (page, pageSize) => {
        setSearchCondition((prev) => ({
            ...prev,
            offset: page,
            limit: pageSize,
        }))
    }

    // 添加防抖处理
    const handleSearch = debounce((values: any) => {
        const params = {
            ...searchCondition,
            ...values,
            offset: 1,
            started_at: values.started_at
                ? moment(values.started_at).valueOf()
                : undefined,
            finished_at: values.finished_at
                ? moment(values.finished_at).valueOf()
                : undefined,
        }

        setSearchCondition(params)
    }, 300)

    // 筛选展开状态
    const handleExpansionStatus = (status: boolean) => {
        // 使用 requestAnimationFrame 延迟高度更新
        requestAnimationFrame(() => {
            setScrollY(status ? `calc(100vh - 479px)` : `calc(100vh - 227px)`)
        })
    }

    const handleRefresh = () => {
        setSearchCondition({ ...searchCondition, offset: 1 })
    }

    return (
        <div className={styles['app-register-wrapper']}>
            <div className={styles.title}>{__('应用注册')}</div>
            <div className={styles.operate}>
                <SearchLayout
                    ref={searchFormRef}
                    formData={getSearchFilters(systemList)}
                    prefixNode={
                        <Button
                            type="primary"
                            onClick={() => setOpen(true)}
                            icon={<PlusOutlined />}
                        >
                            {__('注册')}
                        </Button>
                    }
                    suffixNode={
                        <SortBtn
                            contentNode={
                                <DropDownFilter
                                    menus={defaultMenus}
                                    defaultMenu={defaultMenu}
                                    menuChangeCb={handleMenuChange}
                                    changeMenu={selectedSort}
                                />
                            }
                        />
                    }
                    onSearch={handleSearch}
                    getExpansionStatus={handleExpansionStatus}
                />
            </div>
            <Table
                columns={columns}
                dataSource={tableData}
                loading={fetching}
                rowKey="id"
                rowClassName={styles.tableRow}
                onChange={(newPagination, filters, sorter) => {
                    const selectedMenu = handleTableChange(sorter)
                    setSelectedSort(selectedMenu)
                    setSearchCondition((prev) => ({
                        ...prev,
                        sort: selectedMenu.key,
                        direction: selectedMenu.sort,
                        offset: newPagination.current,
                        limit: newPagination.pageSize,
                    }))
                }}
                scroll={{
                    x: columns.length * 182,
                    y: scrollY,
                }}
                pagination={{
                    total,
                    pageSize: searchCondition?.limit,
                    current: searchCondition?.offset,
                    showQuickJumper: true,
                    onChange: (page, pageSize) =>
                        onPaginationChange(page, pageSize),
                    showSizeChanger: true,
                    showTotal: (count) => __('共${count}条', { count }),
                }}
                locale={{ emptyText: <Empty /> }}
            />

            {open && (
                <Register
                    open={open}
                    onCancel={() => {
                        setOpen(false)
                        setEditData(undefined)
                    }}
                    onOk={() => handleRefresh()}
                    data={editData}
                />
            )}
            {openDetails && editData && (
                <Details
                    open={openDetails}
                    onCancel={() => {
                        setOpenDetails(false)
                        setEditData(undefined)
                    }}
                    data={editData}
                />
            )}

            {openIpDetails && editData && (
                <IpDetails
                    open={openIpDetails}
                    onClose={() => {
                        setOpenIpDetails(false)
                        setEditData(undefined)
                    }}
                    dataSource={editData.ip_addr}
                />
            )}
        </div>
    )
}

export default AppRegister
