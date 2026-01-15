import __ from './locale'
/**
 * 数据推送状态
 */
export enum DataPushStatus {
    // 不流转
    Shadow = 0,
    // 草稿
    Draft = 1,
    // 待发布：未通过审核的叫「待发布」；包括暂存的和提交后还未通过审核的
    Pending = 2,
    // 未开始：通过审核的还没到开始时间、定时时间的叫「未开始」
    NotStarted = 3,
    // 进行中：到了开始时间的叫进行中
    InProgress = 4,
    // 已停用：点击停用后，变为已停用
    Stopped = 5,
    // 已结束：到了结束时间且最后一次作业请求完成后叫已结束
    Ended = 6,
}

export const dataPushStatusMap = {
    [DataPushStatus.Draft]: {
        text: __('待发布'),
        color: '#B2B2B2',
    },
    [DataPushStatus.Pending]: {
        text: __('待发布'),
        color: '#B2B2B2',
    },
    [DataPushStatus.NotStarted]: {
        text: __('未开始'),
        color: '#8C7BEB',
    },
    [DataPushStatus.InProgress]: {
        text: __('进行中'),
        color: '#5B91FF',
    },
    [DataPushStatus.Stopped]: {
        text: __('已停用'),
        color: '#F25D5D',
    },
    [DataPushStatus.Ended]: {
        text: __('已结束'),
        color: '#14CEAA',
    },
}
export const formatData = (data: any[]) => {
    let resource_department
    let info_resource = {}
    let data_resource = {}
    let database = {}
    let api = {}
    let file = {}
    data.forEach((item) => {
        if (item.category === 'resource_department') {
            resource_department = item.total
        }
        if (item.category === 'info_resource') {
            info_resource = item
        }
        if (item.category === 'data_resource') {
            data_resource = item
        }
        if (item.category === 'api') {
            api = item
        }
        if (item.category === 'database') {
            database = item
        }
        if (item.category === 'file') {
            file = item
        }
    })
    return {
        resource_department,
        info_resource,
        data_resource,
        database,
        api,
        file,
    }
}
