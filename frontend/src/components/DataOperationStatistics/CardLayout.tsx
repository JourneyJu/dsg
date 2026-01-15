import React from 'react'
import { Card, Row, Col, Space } from 'antd'
import styles from './styles.module.less'

interface CardLayoutProps {
    title?: string
    headerBordered?: boolean
    split?: 'vertical' | 'horizontal'
    colSpan?: number
    children: React.ReactNode
    style?: React.CSSProperties
    gutter?: number | [number, number]
    direction?: 'column' | 'row'
    extra?: React.ReactNode
}

const CardLayout: React.FC<CardLayoutProps> = ({
    title,
    headerBordered = false,
    split,
    colSpan,
    children,
    style,
    gutter = 16,
    direction = 'row',
    extra,
}) => {
    if (colSpan) {
        // 如果有 colSpan，说明这是一个子卡片
        return (
            <Col span={colSpan} className={styles.colContainer}>
                <Card
                    title={title}
                    bordered={headerBordered}
                    style={style}
                    className={headerBordered ? styles.cardBordered : undefined}
                    extra={extra}
                >
                    {children}
                </Card>
            </Col>
        )
    }

    if (split === 'vertical') {
        return (
            <Row gutter={gutter}>
                {React.Children.map(children, (child, index) => (
                    <Col key={index} span={24 / React.Children.count(children)}>
                        {child}
                    </Col>
                ))}
            </Row>
        )
    }

    if (split === 'horizontal') {
        if (direction === 'column') {
            return (
                <Space direction="vertical" size={gutter as number}>
                    {children}
                </Space>
            )
        }
        return (
            <Row gutter={gutter}>
                {React.Children.map(children, (child, index) => (
                    <Col key={index} span={24 / React.Children.count(children)}>
                        {child}
                    </Col>
                ))}
            </Row>
        )
    }

    return (
        <Card
            title={title}
            bordered={headerBordered}
            style={style}
            className={headerBordered ? styles.cardBordered : undefined}
            extra={extra}
        >
            {children}
        </Card>
    )
}

export default CardLayout
