import { Drawer } from 'antd'
import React from 'react'
import AddResourcesDir from '@/components/ResourcesDir/AddResourcesDir'
import { ResourcesCatlogProvider } from '@/components/ResourcesDir/ResourcesCatlogProvider'

interface AddCatalogProps {
    open: boolean
    onClose: () => void
    resId: string
    onOk: () => void
}
const AddCatalog: React.FC<AddCatalogProps> = ({
    open,
    onClose,
    resId,
    onOk,
}) => {
    return (
        <Drawer
            headerStyle={{ display: 'none' }}
            bodyStyle={{ padding: 0 }}
            width="100%"
            open={open}
        >
            <ResourcesCatlogProvider>
                <AddResourcesDir onClose={onClose} resId={resId} onOk={onOk} />
            </ResourcesCatlogProvider>
        </Drawer>
    )
}

export default AddCatalog
