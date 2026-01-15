import React from 'react'
import ReactDom from 'react-dom'
import { Root, createRoot } from 'react-dom/client'
import { ConfigProvider, Tooltip } from 'antd'
import { Graph, ToolsView, EdgeView } from '@antv/x6'
import { Background } from '@antv/x6/lib/registry'
import styles from './styles.module.less'
import __ from '../locale'

export interface TooltipToolOptions extends ToolsView.ToolItem.Options {
    relation: {
        business_name: string
        technical_name: string
        description: string
    }
}

class TooltipTool extends ToolsView.ToolItem<EdgeView, TooltipToolOptions> {
    private knob: HTMLDivElement | null = null

    private rectRoot: Root | null = null

    render() {
        if (!this.knob) {
            this.knob = ToolsView.createElement('div', false) as HTMLDivElement
            this.knob.style.position = 'absolute'
            this.container.appendChild(this.knob)
        }
        return this
    }

    private toggleTooltip(visible: boolean) {
        if (this.knob) {
            if (this.rectRoot) {
                this.rectRoot.unmount()
            }

            this.rectRoot = createRoot(this.knob)
            if (visible) {
                this.rectRoot.render(
                    <ConfigProvider
                        prefixCls="any-fabric-ant"
                        iconPrefixCls="any-fabric-anticon"
                    >
                        <div>
                            <Tooltip
                                title={
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 12,
                                            fontSize: 14,
                                            padding: 8,
                                            width: 240,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 4,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    color: 'rgb(0 0 0 / 45%)',
                                                }}
                                            >
                                                {__('业务名称：')}
                                            </div>
                                            <div
                                                style={{
                                                    color: 'rgb(0 0 0 / 85%)',
                                                    wordBreak: 'break-all',
                                                }}
                                            >
                                                {this.options.relation
                                                    .business_name || '--'}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 4,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    color: 'rgb(0 0 0 / 45%)',
                                                }}
                                            >
                                                {__('技术名称：')}
                                            </div>
                                            <div
                                                style={{
                                                    color: 'rgb(0 0 0 / 85%)',
                                                    wordBreak: 'break-all',
                                                }}
                                            >
                                                {this.options.relation
                                                    .technical_name || '--'}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 4,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    color: 'rgb(0 0 0 / 45%)',
                                                }}
                                            >
                                                {__('描述：')}
                                            </div>
                                            <div
                                                style={{
                                                    color: 'rgb(0 0 0 / 85%)',
                                                    wordBreak: 'break-all',
                                                }}
                                            >
                                                {this.options.relation
                                                    .description || '--'}
                                            </div>
                                        </div>
                                    </div>
                                }
                                placement="right"
                                color="#fff"
                                overlayInnerStyle={{
                                    color: 'rgba(0, 0, 0, 0.85)',
                                }}
                                overlayStyle={{
                                    maxWidth: 600,
                                    zIndex: 1000,
                                }}
                                open={visible}
                                destroyTooltipOnHide
                            >
                                <div />
                            </Tooltip>
                        </div>
                    </ConfigProvider>,
                )
            }
        }
    }

    private onMouseEnter({ e }: { e: MouseEvent }) {
        this.updatePosition(e)
        this.toggleTooltip(true)
    }

    private onMouseLeave() {
        this.updatePosition()
        this.toggleTooltip(false)
    }

    // private onMouseMove(e) {
    //     this.updatePosition(e)
    //     this.toggleTooltip(false)
    // }

    delegateEvents() {
        this.cellView.on('cell:mouseenter', this.onMouseEnter, this)
        this.cellView.on('cell:mouseleave', this.onMouseLeave, this)
        // this.cellView.on('cell:mousemove', this.onMouseMove, this)
        return super.delegateEvents()
    }

    private updatePosition(e?: MouseEvent) {
        if (!this?.knob?.style) {
            return
        }
        const { style } = this.knob
        if (e) {
            const p = this.graph.clientToGraph(e.clientX, e.clientY)

            style.display = 'block'
            style.left = `${p.x}px`
            style.top = `${p.y}px`
            style.zIndex = '1000'
        } else {
            style.display = 'none'
            style.left = '-1000px'
            style.top = '-1000px'
        }
    }

    protected onRemove() {
        this.toggleTooltip(false)
        this.cellView.off('cell:mouseenter', this.onMouseEnter, this)
        this.cellView.off('cell:mouseleave', this.onMouseLeave, this)
        // this.cellView.off('cell:mousemove', this.onMouseMove, this)
    }
}

export default TooltipTool
