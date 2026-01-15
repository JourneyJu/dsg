import { Drawer, Modal } from 'antd'
import __ from '../locale'
import { registerDetailsFields } from './const'
import styles from './styles.module.less'
import { ISystemItem } from '@/core'

interface DetailsProps {
    open: boolean
    onCancel: () => void
    data: ISystemItem
}

const Details = ({ open, onCancel, data }: DetailsProps) => {
    return (
        <Drawer
            width={460}
            open={open}
            onClose={onCancel}
            title={__('系统详情')}
            footer={null}
        >
            <div className={styles['details-container']}>
                <div className={styles['system-name']}>{data.name}</div>
                <div className={styles['details-fields']}>
                    {registerDetailsFields.map((item) => (
                        <div key={item.key} className={styles['field-item']}>
                            <div className={styles['field-label']}>
                                {item.label}
                            </div>
                            <div className={styles['field-value']}>
                                {item.render
                                    ? item.render(data)
                                    : data[item.key]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Drawer>
    )
}

export default Details
