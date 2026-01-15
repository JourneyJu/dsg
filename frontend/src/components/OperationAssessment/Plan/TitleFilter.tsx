import classNames from 'classnames'
import { useCallback, useState } from 'react'
import { Dropdown } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import __ from '../locale'
import styles from './styles.module.less'

interface ITitleFilter {
    title: string
    hasError?: boolean
    getFilterStatus?: (status: string) => void
}

const TitleFilter = ({
    title,
    hasError = false,
    getFilterStatus,
}: ITitleFilter) => {
    const [statusFilter, setStatusFilter] = useState<string>('')

    const dropdownRender = useCallback(() => {
        const items = [
            {
                label: __('不限'),
                key: '',
            },
            {
                label: __('未填项'),
                key: '1',
            },
            {
                label: __('已填项'),
                key: '2',
            },
            {
                label: (
                    <div>
                        <ExclamationCircleOutlined
                            className={styles['abnormal-icon']}
                        />
                        {__('异常项')}
                    </div>
                ),
                key: '3',
            },
        ]
        return (
            <div className={styles['filter-dropdown']}>
                {items.map((item) => {
                    return (
                        <div
                            key={item.key}
                            className={classNames(
                                styles['filter-item'],
                                statusFilter === item.key &&
                                    styles['filter-item-active'],
                            )}
                            onClick={() => {
                                setStatusFilter(item.key)
                                getFilterStatus?.(item.key)
                            }}
                        >
                            {item.label}
                        </div>
                    )
                })}
            </div>
        )
    }, [statusFilter])

    return (
        <div className={styles['title-filter-container']}>
            <span className={styles['required-flag']}>*</span>
            <span
                className={classNames(
                    styles.title,
                    hasError && styles['hasError-title'],
                )}
            >
                {title}
            </span>
            <Dropdown
                menu={{ items: [] }}
                getPopupContainer={() => document.body}
                dropdownRender={dropdownRender}
                placement="bottomLeft"
                overlayStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    boxShadow:
                        '0 9px 28px 8px rgb(0 0 0 / 5%), 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%)',
                }}
            >
                <FontIcon
                    name="icon-shaixuan"
                    type={IconType.FONTICON}
                    className={classNames(
                        styles['filter-icon'],
                        statusFilter && styles['filter-icon-active'],
                    )}
                />
            </Dropdown>
        </div>
    )
}

export default TitleFilter
