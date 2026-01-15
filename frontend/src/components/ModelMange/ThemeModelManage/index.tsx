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
    ThemeModelManageMode,
    ViewModel,
} from '../const'
import Filters from '../Filters'
import __ from '../locale'
import { useModalManageContext } from '../ModalManageProvider'
import ModelGraph from '../ModelGraph'
import ConfigLevel from './ConfigLevel'
import ConfigThemeModel from './ConfigThemeModel'
import ModelGradeLabelDetail from './ModelGradeLabelDetail'
import styles from './styles.module.less'

interface ThemeModelManageProps {
    mode?: ThemeModelManageMode // 使用场景模式
}

const ThemeModelManage = ({
    mode = ThemeModelManageMode.DEFAULT,
}: ThemeModelManageProps) => {
    // 判断是否为密级管理模式
    const isLevelMode = mode === ThemeModelManageMode.LEVEL_MODE
    // 判断是否为目录管理模式
    const isDirMode = mode === ThemeModelManageMode.DIR_MODE
    // 判断是否为只读模式（密级模式或目录模式）
    const isReadOnlyMode = isLevelMode || isDirMode
    const [modelData, setModelData] = useState<any[]>([])
    const { filterKey } = useModalManageContext()

    const [isCreateMetaModel, setIsCreateMetaModel] = useState<boolean>(false)

    const [queryParams, setQueryParams] = useState<any>({
        ...DefaultModelQuery,
        subject_id: filterKey,
        model_type: ModelType.THEME_MODEL,
    })

    const [selectedSort, setSelectedSort] = useState<any>(defaultMenu)

    const [totalCount, setTotalCount] = useState<number>(0)

    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [showGraph, setShowGraph] = useState<boolean>(false)

    const [editingModelId, setEditingModelId] = useState<string>('')
    // 创建表头排序
    const [tableSort, setTableSort] = useState<{
        [key: string]: SortOrder | undefined
    }>({
        [SortType.UPDATED]: 'descend',
        [SortType.BUSINESS_NAME]: undefined,
    })

    const [basicInfo, setBasicInfo] = useState<any>({})

    const [showViewGraph, setShowViewGraph] = useState<boolean>(false)
    const [viewModelId, setViewModelId] = useState<string>('')
    const [configLevelModelInfo, setConfigLevelModelInfo] = useState<any>({})
    const [showConfigLevel, setShowConfigLevel] = useState<boolean>(false)
    const [showModelGradeLabelDetail, setShowModelGradeLabelDetail] =
        useState<boolean>(false)
    const [modelGradeLabelDetailData, setModelGradeLabelDetailData] =
        useState<any>({})

    const columns: any[] = [
        {
            title: __('主题模型名称'),
            dataIndex: 'business_name',
            key: 'business_name',
            sorter: true,
            sortOrder: tableSort.business_name,
            render: (text, record) => (
                <div
                    className={styles['raw-container']}
                    onClick={() => {
                        setViewModelId(record.id)
                        setShowViewGraph(true)
                    }}
                >
                    <FontIcon
                        name="icon-zhutimoxing"
                        style={{ fontSize: 16, flexShrink: 0 }}
                    />
                    <span className={styles['text-name']} title={text}>
                        {text}
                    </span>
                </div>
            ),
            ellipsis: true,
        },
        // 密级模式下显示分级标签列
        ...(isLevelMode
            ? [
                  {
                      title: __('分级标签'),
                      dataIndex: 'grade_label_Name',
                      key: 'grade_label_Name',
                      ellipsis: true,
                      render: (text, record) =>
                          record?.grade_label_Name ? (
                              <div className={styles.selectOptionWrapper}>
                                  {record.grade_label_icon ? (
                                      <FontIcon
                                          name="icon-biaoqianicon"
                                          style={{
                                              fontSize: 20,
                                              color: record.grade_label_icon,
                                          }}
                                          className={styles.icon}
                                      />
                                  ) : null}
                                  <span
                                      title={record.grade_label_Name}
                                      className={styles.name}
                                  >
                                      {record.grade_label_Name}
                                  </span>
                              </div>
                          ) : (
                              '--'
                          ),
                  },
              ]
            : []),
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
                // 目录管理模式：只显示详情
                if (isDirMode) {
                    const menus = [
                        {
                            label: __('详情'),
                            key: ModelManageAction.DETAIL,
                            menuType: OptionMenuType.Menu,
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
                }

                // 默认模式和密级模式：显示完整操作菜单
                const menus = [
                    {
                        label: __('详情'),
                        key: ModelManageAction.DETAIL,
                        menuType: OptionMenuType.Menu,
                    },
                    ...(!isLevelMode
                        ? [
                              {
                                  label: __('基本信息'),
                                  key: ModelManageAction.BASIC_INFO,
                                  menuType: OptionMenuType.Menu,
                              },
                          ]
                        : []),
                    // 密级模式下显示"设置密级"，否则显示"编辑"
                    isLevelMode
                        ? {
                              label: __('设置密级'),
                              key: ModelManageAction.SET_LEVEL,
                              menuType: OptionMenuType.Menu,
                          }
                        : {
                              label: __('编辑'),
                              key: ModelManageAction.EDIT,
                              menuType: OptionMenuType.Menu,
                              disabled: record?.used_count > 0,
                              title:
                                  record?.used_count > 0
                                      ? __('该模型已被使用，无法编辑')
                                      : '',
                          },
                    // 密级模式下不显示删除按钮
                    ...(!isLevelMode
                        ? [
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
                        : []),
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
                // 密级模式显示分级标签详情，其他模式显示图形化详情
                if (isLevelMode) {
                    setModelGradeLabelDetailData(record)
                    setShowModelGradeLabelDetail(true)
                } else {
                    setViewModelId(record.id)
                    setShowViewGraph(true)
                }

                break
            case ModelManageAction.BASIC_INFO:
                setBasicInfo(record)
                setIsCreateMetaModel(true)
                break
            case ModelManageAction.EDIT:
                setEditingModelId(record.id)
                setShowGraph(true)
                break
            case ModelManageAction.SET_LEVEL:
                // TODO: 实现设置密级功能
                // 可以在这里打开密级设置弹窗或跳转到密级设置页面
                setConfigLevelModelInfo(record)
                setShowConfigLevel(true)
                break
            case ModelManageAction.DELETE:
                handleDeleteModel(record.id)
                break
            default:
                break
        }
    }

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
                                filterKey && !isReadOnlyMode ? (
                                    <div className={styles['empty-desc']}>
                                        <div>
                                            {__(
                                                '可点击【新建主题模型】按钮创建主题数据模',
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
                                                {__('新建主题模型')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles['empty-desc']}>
                                        {isReadOnlyMode
                                            ? __('暂无数据')
                                            : __(
                                                  '无业务对象，需要先创建业务对象',
                                              )}
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
                        {isReadOnlyMode ? (
                            <div />
                        ) : (
                            <div>
                                <Button
                                    type="primary"
                                    icon={<AddOutlined />}
                                    onClick={() => {
                                        setIsCreateMetaModel(true)
                                    }}
                                >
                                    {__('新建主题模型')}
                                </Button>
                            </div>
                        )}
                        <Space size={16}>
                            <SearchInput
                                className={styles.nameInput}
                                style={{ width: 272 }}
                                placeholder={__('搜索主题模型名称、关联元模型')}
                                onKeyChange={(kw: string) =>
                                    setQueryParams({
                                        ...queryParams,
                                        keyword: kw,
                                    })
                                }
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
                                hideOnSinglePage: totalCount <= 20,
                            }}
                            loading={isLoading}
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
                />
            )}

            {showGraph && (
                <ModelGraph
                    modelId={editingModelId}
                    modelType={ModelType.THEME_MODEL}
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
            {showConfigLevel && (
                <ConfigLevel
                    modelInfo={configLevelModelInfo}
                    open={showConfigLevel}
                    onClose={() => setShowConfigLevel(false)}
                    onOk={() => {
                        setShowConfigLevel(false)
                        setQueryParams({
                            ...queryParams,
                            offset: 1,
                        })
                    }}
                />
            )}
            {showModelGradeLabelDetail && (
                <ModelGradeLabelDetail
                    visible={showModelGradeLabelDetail}
                    data={modelGradeLabelDetailData}
                    onCancel={() => setShowModelGradeLabelDetail(false)}
                />
            )}
        </div>
    )
}

export default ThemeModelManage
