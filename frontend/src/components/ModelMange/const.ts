import {
    checkModelNameRepeat,
    formatError,
    SortDirection,
    SortType,
} from '@/core'
import __ from './locale'

export type SortOrder = 'descend' | 'ascend' | null

// 模型管理操作
export enum ModelManageAction {
    // 详情
    DETAIL = 'detail',
    // 基础信息
    BASIC_INFO = 'basic_info',
    // 编辑
    EDIT = 'edit',
    // 删除
    DELETE = 'delete',
    // 设置密级
    SET_LEVEL = 'set_level',
}
/**
 * 主题模型排序菜单
 */
export const ModelSortMenus = [
    { key: SortType.BUSINESS_NAME, label: __('按名称排序') },
    { key: SortType.UPDATED, label: __('按更新时间排序') },
    { key: SortType.CREATED, label: __('按创建时间排序') },
]

/**
 * 默认排序
 */
export const defaultMenu = {
    key: SortType.UPDATED,
    sort: SortDirection.DESC,
}

/**
 * 默认上报应用查询参数
 */
export const DefaultModelQuery = {
    keyword: '', // 关键词
    direction: SortDirection.DESC, // 排序方向
    sort: 'updated_at', // 排序字段 申请时间
    limit: 10, // 每页条数
    offset: 1, // 当前页码
}

/**
 * 模型类型
 */
export enum ModelType {
    // 主题模型
    THEME_MODEL = 'thematic',
    // 专题模型
    SPECIAL_MODEL = 'topic',
    // 元模型
    META_MODEL = 'meta',
}

/**
 * 模型类型列表
 */
export const ModelTabList = [
    {
        key: ModelType.META_MODEL,
        label: __('元模型'),
    },
    {
        key: ModelType.THEME_MODEL,
        label: __('主题模型'),
    },
    {
        key: ModelType.SPECIAL_MODEL,
        label: __('专题模型'),
    },
]

export const FIT_PAGE_PADDING = 20

// 查看模式
export enum ViewModel {
    // 查看
    VIEW = 'view',
    // 编辑
    EDIT = 'edit',
    // 可展开预览
    EXPAND_VIEW = 'expand_view',
}

// 节点展开状态
export enum NodeExpandStatus {
    // 展开
    EXPAND = 'expand',
    // 收起
    FOLD = 'fold',
}

/**
 * 主题模型管理使用场景
 */
export enum ThemeModelManageMode {
    // 默认模式 - 完整功能（新建、编辑、删除等）
    DEFAULT = 'default',
    // 密级管理模式 - 用于密级设置场景
    LEVEL_MODE = 'level_mode',
    // 目录管理模式 - 用于数据目录管理，只读查看
    DIR_MODE = 'dir_mode',
}

/**
 * 获取搜索字段
 */
export const searchFieldData = (data: Array<any>, searchKey: string) => {
    if (searchKey) {
        const searchData = data.filter((item) => {
            return (
                item.business_name
                    .toLowerCase()
                    .includes(searchKey.trim().toLowerCase()) ||
                item.technical_name
                    .toLowerCase()
                    .includes(searchKey.trim().toLowerCase())
            )
        })
        return searchData
    }
    return data
}

/**
 * 关联关系配置
 */
export const RelationConfig = [
    {
        key: 'business_name',
        label: __('业务名称'),
        span: 24,
    },
    {
        key: 'technical_name',
        label: __('技术名称'),
        span: 24,
    },
    {
        key: 'description',
        label: __('描述'),
        span: 24,
    },
    {
        key: 'start_end_Model',
        label: __('起点模型和终点模型'),
        span: 24,
    },
]

/**
 * 验证模型名称是否重复
 */
export const validateModelNameRepeat = async (params: {
    business_name?: string
    technical_name?: string
    id?: string
}) => {
    try {
        const res = await checkModelNameRepeat(params)
        if (res.repeat) {
            let message = ''
            if (params.business_name) {
                message = __('业务名称已存在')
            } else if (params.technical_name) {
                message = __('技术名称已存在')
            }
            return Promise.reject(new Error(message))
        }
        return Promise.resolve()
    } catch (error) {
        formatError(error)
        return Promise.reject(new Error(error.data.description))
    }
}
