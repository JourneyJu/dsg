import React, { ReactNode } from 'react'
import {
    LimitModellined,
    LimitFieldlined,
    LimitDatellined,
    StringTypeOutlined,
    NumberTypeOutlined,
    BooleanTypeOutlined,
    BinaryTypeOutlined,
} from '@/icons'
import styles from './styles.module.less'

interface IGetIcon {
    type: string
    fontSize?: number
    width?: number
    color?: string
}

const Icons: React.FC<IGetIcon> = ({
    type,
    fontSize = 18,
    width = 20,
    color,
}) => {
    switch (type) {
        case 'char':
            return (
                <span className={styles.selectedOptionIcons} style={{ width }}>
                    <StringTypeOutlined
                        style={{ fontSize, color }}
                        className={styles.icon}
                    />
                </span>
            )
        case 'number':
            return (
                <span className={styles.selectedOptionIcons} style={{ width }}>
                    <NumberTypeOutlined
                        style={{ fontSize, color }}
                        className={styles.icon}
                    />
                </span>
            )
        case 'bool':
            return (
                <span className={styles.selectedOptionIcons} style={{ width }}>
                    <BooleanTypeOutlined
                        style={{ fontSize, color }}
                        className={styles.icon}
                    />
                </span>
            )
        case 'date':
            return (
                <span className={styles.selectedOptionIcons} style={{ width }}>
                    <LimitDatellined
                        style={{ fontSize: fontSize - 4, color }}
                        className={styles.icon}
                    />
                </span>
            )
        case 'datetime':
            return (
                <span className={styles.selectedOptionIcons} style={{ width }}>
                    <LimitDatellined
                        style={{ fontSize: fontSize - 4, color }}
                        className={styles.icon}
                    />
                </span>
            )
        case 'timestamp':
            return (
                <span className={styles.selectedOptionIcons} style={{ width }}>
                    <LimitDatellined
                        style={{ fontSize: fontSize - 4, color }}
                        className={styles.icon}
                    />
                </span>
            )
        case 'binary':
            return (
                <span className={styles.selectedOptionIcons} style={{ width }}>
                    <BinaryTypeOutlined
                        style={{ fontSize: fontSize - 4, color }}
                        className={styles.icon}
                    />
                </span>
            )

        default:
            return (
                <span
                    className={styles.selectedOptionIcons}
                    style={{ width, color }}
                />
            )
    }
}

export default Icons
