import __ from './locale'

export const menuManageData = [
    {
        title: __('场景分析'),
        key: 'data_analysis',
    },
    {
        title: __('数据应用'),
        key: 'data_application',
    },
    {
        title: __('指标管理'),
        key: 'index_management',
    },
    {
        title: __('维度模型'),
        key: 'dimension_model',
        children: [
            {
                title: __('维度模型管理'),
                key: 'dimension_model_management',
            },
        ],
    },
    {
        title: __('模型管理'),
        key: 'model_management',
        children: [
            {
                title: __('元模型'),
                key: 'meta_model',
            },
            {
                title: __('主题模型'),
                key: 'theme_model',
            },
            {
                title: __('专题模型'),
                key: 'special_model',
            },
        ],
    },
    {
        title: __('数据安全管理'),
        key: 'data_security_management',
        children: [
            {
                title: __('敏感数据白名单'),
                key: 'sensitive_data_whitelist',
            },
            {
                title: __('隐私数据保护'),
                key: 'privacy_data_protection',
            },
            {
                title: __('脱敏规则'),
                key: 'desensitization_rule',
            },
            {
                title: __('识别算法配置'),
                key: 'recognition_algorithm_configuration',
            },
        ],
    },
    {
        title: __('授权管理'),
        key: 'authorization_management',
    },
]
