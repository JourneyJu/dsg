import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import classnames from 'classnames'
import moment from 'moment'
import styles from './styles.module.less'
import __ from './locale'
import { getRescDirDetail } from '@/core'

const SSZDDemandAudit = ({ props }: any) => {
    const {
        props: {
            data: { title, code, id, version, submitter_name, submit_time },
            process: { audit_type },
        },
    } = props
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [detailDisable, setDetailDisable] = useState(false)

    const viewDetail = () => {
        setDetailDialogOpen(true)
    }

    const getRescDir = async () => {
        try {
            await getRescDirDetail(id)
            setDetailDisable(false)
        } catch (error) {
            if (error?.data?.code === 'DataCatalog.Public.ResourceNotExisted') {
                setDetailDisable(true)
            }
        }
    }

    useEffect(() => {
        if (id) {
            getRescDir()
        }
    }, [id])

    const handleCancel = () => {
        setDetailDialogOpen(false)
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.text}>
                <div className={styles.clums}>{__('需求名称：')}</div>
                <div className={styles.texts}>{title || ''}</div>
            </div>
            <div className={styles.text}>
                <div className={styles.clums}>{__('需求联系人：')}</div>
                <div className={styles.texts}>{code || ''}</div>
            </div>
            <div className={styles.text}>
                <div className={styles.clums}>{__('需求描述：')}</div>
                <div className={styles.texts}>{version || ''}</div>
            </div>
            <div className={styles.text}>
                <div className={styles.clums}>{__('创建时间：')}</div>
                <div className={styles.texts}>
                    {moment(submit_time || '').format('YYYY-MM-DD HH:mm')}
                </div>
            </div>
            <div className={styles.text}>
                <div className={classnames(styles.clums, styles.details)}>
                    {__('详情：')}
                </div>
                <Button
                    className={classnames(styles.texts, styles.link)}
                    onClick={viewDetail}
                    type="text"
                >
                    {__('查看详情')}
                </Button>
            </div>
        </div>
    )
}

export default SSZDDemandAudit
