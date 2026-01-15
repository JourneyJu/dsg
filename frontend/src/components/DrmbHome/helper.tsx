import React from 'react'
import { Tooltip } from 'antd'
import styles from './styles.module.less'
import __ from './locale'

export const TitleLabel = (props: {
    title: string
    style?: React.CSSProperties
}) => {
    const { title, style = {} } = props
    return (
        <div className={styles.titleLabel} style={style}>
            {title}
        </div>
    )
}

/**
 * 开发中提示
 * @param menu 菜单
 * @param children 子组件
 */
export const DevelopingTip = (props: { menu: any; children: any }) => {
    const { menu, children } = props
    return (
        <Tooltip
            title={menu.isDeveloping ? __('功能开发中') : ''}
            placement="bottom"
            color="#fff"
            overlayInnerStyle={{
                color: 'rgba(0,0,0,0.85)',
                maxHeight: 32,
                padding: '6px 8px',
            }}
            overlayStyle={{
                paddingTop: 0,
            }}
        >
            {children}
        </Tooltip>
    )
}

export const getTextWidth = (text: string, fontSize?: number) => {
    // 创建临时元素
    const spanDom = document.createElement('span')
    // 放入文本
    spanDom.innerText = text
    // 设置文字大小
    spanDom.style.fontSize = `${fontSize || 12}px`
    // span元素转块级
    spanDom.style.position = 'absolute'
    spanDom.style.padding = '0 7px'
    spanDom.style.border = '1px solid #d9d9d9'
    // span放入body中
    document.body.appendChild(spanDom)
    // 获取span的宽度
    const width = spanDom.offsetWidth
    // 从body中删除该span
    document.body.removeChild(spanDom)
    // 返回span宽度
    return width
}

export const getTagFoldCount = ({
    tags,
    gap = 8,
    len = 2,
    parentWidth,
    expendBtnWidth = 60,
}) => {
    let lineCount = 1
    let excessWidth = parentWidth
    let index = 0
    while (lineCount <= len) {
        if (!tags || index > tags.length - 1) {
            index = Math.max(tags.length - 1, 0)
            break
        }
        excessWidth -= tags[index].width
        if (excessWidth < 0) {
            if (lineCount === len) {
                index =
                    excessWidth > expendBtnWidth + gap ? index - 1 : index - 2
            }
            lineCount += 1
            excessWidth = parentWidth
            // eslint-disable-next-line no-continue
            continue
        }
        excessWidth -= gap
        if (excessWidth <= 0) {
            lineCount += 1
            excessWidth = parentWidth
            // eslint-disable-next-line no-continue
            continue
        }
        index += 1
    }
    return index
}

export const findMenuLongestWidth = (arr) => {
    const longestMenu = (arr || [])?.reduce(
        (longest, current) =>
            current?.label?.length > (longest?.label?.length || 0)
                ? current
                : longest,
        {},
    )
    const w = longestMenu ? getTextWidth(longestMenu?.label, 14) : 0
    return arr.map((item) => ({ ...item, width: w }))
}
