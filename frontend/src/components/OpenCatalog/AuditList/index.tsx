import { Button, Space, Tabs, Tooltip } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'

import { SortOrder } from 'antd/lib/table/interface'
import { isArray, isNumber, toNumber } from 'lodash'
import moment from 'moment'
import classnames from 'classnames'
import {
    auditStatusList,
    auditTypeList,
    OpenCatlgAuditTabType,
    tabItems,
    getState,
} from './helper'
import styles from './styles.module.less'
import __ from './locale'
import { LightweightSearch, SearchInput } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'
import { formatError } from '@/core/errors'
import CommonTable from '@/components/CommonTable'
import { RefreshBtn, SortBtn } from '@/components/ToolbarComponents'
import {
    SortDirection,
    queryOpenCatlgAuditList,
    AuditStatus,
    AuditType,
    HasAccess,
} from '@/core'
import { FixedType } from '@/components/CommonTable/const'
import { OperateType } from '@/utils'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import OpenCatlgAudit from './OpenCatlgAuditDrawer'
import OpenCatlgDetailDrawer from '../Detail'
import DropDownFilter from '@/components/DropDownFilter'
import { menus, defaultMenu } from '../helper'
import { useUserPermCtx } from '@/context/UserPermissionProvider'

const initSearchCondition: any = {
    offset: 1,
    limit: 10,
    keyword: '',
    // filter: { audit_type: [] },
    // 暂不支持排序
    // sort_by: {
    //     fields: ['apply_time'],
    //     direction: SortDirection.DESC,
    // },
}

const OpenCatalogAudit = () => {
    const navigator = useNavigate()

    const { checkPermissions } = useUserPermCtx()

    const [loading, setLoading] = useState(true)
    const [searchCondition, setSearchCondition] = useState<any>({
        ...initSearchCondition,
    })
    const [isEmpty, setIsEmpty] = useState<boolean>(false)
    const [activeKey, setActiveKey] = useState<OpenCatlgAuditTabType>(
        OpenCatlgAuditTabType.ToAudit,
    )
    // const [data, setData] = useState<any[]>([])
    const [tabItemsData, setTabItemsData] = useState<any[]>(tabItems)

    const commonTableRef: any = useRef()
    const [tableSort, setTableSort] = useState<{
        [key: string]: SortOrder
    }>({
        apply_time: 'descend',
    })

    // 点击操作的目录项
    const [curOprCatlg, setCurOprCatlg] = useState<any>()
    // 审核抽屉
    const [auditOpen, setAuditOpen] = useState(false)
    // 开放目录详情
    const [detailOpen, setDetailOpen] = useState(false)

    // 是否拥有数据运营工程师
    const hasDataOperRole = useMemo(() => {
        return checkPermissions(HasAccess.isGovernOrOperation) ?? false
    }, [checkPermissions])

    const handleOperate = async (op: OperateType, item: any) => {
        setCurOprCatlg(item)
        if (op === OperateType.DETAIL) {
            const url = `/dataService/openCatlgDetails?id=${item.id}&name=${item.name}&backUrl=/dataService/openCatlgAudit`
            navigator(url)
        } else if (op === OperateType.AUDIT) {
            setAuditOpen(true)
        }
    }

    const handleClickOpenCatlgDetail = (item: any) => {
        setCurOprCatlg(item)
        setDetailOpen(true)
    }

    const columns: any = [
        {
            title: __('申请编号'),
            dataIndex: 'apply_code',
            key: 'apply_code',
            // width: 220,
            render: (text, record) => (
                <div className={styles.catlgName}>
                    <FontIcon
                        name="icon-shujumuluguanli1"
                        type={IconType.COLOREDICON}
                        className={styles.nameIcon}
                    />
                    <div className={styles.applyId} title={text}>
                        {text || '--'}
                    </div>
                </div>
            ),
        },
        {
            title: __('开放目录名称'),
            dataIndex: 'catalog_title',
            key: 'catalog_title',
            ellipsis: true,
            render: (catalog_title, record) => {
                return (
                    <span
                        className={classnames(
                            styles.firstRelCatlgName,
                            styles.link,
                        )}
                        onClick={() => handleClickOpenCatlgDetail(record)}
                    >
                        {catalog_title || '--'}
                    </span>
                )
            },
        },
        {
            title: __('申请人'),
            dataIndex: 'applier_name',
            key: 'applier_name',
            ellipsis: true,
            width: 180,
            render: (text, record) => text || '--',
        },
        {
            title: __('审核时间'),
            dataIndex: 'apply_time',
            key: 'apply_time',
            ellipsis: true,
            width: 180,
            // 暂不支持排序
            // sorter: true,
            // sortOrder: tableSort.apply_time,
            // showSorterTooltip: {
            //     title: __('按审核时间排序'),
            //     placement: 'bottom',
            //     overlayInnerStyle: {
            //         color: '#fff',
            //     },
            // },
            render: (text: any) => {
                return isNumber(text)
                    ? moment(text).format('YYYY-MM-DD HH:mm:ss')
                    : '--'
            },
        },
        {
            title: __('操作'),
            key: 'action',
            // width: 64,
            fixed: FixedType.RIGHT,
            render: (_: string, record) => {
                const btnList: any[] = [
                    {
                        key: OperateType.AUDIT,
                        label: __('审核'),
                    },
                ]
                return (
                    <Space size={16} className={styles.oprColumn}>
                        {btnList.map((item) => {
                            return (
                                <Button
                                    type="link"
                                    key={item.key}
                                    disabled={item.disabled}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleOperate(item.key, record)
                                    }}
                                >
                                    {item.label}
                                </Button>
                            )
                        })}
                    </Space>
                )
            },
        },
    ]

    return (
        <div className={styles.openCatlgAuditWrapper}>
            <div className={styles.top}>
                <span className={styles.auditTitle}>
                    {__('开放目录待审核列表')}
                </span>
                <Space>
                    {/* <SearchInput
                        placeholder={__('搜索申请编号、开放目录名称')}
                        onKeyChange={(value: string) => {
                            setSearchCondition({
                                ...searchCondition,
                                keyword: value,
                            })
                        }}
                        style={{ width: 272 }}
                    /> */}
                    <span>
                        <RefreshBtn
                            onClick={() =>
                                setSearchCondition({
                                    ...searchCondition,
                                    offset: 1,
                                })
                            }
                        />
                    </span>
                </Space>
            </div>

            <div className={styles.openCatlgAuditContent}>
                <CommonTable
                    queryAction={queryOpenCatlgAuditList}
                    params={searchCondition}
                    baseProps={{
                        columns,
                        rowKey: 'apply_code',
                        rowClassName: styles.tableRow,
                    }}
                    ref={commonTableRef}
                    emptyDesc={<div>{__('暂无数据')}</div>}
                    emptyIcon={dataEmpty}
                    emptyStyle={{
                        display: 'flex',
                        height: 'calc(100% - 200px)',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    useDefaultPageChange
                    getEmptyFlag={(flag) => {
                        setIsEmpty(flag)
                    }}
                />
            </div>
            {/* 开放目录详情 */}
            {detailOpen && (
                <OpenCatlgDetailDrawer
                    open={detailOpen}
                    catlgItem={{
                        id: curOprCatlg?.catalog_id,
                        name: curOprCatlg?.catalog_title,
                    }}
                    onCancel={() => setDetailOpen(false)}
                />
            )}

            {/* 审核抽屉 */}
            {auditOpen && curOprCatlg && (
                <OpenCatlgAudit
                    open={auditOpen}
                    onOK={() => {
                        commonTableRef?.current?.getData()
                        setAuditOpen(false)
                        setCurOprCatlg(undefined)
                    }}
                    onClose={() => {
                        setAuditOpen(false)
                        setCurOprCatlg(undefined)
                    }}
                    catlgInfo={curOprCatlg}
                />
            )}
        </div>
    )
}

export default OpenCatalogAudit
