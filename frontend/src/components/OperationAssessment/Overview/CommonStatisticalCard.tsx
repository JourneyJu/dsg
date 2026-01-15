import { useMemo } from 'react'
import CaiTiao from '@/assets/caitiao.svg'
import styles from './styles.module.less'

interface IDataItem {
    label: string
    value: number
}
interface CommonStatisticalCardProps {
    title: string
    data1: IDataItem
    data2: IDataItem
}

const CommonStatisticalCard = ({
    title,
    data1,
    data2,
}: CommonStatisticalCardProps) => {
    const data = useMemo(() => {
        return [data1, data2]
    }, [data1, data2])

    return (
        <div className={styles['common-statistical-card']}>
            <div className={styles.title}>
                {title && <img src={CaiTiao} alt="" />}
                {title}
            </div>
            <div className={styles['data-container']}>
                {data.map((item, index) => {
                    return (
                        <div className={styles['data-item']} key={index}>
                            <div className={styles['item-label']}>
                                {item.label}
                            </div>
                            <div className={styles['item-value']}>
                                {item.value}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CommonStatisticalCard
