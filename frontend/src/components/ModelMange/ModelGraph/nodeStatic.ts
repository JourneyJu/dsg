import { ModelType, NodeExpandStatus } from '../const'

export const HEADER_HEIGHT = 42

export const NODE_WIDTH = 280

export const NODE_FIELD_HEIGHT = 44

export const ITEM_COUNT_LIMIT = 8

export const PAGE_TURNING_HEIGHT = 20

export const LINE_BUTTON_MAX_WIDTH = 80

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
                    stroke: 'rgba(49, 132, 254, 1)',
                    fill: 'rgba(49, 132, 254, 1)',
                    magnet: true,
                    zIndex: 10,
                },
            },
            position: 'freePort',
            zIndex: 99,
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
                    stroke: 'rgba(49, 132, 254, 1)',
                    fill: 'rgba(49, 132, 254, 1)',
                    magnet: true,
                    zIndex: 10,
                },
            },
            position: 'freePort',
            zIndex: 99,
        },
    },
}

/**
 * 节点模版
 */
export const MetaModelNodeTemplate = {
    shape: 'meta-model-node',
    width: NODE_WIDTH,
    // height: 576,
    ports: defaultPorts,
    position: {
        x: 60,
        y: 60,
    },
    data: {
        items: [],
        expand: NodeExpandStatus.FOLD,
        offset: 0,
        model_id: '',
        model_type: ModelType.META_MODEL,
        modelInfo: {},
        display_filed_id: '',
        to_relation_id: '',
        form_relation_id: '',
        dragModels: [],
        isError: false,
    },
    zIndex: 99,
}

/**
 * 关系按钮框
 */
export const RelationButtonBox = {
    tagName: 'rect',
    selector: 'button',
    attrs: {
        width: LINE_BUTTON_MAX_WIDTH,
        height: 20,
        stroke: 'rgba(49, 132, 254, 1)',
        fill: '#ffffff',
        cursor: 'pointer',
        rx: 4,
        ry: 4,
        y: -10,
        x: -(LINE_BUTTON_MAX_WIDTH / 2),
    },
    distance: '50%',
}

/**
 * 关系按钮文本
 */
export const RelationButtonText = {
    tagName: 'text',
    textContent: '',
    selector: 'icon',
    attrs: {
        fill: 'rgba(49, 132, 254, 1)',
        fontSize: 12,
        textAnchor: 'middle',
        pointerEvents: 'none',
        y: '0.3em',
    },
}

/**
 * 普通线的样式
 */
export const LineNormalStyle = {
    stroke: 'rgba(49, 132, 254, 1)',
    strokeWidth: 0.7,
    targetMarker: 'block',
    strokeDasharray: '0',
    style: {
        animation: '',
    },
}

/**
 * 节点模版
 */
export const ThemeModelNodeTemplate = {
    shape: 'theme-model-node',
    width: NODE_WIDTH,
    height: HEADER_HEIGHT,
    data: {
        modelInfo: null,
        model_type: ModelType.THEME_MODEL,
    },
    zIndex: 99,
}
