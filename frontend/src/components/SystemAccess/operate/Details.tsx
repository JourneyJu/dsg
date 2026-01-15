import { useEffect, useState } from 'react'
import { Drawer } from 'antd'
import { DetailsLabel } from '@/ui'
import { refreshDetails, DetailGroupTitle } from '../helper'
import { baseDefault, accessDefault } from '../const'
import __ from '../locale'
import {
    IGetApiSubListResponse,
    detailServiceOverview,
    formatError,
} from '@/core'

interface IDetails {
    // 是否打开
    open: boolean
    // 详情数据
    item: IGetApiSubListResponse
    // 关闭详情
    onDetailsClose: () => void
}

const SystemAccessDetail = ({ open, item, onDetailsClose }: IDetails) => {
    const [serviceDetail, setServiceDetail] = useState<any>({})

    // 获取服务详情
    useEffect(() => {
        getDetail()
    }, [item])

    const getDetail = async () => {
        try {
            const res = await detailServiceOverview(item?.api_id)
            setServiceDetail(res)
        } catch (error) {
            formatError(error)
        }
    }

    return (
        <Drawer
            open={open}
            width="560px"
            maskClosable={false}
            onClose={onDetailsClose}
            title={__('系统接入详情')}
        >
            <DetailGroupTitle title={__('基本信息')} />
            <DetailsLabel
                wordBreak
                detailsList={refreshDetails({
                    detailList: baseDefault,
                    actualDetails: serviceDetail?.service_info,
                })}
                labelWidth="140px"
            />
            <DetailGroupTitle title={__('接入信息')} />
            <DetailsLabel
                wordBreak
                detailsList={refreshDetails({
                    detailList: accessDefault,
                    actualDetails: item,
                })}
                labelWidth="140px"
            />
        </Drawer>
    )
}

export default SystemAccessDetail
