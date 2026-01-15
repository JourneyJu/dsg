import { formatThousand } from '@/utils/number'
import { AggregationStatus, DataResourceType, SubjectGroupKeys } from './const'
import styles from './styles.module.less'
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

export const renderFooter = (children: any[], style?: any) => {
    return (
        <div className={styles['footer-wrapper']} style={style}>
            {children.map((item) => (
                <div key={item.label} className={styles['footer-wrapper-item']}>
                    <span style={{ color: item.color || '#78839f' }}>
                        {item.label}:
                    </span>
                    <span
                        style={{ color: 'rgba(0,0,0,0.85)' }}
                        title={(item.value ?? 0)?.toString()}
                    >
                        {formatThousand(item.value, '0')}
                    </span>
                </div>
            ))}
        </div>
    )
}
/**
 * 转换饼图数据
 * @param data 数据
 * @param fieldNames 字段名
 * @param options 选项
 * @param sortKeys 排序Keys
 * @returns
 */
export const transformPieData = (
    data: any[] = [],
    fieldNames: {
        type: string
        value: string
    } = { type: 'type', value: 'value' },
    options: Record<string, any>[] = [],
    sortKeys: string[] = [],
) => {
    const transformedData = data.map((item) => {
        const op = options.find((it) => it.value === item[fieldNames.type])
        return {
            type: op?.label ?? '未知',
            value: item[fieldNames.value],
            color: op?.color || '#78839F',
            originalType: item[fieldNames.type],
        }
    })

    if (sortKeys && sortKeys.length > 0) {
        return transformedData
            .sort((a, b) => {
                const indexA = sortKeys.indexOf(a.originalType)
                const indexB = sortKeys.indexOf(b.originalType)
                if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB
                }
                if (indexA !== -1 && indexB === -1) {
                    return -1
                }
                if (indexA === -1 && indexB !== -1) {
                    return 1
                }
                return 0
            })
            .map(({ originalType, ...rest }) => rest)
    }

    return transformedData.map(({ originalType, ...rest }) => rest)
}
