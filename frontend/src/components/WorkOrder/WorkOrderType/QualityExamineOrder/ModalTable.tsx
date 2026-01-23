import { Button, Popover, Space, Table, Tooltip } from 'antd'
import { UpOutlined, DownOutlined } from '@ant-design/icons'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import classnames from 'classnames'
import { useAntdTable } from 'ahooks'
import __ from './locale'
import styles from './styles.module.less'
import { FixedType } from '@/components/CommonTable/const'
import { getDepartName } from '../../WorkOrderProcessing/helper'
import { DataViewProvider } from '@/components/DatasheetView/DataViewProvider'
import QualityConfigModal from './QualityConfigModal'
import { Empty, SearchInput } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'
import { stateType } from '@/components/DatasheetView/const'
import {
    formatError,
    getDatasheetView,
    getFormViewBasicByIds,
    SortDirection,
} from '@/core'
import { RefreshBtn } from '@/components/ToolbarComponents'
import { DataColoredBaseIcon } from '@/core/dataSource'

/**
 * 检测模型表单
 */
const ModalTable = ({ readOnly, workOrderTitle, dataSourceInfo }: any) => {
    const dbsRef = useRef<HTMLDivElement>(null)
    const [isDataSource, setIsDataSource] = useState<boolean>(true)
    const [currentDS, setCurrentDS] = useState<any>()
    const [datasource, setDatasource] = useState<any[]>()
    const [visibleCount, setVisibleCount] = useState<number>(
        dataSourceInfo?.length || 0,
    )
    const [popoverSearchKeyword, setPopoverSearchKeyword] = useState<string>('')
    const [morePopoverVisible, setMorePopoverVisible] = useState<boolean>(false)
    const [condition, setCondition] = useState<any>({
        offset: 1,
        limit: 5,
        keyword: '',
        direction: SortDirection.DESC,
        sort: 'updated_at',
        type: 'datasource',
        include_sub_subject: true,
        // publish_status: 'publish',
    })
    // 当 isDataSource 为 false 时的分页状态
    const [clientPagination, setClientPagination] = useState({
        current: 1,
        pageSize: 5,
    })

    useEffect(() => {
        if (dataSourceInfo?.length) {
            const curItem = dataSourceInfo?.[0]
            setCurrentDS(curItem)
            const hasViews = !!curItem?.form_view_ids?.length
            setIsDataSource(!hasViews)
        }
    }, [dataSourceInfo])

    // 计算可见的数据源数量
    useEffect(() => {
        const calculateVisibleCount = () => {
            if (!dbsRef.current || !dataSourceInfo?.length) {
                setVisibleCount(dataSourceInfo?.length || 0)
                return
            }

            const containerWidth = dbsRef.current.offsetWidth
            // 每个item最大宽度120px，gap 8px，更多按钮约40px，留一些边距
            const itemWidth = 120
            const gap = 8
            const moreButtonWidth = 40
            const padding = 16

            let maxVisibleItems = Math.floor(
                (containerWidth - padding - moreButtonWidth) /
                    (itemWidth + gap),
            )
            maxVisibleItems = Math.max(1, maxVisibleItems) // 至少显示1个

            setVisibleCount(Math.min(maxVisibleItems, dataSourceInfo.length))
        }

        calculateVisibleCount()
        window.addEventListener('resize', calculateVisibleCount)
        return () => window.removeEventListener('resize', calculateVisibleCount)
    }, [dataSourceInfo])

    // 计算可见和隐藏的数据源
    const { visibleItems, hiddenItems } = useMemo(() => {
        if (!dataSourceInfo?.length) {
            return { visibleItems: [], hiddenItems: [] }
        }

        const visible = dataSourceInfo.slice(0, visibleCount)
        const hidden = dataSourceInfo.slice(visibleCount)

        // 不在这里过滤 hiddenItems，保持原始数据用于显示"更多"按钮
        return {
            visibleItems: visible,
            hiddenItems: hidden,
        }
    }, [dataSourceInfo, visibleCount])

    // 为 Popover 内容计算过滤后的隐藏项
    const filteredHiddenItems = useMemo(() => {
        if (!hiddenItems?.length) {
            return []
        }

        // 根据 popover 搜索关键字过滤隐藏项
        return popoverSearchKeyword
            ? hiddenItems.filter((item) =>
                  item.datasource_name
                      .toLowerCase()
                      .includes(popoverSearchKeyword.toLowerCase()),
              )
            : hiddenItems
    }, [hiddenItems, popoverSearchKeyword])

    // 当 isDataSource 为 false 时，根据 condition.keyword 筛选并分页处理 datasource 数据
    const { filteredDatasource, paginatedDatasource, filteredTotal } =
        useMemo(() => {
            if (isDataSource || !datasource?.length) {
                return {
                    filteredDatasource: datasource,
                    paginatedDatasource: datasource,
                    filteredTotal: datasource?.length || 0,
                }
            }

            // 根据 condition.keyword 进行筛选
            let filteredData = datasource
            if (condition.keyword?.trim()) {
                const keyword = condition.keyword.toLowerCase().trim()
                filteredData = datasource.filter((item) => {
                    const businessName = item.business_name?.toLowerCase() || ''
                    const technicalName =
                        item.technical_name?.toLowerCase() || ''

                    return (
                        businessName.includes(keyword) ||
                        technicalName.includes(keyword)
                    )
                })
            }

            // 进行分页处理
            const startIndex =
                (clientPagination.current - 1) * clientPagination.pageSize
            const endIndex = startIndex + clientPagination.pageSize
            const paginatedData = filteredData.slice(startIndex, endIndex)

            return {
                filteredDatasource: filteredData,
                paginatedDatasource: paginatedData,
                filteredTotal: filteredData.length,
            }
        }, [
            isDataSource,
            datasource,
            condition.keyword,
            clientPagination.current,
            clientPagination.pageSize,
        ])

    const getDataList = async (params: any) => {
        try {
            const res = await getDatasheetView(params)
            let entries = res.entries || []
            const ids = entries.map((o) => o.id)
            // 如果当前数据源有form_view_ids，则需要组合getFormViewBasicByIds的数据
            if (ids?.length && entries?.length) {
                entries = await combineViewData(entries, ids)
            }

            return { total: res.total_count, list: entries }
        } catch (error) {
            formatError(error)
            return {
                total: 0,
                list: [],
            }
        }
    }

    const { tableProps, run, refresh } = useAntdTable(getDataList, {
        defaultPageSize: 5,
        manual: true,
    })

    const getViewsByIds = async (ids: string[]) => {
        try {
            const basicRes = await getFormViewBasicByIds(ids)
            let entries = basicRes?.entries || []
            if (ids?.length && entries?.length) {
                entries = await combineViewData(entries, ids)
            }
            setDatasource(entries)
        } catch (error) {
            formatError(error)
        }
    }

    // 组合视图数据 - 将getDatasheetView数据与getFormViewBasicByIds数据按id组合
    const combineViewData = async (viewList: any[], formViewIds: string[]) => {
        try {
            const basicRes = await getFormViewBasicByIds(formViewIds)
            const basicDataMap = new Map()

            // 创建基础数据映射，以id为key
            basicRes?.entries?.forEach((item: any) => {
                basicDataMap.set(item.id, item)
            })

            // 组合数据，将基础数据中的字段合并到视图数据中
            return viewList.map((viewItem) => {
                const basicItem = basicDataMap.get(viewItem.id)
                if (basicItem) {
                    return {
                        ...viewItem,
                        // 这里可以添加需要从getFormViewBasicByIds中获取的字段
                        // 例如：business_name, description 等字段
                        ...basicItem,
                    }
                }
                return viewItem
            })
        } catch (error) {
            formatError(error)
            return viewList
        }
    }

    useEffect(() => {
        if (currentDS) {
            const datasource_id = currentDS?.datasource_id
            if (!currentDS?.form_view_ids?.length) {
                const params = {
                    ...condition,
                    offset: 1,
                    datasource_id,
                }
                setCondition(params)
                run(params)
            } else {
                getViewsByIds(currentDS?.form_view_ids)
            }
        }
    }, [currentDS])

    // 当前选中的库表
    const [currentView, setCurrentView] = useState<any>()

    const handleConfig = (record: any) => {
        setCurrentView(record)
    }

    const columns = [
        {
            title: (
                <div>
                    <span>{__('库表业务名称')}</span>
                    <span
                        style={{
                            color: 'rgba(0,0,0,0.45)',
                            fontWeight: 'normal',
                        }}
                    >
                        {__('（编码）')}
                    </span>
                </div>
            ),
            dataIndex: 'business_name',
            key: 'business_name',
            ellipsis: true,
            width: 200,
            render: (text, record) => (
                <div className={styles.twoLine}>
                    <div className={styles.firstLine}>
                        <span className={styles.name} title={text}>
                            {text || '--'}
                        </span>
                        {record?.status === stateType.delete && (
                            <span className={styles.delTag}>
                                {__('已删除')}
                            </span>
                        )}
                    </div>
                    <div
                        className={styles.secondLine}
                        title={record?.uniform_catalog_code}
                    >
                        {record?.uniform_catalog_code || '--'}
                    </div>
                </div>
            ),
        },
        {
            title: __('库表技术名称'),
            dataIndex: 'technical_name',
            key: 'technical_name',
            ellipsis: true,
            width: 180,
            render: (text, record) => text || '--',
        },
        {
            title: __('数据来源'),
            dataIndex: 'datasource_name',
            key: 'datasource_name',
            width: 180,
            ellipsis: true,
            render: (text, record) => text || '--',
        },
        {
            title: __('所属部门'),
            dataIndex: 'department_path',
            key: 'department_path',
            width: 180,
            ellipsis: true,
            render: (text, record) => (
                <span title={text}>{getDepartName(text) || '--'}</span>
            ),
        },
        {
            title: __('检测规则'),
            dataIndex: 'is_audit_rule_configured',
            key: 'is_audit_rule_configured',
            width: 120,
            ellipsis: true,
            render: (text, record) => (
                <span
                    className={classnames({
                        [styles.unConfig]: !text,
                    })}
                >
                    {text ? __('已配置') : __('未配置')}
                </span>
            ),
        },
        {
            title: __('操作'),
            key: 'action',
            width: readOnly ? 120 : 170,
            fixed: FixedType.RIGHT,
            render: (_, record) => {
                return readOnly ? (
                    <Tooltip
                        title={
                            record?.is_audit_rule_configured
                                ? ''
                                : __('规则未配置，无法查看')
                        }
                    >
                        <Button
                            type="link"
                            onClick={() => handleConfig(record)}
                            disabled={!record?.is_audit_rule_configured}
                        >
                            {__('查看规则配置')}
                        </Button>
                    </Tooltip>
                ) : (
                    <Space size={16}>
                        <Button
                            type="link"
                            onClick={() => handleConfig(record)}
                        >
                            {__('配置检测规则')}
                        </Button>
                    </Space>
                )
            },
        },
    ]

    const handleRefresh = () => {
        if (isDataSource) {
            refresh()
        } else {
            getViewsByIds(currentDS?.form_view_ids)
        }
    }

    return (
        <DataViewProvider>
            <>
                <div className={styles.tableHeader}>
                    <div
                        hidden={!dataSourceInfo?.length}
                        style={{ minWidth: '74px' }}
                    >
                        数据源筛选:
                    </div>
                    <div ref={dbsRef} className={styles.dbs}>
                        {visibleItems?.map((it) => (
                            <div
                                className={classnames(
                                    styles.dbItem,
                                    currentDS?.datasource_id ===
                                        it?.datasource_id && styles.active,
                                )}
                                key={it?.datasource_id}
                                onClick={() => {
                                    setCurrentDS(it)
                                    const hasViews = !!it?.form_view_ids?.length
                                    const newIsDataSource = !hasViews
                                    setIsDataSource(newIsDataSource)
                                    // 切换到客户端分页时重置分页状态
                                    if (!newIsDataSource) {
                                        setClientPagination({
                                            current: 1,
                                            pageSize: 5,
                                        })
                                    }
                                }}
                                title={it?.datasource_name}
                            >
                                <DataColoredBaseIcon
                                    type={it?.datasource_type}
                                    iconType="Colored"
                                    style={{
                                        fontSize: 14,
                                        marginRight: 8,
                                        flexShrink: 0,
                                    }}
                                />
                                <span
                                    style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {it?.datasource_name}
                                </span>
                            </div>
                        ))}
                        {hiddenItems?.length > 0 && (
                            <Popover
                                placement="bottomRight"
                                trigger="click"
                                overlayClassName={styles.popDB}
                                showArrow={false}
                                open={morePopoverVisible}
                                onOpenChange={(visible) =>
                                    setMorePopoverVisible(visible)
                                }
                                content={
                                    <div
                                        style={{
                                            maxWidth: 300,
                                            maxHeight: 300,
                                            overflowY: 'auto',
                                        }}
                                    >
                                        {/* 搜索框 */}
                                        <div
                                            style={{
                                                padding: '8px',
                                                position: 'sticky',
                                                top: 0,
                                                zIndex: 1,
                                                background: 'white',
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <SearchInput
                                                placeholder="搜索数据源"
                                                value={popoverSearchKeyword}
                                                onKeyChange={(key) =>
                                                    setPopoverSearchKeyword(key)
                                                }
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                onFocus={(e) =>
                                                    e.stopPropagation()
                                                }
                                                style={{
                                                    width: '100%',
                                                }}
                                            />
                                        </div>
                                        {/* 数据源列表 */}
                                        <div style={{ padding: '4px 0' }}>
                                            {filteredHiddenItems?.length > 0 ? (
                                                filteredHiddenItems?.map(
                                                    (it) => (
                                                        <div
                                                            className={classnames(
                                                                styles.dbItem,
                                                                currentDS?.datasource_id ===
                                                                    it?.datasource_id &&
                                                                    styles.active,
                                                                styles.popoverItem,
                                                            )}
                                                            key={
                                                                it?.datasource_id
                                                            }
                                                            onClick={() => {
                                                                setCurrentDS(it)
                                                                const hasViews =
                                                                    !!it
                                                                        ?.form_view_ids
                                                                        ?.length
                                                                const newIsDataSource =
                                                                    !hasViews
                                                                setIsDataSource(
                                                                    newIsDataSource,
                                                                )
                                                                // 切换到客户端分页时重置分页状态
                                                                if (
                                                                    !newIsDataSource
                                                                ) {
                                                                    setClientPagination(
                                                                        {
                                                                            current: 1,
                                                                            pageSize: 5,
                                                                        },
                                                                    )
                                                                }
                                                                // 关闭 Popover
                                                                setMorePopoverVisible(
                                                                    false,
                                                                )
                                                            }}
                                                            title={
                                                                it?.datasource_name
                                                            }
                                                            style={{
                                                                margin: '4px 0',
                                                            }}
                                                        >
                                                            <DataColoredBaseIcon
                                                                type={
                                                                    it?.datasource_type
                                                                }
                                                                iconType="Colored"
                                                                style={{
                                                                    fontSize: 14,
                                                                    marginRight: 8,
                                                                    flexShrink: 0,
                                                                }}
                                                            />
                                                            <span
                                                                style={{
                                                                    overflow:
                                                                        'hidden',
                                                                    textOverflow:
                                                                        'ellipsis',
                                                                }}
                                                            >
                                                                {
                                                                    it?.datasource_name
                                                                }
                                                            </span>
                                                        </div>
                                                    ),
                                                )
                                            ) : popoverSearchKeyword ? (
                                                <div
                                                    style={{
                                                        padding: '20px',
                                                        textAlign: 'center',
                                                        color: 'rgba(0,0,0,0.45)',
                                                        fontSize: '12px',
                                                    }}
                                                >
                                                    无搜索结果
                                                </div>
                                            ) : (
                                                <div
                                                    style={{
                                                        padding: '20px',
                                                        textAlign: 'center',
                                                        color: 'rgba(0,0,0,0.45)',
                                                        fontSize: '12px',
                                                    }}
                                                >
                                                    暂无更多数据源
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                }
                            >
                                <div
                                    className={classnames(
                                        styles.dbItem,
                                        styles.moreButton,
                                        morePopoverVisible && styles.active,
                                    )}
                                >
                                    <span>更多</span>
                                    {morePopoverVisible ? (
                                        <UpOutlined />
                                    ) : (
                                        <DownOutlined />
                                    )}
                                </div>
                            </Popover>
                        )}
                    </div>
                    <div
                        className={styles.search}
                        style={{ minWidth: '260px' }}
                    >
                        <SearchInput
                            placeholder="搜索库表业务名称、技术名称"
                            width={240}
                            onKeyChange={(keyword) => {
                                if (isDataSource) {
                                    const params = {
                                        ...condition,
                                        keyword,
                                        offset: 1,
                                    }
                                    setCondition(params)
                                    run(params)
                                } else {
                                    // 客户端搜索时重置到第一页
                                    setCondition((prev) => ({
                                        ...prev,
                                        keyword,
                                    }))
                                    setClientPagination((prev) => ({
                                        ...prev,
                                        current: 1,
                                    }))
                                }
                            }}
                        />

                        <RefreshBtn
                            onClick={() => {
                                run(condition)
                            }}
                        />
                    </div>
                </div>
                <Table
                    columns={columns}
                    rowClassName={styles['modal-table-row']}
                    rowKey="id"
                    {...(isDataSource
                        ? tableProps
                        : { dataSource: paginatedDatasource })}
                    locale={{
                        emptyText: condition?.keyword ? (
                            <Empty />
                        ) : (
                            <Empty iconSrc={dataEmpty} desc={__('暂无数据')} />
                        ),
                    }}
                    scroll={{ x: '100%' }}
                    pagination={
                        isDataSource
                            ? {
                                  ...tableProps.pagination,
                                  showQuickJumper: true,
                                  showSizeChanger: true,
                                  current: condition.offset,
                                  pageSize: condition.limit,
                                  showTotal: (count) =>
                                      __('共${count}条', { count }),
                              }
                            : {
                                  current: clientPagination.current,
                                  pageSize: clientPagination.pageSize,
                                  total: filteredTotal,
                                  showSizeChanger: true,
                                  showQuickJumper: true,
                                  showTotal: (count) =>
                                      __('共${count}条', { count }),
                              }
                    }
                    bordered={false}
                    onChange={(newPagination, filters, sorter) => {
                        if (isDataSource) {
                            // 服务端分页处理
                            setCondition((per) => ({
                                ...per,
                                offset: newPagination?.current || 1,
                                limit: newPagination?.pageSize || 10,
                            }))
                            run({
                                ...condition,
                                offset: newPagination?.current || 1,
                                limit: newPagination?.pageSize || 10,
                            })
                        } else {
                            // 客户端分页处理
                            setClientPagination({
                                current: newPagination?.current || 1,
                                pageSize: newPagination?.pageSize || 5,
                            })
                        }
                    }}
                />
            </>
            {currentView && (
                <QualityConfigModal
                    workOrderTitle={workOrderTitle}
                    readOnly={readOnly}
                    viewData={currentView}
                    open={!!currentView}
                    onClose={(needRefresh) => {
                        if (!readOnly && needRefresh) {
                            handleRefresh()
                        }
                        setCurrentView(undefined)
                    }}
                />
            )}
        </DataViewProvider>
    )
}

export default ModalTable
