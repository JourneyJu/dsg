import { useState } from 'react'
import ThemeModelManage from '@/components/ModelMange/ThemeModelManage'
import { ThemeModelManageMode } from '@/components/ModelMange/const'
import { ModalManageProvider } from '@/components/ModelMange/ModalManageProvider'

/**
 * 主题模型目录管理页面
 * 功能特点：
 * - 只读模式，不提供新建功能
 * - 操作列只保留详情查看
 * - 用于数据目录的查看和检查
 */
const ThemeModelDir = () => {
    const [filterKey, setFilterKey] = useState('')

    return (
        <ModalManageProvider value={{ filterKey, setFilterKey }}>
            <ThemeModelManage mode={ThemeModelManageMode.DIR_MODE} />
        </ModalManageProvider>
    )
}

export default ThemeModelDir
