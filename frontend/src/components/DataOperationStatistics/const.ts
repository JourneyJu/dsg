import moment from 'moment'
import { IDeptModelCallItem } from '@/core'

export enum DataStatisticsType {
    // 数据查询统计
    QUERY = 'query',
    // 数据校核统计
    VERIFY = 'verify',
    // 数据关联统计
    ASSOC = 'assoc',
}

/**
 * 格式化部门调用趋势数据
 * @param data 原始部门模型调用统计数据
 * @returns 返回[columnData, lineData]格式的数据，用于图表展示
 */
export const formatDeptCallTrendData = (
    data: IDeptModelCallItem[],
): [any[], any[]] => {
    const columnData: any[] = []
    const lineData: any[] = []
    const timeMap = new Map<
        string,
        { total: number; depts: Map<string, number> }
    >()

    // 按时间分组处理数据
    data.forEach((item) => {
        const time = item.time || ''
        const dept = item.dept || ''
        const value = item.value || 0

        if (!timeMap.has(time)) {
            timeMap.set(time, { total: 0, depts: new Map() })
        }

        const timeData = timeMap.get(time)!
        timeData.total += value
        timeData.depts.set(dept, (timeData.depts.get(dept) || 0) + value)
    })

    // 计算各部门总调用量，获取Top5部门
    const deptTotalMap = new Map<string, number>()
    Array.from(timeMap.values()).forEach((timeData) => {
        timeData.depts.forEach((value, dept) => {
            deptTotalMap.set(dept, (deptTotalMap.get(dept) || 0) + value)
        })
    })

    const top5Depts = Array.from(deptTotalMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([dept]) => dept)

    // 生成columnData（柱状图数据）
    Array.from(timeMap.entries()).forEach(([time, timeData]) => {
        timeData.depts.forEach((value, dept) => {
            columnData.push({
                time,
                dept,
                value,
            })
        })
    })

    // 生成lineData（折线图数据）
    Array.from(timeMap.entries()).forEach(([time, timeData]) => {
        // 全部部门总量
        lineData.push({
            time,
            type: '全部部门',
            count: timeData.total,
        })

        // Top5部门总量
        let top5Total = 0
        top5Depts.forEach((dept) => {
            top5Total += timeData.depts.get(dept) || 0
        })

        lineData.push({
            time,
            type: 'Top5部门',
            count: top5Total,
        })
    })

    return [columnData, lineData]
}
