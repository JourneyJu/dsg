import {
    AggregationStatus,
    DataResourceType,
    SubjectGroupKeys,
    TabKey,
    DataRangeItems,
} from './const'

/** 转换数据 */
export const transformData = (data: any) => {
    const {
        data_resource_count,
        aggregation,
        subject_group,

        ...rest
    } = data || {}

    const aggregation_total = aggregation?.reduce(
        (acc, item) => acc + (item.count ?? 0),
        0,
    )
    const aggregation_completed =
        aggregation.filter(
            (item) => item.status === AggregationStatus.Completed,
        )?.count ?? 0

    const aggregation_uncompleted = aggregation_total - aggregation_completed

    const aggregation_task = {
        aggregation_total,
        aggregation_completed,
        aggregation_uncompleted,
    }

    const data_resource_total = (data_resource_count || []).reduce(
        (acc, item) => acc + item.count,
        0,
    )

    const subject_group_new = (subject_group || []).map((item, index) => {
        return [SubjectGroupKeys[index], ...(item || [])]
    })

    return {
        data_resource: {
            data_resource_total,
            data_resource_view: data_resource_count?.find(
                (item) => item.type === DataResourceType.View,
            )?.count,
            data_resource_api: data_resource_count?.find(
                (item) => item.type === DataResourceType.Api,
            )?.count,
            data_resource_file: data_resource_count?.find(
                (item) => item.type === DataResourceType.File,
            )?.count,
        },
        subject_group: subject_group_new,
        aggregation_task,
        ...rest,
    }
}

/**
 * 转换饼图数据
 * @param data 数据
 * @param selectedTab 选中tab
 * @returns
 */
export const transformPieData = (data: any[], selectedTab: TabKey) => {
    return data.map((item, index) => {
        // 基础信息（subject_group）场景：直接展示后端返回的 subject_name
        if (selectedTab === TabKey.SubjectGroup) {
            const typeLabel = item?.subject_name ?? '未知'
            const valueNum = item?.count ?? 0

            return {
                type: typeLabel,
                value: valueNum,
            }
        }
        // 目录层级（data_range）场景：根据 DataRangeItems 显示对应的 label
        const op = DataRangeItems.find((it) => it.value === item?.data_range)
        const typeLabel = op?.label ?? '未知'
        const valueNum = item?.count ?? 0

        return {
            type: typeLabel,
            value: valueNum,
        }
    })
}
