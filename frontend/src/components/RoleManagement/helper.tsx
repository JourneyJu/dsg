import { ExclamationCircleFilled } from '@ant-design/icons'
import dataEmpty from '@/assets/dataEmpty.svg'
import { Empty, Loader } from '@/ui'
import { confirm } from '@/utils/modalHelper'
import __ from './locale'

/**
 * 空数据
 */
export const renderEmpty = (
    marginTop: number = 36,
    iconHeight: number = 144,
    desc: any = __('暂无数据'),
) => (
    <Empty
        iconSrc={dataEmpty}
        desc={desc || __('暂无数据')}
        style={{ marginTop, width: '100%' }}
        iconHeight={iconHeight}
    />
)

/**
 * 加载中
 */
export const renderLoader = (marginTop: number = 104) => (
    <div style={{ marginTop, width: '100%' }}>
        <Loader />
    </div>
)

// 统一的弹窗样式
export const getConfirmModal = ({ title, content, onOk }) => {
    return confirm({
        title,
        icon: <ExclamationCircleFilled style={{ color: '#FAAD14' }} />,
        content,
        onOk,
        okText: __('确定'),
        cancelText: __('取消'),
    })
}
