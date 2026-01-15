import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons'
import * as React from 'react'
import { ReactNode, useState, ComponentType } from 'react'
import Split from 'react-split'
import classnames from 'classnames'
import styles from './styles.module.less'
import './style.gutter.less'

interface DragBoxType {
    children: [ReactNode, ReactNode]
    defaultSize: Array<number>
    minSize: [number, number]
    maxSize: [number, number]
    onDragEnd: (size: Array<number>) => void
    gutterStyles?: any
    gutterSize?: number
    existPadding?: boolean
    hiddenElement?: string
}

const DragBox: React.FC<DragBoxType> = ({
    children,
    defaultSize,
    minSize,
    maxSize,
    onDragEnd,
    gutterStyles = {},
    gutterSize = 20,
    existPadding = true,
    hiddenElement = '',
}) => {
    const [expand, setExpand] = useState<boolean>(true)
    return (
        <Split
            className={styles.split}
            sizes={expand ? defaultSize : [0, 100]}
            minSize={expand ? minSize : [0, 500]}
            maxSize={expand ? maxSize : [0, Infinity]}
            gutterSize={expand ? gutterSize || 20 : 0}
            direction="horizontal"
            cursor="ew-resize"
            gutterStyle={() =>
                expand
                    ? {
                          background: 'transparent',
                          cursor: 'ew-resize',
                          width: '2px',
                          ...gutterStyles,
                      }
                    : {
                          background: 'transparent',
                          width: '0px',
                          cursor: 'ew-resize',
                      }
            }
            onDragEnd={onDragEnd}
        >
            {hiddenElement === 'left' ? (
                <div />
            ) : (
                <div className={styles.leftSpanList}>
                    <div className={styles.expandList}>
                        <div className={styles.listContent}>{children[0]}</div>
                        {expand ? (
                            <div>
                                {/* <div
                                    className={styles.expandOpen}
                                    onClick={() => {
                                        setExpand(false)
                                    }}
                                >
                                    <CaretLeftOutlined />
                                </div> */}
                            </div>
                        ) : (
                            <div
                                className={styles.unexpandList}
                                onClick={() => {
                                    setExpand(true)
                                }}
                            >
                                <div className={styles.expandClose}>
                                    <CaretRightOutlined />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {hiddenElement === 'right' ? (
                <div />
            ) : (
                <div
                    className={classnames(
                        styles.rightNode,
                        existPadding &&
                            (expand
                                ? styles.rightNodeOn
                                : styles.rightNodeExpandOff),
                    )}
                >
                    {children[1]}
                </div>
            )}
        </Split>
    )
}

export default React.memo(DragBox)
