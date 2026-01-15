import { Node } from '@antv/x6'
import { checkNumberRanage, ExpandStatus } from '../FormGraph/helper'
import __ from './locale'

const defaultPorts = {
    groups: {
        leftPorts: {
            markup: [
                {
                    tagName: 'circle',
                    selector: 'portBody',
                },
            ],
            attrs: {
                portBody: {
                    r: 4,
                    strokeWidth: 1,
                    stroke: '#5F95FF',
                    fill: '#ffffff',
                    magnet: true,
                    zIndex: 10,
                },
            },
            position: 'formItemLeftPosition',
            zIndex: 10,
        },
        rightPorts: {
            markup: [
                {
                    tagName: 'circle',
                    selector: 'portBody',
                },
            ],
            attrs: {
                portBody: {
                    r: 4,
                    strokeWidth: 1,
                    stroke: '#5F95FF',
                    fill: '#ffffff',
                    magnet: true,
                    zIndex: 10,
                },
            },
            position: 'formItemRightPosition',
            zIndex: 10,
        },
    },
}

const FormBusinessNodeTemplate = {
    shape: 'table-business-node',
    width: 400,
    height: 696,
    ports: defaultPorts,
    position: {
        x: 600,
        y: 100,
    },
    data: {
        items: [],
        type: 'business',
        expand: ExpandStatus.Expand,
        uniqueCount: 0,
        offset: 0,
        singleSelectedId: '',
        fid: '',
        mid: '',
        editStatus: false,
        keyWord: '',
        switchStatus: false,
        formInfo: null,
    },
    zIndex: 9999,
}

const FormStandardNodeTemplate = {
    shape: 'table-standard-node',
    width: 400,
    height: 696,
    ports: defaultPorts,
    position: {
        x: 100,
        y: 100,
    },
    data: {
        items: [],
        type: 'standard',
        expand: ExpandStatus.Expand,
        uniqueCount: 0,
        offset: 0,
        singleSelectedId: '',
        fid: '',
        mid: '',
        editStatus: false,
        keyWord: '',
        switchStatus: false,
        formInfo: null,
        errorFieldsId: [],
    },
    zIndex: 9999,
}

const FormPasteSourceTemplate = {
    shape: 'table-paste-node',
    width: 400,
    height: 52,
    ports: defaultPorts,
    position: {
        x: 100,
        y: 100,
    },
    data: {
        items: [],
        type: 'pasteSource',
        expand: ExpandStatus.Expand,
        offset: 0,
        infoId: '',
        selectedId: [],
        fid: '',
        mid: '',
        editStatus: false,
        keyWord: '',
        switchStatus: false,
        formInfo: null,
        errorStatus: false,
    },
    zIndex: 9999,
}
/**
 * 计算生成桩的位置
 */
const getPortByNode = (
    group: string,
    index,
    site: string = '',
    expand: ExpandStatus = ExpandStatus.Expand,
    type: 'field' | 'form' = 'field',
    length: number = 10,
) => {
    return {
        group,
        label: {},
        args: {
            index,
            site,
            expand,
            type,
            length,
        },
        zIndex: 10,
    }
}

/**
 * 计算新增节点坐标
 * @param nodes 所有阶段
 * @param center?  { x: number; y: number } 中心位置
 * @param prePosition? any 前一个位置记录
 * @returns 返回坐标
 */
const getNewPastePosition = (
    nodes: Array<Node>,
    center: { x: number; y: number },
    prePosition?: any,
) => {
    if (prePosition) {
        return {
            x: prePosition.x + 50,
            y: prePosition.y + 50,
        }
    }
    const centerNode = nodes.filter((n) => {
        const { x, y } = n.getPosition()
        return x === center.x && y === center.y
    })
    if (!nodes.length || centerNode.length === 0) {
        return {
            x: center.x,
            y: center.y,
        }
    }
    const lastNodePos = getCenterLastNode(nodes, center)
    return {
        x: lastNodePos.x + 50,
        y: lastNodePos.y + 50,
    }
}

/**
 * 获取中心列的最后一个节点位置
 * @param nodes 所有节点
 * @parma center 中心位置
 * @returns 最后一个的位置
 */
const getCenterLastNode = (
    nodes: Array<Node>,
    center: any,
): { x: number; y: number } => {
    return nodes
        .map((n) => {
            const { x, y } = n.getPosition()
            return { x, y }
        })
        .filter((pos) => {
            return pos.x === center.x
        })
        .reduce((prePos, curPos) => {
            return curPos.y > prePos.y ? curPos : prePos
        }, center)
}

/**
 * 获取搜索字段
 */
const searchFieldData = (data: Array<any>, searchKey: string) => {
    if (searchKey) {
        const searchData = data.filter((item) => {
            if (item.name_en) {
                return item.name_en.includes(searchKey)
            }
            return item.name.includes(searchKey)
        })
        return searchData
    }
    return data
}

export {
    FormStandardNodeTemplate,
    FormPasteSourceTemplate,
    FormBusinessNodeTemplate,
    getNewPastePosition,
    searchFieldData,
}
