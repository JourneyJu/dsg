import React from 'react'
import classnames from 'classnames'
import { DevelopingTip, TitleLabel } from './helper'
import styles from './styles.module.less'
import __ from './locale'
import { AppSceneAnalysisColored } from '@/icons'
import businessAnalysis from '@/assets/homePage/businessAnalysis.jpg'
import businessApplication from '@/assets/homePage/businessApplication.jpg'
import capitalAnalysis from '@/assets/homePage/capitalAnalysis.jpg'
import dataResource from '@/assets/homePage/dataResource.jpg'
import GradientSvgIcon from './GradientSvgIcon'

interface IQuickMenuCard {
    menu?: any // 菜单
    onClick?: () => void // 子项点击
    className?: string
}

const QuickMenuCard = ({
    menu,
    className,
    onClick = () => {},
}: IQuickMenuCard) => {
    const handleClick = () => {
        if (!menu.isDeveloping) {
            onClick()
        }
    }
    return (
        <div
            className={classnames(styles.quickMenuCard, className)}
            onClick={handleClick}
            style={{
                background: menu.bgColor,
                cursor: menu?.isDeveloping ? 'not-allowed' : 'pointer',
            }}
        >
            <div className={styles.quickMenuContent}>
                <div className={styles.contentMask}>
                    <GradientSvgIcon
                        className={styles.cardMenuIcon}
                        name={menu.icon}
                        colors={menu.colors}
                        bgColors={['#fff']}
                    />
                    <span className={styles.cardMenuText}>{menu.label}</span>
                </div>
            </div>
            <img className={styles.quickMenuCardBg} src={menu.bg} alt="" />
            {menu.isDeveloping && (
                <div className={styles.developingBadge}>{__('功能开发中')}</div>
            )}
        </div>
    )
}

export default QuickMenuCard
