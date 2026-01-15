import React, { useEffect, useState } from 'react'
import { Button, Drawer } from 'antd'
import classnames from 'classnames'
import moment from 'moment'
import styles from './styles.module.less'
import __ from './locale'
import { getRescDirDetail } from '@/core'
import ApplicationCaseDetail from '../ApplicationCase/Details'

const ApplicationCaseAudit = ({ props }: any) => {
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

    return (
        <div className={styles.wrapper}>
            <div className={styles.text}>
                <div className={styles.clums}>{__('应用案例名称：')}</div>
                <div className={styles.texts}>{title || ''}</div>
            </div>
            <div className={styles.text}>
                <div className={styles.clums}>{__('应用名称：')}</div>
                <div className={styles.texts}>{title || ''}</div>
            </div>
            <div className={styles.text}>
                <div className={styles.clums}>{__('应用案例描述：')}</div>
                <div className={styles.texts}>{version || ''}</div>
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
            <Drawer
                title={title}
                width={1120}
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
            >
                <ApplicationCaseDetail id={id} />
            </Drawer>
        </div>
    )
}

export default ApplicationCaseAudit
