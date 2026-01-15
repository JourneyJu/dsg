import { FC, useState } from 'react'
import MetaModelManage from './MetaModelManage'
import ThemeModelManage from './ThemeModelManage'
import SpecialModelManage from './SpecialModelManage'
import { ModalManageProvider } from './ModalManageProvider'

interface IModelMange {
    modelType: string
}

/**
 * 模型管理
 * @param modelType 模型类型
 * @returns
 */
const ModelMange: FC<IModelMange> = ({ modelType }) => {
    const [filterKey, setFilterKey] = useState('')
    const getModelMange = () => {
        if (modelType === 'meta') {
            return <MetaModelManage />
        }
        if (modelType === 'theme') {
            return <ThemeModelManage />
        }
        if (modelType === 'special') {
            return <SpecialModelManage />
        }
        return null
    }
    return (
        <ModalManageProvider value={{ filterKey, setFilterKey }}>
            {getModelMange()}
        </ModalManageProvider>
    )
}

export default ModelMange
