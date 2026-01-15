import { Drawer } from 'antd'
import { DetailsLabel } from '@/ui'
import { refreshDetails } from '../helper'
import { detailsDefault } from '../const'
import __ from '../locale'

interface IDetails {
    // 是否打开
    open: boolean
    // 详情数据
    item: any
    // 关闭详情
    onDetailsClose: () => void
}

const OrganizationDetail = ({ open, item, onDetailsClose }: IDetails) => {
    return (
        <Drawer
            open={open}
            width="560px"
            maskClosable={false}
            onClose={onDetailsClose}
            title={__('机构详情')}
        >
            <DetailsLabel
                wordBreak
                detailsList={refreshDetails({
                    detailList: detailsDefault,
                    actualDetails: item,
                })}
                labelWidth="130px"
            />
        </Drawer>
    )
}

export default OrganizationDetail
