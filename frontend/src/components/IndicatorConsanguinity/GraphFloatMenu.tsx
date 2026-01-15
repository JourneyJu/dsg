import * as React from 'react'
import { useState, ReactNode } from 'react'
import { Button, Input, Radio } from 'antd'
import {
    CaretLeftOutlined,
    CaretRightOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import styles from './styles.module.less'
import __ from './locale'
import { LargeOutlined, LocationOutlined, NarrowOutlined } from '@/icons'
import { ViewType, VisualType } from './const'

interface ToolbarType {
    children: ReactNode
    needExpand?: boolean
}

const GraphFloatMenu = ({ children, needExpand = true }: ToolbarType) => {
    const [expand, setExpand] = useState<boolean>(true)
    return (
        <div className={styles.toolBarWrapper}>
            {needExpand && (
                <div
                    className={styles.expandBtn}
                    onClick={() => {
                        setExpand(!expand)
                    }}
                >
                    {expand ? <CaretRightOutlined /> : <CaretLeftOutlined />}
                </div>
            )}
            {expand ? children : null}
        </div>
    )
}

export default GraphFloatMenu
