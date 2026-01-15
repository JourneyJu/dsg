import React, { useRef } from 'react'
import { Drawer } from 'antd'
import { noop } from 'lodash'
import styles from './styles.module.less'
import __ from './locale'
import OpenCatalogDetail from '.'
import ContentTabs from './ContentTabs'

interface IOpenCatlgDetailDrawer {
    // 传入的目录部分相关信息（如id,name，其余信息在组件内通过接口获取）
    catlgItem?: {
        id: string
        name: string
    }
    // 为true表明目录详情页为抽屉形式显示
    open?: boolean
    // 是否时审核代办中打开
    isWorkFlow?: boolean
    onCancel?: () => void
    getContainer?: () => HTMLElement
}

function OpenCatlgDetailDrawer({
    catlgItem,
    open,
    isWorkFlow = false,
    onCancel = noop,
    getContainer,
}: IOpenCatlgDetailDrawer) {
    const handleCancel = () => {
        onCancel()
    }

    const ref = useRef({
        getDirName: () => {},
    })
    return (
        <Drawer
            headerStyle={{ display: 'none' }}
            placement="right"
            onClose={handleCancel}
            open={open}
            bodyStyle={{
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: isWorkFlow ? '' : '1280px',
            }}
            // width="calc(100vw - 220px)"
            width={isWorkFlow ? '80%' : '100vw'}
            maskClosable
            zIndex={1001}
            push={false}
            getContainer={getContainer}
            destroyOnClose
        >
            <ContentTabs
                catlgItem={catlgItem}
                isWorkFlow={isWorkFlow}
                onReturn={handleCancel}
            />
        </Drawer>
    )
}

export default OpenCatlgDetailDrawer
