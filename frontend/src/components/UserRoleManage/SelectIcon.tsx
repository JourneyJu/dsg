import { noop } from 'lodash'
import * as React from 'react'
import { useState, useEffect } from 'react'
import Icon, { CheckCircleFilled } from '@ant-design/icons'
import { roleIconInfo } from '@/core/apis/configurationCenter/index.d'
import { defaultColors, conbineSvg, getCurrentRoleIcon } from './helper'
import __ from './locale'
import styles from './styles.module.less'

interface SelectIconType {
    color: string
    icon: string
    onChange: ({ icon, color }: { icon: string; color: string }) => void
    defaultIcons: Array<roleIconInfo>
}

const SelectIcon = ({
    color = '#126ee3',
    icon = '',
    onChange = noop,
    defaultIcons,
}: SelectIconType) => {
    const [selectedIcon, setSelectedIcon] = useState<string>('tag')
    const [selectedColor, setSelectedColor] = useState<string>(defaultColors[0])
    useEffect(() => {
        setSelectedColor(color)
        setSelectedIcon(icon)
    }, [])

    return (
        <div className={styles.SelectIconContainer}>
            <div className={styles.previewContainer}>
                <div
                    className={styles.previewIcon}
                    style={{
                        background: selectedColor.concat('D9'),
                    }}
                >
                    <Icon
                        component={() => {
                            return conbineSvg(
                                getCurrentRoleIcon(defaultIcons, selectedIcon),
                            )
                        }}
                        className={styles.iconSize}
                    />
                </div>
                <div className={styles.previewTip}>{__('图标预览')}</div>
            </div>
            <div className={styles.selectedBox}>
                <div className={styles.selcectIcon}>
                    <div className={styles.selectLabel}>{__('图标')}</div>
                    <div className={styles.selectItem}>
                        {defaultIcons
                            .filter((defaultIcon) => defaultIcon.system !== 1)
                            .map((defaultIcon) => {
                                return (
                                    <div
                                        onClick={() => {
                                            setSelectedIcon(defaultIcon.name)
                                            onChange({
                                                icon: defaultIcon.name,
                                                color: selectedColor,
                                            })
                                        }}
                                        className={`${styles.itemBox} ${
                                            styles.itemIcon
                                        } ${
                                            defaultIcon.name === selectedIcon &&
                                            styles.iconSelectedBox
                                        }`}
                                    >
                                        <Icon
                                            component={() => {
                                                return conbineSvg(
                                                    defaultIcon.icon,
                                                )
                                            }}
                                            className={styles.icon}
                                        />
                                    </div>
                                )
                            })}
                    </div>
                </div>
                <div
                    className={styles.selcectIcon}
                    style={{
                        marginTop: '18px',
                    }}
                >
                    <div className={styles.selectLabel}>{__('颜色')}</div>
                    <div className={styles.selectItem}>
                        {defaultColors.map((currentColor) => {
                            return (
                                <div
                                    onClick={() => {
                                        setSelectedColor(currentColor)
                                        onChange({
                                            icon: selectedIcon,
                                            color: currentColor,
                                        })
                                    }}
                                    className={styles.itemBox}
                                >
                                    {currentColor === selectedColor ? (
                                        <CheckCircleFilled
                                            style={{
                                                fontSize: 24,
                                                color: currentColor.concat(
                                                    'D9',
                                                ),
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className={styles.color}
                                            style={{
                                                background: currentColor,
                                            }}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default SelectIcon
