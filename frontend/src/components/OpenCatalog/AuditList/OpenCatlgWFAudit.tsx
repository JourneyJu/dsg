import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import classnames from 'classnames'
import styles from './styles.module.less'
import __ from './locale'
import { formatError, getRescDirDetail, queryOpenCatlgDetail } from '@/core'
import OpenCatlgDetailDrawer from '../Detail'

const OpenCatlgWFAudit = ({ props }: any) => {
    const {
        props: {
            data: { title, code, id, version, submitter_name, submit_time },
            process: { audit_type },
        },
    } = props

    const [detailDisable, setDetailDisable] = useState(false)
    // 开放目录详情
    const [detailOpen, setDetailOpen] = useState(false)

    const [loading, setLoading] = useState(false)
    const [detail, setDetail] = useState<any>({})

    useEffect(() => {
        if (id) {
            getOpenCatlgInfo()
        }
    }, [id])

    const getOpenCatlgInfo = async () => {
        try {
            if (!id) return
            const res = await queryOpenCatlgDetail(id)
            setDetail(res)
            setDetailDisable(false)
        } catch (error) {
            formatError(error)
            setDetailDisable(true)
        }
    }

    const viewDetail = () => {
        setDetailOpen(true)
    }

    const handleCancel = () => {
        setDetailOpen(false)
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.text}>
                <div className={styles.clums}>{__('开放目录名称：')}</div>
                <div className={styles.texts}>{title || ''}</div>
            </div>
            <div className={styles.text}>
                <div className={styles.clums}>{__('申请时间：')}</div>
                <div className={styles.texts}>{code || ''}</div>
            </div>

            {audit_type !== 'af-data-catalog-open' && (
                <div className={styles.text}>
                    <div className={classnames(styles.clums, styles.details)}>
                        {__('详情：')}
                    </div>
                    <Button
                        className={classnames(styles.texts, styles.link)}
                        onClick={viewDetail}
                        disabled={detailDisable}
                        title={
                            detailDisable ? __('目录已被删除，无法查看') : ''
                        }
                        type="text"
                    >
                        {__('查看全部')}
                    </Button>
                </div>
            )}
            {/* 开放目录详情 */}
            {detailOpen && (
                <OpenCatlgDetailDrawer
                    open={detailOpen}
                    catlgItem={{
                        id: detail?.catalog_id,
                        name: detail?.name,
                    }}
                    isWorkFlow
                    onCancel={() => setDetailOpen(false)}
                />
            )}
        </div>
    )
}

export default OpenCatlgWFAudit
