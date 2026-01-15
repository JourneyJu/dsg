/**
 * 微应用模式下的容器挂载工具函数
 * 解决 Modal、Tooltip、Popover 等组件在微应用模式下的挂载问题
 */

/**
 * 支持的微应用容器 ID 列表
 */
const MICRO_APP_CONTAINER_IDS = [
    'anyfabric-micro-app',
    'smart-data-query',
    'af-plugin-framework-for-as',
]

/**
 * 查找微应用容器
 */
function findMicroAppContainer(): HTMLElement | null {
    let result: HTMLElement | null = null
    MICRO_APP_CONTAINER_IDS.forEach((id) => {
        if (!result) {
            const container = document.querySelector(`#${id}`)
            if (container) {
                result = container as HTMLElement
            }
        }
    })
    return result
}

/**
 * 获取合适的挂载容器
 * 在微应用模式下返回当前微应用的根节点,在独立应用模式下返回 document.body
 */
// eslint-disable-next-line no-underscore-dangle
export const getPopupContainer = (): HTMLElement | false => {
    // eslint-disable-next-line no-underscore-dangle
    if (window.__POWERED_BY_QIANKUN__) {
        const microAppRoot = findMicroAppContainer()
        if (microAppRoot) {
            return microAppRoot
        }
        return false
    }
    return document.body
}

/**
 * 获取 Tooltip 等弹出组件的挂载容器
 */
// eslint-disable-next-line no-underscore-dangle
export const getTooltipContainer = (node?: HTMLElement): HTMLElement => {
    // eslint-disable-next-line no-underscore-dangle
    if (window.__POWERED_BY_QIANKUN__) {
        const microAppRoot = findMicroAppContainer()
        if (microAppRoot) {
            return microAppRoot
        }
        if (node && node.parentNode) {
            return node.parentNode as HTMLElement
        }
        return document.body
    }
    if (node && node.parentNode) {
        return node.parentNode as HTMLElement
    }
    return document.body
}

/**
 * 创建一个通用的 getPopupContainer 函数
 * 用于 Modal、Drawer、Popover 等组件的 getContainer 属性
 */
// eslint-disable-next-line no-underscore-dangle
export const createGetContainerFunc = (): (() => HTMLElement) | false => {
    // eslint-disable-next-line no-underscore-dangle
    if (window.__POWERED_BY_QIANKUN__) {
        return () => {
            const microAppRoot = findMicroAppContainer()
            if (microAppRoot) {
                return microAppRoot
            }
            return document.body
        }
    }
    return false
}

/**
 * 检查当前是否在微应用模式下
 */
// eslint-disable-next-line no-underscore-dangle
export const isMicroAppMode = (): boolean => {
    // eslint-disable-next-line no-underscore-dangle
    return !!window.__POWERED_BY_QIANKUN__
}

/**
 * 获取微应用的根容器
 */
export const getMicroAppRoot = (): HTMLElement | null => {
    if (isMicroAppMode()) {
        return findMicroAppContainer()
    }
    return null
}
