import { Collapse, Drawer, Modal } from 'antd'
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import __ from '../locale'
import { detailsFields } from './const'
import styles from './styles.module.less'
import { AppInfoDetail, getAppsDetail, IAppRegisterListItem } from '@/core'

const { Panel } = Collapse

interface DetailsProps {
    open: boolean
    onCancel: () => void
    data: IAppRegisterListItem
}

interface IOtherInfo {
    area_name?: string
    department_name?: string
    org_code?: string
    range?: string
    info_system_name?: string
}

const Details = ({ open, onCancel, data }: DetailsProps) => {
    const [detail, setDetail] = useState<
        IAppRegisterListItem & AppInfoDetail & IOtherInfo
    >()

    const getDetail = async () => {
        const res = await getAppsDetail(data?.id!, { version: 'editing' })
        setDetail({
            ...data,
            ...res,
            ...res.province_app_info,
            area_name: res.province_app_info?.area_info.value,
            department_name:
                res.province_app_info?.org_info.department_name || '',
            department_path:
                res.province_app_info?.org_info.department_path || '',
            org_code: res.province_app_info?.org_info.org_code,
            range: res.province_app_info?.range_info.value,
            info_system_name: res.info_systems.name,
        })
    }
    useEffect(() => {
        if (data?.id) {
            getDetail()
        }
    }, [data])

    const getExpandIcon = (panelProps) => {
        return panelProps.isActive ? (
            <CaretDownOutlined className={styles.arrowIcon} />
        ) : (
            <CaretRightOutlined className={styles.arrowIcon} />
        )
    }
    return (
        <Drawer
            width={640}
            open={open}
            onClose={onCancel}
            title={__('应用详情')}
            footer={null}
        >
            <div className={styles['details-container']}>
                <Collapse
                    bordered={false}
                    defaultActiveKey={[
                        'basic_info',
                        'report_info',
                        'more_info',
                    ]}
                    ghost
                    expandIcon={getExpandIcon}
                    className="site-collapse-custom-collapse"
                >
                    {detailsFields.map((item) => (
                        <Panel header={item.title} key={item.key}>
                            {item.fields.map((field) => (
                                <div
                                    key={field.key}
                                    className={styles['field-item']}
                                >
                                    <div className={styles['field-label']}>
                                        {field.label}：
                                    </div>
                                    <div
                                        className={styles['field-value']}
                                        title={
                                            field.titleKey
                                                ? detail?.[field.titleKey]
                                                : undefined
                                        }
                                    >
                                        {field.render ? (
                                            field.render(detail?.[field.key])
                                        ) : field.key === 'ip_addr' ? (
                                            <div
                                                className={
                                                    styles['ip-addr-container']
                                                }
                                            >
                                                {detail?.ip_addr?.map(
                                                    (ipItem) => (
                                                        <div
                                                            key={ipItem.ip}
                                                            className={
                                                                styles[
                                                                    'ip-addr-item'
                                                                ]
                                                            }
                                                            title={`${ipItem.ip}:${ipItem.port}`}
                                                        >
                                                            {ipItem.ip}:
                                                            {ipItem.port}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            detail?.[field.key] || '--'
                                        )}
                                    </div>
                                </div>
                            ))}
                        </Panel>
                    ))}
                </Collapse>
            </div>
        </Drawer>
    )
}

export default Details
