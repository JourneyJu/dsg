import { Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { find } from 'lodash'
import __ from './locale'
import styles from './styles.module.less'

const itemOtherInfo: any[] = [
    {
        infoKey: 'updated_at',
        type: 'timestamp',
        label: __('更新时间：'),
    },
    {
        infoKey: 'department_name',
        label: __('所属部门：'),
    },
]

interface IItemDetailInfoProps {
    title?: string
    infoKey?: string
    label?: string
    showContent?: string
}

const ItemDetailInfo = (props: IItemDetailInfoProps) => {
    const { title = '', infoKey, label, showContent = '' } = props
    return (
        <Tooltip
            title={title}
            className={styles.toolTip}
            // getPopupContainer={(n) => n}
            placement="bottom"
        >
            <div className={styles.itemDetailInfo} key={infoKey}>
                <span style={{ color: 'rgba(0,0,0,.65)' }}>{label}</span>
                <span
                    className={styles.itemDetailInfoValue}
                    title={showContent}
                    dangerouslySetInnerHTML={{
                        __html: showContent || '--',
                    }}
                />
            </div>
        </Tooltip>
    )
}

export const MoreInfo = ({ infoData, className = '' }: any) => {
    const [datalist, setDataList] = useState([])

    useEffect(() => {
        if (infoData && infoData?.length > 0) {
            const infoList = (infoData || []).map((item) => {
                const { infoKey, content } = item

                let showContent = item?.content || ''
                if (infoKey === 'department_name') {
                    showContent =
                        content && content.includes('/')
                            ? content.split('/').pop()
                            : content
                }
                const infoItem = find(
                    itemOtherInfo,
                    (el) => el.infoKey === infoKey,
                )
                return {
                    ...infoItem,
                    title: infoKey === 'updated_at' ? '' : content,
                    showContent,
                }
            })
            setDataList(infoList)
        }
    }, [infoData])

    return (
        <div className={`${styles.moreInfo} ${className}`}>
            {datalist.map((item: IItemDetailInfoProps) => (
                <ItemDetailInfo {...item} />
            ))}
        </div>
    )
}
