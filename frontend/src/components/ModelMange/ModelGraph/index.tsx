import { Drawer } from 'antd'
import { noop } from 'lodash'
import { Dnd } from '@antv/x6-plugin-dnd'
import { Shape, Graph as GraphType } from '@antv/x6'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ViewModel, ModelType } from '../const'
import HeaderToolBar from './HeaderToolBar'
import { ModelGraphProvider } from './ModelGraphProvider'
import styles from './styles.module.less'
import DragBox from '@/components/DragBox'
import DndModelList from '../DndModelList.tsx'

import './x6Style.less'
import GraphContent from './GraphContent'
import { formatError, getModelInfo } from '@/core'
import __ from '../locale'

interface ModelGraphProps {
    modelId: string
    modelType: ModelType
    open: boolean
    onClose: () => void
    onConfirm?: () => void
    viewModel: ViewModel
}

const ModelGraph = ({
    modelId,
    modelType,
    open,
    onClose,
    onConfirm = noop,
    viewModel,
}: ModelGraphProps) => {
    const [modelInfo, setModelInfo] = useState<any>(null)

    // 画布大小
    const [graphSize, setGraphSize] = useState<number>(100)

    const [defaultSize, setDefaultSize] = useState<Array<number>>([15, 85])
    const dndContainer = useRef<HTMLDivElement>(null)
    const graphContentRef = useRef<any>(null)

    useEffect(() => {
        if (modelId) {
            getModelContentInfo()
        }
    }, [modelId])

    const getModelContentInfo = async () => {
        try {
            if (modelId) {
                const res = await getModelInfo(modelId)
                // 获取模型信息
                setModelInfo(res)
            }
        } catch (err) {
            formatError(err)
        }
    }

    const contextValue = useMemo(() => {
        const {
            handleFoldAll,
            handleShowAll,
            handleChangeGraphSize,
            handleMovedToCenter,
            handleSaveModel,
        } = graphContentRef?.current || {}
        return {
            onReturn: onClose,
            modelInfo,
            setModelInfo,
            graphSize,
            onShowAll: handleShowAll || noop,
            onChangeSize: handleChangeGraphSize || noop,
            onMovedToCenter: handleMovedToCenter || noop,
            onFoldAll: handleFoldAll || noop,
            onSaveModel: handleSaveModel || noop,
            onConfirm,
            viewModel,
        }
    }, [
        onClose,
        modelInfo,
        setModelInfo,
        graphSize,
        graphContentRef.current,
        onConfirm,
        viewModel,
    ])

    return (
        <Drawer
            destroyOnClose
            maskClosable={false}
            maskStyle={{ display: 'none', backgroundColor: 'transparent' }}
            style={{ position: 'fixed', width: '100vw', height: '100vh' }}
            push={{ distance: 0 }}
            headerStyle={{ display: 'none' }}
            bodyStyle={{
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 1280,
                width: '100%',
                height: '100%',
            }}
            getContainer={() => {
                const containerRoot = document.getElementById('root')
                return (containerRoot as HTMLElement) || window
            }}
            open={open}
            width="100%"
            // 显示抽屉自带title
            title={undefined}
            onClose={undefined}
        >
            <ModelGraphProvider value={contextValue}>
                <div className={styles['model-graph-container']}>
                    <HeaderToolBar />
                    <div className={styles['model-graph-content']}>
                        {viewModel === ViewModel.EDIT ? (
                            <DragBox
                                defaultSize={defaultSize}
                                minSize={[280, 500]}
                                maxSize={[400, Infinity]}
                                onDragEnd={(size) => {
                                    setDefaultSize(size)
                                }}
                                gutterStyles={{
                                    background: '#EFF2F5',
                                    width: '5px',
                                    cursor: 'ew-resize',
                                }}
                                // hiddenElement={

                                // }
                                gutterSize={5}
                                existPadding={false}
                                expandCloseText={__('模型')}
                            >
                                <div
                                    ref={dndContainer}
                                    className={styles.dndDrag}
                                >
                                    <DndModelList
                                        modelType={modelType}
                                        onStartDrag={(
                                            e,
                                            dataIds,
                                            currentModelType,
                                        ) => {
                                            if (
                                                graphContentRef?.current
                                                    ?.startDrag
                                            ) {
                                                graphContentRef?.current?.startDrag(
                                                    e,
                                                    dataIds,
                                                    currentModelType,
                                                )
                                            }
                                        }}
                                    />
                                </div>
                                <GraphContent
                                    ref={graphContentRef}
                                    modelId={modelId}
                                    viewModel={ViewModel.EDIT}
                                    setGraphSize={setGraphSize}
                                />
                            </DragBox>
                        ) : (
                            <GraphContent
                                ref={graphContentRef}
                                modelId={modelId}
                                viewModel={ViewModel.EXPAND_VIEW}
                                setGraphSize={setGraphSize}
                            />
                        )}
                    </div>
                </div>
            </ModelGraphProvider>
        </Drawer>
    )
}

export default ModelGraph
