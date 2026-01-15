import React from 'react'
import moment from 'moment'
import { Tooltip, Popover, InputNumber } from 'antd'
import { Empty, Loader } from '@/ui'
import { formatTime } from '@/utils'
import dataEmpty from '@/assets/dataEmpty.svg'
import { statusMap, serviceTypeMap } from './const'
import styles from './styles.module.less'
import __ from './locale'

/**
 * 带圆点状态 view
 */
export const StatusView: React.FC<{
    record: any
    tip?: string
}> = ({ record, tip }) => {
    const { text, color } = statusMap[record?.status] || {}
    return (
        <div className={styles.statusView}>
            <div
                className={styles.dot}
                style={{ background: color || 'transparent' }}
            />
            <span className={styles.text}>{text || '--'}</span>
        </div>
    )
}

/**
 * 格式化单个IP地址项
 */
export const formatIpPortItem = (item: { ip: string; port: number }) => {
    const { ip, port } = item || {}
    if (ip && port) {
        return `${ip}:${port}`
    }
    if (ip) {
        return ip
    }
    if (port) {
        return String(port)
    }
    return '--'
}

/**
 * 接入IP
 */
export const IpView: React.FC<{ record: any }> = ({ record }) => {
    const ipAddrArray = record?.ip_addr || []

    // 如果不是数组或空数组，显示默认值
    if (!Array.isArray(ipAddrArray) || ipAddrArray.length === 0) {
        return '--'
    }

    // 格式化所有IP地址
    const formattedIpPorts = ipAddrArray.map(formatIpPortItem)

    // 获取第一项和剩余项信息
    const firstItem = formattedIpPorts[0]
    const remainingCount = formattedIpPorts.length - 1
    const remainingItems = formattedIpPorts.slice(1)

    // 生成剩余IP列表的Popover内容
    const renderPopoverContent = () => {
        return (
            <div className={styles.ipPopoverContent}>
                {remainingItems.map((item, index) => (
                    <div key={index} className={styles.ipPopoverItem}>
                        {item}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className={styles.ipViewWrapper}>
            <div className={styles.firstIp} title={firstItem}>
                {firstItem}
            </div>
            {remainingCount > 0 && (
                <Popover
                    content={renderPopoverContent()}
                    trigger="hover"
                    placement="topLeft"
                >
                    <div className={styles.moreTag}>+{remainingCount}</div>
                </Popover>
            )}
        </div>
    )
}

// 展示使用期限
const showUsagePeriod = (record: any) => {
    const { start_at, stop_at } = record || {}

    // 如果没有 start_at 和 stop_at，显示 --
    if (!start_at && !stop_at) {
        return '--'
    }

    // 处理不同情况的显示
    let startTime = '--'
    let stopTime = '--'
    let displayText = ''

    if (start_at) {
        startTime = formatTime(start_at, 'YYYY-MM-DD')
    }

    if (stop_at) {
        stopTime = formatTime(stop_at, 'YYYY-MM-DD')
    }

    displayText = __('${startTime} 至 ${stopTime}', {
        startTime,
        stopTime,
    })

    return displayText
}

// 使用期限
export const ExpireDateView: React.FC<{ record: any }> = ({ record }) => {
    const { start_at, stop_at } = record || {}

    const displayText = showUsagePeriod(record)

    // 判断是否过期 (只有当有结束时间时才判断)
    const currentTime = Date.now()
    const isExpired = stop_at && stop_at < currentTime

    if (isExpired) {
        return (
            <Tooltip title={__('授权服务已过期')}>
                <span className={styles.expiredDateView}>{displayText}</span>
            </Tooltip>
        )
    }

    return <span title={displayText}>{displayText}</span>
}

/**
 * 空数据
 */
export const renderEmpty = (marginTop: number = 36) => (
    <Empty
        iconSrc={dataEmpty}
        desc={__('暂无数据')}
        style={{ marginTop, width: '100%' }}
    />
)

/**
 * 加载中
 */
export const renderLoader = (marginTop: number = 104) => (
    <div style={{ marginTop, width: '100%' }}>
        <Loader />
    </div>
)

// 详情展示中的分组样式
export const DetailGroupTitle = ({ title }: { title: string }) => {
    return <div className={styles.detailGroupTitle}>{title}</div>
}

// 调用频率输入组件
export const CallFrequencyInput: React.FC<any> = ({
    value,
    onChange,
    ...props
}) => (
    <div className={styles.accessFrequencyWrapper}>
        <InputNumber value={value} onChange={onChange} {...props} />
        <div className={styles.unit}>{__('次/秒')}</div>
    </div>
)

// 将期望完成时间、创建时间调整为时间戳
export const timeStrToTimestamp = (searchObj: any) => {
    const obj: any = {}
    const timeFields = ['create_begin_time', 'create_end_time']
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

// 展示值
export const showValue = ({ actualDetails }: { actualDetails: any }) => ({
    apply_org_name: (
        <span title={actualDetails?.apply_org_path}>
            {actualDetails?.apply_org_name}
        </span>
    ),
    ip_addr: <IpView record={actualDetails} />,
    status: statusMap[actualDetails?.status]?.text || '--',
    created_at: formatTime(actualDetails?.created_at) || '--',
    enable_disable_at: formatTime(actualDetails?.enable_disable_at) || '--',
    start_at: <ExpireDateView record={actualDetails} />,
    service_type: serviceTypeMap[actualDetails?.service_type]?.text || '--',
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
