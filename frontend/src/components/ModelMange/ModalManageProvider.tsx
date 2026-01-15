import { createContext, useContext } from 'react'

// 模型管理上下文
interface IModalManageContext {
    filterKey: string
    setFilterKey: (key: string) => void
}

// 模型管理上下文
const ModalManageContext = createContext<IModalManageContext>({
    filterKey: '',
    setFilterKey: () => {},
})

// 使用模型管理上下文
export const useModalManageContext = () => useContext(ModalManageContext)

// 模型管理提供者
export const ModalManageProvider = ModalManageContext.Provider
