import classNames from 'classnames'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Space, Table } from 'antd'
import { SortOrder } from 'antd/lib/table/interface'
import { useUpdateEffect } from 'ahooks'
import styles from './styles.module.less'
import __ from './locale'
import { Empty, SearchInput } from '@/ui'
import { RefreshBtn } from '@/components/ToolbarComponents'
import {
    formatError,
    getAppliedViewList,
    IAppliedViewItem,
    SortDirection,
} from '@/core'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import DataCatlgContent from '@/components/DataAssetsCatlg/DataCatlgContent'
import ViewShareInfo from '../MyAssets/MyResForCS/Components/ViewShareInfo'
import { ResTypeEnum } from '../MyAssets/MyResForCS/const'
import LogicViewDetail from '@/components/DataAssetsCatlg/LogicViewDetail'

/**
 * 已授权目录 - 库表列表
 * 基于 MyAssets 的 ResForApply 组件，只显示库表部分
 * 并将"所属目录"列调整到第一列
 */
const AuthorizedResources = () => {
    const [searchCondition, setSearchCondition] = useState({
        keyword: '',
        offset: 1,
        limit: 10,
        sort: 'res_tech_name',
        direction: SortDirection.DESC,
    })

    // 创建表头排序
    const [tableSort, setTableSort] = useState<{
        [key: string]: SortOrder | undefined
    }>({
        name: 'descend',
    })

    const searchValue = useRef('')
    const [catalogCardOpen, setCatalogCardOpen] = useState<boolean>(false)
    const [operateItem, setOperateItem] = useState<IAppliedViewItem>()
    const [viewShareInfoOpen, setViewShareInfoOpen] = useState<boolean>(false)
    const [tableData, setTableData] = useState<any[]>([])
    const [total, setTotal] = useState<number>(0)
    const [scrollY] = useState<string>(`calc(100vh - 327px)`)
    const [loginViewOpen, setLoginViewOpen] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    const getTableList = async (params: any) => {
        try {
            setLoading(true)
            const res = await getAppliedViewList({
                ...params,
                sort: 'res_tech_name',
            })
            setTableData(res.entries)
            setTotal(res.total_count)
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getTableList(searchCondition)
    }, [])

    useUpdateEffect(() => {
        getTableList(searchCondition)
    }, [searchCondition])

    // 分页改变
    const onPaginationChange = (page, pageSize) => {
        setSearchCondition((prev) => ({
            ...prev,
            offset: page,
            limit: pageSize,
        }))
    }

    const columns: any = useMemo(() => {
        return [
            // 所属目录列 - 放在第一列
            {
                title: __('所属目录'),
                dataIndex: 'catalog_name',
                key: 'catalog_name',
                width: '20%',
                render: (text, record) => (
                    <div className={styles['catalog-info-container']}>
                        <div
                            className={classNames(
                                styles['catalog-name'],
                                typeof record.is_catalog_online === 'boolean' &&
                                    !record.is_catalog_online &&
                                    styles['catalog-name-offline'],
                                typeof record.is_catalog_online === 'boolean' &&
                                    !record.is_catalog_online &&
                                    styles['name-offline'],
                            )}
                            title={record.catalog_name}
                            onClick={() => {
                                setCatalogCardOpen(true)
                                setOperateItem(record)
                            }}
                        >
                            {record.catalog_name || '--'}
                        </div>
                        {typeof record.is_catalog_online === 'boolean' &&
                            !record.is_catalog_online &&
                            record.catalog_name && (
                                <div className={styles['offline-flag']}>
                                    {__('已下线')}
                                </div>
                            )}
                    </div>
                ),
            },
            {
                title: (
                    <div>
                        <span>{__('表技术名称')}</span>
                        <span style={{ color: 'rgba(0,0,0,0.45)' }}>
                            {__('（编码）')}
                        </span>
                    </div>
                ),
                dataIndex: 'name',
                key: 'name',
                sorter: true,
                sortOrder: tableSort.name,
                showSorterTooltip: false,
                sortDirections: ['descend', 'ascend', 'descend'],
                width: '30%',
                render: (text, record) => (
                    <div
                        className={styles['technical-info-container']}
                        onClick={() => {
                            setLoginViewOpen(true)
                            setOperateItem(record)
                        }}
                    >
                        <FontIcon
                            name="icon-shitusuanzi"
                            type={IconType.COLOREDICON}
                            style={{ fontSize: 20 }}
                        />
                        <div className={styles['technical-info']}>
                            <div
                                className={classNames(
                                    styles['technical-name'],
                                    !record.is_catalog_online &&
                                        styles['name-offline'],
                                )}
                                title={record.res_tech_name}
                            >
                                {record.res_tech_name}
                            </div>
                            <div
                                className={styles['technical-code']}
                                title={record.res_code}
                            >
                                {record.res_code}
                            </div>
                        </div>
                    </div>
                ),
                ellipsis: true,
            },
            {
                title: __('表业务名称'),
                dataIndex: 'res_name',
                key: 'res_name',
                width: '20%',
                ellipsis: true,
                render: (text, record) =>
                    record.is_catalog_online ? (
                        <span className={styles['business-name']}>{text}</span>
                    ) : (
                        <span className={styles['name-offline']}>{text}</span>
                    ),
            },
            {
                title: __('目录提供方'),
                dataIndex: 'supply_org_name',
                key: 'supply_org_name',
                width: '15%',
                ellipsis: true,
                render: (provider, record) =>
                    typeof record.is_catalog_online === 'boolean' &&
                    !record.is_catalog_online ? (
                        <span className={styles['name-offline']}>
                            {provider}
                        </span>
                    ) : (
                        provider
                    ),
            },
            {
                title: __('操作'),
                dataIndex: 'operation',
                key: 'operation',
                width: 130,
                render: (text, record) => (
                    <Button
                        type="link"
                        onClick={() => {
                            const url = `/dataService/dirContent?catlgId=${record.catalog_id}&name=${record.catalog_name}`
                            const currentPath = window.location.pathname
                            const currentSearch = window.location.search
                            const currentFullPath = `${currentPath}${currentSearch}`

                            // 从当前路径中提取平台前缀和平台标识
                            const pathMatch = currentPath.match(
                                /^\/([^/]+)\/(drmb|drmp|ca|cd)(\/.*)?$/,
                            )
                            const platformPrefix = pathMatch
                                ? `/${pathMatch[1]}`
                                : '/anyfabric' // 默认使用 anyfabric
                            const currentPlatform = pathMatch
                                ? pathMatch[2]
                                : 'cd' // 默认使用 cd

                            // 构建返回 URL：确保是 cd 平台的路径
                            let backUrlForCd = currentFullPath
                            if (pathMatch) {
                                // 如果当前路径已包含平台前缀，替换为 cd 平台
                                backUrlForCd = currentFullPath.replace(
                                    new RegExp(
                                        `^${platformPrefix}/(drmb|drmp|ca|cd)`,
                                    ),
                                    `${platformPrefix}/cd`,
                                )
                            } else {
                                // 如果当前路径没有平台前缀，添加 cd 平台前缀
                                backUrlForCd = `${platformPrefix}/cd${currentFullPath}`
                            }

                            // 重新构建 URL，替换 backUrl 参数为 cd 平台的返回地址
                            const baseUrl = url.split('&backUrl=')[0]
                            const jumpUrl = `${platformPrefix}/drmb${baseUrl}&backUrl=${encodeURIComponent(
                                backUrlForCd,
                            )}`
                            window.open(jumpUrl, '_blank')
                        }}
                    >
                        {__('详情')}
                    </Button>
                ),
            },
        ]
    }, [tableSort])

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

    const onTableChange = (currentPagination, filters, sorter, extra) => {
        if (extra.action === 'sort' && !!sorter.column) {
            const selectedMenu = handleTableChange(sorter)
            setSearchCondition((prev) => ({
                ...prev,
                sort: selectedMenu.key,
                direction: selectedMenu.sort,
                offset: 1,
            }))
        }
    }

    return (
        <div className={styles['authorized-resources-container']}>
            <div className={styles.top}>
                <Space className={styles['top-search']}>
                    <SearchInput
                        placeholder={__('搜索表技术名称、表编码、目录编码')}
                        onKeyChange={(kw: string) => {
                            if (!kw && !searchValue.current) return
                            searchValue.current = kw
                            setSearchCondition({
                                ...searchCondition,
                                offset: 1,
                                keyword: kw || '',
                            })
                        }}
                        maxLength={255}
                        value={searchCondition.keyword}
                        className={styles.searchInput}
                        style={{ width: 320 }}
                    />
                    <span>
                        <RefreshBtn
                            onClick={() =>
                                setSearchCondition({ ...searchCondition })
                            }
                        />
                    </span>
                </Space>
            </div>
            <div className={styles.bottom}>
                <Table
                    columns={columns}
                    dataSource={tableData}
                    rowKey="res_id"
                    loading={loading}
                    rowClassName={styles.tableRow}
                    onChange={onTableChange}
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
            </div>
            {catalogCardOpen && (
                <DataCatlgContent
                    open={catalogCardOpen}
                    onClose={() => {
                        setCatalogCardOpen(false)
                        setOperateItem(undefined)
                    }}
                    assetsId={operateItem?.catalog_id}
                />
            )}
            {viewShareInfoOpen && operateItem?.res_id && (
                <ViewShareInfo
                    open={viewShareInfoOpen}
                    onClose={() => {
                        setViewShareInfoOpen(false)
                        setOperateItem(undefined)
                    }}
                    id={operateItem?.res_id}
                    type={ResTypeEnum.View}
                    serviceId={operateItem?.res_id || ''}
                />
            )}
            {loginViewOpen && operateItem?.res_id && (
                <LogicViewDetail
                    open={loginViewOpen}
                    onClose={() => {
                        setLoginViewOpen(false)
                        setOperateItem(undefined)
                    }}
                    id={operateItem?.res_id}
                    isIntroduced
                    style={{
                        position: 'fixed',
                        width: '100vw',
                        height: '100vh',
                        top: '52px',
                        borderTop: '1px solid rgb(0 0 0 / 10%)',
                    }}
                    hasAsst={false}
                    isPersonalCenter
                />
            )}
        </div>
    )
}

export default AuthorizedResources
