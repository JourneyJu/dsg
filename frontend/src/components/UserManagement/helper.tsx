import { Empty, Loader } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'
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
