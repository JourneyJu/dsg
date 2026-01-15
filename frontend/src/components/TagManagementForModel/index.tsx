import { Button, message, Space, Table, Tooltip } from 'antd'
import { useEffect, useMemo, useState } from 'react'

import moment from 'moment'
import { confirm } from '@/utils/modalHelper'

import dataEmpty from '@/assets/dataEmpty.svg'
import {
    deleteTopicModelLabel,
    formatError,
    getTopicModelLabelList,
} from '@/core'
import { AddOutlined } from '@/icons'
import { Empty, Loader, SearchInput } from '@/ui'
import { RefreshBtn } from '../ToolbarComponents'
import EditTagManage from './EditTagManage'
import __ from './locale'
import styles from './styles.module.less'
import TagDetail from './TagDetail'

/**
 * 标签管理组件
 *
 * @description 用于管理系统中的标签，支持增删改查功能
 * @author
 */
const TagManagementForModel = () => {
    const [tags, setTags] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const [editingTag, setEditingTag] = useState<any | null>(null)

    const [totalCount, setTotalCount] = useState<number>(0)

    const [showModelDetail, setShowModelDetail] = useState<boolean>(false)
    const [detailData, setDetailData] = useState<any>(null)

    const [queryParams, setQueryParams] = useState<any>({
        offset: 1,
        limit: 10,
        keyword: '',
    })

    useEffect(() => {
        getDataList()
    }, [queryParams])
    /**
     * 搜索过滤
     */
    const filteredTags = useMemo(() => {
        return tags.filter(
            (tag) =>
                tag.name
                    .toLowerCase()
                    .includes(queryParams.keyword.toLowerCase()) ||
                tag.description
                    ?.toLowerCase()
                    .includes(queryParams.keyword.toLowerCase()),
        )
    }, [tags, queryParams.keyword])

    /**
     * 打开新增/编辑弹窗
     */
    const handleOpenModal = (tag?: any) => {
        setEditingTag(tag || null)
        setModalVisible(true)
    }

    /**
     * 获取数据列表
     */
    const getDataList = async () => {
        try {
            setLoading(true)
            const res = await getTopicModelLabelList(queryParams)
            setTags(res.entries)
            setTotalCount(res.total_count)
        } catch (err) {
            formatError(err)
        } finally {
            setLoading(false)
        }
    }

    /**
     * 删除标签
     */
    const handleDelete = (id: string) => {
        confirm({
            title: __('确定要删除这个标签吗？'),
            content: __(
                '删除后将无法恢复，且该标签与主题模型关联关系也会被删除',
            ),
            onOk: () => {
                deleteTag(id)
            },
            okText: __('确定'),
            cancelText: __('取消'),
        })
    }

    /**
     * 删除标签
     */
    const deleteTag = async (id: string) => {
        try {
            await deleteTopicModelLabel(id)
            message.success(__('删除成功'))
            setQueryParams({
                ...queryParams,
                offset: 1,
            })
        } catch (err) {
            formatError(err)
        }
    }
    /**
     * 刷新数据
     */
    const handleRefresh = () => {
        setQueryParams({
            ...queryParams,
        })
    }

    /**
     * 表格列定义
     */
    const columns: Array<any> = [
        {
            title: __('标签名称'),
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (name: string, record: any) => name,
        },

        {
            title: __('描述'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            width: 300,
            render: (description: string) => description || __('暂无描述'),
        },
        {
            title: __('关联主题模型'),
            dataIndex: 'related_models',
            key: 'related_models',
            width: 300,
            render: (models: any[] | undefined) => {
                if (!models || models.length === 0) {
                    return <span style={{ color: '#999' }}>--</span>
                }

                const maxDisplay = 3
                const displayModels = models.slice(0, maxDisplay)
                const remainingCount = models.length - maxDisplay

                return (
                    <Tooltip
                        title={
                            <div className={styles.modelTooltipContainer}>
                                {models.map((model, index) => (
                                    <span
                                        key={index}
                                        className={styles.modelTag}
                                        title={model?.name}
                                    >
                                        {model?.name}
                                    </span>
                                ))}
                            </div>
                        }
                        color="white"
                        placement="top"
                    >
                        <Space size={[8, 8]} wrap>
                            {displayModels.map((model, index) => (
                                <span
                                    key={index}
                                    className={styles.modelTag}
                                    title={model?.name}
                                >
                                    {model?.name}
                                </span>
                            ))}
                            {remainingCount > 0 && (
                                <span className={styles.modelTagMore}>
                                    +{remainingCount}
                                </span>
                            )}
                        </Space>
                    </Tooltip>
                )
            },
        },
        {
            title: __('创建时间'),
            dataIndex: 'created_at',
            key: 'created_at',
            width: 200,
            render: (created_at: string) => (
                <span>{moment(created_at).format('YYYY-MM-DD HH:mm:ss')}</span>
            ),
        },
        {
            title: __('操作'),
            key: 'action',
            width: 150,
            fixed: 'right' as const,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button
                        type="link"
                        onClick={() => {
                            setDetailData(record)
                            setShowModelDetail(true)
                        }}
                    >
                        {__('查看详情')}
                    </Button>
                    <Button type="link" onClick={() => handleOpenModal(record)}>
                        {__('编辑')}
                    </Button>
                    <Button type="link" onClick={() => handleDelete(record.id)}>
                        {__('删除')}
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div className={styles.tagManagement}>
            {/* 顶部操作栏 */}
            <div className={styles.topBar}>
                <div className={styles.leftActions}>
                    <Button
                        type="primary"
                        icon={<AddOutlined />}
                        onClick={() => handleOpenModal()}
                    >
                        {__('新建标签')}
                    </Button>
                </div>
                <div className={styles.rightActions}>
                    <Space size="middle">
                        <SearchInput
                            placeholder={__('搜索标签名称')}
                            allowClear
                            style={{ width: 280 }}
                            onKeyChange={(value: string) => {
                                setQueryParams({
                                    offset: 1,
                                    limit: 10,
                                    keyword: value,
                                })
                            }}
                        />
                        <RefreshBtn onClick={handleRefresh} />
                    </Space>
                </div>
            </div>
            {loading ? (
                <div className={styles['empty-container']}>
                    <Loader />
                </div>
            ) : !queryParams.keyword && filteredTags.length === 0 ? (
                <div className={styles['empty-container']}>
                    <Empty
                        desc={
                            <div className={styles['empty-desc']}>
                                <div>{__('无标签，需要先创建标签')}</div>
                                <div>
                                    <Button
                                        type="primary"
                                        icon={<AddOutlined />}
                                        onClick={() => handleOpenModal()}
                                    >
                                        {__('新建标签')}
                                    </Button>
                                </div>
                            </div>
                        }
                        iconSrc={dataEmpty}
                    />
                </div>
            ) : (
                <div>
                    {/* 表格 */}
                    <Table
                        columns={columns}
                        dataSource={filteredTags}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            showSizeChanger: true,
                            hideOnSinglePage: totalCount <= 10,
                            showQuickJumper: true,
                            total: totalCount,
                            current: queryParams.offset,
                            pageSize: queryParams.limit,
                            onChange: (page, pageSize) => {
                                setQueryParams({
                                    ...queryParams,
                                    offset: page,
                                    limit: pageSize,
                                })
                            },
                            showTotal: (total) => __(`共 ${total} 条`),
                        }}
                    />
                </div>
            )}

            {modalVisible && (
                <EditTagManage
                    visible={modalVisible}
                    editId={editingTag?.id}
                    initialValues={{
                        ...editingTag,
                        related_models: editingTag?.related_models?.map(
                            (model: any) => model.id,
                        ),
                    }}
                    onFinish={() => {
                        setModalVisible(false)

                        setQueryParams({
                            ...queryParams,
                            offset: 1,
                        })
                    }}
                    onCancel={() => setModalVisible(false)}
                />
            )}

            <TagDetail
                visible={showModelDetail}
                data={detailData}
                onCancel={() => {
                    setShowModelDetail(false)
                    setDetailData(null)
                }}
            />
        </div>
    )
}

export default TagManagementForModel
