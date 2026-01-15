import __ from './locale'
import { roleIconInfo } from '@/core/apis/configurationCenter/index.d'

const conbineSvg = (svgdata: string) => {
    return (
        <svg
            dangerouslySetInnerHTML={{
                __html: svgdata,
            }}
            viewBox="0 0 1024 1024"
        />
    )
}

const defaultColors = [
    '#126EE3',
    '#00BDD4',
    '#019688',
    '#FF8600',
    '#FFC106',
    '#854AC0',
    '#ED679F',
    '#374047',
    '#45639C',
    '#795648',
]

/**
 * 排序菜单
 */
const menus = [
    { key: 'created_at', label: __('按添加时间') },
    // { key: SortType.DEADLINE, label: '按截止时间' },
]

const getCurrentRoleIcon = (roleIcons: Array<roleIconInfo>, icon: string) => {
    if (!roleIcons.length) {
        return ''
    }
    return (
        roleIcons.find((roleIcon) => roleIcon.name === icon) || {
            icon: '',
        }
    ).icon
}

const userRoleTipsConfig = {
    普通用户: {
        definition: '企业或者组织面向数据使用的所有业务人员。',
        authorityScope: [
            '查看数据资源门户首页、资产全景、数据服务超市',
            '查看和申请数据资源',
            '管理个人的需求申请列表',
            '应用中心',
        ],
    },
    系统管理员: {
        definition: '',
        authorityScope: [
            '管理组织架构的信息',
            '管理用户和角色',
            '管理信息系统',
            '管理业务领域层级',
            '管理数据源的配置',
            '管理数据分级标签',
            '配置数据工作流程',
            '配置审核流程和审核策略',
            '配置编码生成规则',
            '查看审计中心',
        ],
    },
    数据开发工程师: {
        definition: '数据开发工程师主要负责数据开发相关工作的执行。',
        authorityScope: [
            '查看数据资源门户首页、资产全景、数据服务超市',
            '管理数据开发工作',
            '执行数据开发任务',
            '管理数据建模',
            '管理指标开发',
            '管理库表',
            '应用中心',
        ],
    },
    数据运营工程师: {
        definition:
            '数据运营工程师是数据治理工作的执行者。利用专项技能，支撑数据管家完成各项工作。',
        authorityScope: [
            '查看数据资源门户首页、资产全景、数据服务超市',
            '查看和申请数据资源',
            '管理业务模型',
            '管理数据标准',
            '管理数据运营功能模块',
            '执行数据运营任务',
            '管理库表',
            '管理指标开发',
            '管理接口服务',
            '管理数据目录',
            '应用中心',
        ],
    },
    数据Owner: {
        definition: '数据Owner是领域内数据治理工作的责任人。',
        authorityScope: [
            '查看数据资源门户首页、资产全景、数据服务超市',
            '审批各类数据资源申请',
            '查看业务模型',
            '查看数据标准',
            '授权管理',
            '应用中心',
        ],
    },
    数据管家: {
        definition:
            '数据管家是领域内数据治理工作的协助者，主要负责一些审核和维护工作。',
        authorityScope: [
            '查看数据资源门户首页、资产全景、数据服务超市',
            '查看和申请数据资源',
            '审批各类数据资源申请',
            '管理项目、分配任务',
            '查看业务模型',
            '查看数据标准',
            '应用中心',
        ],
    },
    应用开发者: {
        definition: __('使用库表、接口或指标进行应用开发的开发人员。'),
        authorityScope: [
            __('管理自己的“集成应用”'),
            __('查看数据服务超市'),
            __('为自己管理的“集成应用”申请数据权限'),
        ],
    },
    安全管理员: {
        definition: __('安全管理员主要负责管理和制定数据安全策略。'),
        authorityScope: [
            __('管理敏感数据白名单'),
            __('管理隐私数据保护策略'),
            __('管理脱敏规则'),
            __('查看库表数据信息'),
        ],
    },
    门户管理员: {
        definition: __(
            '可在内容管理中对首页、工作专区、平台服务进行信息展示配置操作',
        ),
    },
}

export {
    conbineSvg,
    defaultColors,
    menus,
    getCurrentRoleIcon,
    userRoleTipsConfig,
}
