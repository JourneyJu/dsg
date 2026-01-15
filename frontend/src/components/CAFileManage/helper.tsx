import { trim } from 'lodash'
import { SortDirection, CAFileType, CAFileTreeType } from '@/core'
import { IformItem, SearchType } from '@/ui/LightweightSearch/const'
import { StateType } from '@/utils'

import __ from './locale'

export const viewModeItems = [
    { label: __('文件类型'), value: CAFileTreeType.FileType },
    { label: __('组织架构'), value: CAFileTreeType.Department },
    { label: __('信息系统'), value: CAFileTreeType.InfoSystem },
    { label: __('业务架构'), value: CAFileTreeType.BusinessDomain },
]

// 文件类型
export const fileTypeOptions: any = [
    {
        label: __('标准规范文件'),
        value: CAFileType.Standard,
    },
    {
        label: __('三定职责文件'),
        value: CAFileType.Responsibility,
    },
    {
        label: __('建设依据文件'),
        value: CAFileType.ConstructionBasis,
    },
    {
        label: __('建设内容文件'),
        value: CAFileType.ConstructionContent,
    },
]

export const allFileTypeOptions = [
    {
        label: __('全部'),
        value: CAFileType.ALL,
    },
    ...fileTypeOptions,
]

export const FileTypeTreeList = [
    {
        id: CAFileTreeType.FileType,
        name: __('文件类型'),
    },
]

// 文件列表中的排序字段类型
export enum FileSorterType {
    CREATED = 'created_at',
    FILENAME = 'name',
}

export const defaultMenu = {
    key: FileSorterType.CREATED,
    sort: SortDirection.DESC,
}

export const menus = [
    { key: FileSorterType.FILENAME, label: '按文件名称排序' },
    { key: FileSorterType.CREATED, label: '按创建时间排序' },
]

export const searchData: IformItem[] = [
    {
        label: __('文件类型'),
        key: 'type',
        options: allFileTypeOptions,
        type: SearchType.Radio,
    },
    {
        label: __('创建时间'),
        key: 'created_at',
        type: SearchType.RangePicker,
        options: [],
    },
]

// 文件详情模块分类
export enum FileDetailBasicModType {
    StandardFile = 'standardFile',
    BasicInfo = 'basicInfo',
    AssociatedDataEle = 'associatedDataEle',
    AssociatedCodeTable = 'associatedCodeTable',
    AssociatedCodeRule = 'associatedCodeRule',
    Version = 'version',
}

// 文件详情显示内容config
export const fileDetailConfig = {
    [FileDetailBasicModType.StandardFile]: [
        {
            key: 'attachment_type',
            label: __('文件类型'),
        },
        {
            key: 'file_name',
            label: __('文件'),
        },
        {
            key: 'attachment_url',
            label: __('链接地址'),
        },
    ],
    [FileDetailBasicModType.BasicInfo]: [
        {
            key: 'catalog_name',
            label: __('所属目录'),
        },
        {
            key: 'name',
            label: __('标准文件名称'),
        },
        {
            key: 'number',
            label: __('标准编号'),
        },
        {
            key: 'caFile_type',
            label: __('标准分类'),
        },
        {
            key: 'act_date',
            label: __('实施日期'),
        },
        {
            key: 'disable_date',
            label: __('停用日期'),
        },
        {
            key: 'state',
            label: __('状态'),
        },
        {
            key: 'disable_reason',
            label: __('停用原因'),
        },
        {
            key: 'description',
            label: __('说明'),
        },
    ],
    [FileDetailBasicModType.AssociatedDataEle]: [
        {
            key: 'dataEleList',
            label: __('数据元'),
        },
    ],
    [FileDetailBasicModType.AssociatedCodeTable]: [
        {
            key: 'codeTableList',
            label: __('码表'),
        },
    ],
    [FileDetailBasicModType.AssociatedCodeRule]: [
        {
            key: 'codeRuleList',
            label: __('编码规则'),
        },
    ],
    [FileDetailBasicModType.Version]: [
        {
            key: 'version',
            label: __('当前版本号'),
        },
        {
            key: 'update_user',
            label: __('最终修改人'),
        },
        {
            key: 'update_time',
            label: __('最终修改时间'),
        },
        {
            key: 'create_user',
            label: __('创建人'),
        },
        {
            key: 'create_time',
            label: __('创建时间'),
        },
    ],
}

export const fileDetailMods = [
    {
        modKey: FileDetailBasicModType.StandardFile,
        title: __('文件信息'),
        config: fileDetailConfig[FileDetailBasicModType.StandardFile],
    },
    {
        modKey: FileDetailBasicModType.BasicInfo,
        title: __('基本属性'),
        config: fileDetailConfig[FileDetailBasicModType.BasicInfo],
    },
    {
        modKey: FileDetailBasicModType.AssociatedDataEle,
        title: __('关联数据元'),
        config: fileDetailConfig[FileDetailBasicModType.AssociatedDataEle],
        // 表格展示数据为单独使用接口获取的数组
        type: 'list',
    },
    {
        modKey: FileDetailBasicModType.AssociatedCodeTable,
        title: __('关联码表'),
        config: fileDetailConfig[FileDetailBasicModType.AssociatedCodeTable],
        // 表格展示数据为单独使用接口获取的数组
        type: 'list',
    },
    {
        modKey: FileDetailBasicModType.AssociatedCodeRule,
        title: __('关联编码规则'),
        config: fileDetailConfig[FileDetailBasicModType.AssociatedCodeRule],
        // 表格展示数据为单独使用接口获取的数组
        type: 'list',
    },
    {
        modKey: FileDetailBasicModType.Version,
        title: __('版本信息'),
        config: fileDetailConfig[FileDetailBasicModType.Version],
    },
]

/**
 * 查询参数
 */
export interface ISearchCondition {
    // 选择目录的id
    catalog_id: number | string
    // 页数，默认1
    offset?: number
    // 每页数量，默认5条
    limit?: number
    // 创建时间
    created_at?: any
    // 标准文件类型
    caFile_type?: number
    // 启用状态
    state?: StateType
    // 搜索关键字
    keyword?: string
    // 排序字段
    sort: FileSorterType
    // 排序方向
    direction?: SortDirection
}

export const detailConfig = [
    {
        key: 'fileName',
        label: __('文件名称'),
        span: 24,
        style: {
            alignItem: 'center',
        },
    },
    {
        key: 'type',
        label: __('文件类型'),
        span: 24,
    },
    {
        key: 'created_at',
        label: __('创建时间'),
        span: 24,
    },
]
