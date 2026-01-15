import { SortDirection } from '@/core'
import __ from './locale'
import { formatTime } from '@/utils'

/**
 * 日志类型
 */
const enum LogOptionEnum {
    // 登录
    Login = 'login',
    // 退出
    Logout = 'logout',
}

/**
 * 日志类型映射
 */
export const logOptionMap = {
    [LogOptionEnum.Login]: {
        text: __('登录'),
    },
    [LogOptionEnum.Logout]: {
        text: __('退出'),
    },
}

/**
 * 日志相关操作
 */
export const logOption = [
    {
        value: LogOptionEnum.Login,
        label: logOptionMap[LogOptionEnum.Login].text,
    },
    {
        value: LogOptionEnum.Logout,
        label: logOptionMap[LogOptionEnum.Logout].text,
    },
]

/**
 * 详情默认列表
 */
export const detailsDefault = [
    {
        key: 'login_name',
        label: __('登录账号'),
        span: 24,
        value: '',
    },
    {
        key: 'name',
        label: __('用户名'),
        span: 24,
        value: '',
    },
    {
        key: 'department_path',
        label: __('所属部门'),
        span: 24,
        value: '',
    },
    {
        key: 'department_code',
        label: __('部门编号'),
        span: 24,
        value: '',
    },
    {
        key: 'operation',
        label: __('操作类型'),
        span: 24,
        value: '',
    },
    {
        key: 'description',
        label: __('描述'),
        span: 24,
        value: '',
    },
    {
        key: 'ip',
        label: __('IP'),
        span: 24,
        value: '',
    },
    {
        key: 'operation_time',
        label: __('操作时间'),
        span: 24,
        value: '',
    },
]

// 展示值
export const showValue = ({ actualDetails }: { actualDetails: any }) => ({
    operation: logOptionMap[actualDetails?.operation]?.text,
    operation_time: formatTime(actualDetails?.operation_time),
})

// 刷新详情
export const refreshDetails = ({
    detailList = [],
    actualDetails,
}: {
    detailList?: any[]
    actualDetails?: any
}) => {
    // 根据详情列表的key，展示对应的value
    return actualDetails
        ? detailList?.map((i) => ({
              ...i,
              value:
                  showValue({
                      actualDetails,
                  })[i.key] ??
                  actualDetails[i.key] ??
                  '',
          }))
        : detailList
}
