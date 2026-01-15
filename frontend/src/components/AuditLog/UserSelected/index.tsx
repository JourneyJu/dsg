import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from 'react'
import { Select, SelectProps } from 'antd'
import __ from './locale'
import {
    formatError,
    getAppsList,
    getUsersFrontendList,
    getUsersNameList,
} from '@/core'
import styles from './styles.module.less'

interface IUserSelect extends SelectProps {
    value?: string
    onChange?: (value) => void
    ref?: any
}

const UserSelect: React.FC<IUserSelect> = forwardRef((props: any, ref) => {
    const { value, onChange, ...reset } = props
    const [owners, setOwners] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [searchValue, setSearchValue] = useState<string>('')
    // 选中值
    const [selected, setSelected] = useState<string[]>([])

    useImperativeHandle(ref, () => ({
        selectedData: selected.map((item) => {
            const findItem = owners.find((o) => o.id === item)
            if (findItem) {
                return findItem.name
            }
            return item
        }),
    }))

    useEffect(() => {
        getOwnersList()
    }, [])

    // 获取用户/应用列表
    const getOwnersList = async () => {
        try {
            setLoading(true)
            const [{ value: users1 }, { value: apps }]: any =
                await Promise.allSettled([
                    getUsersNameList(),
                    getAppsList({ limit: 2000 }),
                ])
            setOwners([
                ...(users1 || []),
                ...(apps?.entries?.map((item) => ({
                    ...item,
                    // label: (
                    //     <>
                    //         <span className={styles.appName} title={item.name}>
                    //             {item.name}
                    //         </span>
                    //         <span style={{ color: 'rgb(0 0 0 / 45%)' }}>
                    //             {__('（应用）')}
                    //         </span>
                    //     </>
                    // ),
                    type: 'app',
                })) || []),
            ])
        } catch (err) {
            formatError(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Select
            mode="tags"
            placeholder={__('请选择用户')}
            showArrow
            allowClear
            options={owners.map((info) => ({
                ...info,
                value: info.id,
                label:
                    info.type === 'app' ? (
                        <>
                            <span className={styles.appName} title={info.name}>
                                {info.name}
                            </span>
                            <span style={{ color: 'rgb(0 0 0 / 45%)' }}>
                                {__('（应用）')}
                            </span>
                        </>
                    ) : (
                        info.name
                    ),
            }))}
            optionLabelProp="name"
            optionFilterProp="name"
            filterOption={(input, option) =>
                (option?.name as string)
                    ?.toLowerCase()
                    .includes(input.trim().toLowerCase())
            }
            value={selected}
            onChange={(val: string[], op) => {
                setSelected(
                    val
                        .filter((item) => item.trim())
                        .map((item) => item?.trim()),
                )
                onChange?.()
            }}
            onSearch={(val) => {
                setSearchValue(val)
            }}
            onDropdownVisibleChange={(open) => {
                if (!open) {
                    setSearchValue('')
                }
            }}
            searchValue={searchValue}
            getPopupContainer={(n) => n.parentElement || n}
            notFoundContent={null}
            loading={loading}
            className={styles.userSelect}
            {...reset}
        />
    )
})

export default UserSelect
