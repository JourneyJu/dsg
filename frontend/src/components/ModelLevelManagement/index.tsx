import { useState } from 'react'
import ThemeModelManage from '../ModelMange/ThemeModelManage'
import { ModalManageProvider } from '../ModelMange/ModalManageProvider'
import { ThemeModelManageMode } from '../ModelMange/const'

const ModelLevelManagement = () => {
    const [filterKey, setFilterKey] = useState('')

    return (
        <ModalManageProvider value={{ filterKey, setFilterKey }}>
            <ThemeModelManage mode={ThemeModelManageMode.LEVEL_MODE} />
        </ModalManageProvider>
    )
}

export default ModelLevelManagement
