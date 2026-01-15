import { Descriptions, Modal, ModalProps } from 'antd'
import { useEffect, useState } from 'react'
import { IRoleGroupDetails } from '@/core'
import __ from './locale'
import styles from './styles.module.less'
import RoleTag from './RoleTag'

interface IRoleGroupDetailsProps extends ModalProps {
    data?: IRoleGroupDetails
}

const RoleGroupDetails = ({ open, data, ...rest }: IRoleGroupDetailsProps) => {
    const [details, setDetails] = useState<IRoleGroupDetails>()

    useEffect(() => {
        if (open && data) {
            setDetails(data)
            return
        }
        setDetails(undefined)
    }, [open, data])

    return (
        <Modal
            open={open}
            title={__('角色组详情')}
            width={400}
            maskClosable
            destroyOnClose
            footer={null}
            className={styles.roleGroupDetails}
            bodyStyle={{ maxHeight: 545, overflow: 'hidden auto' }}
            {...rest}
        >
            <Descriptions
                column={1}
                labelStyle={{
                    width: '92px',
                    color: 'rgba(0, 0, 0, 0.45)',
                }}
            >
                <Descriptions.Item label={__('角色组名称')}>
                    {details?.name || '--'}
                </Descriptions.Item>
                <Descriptions.Item label={__('描述')}>
                    {details?.description || '--'}
                </Descriptions.Item>
                <Descriptions.Item
                    label={__('包含角色')}
                    contentStyle={{ flexWrap: 'wrap', gap: 8 }}
                >
                    {details?.roles?.length
                        ? details?.roles?.map((it) => (
                              <RoleTag key={it.id} role={it} />
                          ))
                        : '--'}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    )
}

export default RoleGroupDetails
