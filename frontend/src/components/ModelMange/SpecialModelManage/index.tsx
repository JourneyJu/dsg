import { Button, message, Space, Table } from 'antd'
import { useEffect, useState } from 'react'

import { ExclamationCircleFilled } from '@ant-design/icons'
import moment from 'moment'
import dataEmpty from '@/assets/dataEmpty.svg'
import DropDownFilter from '@/components/DropDownFilter'
import { RefreshBtn, SortBtn } from '@/components/ToolbarComponents'
import {
    deleteModel,
    formatError,
    getModelList,
    SortDirection,
    SortType,
} from '@/core'
import { AddOutlined, FontIcon } from '@/icons'
import { Empty, Loader, OptionBarTool, OptionMenuType, SearchInput } from '@/ui'
import { confirm } from '@/utils/modalHelper'
import {
    defaultMenu,
    DefaultModelQuery,
    ModelManageAction,
    ModelSortMenus,
    ModelType,
    SortOrder,
    ViewModel,
} from '../const'
import Filters from '../Filters'
import __ from '../locale'
import { useModalManageContext } from '../ModalManageProvider'
import ModelGraph from '../ModelGraph'
import ConfigThemeModel from '../ThemeModelManage/ConfigThemeModel'
import styles from './styles.module.less'

const SpecialModelManage = () => {
    const [modelData, setModelData] = useState<any[]>([])

    const { filterKey } = useModalManageContext()

    const [isCreateMetaModel, setIsCreateMetaModel] = useState<boolean>(false)

    const [queryParams, setQueryParams] = useState<any>({
        ...DefaultModelQuery,
        subject_id: filterKey,
        model_type: ModelType.SPECIAL_MODEL,
    })

    const [selectedSort, setSelectedSort] = useState<any>(defaultMenu)

    const [totalCount, setTotalCount] = useState<number>(0)

    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [showGraph, setShowGraph] = useState<boolean>(false)

    const [editingModelId, setEditingModelId] = useState<string>('')

    const [showViewGraph, setShowViewGraph] = useState<boolean>(false)
    const [viewModelId, setViewModelId] = useState<string>('')

    // 创建表头排序
    const [tableSort, setTableSort] = useState<{
        [key: string]: SortOrder | undefined
    }>({
        [SortType.UPDATED]: 'descend',
        [SortType.BUSINESS_NAME]: undefined,
    })

    const [basicInfo, setBasicInfo] = useState<any>({})

    const columns: any[] = [
        {
            title: __('专题模型名称'),
            dataIndex: 'business_name',
            key: 'business_name',
            sorter: true,
            sortOrder: tableSort.business_name,
            render: (text, record) => (
                <div
                    className={styles['raw-container']}
                    onClick={() => {
                        setEditingModelId(record.id)
                        setShowGraph(true)
                    }}
                >
                    <FontIcon
                        name="icon-zhuantimoxing"
                        style={{ fontSize: 16, flexShrink: 0 }}
                    />
                    <span className={styles['text-name']} title={text}>
                        {text}
                    </span>
                </div>
            ),
            ellipsis: true,
        },
        {
            title: __('关联元模型'),
            dataIndex: 'meta_model',
            key: 'meta_model',
            ellipsis: true,
            render: (text, record) => {
                return text?.length ? (
                    <div className={styles['raw-container']}>
                        <div
                            title={text.join(',')}
                            className={styles['tag-container']}
                        >
                            <FontIcon
                                name="icon-yuanmoxing"
                                style={{ fontSize: 16, flexShrink: 0 }}
                            />
                            {text[0]}
                        </div>
                        {text?.length > 1 && (
                            <div className={styles['count-container']}>
                                <span>{`+${text.length - 1}`}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    '--'
                )
            },
        },
        {
            title: __('更新人'),
            dataIndex: 'updater_name',
            key: 'updater_name',
            ellipsis: true,
            render: (text, record) => record?.updater_name || '--',
        },
        {
            title: __('更新时间'),
            dataIndex: 'updated_at',
            key: 'updated_at',
            ellipsis: true,
            sorter: true,
            sortOrder: tableSort.updated_at,
            showSorterTooltip: false,
            render: (text, record) =>
                moment(record?.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: __('操作'),
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => {
                const menus = [
                    {
                        label: __('详情'),
                        key: ModelManageAction.DETAIL,
                        menuType: OptionMenuType.Menu,
                    },
                    {
                        label: __('基本信息'),
                        key: ModelManageAction.BASIC_INFO,
                        menuType: OptionMenuType.Menu,
                    },
                    {
                        label: __('编辑'),
                        key: ModelManageAction.EDIT,
                        menuType: OptionMenuType.Menu,
                        disabled: record?.used_count > 0,
                        title:
                            record?.used_count > 0
                                ? __('该模型已被使用，无法编辑')
                                : '',
                    },
                    {
                        label: __('删除'),
                        key: ModelManageAction.DELETE,
                        menuType: OptionMenuType.Menu,
                        disabled: record?.used_count > 0,
                        title:
                            record?.used_count > 0
                                ? __('该模型已被使用，无法编辑')
                                : '',
                    },
                ]
                return (
                    <OptionBarTool
                        menus={menus}
                        onClick={(key) => {
                            handleOperate(key, record)
                        }}
                    />
                )
            },
        },
    ]

    useEffect(() => {
        setQueryParams({
            ...queryParams,
            offset: 1,
            subject_id: filterKey,
            keyword: '',
        })
    }, [filterKey])

    useEffect(() => {
        if (queryParams.subject_id) {
            getModelData()
        } else {
            setIsLoading(false)
        }
    }, [queryParams])

    /**
     * 获取模型数据
     */
    const getModelData = async () => {
        try {
            setIsLoading(true)
            const res = await getModelList(queryParams)
            setModelData(res.entries)
            setTotalCount(res.total_count)
        } catch (err) {
            formatError(err)
        } finally {
            setSelectedSort(undefined)
            setIsLoading(false)
        }
    }
    /**
     * 删除模型
     */
    const handleDeleteModel = async (modelId: string) => {
        confirm({
            title: __('确定要删除该模型吗？'),
            content: __(
                '该删除操作仅删除当前模型，其关联的元模型不会被同步删除。',
            ),
            icon: (
                <ExclamationCircleFilled
                    style={{ color: 'rgba(250, 173, 20, 1)' }}
                />
            ),
            onOk: async () => {
                try {
                    await deleteModel(modelId)
                    setQueryParams({
                        ...queryParams,
                        offset: 1,
                    })
                    message.success(__('删除成功'))
                } catch (err) {
                    formatError(err)
                }
            },
        })
    }

    /**
     * 操作
     * @param key
     * @param record
     */
    const handleOperate = (key: string, record: any) => {
        switch (key) {
            case ModelManageAction.DETAIL:
                setViewModelId(record.id)
                setShowViewGraph(true)
                break
            case ModelManageAction.BASIC_INFO:
                setBasicInfo(record)
                setIsCreateMetaModel(true)
                break
            case ModelManageAction.EDIT:
                setEditingModelId(record.id)
                setShowGraph(true)
                break
            case ModelManageAction.DELETE:
                handleDeleteModel(record.id)
                break
            default:
                break
        }
    }
    /**
     * 菜单变化
     * @param value 选中的菜单
     */
    const handleMenuChange = (value) => {
        const { key, sort } = value
        setQueryParams({
            ...queryParams,
            direction: sort,
            sort: key,
            offset: 1,
        })
        setSelectedSort(value)
        onChangeMenuToTableSort(value)
    }

    /**
     * 菜单变化时，更新表头排序
     * @param selectedMenu 选中的菜单
     */
    const onChangeMenuToTableSort = (selectedMenu) => {
        setTableSort({
            [SortType.UPDATED]: null,
            [SortType.BUSINESS_NAME]: null,
            [SortType.CREATED]: null,
            [selectedMenu.key]:
                selectedMenu.sort === SortDirection.ASC ? 'ascend' : 'descend',
        })
    }

    /**
     * 表格排序
     * @param sorter 排序对象
     * @returns 排序结果
     */
    const handleTableChange = (sorter) => {
        const sorterKey = sorter.columnKey

        if (sorter.column) {
            setTableSort({
                [SortType.UPDATED]: null,
                [SortType.BUSINESS_NAME]: null,
                [SortType.CREATED]: null,
                [sorterKey]: sorter.order || 'ascend',
            })
            return {
                key: sorterKey,
                sort:
                    sorter.order === 'ascend'
                        ? SortDirection.ASC
                        : SortDirection.DESC,
            }
        }

        setTableSort({
            [SortType.UPDATED]: null,
            [SortType.BUSINESS_NAME]: null,
            [SortType.CREATED]: null,
            [sorterKey]:
                queryParams.direction === SortDirection.ASC
                    ? 'descend'
                    : 'ascend',
        })

        return {
            key: queryParams.sort,
            sort:
                queryParams.direction === SortDirection.ASC
                    ? SortDirection.DESC
                    : SortDirection.ASC,
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles['filters-container']}>
                <Filters />
            </div>
            {modelData.length === 0 && !queryParams.keyword ? (
                isLoading ? (
                    <div className={styles['empty-container']}>
                        <Loader />
                    </div>
                ) : (
                    <div className={styles['empty-container']}>
                        <Empty
                            desc={
                                filterKey ? (
                                    <div className={styles['empty-desc']}>
                                        <div>
                                            {__(
                                                '可点击【新建专题模型】按钮创建专题数据模',
                                            )}
                                        </div>
                                        <div>
                                            <Button
                                                type="primary"
                                                icon={<AddOutlined />}
                                                onClick={() => {
                                                    setIsCreateMetaModel(true)
                                                }}
                                            >
                                                {__('新建专题模型')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles['empty-desc']}>
                                        {__('无业务对象，需要先创建业务对象')}
                                    </div>
                                )
                            }
                            iconSrc={dataEmpty}
                        />
                    </div>
                )
            ) : (
                <div className={styles['data-container']}>
                    <div className={styles['tool-bar-container']}>
                        <div>
                            <Button
                                type="primary"
                                icon={<AddOutlined />}
                                onClick={() => {
                                    setIsCreateMetaModel(true)
                                }}
                            >
                                {__('新建专题模型')}
                            </Button>
                        </div>
                        <Space size={16}>
                            <SearchInput
                                className={styles.nameInput}
                                style={{ width: 272 }}
                                placeholder={__('搜索专题模型名称、关联元模型')}
                                onKeyChange={(kw: string) =>
                                    setQueryParams({
                                        ...queryParams,
                                        keyword: kw,
                                    })
                                }
                                value={queryParams.keyword}
                            />

                            <Space size={0}>
                                <SortBtn
                                    contentNode={
                                        <DropDownFilter
                                            menus={ModelSortMenus}
                                            defaultMenu={defaultMenu}
                                            menuChangeCb={handleMenuChange}
                                            changeMenu={selectedSort}
                                        />
                                    }
                                />
                                <RefreshBtn
                                    onClick={() => {
                                        setQueryParams({
                                            ...queryParams,
                                            offset: 1,
                                        })
                                    }}
                                />
                            </Space>
                        </Space>
                    </div>
                    <div className={styles['table-container']}>
                        <Table
                            columns={columns}
                            dataSource={modelData}
                            rowClassName={styles.tableRow}
                            loading={isLoading}
                            pagination={{
                                current: queryParams?.offset,
                                pageSize: queryParams?.limit,
                                total: totalCount,
                                showTotal: (total) =>
                                    __('共${total}条', { total }),
                                pageSizeOptions: [10, 20, 50, 100],
                                showSizeChanger: totalCount > 20,
                                showQuickJumper:
                                    totalCount > (queryParams?.limit || 0) * 8,
                                hideOnSinglePage: totalCount <= 10,
                            }}
                            locale={{
                                emptyText: <Empty />,
                            }}
                            onChange={(pagination, filters, sorter) => {
                                if (pagination.current === queryParams.offset) {
                                    const selectedMenu: any =
                                        handleTableChange(sorter)
                                    setSelectedSort(selectedMenu)
                                    setQueryParams({
                                        ...queryParams,
                                        sort: selectedMenu.key,
                                        direction: selectedMenu.sort,
                                        offset: 1,
                                        limit: pagination?.pageSize,
                                    })
                                } else {
                                    setQueryParams({
                                        ...queryParams,
                                        offset: pagination.current,
                                        limit: pagination?.pageSize,
                                    })
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {isCreateMetaModel && (
                <ConfigThemeModel
                    open={isCreateMetaModel}
                    onClose={() => setIsCreateMetaModel(false)}
                    onConfirm={(id: string) => {
                        setQueryParams({
                            ...queryParams,
                            offset: 1,
                        })
                        setIsCreateMetaModel(false)
                        if (basicInfo?.id) {
                            setBasicInfo(null)
                        } else {
                            setShowGraph(true)
                            setEditingModelId(id)
                        }
                    }}
                    initInfo={
                        basicInfo?.id
                            ? {
                                  business_name: basicInfo.business_name,
                                  description: basicInfo.description,
                              }
                            : undefined
                    }
                    id={basicInfo?.id}
                    modelType={ModelType.SPECIAL_MODEL}
                />
            )}

            {showGraph && (
                <ModelGraph
                    modelId={editingModelId}
                    modelType={ModelType.SPECIAL_MODEL}
                    open={showGraph}
                    onClose={() => {
                        setShowGraph(false)
                        setEditingModelId('')
                    }}
                    onConfirm={() => {
                        setQueryParams({
                            ...queryParams,
                            offset: 1,
                        })
                        setShowGraph(false)
                        setEditingModelId('')
                    }}
                    viewModel={ViewModel.EDIT}
                />
            )}
            {showViewGraph && (
                <ModelGraph
                    modelId={viewModelId}
                    modelType={ModelType.THEME_MODEL}
                    open={showViewGraph}
                    onClose={() => {
                        setShowViewGraph(false)
                        setViewModelId('')
                    }}
                    viewModel={ViewModel.EXPAND_VIEW}
                />
            )}
        </div>
    )
}

export default SpecialModelManage
