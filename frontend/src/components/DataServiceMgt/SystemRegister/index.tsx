import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { Button, Space, Table } from 'antd'
import { useUpdateEffect } from 'ahooks'
import { PlusOutlined } from '@ant-design/icons'
import DragBox from '../../DragBox'
import ArchitectureDirTree from '../../BusinessArchitecture/ArchitectureDirTree'
import { Architecture } from '../../BusinessArchitecture/const'
import styles from './styles.module.less'
import __ from '../locale'
import { Empty, SearchInput } from '@/ui'
import { RefreshBtn, SortBtn } from '../../ToolbarComponents'
import DropDownFilter from '../../DropDownFilter'
import { defaultMenu, defaultMenus } from './const'
import {
    formatError,
    reqInfoSystemList,
    ISystemItem,
    SortDirection,
} from '@/core'
import Register from './Register'
import Details from './Details'
import { formatTime } from '@/utils'

const SystemRegister = () => {
    const [defaultSize, setDefaultSize] = useState<Array<number>>([15, 80])
    const [selectedNode, setSelectedNode] = useState<any>({ id: '' })
    const [searchCondition, setSearchCondition] = useState<any>({
        keyword: '',
        offset: 1,
        limit: 10,
        is_register_gateway: true,
    })
    const [selectedSort, setSelectedSort] = useState<any>({
        key: 'register_at',
        sort: SortDirection.DESC,
    })
    const [tableSort, setTableSort] = useState<any>({
        register_at: 'descend',
        created_at: null,
        updated_at: null,
    })
    const [open, setOpen] = useState<boolean>(false)
    const [openDetails, setOpenDetails] = useState<boolean>(false)
    const [tableData, setTableData] = useState<ISystemItem[]>([])
    const [fetching, setFetching] = useState<boolean>(false)
    const [total, setTotal] = useState<number>(0)
    const [editData, setEditData] = useState<ISystemItem>()

    const getData = async () => {
        try {
            setFetching(true)
            const res = await reqInfoSystemList(searchCondition)
            setTableData(res.entries)
            setTotal(res.total_count)
        } catch (error) {
            formatError(error)
        } finally {
            setFetching(false)
            setSelectedSort(undefined)
        }
    }

    useEffect(() => {
        getData()
    }, [searchCondition])

    useUpdateEffect(() => {
        setSearchCondition((prev) => ({
            ...prev,
            department_id: selectedNode.id,
            offset: 1,
        }))
    }, [selectedNode])

    const handleRefresh = () => {
        setSearchCondition({ ...searchCondition, offset: 1 })
    }

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
            register_at: null,
            created_at: null,
            updated_at: null,
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
                register_at: null,
                created_at: null,
                updated_at: null,
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
            register_at: null,
            created_at: null,
            updated_at: null,
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
            title: __('信息系统名称'),
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            width: 260,
        },
        {
            title: __('所属部门'),
            dataIndex: 'department_name',
            key: 'department_name',
            ellipsis: true,
            render: (_, record) => {
                return (
                    <span title={record.department_path}>
                        {record.department_name}
                    </span>
                )
            },
        },
        {
            title: __('注册时间'),
            dataIndex: 'register_at',
            key: 'register_at',
            ellipsis: true,
            ...sortableColumn('register_at'),
            render: (time) => (time ? formatTime(time) : '-'),
        },
        {
            title: __('系统创建时间'),
            dataIndex: 'created_at',
            key: 'created_at',
            ellipsis: true,
            ...sortableColumn('created_at'),
            render: (time) => (time ? formatTime(time) : '-'),
        },
        {
            title: __('系统更新时间'),
            dataIndex: 'updated_at',
            key: 'updated_at',
            ellipsis: true,
            ...sortableColumn('updated_at'),
            render: (time) => (time ? formatTime(time) : '-'),
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
                                setOpen(true)
                                setEditData(record)
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

    return (
        <div className={styles['system-register-wrapper']}>
            <DragBox
                defaultSize={defaultSize}
                minSize={[270, 270]}
                maxSize={[800, Infinity]}
                onDragEnd={(size) => {
                    setDefaultSize(size)
                }}
            >
                <div className={styles.left}>
                    <div className={styles['left-title']}>{__('组织架构')}</div>
                    <div className={styles['left-tree-box']}>
                        <ArchitectureDirTree
                            // ref={architectureDirTreeRef}
                            getSelectedNode={(node) => {
                                if (node) {
                                    setSelectedNode(node)
                                } else {
                                    setSelectedNode({ id: '' })
                                }
                            }}
                            hiddenType={[
                                Architecture.BMATTERS,
                                Architecture.BSYSTEM,
                                Architecture.COREBUSINESS,
                            ]}
                            filterType={[
                                Architecture.ORGANIZATION,
                                Architecture.DEPARTMENT,
                            ].join(',')}
                            placeholder={__('搜索组织架构')}
                            // needUncategorized
                        />
                    </div>
                </div>
                <div className={classNames(styles.right)}>
                    <div className={styles['right-title']}>
                        {__('系统注册')}
                    </div>
                    <div className={styles['right-operate']}>
                        <Button
                            type="primary"
                            onClick={() => setOpen(true)}
                            icon={<PlusOutlined />}
                        >
                            {__('注册')}
                        </Button>
                        <Space>
                            <SearchInput
                                value={searchCondition.keyword}
                                style={{ width: 280 }}
                                placeholder={__('搜索信息系统名称')}
                                onKeyChange={(kw: string) => {
                                    setSearchCondition((prev) => ({
                                        ...prev,
                                        keyword: kw,
                                        offset: 1,
                                    }))
                                }}
                            />
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
                            <RefreshBtn onClick={handleRefresh} />
                        </Space>
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
                            y: `calc(100vh - 227px)`,
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
                </div>
            </DragBox>
            {open && (
                <Register
                    open={open}
                    onCancel={() => {
                        setOpen(false)
                        setEditData(undefined)
                    }}
                    onOk={() => handleRefresh()}
                    defaultValues={editData}
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
        </div>
    )
}

export default SystemRegister
