/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */

import { IObject } from '@/core'

export interface TreeItem {
    id: string
    children: TreeItem[]
    collapsed?: boolean
    [key: string]: any
}

export type TreeItems = TreeItem[]

export interface FlattenedItem extends TreeItem {
    parentId: string | null
    depth: number
}

function flatten(
    items: TreeItems,
    parentId: string | null = null,
    depth = 0,
): FlattenedItem[] {
    return items.reduce<FlattenedItem[]>((acc, item) => {
        return [
            ...acc,
            { ...item, parentId, depth },
            ...flatten(item.children, item.id, depth + 1),
        ]
    }, [])
}

export function flattenTree(items: TreeItems): FlattenedItem[] {
    return flatten(items)
}

export function buildTree(items: IObject[]): TreeItems {
    const currentData = items
        .map((department) => ({
            ...department,
            path_id: department?.path_id?.split('/') || [department.id],
        }))
        .reduce((preData, department) => {
            if (preData?.[department.path_id.length]) {
                return {
                    ...preData,
                    [department.path_id.length]: [
                        ...preData[department.path_id.length],
                        department,
                    ],
                }
            }
            return {
                ...preData,
                [department.path_id.length]: [department],
            }
        }, {})
    return buildTreeLevel(currentData, 1, '')
}

function buildTreeLevel(items, level: number, fatherId) {
    if (fatherId) {
        const currentDepartments = items[level].filter((department) => {
            return department?.path_id?.includes(fatherId)
        })
        if (currentDepartments.length) {
            return currentDepartments.map((department) => ({
                ...department,
                children: items[level + 1]?.length
                    ? buildTreeLevel(items, Number(level) + 1, department.id)
                    : [],
            }))
        }
        return []
    }
    return (
        items[level]?.map((department) => ({
            ...department,
            children: items[level + 1]?.length
                ? buildTreeLevel(items, Number(level) + 1, department.id)
                : [],
        })) || []
    )
}

export function findItem(items: TreeItem[], itemId: string) {
    return items.find(({ id }) => id === itemId)
}

export function findItemDeep(
    items: TreeItems,
    itemId: string,
): TreeItem | undefined {
    for (const item of items) {
        const { id, children } = item

        if (id === itemId) {
            return item
        }

        if (children.length) {
            const child = findItemDeep(children, itemId)

            if (child) {
                return child
            }
        }
    }

    return undefined
}

export function removeItem(items: TreeItems, id: string) {
    const newItems: any[] = []

    for (const item of items) {
        if (item.id === id) {
            continue
        }

        if (item.children.length) {
            item.children = removeItem(item.children, id)
        }

        newItems.push(item)
    }

    return newItems
}

export function setProperty<T extends keyof TreeItem>(
    items: TreeItems,
    id: string,
    property: T,
    setter: (value: TreeItem[T]) => TreeItem[T],
) {
    for (const item of items) {
        if (item.id === id) {
            item[property] = setter(item[property])
            continue
        }

        if (item.children.length) {
            item.children = setProperty(item.children, id, property, setter)
        }
    }

    return [...items]
}

export function removeChildrenOf(items: FlattenedItem[], ids: string[]) {
    const excludeParentIds = [...ids]

    return items.filter((item) => {
        if (item.parentId && excludeParentIds.includes(item.parentId)) {
            if (item.children.length) {
                excludeParentIds.push(item.id)
            }
            return false
        }

        return true
    })
}

export function collapsedAll(items: TreeItems, collapsed: boolean): TreeItems {
    return items.map((item) => {
        if (item.children.length > 0) {
            return {
                ...item,
                collapsed,
                children: collapsedAll(item.children, collapsed),
            }
        }
        return {
            ...item,
            collapsed,
        }
    })
}

export function searchChildOf(outItems: TreeItems, outName: string) {
    let hasResult: boolean = false
    function loopCheck(items: TreeItems, name: string) {
        return items.reduce((res: any[], item) => {
            if (item.children.length > 0) {
                const child = loopCheck(item.children, name)
                if (child.length > 0) {
                    setProperty(items, item.id, 'collapsed', (value) => {
                        return false
                    })
                    hasResult = true
                    return [...res, item]
                }
            }
            if (
                item.name.includes(name) ||
                item.name.match(
                    new RegExp(
                        name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                        'gi',
                    ),
                )
            ) {
                hasResult = true
                return [...res, item]
            }
            return [...res]
        }, [])
    }
    loopCheck(outItems, outName)
    return hasResult
}

export function findItemChild(items: TreeItems, id: string): string[] {
    const temp = findItemDeep(items, id)
    if (temp) {
        return flattenTree([temp]).map((item) => item.id)
    }
    return []
}
