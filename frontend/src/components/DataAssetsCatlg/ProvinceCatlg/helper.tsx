import Icon from '@ant-design/icons'
import {
    IGetSSZDCatalogParams,
    PrvcCatlgRescType,
    SortDirection,
    SortType,
} from '@/core'
import __ from './locale'
import { DepartmentOutlined } from '@/icons'
import styles from './styles.module.less'

import { ReactComponent as businessSystem } from '@/icons/svg/outlined/businessSystem.svg'
import { ReactComponent as library } from '@/assets/DataAssetsCatlg/library.svg'
import { ReactComponent as buildTree } from '@/assets/DataAssetsCatlg/buildTree.svg'
import { ReactComponent as userOutlined } from '@/assets/DataAssetsCatlg/userOutlined.svg'
import { IFilterCondition, shareCondition } from '../helper'
import { FilterConditionEleType } from '../FilterConditionLayout'

// 共享类型 1 无条件共享 2 有条件共享 = '3' 不予共享
export enum PCatlgShareTypeEnum {
    UNCONDITION = '1',
    CONDITION = '2',
    NOSHARE = '3',
}

export const pCatlgShareTypeMap = {
    [PCatlgShareTypeEnum.UNCONDITION]: '无条件共享',
    [PCatlgShareTypeEnum.CONDITION]: '有条件共享',
    [PCatlgShareTypeEnum.NOSHARE]: '不予共享',
}

export const pCatlgShareTypeList: Array<any> = [
    {
        key: PCatlgShareTypeEnum.UNCONDITION,
        value: PCatlgShareTypeEnum.UNCONDITION,
        label: '无条件共享',
    },
    {
        key: PCatlgShareTypeEnum.CONDITION,
        value: PCatlgShareTypeEnum.CONDITION,
        label: '有条件共享',
    },
    {
        key: PCatlgShareTypeEnum.NOSHARE,
        value: PCatlgShareTypeEnum.NOSHARE,
        label: '不予共享',
    },
]

export const unlimited = { label: __('不限'), value: '', key: '' }

// 省级数据目录-筛选条件
export const provinceCatlgFilterConfig: Array<IFilterCondition> = [
    {
        key: 'share_type',
        type: FilterConditionEleType.MULTIPLE,
        open: false,
        label: __('共享类型'),
        expandAll: true,
        options: shareCondition,
        value: [],
    },
]

/**
 * 省级目录详情展示tab项
 */
export enum PrvcCatlgDetailTabKey {
    // 基本信息
    BASICINFO = 'basicInfo',

    // 信息项
    ITEMS = 'items',

    // 库表资源
    DBRESC = PrvcCatlgRescType.DB,

    // 接口资源
    APIRESC = PrvcCatlgRescType.API,

    // 文件资源
    FILERESC = PrvcCatlgRescType.File,
}

export const PrvcCatlgRescTypeList = {
    [PrvcCatlgDetailTabKey.DBRESC]: __('库表'),
    [PrvcCatlgDetailTabKey.APIRESC]: __('接口'),
    [PrvcCatlgDetailTabKey.FILERESC]: __('文件'),
}

export const PrvcCatlgDetailTabKeyList = {
    [PrvcCatlgDetailTabKey.BASICINFO]: __('基本信息'),
    [PrvcCatlgDetailTabKey.ITEMS]: __('信息项'),
    [PrvcCatlgDetailTabKey.DBRESC]: __('库表资源'),
    [PrvcCatlgDetailTabKey.APIRESC]: __('接口资源'),
    [PrvcCatlgDetailTabKey.FILERESC]: __('文件资源'),
}

export const provinceCatlgFilterInit: IGetSSZDCatalogParams = {
    org_code: '',
    share_type: [],
    keyword: '',
    offset: 1,
    limit: 20,
    sort: SortType.CREATED,
    direction: SortDirection.DESC,
}

// 服务状态-1：生效中，0：已撤销
export enum ServiceStatusEnum {
    EFFECTIVE = '1',
    REVOKED = '0',
}

export const serviceStatusList = [
    {
        key: ServiceStatusEnum.EFFECTIVE,
        label: '生效中',
    },
    {
        key: ServiceStatusEnum.REVOKED,
        label: '已撤销',
    },
]

// 调度类型
export enum ScheduleTypeEnum {
    // none：一次性
    NONE = 'none',
    // minute：按分钟
    MINUTE = 'minute',
    // hourofday：按天
    HOUR_OF_DAY = 'hourofday',
    // weekday：按周
    WEEKDAY = 'weekday',
    // dayOfMonth：按月
    DAY_OF_MONTH = 'dayOfMonth',
}

export const scheduleTypeMap = {
    [ScheduleTypeEnum.NONE]: '一次性',
    [ScheduleTypeEnum.MINUTE]: '每分钟',
    [ScheduleTypeEnum.HOUR_OF_DAY]: '每天',
    [ScheduleTypeEnum.WEEKDAY]: '每周',
    [ScheduleTypeEnum.DAY_OF_MONTH]: '每月',
}

export const dayOfWeek = (day: string) => {
    switch (day) {
        case '1':
            return '一'
        case '2':
            return '二'
        case '3':
            return '三'
        case '4':
            return '四'
        case '5':
            return '五'
        case '6':
            return '六'
        case '7':
            return '日'
        default:
            return '未知'
    }
}

export const scheduleTypeList = [
    {
        key: ScheduleTypeEnum.NONE,
        label: '一次性',
    },
    {
        key: ScheduleTypeEnum.MINUTE,
        label: '按分钟',
    },
    {
        key: ScheduleTypeEnum.HOUR_OF_DAY,
        label: '按天',
    },
    {
        key: ScheduleTypeEnum.WEEKDAY,
        label: '按周',
    },
    {
        key: ScheduleTypeEnum.DAY_OF_MONTH,
        label: '按月',
    },
]

// 传输模式
export enum PrvcCatlgTransmitModeEnum {
    ONCE = 'ONCE',
    PERIOD = 'PERIOD',
}

export const transmitModeMap = {
    [PrvcCatlgTransmitModeEnum.ONCE]: '一次性',
    [PrvcCatlgTransmitModeEnum.PERIOD]: '周期性',
}

export const transmitModeList = [
    {
        key: 'ONCE',
        label: '一次性',
    },
    {
        key: 'PERIOD',
        label: '周期性',
    },
]

// ContentType
export enum ContentTypeEnum {
    APPLICATION_JSON = 'application/json',
    APPLICATION_XML = 'application/xml',
    APPLICATION_X_WWW_FORM_URLENCODED = 'application/x-www-form-urlencoded',
    MULTIPART_FORM_DATA = 'multipart/form-data',
    TEXT_PLAIN_CHARSET_UTF_8 = 'text/plain;charset=utf-8',
    OTHERS = 'others',
}

export const contentTypeList = [
    { key: ContentTypeEnum.APPLICATION_JSON, label: 'application/json' },
    { key: ContentTypeEnum.APPLICATION_XML, label: 'application/xml' },
    {
        key: ContentTypeEnum.APPLICATION_X_WWW_FORM_URLENCODED,
        label: 'application/x-www-form-urlencoded',
    },
    { key: ContentTypeEnum.MULTIPART_FORM_DATA, label: 'multipart/form-data' },
    {
        key: ContentTypeEnum.TEXT_PLAIN_CHARSET_UTF_8,
        label: 'text/plain;charset=utf-8',
    },
    { key: ContentTypeEnum.OTHERS, label: 'others' },
]

// 列表-库表卡片-参数详情项
export const viewCardBaiscInfoList = [
    // {
    //     label: __('资源类型：'),
    //     value: '',
    //     key: 'resource_groups',
    //     span: 24,
    // },
    {
        label: __('描述：'),
        value: '',
        key: 'abstract',
        span: 24,
    },
]

// 业务逻辑实体列表项参数
export const itemOtherInfo = [
    {
        infoKey: 'updated_at',
        type: 'timestamp',
        title: `${__('更新时间')} `,
    },
    {
        infoKey: 'system_name',
        title: (
            <Icon
                component={businessSystem}
                className={styles.commonIcon}
                style={{ fontSize: 16 }}
            />
        ),
        toolTipTitle: `${__('信息系统')}：`,
    },
    {
        infoKey: 'data_source_name',
        title: (
            <Icon
                component={library}
                className={styles.commonIcon}
                style={{ fontSize: 16 }}
            />
        ),
        toolTipTitle: `${__('数据源')}：`,
    },
    {
        infoKey: 'schema_name',
        title: (
            <Icon
                component={buildTree}
                className={styles.commonIcon}
                style={{ fontSize: 16 }}
            />
        ),
        toolTipTitle: `${__('Schema')}：`,
    },
    {
        infoKey: 'owner_name',
        title: (
            <Icon
                component={userOutlined}
                className={styles.commonIcon}
                style={{ fontSize: 16 }}
            />
        ),
        toolTipTitle: `${__('数据Owner')}：`,
    },
    {
        infoKey: 'orgname',
        title: (
            <DepartmentOutlined
                className={styles.commonIcon}
                style={{ fontSize: 16 }}
            />
        ),
        toolTipTitle: `${__('所属部门')}：`,
    },
]

export const cardRescInfo = {
    [PrvcCatlgRescType.API]: [
        {
            key: 'resource_name',
            label: __('资源名称：'),
        },
        {
            key: 'resource_desc',
            label: __('资源描述：'),
        },
    ],
    [PrvcCatlgRescType.DB]: [
        {
            key: 'resource_name',
            label: __('资源名称：'),
        },
        {
            key: 'resource_desc',
            label: __('资源描述：'),
        },
    ],
    [PrvcCatlgRescType.File]: [
        {
            key: 'resource_name',
            label: __('资源名称：'),
        },
        {
            key: 'resource_desc',
            label: __('资源描述：'),
        },
    ],
}

export const fileDetailConfig = [
    {
        label: __('资源名称'),
        value: '',
        key: 'resource_name',
        span: 8,
    },
    {
        label: __('资源类型'),
        value: PrvcCatlgRescTypeList[PrvcCatlgDetailTabKey.FILERESC],
        key: '',
        span: 8,
    },
    {
        label: __('资源状态'),
        value: '',
        key: 'status',
        options: serviceStatusList,
        span: 8,
    },
    {
        label: __('传输模式'),
        value: '',
        key: 'transmit_mode',
        span: 8,
        options: transmitModeList,
    },
    {
        label: __('调度方式'),
        value: '',
        key: 'schedule_type',
        span: 8,
    },
    {
        label: __('描述'),
        value: '',
        key: 'resource_desc',
        span: 24,
    },
]

export const dbRescBasicDetailConfig = [
    {
        label: __('资源名称'),
        value: '',
        key: 'resource_name',
        span: 8,
    },
    {
        label: __('资源类型'),
        value: PrvcCatlgRescTypeList[PrvcCatlgDetailTabKey.DBRESC],
        key: '',
        span: 8,
    },
    {
        label: __('资源状态'),
        key: 'status',
        value: '',
        options: serviceStatusList,
        span: 8,
    },
    {
        label: __('传输模式'),
        value: '',
        key: 'transmit_mode',
        span: 8,
        options: transmitModeList,
    },
    {
        label: __('调度方式'),
        value: '',
        key: 'schedule_type',
        span: 8,
    },
    {
        label: __('描述'),
        value: '',

        key: 'resource_desc',
        span: 24,
    },
]

export const apiRescBasicDetailConfig = [
    {
        label: __('资源名称'),
        value: '',
        key: 'resource_name',
        span: 8,
    },
    {
        label: __('资源类型'),
        value: PrvcCatlgRescTypeList[PrvcCatlgDetailTabKey.APIRESC],
        key: '',
        span: 8,
    },
    {
        label: __('资源状态'),
        key: 'status',
        value: '',
        options: serviceStatusList,
        span: 8,
    },
    { label: __('服务路径'), value: '', key: 'path', span: 8 },
    {
        label: __('服务地址'),
        value: '',
        key: 'address',
        span: 8,
    },
    {
        label: __('请求方式'),
        value: '',
        key: 'http_method',
        span: 8,
    },
    {
        label: __('服务协议'),
        value: '',
        key: 'schemes',
        span: 8,
    },
    {
        label: __('服务请求报文格式'),
        value: '',
        key: 'request_content_type',
        span: 8,
    },
    {
        label: __('服务响应报文格式'),
        value: '',
        key: 'response_content_type',
        span: 8,
    },
    {
        label: __('描述'),
        value: '',
        key: 'resource_desc',
        span: 24,
    },
]

// 开放类型
export const enum PCatlgOpenTypeEnum {
    // 无条件开放
    NOCONDITION = '1',
    // 有条件开放
    SPECIFYCONDITION = '2',
    // 不予开放
    NOTOPEN = '3',
}

export const pCatlgOpenTypeMap = {
    [PCatlgOpenTypeEnum.NOCONDITION]: '无条件开放',
    [PCatlgOpenTypeEnum.SPECIFYCONDITION]: '有条件开放',
    [PCatlgOpenTypeEnum.NOTOPEN]: '不予开放',
}

export const pCatlgOpenTypeList: Array<any> = [
    {
        key: PCatlgOpenTypeEnum.NOCONDITION,
        label: '向公众开放',
    },
    {
        key: PCatlgOpenTypeEnum.SPECIFYCONDITION,
        label: '不向公众开放',
    },
    {
        key: PCatlgOpenTypeEnum.NOTOPEN,
        label: '不予开放',
    },
]

// 数据所属层级类型
export const enum PCatlgBelongLevelEnum {
    // 国家级
    NATION = '1',
    // 省级
    PROVINCE = '2',
    // 市级
    CITY = '3',
    // 县（区）级
    COUNTY = '4',
}

export const pCatlgBelongLevelList: Array<any> = [
    {
        key: PCatlgBelongLevelEnum.NATION,
        label: '国家级',
    },
    {
        key: PCatlgBelongLevelEnum.PROVINCE,
        label: '省级',
    },
    {
        key: PCatlgBelongLevelEnum.CITY,
        label: '市级',
    },
    {
        key: PCatlgBelongLevelEnum.COUNTY,
        label: '县（区）级',
    },
]

// 数据分级类型
export const enum PCatlgClassificationEnum {
    // 一般数据
    GENERAL = '1',
    // 重要数据
    IMPORTANT = '2',
    // 核心数据
    CORE = '3',
}

export const pCatlgClassificationMap = {
    [PCatlgClassificationEnum.GENERAL]: '一般数据',
    [PCatlgClassificationEnum.IMPORTANT]: '重要数据',
    [PCatlgClassificationEnum.CORE]: '核心数据',
}

export const pCatlgClassificationList: Array<any> = [
    {
        key: PCatlgClassificationEnum.GENERAL,
        label: '一般数据',
    },
    {
        key: PCatlgClassificationEnum.IMPORTANT,
        label: '重要数据',
    },
    {
        key: PCatlgClassificationEnum.CORE,
        label: '核心数据',
    },
]

// 敏感级别
export const enum PCatlgSensitiveLevelEnum {
    // 1级-数据泄露后无危害
    SENSITIVE_LEVEL_1 = '1',
    // 2级-数据泄露后无危害，仅对特定公众和群体有益，且可能对其他公众和群体产生不利影响
    SENSITIVE_LEVEL_2 = '2',
    // 3级-数据泄露后会对个人、法人、其他组织或国家机关正常运作造成损害
    SENSITIVE_LEVEL_3 = '3',
    // 4级-数据泄漏后会对个人人身安全、法人正常运作或国家机关正常运作造成严重损害
    SENSITIVE_LEVEL_4 = '4',
}

export const pCatlgSensitiveLevelMap = {
    [PCatlgSensitiveLevelEnum.SENSITIVE_LEVEL_1]: '1级',
    [PCatlgSensitiveLevelEnum.SENSITIVE_LEVEL_2]: '2级',
    [PCatlgSensitiveLevelEnum.SENSITIVE_LEVEL_3]: '3级',
    [PCatlgSensitiveLevelEnum.SENSITIVE_LEVEL_4]: '4级',
}

// 系统所属分类
export const enum PCatlgSystemClassEnum {
    // 自建自用
    ZJZY = '01',
    // 国直（国家部委统一平台）
    GZ = '02',
    // 省直（省级统一平台）
    SZ = '03',
    // 市直（市级统一平台）
    SJ = '04',
    // 县直（县级统一平台）
    XZ = '05',
}

export const pCatlgSystemClassMap = {
    [PCatlgSystemClassEnum.ZJZY]: '自建自用',
    [PCatlgSystemClassEnum.GZ]: '国直（国家部委统一平台）',
    [PCatlgSystemClassEnum.SZ]: '省直（省级统一平台）',
    [PCatlgSystemClassEnum.SJ]: '市直（市级统一平台）',
    [PCatlgSystemClassEnum.XZ]: '县直（县级统一平台）',
}

// 数据提供渠道类型
export const enum PCatlgDataProvideChannelEnum {
    // 政务外网
    GOVERNMENTEXTERNALNETWORK = '1',
    // 互联网
    INTERNET = '2',
    // 部门私有网络
    DEPARTMENTPRIVATENETWORK = '3',
}

export const pCatlgDataProvideChannelList: Array<any> = [
    {
        key: PCatlgDataProvideChannelEnum.GOVERNMENTEXTERNALNETWORK,
        label: '政务外网',
    },
    {
        key: PCatlgDataProvideChannelEnum.INTERNET,
        label: '互联网',
    },
    {
        key: PCatlgDataProvideChannelEnum.DEPARTMENTPRIVATENETWORK,
        label: '部门私有网络',
    },
]

// 数据加工程度
export const enum PCatlgDataProcessingLevelEnum {
    // 1-原始数据（明细数据）
    SJJGCD01 = 'sjjgcd01',
    // 2-脱敏数据
    SJJGCD02 = 'sjjgcd02',
    // = '3'-标签数据
    SJJGCD03 = 'sjjgcd03',
    // 4-统计数据
    SJJGCD04 = 'sjjgcd04',
    // 5-融合数据
    SJJGCD05 = 'sjjgcd05',
    // 0-其他
    OTHER = '0',
}

export const pCatlgProcessingLevelList: Array<any> = [
    {
        key: PCatlgDataProcessingLevelEnum.SJJGCD01,
        label: '原始数据（明细数据）',
    },
    {
        key: PCatlgDataProcessingLevelEnum.SJJGCD02,
        label: '脱敏数据',
    },
    {
        key: PCatlgDataProcessingLevelEnum.SJJGCD03,
        label: '标签数据',
    },
    {
        key: PCatlgDataProcessingLevelEnum.SJJGCD04,
        label: '统计数据',
    },
    {
        key: PCatlgDataProcessingLevelEnum.SJJGCD05,
        label: '融合数据',
    },
    {
        key: PCatlgDataProcessingLevelEnum.OTHER,
        label: '其他',
    },
]

// 数据所属领域
export const enum PCatlgDataFieldEnum {
    // 新冠疫苗
    XGYY = '01',
    // 科技创新
    KJTX = '02',
    // 商贸流通
    SHLC = '03',
    // 社会救助
    SHJJ = '04',
    // 城建住房
    CJZF = '05',
    // 教育文化
    JYWH = '06',
    // 工业农业
    GYNY = '07',
    // 机构团体
    GJQT = '08',
    // 地理空间
    DLKJ = '09',
    // 资源能源
    ZYNY = '10',
    // 市场监管
    SJJG = '11',
    // 生活服务
    SHFW = '12',
    // 生态环境
    HJHK = '13',
    // 交通环境
    JTJH = '14',
    // 安全生产
    SGAQ = '15',
    // 社保就业
    SHBY = '16',
    // 医疗卫生
    YLJK = '17',
    // 信用服务
    XYSF = '18',
    // 公共安全
    GGQA = '19',
    // 财税金融
    CSJR = '20',
    // 气象服务
    QXFW = '21',
    // 法律服务
    FLFW = '22',
    // 疫情防控
    FKFK = '23',
    // 普惠金融
    PHDJ = '24',
    // 营商环境
    SHYH = '25',
    // 黄河流域
    HHYL = '26',
    // 其它
    OTHER = '27',
}

export const pCatlgDataFieldList: Array<any> = [
    {
        key: PCatlgDataFieldEnum.XGYY,
        label: '新冠疫苗',
    },
    {
        key: PCatlgDataFieldEnum.KJTX,
        label: '科技创新',
    },
    {
        key: PCatlgDataFieldEnum.SHLC,
        label: '商贸流通',
    },
    {
        key: PCatlgDataFieldEnum.SHJJ,
        label: '社会救助',
    },
    {
        key: PCatlgDataFieldEnum.CJZF,
        label: '城建住房',
    },
    {
        key: PCatlgDataFieldEnum.JYWH,
        label: '教育文化',
    },
    {
        key: PCatlgDataFieldEnum.GYNY,
        label: '工业农业',
    },
    {
        key: PCatlgDataFieldEnum.GJQT,
        label: '机构团体',
    },
    {
        key: PCatlgDataFieldEnum.DLKJ,
        label: '地理空间',
    },
    {
        key: PCatlgDataFieldEnum.ZYNY,
        label: '资源能源',
    },
    {
        key: PCatlgDataFieldEnum.SJJG,
        label: '市场监管',
    },
    {
        key: PCatlgDataFieldEnum.SHFW,
        label: '生活服务',
    },
    {
        key: PCatlgDataFieldEnum.HJHK,
        label: '生态环境',
    },
    {
        key: PCatlgDataFieldEnum.JTJH,
        label: '交通环境',
    },
    {
        key: PCatlgDataFieldEnum.SGAQ,
        label: '安全生产',
    },
    {
        key: PCatlgDataFieldEnum.SHBY,
        label: '社保就业',
    },
    {
        key: PCatlgDataFieldEnum.YLJK,
        label: '医疗卫生',
    },
    {
        key: PCatlgDataFieldEnum.XYSF,
        label: '信用服务',
    },
    {
        key: PCatlgDataFieldEnum.GGQA,
        label: '公共安全',
    },
    {
        key: PCatlgDataFieldEnum.CSJR,
        label: '财税金融',
    },
    {
        key: PCatlgDataFieldEnum.QXFW,
        label: '气象服务',
    },
    {
        key: PCatlgDataFieldEnum.FLFW,
        label: '法律服务',
    },
    {
        key: PCatlgDataFieldEnum.FKFK,
        label: '疫情防控',
    },
    {
        key: PCatlgDataFieldEnum.PHDJ,
        label: '普惠金融',
    },
    {
        key: PCatlgDataFieldEnum.SHYH,
        label: '营商环境',
    },
    {
        key: PCatlgDataFieldEnum.HHYL,
        label: '黄河流域',
    },
    {
        key: PCatlgDataFieldEnum.OTHER,
        label: '其它',
    },
]

// 目录标签
export const enum PCatlgDataCatlgTagEnum {
    // 住房保障
    ZFZB = '01',
    // 出境入境
    CJJR = '02',
    // 交通出行
    JTQC = '03',
    // 户籍办理
    HJBL = '04',
    // 社会保障
    SHBZ = '05',
    // 租房购房
    ZFGF = '06',
    // 医疗卫生
    YLJK = '07',
    // 就业创业
    JYCY = '08',
    // 教育科研
    JYKC = '09',
    // 婚姻登记
    HYDJ = '10',
    // 生育收养
    SHSY = '11',
    // 职业资格
    ZYZG = '12',
    // 准营准办
    ZYZB = '13',
    // 设立变更
    SZBG = '14',
    // 年检年审
    NJNS = '15',
    // 资质认证
    ZZRZ = '16',
    // 知识产权
    ZSCQ = '17',
    // 财务税务
    CWSJ = '18',
    // 破产注销
    PXZX = '19',
    // 立项审批
    LXXS = '20',
    // 法人注销
    FRZX = '21',
    // 检验检疫
    JYJY = '22',
    // 招标拍卖
    ZBPM = '23',
    // 投资审批
    TZSP = '24',
    // 食品药品
    SPYS = '25',
    // 环保绿化
    HBHL = '26',
    // 土地房产
    TDFC = '27',
    // 交通运输
    JTJS = '28',
    // 农林牧渔
    NLMY = '29',
    // 水利水务
    SLSW = '30',
    // 国土和规划建设
    GTHGHJZ = '31',
    // 公安消防
    GAXF = '32',
    // 一站式企业开办
    YZSQYKB = '33',
    // 多证合一
    DZHY = '34',
    // 联合奖惩
    LHJC = '35',
    // 不动产登记
    BDCDJ = '36',
    // 公共资源交易
    GGZYJY = '37',
    // 互联网+监管
    HLWJG = '38',
    // 行政许可
    XZXK = '39',
    // 行政确认
    XZQR = '40',
    // 行政检查
    XZJC = '41',
    // 行政奖励
    XZJL = '42',
    // 行政征收
    XZZS = '43',
    // 行政处罚
    XZCF = '44',
    // 行政强制
    XZQZ = '45',
    // 行政给付
    XZGF = '46',
    // 行政裁决
    XZCJ = '47',
    // 行政征用
    XZZY = '48',
    // 电子证照
    DZZZ = '49',
    // 其他
    QT = '50',
}

export const pCatlgDataClassificationList: Array<any> = [
    {
        key: PCatlgDataCatlgTagEnum.ZFZB,
        label: '住房保障',
    },
    {
        key: PCatlgDataCatlgTagEnum.CJJR,
        label: '出境入境',
    },
    {
        key: PCatlgDataCatlgTagEnum.JTQC,
        label: '交通出行',
    },
    {
        key: PCatlgDataCatlgTagEnum.HJBL,
        label: '户籍办理',
    },
    {
        key: PCatlgDataCatlgTagEnum.SHBZ,
        label: '社会保障',
    },
    {
        key: PCatlgDataCatlgTagEnum.ZFGF,
        label: '租房购房',
    },
    {
        key: PCatlgDataCatlgTagEnum.YLJK,
        label: '医疗卫生',
    },
    {
        key: PCatlgDataCatlgTagEnum.JYCY,
        label: '就业创业',
    },
    {
        key: PCatlgDataCatlgTagEnum.JYKC,
        label: '教育科研',
    },
    {
        key: PCatlgDataCatlgTagEnum.HYDJ,
        label: '婚姻登记',
    },
    {
        key: PCatlgDataCatlgTagEnum.SHSY,
        label: '生育收养',
    },
    {
        key: PCatlgDataCatlgTagEnum.ZYZG,
        label: '职业资格',
    },
    {
        key: PCatlgDataCatlgTagEnum.ZYZB,
        label: '准营准办',
    },
    {
        key: PCatlgDataCatlgTagEnum.SZBG,
        label: '设立变更',
    },
    {
        key: PCatlgDataCatlgTagEnum.NJNS,
        label: '年检年审',
    },
    {
        key: PCatlgDataCatlgTagEnum.ZZRZ,
        label: '资质认证',
    },
    {
        key: PCatlgDataCatlgTagEnum.ZSCQ,
        label: '知识产权',
    },
    {
        key: PCatlgDataCatlgTagEnum.CWSJ,
        label: '财务税务',
    },
    {
        key: PCatlgDataCatlgTagEnum.PXZX,
        label: '破产注销',
    },
    {
        key: PCatlgDataCatlgTagEnum.LXXS,
        label: '立项审批',
    },
    {
        key: PCatlgDataCatlgTagEnum.FRZX,
        label: '法人注销',
    },
    {
        key: PCatlgDataCatlgTagEnum.JYJY,
        label: '检验检疫',
    },
    {
        key: PCatlgDataCatlgTagEnum.ZBPM,
        label: '招标拍卖',
    },
    {
        key: PCatlgDataCatlgTagEnum.TZSP,
        label: '投资审批',
    },
    {
        key: PCatlgDataCatlgTagEnum.SPYS,
        label: '食品药品',
    },
    {
        key: PCatlgDataCatlgTagEnum.HBHL,
        label: '环保绿化',
    },
    {
        key: PCatlgDataCatlgTagEnum.TDFC,
        label: '土地房产',
    },
    {
        key: PCatlgDataCatlgTagEnum.JTJS,
        label: '交通运输',
    },
    {
        key: PCatlgDataCatlgTagEnum.NLMY,
        label: '农林牧渔',
    },
    {
        key: PCatlgDataCatlgTagEnum.SLSW,
        label: '水利水务',
    },
    {
        key: PCatlgDataCatlgTagEnum.GTHGHJZ,
        label: '国土和规划建设',
    },
    {
        key: PCatlgDataCatlgTagEnum.GAXF,
        label: '公安消防',
    },
    {
        key: PCatlgDataCatlgTagEnum.YZSQYKB,
        label: '一站式企业开办',
    },
    {
        key: PCatlgDataCatlgTagEnum.DZHY,
        label: '多证合一',
    },
    {
        key: PCatlgDataCatlgTagEnum.LHJC,
        label: '联合奖惩',
    },
    {
        key: PCatlgDataCatlgTagEnum.BDCDJ,
        label: '不动产登记',
    },
    {
        key: PCatlgDataCatlgTagEnum.GGZYJY,
        label: '公共资源交易',
    },
    {
        key: PCatlgDataCatlgTagEnum.HLWJG,
        label: '互联网+监管',
    },
    {
        key: PCatlgDataCatlgTagEnum.XZXK,
        label: '行政许可',
    },
    {
        key: PCatlgDataCatlgTagEnum.XZQR,
        label: '行政确认',
    },
    {
        key: PCatlgDataCatlgTagEnum.XZJC,
        label: '行政检查',
    },
    {
        key: PCatlgDataCatlgTagEnum.XZJL,
        label: '行政奖励',
    },
    {
        key: PCatlgDataCatlgTagEnum.XZZS,
        label: '行政征收',
    },
    {
        key: PCatlgDataCatlgTagEnum.XZCF,
        label: '行政处罚',
    },
    {
        key: PCatlgDataCatlgTagEnum.XZQZ,
        label: '行政强制',
    },
    {
        key: PCatlgDataCatlgTagEnum.XZGF,
        label: '行政给付',
    },
    {
        key: PCatlgDataCatlgTagEnum.XZCJ,
        label: '行政裁决',
    },
    {
        key: PCatlgDataCatlgTagEnum.XZZY,
        label: '行政征用',
    },
    {
        key: PCatlgDataCatlgTagEnum.DZZZ,
        label: '电子证照',
    },
    {
        key: PCatlgDataCatlgTagEnum.QT,
        label: '其他',
    },
]

export const pCatlgDataClassificationMap = {
    [PCatlgDataCatlgTagEnum.ZFZB]: '住房保障',
    [PCatlgDataCatlgTagEnum.CJJR]: '出境入境',
    [PCatlgDataCatlgTagEnum.JTQC]: '交通出行',
    [PCatlgDataCatlgTagEnum.HJBL]: '户籍办理',
    [PCatlgDataCatlgTagEnum.SHBZ]: '社会保障',
    [PCatlgDataCatlgTagEnum.ZFGF]: '租房购房',
    [PCatlgDataCatlgTagEnum.YLJK]: '医疗卫生',
    [PCatlgDataCatlgTagEnum.JYCY]: '就业创业',
    [PCatlgDataCatlgTagEnum.JYKC]: '教育科研',
    [PCatlgDataCatlgTagEnum.HYDJ]: '婚姻登记',
    [PCatlgDataCatlgTagEnum.SHSY]: '生育收养',
    [PCatlgDataCatlgTagEnum.ZYZG]: '职业资格',
    [PCatlgDataCatlgTagEnum.ZYZB]: '准营准办',
    [PCatlgDataCatlgTagEnum.SZBG]: '设立变更',
    [PCatlgDataCatlgTagEnum.NJNS]: '年检年审',
    [PCatlgDataCatlgTagEnum.ZZRZ]: '资质认证',
    [PCatlgDataCatlgTagEnum.ZSCQ]: '知识产权',
    [PCatlgDataCatlgTagEnum.CWSJ]: '财务税务',
    [PCatlgDataCatlgTagEnum.PXZX]: '破产注销',
    [PCatlgDataCatlgTagEnum.LXXS]: '立项审批',
    [PCatlgDataCatlgTagEnum.FRZX]: '法人注销',
    [PCatlgDataCatlgTagEnum.JYJY]: '检验检疫',
    [PCatlgDataCatlgTagEnum.ZBPM]: '招标拍卖',
    [PCatlgDataCatlgTagEnum.TZSP]: '投资审批',
    [PCatlgDataCatlgTagEnum.SPYS]: '食品药品',
    [PCatlgDataCatlgTagEnum.HBHL]: '环保绿化',
    [PCatlgDataCatlgTagEnum.TDFC]: '土地房产',
    [PCatlgDataCatlgTagEnum.JTJS]: '交通运输',
    [PCatlgDataCatlgTagEnum.NLMY]: '农林牧渔',
    [PCatlgDataCatlgTagEnum.SLSW]: '水利水务',
    [PCatlgDataCatlgTagEnum.GTHGHJZ]: '国土和规划建设',
    [PCatlgDataCatlgTagEnum.GAXF]: '公安消防',
    [PCatlgDataCatlgTagEnum.YZSQYKB]: '一站式企业开办',
    [PCatlgDataCatlgTagEnum.DZHY]: '多证合一',
    [PCatlgDataCatlgTagEnum.LHJC]: '联合奖惩',
    [PCatlgDataCatlgTagEnum.BDCDJ]: '不动产登记',
    [PCatlgDataCatlgTagEnum.GGZYJY]: '公共资源交易',
    [PCatlgDataCatlgTagEnum.HLWJG]: '互联网+监管',
    [PCatlgDataCatlgTagEnum.XZXK]: '行政许可',
    [PCatlgDataCatlgTagEnum.XZQR]: '行政确认',
    [PCatlgDataCatlgTagEnum.XZJC]: '行政检查',
    [PCatlgDataCatlgTagEnum.XZJL]: '行政奖励',
    [PCatlgDataCatlgTagEnum.XZZS]: '行政征收',
    [PCatlgDataCatlgTagEnum.XZCF]: '行政处罚',
    [PCatlgDataCatlgTagEnum.XZQZ]: '行政强制',
    [PCatlgDataCatlgTagEnum.XZGF]: '行政给付',
    [PCatlgDataCatlgTagEnum.XZCJ]: '行政裁决',
    [PCatlgDataCatlgTagEnum.XZZY]: '行政征用',
    [PCatlgDataCatlgTagEnum.DZZZ]: '电子证照',
    [PCatlgDataCatlgTagEnum.QT]: '其他',
}

// 应用场景
export enum PCatlgUseTypeEnum {
    // 政务服务
    ZWSF = '1',
    // 公共服务
    GGSF = '2',
    // 监管
    JG = '3',
    // 其他
    QT = '4',
}
export const pCatlgUseTypeList: Array<any> = [
    {
        key: PCatlgUseTypeEnum.ZWSF,
        label: __('政务服务'),
    },
    {
        key: PCatlgUseTypeEnum.GGSF,
        label: __('公共服务'),
    },
    {
        key: PCatlgUseTypeEnum.JG,
        label: __('监管'),
    },
    {
        key: PCatlgUseTypeEnum.QT,
        label: __('其他'),
    },
]

export enum PCatlgDataAreaRangeEnum {
    // 1-全国
    NATION = '1',
    // 2-全省
    PROVINCE = '2',
    // = '3'-各市（州）
    CITY = '3',
    // 4-全市（州）
    DISTRICT = '4',
    // 5-各区（县）
    COUNTY = '5',
    // 6-全区（县）
    TOWNSHIP = '6',
    // 7-其他
    QT = '7',
}

export const pCatlgDataAreaRangeList: Array<any> = [
    {
        key: PCatlgDataAreaRangeEnum.NATION,
        label: '全国',
    },
    {
        key: PCatlgDataAreaRangeEnum.PROVINCE,
        label: '全省',
    },
    {
        key: PCatlgDataAreaRangeEnum.CITY,
        label: '各市（州）',
    },
    {
        key: PCatlgDataAreaRangeEnum.DISTRICT,
        label: '全市（州）',
    },
    {
        key: PCatlgDataAreaRangeEnum.COUNTY,
        label: '各区（县）',
    },
    {
        key: PCatlgDataAreaRangeEnum.TOWNSHIP,
        label: '全区（县）',
    },
    {
        key: PCatlgDataAreaRangeEnum.QT,
        label: '其他',
    },
]

// 更新周期
export enum PCatlgUpdateCycleEnum {
    // 1-实时
    REAL_TIME = '1',
    // 2-每日
    DAILY = '2',
    // = '3'-每周
    WEEKLY = '3',
    // 4-每月
    MONTHLY = '4',
    // 5-每季度
    QUARTERLY = '5',
    // 6-每半年
    SEMI_ANNUALLY = '6',
    // 7-每年
    YEARLY = '7',
    // 8-其他
    OTHER = '8',
}

export const pCatlgUpdateCycleList: Array<any> = [
    {
        key: PCatlgUpdateCycleEnum.REAL_TIME,
        label: '实时',
    },
    {
        key: PCatlgUpdateCycleEnum.DAILY,
        label: '每日',
    },
    {
        key: PCatlgUpdateCycleEnum.WEEKLY,
        label: '每周',
    },
    {
        key: PCatlgUpdateCycleEnum.MONTHLY,
        label: '每月',
    },
    {
        key: PCatlgUpdateCycleEnum.QUARTERLY,
        label: '每季度',
    },
    {
        key: PCatlgUpdateCycleEnum.SEMI_ANNUALLY,
        label: '每半年',
    },
    {
        key: PCatlgUpdateCycleEnum.YEARLY,
        label: '每年',
    },
    {
        key: PCatlgUpdateCycleEnum.OTHER,
        label: '其他',
    },
]

// 数据类型
export enum PCatlgDataTypeEnum {
    // 字符串型
    STRING = '1',
    // 数值型
    NUMBER = '2',
    // 货币型
    CURRENCY = '3',
    // 日期型
    DATE = '4',
    // 日期时间型
    DATETIME = '5',
    // 逻辑型
    LOGIC = '6',
    // 备注型
    REMARK = '7',
    // 通用型
    GENERAL = '8',
    // 双精度型
    DOUBLE = '9',
    // 整型
    INTEGER = '10',
    // 浮点型
    FLOAT = '11',
    // 二进制
    BINARY = '12',
    // 长文本
    LONGTEXT = '13',
}

export const pCatlgDataTypeMap = {
    [PCatlgDataTypeEnum.STRING]: '字符串型',
    [PCatlgDataTypeEnum.NUMBER]: '数值型',
    [PCatlgDataTypeEnum.CURRENCY]: '货币型',
    [PCatlgDataTypeEnum.DATE]: '日期型',
    [PCatlgDataTypeEnum.DATETIME]: '日期时间型',
    [PCatlgDataTypeEnum.LOGIC]: '逻辑型',
    [PCatlgDataTypeEnum.REMARK]: '备注型',
    [PCatlgDataTypeEnum.GENERAL]: '通用型',
    [PCatlgDataTypeEnum.DOUBLE]: '双精度型',
    [PCatlgDataTypeEnum.INTEGER]: '整型',
    [PCatlgDataTypeEnum.FLOAT]: '浮点型',
    [PCatlgDataTypeEnum.BINARY]: '二进制',
    [PCatlgDataTypeEnum.LONGTEXT]: '长文本',
}

// 统一社会信用代码
export enum PCatlgCreditCodeEnum {
    // 湖南省药品监督管理局
    YPJGJ = '11430000MB1599860M',
    // 湖南省监狱管理局
    JYGLJ = '1143000000612280X0',
    // 湖南省文物局
    WJG = '11430000MB1C8426XK',
    // 湖南省医疗保障局
    YLBZJ = '11430000MB191025XP',
    // 湖南省信访局
    XFJ = '11430000006122121K',
    // 湖南省地方金融监督管理局
    DFDJG = '1143000000612328XD',
    // 湖南省机关事务管理局
    JGGSJG = '11430000006122770P',
    // 湖南省粮食和物资储备局
    LSWZCBJ = '11430000MB15375631',
    // 湖南省统计局
    TJJB = '11430000006122383B',
    // 湖南省体育局
    TYJ = '11430000006122308J',
    // 湖南省广播电视局
    GDGSJ = '11430000320581596K',
    // 湖南省市场监督管理局
    SCJGJ = '11430000MB169231XX',
    // 湖南省国资委
    GZW = '114300007607278946',
    // 湖南省消防救援总队
    XJYZD = '11430000MB1E20268C',
    // 湖南省应急管理厅
    YJGLT = '11430000MB1847123M',
    // 湖南省退役军人事务厅
    TYJRSW = '11430000MB1671033P',
    // 湖南省审计厅
    SJT = '11430000006122412N',
    // 湖南省卫生健康委员会
    WJW = '114300000061225785',
    // 湖南省文化和旅游厅
    WLJT = '11430000MB1988452F',
    // 湖南省商务厅
    SWT = '11430000006122252F',
    // 湖南省农业农村厅
    NYJT = '11430000006122471R',
    // 湖南省水利厅
    SLJT = '11430000006122498H',
    // 湖南省交通运输厅
    JTJT = '114300000061225005',
    // 湖南省住房和城乡建设厅
    ZFJGJ = '11430000006122244L',
    // 湖南省生态环境厅
    SHJHJT = '11430000006122674E',
    // 湖南省自然资源厅
    ZRZYT = '11430000MB1956266U',
    // 湖南省人力资源和社会保障厅
    RLSBZJ = '11430000006122375G',
    // 湖南省财政厅
    CZJT = '11430000006122439E',
    // 湖南省民政厅
    MZJT = '11430000006122340X',
    // 湖南省公安厅
    GAT = '114300000061223248',
    // 湖南省民族宗教事务委员会
    MZZJW = '114300000061222872',
    // 湖南省工业和信息化厅
    GXJTD = '11430000006123108E',
    // 湖南省科学技术厅
    KJJT = '114300000061222797',
    // 湖南省教育厅
    JYJT = '11430000006122260A',
    // 湖南省发展和改革委员会
    FZGJJ = '1143000000612221XY',
    // 湖南省人民政府外事侨务办公室
    WSQW = '11430000006122316D',
    // 湖南省委网信办
    WXW = '11430000MB1018392G',
    // 湖南省档案局
    DANGANJ = '12430000MB1209711D',
    // 湖南省林业厅
    LJYT = '1143000000612248XH',
    // 湖南省司法厅
    SFJT = '114300000061223323',
    // 国安厅
    AGJT = '81430000MCK575429L',
    // 国家税务总局省税务局
    SWSJ = '114300000061231244',
    // 气象局
    QXJ = '12100000444885866T',
    // 烟草专卖局
    YZJ = '91430000183764627G',
    // 邮政管理局
    YZGJ = '11100000717817624Y',
    // 湖南省直单位住房公积金管理中心
    ZDGJJG = '12430000444881590X',
    // 湖南省国防动员办公室
    GGFZBGBS = '1143000000612264XQ',
    // 公共资源交易中心
    GGZYJYZX = '12430000MBOL67976N',
    // 省残联
    SCJ = '13430000006123247Y',
    // 湖南省长株潭一体化发展事务中心
    CZT = '12430000MB1D40938T',
    // 湖南省戒毒管理局
    JDJG = '11430000006122826T',
    // 库区移民事务中心
    KQYMW = '12430000444881240P',
    // 湖南省总工会
    ZGGH = '13430000006123028L',
    // 湖南省新闻出版局、省电影局
    XWCBJ = '11430000MB0X557143',
    // 中国广电湖南网络股份有限公司
    CGGDHNWL = '91430000799127167T',
    // 湖南省地质院
    DZYY = '12430000MB1K856063',
    // 湖南省地方志编纂院
    DZBYJ = '124300004448799099',
    // xx海关
    CGSG = '111000000061232047',
    // 湖南省乡村振兴局
    XZJ = '11430000MB1D67401T',
    // 湖南省文史研究馆
    WSSG = '12430000MB1B255927',
}

export const pCatlgCreditCodeList: Array<any> = [
    {
        key: PCatlgCreditCodeEnum.YPJGJ,
        label: '湖南省药品监督管理局',
    },
    {
        key: PCatlgCreditCodeEnum.JYGLJ,
        label: '湖南省监狱管理局',
    },
    {
        key: PCatlgCreditCodeEnum.WJG,
        label: '湖南省文物局',
    },
    {
        key: PCatlgCreditCodeEnum.YLBZJ,
        label: '湖南省医疗保障局',
    },
    {
        key: PCatlgCreditCodeEnum.XFJ,
        label: '湖南省信访局',
    },
    {
        key: PCatlgCreditCodeEnum.DFDJG,
        label: '湖南省地方金融监督管理局',
    },
    {
        key: PCatlgCreditCodeEnum.JGGSJG,
        label: '湖南省机关事务管理局',
    },
    {
        key: PCatlgCreditCodeEnum.LSWZCBJ,
        label: '湖南省粮食和物资储备局',
    },
    {
        key: PCatlgCreditCodeEnum.TJJB,
        label: '湖南省统计局',
    },
    {
        key: PCatlgCreditCodeEnum.TYJ,
        label: '湖南省体育局',
    },
    {
        key: PCatlgCreditCodeEnum.GDGSJ,
        label: '湖南省广播电视局',
    },
    {
        key: PCatlgCreditCodeEnum.SCJGJ,
        label: '湖南省市场监督管理局',
    },
    {
        key: PCatlgCreditCodeEnum.GZW,
        label: '湖南省国资委',
    },
    {
        key: PCatlgCreditCodeEnum.XJYZD,
        label: '湖南省消防救援总队',
    },
    {
        key: PCatlgCreditCodeEnum.YJGLT,
        label: '湖南省应急管理厅',
    },
    {
        key: PCatlgCreditCodeEnum.TYJRSW,
        label: '湖南省退役军人事务厅',
    },
    {
        key: PCatlgCreditCodeEnum.SJT,
        label: '湖南省审计厅',
    },
    {
        key: PCatlgCreditCodeEnum.WJW,
        label: '湖南省卫生健康委员会',
    },
    {
        key: PCatlgCreditCodeEnum.WLJT,
        label: '湖南省文化和旅游厅',
    },
    {
        key: PCatlgCreditCodeEnum.SWT,
        label: '湖南省商务厅',
    },
    {
        key: PCatlgCreditCodeEnum.NYJT,
        label: '湖南省农业农村厅',
    },
    {
        key: PCatlgCreditCodeEnum.SLJT,
        label: '湖南省水利厅',
    },
    {
        key: PCatlgCreditCodeEnum.JTJT,
        label: '湖南省交通运输厅',
    },
    {
        key: PCatlgCreditCodeEnum.ZFJGJ,
        label: '湖南省住房和城乡建设厅',
    },
    {
        key: PCatlgCreditCodeEnum.SHJHJT,
        label: '湖南省生态环境厅',
    },
    {
        key: PCatlgCreditCodeEnum.ZRZYT,
        label: '湖南省自然资源厅',
    },
    {
        key: PCatlgCreditCodeEnum.RLSBZJ,
        label: '湖南省人力资源和社会保障厅',
    },
    {
        key: PCatlgCreditCodeEnum.CZJT,
        label: '湖南省财政厅',
    },
    {
        key: PCatlgCreditCodeEnum.MZJT,
        label: '湖南省民政厅',
    },
    {
        key: PCatlgCreditCodeEnum.GAT,
        label: '湖南省公安厅',
    },
    {
        key: PCatlgCreditCodeEnum.MZZJW,
        label: '湖南省民族宗教事务委员会',
    },
    {
        key: PCatlgCreditCodeEnum.GXJTD,
        label: '湖南省工业和信息化厅',
    },
    {
        key: PCatlgCreditCodeEnum.KJJT,
        label: '湖南省科学技术厅',
    },
    {
        key: PCatlgCreditCodeEnum.JYJT,
        label: '湖南省教育厅',
    },
    {
        key: PCatlgCreditCodeEnum.FZGJJ,
        label: '湖南省发展和改革委员会',
    },
    {
        key: PCatlgCreditCodeEnum.WSQW,
        label: '湖南省人民政府外事侨务办公室',
    },
    {
        key: PCatlgCreditCodeEnum.WXW,
        label: '湖南省委网信办',
    },
    {
        key: PCatlgCreditCodeEnum.DANGANJ,
        label: '湖南省档案局',
    },
    {
        key: PCatlgCreditCodeEnum.LJYT,
        label: '湖南省林业厅',
    },
    {
        key: PCatlgCreditCodeEnum.SFJT,
        label: '湖南省司法厅',
    },
    {
        key: PCatlgCreditCodeEnum.AGJT,
        label: '国安厅',
    },
    {
        key: PCatlgCreditCodeEnum.SWSJ,
        label: '国家税务总局省税务局',
    },
    {
        key: PCatlgCreditCodeEnum.QXJ,
        label: '气象局',
    },
    {
        key: PCatlgCreditCodeEnum.YZJ,
        label: '烟草专卖局',
    },
    {
        key: PCatlgCreditCodeEnum.YZGJ,
        label: '邮政管理局',
    },
    {
        key: PCatlgCreditCodeEnum.ZDGJJG,
        label: '湖南省直单位住房公积金管理中心',
    },
    {
        key: PCatlgCreditCodeEnum.GGFZBGBS,
        label: '湖南省国防动员办公室',
    },
    {
        key: PCatlgCreditCodeEnum.GGZYJYZX,
        label: '公共资源交易中心',
    },
    {
        key: PCatlgCreditCodeEnum.SCJ,
        label: '省残联',
    },
    {
        key: PCatlgCreditCodeEnum.CZT,
        label: '湖南省长株潭一体化发展事务中心',
    },
    {
        key: PCatlgCreditCodeEnum.JDJG,
        label: '湖南省戒毒管理局',
    },
    {
        key: PCatlgCreditCodeEnum.KQYMW,
        label: '库区移民事务中心',
    },
    {
        key: PCatlgCreditCodeEnum.ZGGH,
        label: '湖南省总工会',
    },
    {
        key: PCatlgCreditCodeEnum.XWCBJ,
        label: '湖南省新闻出版局、省电影局',
    },
    {
        key: PCatlgCreditCodeEnum.CGGDHNWL,
        label: '中国广电湖南网络股份有限公司',
    },
    {
        key: PCatlgCreditCodeEnum.DZYY,
        label: '湖南省地质院',
    },
    {
        key: PCatlgCreditCodeEnum.DZBYJ,
        label: '湖南省地方志编纂院',
    },
    {
        key: PCatlgCreditCodeEnum.CGSG,
        label: 'xx海关',
    },
    {
        key: PCatlgCreditCodeEnum.XZJ,
        label: '湖南省乡村振兴局',
    },
    {
        key: PCatlgCreditCodeEnum.WSSG,
        label: '湖南省文史研究馆',
    },
]

// 行政区域代码
export enum PCatlgDataAreaCodeEnum {
    // 国家通用
    NATION = '00',
    // 北京市
    BEIJING = '11',
    // 天津市
    TIANJIN = '12',
    // 河北省
    HEBEI = '13',
    // 山西省
    SHANXI = '14',
    // 内蒙古自治区
    NEIMENGGU = '15',
    // 辽宁省
    LIAONING = '21',
    // 吉林省
    JILIN = '22',
    // 黑龙江省
    HEILONGJIANG = '23',
    // 上海市
    SHANGHAI = '31',
    // 江苏省
    JIANGSU = '32',
    // 浙江省
    ZHEJIANG = '33',
    // 安徽省
    ANHUI = '34',
    // 福建省
    FUJIAN = '35',
    // 江西省
    JIANGXI = '36',
    // 山东省
    SHANDONG = '37',
    // 河南省
    HENAN = '41',
    // 湖北省
    HUBEI = '42',
    // 湖南省
    HUNAN = '43',
    // 广东省
    GUANGDONG = '44',
    // 广西壮族自治区
    GUANGXI = '45',
    // 海南省
    HAINAN = '46',
    // 重庆市
    CHONGQING = '50',
    // 四川省
    SICHUAN = '51',
    // 贵州省
    GUIZHOU = '52',
    // 云南省
    YUNNAN = '53',
    // 西藏自治区
    XIZANG = '54',
    // 陕西省
    SHAANXI = '61',
    // 甘肃省
    GANSU = '62',
    // 青海省
    QINGHAI = '63',
    // 宁夏回族自治区
    NINGXIA = '64',
    // 新疆维吾尔自治区
    XINJIANG = '65',
    // 新疆生产建设兵团
    XINJIANG_PRODUCTION_AND_CONSTRUCTION_CORPS = '66',
    // 香港特别行政区
    HONGKONG = '81',
    // 澳门特别行政区
    MACAO = '82',
    // 台湾省
    TAIWAN = '83',
}

export const pCatlgDataAreaCodeMap = {
    [PCatlgDataAreaCodeEnum.NATION]: '国家通用',
    [PCatlgDataAreaCodeEnum.BEIJING]: '北京市',
    [PCatlgDataAreaCodeEnum.TIANJIN]: '天津市',
    [PCatlgDataAreaCodeEnum.HEBEI]: '河北省',
    [PCatlgDataAreaCodeEnum.SHANXI]: '山西省',
    [PCatlgDataAreaCodeEnum.NEIMENGGU]: '内蒙古自治区',
    [PCatlgDataAreaCodeEnum.LIAONING]: '辽宁省',
    [PCatlgDataAreaCodeEnum.JILIN]: '吉林省',
    [PCatlgDataAreaCodeEnum.HEILONGJIANG]: '黑龙江省',
    [PCatlgDataAreaCodeEnum.SHANGHAI]: '上海市',
    [PCatlgDataAreaCodeEnum.JIANGSU]: '江苏省',
    [PCatlgDataAreaCodeEnum.ZHEJIANG]: '浙江省',
    [PCatlgDataAreaCodeEnum.ANHUI]: '安徽省',
    [PCatlgDataAreaCodeEnum.FUJIAN]: '福建省',
    [PCatlgDataAreaCodeEnum.JIANGXI]: '江西省',
    [PCatlgDataAreaCodeEnum.SHANDONG]: '山东省',
    [PCatlgDataAreaCodeEnum.HENAN]: '河南省',
    [PCatlgDataAreaCodeEnum.HUBEI]: '湖北省',
    [PCatlgDataAreaCodeEnum.HUNAN]: '湖南省',
    [PCatlgDataAreaCodeEnum.GUANGDONG]: '广东省',
    [PCatlgDataAreaCodeEnum.GUANGXI]: '广西壮族自治区',
    [PCatlgDataAreaCodeEnum.HAINAN]: '海南省',
    [PCatlgDataAreaCodeEnum.CHONGQING]: '重庆市',
    [PCatlgDataAreaCodeEnum.SICHUAN]: '四川省',
    [PCatlgDataAreaCodeEnum.GUIZHOU]: '贵州省',
    [PCatlgDataAreaCodeEnum.YUNNAN]: '云南省',
    [PCatlgDataAreaCodeEnum.XIZANG]: '西藏自治区',
    [PCatlgDataAreaCodeEnum.SHAANXI]: '陕西省',
    [PCatlgDataAreaCodeEnum.GANSU]: '甘肃省',
    [PCatlgDataAreaCodeEnum.QINGHAI]: '青海省',
    [PCatlgDataAreaCodeEnum.NINGXIA]: '宁夏回族自治区',
    [PCatlgDataAreaCodeEnum.XINJIANG]: '新疆维吾尔自治区',
    [PCatlgDataAreaCodeEnum.XINJIANG_PRODUCTION_AND_CONSTRUCTION_CORPS]:
        '新疆生产建设兵团',
    [PCatlgDataAreaCodeEnum.HONGKONG]: '香港特别行政区',
    [PCatlgDataAreaCodeEnum.MACAO]: '澳门特别行政区',
    [PCatlgDataAreaCodeEnum.TAIWAN]: '台湾省',
}

export const pCatlgDataAreaCodeList: Array<any> = [
    {
        key: PCatlgDataAreaCodeEnum.NATION,
        label: '国家通用',
    },
    {
        key: PCatlgDataAreaCodeEnum.BEIJING,
        label: '北京市',
    },
    {
        key: PCatlgDataAreaCodeEnum.TIANJIN,
        label: '天津市',
    },
    {
        key: PCatlgDataAreaCodeEnum.HEBEI,
        label: '河北省',
    },
    {
        key: PCatlgDataAreaCodeEnum.SHANXI,
        label: '山西省',
    },
    {
        key: PCatlgDataAreaCodeEnum.NEIMENGGU,
        label: '内蒙古自治区',
    },
    {
        key: PCatlgDataAreaCodeEnum.LIAONING,
        label: '辽宁省',
    },
    {
        key: PCatlgDataAreaCodeEnum.JILIN,
        label: '吉林省',
    },
    {
        key: PCatlgDataAreaCodeEnum.HEILONGJIANG,
        label: '黑龙江省',
    },
    {
        key: PCatlgDataAreaCodeEnum.SHANGHAI,
        label: '上海市',
    },
    {
        key: PCatlgDataAreaCodeEnum.JIANGSU,
        label: '江苏省',
    },
    {
        key: PCatlgDataAreaCodeEnum.ZHEJIANG,
        label: '浙江省',
    },
    {
        key: PCatlgDataAreaCodeEnum.ANHUI,
        label: '安徽省',
    },
    {
        key: PCatlgDataAreaCodeEnum.FUJIAN,
        label: '福建省',
    },
    {
        key: PCatlgDataAreaCodeEnum.JIANGXI,
        label: '江西省',
    },
    {
        key: PCatlgDataAreaCodeEnum.SHANDONG,
        label: '山东省',
    },
    {
        key: PCatlgDataAreaCodeEnum.HENAN,
        label: '河南省',
    },
    {
        key: PCatlgDataAreaCodeEnum.HUBEI,
        label: '湖北省',
    },
    {
        key: PCatlgDataAreaCodeEnum.HUNAN,
        label: '湖南省',
    },
    {
        key: PCatlgDataAreaCodeEnum.GUANGDONG,
        label: '广东省',
    },
    {
        key: PCatlgDataAreaCodeEnum.GUANGXI,
        label: '广西壮族自治区',
    },
    {
        key: PCatlgDataAreaCodeEnum.HAINAN,
        label: '海南省',
    },
    {
        key: PCatlgDataAreaCodeEnum.CHONGQING,
        label: '重庆市',
    },
    {
        key: PCatlgDataAreaCodeEnum.SICHUAN,
        label: '四川省',
    },
    {
        key: PCatlgDataAreaCodeEnum.GUIZHOU,
        label: '贵州省',
    },
    {
        key: PCatlgDataAreaCodeEnum.YUNNAN,
        label: '云南省',
    },
    {
        key: PCatlgDataAreaCodeEnum.XIZANG,
        label: '西藏自治区',
    },
    {
        key: PCatlgDataAreaCodeEnum.SHAANXI,
        label: '陕西省',
    },
    {
        key: PCatlgDataAreaCodeEnum.GANSU,
        label: '甘肃省',
    },
    {
        key: PCatlgDataAreaCodeEnum.QINGHAI,
        label: '青海省',
    },
    {
        key: PCatlgDataAreaCodeEnum.NINGXIA,
        label: '宁夏回族自治区',
    },
    {
        key: PCatlgDataAreaCodeEnum.XINJIANG,
        label: '新疆维吾尔自治区',
    },
    {
        key: PCatlgDataAreaCodeEnum.XINJIANG_PRODUCTION_AND_CONSTRUCTION_CORPS,
        label: '新疆生产建设兵团',
    },
    {
        key: PCatlgDataAreaCodeEnum.HONGKONG,
        label: '香港特别行政区',
    },
    {
        key: PCatlgDataAreaCodeEnum.MACAO,
        label: '澳门特别行政区',
    },
    {
        key: PCatlgDataAreaCodeEnum.TAIWAN,
        label: '台湾省',
    },
]

export const basicInfoDetailsList = [
    {
        label: __('基本属性'),
        key: 'basic',
        list: [
            {
                label: __('数据区域范围'),
                value: '',
                key: 'data_region',
                span: 12,
                options: pCatlgDataAreaRangeList,
            },
            {
                label: __('数据时间范围'),
                value: '',
                key: 'sjsjfw',
            },
            {
                label: __('数据加工程度'),
                value: '',
                key: 'data_processing',
                span: 12,
                options: pCatlgProcessingLevelList,
            },
            {
                label: __('数据所属层级'),
                value: '',
                key: 'level_type',
                options: pCatlgBelongLevelList,
            },
            {
                label: __('数据分级'),
                value: '',
                key: 'data_sensitive_class',
                options: pCatlgClassificationList,
            },
            {
                label: __('提供渠道'),
                value: '',
                key: 'net_type',
                options: pCatlgDataProvideChannelList,
            },
            {
                label: __('更新周期'),
                value: '',
                key: 'update_cycle',
                options: pCatlgUpdateCycleList,
            },
            {
                label: __('应用场景'),
                value: '',
                key: 'use_type',
                options: pCatlgUseTypeList,
            },
            {
                label: __('数据所属领域'),
                value: '',
                key: 'field_type',
                options: pCatlgDataFieldList,
            },
            {
                label: __('目录标签'),
                value: '',
                key: 'catalog_tag',
            },
        ],
    },
    {
        label: __('共享信息'),
        key: 'sharedAttr',
        list: [
            {
                label: __('共享类型'),
                value: '',
                key: 'share_type',
                options: pCatlgShareTypeList,
            },
            {
                label: __('开放类型'),
                value: '',
                key: 'open_type',
                options: pCatlgOpenTypeList,
            },
            {
                label: __('共享条件'),
                value: '',
                key: 'share_condition',
            },
            {
                label: __('开放条件'),
                value: '',
                key: 'open_condition',
            },
        ],
    },
    {
        label: __('来源信息'),
        key: 'moreInfo',
        list: [
            {
                label: __('提供方所在组织机构'),
                value: '',
                key: 'org_code',
                options: pCatlgCreditCodeList,
            },
            {
                label: __('提供方所在行政区划'),
                value: '',
                key: 'division_code',
                options: pCatlgDataAreaCodeList,
            },
        ],
    },
]
