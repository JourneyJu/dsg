import { useAntdTable } from 'ahooks'
import { Button, message, Space, Table, Tooltip } from 'antd'
import { SortOrder } from 'antd/lib/table/interface'
import classnames from 'classnames'
import { isNumber } from 'lodash'
import moment from 'moment'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import dataEmpty from '@/assets/dataEmpty.svg'
import SearchLayout from '@/components/SearchLayout'
import { SortBtn } from '@/components/ToolbarComponents'
import {
    exportSystemOperationDetails,
    formatError,
    getSystemOperationDetailsList,
    SortDirection,
} from '@/core'
import { FontIcon } from '@/icons'
import { Loader } from '@/ui'
import Empty from '@/ui/Empty'
import { streamToFile } from '@/utils'
import DropDownFilter from '../DropDownFilter'
import { updateCycleOptions } from '../ResourcesDir/const'
import {
    defaultMenu,
    exportDataFormat,
    getPreviousQuarterRange,
    initSearchCondition,
    menus,
    timeStrToTimestamp,
} from './const'
import { systemSearchFormInitData } from './helper'
import __ from './locale'
import styles from './styles.module.less'
import WhiteListConfigModal from './WhiteListConfigModal'

const SystemOperationDetails = () => {
    const searchFormRef: any = useRef()

    const [loading, setLoading] = useState<boolean>(true)
    // 创建表头排序
    const [tableSort, setTableSort] = useState<{
        [key: string]: SortOrder
    }>({
        name: null,
        acceptanceAt: 'descend',
    })

    // 排序
    const [selectedSort, setSelectedSort] = useState<any>(defaultMenu)

    const [searchCondition, setSearchCondition] =
        useState<any>(initSearchCondition)
    const [searchIsExpansion, setSearchIsExpansion] = useState<boolean>(false)
    const [whiteOpen, setWhiteOpen] = useState<boolean>(false)
    const [exportLoading, setExportLoading] = useState<boolean>(false)
    const [tableHeight, setTableHeight] = useState<number>(0)
    const [initSearch, setInitSearch] = useState<boolean>(true)
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
    const [selectedRows, setSelectedRows] = useState<any[]>([])
    const [searchFormData, setSearchFormData] = useState(
        systemSearchFormInitData,
    )
    const [currentData, setCurrentData] = useState<any>({})

    const hasSearchCondition = useMemo(() => {
        return (
            searchCondition.department_id ||
            searchCondition.info_system_id ||
            searchCondition.is_whitelisted !== undefined ||
            searchCondition.acceptance_start
        )
    }, [searchCondition])

    useEffect(() => {
        // 展开/收起查询条件高度
        const defalutHeight: number = !searchIsExpansion ? 276 : 384
        // 已选搜索条件高度
        const searchConditionHeight: number = hasSearchCondition ? 41 : 0
        const height = defalutHeight + searchConditionHeight

        setTableHeight(height)
    }, [hasSearchCondition, searchIsExpansion])

    useEffect(() => {
        run(searchCondition)
    }, [])

    useEffect(() => {
        if (searchFormRef?.current) {
            const [start, end] = getPreviousQuarterRange()
            searchFormRef?.current?.changeFormValues({
                queryTime: getPreviousQuarterRange(),
                start_date: start,
                end_date: end,
            })
        }
    }, [searchFormRef])

    useEffect(() => {
        if (!initSearch) {
            run(searchCondition)
        }
    }, [searchCondition])

    // 自定义 rowSelection 的 getCheckboxProps
    const rowSelection = {
        selectedRowKeys,
        onSelect: (record, selected, selcRows) => {
            setSelectedRowKeys(selcRows?.map((o) => o.id))
            setSelectedRows(selcRows)
        },
        onSelectAll: (selected, selcRows) => {
            setSelectedRowKeys(selcRows?.map((o) => o.id))
            setSelectedRows(selcRows)
        },
    }

    // 获取目录列表
    const getCatlgList = async (params) => {
        try {
            setLoading(true)
            const { current, pageSize, sort, direction, ...rest } = params
            const obj = { ...rest, offset: current, limit: pageSize }
            const res = await getSystemOperationDetailsList(obj)
            return {
                total: res.total_count,
                list: res.entries?.map((o) => ({
                    ...o,
                    id: uuidv4(),
                })),
            }
        } catch (error) {
            formatError(error)
            return {
                total: 0,
                list: [],
            }
        } finally {
            setLoading(false)
            setSelectedSort(undefined)
            setInitSearch(false)
        }
    }

    const { tableProps, run, pagination } = useAntdTable(getCatlgList, {
        defaultPageSize: 10,
        manual: true,
    })

    // 表格排序改变
    const handleTableChange = (sorter) => {
        if (sorter.column) {
            if (sorter.columnKey === 'acceptance_time') {
                setTableSort({
                    acceptanceAt: sorter.order || 'descend',
                })
            }
            return {
                key:
                    sorter.columnKey === 'acceptance_time'
                        ? 'updated_at'
                        : sorter.columnKey,
                sort:
                    sorter.order === 'ascend'
                        ? SortDirection.ASC
                        : SortDirection.DESC,
            }
        }
        if (searchCondition.sort === 'updated_at') {
            setTableSort({
                acceptanceAt:
                    searchCondition.direction === SortDirection.ASC
                        ? 'descend'
                        : 'ascend',
            })
        }
        return {
            key:
                sorter.columnKey === 'acceptance_time'
                    ? 'updated_at'
                    : searchCondition.sort,
            sort:
                searchCondition.direction === SortDirection.ASC
                    ? SortDirection.DESC
                    : SortDirection.ASC,
        }
    }

    const columns: any = [
        {
            title: __('单位名称'),
            dataIndex: 'organization_name',
            key: 'organization_name',
            ellipsis: true,
            fixed: 'left',
            width: 140,
            render: (text, record) => text || '--',
        },
        {
            title: __('系统名称'),
            dataIndex: 'system_name',
            key: 'system_name',
            ellipsis: true,
            fixed: 'left',
            width: 120,
            render: (text, record) => text || '--',
        },
        {
            title: __('表名称'),
            dataIndex: 'table_name',
            key: 'table_name',
            ellipsis: true,
            width: 120,
            render: (text, record) => text || '--',
        },
        {
            title: __('表中文注释'),
            dataIndex: 'table_comment',
            key: 'table_comment',
            ellipsis: true,
            width: 120,
            render: (text, record) => text || '--',
        },
        {
            title: __('验收时间'),
            dataIndex: 'acceptance_time',
            key: 'acceptance_time',
            ellipsis: true,
            sorter: true,
            sortOrder: tableSort.acceptanceAt,
            // showSorterTooltip: false,
            showSorterTooltip: {
                title: __('按验收时间排序'),
                placement: 'bottom',
                overlayInnerStyle: {
                    color: '#fff',
                },
            },
            render: (text: any) => {
                return text && isNumber(text)
                    ? moment(text).format('YYYY-MM-DD')
                    : '--'
            },
            // fixed: 'left',
            width: 140,
        },
        {
            title: __('首次归集时间'),
            dataIndex: 'first_aggregation_time',
            key: 'first_aggregation_time',
            ellipsis: true,
            // sorter: true,
            // sortOrder: tableSort.aggregationAt,
            // showSorterTooltip: false,
            // showSorterTooltip: {
            //     title: __('按验收时间排序'),
            //     placement: 'bottom',
            //     overlayInnerStyle: {
            //         color: '#fff',
            //     },
            // },
            render: (text: any) => {
                return text && isNumber(text)
                    ? moment(text).format('YYYY-MM-DD')
                    : '--'
            },
            width: 140,
        },
        {
            title: __('更新频率'),
            dataIndex: 'update_cycle',
            key: 'update_cycle',
            ellipsis: true,
            width: 100,
            render: (text, record) =>
                updateCycleOptions.find((item) => item.value === text)?.label ||
                '--',
        },
        {
            title: __('字段数'),
            dataIndex: 'field_count',
            key: 'field_count',
            ellipsis: true,
            width: 120,
        },
        {
            title: __('最新数据量'),
            dataIndex: 'latest_data_count',
            key: 'latest_data_count',
            ellipsis: true,
            width: 120,
        },
        {
            title: __('更新次数'),
            dataIndex: 'update_count',
            key: 'update_count',
            ellipsis: true,
            width: 100,
        },
        {
            title: __('应更新次数'),
            dataIndex: 'expected_update_count',
            key: 'expected_update_count',
            ellipsis: true,
            width: 120,
        },
        {
            title: __('数据更新及时性'),
            dataIndex: 'update_timeliness',
            key: 'update_timeliness',
            ellipsis: true,
            width: 160,
            render: (text, record) => `${text}%`,
        },
        {
            title: __('是否正常更新'),
            dataIndex: 'is_updated_normally',
            key: 'is_updated_normally',
            ellipsis: true,
            width: 120,
            render: (text, record) => (text ? __('是') : __('否')),
        },
        {
            title: __('是否存在质量问题'),
            dataIndex: 'has_quality_issue',
            key: 'has_quality_issue',
            ellipsis: true,
            width: 160,
            render: (text, record) => (text ? __('是') : __('否')),
        },
        {
            title: __('问题备注'),
            dataIndex: 'issue_remark',
            key: 'issue_remark',
            ellipsis: true,
            width: 200,
            render: (text, record) => text || '--',
        },
        {
            title: __('是否白名单'),
            dataIndex: 'is_whitelisted',
            key: 'is_whitelisted',
            ellipsis: true,
            width: 120,
            fixed: 'right',
            render: (text, record) => (text ? __('是') : __('否')),
        },
        {
            title: __('白名单类型'),
            dataIndex: 'whitelist_type',
            key: 'whitelist_type',
            ellipsis: true,
            width: 200,
            fixed: 'right',
            render: (text, record) => {
                const list: string[] = []
                if (record.data_update) {
                    list.push(__('数据更新白名单'))
                }
                if (record.quality_check) {
                    list.push(__('质量检测白名单'))
                }
                return list.join('、')
            },
        },
        {
            title: __('操作'),
            dataIndex: 'operation',
            width: 120,
            fixed: 'right',
            render: (text, record) => {
                return (
                    <a
                        onClick={() => {
                            setCurrentData(record)
                            setWhiteOpen(true)
                        }}
                    >
                        {__('白名单设置')}
                    </a>
                )
            },
        },
    ]

    // 筛选顺序变化
    const handleMenuChange = (selectedMenu) => {
        setSearchCondition({
            ...searchCondition,
            sort: selectedMenu.key,
            direction: selectedMenu.sort,
            current: 1,
        })
        setSelectedSort(selectedMenu)
        onChangeMenuToTableSort(selectedMenu)
    }

    const onChangeMenuToTableSort = (selectedMenu) => {
        switch (selectedMenu.key) {
            case 'updated_at':
                setTableSort({
                    aggregationAt: null,
                    acceptanceAt:
                        selectedMenu.sort === SortDirection.ASC
                            ? 'ascend'
                            : 'descend',
                })
                break
            case 'first_aggregation_time':
                setTableSort({
                    acceptanceAt: null,
                    aggregationAt:
                        selectedMenu.sort === SortDirection.ASC
                            ? 'ascend'
                            : 'descend',
                })
                break
            default:
                setTableSort({
                    aggregationAt: null,
                    acceptanceAt: null,
                })
                break
        }
    }

    const renderEmpty = () => {
        return <Empty desc={__('暂无数据')} iconSrc={dataEmpty} />
    }

    const toExport = async (exportAll?: boolean) => {
        if (!selectedRows?.length && !exportAll) {
            message.error(__('请选择要导出的数据'))
            return
        }
        try {
            setExportLoading(true)
            const st = moment(searchCondition.start_date).format('YYYY-MM-DD')
            const et = moment(searchCondition.end_date).format('YYYY-MM-DD')
            const file_name = `${st}~${et}系统运行明细`
            const obj: any = {
                file_name,
                data: exportAll
                    ? undefined
                    : exportDataFormat(
                          selectedRows,
                          ['acceptance_time', 'first_aggregation_time'],
                          {
                              update_cycle: updateCycleOptions,
                          },
                      ),
            }
            if (exportAll) {
                obj.start_date = searchCondition.start_date
                obj.end_date = searchCondition.end_date
            }
            const res = await exportSystemOperationDetails(obj)
            streamToFile(res, `${file_name}.xlsx`)
            message.success(__('导出成功'))
        } catch (error) {
            formatError(error)
        } finally {
            setExportLoading(false)
        }
    }

    return (
        <div className={styles.systemOperationDetailsWrapper}>
            <div className={styles.top}>
                <SearchLayout
                    ref={searchFormRef}
                    prefixNode={
                        <Space size={16} className={styles.btnBox}>
                            <Tooltip
                                title={
                                    !selectedRows?.length
                                        ? __('请选择要导出的数据')
                                        : ''
                                }
                            >
                                <Button
                                    type="primary"
                                    disabled={!selectedRows?.length}
                                    onClick={() => toExport()}
                                    icon={
                                        <FontIcon
                                            name="icon-daochu"
                                            style={{ marginRight: '4px' }}
                                        />
                                    }
                                >
                                    {__('批量导出')}
                                </Button>
                            </Tooltip>
                            <Button
                                onClick={() => toExport(true)}
                                loading={exportLoading}
                                icon={
                                    <FontIcon
                                        name="icon-daochu"
                                        style={{ marginRight: '4px' }}
                                    />
                                }
                            >
                                {__('全部导出')}
                            </Button>
                            {exportLoading && (
                                <span>{__('导出中，其耐心等待...')}</span>
                            )}
                        </Space>
                    }
                    formData={searchFormData}
                    onSearch={(object, isRefresh) => {
                        const obj = timeStrToTimestamp(object)
                        const params = {
                            ...searchCondition,
                            ...obj,
                            current: isRefresh ? searchCondition.current : 1,
                        }
                        if (!object.start_date || !object.end_date) {
                            const [start, end] = getPreviousQuarterRange()
                            searchFormRef?.current?.changeFormValues({
                                queryTime: getPreviousQuarterRange(),
                                start_date: start,
                                end_date: end,
                            })
                            params.start_date = start.valueOf()
                            params.end_date = end.valueOf()
                        }
                        if (object.is_whitelisted) {
                            params.is_whitelisted = object.is_whitelisted === 1
                        }
                        if (object.info_system_id) {
                            params.info_system_id = object.info_system_id.join()
                        }
                        setSearchCondition(params)
                    }}
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
                    getExpansionStatus={setSearchIsExpansion}
                />
            </div>
            {loading ? (
                <Loader />
            ) : (
                <div className={styles.bottom}>
                    {tableProps.dataSource.length === 0 &&
                    !hasSearchCondition ? (
                        <div className={styles.emptyWrapper}>
                            {renderEmpty()}
                        </div>
                    ) : (
                        <Table
                            className={classnames(
                                !searchIsExpansion && styles.isExpansion,
                            )}
                            rowClassName={styles.tableRow}
                            columns={columns}
                            {...tableProps}
                            rowKey="id"
                            rowSelection={rowSelection}
                            scroll={{
                                y:
                                    tableProps.dataSource.length === 0
                                        ? undefined
                                        : `calc(100vh - ${tableHeight}px)`,
                                x: 1200,
                            }}
                            pagination={{
                                ...tableProps.pagination,
                                pageSizeOptions: [10, 20, 50, 100],
                                hideOnSinglePage:
                                    tableProps.pagination.total <= 10,
                                showQuickJumper: true,
                                responsive: true,
                                showLessItems: true,
                                showSizeChanger: true,
                                showTotal: (count) =>
                                    __('共${count}条', { count }),
                            }}
                            bordered={false}
                            locale={{
                                emptyText: <Empty />,
                            }}
                            onChange={(newPagination, filters, sorter) => {
                                const selectedMenu = handleTableChange(sorter)
                                setSelectedSort(selectedMenu)
                                setSearchCondition((prev) => ({
                                    ...prev,
                                    sort: selectedMenu.key,
                                    direction: selectedMenu.sort,
                                    current: newPagination.current || 1,
                                    pageSize: newPagination.pageSize || 0,
                                }))
                            }}
                        />
                    )}
                </div>
            )}
            {whiteOpen && (
                <WhiteListConfigModal
                    open={whiteOpen}
                    item={currentData}
                    onClose={() => setWhiteOpen(false)}
                    onSure={() => {
                        setWhiteOpen(false)
                        run(searchCondition)
                    }}
                />
            )}
        </div>
    )
}

export default SystemOperationDetails
