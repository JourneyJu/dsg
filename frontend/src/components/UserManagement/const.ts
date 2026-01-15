import __ from './locale'
import { SortDirection, SortType } from '@/core'

export const menus = [
    { key: SortType.NAME, label: __('按用户姓名排序') },
    { key: SortType.UPDATED, label: __('按更新时间排序') },
]

export const defaultMenu = {
    key: SortType.UPDATED,
    sort: SortDirection.DESC,
}
