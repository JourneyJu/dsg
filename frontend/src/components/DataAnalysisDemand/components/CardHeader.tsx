import { Row, Col, Space, Button } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import classnames from 'classnames'
import React from 'react'
import { FontIcon } from '@/icons'
import { formatTime } from '@/utils'
import styles from './styles.module.less'
import __ from '../locale'
import { CommissionType } from '../const'

interface CardHeaderProps {
    section: any
    expanded: boolean
    handleToggleExpand: (section: any) => void
}

const CardHeader: React.FC<CardHeaderProps> = ({
    section,
    expanded,
    handleToggleExpand,
}) => {
    return (
        <Row
            justify="space-between"
            align="middle"
            className={styles.sectionRow}
        >
            <Col className={styles.sectionInfo}>
                <Space size="large" className={styles.infoSpace}>
                    <span className={styles.sectionTitle}>
                        <FontIcon
                            name="icon-shenqingdan"
                            style={{ color: '#126ee3' }}
                        />
                        <span
                            className={styles.ellipsisContent}
                            title={section.name}
                        >
                            {section.name}
                        </span>
                    </span>
                    <span className={styles.infoItem}>
                        <span className={styles.label}>{__('分析成果')}：</span>
                        <span
                            className={classnames(
                                styles.ellipsisContent,
                                styles.resourceNum,
                            )}
                        >
                            {section.output_item_num}
                        </span>
                    </span>
                    <span className={styles.infoItem}>
                        <span className={styles.label}>{__('申请部门')}：</span>
                        <span
                            className={styles.ellipsisContent}
                            title={
                                section.apply_org_path || section.apply_org_name
                            }
                        >
                            {section.apply_org_name}
                        </span>
                    </span>
                    <span className={styles.infoItem}>
                        <span className={styles.label}>{__('委托方式')}：</span>
                        <span className={styles.ellipsisContent}>
                            {section.commission_type ===
                            CommissionType.CommissionBased
                                ? __('委托型')
                                : __('自助型')}
                        </span>
                    </span>
                    <span className={styles.infoItem}>
                        <span className={styles.label}>{__('申请时间')}：</span>
                        <span
                            className={styles.ellipsisContent}
                            title={formatTime(section.created_at)}
                        >
                            {formatTime(section.created_at)}
                        </span>
                    </span>
                </Space>
            </Col>
            <Col className={styles.actionCol}>
                <Button
                    type="link"
                    onClick={() => handleToggleExpand(section)}
                    icon={expanded ? <UpOutlined /> : <DownOutlined />}
                >
                    {expanded ? __('收起') : __('展开')}
                </Button>
            </Col>
        </Row>
    )
}

export default CardHeader
