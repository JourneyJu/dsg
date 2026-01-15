import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import { noop, property, values } from 'lodash'
import { Popover } from 'antd'
import { CloseCircleFilled, InfoCircleOutlined } from '@ant-design/icons'
import { useUpdateEffect } from 'ahooks'
import __ from './locale'
import { SearchType } from '@/components/SearchLayout/const'
import {
    SearchType as SearchType2,
    IformItem,
} from '@/ui/LightweightSearch/const'
import { SortDirection, unCategorizedKey } from '@/core'
import { OnlineStatusTexts } from '../ApiServices/const'
import styles from './styles.module.less'
import { ShareTypeEnum } from '../ResourcesDir/const'
import ArchitectureDirTree from '../BusinessArchitecture/ArchitectureDirTree'
import { Architecture } from '../BusinessArchitecture/const'

export const menus = [{ key: 'updated_at', label: __('按目录更新时间排序') }]

export const defaultMenu = {
    key: 'updated_at',
    sort: SortDirection.DESC,
}

// 开放属性
export const enum OpenTypeEnum {
    NoCondition = 1,
    HasCondition = 2,
}

export const openTypeList: Array<any> = [
    {
        key: OpenTypeEnum.NoCondition,
        value: OpenTypeEnum.NoCondition,
        label: __('无条件开放'),
    },
    {
        key: OpenTypeEnum.HasCondition,
        value: OpenTypeEnum.HasCondition,
        label: __('有条件开放'),
    },
]

export const timeStrToTimestamp = (searchObj: any) => {
    const obj: any = {}
    const timeFields = ['updated_at_start', 'updated_at_end']
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in searchObj) {
        if (Object.prototype.hasOwnProperty.call(searchObj, key)) {
            obj[key] = searchObj[key]
                ? timeFields.includes(key)
                    ? moment(searchObj[key]).valueOf()
                    : searchObj[key]
                : undefined
        }
    }
    return obj
}

export const shareTypeList: Array<any> = [
    {
        key: ShareTypeEnum.UNCONDITION,
        value: ShareTypeEnum.UNCONDITION,
        label: __('无条件开放'),
    },
    {
        key: ShareTypeEnum.CONDITION,
        value: ShareTypeEnum.CONDITION,
        label: __('有条件开放'),
    },
]

export enum OpenLevelEnum {
    // 实名认证开放
    AuthOpen = 1,
    // 审核开放
    ReviewOpen = 2,
}

export const openLevelList = [
    {
        key: OpenLevelEnum.AuthOpen,
        value: OpenLevelEnum.AuthOpen,
        label: __('实名认证开放'),
    },
    {
        key: OpenLevelEnum.ReviewOpen,
        value: OpenLevelEnum.ReviewOpen,
        label: __('审核开放'),
    },
]

export enum OpenStatusEnum {
    Open = 'opened',
    NotOpen = 'notOpen',
}

export const openStatusList = [
    {
        label: __('待开放'),
        value: OpenStatusEnum.NotOpen,
        bgColor: 'rgba(0, 0, 0, 0.30)',
    },
    {
        label: __('已开放'),
        value: OpenStatusEnum.Open,
        bgColor: '#52C41B',
    },
]

const DepartmentSelectComponent: React.FC<{
    value?: any
    onChange?: (value: any) => void
}> = ({ onChange = noop, value }) => {
    const ref = useRef<any>()
    const [searchKeyword, setSearchKeyword] = useState<string>('')
    useUpdateEffect(() => {
        if (!ref?.current) return
        // 重置时，选中top节点
        if (value === '') {
            ref?.current?.handleTopAll()
            setSearchKeyword('')
        }
    }, [value, ref?.current])

    return (
        <div className={styles.filterTree}>
            <ArchitectureDirTree
                ref={ref}
                filterType={[
                    Architecture.ORGANIZATION,
                    Architecture.DEPARTMENT,
                ].join()}
                searchKeyword={searchKeyword}
                // value={value}
                getSelectedNode={(sn) => {
                    onChange(sn?.id)
                }}
                canEmpty={false}
                // placeholder={__('搜索组织、部门')}
                needUncategorized
                unCategorizedKey={unCategorizedKey}
            />
        </div>
    )
}

export const openTypeNoLimit = {
    key: 0,
    value: '',
    label: __('不限'),
}

// 添加开发目录-搜索数据资源目录
export const searchDataCatlgFormData: IformItem[] = [
    {
        label: __('数据提供方'),
        key: 'source_department_id',
        options: [],
        type: SearchType2.Customer,
        Component: DepartmentSelectComponent as React.ComponentType<{
            value?: any
            onChange: (value: any) => void
        }>,
    },
    {
        label: __('开放属性'),
        key: 'open_type',
        options: [openTypeNoLimit, ...shareTypeList],
        type: SearchType2.Radio,
    },
]

export const dataCatlgFormDataDefVal = {
    source_department_id: '',
    open_type: openTypeNoLimit?.value,
}

export const searchFormInitData = [
    {
        label: __('数据资源目录名称、编码'),
        key: 'keyword',
        type: SearchType.Input,
        defaultValue: '',
        isAlone: true,
        itemProps: {
            maxLength: 255,
        },
    },
    {
        label: __('数据提供方'),
        key: 'source_department_id',
        type: SearchType.DepartmentAndOrgSelect,
        itemProps: {
            allowClear: true,
            unCategorizedObj: {
                id: '00000000-0000-0000-0000-000000000000',
                name: __('未分类'),
            },
        },
    },
    {
        label: __('目录更新时间'),
        key: 'updateTime',
        type: SearchType.RangePicker,
        itemProps: {
            format: 'YYYY-MM-DD',
            // disabledDate: (current: any) => disabledDate(current, {}),
        },
        startTime: 'updated_at_start',
        endTime: 'updated_at_end',
    },

    {
        label: __('开放方式'),
        key: 'open_type',
        type: SearchType.Select,
        itemProps: {
            options: openTypeList,
        },
    },
    {
        label: __('开放级别'),
        key: 'open_level',
        type: SearchType.Select,
        itemProps: {
            options: openLevelList,
        },
    },
]

// 审核状态，0 未审核 1 审核中 2 通过 3 驳回 4 未完成
export enum OpenCatalogAuditStatus {
    ToBeAudit = 0,
    Auditing = 1,
    Pass = 2,
    AuditingReject = 3,
    NotComplete = 4,
}

export const getAuditStateLabel = (
    auditStatus: OpenCatalogAuditStatus,
    auditAdvice?: string,
) => {
    const isAuditing = auditStatus === OpenCatalogAuditStatus.Auditing
    const isAuditReject = auditStatus === OpenCatalogAuditStatus.AuditingReject
    return (
        <div
            className={
                isAuditing
                    ? styles.auditing
                    : isAuditReject
                    ? styles.auditNotPass
                    : undefined
            }
        >
            {isAuditing
                ? __('申报审核中')
                : isAuditReject
                ? __('申报未通过')
                : ''}
            {isAuditReject && auditAdvice && (
                <Popover
                    content={
                        <div className={styles.auditInfoWrapper}>
                            <div className={styles.auditTitleWrapper}>
                                <CloseCircleFilled
                                    style={{
                                        color: '#FF4D4F',
                                        fontSize: '16px',
                                    }}
                                />
                                {__('申报未通过')}
                            </div>
                            <div className={styles.auditContentWrapper}>
                                {auditAdvice || '--'}
                            </div>
                        </div>
                    }
                >
                    <InfoCircleOutlined
                        style={{ marginLeft: '4px', cursor: 'pointer' }}
                    />
                </Popover>
            )}
        </div>
    )
}

export interface IOpenCatalog {
    id: string
    name: string
    code: string
    catalog_id: string
    // 开放状态
    open_status?: OpenStatusEnum
    // 	资源类型 1库表 2 接口
    resource_type?: number
    online_status?: string
    //  部门id
    // source_department_id?: string
    //  数据来源部门
    source_department?: string
    // 数据来源部门路径
    source_department_path?: string
    updated_at?: number
    audit_state?: OpenCatalogAuditStatus
    audit_advice?: string
}
