// 生成过去7天的日期
export const generateDates = () => {
    const dates: string[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i -= 1) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        dates.push(date.toISOString().split('T')[0])
    }

    return dates
}

// 折线图模拟数据
export const mockData = () => {
    const dates = generateDates()

    // 模拟数据值
    const dataTableValues = [250, 550, 550, 700, 650, 550, 1000]
    const dataVolumeValues = [550, 250, 700, 550, 850, 350, 550]

    const result: Array<{
        date: string
        type: string
        value: number
    }> = []

    dates.forEach((date, index) => {
        result.push({
            date,
            type: '数据表',
            value: dataTableValues[index] || 0,
        })
        result.push({
            date,
            type: '数据量',
            value: dataVolumeValues[index] || 0,
        })
    })

    return result
}
