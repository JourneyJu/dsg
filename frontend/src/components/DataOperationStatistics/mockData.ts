// Mock data for data operation statistics components

// 数据查询统计相关 mock 数据
export const queryStatsMockData = {
    // 资源目录分布数据
    resourceDistData: [
        { type: '无条件共享', value: 30 },
        { type: '有条件共享', value: 40 },
        { type: '不予共享', value: 30 },
    ],

    // 主题目录分布数据
    themeDistData: [
        { type: '人', value: 20 },
        { type: '地', value: 15 },
        { type: '事', value: 25 },
        { type: '物', value: 15 },
        { type: '组织', value: 15 },
        { type: '其他', value: 10 },
    ],

    // 部门使用排名数据
    deptUsageData: [
        { dept: '公安局', type: '查询次数', value: 1500 },
        { dept: '公安局', type: '使用次数', value: 1200 },
        { dept: '人社局', type: '查询次数', value: 1100 },
        { dept: '人社局', type: '使用次数', value: 900 },
        { dept: '民政局', type: '查询次数', value: 800 },
        { dept: '民政局', type: '使用次数', value: 750 },
        { dept: '卫健委', type: '查询次数', value: 600 },
        { dept: '卫健委', type: '使用次数', value: 500 },
        { dept: '教育局', type: '查询次数', value: 400 },
        { dept: '教育局', type: '使用次数', value: 300 },
    ],

    deptUsageDataTop10: [
        { dept: '公安局', value: 450, type: '使用次数' },
        { dept: '人社局', value: 380, type: '使用次数' },
        { dept: '民政局', value: 320, type: '使用次数' },
        { dept: '卫健委', value: 280, type: '使用次数' },
        { dept: '教育局', value: 200, type: '使用次数' },
        { dept: '交通局', value: 180, type: '使用次数' },
        { dept: '财政局', value: 150, type: '使用次数' },
        { dept: '市场监管局', value: 120, type: '使用次数' },
        { dept: '医保局', value: 90, type: '使用次数' },
        { dept: '应急局', value: 60, type: '使用次数' },
    ].sort((a, b) => a.value - b.value),

    // 目录使用排名数据
    dirUsageData: [
        { dir: '人口基本信息', value: 420 },
        { dir: '法人单位信息', value: 380 },
        { dir: '电子证照信息', value: 350 },
        { dir: '信用记录信息', value: 310 },
        { dir: '不动产登记信息', value: 290 },
        { dir: '婚姻登记信息', value: 260 },
        { dir: '社会保障卡信息', value: 230 },
        { dir: '公积金缴存信息', value: 210 },
        { dir: '车辆登记信息', value: 190 },
        { dir: '行政许可信息', value: 170 },
    ].sort((a, b) => a.value - b.value),

    // 部门任务执行情况数据
    taskExecData: [
        {
            dept: '公安局',
            tasks: 12,
            execs: 1200,
            volume: '50GB',
            duration: '2h',
            success: 1180,
            fail: 20,
            rate: '98.3%',
        },
        {
            dept: '人社局',
            tasks: 10,
            execs: 1000,
            volume: '40GB',
            duration: '1.5h',
            success: 990,
            fail: 10,
            rate: '99.0%',
        },
        {
            dept: '民政局',
            tasks: 8,
            execs: 800,
            volume: '30GB',
            duration: '1h',
            success: 795,
            fail: 5,
            rate: '99.4%',
        },
        {
            dept: '卫健委',
            tasks: 6,
            execs: 600,
            volume: '20GB',
            duration: '45m',
            success: 590,
            fail: 10,
            rate: '98.3%',
        },
        {
            dept: '教育局',
            tasks: 5,
            execs: 500,
            volume: '15GB',
            duration: '30m',
            success: 498,
            fail: 2,
            rate: '99.6%',
        },
    ],

    // 部门分布数据
    deptDistData: [
        { dept: '公安局', count: 120 },
        { dept: '人社局', count: 98 },
        { dept: '民政局', count: 86 },
        { dept: '卫健委', count: 75 },
        { dept: '教育局', count: 60 },
    ],

    // 目录使用排名Top10数据
    directoryUsageTop10: [
        { rank: 1, name: '人口基本信息', dept: '公安局', count: 5000 },
        { rank: 2, name: '婚姻登记信息', dept: '民政局', count: 4500 },
        { rank: 3, name: '社保缴纳记录', dept: '人社局', count: 4200 },
        { rank: 4, name: '企业基本信息', dept: '市场监管局', count: 3800 },
        { rank: 5, name: '不动产登记信息', dept: '自然资源局', count: 3500 },
        { rank: 6, name: '出生医学证明', dept: '卫健委', count: 3000 },
        { rank: 7, name: '公积金缴存', dept: '公积金中心', count: 2800 },
        { rank: 8, name: '低保人员名单', dept: '民政局', count: 2500 },
        { rank: 9, name: '学位学历信息', dept: '教育局', count: 2200 },
        { rank: 10, name: '驾驶证信息', dept: '公安局', count: 2000 },
    ],

    // 生成趋势数据的方法
    getTrendData: (type: 'day' | 'month' | 'year') => {
        const themes = ['人', '地', '事', '物', '组织', '其他']
        const columnData: any[] = []
        const lineData: any[] = []

        if (type === 'day') {
            // Last 7 days from yesterday
            const today = new Date()
            // eslint-disable-next-line no-plusplus
            for (let i = 7; i > 0; i--) {
                const date = new Date(today)
                date.setDate(today.getDate() - i)
                const dateStr = date.toISOString().split('T')[0]
                themes.forEach((theme) => {
                    columnData.push({
                        time: dateStr,
                        type: theme,
                        value: Math.floor(Math.random() * 50) + 10,
                    })
                })
                lineData.push({
                    time: dateStr,
                    count: Math.floor(Math.random() * 30) + 20,
                })
            }
        } else if (type === 'month') {
            // Last 6 months from last month
            const today = new Date()
            // eslint-disable-next-line no-plusplus
            for (let i = 6; i > 0; i--) {
                const date = new Date(
                    today.getFullYear(),
                    today.getMonth() - i,
                    1,
                )
                const monthStr = `${date.getFullYear()}-${String(
                    date.getMonth() + 1,
                ).padStart(2, '0')} `
                themes.forEach((theme) => {
                    columnData.push({
                        time: monthStr,
                        type: theme,
                        value: Math.floor(Math.random() * 200) + 50,
                    })
                })
                lineData.push({
                    time: monthStr,
                    count: Math.floor(Math.random() * 100) + 50,
                })
            }
        } else if (type === 'year') {
            // Last 5 years from last year
            const currentYear = new Date().getFullYear()
            // eslint-disable-next-line no-plusplus
            for (let i = 5; i > 0; i--) {
                const yearStr = String(currentYear - i)
                themes.forEach((theme) => {
                    columnData.push({
                        time: yearStr,
                        type: theme,
                        value: Math.floor(Math.random() * 1000) + 200,
                    })
                })
                lineData.push({
                    time: yearStr,
                    count: Math.floor(Math.random() * 500) + 100,
                })
            }
        }
        return [columnData, lineData]
    },

    // 生成调用趋势数据的方法
    getCallTrendData: (dateRange: [any, any]) => {
        const data: any[] = []
        const [start, end] = dateRange

        let unit: 'day' | 'month' | 'year' = 'day'
        let format = 'YYYY-MM-DD'

        if (end.diff(start, 'day') > 60) {
            unit = 'month'
            format = 'YYYY-MM'
        } else if (end.diff(start, 'day') > 365) {
            unit = 'year'
            format = 'YYYY'
        }

        const current = start.clone()
        while (current.isBefore(end) || current.isSame(end, unit)) {
            const timeStr = current.format(format)
            const total = Math.floor(Math.random() * 100) + 50
            const success = Math.floor(total * 0.96)
            const fail = total - success

            data.push({ time: timeStr, type: '总调用', value: total })
            data.push({ time: timeStr, type: '成功', value: success })
            data.push({ time: timeStr, type: '失败', value: fail })

            current.add(1, unit)
        }

        return data
    },
}

// 数据校核统计相关 mock 数据 (与查询统计相同，但标题不同)
export const verifyStatsMockData = {
    ...queryStatsMockData,
}

// 数据关联统计相关 mock 数据
export const assocStatsMockData = {
    // 模型总量与增量趋势数据
    modelGrowthData: [
        { time: '2025-07', type: '总量', value: 100 },
        { time: '2025-07', type: '增量', value: 10 },
        { time: '2025-08', type: '总量', value: 115 },
        { time: '2025-08', type: '增量', value: 15 },
        { time: '2025-09', type: '总量', value: 130 },
        { time: '2025-09', type: '增量', value: 15 },
        { time: '2025-10', type: '总量', value: 150 },
        { time: '2025-10', type: '增量', value: 20 },
        { time: '2025-11', type: '总量', value: 180 },
        { time: '2025-11', type: '增量', value: 30 },
        { time: '2025-12', type: '总量', value: 200 },
        { time: '2025-12', type: '增量', value: 20 },
    ],

    // 部门使用排名数据
    deptUsageData: [
        { dept: '公安局', value: 150, type: '元数据模型' },
        { dept: '公安局', value: 200, type: '主题模型' },
        { dept: '人社局', value: 120, type: '元数据模型' },
        { dept: '人社局', value: 180, type: '主题模型' },
        { dept: '民政局', value: 100, type: '元数据模型' },
        { dept: '民政局', value: 150, type: '主题模型' },
        { dept: '卫健委', value: 80, type: '元数据模型' },
        { dept: '卫健委', value: 120, type: '主题模型' },
        { dept: '教育局', value: 60, type: '元数据模型' },
        { dept: '教育局', value: 90, type: '主题模型' },
        { dept: '交通局', value: 50, type: '元数据模型' },
        { dept: '交通局', value: 80, type: '主题模型' },
        { dept: '财政局', value: 40, type: '元数据模型' },
        { dept: '财政局', value: 70, type: '主题模型' },
        { dept: '市场监管局', value: 30, type: '元数据模型' },
        { dept: '市场监管局', value: 60, type: '主题模型' },
        { dept: '医保局', value: 20, type: '元数据模型' },
        { dept: '医保局', value: 50, type: '主题模型' },
        { dept: '应急局', value: 10, type: '元数据模型' },
        { dept: '应急局', value: 40, type: '主题模型' },
    ],

    // 目录使用情况统计数据
    dirUsageStats: [
        { time: '2025-12-01', type: '元数据模型', value: 12 },
        { time: '2025-12-01', type: '主题模型', value: 18 },
        { time: '2025-12-02', type: '元数据模型', value: 15 },
        { time: '2025-12-02', type: '主题模型', value: 22 },
        { time: '2025-12-03', type: '元数据模型', value: 10 },
        { time: '2025-12-03', type: '主题模型', value: 15 },
        { time: '2025-12-04', type: '元数据模型', value: 20 },
        { time: '2025-12-04', type: '主题模型', value: 25 },
        { time: '2025-12-05', type: '元数据模型', value: 18 },
        { time: '2025-12-05', type: '主题模型', value: 28 },
        { time: '2025-12-06', type: '元数据模型', value: 25 },
        { time: '2025-12-06', type: '主题模型', value: 35 },
        { time: '2025-12-07', type: '元数据模型', value: 22 },
        { time: '2025-12-07', type: '主题模型', value: 30 },
    ],

    // 生成部门调用模型趋势数据的方法
    getDeptCallTrendData: (type: 'day' | 'month' | 'year') => {
        const columnData: any[] = []
        const lineData: any[] = []
        const top5Depts = ['公安局', '人社局', '民政局', '卫健委', '教育局']

        const generateData = (timeStr: string) => {
            let top5Total = 0
            top5Depts.forEach((dept) => {
                const val = Math.floor(Math.random() * 50) + 10
                top5Total += val
                columnData.push({ time: timeStr, dept, value: val })
            })
            const total = top5Total + Math.floor(Math.random() * 100) + 20

            lineData.push({ time: timeStr, type: '全部部门', count: total })
            lineData.push({ time: timeStr, type: 'Top5部门', count: top5Total })
        }

        if (type === 'day') {
            const today = new Date()
            // eslint-disable-next-line no-plusplus
            for (let i = 7; i > 0; i--) {
                const date = new Date(today)
                date.setDate(today.getDate() - i)
                generateData(date.toISOString().split('T')[0])
            }
        } else if (type === 'month') {
            const today = new Date()
            // eslint-disable-next-line no-plusplus
            for (let i = 6; i > 0; i--) {
                const date = new Date(
                    today.getFullYear(),
                    today.getMonth() - i,
                    1,
                )
                generateData(
                    `${date.getFullYear()}-${String(
                        date.getMonth() + 1,
                    ).padStart(2, '0')}`,
                )
            }
        } else if (type === 'year') {
            const currentYear = new Date().getFullYear()
            // eslint-disable-next-line no-plusplus
            for (let i = 5; i > 0; i--) {
                generateData(String(currentYear - i))
            }
        }
        return [columnData, lineData]
    },
}

export const modelGrowthAllCount = {
    value: 200,
    unit: '个',
    // 较上月
    monthValue: 11.1,
    trend: 'up',
}
