import { Col, Row } from 'antd'
import classNames from 'classnames'
import { PreViewBusinessConfig, PreViewDataConfig } from '../const'
import CommonStatisticalCard from './CommonStatisticalCard'
import styles from './styles.module.less'
import { Empty } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'
import __ from '../locale'

interface IStatisticalInfoProps {
    overviewData: any
}
const StatisticalInfo = ({ overviewData = {} }: IStatisticalInfoProps) => {
    return overviewData && Object.keys(overviewData).length > 0 ? (
        <div className={styles['statistical-info-container']}>
            <Row gutter={24}>
                {PreViewDataConfig.map((item, index) => {
                    const data1 = {
                        ...item.data1,
                        value: overviewData[item.key]?.[item.data1.value] || 0,
                    }
                    const data2 = {
                        ...item.data2,
                        value: overviewData[item.key]?.[item.data2.value] || 0,
                    }
                    return (
                        <Col
                            span={12}
                            className={styles['statistical-item']}
                            key={index}
                        >
                            <CommonStatisticalCard
                                key={index}
                                title={item.title}
                                data1={data1}
                                data2={data2}
                            />
                        </Col>
                    )
                })}
            </Row>
            <Row gutter={24}>
                {PreViewBusinessConfig.map((item, index) => {
                    const data1 = {
                        ...item.data1,
                        value: overviewData[item.key]?.[item.data1.value] || 0,
                    }
                    const data2 = {
                        ...item.data2,
                        value: overviewData[item.key]?.[item.data2.value] || 0,
                    }
                    return (
                        <Col
                            span={12}
                            className={classNames(
                                styles['statistical-item'],
                                index + 1 === PreViewBusinessConfig.length &&
                                    styles['statistical-item-last'],
                            )}
                            key={index}
                        >
                            <CommonStatisticalCard
                                key={index}
                                title={item.title}
                                data1={data1}
                                data2={data2}
                            />
                        </Col>
                    )
                })}
            </Row>
        </div>
    ) : (
        <Empty desc={__('当前目标无考核数据')} iconSrc={dataEmpty} />
    )
}

export default StatisticalInfo
