import * as React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
    Layout,
    Row,
    Col,
    Button,
    Dropdown,
    Divider,
    message,
    Tooltip,
    Modal,
} from 'antd'
import {
    LeftOutlined,
    DownOutlined,
    LoadingOutlined,
    InfoCircleOutlined,
    ExclamationCircleFilled,
} from '@ant-design/icons'
import { noop } from 'lodash'
import { Background } from '@antv/x6/lib/registry'
import { Node } from '@antv/x6'
import {
    formatError,
    getConfigPaths,
    TaskExecutableStatus,
    TaskStatus,
    TaskType,
    ViewModel,
} from '@/core'
import { IAssemblyLineEditParams } from '@/core/apis/assemblyLine/index.d'
import styles from './styles.module.less'
import {
    InfotipOutlined,
    LargeOutlined,
    LocationOutlined,
    NarrowOutlined,
} from '@/icons'
import { getActualUrl } from '@/utils'
import __ from './locale'
import { combQuery, combUrl, getQueryData } from '../FormGraph/helper'
import FlowchartIconOutlined from '@/icons/FlowchartOutlined'
import ReturnConfirmModal from '@/ui/ReturnConfirmModal'
import GlobalMenu from '../GlobalMenu'
import { useUserPermCtx } from '@/context/UserPermissionProvider'

const { Header: AntdHeader } = Layout

interface GraphToolBarType {
    onChangeGraphSize: (multiple: number) => void
    onShowAllGraphSize: () => void
    onSaveGraph: () => void
    graphSize: number
    targetFormInfo: any
    onUpdateFormInfo: (data) => void
    model: ViewModel
    onSwitchModel: () => void
    queryData: any
    onMovedToCenter: () => void
    infoStatus: boolean
    updateDisabled?: boolean
    originNode: Node | null
    saveDisabled: boolean
}

const graphSizeItems = [
    {
        key: 'all',
        label: '总览全部',
    },
    {
        key: 'divider',
        label: (
            <Divider
                style={{
                    margin: 0,
                }}
            />
        ),
        disabled: true,
    },
    {
        key: '400',
        label: '400%',
    },
    {
        key: '200',
        label: '200%',
    },
    {
        key: '100',
        label: '100%',
    },
    {
        key: '50',
        label: '50%',
    },
]

const GraphToolBar = ({
    onChangeGraphSize = noop,
    onShowAllGraphSize = noop,
    onSaveGraph = noop,
    graphSize = 100,
    targetFormInfo,
    onUpdateFormInfo,
    model,
    onSwitchModel,
    queryData,
    onMovedToCenter,
    infoStatus,
    updateDisabled,
    originNode,
    saveDisabled,
}: GraphToolBarType) => {
    const [formInfoModalleft, setFormInfoModalLeft] = useState('100px')
    // const [graphSize, setGraphSize] = useState(100)
    const navigator = useNavigate()
    const { pathname, search } = useLocation()
    const [searchParams, setSearchParams] = useSearchParams()
    const graphModel = pathname.split('/')[2]
    const publishStatus = searchParams.get('state')
    const taskId = searchParams.get('taskId') || ''
    const [loadingSave, setLoadingSave] = useState(false)
    const [formInfo, setFormInfo] = useState(targetFormInfo)
    const [formInfoOpenStatus, setformInfoOpenStatus] = useState(false)
    const [confirmBack, setConfirmBack] = useState<boolean>(false)
    // const redirect = searchParams.get('redirect')
    const [isShowEdit, setIsShowEdit] = useState<boolean>(false)
    const { checkPermission } = useUserPermCtx()

    useEffect(() => {
        setFormInfo(targetFormInfo)
    }, [targetFormInfo])

    const goBack = () => {
        if (searchParams.get('jumpMode') === 'win') {
            window.open(getActualUrl(combUrl(queryData)), '_self')
            return
        }
        navigator(combUrl(queryData))
    }
    /**
     * 返回事件
     */
    const handleReturnBack = () => {
        if (model === ViewModel.ModelEdit) {
            ReturnConfirmModal({
                onCancel: () => {
                    goBack()
                },
            })
        } else {
            goBack()
        }
    }

    /**
     * 选择画布大小
     * @param key 选择项
     */
    const selectGraphSize = (key: string) => {
        const showSize: number = 100
        switch (true) {
            case key === 'all':
                onShowAllGraphSize()
                break
            case key === 'divider':
                break
            default:
                onChangeGraphSize(Number(key) / 100)
                break
        }
    }

    const getIsShowEdit = () => {
        const querySearch = getQueryData(search)
        let res = true
        if (
            taskId &&
            querySearch &&
            ((querySearch.taskType &&
                querySearch.taskType !== TaskType.MODEL &&
                querySearch.taskType !== TaskType.DATAMODELING) ||
                (querySearch.taskStatus &&
                    querySearch.taskStatus === TaskStatus.COMPLETED) ||
                (querySearch.taskExecutableStatus &&
                    querySearch.taskExecutableStatus !==
                        TaskExecutableStatus.EXECUTABLE))
        ) {
            res = false
        }

        return res && checkPermission('manageBusinessModelAndBusinessDiagnosis')
    }

    return (
        <div className={styles.headerWrapper}>
            <AntdHeader className={styles.header}>
                <Row
                    style={{
                        width: '100%',
                    }}
                >
                    <Col span={6} className={styles.headerCol}>
                        <GlobalMenu />
                        <div className={styles.returnBox}>
                            <div
                                aria-hidden
                                className={styles.returnWrapper}
                                onClick={() => handleReturnBack()}
                            >
                                <LeftOutlined className={styles.returnIcon} />
                                <div className={styles.return}>返回</div>
                                <div>
                                    {queryData.flowchart_id && (
                                        <FlowchartIconOutlined
                                            className={styles.pi_icon}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.nameWrapper}>
                                <div
                                    className={styles.domainName}
                                    title={formInfo?.name}
                                >
                                    {formInfo?.name}
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div className={styles.toolWrapper}>
                            <div className={styles.toolbarContent}>
                                <div className={styles.toolIcon}>
                                    <Tooltip placement="top" title="缩小">
                                        <Button
                                            type="text"
                                            icon={
                                                <NarrowOutlined
                                                    style={{
                                                        fontSize: '14px',
                                                    }}
                                                    // disabled={graphSize <= 20}
                                                />
                                            }
                                            onClick={() => {
                                                onChangeGraphSize(
                                                    Math.round(graphSize - 5) /
                                                        100,
                                                )
                                            }}
                                            disabled={graphSize <= 20}
                                            className={`${styles.toolButton} ${
                                                graphSize <= 20
                                                    ? styles.iconDisabled
                                                    : styles.iconEnabled
                                            }`}
                                        />
                                    </Tooltip>
                                </div>
                                <div className={styles.toolIcon}>
                                    <Dropdown
                                        menu={{
                                            items: graphSizeItems,
                                            onClick: ({ key }) => {
                                                selectGraphSize(key)
                                            },
                                        }}
                                    >
                                        <div
                                            className={`${styles.toolSelectSize} ${styles.iconEnabled}`}
                                        >
                                            <div
                                                style={{
                                                    fontSize: '12px',
                                                    userSelect: 'none',
                                                }}
                                                onDoubleClick={() => {
                                                    onChangeGraphSize(1)
                                                }}
                                            >
                                                {`${Math.round(graphSize)}%`}
                                            </div>
                                            <DownOutlined
                                                style={{
                                                    fontSize: '10px',
                                                    margin: '0 0 0 5px',
                                                }}
                                            />
                                        </div>
                                    </Dropdown>
                                </div>
                                <div className={styles.toolIcon}>
                                    <Tooltip placement="top" title="放大">
                                        <Button
                                            type="text"
                                            icon={
                                                <LargeOutlined
                                                    style={{
                                                        fontSize: '14px',
                                                    }}
                                                />
                                            }
                                            onClick={() => {
                                                onChangeGraphSize(
                                                    Math.round(graphSize + 5) /
                                                        100,
                                                )
                                            }}
                                            disabled={graphSize >= 400}
                                            className={`${styles.toolButton} ${
                                                graphSize >= 400
                                                    ? styles.iconDisabled
                                                    : styles.iconEnabled
                                            }`}
                                        />
                                    </Tooltip>
                                </div>
                            </div>
                            <div className={styles.toolbarContent}>
                                <div className={styles.toolIcon}>
                                    <Tooltip placement="top" title="定位">
                                        <Button
                                            type="text"
                                            icon={
                                                <LocationOutlined
                                                    style={{
                                                        fontSize: '16px',
                                                    }}
                                                />
                                            }
                                            onClick={() => {
                                                onMovedToCenter()
                                            }}
                                            className={`${styles.toolButton} ${styles.iconEnabled}`}
                                        />
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col span={6}>
                        <div className={styles.toolSaveWrapper}>
                            {model === ViewModel.ModelEdit ? (
                                <Button
                                    className={styles.toolSaveButton}
                                    icon={
                                        loadingSave ? (
                                            <LoadingOutlined
                                                style={{ marginRight: '5px' }}
                                            />
                                        ) : null
                                    }
                                    type="primary"
                                    style={
                                        loadingSave
                                            ? {
                                                  backgroundColor:
                                                      'rab(127.182.246)',
                                                  cursor: 'default',
                                              }
                                            : {}
                                    }
                                    onClick={async (e) => {
                                        if (loadingSave) {
                                            e.preventDefault()
                                        }
                                        await setLoadingSave(true)
                                        await onSaveGraph()
                                        await setLoadingSave(false)
                                    }}
                                    disabled={saveDisabled}
                                >
                                    {__('保存')}
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    onClick={onSwitchModel}
                                    hidden={!getIsShowEdit()}
                                >
                                    编辑
                                </Button>
                            )}
                        </div>
                    </Col>
                </Row>
            </AntdHeader>

            {confirmBack && (
                <Modal
                    open
                    width={480}
                    title={null}
                    closable={false}
                    maskClosable={false}
                    getContainer={false}
                    className={styles.tipMessage}
                    footer={
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <Button
                                style={{
                                    width: '80px',
                                }}
                                onClick={() => {
                                    handleReturnBack()
                                }}
                            >
                                {__('放弃保存')}
                            </Button>
                            <Button
                                type="primary"
                                style={{
                                    width: '94px',
                                }}
                                loading={loadingSave}
                                onClick={async (e) => {
                                    if (loadingSave) {
                                        e.preventDefault()
                                    }
                                    await setLoadingSave(true)
                                    await onSaveGraph()
                                    await setLoadingSave(false)
                                }}
                            >
                                {__('保存并退出')}
                            </Button>
                        </div>
                    }
                />
            )}
        </div>
    )
}

export default GraphToolBar
