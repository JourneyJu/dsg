import { Drawer, Modal } from 'antd'
import { useEffect, useState } from 'react'
import __ from '../locale'
import { detailsFields } from './const'
import styles from './styles.module.less'
import { AppInfoDetail, getAppsDetail, IAppRegisterListItem } from '@/core'

interface DetailsProps {
    open: boolean
    onCancel: () => void
    data: IAppRegisterListItem
}

const Details = ({ open, onCancel, data }: DetailsProps) => {
    const [detail, setDetail] = useState<IAppRegisterListItem & AppInfoDetail>()

    const getDetail = async () => {
        const res = await getAppsDetail(data?.id!, { version: 'editing' })
        setDetail({
            ...data,
            ...res,
        })
    }
    useEffect(() => {
        if (data?.id) {
            getDetail()
        }
    }, [data])

    return (
        <Drawer
            width={460}
            open={open}
            onClose={onCancel}
            title={__('应用详情')}
            footer={null}
        >
            <div className={styles['details-container']}>
                <div className={styles['details-fields']}>
                    {detailsFields.map((item) => (
                        <div key={item.key} className={styles['field-item']}>
                            <div className={styles['field-label']}>
                                {item.label}：
                            </div>
                            <div
                                className={styles['field-value']}
                                title={
                                    item.titleKey
                                        ? detail?.[item.titleKey]
                                        : undefined
                                }
                            >
                                {item.render ? (
                                    item.render(detail?.[item.key])
                                ) : item.key === 'ip_addr' ? (
                                    <div
                                        className={styles['ip-addr-container']}
                                    >
                                        {detail?.ip_addr?.map((ipItem) => (
                                            <div
                                                key={ipItem.ip}
                                                className={
                                                    styles['ip-addr-item']
                                                }
                                                title={`${ipItem.ip}:${ipItem.port}`}
                                            >
                                                {ipItem.ip}:{ipItem.port}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    detail?.[item.key]
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Drawer>
    )
}

export default Details
