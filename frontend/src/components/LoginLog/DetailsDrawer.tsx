import React from 'react'
import { Drawer } from 'antd'
import styles from './styles.module.less'
import __ from './locale'
import { DetailsLabel } from '@/ui'
import { detailsDefault, refreshDetails } from './helper'

interface IDetailsDrawer {
    data?: any
    onClose: () => void
}

/**
 * 日志详情
 */
const DetailsDrawer: React.FC<IDetailsDrawer> = ({ data, onClose }) => {
    return (
        <Drawer
            title={__('登录日志详情')}
            placement="right"
            maskClosable
            onClose={onClose}
            open={!!data}
            destroyOnClose
            bodyStyle={{ padding: '16px 16px 8px' }}
            contentWrapperStyle={{ maxWidth: '80%' }}
            className={styles.logDetails}
        >
            <DetailsLabel
                wordBreak
                detailsList={refreshDetails({
                    detailList: detailsDefault,
                    actualDetails: data,
                })}
                labelWidth="130px"
            />
        </Drawer>
    )
}

export default DetailsDrawer
