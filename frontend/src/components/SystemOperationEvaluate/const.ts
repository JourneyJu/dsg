import moment from 'moment'
import { isBoolean } from 'lodash'
import __ from './locale'
import { SortDirection } from '@/core'

export const getPreviousQuarterRange = () => {
    // 获取当前日期
    const now = moment()
    // 获取当前季度（1-4）
    const currentQuarter = now.quarter()
    // 计算上一个季度
    let previousQuarter = currentQuarter - 1
    let year = now.year()
    // 如果当前是第一季度，则上一个季度是去年的第四季度
    if (previousQuarter === 0) {
        previousQuarter = 4
        year -= 1
    }
    // 计算上一个季度的开始月份（0-11）
    const startMonth = (previousQuarter - 1) * 3
    // 创建上一个季度的开始和结束日期
    const startDate = moment([year, startMonth, 1])
    const endDate = moment(startDate).endOf('quarter')
    return [startDate, endDate]
}

export enum operationType {
    AllOperationResult = 'AllOperationResult',
    SystemOperationDetail = 'SystemOperationDetail',
}

export const tabItems = [
    {
        label: __('整体评价结果'),
        key: operationType.AllOperationResult,
        children: '',
    },
    {
        label: __('系统运行明细'),
        key: operationType.SystemOperationDetail,
        children: '',
    },
]
export const menus = [{ key: 'updated_at', label: __('按验收时间排序') }]

export const defaultMenu = {
    key: 'updated_at',
    sort: SortDirection.DESC,
}

export const initSearchCondition: any = {
    current: 1,
    pageSize: 10,
    keyword: '',
    direction: SortDirection.DESC,
    sort: 'updated_at',
    start_date: getPreviousQuarterRange()[0].valueOf(),
    end_date: getPreviousQuarterRange()[1].valueOf(),
}

export const timeStrToTimestamp = (searchObj: any) => {
    const obj: any = {}
    const timeFields = [
        'acceptance_start',
        'acceptance_end',
        'start_date',
        'end_date',
    ]
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in searchObj) {
        if (Object.prototype.hasOwnProperty.call(searchObj, key)) {
            obj[key] = searchObj[key]
                ? timeFields.includes(key)
                    ? moment(searchObj[key]).valueOf()
                    : searchObj[key]
                : undefined
        }
    }
    return obj
}
export const operatorOptions = [
    { label: __('且'), value: 'AND' },
    { label: __('或'), value: 'OR' },
]
export const whiteListOptions = [
    { label: __('不限'), value: 0 },
    { label: __('是'), value: 1 },
    { label: __('否'), value: 2 },
]
export const ruleConfigForm = [
    {
        label: __('是否正常更新：'),
        key: 'normal_update',
        list: [
            { label: __('更新及时性≥'), key: '', type: 'text' },
            { label: '', type: 'input', key: 'update_timeliness_value' },
            { label: '%', key: '', type: 'text' },
        ],
    },
    {
        label: __('绿牌：'),
        key: 'green_card',
        list: [
            { label: __('整体更新及时率≥'), key: '', type: 'text' },
            { label: '', type: 'input', key: 'update_timeliness_value' },
            { label: '%', key: '', type: 'text' },
            { label: '', type: 'select', key: 'logical_operator' },
            { label: __('整体质量合格率≥'), key: '', type: 'text' },
            { label: '', type: 'input', key: 'quality_pass_value' },
        ],
    },
    {
        label: __('黄牌：'),
        key: 'yellow_card',
        list: [
            { label: __('整体更新及时率≥'), key: '', type: 'text' },
            { label: '', type: 'input', key: 'update_timeliness_value' },
            { label: '%', key: '', type: 'text' },
            { label: '', type: 'select', key: 'logical_operator' },
            { label: __('整体质量合格率≥'), key: '', type: 'text' },
            { label: '', type: 'input', key: 'quality_pass_value' },
        ],
    },
    {
        label: __('红牌：'),
        key: 'red_card',
        list: [
            { label: __('整体更新及时率<'), type: 'text' },
            { label: '', type: 'input', key: 'update_timeliness_value' },
            { label: '%', type: 'text' },
            { label: '', type: 'select', key: 'logical_operator' },
            { label: __('整体质量合格率<'), type: 'text' },
            { label: '', type: 'input', key: 'quality_pass_value' },
        ],
    },
]
export enum cardType {
    GreenCard = '绿',
    YellowCard = '黄',
    RedCard = '红',
}
export const cardList = [
    {
        label: __('绿'),
        value: cardType.GreenCard,
        bgColor: 'rgba(82, 196, 27, 0.08)',
        color: 'rgba(82, 196, 27, 1)',
    },
    {
        label: __('黄'),
        value: cardType.YellowCard,
        bgColor: 'rgba(250, 173, 20, 0.08)',
        color: 'rgba(250, 173, 20, 1)',
    },
    {
        label: __('红'),
        value: cardType.RedCard,
        bgColor: 'rgba(230, 0, 19, 0.08)',
        color: 'rgba(230, 0, 19, 1)',
    },
]
/**
 * @param data 原数据
 * @param timeFields 时间字段，需要转时间字符串
 * @param dictMap 枚举值map，key为字段名称，value为需要转换的字典列表，具体项值根据value匹配，显示label
 */
export const exportDataFormat = (
    data: any[],
    timeFields: string[],
    dictMap?: any,
) => {
    const list = data.map((item) => {
        const obj: any = {}
        // eslint-disable-next-line no-restricted-syntax, guard-for-in
        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                if (isBoolean(item[key])) {
                    obj[key] = item[key] ? __('是') : __('否')
                } else if (timeFields.includes(key)) {
                    obj[key] = item[key]
                        ? moment(item[key]).format('YYYY-MM-DD')
                        : ''
                } else if (dictMap?.[key]) {
                    obj[key] = dictMap?.[key]?.find(
                        (o) => o.value === item[key],
                    )?.label
                } else if (
                    key === 'update_timeliness' ||
                    key === 'overall_update_timeliness'
                ) {
                    obj[key] = `${item[key]}%`
                } else {
                    obj[key] = item[key]
                }
            }
        }
        if (item.data_update || item.quality_check) {
            const arry: string[] = []
            if (item.data_update) {
                arry.push(__('数据更新白名单'))
            }
            if (item.quality_check) {
                arry.push(__('质量检测白名单'))
            }
            obj.whitelist_type = arry.join('、')
        }

        return obj
    })
    return list
}
