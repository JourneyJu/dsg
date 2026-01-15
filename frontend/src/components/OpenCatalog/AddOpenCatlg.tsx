import {
    Button,
    Checkbox,
    Col,
    Form,
    Modal,
    Radio,
    Row,
    Space,
    Tooltip,
} from 'antd'
import React, { useEffect, useMemo, useState } from 'react'

import { isNumber, noop } from 'lodash'
import { CheckCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons'
import { useDebounce, useUpdateEffect } from 'ahooks'
import InfiniteScroll from 'react-infinite-scroll-component'
import { success } from '@/utils/modalHelper'

import empty from '@/assets/dataEmpty.svg'
import searchEmpty from '@/assets/searchEmpty.svg'
import {
    addOpenCatlg,
    formatError,
    IRescCatlgQuery,
    queryOpenableDataCatalog,
} from '@/core'
import { CloseOutlined, FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { Empty, LightweightSearch, Loader, SearchInput } from '@/ui'
import { onLineStatus, ShareTypeEnum } from '../ResourcesDir/const'
import DataCatlgDetailDrawer from '../ResourcesDir/DataCatlgDetailDrawer'
import {
    dataCatlgFormDataDefVal,
    openLevelList,
    searchDataCatlgFormData,
    shareTypeList,
} from './helper'
import __ from './locale'
import styles from './styles.module.less'

const scrollListId = 'scrollableDiv'

interface IAddOpenCatlg {
    open: boolean
    onClose: (isSearch?: boolean, isFlag?: string) => void
    onOK?: (val: any) => void
    title?: string
    id?: string
    originValue?: any
}

const AddOpenCatlg: React.FC<IAddOpenCatlg> = ({
    open,
    onClose = noop,
    onOK = noop,
    title = __('来源业务场景'),
    id,
    originValue = {},
}) => {
    const [form] = Form.useForm()
    const initSearchCondition = {
        online_status: [
            onLineStatus.Online,
            onLineStatus.OfflineAuditing,
            onLineStatus.OfflineReject,
        ].join(),
        offset: 1,
        limit: 10,
        keyword: '',
        orgcode: '',
    }
    // 搜索数据资源目录
    const [searchCondition, setSearchCondition] =
        useState<IRescCatlgQuery>(initSearchCondition)
    const searchDebounce = useDebounce(searchCondition, { wait: 300 })

    const [catlgListLoading, setCatlgListLoading] = useState<boolean>(false)
    const [dataCatlgList, setDataCatlgList] = useState<any[]>([])
    const [dataCatlgTotal, setDataCatlgTotal] = useState<number>(0)
    // 当前点击的数据资源目录
    const [curOptItem, setCurOptItem] = useState<any>()
    // 选中的数据资源目录
    const [selDataCatlgList, setSelDataCatlgList] = useState<any[]>([])
    const [curSelectedData, setCurSelectedData] = useState<any>()

    const [dataCatlgDetailOpen, setDataCatlgDetailOpen] =
        useState<boolean>(false)

    const [btnLoading, setBtnLoading] = useState<boolean>(false)

    const showSearch = useMemo(() => {
        return (
            searchDebounce?.keyword ||
            searchDebounce?.orgcode ||
            searchDebounce?.offset !== 1
        )
    }, [searchDebounce])

    const getDataRescCatlgList = async (params: any, isInit = false) => {
        try {
            if (isInit) {
                setCatlgListLoading(true)
            }
            // const res = await getOpenCatlgInfo(id)
            const res = await queryOpenableDataCatalog(params)
            const { entries = [], total_count = 0 } = res || {}
            if (isInit) {
                setDataCatlgList(entries)
            } else {
                setDataCatlgList([...dataCatlgList, ...entries])
            }
            setDataCatlgTotal(total_count)
        } catch (error) {
            formatError(error)
        } finally {
            if (isInit) {
                setCatlgListLoading(false)
            }
        }
    }

    useEffect(() => {
        if (open) {
            getDataRescCatlgList(searchCondition, true)
            form.resetFields()
        } else {
            setSelDataCatlgList([])
            setSearchCondition(initSearchCondition)
        }
    }, [open])

    useUpdateEffect(() => {
        if (open) {
            getDataRescCatlgList(searchCondition, searchCondition?.offset === 1)
        }
    }, [searchDebounce])

    const onDelete = (cId: string) => {
        setSelDataCatlgList(selDataCatlgList.filter((item) => item.id !== cId))
    }

    const renderLisItem = (item: any, isNeedCheckBox: boolean = true) => {
        const rescItem = (
            <div className={styles.dataCatlgItem}>
                {isNeedCheckBox && (
                    <Checkbox
                        checked={
                            !!selDataCatlgList.find((cd) => cd.id === item.id)
                        }
                        onChange={(e) => handleChecked(e.target.checked, item)}
                        onClick={(e) => e.stopPropagation()}
                        className={styles.checkbox}
                    />
                )}
                <div className={styles.catlgName}>
                    <FontIcon
                        name="icon-shujumuluguanli1"
                        type={IconType.COLOREDICON}
                        className={styles.nameIcon}
                    />
                    <div className={styles.catlgNameCont}>
                        <div
                            onClick={() => {
                                setCurOptItem(item)
                                setDataCatlgDetailOpen(true)
                            }}
                            title={item?.name}
                            className={styles.names}
                        >
                            {item?.name || '--'}
                        </div>
                        <div
                            className={styles.code}
                            title={__('目录编码：') + (item?.code || '--')}
                        >
                            {__('目录编码：') + (item?.code || '--')}
                        </div>
                    </div>
                </div>
                {!isNeedCheckBox && (
                    <CloseOutlined
                        className={styles.selDelBtn}
                        onClick={() => onDelete(item.id)}
                    />
                )}
            </div>
        )
        return rescItem
    }

    // 空库表
    const showEmpty = () => {
        const desc = showSearch ? (
            <span>{__('抱歉，没有找到相关内容')}</span>
        ) : (
            <div style={{ height: 44 }}>
                <div>{__('暂无数据')}</div>
                {/* {__('点击')}
                <span
                    onClick={() => operateClick(OperateType.CREATE)}
                    className={styles.link}
                >
                    【{__('新建')}】
                </span>
                {__('按钮可新建工作流程')} */}
            </div>
        )
        const icon = showSearch ? searchEmpty : empty
        return <Empty desc={desc} iconSrc={icon} />
    }

    const getModalFooter = () => {
        return (
            <Space size={16}>
                <Button onClick={() => onClose()}>{__('取消')}</Button>

                <Tooltip
                    title={
                        selDataCatlgList?.length
                            ? ''
                            : __('请选择需要开放的目录')
                    }
                >
                    <Button
                        type="primary"
                        loading={btnLoading}
                        disabled={!selDataCatlgList?.length}
                        onClick={() => form.submit()}
                    >
                        {__('确认')}
                    </Button>
                </Tooltip>
            </Space>
        )
    }

    const onFinish = async (values: any) => {
        // onOK(values)
        try {
            const { open_level, open_type } = values
            const catlgIds = selDataCatlgList?.map((item) => {
                return item.id
            })

            const res = await addOpenCatlg({
                ...values,
                catalog_ids: catlgIds,
            })

            const successInfo = res.success_catalog
                ?.map((item) => item.name)
                ?.join('、')
            const failedInfo = res?.failed_catalog
                ?.map((item) => item.name)
                ?.join('、')
            success({
                title: __('成功添加 ${num} 个目录', {
                    num: `${res?.success_catalog?.length}`,
                }),
                icon: (
                    <CheckCircleFilled
                        style={{
                            // color: '#FAAD14',
                            fontSize: '72px',
                        }}
                    />
                ),
                className: styles.requestResInfoModal,
                width: 432,
                content: (
                    <div className={styles.requestResInfoWrapper}>
                        {!!successInfo && (
                            <div
                                className={styles.successInfoWrapper}
                                title={successInfo}
                            >
                                {successInfo}
                            </div>
                        )}
                        {res?.failed_catalog?.length > 0 && (
                            <div
                                className={styles.failedInfoWrapper}
                                title={failedInfo}
                            >
                                <ExclamationCircleOutlined />
                                <div className={styles.failedInfo}>
                                    {__('${num} 个目录未被导入：', {
                                        num: `${res?.failed_catalog?.length}`,
                                    })}
                                    {failedInfo || '--'}
                                </div>
                            </div>
                        )}
                    </div>
                ),
                okText: __('我知道了'),
                cancelText: '',
                onOk() {
                    onOK(res)
                },
            })
        } catch (error) {
            formatError(error)
        }
    }

    const handleChecked = (checked: boolean, data) => {
        if (checked) {
            setSelDataCatlgList([...selDataCatlgList, data])
        } else {
            setSelDataCatlgList(
                selDataCatlgList.filter((item) => item.id !== data.id),
            )
        }
    }

    const searchChange = (data, dataKey) => {
        if (!dataKey) {
            // 清空筛选
            setSearchCondition({
                ...searchCondition,
                ...data,
            })
        } else {
            const dk = dataKey

            setSearchCondition({
                ...searchCondition,
                [dk]: data[dk],
            })
        }
    }

    return (
        <Modal
            title={__('添加开放目录')}
            width={800}
            open={open}
            onCancel={() => onClose(true)}
            bodyStyle={{ height: 532, padding: '16px 24px' }}
            destroyOnClose
            maskClosable={false}
            className={styles.addOpenCatlgModalWrapper}
            footer={<div className={styles.footer}>{getModalFooter()}</div>}
        >
            <div className={styles.addOpenCatlgWrapper}>
                <Form form={form} name="validate_other" onFinish={onFinish}>
                    <Row>
                        <Col span={24}>
                            <Form.Item
                                label={__('请选择需要开放的目录')}
                                name="open_catalog_ids"
                                required
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                className={styles.selDataCatlgFormItem}
                            >
                                <div className={styles.selDataCatlgWrapper}>
                                    <div
                                        className={
                                            styles.dataCatlgContentWrapper
                                        }
                                    >
                                        <div className={styles.topSearch}>
                                            <SearchInput
                                                placeholder={__(
                                                    '搜索数据资源目录',
                                                )}
                                                value={searchCondition?.keyword}
                                                onKeyChange={(
                                                    keyword: string,
                                                ) =>
                                                    setSearchCondition({
                                                        ...searchCondition,
                                                        keyword,
                                                        offset: 1,
                                                    })
                                                }
                                                className={styles.searchInput}
                                                style={{ width: 368 }}
                                            />
                                            <LightweightSearch
                                                formData={
                                                    searchDataCatlgFormData
                                                }
                                                onChange={(d, key) =>
                                                    searchChange(d, key)
                                                }
                                                defaultValue={
                                                    dataCatlgFormDataDefVal
                                                }
                                            />
                                        </div>
                                        {catlgListLoading ? (
                                            <div className={styles.loading}>
                                                <Loader />
                                            </div>
                                        ) : !dataCatlgList?.length ? (
                                            showEmpty()
                                        ) : (
                                            <div
                                                className={
                                                    styles.dataCatlgListContent
                                                }
                                            >
                                                <div
                                                    id={scrollListId}
                                                    className={
                                                        styles.dataCatlgList
                                                    }
                                                    hidden={
                                                        !dataCatlgList?.length
                                                    }
                                                >
                                                    <InfiniteScroll
                                                        hasMore={
                                                            dataCatlgList?.length <
                                                            dataCatlgTotal
                                                        }
                                                        loader={
                                                            <div
                                                                className={
                                                                    styles.listLoading
                                                                }
                                                            >
                                                                <Loader />
                                                            </div>
                                                        }
                                                        next={() => {
                                                            // getSelectedNode(false)
                                                            const offset =
                                                                isNumber(
                                                                    searchCondition?.offset,
                                                                )
                                                                    ? (searchCondition?.offset ||
                                                                          0) + 1
                                                                    : 1
                                                            setSearchCondition({
                                                                ...(searchCondition ||
                                                                    {}),
                                                                offset,
                                                            })
                                                        }}
                                                        dataLength={
                                                            dataCatlgList?.length ||
                                                            0
                                                        }
                                                        scrollableTarget={
                                                            scrollListId
                                                        }
                                                    >
                                                        {dataCatlgList.map(
                                                            (item) => {
                                                                return renderLisItem(
                                                                    item,
                                                                    true,
                                                                )
                                                            },
                                                        )}
                                                    </InfiniteScroll>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.selectedContWrapper}>
                                        <div className={styles.top}>
                                            <span className={styles.count}>
                                                {__('已选择：')}{' '}
                                                {selDataCatlgList?.length}
                                                {__('个')}
                                            </span>
                                            <Button
                                                type="link"
                                                disabled={
                                                    selDataCatlgList.length ===
                                                    0
                                                }
                                                className={styles.clear}
                                                onClick={() =>
                                                    setSelDataCatlgList([])
                                                }
                                            >
                                                {__('全部移除')}
                                            </Button>
                                        </div>
                                        <div className={styles.selectedList}>
                                            {selDataCatlgList?.map((item) =>
                                                renderLisItem(item, false),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={__('开放方式')}
                                name="open_type"
                                validateTrigger={['onChange', 'onBlur']}
                                validateFirst
                                rules={[
                                    {
                                        required: true,
                                        message: __('请选择'),
                                    },
                                ]}
                            >
                                <Radio.Group>
                                    {shareTypeList?.map((item) => (
                                        <Radio
                                            value={item.key}
                                            className={styles.radioLabel}
                                        >
                                            {item.label}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                noStyle
                                shouldUpdate={(pre, cur) =>
                                    pre.open_type !== cur.open_type
                                }
                            >
                                {({ getFieldValue }) => {
                                    const open_type = getFieldValue('open_type')
                                    // 选择【无条件开放】时， 不展示【开放级别】
                                    if (
                                        open_type === ShareTypeEnum.UNCONDITION
                                    ) {
                                        return undefined
                                    }
                                    return (
                                        <Form.Item
                                            label={__('开放级别')}
                                            name="open_level"
                                            validateTrigger={[
                                                'onChange',
                                                'onBlur',
                                            ]}
                                            validateFirst
                                            rules={[
                                                {
                                                    required: true,
                                                    message: __('请选择'),
                                                },
                                            ]}
                                        >
                                            <Radio.Group>
                                                {openLevelList?.map((item) => (
                                                    <Radio
                                                        value={item.key}
                                                        className={
                                                            styles.radioLabel
                                                        }
                                                    >
                                                        {item.label}
                                                    </Radio>
                                                ))}
                                            </Radio.Group>
                                        </Form.Item>
                                    )
                                }}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
            {curOptItem?.id && dataCatlgDetailOpen && (
                <DataCatlgDetailDrawer
                    catlgItem={curOptItem}
                    open={dataCatlgDetailOpen}
                    onCancel={() => setDataCatlgDetailOpen(false)}
                />
            )}
        </Modal>
    )
}

export default AddOpenCatlg
