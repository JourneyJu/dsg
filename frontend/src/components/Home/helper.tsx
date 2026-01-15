import React, { ReactNode } from 'react'
import {
    BgnModOutlined,
    DataAcquisitionOutlined,
    DataApplicationOutlined,
    DataGoverOutlined,
    DataAssertListColored,
    DataUnderstandingOutlined,
    DataServiceOutlined,
} from '@/icons'
import { getActualUrl } from '@/utils'

export interface IUserInfo {
    ID?: string
    Account?: string
    VisionName: string
    CsfLevel?: number
    Frozen?: boolean
    Authenticated: boolean
    Roles?: any
    Email?: string
    Telephone?: string
    ThirdAttr?: string
    ThirdID?: string
}

export interface IRole {
    id: string
    name: string
    color?: string
    icon?: string
    status?: number
    system?: number
    created_at?: string
    updated_at?: string
}

export const userInfoTest: IUserInfo = {
    ID: '5127528',
    VisionName: '管理员',
    Roles: [
        {
            id: '111',
            name: '数据采集管理员',
        },
        {
            id: '222',
            name: '数据管理员',
        },
        {
            id: '333',
            name: '数据加工管理员',
        },
        {
            id: '444',
            name: '数据质量管理员',
        },
        {
            id: '555',
            name: '业务运营管理员',
        },
        {
            id: '666',
            name: '项目管理员',
        },
    ],
    Authenticated: true,
}

// 公告-假数据
export const bulletinList = [
    {
        bid: '111',
        type: '1',
        typeInfo: '活动',
        content: '内容最新优惠活动',
        url: 'https://www.aishu.cn/cn/anyfabric-one',
    },
    {
        bid: '222',
        type: '2',
        typeInfo: '消息',
        content: '新增内容尚未通过审核，详细内容请查看消息通知',
        url: 'https://www.aishu.cn/cn/anyfabric-one',
    },
    {
        bid: '333',
        type: '3',
        typeInfo: '通知',
        content: '当前产品试用期即将截止，请你及时续费',
        url: 'https://www.aishu.cn/cn/anyfabric-one',
    },
    {
        bid: '444',
        type: '3',
        typeInfo: '通知',
        content: '1月AnyFabric更新升级计划通知',
        url: 'https://www.aishu.cn/cn/anyfabric-one',
    },
    {
        bid: '555',
        type: '2',
        typeInfo: '消息',
        content: '新增内容尚未通过审核，详细内容请查看消息通知',
        url: 'https://www.aishu.cn/cn/anyfabric-one',
    },
]

export interface IFuncMouleList {
    moduleName: string
    moduleIcon: any
    subModuleList: Array<ISubFunMod>
    access?: string[]
}

/**
 * @param accessUrl 权限路径，若存在,则点击跳转链接为access中有权限的第一个页面
 */
export interface ISubFunMod {
    subModuleName: string
    subModUrl: string
    isAFContainFunc: boolean
    subModuleIcon?: ReactNode
    access?: string[]
    accessUrl?: any
}

export interface IPath {
    name: string
    addr: string
}

/**
 * 配置路径
 * @params BusinessStandard    业务标准
 * @params StandardizationTaskMng    元数据平台-任务管理
 * @params BusinessKnowledgeNetwork    业务知识网络
 * @params DataAcquisition   数据采集
 * @params Metadata    元数据管理
 * @params DataQualit  数据质量
 * @params DataProcessing  数据加工
 * @params BusinessBrain  产业大脑
 * @params DigitalizeCenter 数字化运营中心
 * @params ProjectCenter 项目360
 */
export interface IConfigPaths {
    BusinessStandard?: string
    StandardizationTaskMng?: string
    BusinessKnowledgeNetwork?: string
    DataAcquisition?: string
    Metadata?: string
    DataQuality?: string
    DataProcessing?: string
}

// 通用配置路径
export const configPathsCommon = {
    BusinessStandard: 'http://36.152.209.113:9001/standards/manage/dataelement',
    StandardizationTaskMng:
        'https://testing-standardization.aishu.cn/standards/manage/taskmanage',
    BusinessKnowledgeNetwork: 'https://10.4.132.124/login',
    DataAcquisition:
        'http://36.152.209.113:12345/dolphinscheduler/ui/projects/list',
    Metadata: 'http://36.152.209.113:12345/dolphinscheduler/ui/datasource',
    DataQuality:
        'http://36.152.209.113:12345/dolphinscheduler/ui/data-quality/task-result',
    DataProcessing:
        'http://36.152.209.113:12345/dolphinscheduler/ui/projects/list',
}

// 配置固定路径path
export const fixedPaths = {
    Metadata: '/dolphinscheduler/ui/datasource',
    DataQuality: '/dolphinscheduler/ui/data-quality/task-result',
    DataProcessing: '/dolphinscheduler/ui/projects/list',
    StandardizationTaskMng: '/standards/manage/taskmanage',
}

// 智能应用预置数据
export const intelligentAppCommon = [
    { name: '产业大脑', addr: 'http://10.4.109.44:30000/home/homePage' },
    { name: '数字化运营中心', addr: 'http://10.4.130.189/link/CTAp2BTX' },
    { name: '项目360°', addr: 'http://10.4.34.35:8080' },
]

// 获取功能导航
export const getFunModuleList = (
    config?: IConfigPaths,
): Array<IFuncMouleList> => {
    return [
        {
            moduleName: '数据智能应用',
            moduleIcon: <DataUnderstandingOutlined />,
            subModuleList: [
                // {
                //     subModuleName: '产业大脑',
                //     subModUrl:
                //         config?.BusinessBrain ||
                //         configPathsCommon.BusinessBrain,
                //     isAFContainFunc: false,
                // },
                // {
                //     subModuleName: '数字化运营中心',
                //     subModUrl:
                //         config?.DigitalizeCenter ||
                //         configPathsCommon.DigitalizeCenter,
                //     isAFContainFunc: false,
                // },
                // {
                //     subModuleName: '项目360°',
                //     subModUrl:
                //         config?.ProjectCenter ||
                //         configPathsCommon.ProjectCenter,
                //     isAFContainFunc: false,
                // },
            ],
        },

        {
            moduleName: '数据智能运营',
            moduleIcon: <DataApplicationOutlined />,
            subModuleList: [
                {
                    subModuleName: '数据资产全景',
                    subModUrl: getActualUrl('/asset-view'),
                    isAFContainFunc: false,
                    subModuleIcon: <DataServiceOutlined />,
                    // access: [accessScene.data_asset_overview],
                },
                {
                    subModuleName: '统一数据搜索',
                    subModUrl: getActualUrl(`/data-assets`),
                    isAFContainFunc: false,
                    subModuleIcon: <DataAcquisitionOutlined />,
                    // access: [accessScene.data_resource_catalog_data_catalog],
                },
                {
                    subModuleName: '数据服务超市',
                    subModUrl: getActualUrl(`/data-assets`),
                    isAFContainFunc: false,
                    subModuleIcon: <DataAssertListColored />,
                    // access: [accessScene.data_resource_catalog_data_catalog],
                },
            ],
        },
        {
            moduleName: '业务梳理',
            moduleIcon: <DataAcquisitionOutlined />,
            subModuleList: [
                {
                    subModuleName: '业务标准',
                    subModUrl: '/standards/business-domain',
                    isAFContainFunc: true,
                    // access: [accessScene.biz_domain, accessScene.data_standard],
                    // accessUrl: {
                    //     [accessScene.biz_domain]: getActualUrl(
                    //         '/standards/business-domain',
                    //     ),
                    //     [accessScene.data_standard]: getActualUrl(
                    //         '/standards/dataelement',
                    //     ),
                    // },
                },
                {
                    subModuleName: '业务模型',
                    subModUrl: '/business/domain',
                    isAFContainFunc: true,
                    // access: [accessScene.biz_model],
                },
            ],
        },
        {
            moduleName: '数据运营管理',
            moduleIcon: <DataServiceOutlined />,
            subModuleList: [
                {
                    subModuleName: '数据需求管理',
                    subModUrl: getActualUrl('/demand-mgt'),
                    isAFContainFunc: true,
                    // access: [
                    //     accessScene.data_feature,
                    //     accessScene.data_feature_analyze,
                    // ],
                    // accessUrl: {
                    //     [accessScene.data_feature]: getActualUrl('/demand-mgt'),
                    //     [accessScene.data_feature_analyze]: getActualUrl(
                    //         '/dataService/requirementAnalysisList',
                    //     ),
                    // },
                },
                {
                    subModuleName: '数据目录管理',
                    subModUrl: getActualUrl('/dataService/dataContent'),
                    isAFContainFunc: true,
                    // access: [accessScene.data_resource_catalog],
                },
                {
                    subModuleName: '数据探查理解',
                    subModUrl: getActualUrl(
                        '/dataService/dataCatalogUnderstanding',
                    ),
                    isAFContainFunc: true,
                    // access: [accessScene.data_comprehension],
                },
                {
                    subModuleName: '接口服务管理',
                    subModUrl: getActualUrl('/dataService/interfaceService'),
                    isAFContainFunc: true,
                    // access: [accessScene.service_management],
                },
            ],
        },
        {
            moduleName: '数据开发治理',
            moduleIcon: <DataGoverOutlined />,
            subModuleList: [
                {
                    subModuleName: '数据连接',
                    subModUrl:
                        config?.DataQuality || configPathsCommon.DataQuality,
                    isAFContainFunc: false,
                    // access: [accessScene.data_connection],
                },
                {
                    subModuleName: '元数据管理',
                    subModUrl: config?.Metadata || configPathsCommon.Metadata,
                    isAFContainFunc: false,
                    // access: [accessScene.metadata],
                },
                {
                    subModuleName: '数据加工',
                    subModUrl:
                        config?.DataProcessing ||
                        configPathsCommon.DataProcessing,
                    isAFContainFunc: false,
                    // access: [accessScene.data_processing],
                },
                {
                    subModuleName: '数据质量',
                    subModUrl:
                        config?.DataQuality || configPathsCommon.DataQuality,
                    isAFContainFunc: false,
                    // access: [accessScene.data_quality],
                },
                {
                    subModuleName: '数据安全',
                    subModUrl: '/data-catalog/developing',
                    isAFContainFunc: false,
                    // access: [accessScene.data_security],
                },
            ],
        },
    ]
}

export interface IBeginCard {
    key: string
    tabTitle: string
    disabled?: boolean
    children: Array<{
        icon: React.ReactElement
        title: string
        desc: string
        url: string
    }>
    moreLink: string
}

// 新手入门
export const beginCardList: Array<IBeginCard> = [
    {
        key: '1',
        tabTitle: '快速入门',
        children: [
            {
                icon: <BgnModOutlined />,
                title: '快速入门',
                desc: '一张图深入浅出对AnyFabric进行介绍，快来阅读吧',
                url: 'https://www.aishu.cn/cn/anyfabric-one',
            },
            {
                icon: <BgnModOutlined />,
                title: 'AnyFabric价值解析',
                desc: '六个维度描述AF的核心价值',
                url: 'https://www.aishu.cn/cn/anyfabric-one',
            },
            {
                icon: <BgnModOutlined />,
                title: '基础配置引导',
                desc: '为了保证功能正常使用，先完成一些基础配置吧',
                url: 'https://www.aishu.cn/cn/anyfabric-one',
            },
            {
                icon: <BgnModOutlined />,
                title: '快速了解业务模型',
                desc: '业务模型是什么？包含哪些内容快来看看吧',
                url: 'https://www.aishu.cn/cn/anyfabric-one',
            },
        ],
        moreLink: 'https://www.aishu.cn/cn/anyfabric-one',
    },
    {
        key: '2',
        tabTitle: '最佳实践',
        disabled: true,
        children: [
            {
                icon: <BgnModOutlined />,
                title: '快速入门2',
                desc: '一张图深入浅出对AnyFabric进行介绍，快来阅读吧',
                url: 'https://www.aishu.cn/cn/anyfabric-one',
            },
            {
                icon: <BgnModOutlined />,
                title: 'AnyFabric价值解析',
                desc: '六个维度描述AF的核心价值',
                url: 'https://www.aishu.cn/cn/anyfabric-one',
            },
            {
                icon: <BgnModOutlined />,
                title: '基础配置引导',
                desc: '为了保证功能正常使用，先完成一些基础配置吧',
                url: 'https://www.aishu.cn/cn/anyfabric-one',
            },
            {
                icon: <BgnModOutlined />,
                title: '快速了解业务模型',
                desc: '业务模型是什么？包含哪些内容快来看看吧',
                url: 'https://www.aishu.cn/cn/anyfabric-one',
            },
        ],
        moreLink: 'https://www.aishu.cn/cn/anyfabric-one',
    },
    {
        key: '3',
        tabTitle: '视频教学',
        disabled: true,
        children: [
            {
                icon: <BgnModOutlined />,
                title: '快速入门3',
                desc: '一张图深入浅出对AnyFabric进行介绍，快来阅读吧',
                url: 'https://www.aishu.cn/cn/anyfabric-one',
            },
            {
                icon: <BgnModOutlined />,
                title: 'AnyFabric价值解析',
                desc: '六个维度描述AF的核心价值',
                url: 'https://www.aishu.cn/cn/anyfabric-one',
            },
            {
                icon: <BgnModOutlined />,
                title: '基础配置引导',
                desc: '为了保证功能正常使用，先完成一些基础配置吧',
                url: 'https://www.aishu.cn/cn/anyfabric-one',
            },
            {
                icon: <BgnModOutlined />,
                title: '快速了解业务模型',
                desc: '业务模型是什么？包含哪些内容快来看看吧',
                url: 'https://www.aishu.cn/cn/anyfabric-one',
            },
        ],
        moreLink: 'https://www.aishu.cn/cn/anyfabric-one',
    },
]
