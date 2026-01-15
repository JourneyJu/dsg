import { useState, useEffect } from 'react'
import { Modal, Button, Pagination } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { SearchInput, Empty } from '@/ui'
import { RefreshBtn } from '@/components/ToolbarComponents'
import {
    DataSourceRadioType,
    TreeType,
} from '@/components/MultiTypeSelectTree/const'
import DataSourceTree from '@/components/MultiTypeSelectTree/DataSourceTree'
import dataEmpty from '@/assets/dataEmpty.svg'
import { formatError, getDatasheetView } from '@/core'
import __ from '../locale'
import styles from './styles.module.less'
import { formatSelectedNodeToTableParams } from '@/components/DatasheetView/const'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { DataSourceOrigin } from '@/components/DataSource/helper'

interface ChooseTableProps {
    open: boolean
    onClose: () => void
    onConfirm?: (selectedTable: { id: string; name: string }) => void
}

const ChooseTable = ({ open, onClose, onConfirm }: ChooseTableProps) => {
    const [selectedNode, setSelectedNode] = useState<any>({})
    const [tableList, setTableList] = useState<any[]>([])
    const [selectedTableId, setSelectedTableId] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [tableParams, setTableParams] = useState<any>({
        offset: 1,
        limit: 10,
        keyword: '',
        include_dwh_data_auth_request: true,
        datasource_source_type: 'analytical',
        include_sub_subject: true,
        publish_status: 'publish',
    })

    // 当选择节点变化时，加载库表列表
    useEffect(() => {
        getTableList()
    }, [tableParams])

    const getTableList = async () => {
        try {
            const res = await getDatasheetView(tableParams)
            setTableList(res?.entries || [])
            setTotal(res?.total_count || 0)
            setCurrentPage(tableParams.offset || 1)
        } catch (error) {
            formatError(error)
        }
    }

    useEffect(() => {
        setTableParams((prev) => ({
            ...prev,
            offset: 1,
            limit: pageSize,
            keyword: '',
            ...formatSelectedNodeToTableParams({
                nodeId: selectedNode.id,
                nodeType: selectedNode.type,
                treeType: TreeType.DataSource,
                dataSourceType: selectedNode?.dataSourceType,
                dataType: selectedNode?.dataType,
            }),
            datasource_source_type:
                selectedNode?.source_type === 'analytical'
                    ? undefined
                    : 'analytical',
        }))
        setSelectedTableId('')
    }, [selectedNode, pageSize])

    // 切换选择
    const toggleSelect = (tableId: string) => {
        const table = tableList.find((t) => t.id === tableId)
        if (table?.has_dwh_data_auth_req_form) return // 已申请的不能选择

        setSelectedTableId((prev) => (prev === tableId ? '' : tableId))
    }

    // 确认选择
    const handleConfirm = () => {
        const selected = tableList.find((table) => table.id === selectedTableId)
        onConfirm?.({
            id: selected?.id,
            name: selected?.business_name,
        })
        onClose()
    }

    // 重置
    const handleReset = () => {
        setSelectedTableId('')
        setTableParams((prev) => ({
            ...prev,
            keyword: '',
            offset: 1,
        }))
    }

    return (
        <Modal
            title={__('选择申请库表')}
            open={open}
            onCancel={onClose}
            width={800}
            bodyStyle={{ padding: 0, height: 482 }}
            footer={
                <div className={styles.footer}>
                    <Button onClick={onClose}>{__('取消')}</Button>
                    <Button
                        type="primary"
                        onClick={handleConfirm}
                        disabled={!selectedTableId}
                    >
                        {__('确定')}
                    </Button>
                </div>
            }
        >
            <div className={styles.chooseTableContainer}>
                {/* 左侧：数据仓库 */}
                <div className={styles.leftPanel}>
                    <div className={styles.panelTitle}>{__('数据仓库')}</div>
                    <div className={styles.treeWrapper}>
                        <DataSourceTree
                            dataSourceTreeType={DataSourceRadioType.ByType}
                            setSelectedNode={setSelectedNode}
                            selectedNode={selectedNode}
                            filterDataSourceTypes={[
                                DataSourceOrigin.DATASANDBOX,
                                DataSourceOrigin.INFOSYS,
                            ]}
                        />
                    </div>
                </div>

                {/* 右侧：库表 */}
                <div className={styles.rightPanel}>
                    <div className={styles.rightPanelHeader}>
                        <div className={styles.panelTitle}>{__('库表')}</div>
                        <div className={styles.searchWrapper}>
                            <SearchInput
                                value={tableParams.keyword}
                                style={{ width: 180 }}
                                placeholder={__('搜索库表名称')}
                                onKeyChange={(kw: string) => {
                                    setTableParams((prev) => ({
                                        ...prev,
                                        keyword: kw,
                                        offset: 1,
                                    }))
                                }}
                            />
                            <RefreshBtn onClick={handleReset} />
                        </div>
                    </div>
                    <div className={styles.tableContent}>
                        {/* 库表列表 */}
                        <div className={styles.tableList}>
                            {tableList.length > 0 ? (
                                tableList.map((table) => {
                                    const isSelected =
                                        selectedTableId === table.id
                                    const isApplied =
                                        table.has_dwh_data_auth_req_form

                                    return (
                                        <div
                                            key={table.id}
                                            className={`${styles.tableItem} ${
                                                isSelected
                                                    ? styles.tableItemSelected
                                                    : ''
                                            } ${
                                                isApplied
                                                    ? styles.tableItemApplied
                                                    : ''
                                            }`}
                                            onClick={() => {
                                                if (!isApplied) {
                                                    toggleSelect(table.id)
                                                }
                                            }}
                                        >
                                            <div className={styles.tableIcon}>
                                                <FontIcon
                                                    name="icon-shitusuanzi"
                                                    type={IconType.COLOREDICON}
                                                    style={{ fontSize: 20 }}
                                                />
                                            </div>
                                            <div className={styles.tableInfo}>
                                                <div
                                                    className={styles.tableName}
                                                    title={table.business_name}
                                                >
                                                    {table.business_name}
                                                </div>
                                                <div
                                                    className={styles.tableCode}
                                                    title={
                                                        table.uniform_catalog_code
                                                    }
                                                >
                                                    {table.uniform_catalog_code}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <CheckOutlined
                                                    className={styles.checkIcon}
                                                />
                                            )}
                                            {isApplied && (
                                                <span
                                                    className={
                                                        styles.appliedTag
                                                    }
                                                >
                                                    {__('已申请')}
                                                </span>
                                            )}
                                        </div>
                                    )
                                })
                            ) : (
                                <Empty
                                    desc={__('暂无数据')}
                                    iconSrc={dataEmpty}
                                />
                            )}
                        </div>

                        {/* 分页 */}
                        {total > 0 && (
                            <div className={styles.pagination}>
                                <Pagination
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={total}
                                    showSizeChanger={false}
                                    onChange={(page) => {
                                        setCurrentPage(page)
                                        setTableParams((prev) => ({
                                            ...prev,
                                            offset: page,
                                        }))
                                    }}
                                    size="small"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ChooseTable
