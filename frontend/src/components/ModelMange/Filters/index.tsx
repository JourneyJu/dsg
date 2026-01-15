import { useEffect, useState } from 'react'
import { Tabs } from 'antd'
import { useModalManageContext } from '../ModalManageProvider'
import { formatError, getSubjectDomain } from '@/core'
import styles from './styles.module.less'

const Filters = () => {
    const { filterKey, setFilterKey } = useModalManageContext()
    const [items, setItems] = useState<any[]>([])

    useEffect(() => {
        getItemsData()
    }, [])

    const getItemsData = async () => {
        try {
            const res = await getSubjectDomain({
                limit: 2000,
                parent_id: '',
                is_all: true,
                type: 'subject_domain,subject_domain_group',
            })
            const filterItems = res.entries.filter(
                (item) => item.type === 'subject_domain',
            )
            setItems(filterItems)
            setFilterKey(filterItems[0]?.id)
        } catch (error) {
            formatError(error)
        }
    }
    return (
        <div className={styles.filterContainer}>
            <Tabs
                items={items.map((item) => ({
                    label: <span title={item?.path_name}>{item.name}</span>,
                    key: item.id,
                }))}
                onChange={(key) => {
                    setFilterKey(key)
                }}
            />
        </div>
    )
}

export default Filters
