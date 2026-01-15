import React, { useEffect, useMemo, useState } from 'react'
import classnames from 'classnames'
import { noop } from 'lodash'
import { Drawer, Steps } from 'antd'
import __ from '../locale'
import styles from './styles.module.less'
import {
    formatError,
    getDataPushMonitorList,
    getSandboxApplyDetails,
    getSandboxImpDetails,
    getSandboxImpLogs,
    ISandboxApplyDetails,
    ISandboxImpLog,
} from '@/core'
import { CommonTitle } from '@/ui'
import BasicInfo from './BasicInfo'
import DrawerHeader from '@/components/CitySharing/component/DrawerHeader'
import CommonDetails from '@/components/CitySharing/Details/CommonDetails'
import ApplyRecord from './ApplyRecord'
import ProjectMember from './ProjectMember'
import { SandboxTab } from '../const'
import {
    baseInfoConfig,
    impBaseInfoConfig,
    impInfoConfig,
    impResInfoConfig,
    logBaseInfoConfig,
    spaceBaseInfoConfig,
} from '../helper'
import ProjectData from './ProjectData'
import { formatTime } from '@/utils'

interface IDetails {
    open: boolean
    applyId?: string
    excuteId?: string
    sandboxId?: string
    tab?: SandboxTab
    onClose?: () => void
    data?: any
}

const Details: React.FC<IDetails> = ({
    applyId,
    excuteId,
    sandboxId,
    tab = SandboxTab.Apply,
    onClose = noop,
    open,
    data,
}) => {
    const [details, setDetails] = useState<ISandboxApplyDetails>()
    const [impDetails, setImpDetails] = useState<any>()
    const [logs, setLogs] = useState<ISandboxImpLog[]>([])

    useEffect(() => {
        if (sandboxId) {
            getDetails()
        }
    }, [sandboxId])

    useEffect(() => {
        if (applyId && tab === SandboxTab.Implement) {
            getLogs()
        }
    }, [applyId])

    useEffect(() => {
        if (excuteId) {
            getImpDetails()
        }
    }, [excuteId])

    const getLogs = async () => {
        try {
            const res = await getSandboxImpLogs(applyId!)
            setLogs(res)
        } catch (error) {
            formatError(error)
        }
    }

    const getDetails = async () => {
        try {
            const res = await getSandboxApplyDetails(sandboxId!)
            setDetails(res)
        } catch (error) {
            formatError(error)
        }
    }

    const getImpDetails = async () => {
        try {
            const impRes = await getSandboxImpDetails(excuteId!)
            setImpDetails(impRes)
        } catch (error) {
            formatError(error)
        }
    }

    const steps = useMemo(() => {
        const applyInfo = logs.find((log) => log.execute_step === 1)
        const extendInfo = logs.find((log) => log.execute_step === 2)
        const auditInfo = logs.find((log) => log.execute_step === 3)
        const impInfo = logs.find((log) => log.execute_step === 4)
        const finishInfo = logs.find((log) => log.execute_step === 5)
        const basicApplyInfo = applyInfo || extendInfo

        return [
            {
                title: applyInfo ? __('沙箱申请') : __('扩容申请'),
                description: (
                    <div className={styles['info-conatiner']}>
                        <div className={styles['info-item']}>
                            {__('申请人')}：
                            {basicApplyInfo?.executor_name || '--'}
                        </div>
                        <div className={styles['info-item']}>
                            {__('申请时间')}：
                            {basicApplyInfo?.execute_time
                                ? formatTime(basicApplyInfo?.execute_time)
                                : '--'}
                        </div>
                    </div>
                ),
            },
            {
                title: __('需求审核'),
                description: (
                    <div className={styles['info-conatiner']}>
                        <div className={styles['info-item']}>
                            {__('审核人')}：{auditInfo?.executor_name}
                        </div>
                        <div className={styles['info-item']}>
                            {__('完成时间')}：
                            {auditInfo?.execute_time
                                ? formatTime(auditInfo?.execute_time)
                                : '--'}
                        </div>
                    </div>
                ),
            },
            {
                title: __('需求实施'),
                description: (
                    <div className={styles['info-conatiner']}>
                        <div className={styles['info-item']}>
                            {__('实施人')}：{impInfo?.executor_name}
                        </div>
                        <div className={styles['info-item']}>
                            {__('完成时间')}：
                            {impInfo?.execute_time
                                ? formatTime(impInfo?.execute_time)
                                : '--'}
                        </div>
                    </div>
                ),
            },
            {
                title: __('实施完成'),
                description: (
                    <div className={styles['info-conatiner']}>
                        <div className={styles['info-item']}>
                            {__('实施人')}：{finishInfo?.executor_name}
                        </div>
                        <div className={styles['info-item']}>
                            {__('完成时间')}：
                            {finishInfo?.execute_time
                                ? formatTime(finishInfo?.execute_time)
                                : '--'}
                        </div>
                    </div>
                ),
            },
        ]
    }, [logs])

    return (
        <Drawer
            open={open}
            width="100%"
            placement="right"
            closable={false}
            bodyStyle={{
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 1080,
            }}
            contentWrapperStyle={{ minWidth: 800 }}
            destroyOnClose
            maskClosable={false}
            mask={false}
            push={{ distance: 0 }}
        >
            <div className={classnames(styles.details)}>
                {/* 导航头部 */}
                <DrawerHeader
                    title={details?.project_name || data?.sandbox_project_name}
                    onClose={onClose}
                />

                {/* 内容 */}
                <div className={styles.bottom}>
                    <div className={styles.content}>
                        {tab === SandboxTab.Implement && (
                            <div className={styles['step-container']}>
                                <Steps current={-1} items={steps} />
                            </div>
                        )}

                        <div className={styles['common-title']}>
                            <CommonTitle title={__('基本信息')} />
                        </div>
                        <BasicInfo
                            details={
                                tab === SandboxTab.Log
                                    ? data
                                    : tab === SandboxTab.Implement
                                    ? { ...details, ...impDetails }
                                    : {
                                          applicant_name:
                                              impDetails?.applicant_name,
                                          reason: impDetails?.reason,
                                          ...details,
                                      }
                            }
                            config={
                                tab === SandboxTab.Log
                                    ? logBaseInfoConfig
                                    : tab === SandboxTab.Space
                                    ? spaceBaseInfoConfig
                                    : tab === SandboxTab.Implement
                                    ? impBaseInfoConfig
                                    : baseInfoConfig
                            }
                        />
                        {tab === SandboxTab.Apply && (
                            <>
                                <div className={styles['common-title']}>
                                    <CommonTitle title={__('申请记录')} />
                                </div>
                                <ApplyRecord
                                    data={details?.apply_records || []}
                                />
                                <div className={styles['common-title']}>
                                    <CommonTitle title={__('项目成员')} />
                                </div>
                                <ProjectMember
                                    data={details?.project_members || []}
                                />
                            </>
                        )}
                        {tab === SandboxTab.Space && (
                            <ProjectData sandboxId={sandboxId!} />
                        )}
                        {tab === SandboxTab.Implement && (
                            <>
                                <div className={styles['common-title']}>
                                    <CommonTitle title={__('实施信息')} />
                                </div>
                                <BasicInfo
                                    details={impDetails}
                                    config={impInfoConfig}
                                />
                                <div className={styles['common-title']}>
                                    <CommonTitle title={__('实施结果')} />
                                </div>
                                <BasicInfo
                                    details={impDetails}
                                    config={impResInfoConfig}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Drawer>
    )
}
export default Details
