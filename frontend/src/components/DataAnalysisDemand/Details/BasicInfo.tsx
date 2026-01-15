import { Col, Row } from 'antd'
import styles from './styles.module.less'
import { applyFieldsConfig, IFieldConfig } from '../helper'

interface BasicInfoProps {
    details: any
    config?: IFieldConfig[]
    clickEvent?: { name: string; onClick: (data) => void }[]
}
const BasicInfo = ({
    details,
    config = applyFieldsConfig,
    clickEvent = [],
}: BasicInfoProps) => {
    return (
        <Row className={styles['apply-info-row']}>
            {config.map((item) => {
                return (
                    <Col
                        key={item.key}
                        className={styles['basic-item']}
                        span={item.span}
                    >
                        <div className={styles.label}>{item.label}：</div>
                        <div
                            className={styles.value}
                            onClick={
                                clickEvent.find((e) => e.name === item.key)
                                    ?.onClick || undefined
                            }
                        >
                            {item.render
                                ? item.render(
                                      details?.[item.key],
                                      details || {},
                                  )
                                : details?.[item.key] || '--'}
                        </div>
                    </Col>
                )
            })}
        </Row>
    )
}

export default BasicInfo
