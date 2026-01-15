import moment from 'moment'
import { SortDirection } from '@/core'
import __ from './locale'
import { SearchType } from '../SearchLayout/const'
import { onLineStatus } from '../ResourcesDir/const'

export const onlineStatusList = [
    {
        label: __('上线'),
        value: onLineStatus.Online,
        bgColor: '#52C41B',
    },
    {
        label: __('下线'),
        value: onLineStatus.Offline,
        bgColor: '#E60012',
    },
]

export const searchFormInitData = [
    {
        label: __('证照名称'),
        key: 'keyword',
        type: SearchType.Input,
        defaultValue: '',
        isAlone: true,
        itemProps: {
            maxLength: 255,
        },
    },
    {
        label: __('状态'),
        key: 'online_status',
        type: SearchType.Select,
        itemProps: {
            options: onlineStatusList,
        },
    },
    {
        label: __('更新时间'),
        key: 'updateTime',
        type: SearchType.RangePicker,
        itemProps: {
            format: 'YYYY-MM-DD',
            // disabledDate: (current: any) => disabledDate(current, {}),
        },
        startTime: 'updated_at_start',
        endTime: 'updated_at_end',
    },
]

export const menus = [
    { key: 'name', label: __('按证照名称排序') },
    { key: 'updated_at', label: __('按更新时间排序') },
]

export const defaultMenu = {
    key: 'updated_at',
    sort: SortDirection.DESC,
}

export const timeStrToTimestamp = (searchObj: any) => {
    const obj: any = {}
    const timeFields = ['updated_at_start', 'updated_at_end']
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
