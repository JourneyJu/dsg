import __ from '../locale'
// 元数据配置项
export const MetaDataConfigs = [
    {
        key: 'catalog_id',
        label: __('关联库表'),
        span: 24,
    },
    {
        key: 'business_name',
        label: __('元模型业务名称'),
        span: 12,
    },
    {
        key: 'technical_name',
        label: __('元模型技术名称'),
        span: 12,
    },
    {
        key: 'description',
        label: '元模型描述',
        span: 24,
    },
    {
        key: 'fields',
        label: __('字段配置'),
        span: 24,
    },
]

// 字段错误状态
export enum FieldErrorStatus {
    // 重复
    DUPLICATE = 'duplicate',
    // 必填
    REQUIRED = 'required',
    // 不合法
    INVALID = 'invalid',
    // 正常
    NORMAL = 'normal',
}

/**
 * 字段错误状态映射
 */
export const FieldErrorStatusMap = {
    [FieldErrorStatus.DUPLICATE]: __('字段名称已存在'),
    [FieldErrorStatus.REQUIRED]: __('字段名称不能为空'),
    [FieldErrorStatus.INVALID]: __('支持中英文、数字、下划线及中划线'),
}
