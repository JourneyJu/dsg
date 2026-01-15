import React, { CSSProperties, ReactNode } from 'react'
import { Badge } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import {
    DatasheetViewColored,
    MysqlColored,
    MariadbColored,
    HiveColored,
    PostgreColored,
    OracleColored,
    SQLServerColored,
    DSFormOutlined,
    StringTypeOutlined,
    LeftArrowOutlined,
    RightArrowOutlined,
    ClockColored,
    ClickHouseColored,
    DorisColored,
    FontIcon,
} from '@/icons'
import { IconType } from './const'
import styles from './styles.module.less'
import { IconType as FontIconType } from '@/icons/const'

interface IGetIcon {
    type: IconType
    showBadge?: boolean
    offset?: string[] | number[]
    className?: string
    style?: CSSProperties | undefined
}

const Icons: React.FC<IGetIcon> = (props: any) => {
    const { type, showBadge, offset = [0, 10], style = {} } = props
    const getIcon = (t: IconType) => {
        switch (t) {
            case IconType.DATASHEET:
                return (
                    <FontIcon
                        name="icon-shujubiaoshitu"
                        type={FontIconType.COLOREDICON}
                        {...props}
                    />
                ) // <DatasheetViewColored {...props} />
            case IconType.STRING:
                return <StringTypeOutlined {...props} />
            case IconType.LEFTARROW:
                return <LeftArrowOutlined {...props} />
            case IconType.RIGHTARROW:
                return <RightArrowOutlined {...props} />
            case IconType.ERROR:
                return (
                    <ExclamationCircleOutlined
                        style={{ color: '#F5222D' }}
                        {...props}
                    />
                )
            case IconType.TYPETRANSFORM:
                return (
                    <FontIcon
                        type={FontIconType.FONTICON}
                        name="icon-zhuanhuanjiantou"
                        style={{ color: '#1890FF' }}
                        {...props}
                    />
                )
            default:
                return (
                    <DSFormOutlined
                        style={{ color: 'rgb(0 0 0 / 50%)' }}
                        {...props}
                    />
                )
        }
    }
    return getIcon(type)
}
export default Icons
