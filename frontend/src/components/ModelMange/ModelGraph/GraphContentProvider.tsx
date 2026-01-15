import { Graph } from '@antv/x6'
import { noop } from 'lodash'
import { createContext, useContext } from 'react'
import { ViewModel } from '../const'

// 模型管理上下文
interface IGraphContentContext {
    graphInstance: Graph | null
    relationData: any[]
    setRelationData: (data: any[]) => void
    viewModel: ViewModel
}

// 模型管理上下文
const GraphContentContext = createContext<IGraphContentContext>({
    graphInstance: null,
    relationData: [],
    setRelationData: noop,
    viewModel: ViewModel.EDIT,
})

// 使用模型管理上下文
export const useGraphContentContext = () => useContext(GraphContentContext)

// 模型管理提供者
export const GraphContentProvider = GraphContentContext.Provider
