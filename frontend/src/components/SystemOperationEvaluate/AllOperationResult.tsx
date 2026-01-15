import { useAntdTable } from 'ahooks'
import { Button, message, Space, Table, Tooltip } from 'antd'
import { v4 as uuidv4 } from 'uuid'
import { SortOrder } from 'antd/lib/table/interface'
import classnames from 'classnames'
import { isNumber } from 'lodash'
import moment from 'moment'
import { useEffect, useMemo, useRef, useState } from 'react'
import dataEmpty from '@/assets/dataEmpty.svg'
import SearchLayout from '@/components/SearchLayout'
import { SortBtn } from '@/components/ToolbarComponents'
import {
    exportSystemOperation,
    formatError,
    getSystemOperationList,
    SortDirection,
} from '@/core'
import { FontIcon } from '@/icons'
import { Loader } from '@/ui'
import Empty from '@/ui/Empty'
import { streamToFile } from '@/utils'
import DropDownFilter from '../DropDownFilter'
import {
    defaultMenu,
    exportDataFormat,
    getPreviousQuarterRange,
    initSearchCondition,
    menus,
    timeStrToTimestamp,
} from './const'
import { cardLabel, searchFormInitData } from './helper'
import __ from './locale'
import styles from './styles.module.less'

const AllOperationResult = () => {
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
    const [exportLoading, setExportLoading] = useState<boolean>(false)
    const [tableHeight, setTableHeight] = useState<number>(0)
    const [initSearch, setInitSearch] = useState<boolean>(true)
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
    const [selectedRows, setSelectedRows] = useState<any[]>([])
    const [searchFormData, setSearchFormData] = useState(searchFormInitData)

    const hasSearchCondition = useMemo(() => {
        return (
            searchCondition.construction_unit ||
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
            const res = await getSystemOperationList(obj)
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
            title: __('项目名称'),
            dataIndex: 'project_name',
            key: 'project_name',
            ellipsis: true,
            fixed: 'left',
            width: 140,
            render: (text, record) => text || '--',
        },
        {
            title: __('项目建设单位'),
            dataIndex: 'construction_unit',
            key: 'construction_unit',
            ellipsis: true,
            fixed: 'left',
            width: 140,
            render: (text, record) => text || '--',
        },
        {
            title: __('子系统名称'),
            dataIndex: 'subsystem_name',
            key: 'subsystem_name',
            ellipsis: true,
            width: 140,
        },
        {
            title: __('验收时间'),
            dataIndex: 'acceptance_time',
            key: 'acceptance_time',
            ellipsis: true,
            sorter: true,
            sortOrder: tableSort.acceptanceAt,
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
            width: 140,
        },
        {
            title: __('归集表数量'),
            dataIndex: 'aggregation_table_count',
            key: 'aggregation_table_count',
            ellipsis: true,
            width: 120,
        },
        {
            title: __('整体更新及时率'),
            dataIndex: 'overall_update_timeliness',
            key: 'overall_update_timeliness',
            ellipsis: true,
            width: 120,
            render: (text, record) => `${text}%`,
        },
        {
            title: __('数据质量情况'),
            dataIndex: 'data_quality_situation',
            key: 'data_quality_situation',
            ellipsis: true,
            width: 160,
        },
        {
            title: __('情况汇总'),
            dataIndex: 'summary',
            key: 'summary',
            ellipsis: true,
            width: 160,
        },
        {
            title: __('给牌建议'),
            dataIndex: 'award_suggestion',
            key: 'award_suggestion',
            ellipsis: true,
            width: 100,
            fixed: 'right',
            render: (text) => cardLabel(text),
        },
        {
            title: __('给牌理由'),
            dataIndex: 'award_reason',
            key: 'award_reason',
            ellipsis: true,
            width: 200,
            fixed: 'right',
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
                    acceptanceAt:
                        selectedMenu.sort === SortDirection.ASC
                            ? 'ascend'
                            : 'descend',
                })
                break
            default:
                setTableSort({
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
            const file_name = `${st}~${et}系统运行整体评价结果`
            const obj: any = {
                file_name,
                data: exportAll
                    ? undefined
                    : exportDataFormat(selectedRows, ['acceptance_time']),
            }
            if (exportAll) {
                obj.start_date = searchCondition.start_date
                obj.end_date = searchCondition.end_date
            }
            const res = await exportSystemOperation(obj)
            streamToFile(res, `${file_name}.xlsx`)
            message.success(__('导出成功'))
        } catch (error) {
            formatError(error)
        } finally {
            setExportLoading(false)
        }
    }

    return (
        <div className={styles.allOperationResultWrapper}>
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
        </div>
    )
}

export default AllOperationResult
