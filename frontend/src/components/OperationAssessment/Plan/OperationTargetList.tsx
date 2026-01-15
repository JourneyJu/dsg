import { useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { Dropdown, MenuProps } from 'antd'
import { useUpdateEffect } from 'ahooks'
import { SearchInput } from '@/ui'
import __ from '../locale'
import styles from './styles.module.less'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { AssessmentTargetStatusOptions } from '../helper'
import {
    AssessmentPlanTypeEnum,
    AssessmentTargetStatus,
    formatError,
    getCurUserDepartment,
    getTargetList,
    IAssessmentTargetItem,
    IGetTargetListParams,
    TargetTypeEnum,
} from '@/core'

interface OperationTargetListProps {
    onSelectTarget: (id: string) => void
    initTargetList: IAssessmentTargetItem[]
}

const OperationTargetList = ({
    onSelectTarget,
    initTargetList = [],
}: OperationTargetListProps) => {
    const [selectedTargetId, setSelectedTargetId] = useState<string>('')

    const [targetList, setTargetList] = useState<IAssessmentTargetItem[]>([])
    const [searchParams, setSearchParams] = useState<IGetTargetListParams>({
        type: TargetTypeEnum.Operation,
        status: AssessmentTargetStatus.All,
        target_name: '',
        limit: 100,
        offset: 1,
        is_operator: true,
        sort: 'plan',
    })

    useEffect(() => {
        if (initTargetList.length > 0) {
            setTargetList(initTargetList)
            setSelectedTargetId(initTargetList[0].id)
        }
    }, [initTargetList])

    useUpdateEffect(() => {
        onSelectTarget(selectedTargetId)
    }, [selectedTargetId])

    useUpdateEffect(() => {
        getList()
    }, [searchParams])

    const getList = async () => {
        try {
            const res = await getTargetList({
                ...searchParams,
                status: searchParams.status || undefined,
            })
            setTargetList(res.entries || [])
            if (
                Array.isArray(res.entries) &&
                res.entries.length > 0 &&
                !selectedTargetId
            ) {
                setSelectedTargetId(res.entries[0].id)
            }
        } catch (error) {
            formatError(error)
        }
    }

    const onClick: MenuProps['onClick'] = ({ key }) => {
        setSearchParams({
            ...searchParams,
            status: key as AssessmentTargetStatus,
        })
    }

    const dropdownRender = useCallback(() => {
        const items = [
            {
                label: __('不限'),
                key: AssessmentTargetStatus.All,
            },
            ...AssessmentTargetStatusOptions.map((item) => ({
                label: item.label,
                key: item.value,
            })),
        ]
        return (
            <div className={styles['filter-dropdown']}>
                {items.map((item) => {
                    return (
                        <div
                            key={item.key}
                            className={classNames(
                                styles['filter-item'],
                                searchParams.status === item.key &&
                                    styles['filter-item-active'],
                            )}
                            onClick={() =>
                                setSearchParams({
                                    ...searchParams,
                                    status: item.key,
                                })
                            }
                        >
                            {item.label}
                        </div>
                    )
                })}
            </div>
        )
    }, [searchParams])

    return (
        <div className={styles['department-target-list']}>
            <div className={styles.title}>{__('我参与的运营目标')}</div>
            <div className={styles['search-container']}>
                <SearchInput
                    placeholder={__('搜索目标')}
                    style={{ width: '100%' }}
                    onKeyChange={(key) =>
                        setSearchParams({
                            ...searchParams,
                            target_name: key,
                        })
                    }
                />
                <Dropdown
                    menu={{ items: [], onClick }}
                    getPopupContainer={(n) => n.parentElement as HTMLElement}
                    dropdownRender={dropdownRender}
                >
                    <div
                        className={classNames(
                            styles['filter-container'],
                            searchParams.status &&
                                styles['filter-container-active'],
                        )}
                    >
                        <FontIcon
                            name="icon-shaixuan"
                            type={IconType.FONTICON}
                        />
                    </div>
                </Dropdown>
            </div>
            <div className={styles['target-list']}>
                {targetList.map((item) => (
                    <div
                        key={item.id}
                        className={classNames(
                            styles['target-item'],
                            selectedTargetId === item.id &&
                                styles['selected-target-item'],
                        )}
                        onClick={() => setSelectedTargetId(item.id)}
                    >
                        <div
                            className={styles['target-name']}
                            title={item.target_name}
                        >
                            {item.target_name}
                        </div>
                        {item.status === AssessmentTargetStatus.Ended && (
                            <div className={styles['target-status']}>
                                {__('已结束')}
                            </div>
                        )}
                        {item.status ===
                            AssessmentTargetStatus.ToBeEvaluated && (
                            <div
                                className={classNames(
                                    styles['target-status'],
                                    styles['target-status-to-be-evaluated'],
                                )}
                            >
                                {__('待评价')}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OperationTargetList
