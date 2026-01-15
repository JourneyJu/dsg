import React, { useState, useEffect } from 'react'
import { Button, Space, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import moment from 'moment'
import styles from './styles.module.less'

const { Text } = Typography

const StatsHeader: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
    const [currentTime, setCurrentTime] = useState(
        moment().format('YYYY-MM-DD HH:mm:ss'),
    )

    // Mock system running time
    const systemStartTime = moment().subtract(15, 'day').subtract(4, 'hour')
    const [runDuration, setRunDuration] = useState('')

    useEffect(() => {
        const timer = setInterval(() => {
            const now = moment()
            setCurrentTime(now.format('YYYY-MM-DD HH:mm:ss'))

            const diff = now.diff(systemStartTime)
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor(
                (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            )
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            setRunDuration(`${days}天${hours}小时${minutes}分`)
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className={styles.statsHeader}>
            <Space size="large">
                <Text>当前统计时间：{currentTime}</Text>
                <Text>系统运行：{runDuration}</Text>
            </Space>
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
                刷新
            </Button>
        </div>
    )
}

export default StatsHeader
