import React, { useEffect, useRef, useState } from 'react'
import { Col, Divider, Drawer, Row } from 'antd'
import { noop } from 'lodash'
import { LeftOutlined } from '@ant-design/icons'
import styles from './styles.module.less'
import __ from './locale'
import BasicInfo from './BasicInfo'
import GlobalMenu from '@/components/GlobalMenu'
import { queryLicenseDetail } from '@/core/apis/dataCatalog'
import { formatError } from '@/core'

interface IOpenCatlgDetailDrawer {
    // 证照id
    id: string
    // 为true表明目录详情页为抽屉形式显示
    open?: boolean
    // 是否时审核代办中打开
    isWorkFlow?: boolean
    onCancel?: () => void
    getContainer?: () => HTMLElement
}

function OpenCatlgDetailDrawer({
    id,
    open,
    isWorkFlow = false,
    onCancel = noop,
    getContainer,
}: IOpenCatlgDetailDrawer) {
    const basicInfoRef = useRef<any>()

    const [basicInfoLoading, setBasicInfoLoading] = useState(false)
    const [basicInfo, setBasicInfo] = useState<any>()

    const handleCancel = () => {
        onCancel()
    }

    useEffect(() => {
        if (id) {
            getOpenCatlgDetail()
        }
    }, [id])

    const getOpenCatlgDetail = async () => {
        if (!id) return
        try {
            setBasicInfoLoading(true)
            const res = await queryLicenseDetail(id)
            setBasicInfo(res)
        } catch (error) {
            formatError(error)
        } finally {
            setBasicInfoLoading(false)
        }
    }

    return (
        <Drawer
            headerStyle={{ display: 'none' }}
            placement="right"
            onClose={handleCancel}
            open={open}
            bodyStyle={{
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: isWorkFlow ? '' : '1280px',
            }}
            width={isWorkFlow ? '80%' : '100vw'}
            maskClosable
            zIndex={1001}
            push={false}
            getContainer={getContainer}
            destroyOnClose
        >
            <div className={styles.dirContent}>
                <div className={styles.top}>
                    <Row
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <Col span={6}>
                            <div className={styles.leftContent}>
                                <GlobalMenu />
                                <div
                                    onClick={handleCancel}
                                    className={styles.returnInfo}
                                >
                                    <LeftOutlined
                                        className={styles.returnArrow}
                                    />
                                    <span className={styles.returnText}>
                                        返回
                                    </span>
                                </div>
                                <Divider
                                    className={styles.divider}
                                    type="vertical"
                                />
                                <div
                                    title={basicInfo?.name}
                                    className={styles.businessName}
                                >
                                    {basicInfo?.name || '--'}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
                <div className={styles.bottom}>
                    <BasicInfo
                        ref={basicInfoRef}
                        id={id}
                        basicInfoLoading={basicInfoLoading}
                        basicInfo={basicInfo}
                    />
                </div>
            </div>
        </Drawer>
    )
}

export default OpenCatlgDetailDrawer
