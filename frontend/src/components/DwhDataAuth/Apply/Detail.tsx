import React, { useEffect, useState } from 'react'
import { Collapse, Drawer, Row, Col } from 'antd'
import { CaretDownFilled } from '@ant-design/icons'
import classnames from 'classnames'
import DrawerHeader from '@/components/CitySharing/component/DrawerHeader'
import {
    formatError,
    getDwhDataAuthRequestDetail,
    getDatasheetViewDetails,
    IDwhDataAuthRequestDetail,
} from '@/core'
import { formatTime } from '@/utils'
import { Loader } from '@/ui'
import ViewRules from '@/components/DemandManagement/Details/ViewRules'
import { statusConfig, ApplyStatus } from './helper'
import __ from '../locale'
import styles from './styles.module.less'

const { Panel } = Collapse

interface IDetailProps {
    open: boolean
    recordId: string | null
    onClose: () => void
}

const Detail: React.FC<IDetailProps> = ({ open, recordId, onClose }) => {
    const [loading, setLoading] = useState(false)
    const [detailData, setDetailData] =
        useState<IDwhDataAuthRequestDetail | null>(null)
    const [fields, setFields] = useState<any[]>([])
    const [baseInfoExpanded, setBaseInfoExpanded] = useState(true)

    // 获取详情数据
    useEffect(() => {
        if (open && recordId) {
            fetchDetail()
        } else {
            setDetailData(null)
        }
    }, [open, recordId])

    const fetchDetail = async () => {
        if (!recordId) return
        try {
            setLoading(true)
            const res = await getDwhDataAuthRequestDetail(recordId)
            setDetailData(res)
            // 获取字段列表
            if (res.data_id) {
                try {
                    const fieldsRes = await getDatasheetViewDetails(res.data_id)
                    setFields(fieldsRes?.fields || [])
                } catch (error) {
                    // 如果获取字段失败，不影响详情展示
                }
            }
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    // 格式化申请类型
    const formatRequestType = (type: string) => {
        if (type === 'check') return __('数据校核')
        if (type === 'query') return __('数据查询')
        return type
    }

    // 格式化时间范围
    const formatTimeRange = (expiredAt: string | number | null) => {
        if (!expiredAt || expiredAt === 0 || expiredAt === '0')
            return __('永久有效')
        const timestamp =
            typeof expiredAt === 'number'
                ? expiredAt
                : new Date(expiredAt).getTime()
        return formatTime(timestamp, 'YYYY-MM-DD HH:mm')
    }

    return (
        <Drawer
            open={open}
            onClose={onClose}
            width="100%"
            bodyStyle={{ padding: 0 }}
            headerStyle={{ display: 'none' }}
            footer={null}
        >
            <div className={`${styles.apply} ${styles.detail}`}>
                {/* 导航头部 */}
                <DrawerHeader title={__('权限申请详情')} onClose={onClose} />
                {/* 内容 */}
                <div className={styles.bottom}>
                    <div className={styles.content}>
                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <Loader />
                            </div>
                        ) : detailData ? (
                            <div className={styles.form_content}>
                                {/* 基本信息 */}
                                <Collapse
                                    bordered={false}
                                    activeKey={
                                        baseInfoExpanded ? ['baseInfo'] : []
                                    }
                                    onChange={(keys) => {
                                        setBaseInfoExpanded(
                                            keys.includes('baseInfo'),
                                        )
                                    }}
                                    ghost
                                    className={styles.baseInfoCollapse}
                                >
                                    <Panel
                                        key="baseInfo"
                                        showArrow={false}
                                        header={
                                            <div
                                                className={
                                                    styles['filter-header-box']
                                                }
                                            >
                                                <CaretDownFilled
                                                    className={classnames(
                                                        styles[
                                                            'filter-header-box-icon'
                                                        ],
                                                        baseInfoExpanded &&
                                                            styles.expand,
                                                    )}
                                                />
                                                <span
                                                    className={
                                                        styles[
                                                            'filter-header-title'
                                                        ]
                                                    }
                                                >
                                                    {__('基本信息')}
                                                </span>
                                            </div>
                                        }
                                    >
                                        <Row gutter={[16, 16]}>
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('申请单名称')}:
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.valueName
                                                        }
                                                    >
                                                        {detailData.name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('申请库表')}:
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.valueName
                                                        }
                                                    >
                                                        {
                                                            detailData.data_business_name
                                                        }
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('申请权限')}:
                                                    </span>
                                                    <span
                                                        className={styles.value}
                                                    >
                                                        {__('读取')}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('时间范围')}:
                                                    </span>
                                                    <span
                                                        className={styles.value}
                                                    >
                                                        {formatTimeRange(
                                                            detailData.expired_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('申请类型')}:
                                                    </span>
                                                    <span
                                                        className={styles.value}
                                                    >
                                                        {formatRequestType(
                                                            detailData.request_type,
                                                        )}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('申请状态')}:
                                                    </span>
                                                    <span
                                                        className={styles.value}
                                                    >
                                                        {(() => {
                                                            const status =
                                                                detailData
                                                                    .status
                                                                    ?.phase as ApplyStatus
                                                            const config =
                                                                statusConfig[
                                                                    status
                                                                ]
                                                            if (!config)
                                                                return '--'
                                                            return (
                                                                <div
                                                                    className={
                                                                        styles.statusView
                                                                    }
                                                                >
                                                                    <div
                                                                        className={
                                                                            styles.statusDot
                                                                        }
                                                                        style={{
                                                                            background:
                                                                                config.color,
                                                                        }}
                                                                    />
                                                                    <span
                                                                        className={
                                                                            styles.statusText
                                                                        }
                                                                    >
                                                                        {
                                                                            config.label
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )
                                                        })()}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('申请人')}:
                                                    </span>
                                                    <span
                                                        className={styles.value}
                                                    >
                                                        {
                                                            detailData.applicant_name
                                                        }
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div
                                                    className={styles.infoItem}
                                                >
                                                    <span
                                                        className={styles.label}
                                                    >
                                                        {__('申请时间')}:
                                                    </span>
                                                    <span
                                                        className={styles.value}
                                                    >
                                                        {formatTime(
                                                            detailData.apply_time,
                                                        )}
                                                    </span>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Panel>
                                </Collapse>

                                {/* 限定列和限定行 */}
                                <ViewRules
                                    fields={fields}
                                    detail={detailData.spec}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Drawer>
    )
}

export default Detail
