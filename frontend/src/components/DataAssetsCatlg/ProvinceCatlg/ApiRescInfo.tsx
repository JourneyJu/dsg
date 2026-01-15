import * as React from 'react'
import { useState, useEffect, useRef, useMemo, useContext } from 'react'
import classnames from 'classnames'
import { Anchor, Table } from 'antd'
import Icon from '@ant-design/icons'
import { formatError, getPrvcDataCatlgInterfaceById } from '@/core'
import { ReactComponent as icon1 } from '@/assets/DataAssetsCatlg/icon1.svg'
import __ from './locale'
import styles from './styles.module.less'
import JSONCodeView from '@/ui/JSONCodeView'
import { apiRescBasicDetailConfig } from './helper'
import { DetailsLabel, Loader } from '@/ui'

interface TitleBarType {
    title: string
}
const TitleBar = ({ title }: TitleBarType) => {
    return (
        <div className={styles.titleBar}>
            <Icon component={icon1} className={styles.label} />
            <div className={styles.tilte}>{title}</div>
        </div>
    )
}

const DEFAULTPAGESIZE = 10

interface IApiRescInfo {
    rescId: string
}

const ApiRescInfo = ({ rescId }: IApiRescInfo) => {
    const [loading, setLoading] = useState(false)
    const [apiDetail, setApiDetail] = useState<any>({})

    const container = useRef<any>(null)
    const { Link } = Anchor

    const reqColumns = [
        {
            title: __('参数名'),
            dataIndex: 'name',
            key: 'name',
            width: '30%',
            render: (text) => (
                <div className={styles.tableTrContainer} title={text || ''}>
                    <div className={styles.itemTitle}>{text || '--'}</div>
                </div>
            ),
        },
        {
            title: __('参数值'),
            dataIndex: 'value',
            key: 'value',
            width: '30%',
            render: (text) => (
                <div className={styles.tableTrContainer} title={text || ''}>
                    <div className={styles.itemTitle}>{text || '--'}</div>
                </div>
            ),
        },
        {
            title: __('描述'),
            dataIndex: 'desc',
            key: 'desc',
            width: '30%',
            render: (text) => text || '--',
        },
        {
            title: __('是否必传'),
            dataIndex: 'required',
            key: 'required',
            width: '30%',
            render: (text) => (text ? __('是') : __('否')),
        },
    ]

    const resColumns = [
        {
            title: __('参数名'),
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <div className={styles.tableTrContainer} title={text || ''}>
                    <div className={styles.itemTitle}>{text || '--'}</div>
                </div>
            ),
        },
        {
            title: __('参数值'),
            dataIndex: 'value',
            key: 'value',
            render: (text) => (
                <div className={styles.tableTrContainer} title={text || ''}>
                    <div className={styles.itemTitle}>{text || '--'}</div>
                </div>
            ),
        },

        {
            title: __('类型格式'),
            dataIndex: 'type',
            key: 'type',
            render: (text) => text || '--',
        },
        {
            title: __('是否数组'),
            dataIndex: 'is_array',
            key: 'is_array',
            render: (text) => (text ? __('是') : __('否')),
        },
        {
            title: __('是否必填'),
            dataIndex: 'required',
            key: 'required',
            render: (text) => (text ? __('是') : __('否')),
        },
        {
            title: __('描述'),
            dataIndex: 'desc',
            key: 'desc',
            render: (text) => text || '--',
        },
    ]

    useEffect(() => {
        getRescDetail()
    }, [rescId])

    const getRescDetail = async () => {
        if (!rescId) return
        try {
            setLoading(true)
            const res = (await getPrvcDataCatlgInterfaceById(rescId)) || {}
            // const res = delCatlgApi
            setApiDetail({
                ...res,
                fixed_query: res.fixed_query || [],
                query: res.query || [],
                request_body: res.request_body || [],
                request_header: res.request_header || [],
                request_example: res.request_example || '',
                response_header: res.response_header || [],
                response_parameters: res.response_parameters || [],
                response_example: res.response_example || '',
            })
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className={classnames(
                styles.rescInfoWrapper,
                styles.apiRescInfoWrapper,
            )}
        >
            <div className={styles.infoHeader}>
                <Icon component={icon1} className={styles.icon} />
                <div>{__('资源信息')}</div>
            </div>
            <div className={styles.infoBodyWrapper} />
            <div className={styles.infoContentWrapper} ref={container}>
                {loading ? (
                    <div className={styles.loading}>
                        <Loader />
                    </div>
                ) : (
                    <>
                        <div
                            className={classnames(
                                styles.infoContent,
                                styles.contentContainer,
                            )}
                            // ref={container}
                        >
                            <div id="basic-info">
                                <div
                                    className={styles.modTitle}
                                    style={{ paddingLeft: '8px' }}
                                >
                                    {__('基本信息')}
                                </div>
                                <DetailsLabel
                                    wordBreak
                                    detailsList={apiRescBasicDetailConfig?.map(
                                        (item: any) => {
                                            const { key, subKey } = item
                                            const value =
                                                item.value ||
                                                (subKey
                                                    ? apiDetail?.[item.key]?.[
                                                          subKey
                                                      ]
                                                    : apiDetail?.[item.key])
                                            if (
                                                [
                                                    'request_content_type',
                                                    'response_content_type',
                                                ].includes(key)
                                            ) {
                                                return {
                                                    ...item,
                                                    value: value?.join(','),
                                                }
                                            }
                                            return {
                                                ...item,
                                                value,
                                            }
                                        },
                                    )}
                                />
                            </div>
                            <div id="param-info-req">
                                <div
                                    className={styles.modTitle}
                                    style={{ margin: '16px 0 0 0' }}
                                >
                                    {__('请求信息')}
                                </div>

                                {!!apiDetail?.request_header?.length && (
                                    <div
                                        className={styles.paramsContent}
                                        id="param-info-request-header"
                                    >
                                        <div className={styles.title}>
                                            {__('请求头')}
                                        </div>
                                        <div className={styles.table}>
                                            <Table
                                                columns={reqColumns.filter(
                                                    (currentData) =>
                                                        [
                                                            'name',
                                                            'desc',
                                                            'required',
                                                        ].includes(
                                                            currentData.key,
                                                        ),
                                                )}
                                                dataSource={
                                                    apiDetail?.request_header
                                                }
                                                pagination={{
                                                    showSizeChanger: true,
                                                    hideOnSinglePage:
                                                        (apiDetail
                                                            ?.request_header
                                                            ?.length || 0) <
                                                        DEFAULTPAGESIZE,
                                                    showQuickJumper: true,
                                                    showTotal: (count) => {
                                                        return `共 ${count} 条记录`
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!!apiDetail?.fixed_query?.length && (
                                    <div
                                        className={styles.paramsContent}
                                        id="param-info-request-fixed-params"
                                    >
                                        <div className={styles.title}>
                                            {__('固定query参数')}
                                        </div>
                                        <div className={styles.table}>
                                            <Table
                                                columns={reqColumns.filter(
                                                    (currentData) =>
                                                        [
                                                            'name',
                                                            'value',
                                                        ].includes(
                                                            currentData.key,
                                                        ),
                                                )}
                                                dataSource={
                                                    apiDetail?.fixed_query
                                                }
                                                pagination={{
                                                    showSizeChanger: true,
                                                    hideOnSinglePage:
                                                        (apiDetail?.fixed_query
                                                            ?.length || 0) <
                                                        DEFAULTPAGESIZE,
                                                    showQuickJumper: true,
                                                    showTotal: (count) => {
                                                        return `共 ${count} 条记录`
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!!apiDetail?.query?.length && (
                                    <div
                                        className={styles.paramsContent}
                                        id="param-info-request-params"
                                    >
                                        <div className={styles.title}>
                                            {__('query参数')}
                                        </div>
                                        <div className={styles.table}>
                                            <Table
                                                columns={reqColumns.filter(
                                                    (currentData) =>
                                                        [
                                                            'name',
                                                            'desc',
                                                            'required',
                                                        ].includes(
                                                            currentData.key,
                                                        ),
                                                )}
                                                dataSource={apiDetail?.query}
                                                pagination={{
                                                    showSizeChanger: true,
                                                    hideOnSinglePage:
                                                        (apiDetail?.query
                                                            ?.length || 0) <
                                                        DEFAULTPAGESIZE,
                                                    showQuickJumper: true,
                                                    showTotal: (count) => {
                                                        return `共 ${count} 条记录`
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!!apiDetail?.request_body?.length && (
                                    <div
                                        className={styles.paramsContent}
                                        id="param-info-request-body"
                                    >
                                        <div className={styles.title}>
                                            {__('请求body')}
                                        </div>
                                        <div className={styles.table}>
                                            <Table
                                                columns={resColumns.filter(
                                                    (currentData) =>
                                                        !['value'].includes(
                                                            currentData.key,
                                                        ),
                                                )}
                                                dataSource={
                                                    apiDetail?.request_body
                                                }
                                                pagination={{
                                                    showSizeChanger: true,
                                                    hideOnSinglePage:
                                                        (apiDetail?.request_body
                                                            ?.length || 0) <
                                                        DEFAULTPAGESIZE,
                                                    showQuickJumper: true,
                                                    showTotal: (count) => {
                                                        return `共 ${count} 条记录`
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!!apiDetail?.request_example && (
                                    <div
                                        className={styles.paramsContent}
                                        id="param-info-request-example"
                                    >
                                        <div className={styles.title}>
                                            {__('请求示例')}
                                        </div>
                                        <JSONCodeView
                                            code={
                                                apiDetail?.request_example ||
                                                '{ "id": 1, "name": ""}'
                                            }
                                            className={styles.codeBox}
                                        />
                                    </div>
                                )}

                                <div
                                    className={styles.modTitle}
                                    id="param-info-response"
                                >
                                    {__('响应信息')}
                                </div>
                                {!!apiDetail?.response_header?.length && (
                                    <div
                                        className={styles.paramsContent}
                                        id="param-info-response-header"
                                    >
                                        <div className={styles.title}>
                                            {__('响应头')}
                                        </div>
                                        <div className={styles.table}>
                                            <Table
                                                columns={resColumns.filter(
                                                    (currentData) =>
                                                        [
                                                            'name',
                                                            'value',
                                                        ].includes(
                                                            currentData.key,
                                                        ),
                                                )}
                                                dataSource={
                                                    apiDetail?.response_header
                                                }
                                                pagination={{
                                                    showSizeChanger: true,
                                                    hideOnSinglePage:
                                                        (apiDetail
                                                            ?.response_header
                                                            ?.length || 0) <
                                                        DEFAULTPAGESIZE,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!!apiDetail?.response_parameters?.length && (
                                    <div
                                        className={styles.paramsContent}
                                        id="param-info-response-params"
                                    >
                                        <div className={styles.title}>
                                            {__('响应参数')}
                                        </div>
                                        <div className={styles.table}>
                                            <Table
                                                columns={resColumns?.filter(
                                                    (currentData) =>
                                                        currentData?.key !==
                                                        'value',
                                                )}
                                                dataSource={
                                                    apiDetail?.response_parameters
                                                }
                                                pagination={{
                                                    showSizeChanger: true,
                                                    hideOnSinglePage:
                                                        (apiDetail
                                                            ?.response_parameters
                                                            ?.length || 0) <
                                                        DEFAULTPAGESIZE,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!!apiDetail?.response_example && (
                                    <div
                                        className={styles.paramsContent}
                                        id="param-info-response-example"
                                    >
                                        <div className={styles.title}>
                                            {__('响应示例')}
                                        </div>
                                        <JSONCodeView
                                            code={
                                                apiDetail?.response_example ||
                                                '{ "id": 1, "name": ""}'
                                            }
                                            className={styles.codeBox}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.menuContainer}>
                            <Anchor
                                getContainer={() =>
                                    (container.current as HTMLElement) || window
                                }
                                className={styles.anchorWrapper}
                                onClick={(e: any) => {
                                    e.preventDefault()
                                }}
                            >
                                <Link href="#basic-info" title="基本信息" />
                                <Link href="#param-info-req" title="请求信息">
                                    {!!apiDetail?.request_header?.length && (
                                        <Link
                                            href="#param-info-request-header"
                                            title="请求头"
                                        />
                                    )}
                                    {!!apiDetail?.fixed_query?.length && (
                                        <Link
                                            href="#param-info-request-fixed-params"
                                            title="固定query参数"
                                        />
                                    )}
                                    {!!apiDetail?.query?.length && (
                                        <Link
                                            href="#param-info-request-params"
                                            title="query参数"
                                        />
                                    )}
                                    {!!apiDetail?.request_body?.length && (
                                        <Link
                                            href="#param-info-request-body"
                                            title="请求body"
                                        />
                                    )}
                                    {apiDetail?.request_example && (
                                        <Link
                                            href="#param-info-request-example"
                                            title="请求示例"
                                        />
                                    )}
                                </Link>
                                <Link
                                    href="#param-info-response"
                                    title="响应信息"
                                >
                                    {!!apiDetail?.response_header?.length && (
                                        <Link
                                            href="#param-info-response-header"
                                            title="响应头"
                                        />
                                    )}
                                    {!!apiDetail?.response_parameters
                                        ?.length && (
                                        <Link
                                            href="#param-info-response-params"
                                            title="响应参数"
                                        />
                                    )}
                                    {!!apiDetail?.response_example && (
                                        <Link
                                            href="#param-info-response-example"
                                            title="响应示例"
                                        />
                                    )}
                                </Link>
                            </Anchor>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default ApiRescInfo
