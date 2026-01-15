export const businessFilterInit = {
    limit: 20,
}

// TODO: 数据范围切换为字典
export const dataRangeOptions = [
    { label: '全市', value: '1' },
    { label: '市直', value: '2' },
    { label: '区县（市）', value: '3' },
]

export const dataRangeOptionsMap = dataRangeOptions.reduce((acc, curr) => {
    acc[curr.value] = curr.label
    return acc
}, {})

// 数据资源目录开放属性
export const enum OpenTypeEnum {
    OPEN = 1,
    HASCONDITION = 2,
    NOOPEN = 3,
}

// 数据资源目录开放属性
export const openTypeList = [
    {
        key: OpenTypeEnum.OPEN,
        value: OpenTypeEnum.OPEN,
        label: '无条件开放',
    },
    {
        key: OpenTypeEnum.HASCONDITION,
        value: OpenTypeEnum.HASCONDITION,
        label: '有条件开放',
    },
    {
        key: OpenTypeEnum.NOOPEN,
        value: OpenTypeEnum.NOOPEN,
        label: '不予开放',
    },
]

// 信息资源目录开放属性
export enum OpenTypeEnumInfo {
    OPEN = 'all',
    HASCONDITION = 'partial',
    NOOPEN = 'none',
}

// 信息资源目录开放属性
export const openTypeListInfo = [
    {
        key: OpenTypeEnumInfo.OPEN,
        value: OpenTypeEnumInfo.OPEN,
        label: '无条件开放',
    },
    {
        key: OpenTypeEnumInfo.HASCONDITION,
        value: OpenTypeEnumInfo.HASCONDITION,
        label: '有条件开放',
    },
    {
        key: OpenTypeEnumInfo.NOOPEN,
        value: OpenTypeEnumInfo.NOOPEN,
        label: '不予开放',
    },
]

// 信息资源目录共享属性
export enum ShareTypeEnumInfo {
    UNCONDITION = 'all',
    CONDITION = 'partial',
    NOSHARE = 'none',
}

// 信息资源目录共享属性
export const shareTypeListInfo = [
    {
        key: ShareTypeEnumInfo.UNCONDITION,
        value: ShareTypeEnumInfo.UNCONDITION,
        label: '无条件共享',
    },
    {
        key: ShareTypeEnumInfo.CONDITION,
        value: ShareTypeEnumInfo.CONDITION,
        label: '有条件共享',
    },
    {
        key: ShareTypeEnumInfo.NOSHARE,
        value: ShareTypeEnumInfo.NOSHARE,
        label: '不予共享',
    },
]

// 信息资源目录更新频率
export enum updateCycleInfo {
    Quarterly = 'quarterly',
    Monthly = 'monthly',
    Weekly = 'weekly',
    Daily = 'daily',
    Hourly = 'hourly', // 每小时  已废弃,仅显示
    Realtime = 'realtime',
    HalfYear = 'half-yearly',
    EveryYear = 'yearly',
    Irregular = 'irregular',
}

// 信息资源目录更新频率
export const updateCycleInfoOptions = [
    {
        label: '实时',
        value: updateCycleInfo.Realtime,
    },
    {
        label: '每日',
        value: updateCycleInfo.Daily,
    },
    {
        label: '每周',
        value: updateCycleInfo.Weekly,
    },
    {
        label: '每月',
        value: updateCycleInfo.Monthly,
    },
    {
        label: '每季度',
        value: updateCycleInfo.Quarterly,
    },
    {
        label: '每半年',
        value: updateCycleInfo.HalfYear,
    },
    {
        label: '每年',
        value: updateCycleInfo.EveryYear,
    },
    {
        label: '其他',
        value: updateCycleInfo.Irregular,
    },
]

// 数据资源目录更新频率
export enum updateCycle {
    realTime = 1,
    day = 2,
    week = 3,
    month = 4,
    season = 5,
    halfYear = 6,
    everyYear = 7,
    other = 8,
}
export const updateCycleOptions = [
    {
        label: '实时',
        value: updateCycle.realTime,
    },
    {
        label: '每日',
        value: updateCycle.day,
    },
    {
        label: '每周',
        value: updateCycle.week,
    },
    {
        label: '每月',
        value: updateCycle.month,
    },
    {
        label: '每季度',
        value: updateCycle.season,
    },
    {
        label: '每半年',
        value: updateCycle.halfYear,
    },
    {
        label: '每年',
        value: updateCycle.everyYear,
    },
    {
        label: '其他',
        value: updateCycle.other,
    },
]

export const updateCycleOptionsMap = updateCycleOptions.reduce((acc, curr) => {
    acc[curr.value] = curr.label
    return acc
}, {})

export function removeHtmlTags(html) {
    return html.replace(/<[^>]+>/g, '')
}

// 置顶
export const goBackTop = (eleId: string) => {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
    const layout = document.getElementById(eleId)

    if (layout?.scrollTop) {
        layout.scrollTop = 0
    } else {
        layout?.scrollTo(0, 0)
    }
}
