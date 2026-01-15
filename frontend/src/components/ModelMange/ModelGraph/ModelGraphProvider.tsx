import { noop } from 'lodash'
import { createContext, useContext } from 'react'
import { ViewModel } from '../const'

// 模型管理上下文
interface IModelGraphContext {
    // 返回
    onReturn: () => void
    // 模型信息
    modelInfo: any
    // 设置模型信息
    setModelInfo: (modelInfo: any) => void

    // 画布大小
    graphSize: number
    // 展示所有画布内容
    onShowAll: () => void

    // 缩放画布
    onChangeSize: (multiple: number) => void

    // 画布定位到中心
    onMovedToCenter: () => void

    // 收起所有模型
    onFoldAll: () => void

    // 保存模型
    onSaveModel: () => void

    // 确认
    onConfirm: () => void

    // 库表类型
    viewModel: ViewModel

    // 保存模型loading
}

// 模型管理上下文
const ModelGraphContext = createContext<IModelGraphContext>({
    onReturn: noop,
    modelInfo: null,
    setModelInfo: noop,
    graphSize: 1,
    onShowAll: noop,
    onChangeSize: noop,
    onMovedToCenter: noop,
    onFoldAll: noop,
    onSaveModel: noop,
    onConfirm: noop,
    viewModel: ViewModel.EDIT,
})

// 使用模型管理上下文
export const useModelGraphContext = () => useContext(ModelGraphContext)

// 模型管理提供者
export const ModelGraphProvider = ModelGraphContext.Provider
