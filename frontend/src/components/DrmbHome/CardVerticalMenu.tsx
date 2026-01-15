import classnames from 'classnames'
import { useMemo, useRef, useState } from 'react'
import { DoubleRightOutlined } from '@ant-design/icons'
import { useSize } from 'ahooks'
import { DevelopingTip, findMenuLongestWidth, TitleLabel } from './helper'
import styles from './styles.module.less'
import __ from './locale'
import dataGet from '@/assets/homePage/dataGet.png'
import dataParse from '@/assets/homePage/dataParse.png'
import dataService from '@/assets/homePage/dataService.png'
import dataHandle from '@/assets/homePage/dataHandle.png'

const IconMap = {
    'md-data-get': dataGet,
    'md-data-process': dataHandle,
    'md-data-understand': dataParse,
    'md-data-service': dataService,
}
interface ICardVerticalMenu {
    menu?: any // 菜单
    gridCol?: number // 单行显示多少列
    isHorizontal?: boolean // 是否水平，默认false
    onCardClick?: () => void // 卡片点击
    onItemClick?: (item: any) => void // 子项点击
}

const CardVerticalMenu = ({
    menu,
    gridCol = 5,
    isHorizontal = false,
    onCardClick = () => {},
    onItemClick,
}: ICardVerticalMenu) => {
    const container = useRef<HTMLDivElement>(null)
    const size = useSize(container)
    const list = useMemo(
        () => findMenuLongestWidth(menu?.children || []),
        [menu?.children],
    )

    return (
        list?.length > 0 && (
            <div
                className={classnames(
                    styles.cardMenu,
                    styles.cardVerticalMenuContainer,
                    menu.isDeveloping && styles.disable,
                    !isHorizontal && styles.cardMenuVertical,
                )}
            >
                <DoubleRightOutlined className={styles.cardMenuIcon} />

                <div
                    className={styles.cardHeader}
                    onClick={() => !menu.isDeveloping && onCardClick()}
                >
                    <img
                        src={IconMap[menu.key]}
                        alt=""
                        style={{ width: 82, height: 72, marginBottom: 6 }}
                    />
                    <TitleLabel title={menu.label} />
                    <div className={styles.cardHeaderBg} />
                </div>

                <div className={styles.cardContent} ref={container}>
                    {list.map((item) => {
                        return (
                            <DevelopingTip menu={item}>
                                <div
                                    className={classnames(
                                        styles.cardMenuItemWrap,
                                        item.isDeveloping && styles.disable,
                                    )}
                                >
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
                                        title={item.label}
                                        style={{
                                            width: size?.width
                                                ? Math.min(
                                                      size?.width,
                                                      (item?.width as number) +
                                                          30,
                                                  )
                                                : 'auto',
                                        }}
                                    >
                                        {item.label}
                                    </div>
                                </div>
                            </DevelopingTip>
                        )
                    })}
                </div>
            </div>
        )
    )
}

export default CardVerticalMenu
