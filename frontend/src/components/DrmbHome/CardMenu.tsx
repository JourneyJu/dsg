import classnames from 'classnames'
import React, { useState } from 'react'
import { RightOutlined } from '@ant-design/icons'
import { DevelopingTip, TitleLabel } from './helper'
import styles from './styles.module.less'
import __ from './locale'
import GradientSvgIcon from './GradientSvgIcon'

interface ICardMenu {
    menu?: any // 菜单
    gridCol?: number // 单行显示多少列
    isHorizontal?: boolean // 是否水平，默认false
    onCardClick?: () => void // 卡片点击
    onItemClick?: (item: any) => void // 子项点击
    style?: React.CSSProperties
}

const CardMenu = ({
    menu,
    gridCol = 5,
    isHorizontal = false,
    onCardClick,
    onItemClick,
    style,
}: ICardMenu) => {
    return (
        menu?.children?.length > 0 && (
            <div
                className={classnames(
                    styles.cardMenu,
                    menu.isDeveloping && styles.disable,
                    !isHorizontal && styles.cardMenuVertical,
                )}
                style={style}
            >
                <div className={styles.cardHeader}>
                    <TitleLabel title={menu.label} />
                    {menu.isDeveloping ? (
                        <div className={styles.card_tooltip}>
                            <div className={styles.arrow} />
                            <div className={styles.tipText}>
                                {__('功能开发中')}
                            </div>
                        </div>
                    ) : (
                        <a onClick={onCardClick} className={styles.card_enter}>
                            {__('进入')}
                            <RightOutlined />
                        </a>
                    )}
                </div>

                <div
                    className={styles.cardContent}
                    style={{ gridTemplateColumns: `repeat(${gridCol},1fr)` }}
                >
                    {menu.children.map((item) => {
                        return (
                            <div
                                className={classnames(
                                    styles.cardMenuItem,
                                    item.isDeveloping && styles.disable,
                                )}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onItemClick?.(item)
                                }}
                                key={item.key}
                            >
                                <DevelopingTip menu={item}>
                                    <GradientSvgIcon
                                        className={styles.gradientSvgIconWrap}
                                        style={{
                                            fontSize: 16,
                                            marginRight: 8,
                                            verticalAlign: 'bottom',
                                        }}
                                        {...(item?.attribute?.iconGradient ||
                                            {})}
                                    />
                                    {item.label}
                                </DevelopingTip>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    )
}

export default CardMenu
