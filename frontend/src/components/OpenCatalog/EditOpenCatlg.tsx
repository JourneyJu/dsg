import React, { useEffect, useState, useRef, useMemo } from 'react'
import {
    Form,
    Modal,
    Space,
    Button,
    Tooltip,
    Col,
    Row,
    Radio,
    Input,
    Tag,
} from 'antd'
import type { InputRef } from 'antd'
import { noop } from 'lodash'

import { useWatch } from 'antd/lib/form/Form'
import { useUpdateEffect } from 'ahooks'
import { text } from 'stream/consumers'
import __ from './locale'
import styles from './styles.module.less'
import { openLevelList, shareTypeList } from './helper'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { getActualUrl, OperateType } from '@/utils'
import DataCatlgDetailDrawer from '../ResourcesDir/DataCatlgDetailDrawer'
import { ShareTypeEnum } from '../ResourcesDir/const'
import { editOpenCatlg, queryOpenCatlgDetail } from '@/core'
import OpenCatlgDetailDrawer from './Detail'

interface IEditOpenCatlg {
    open: boolean
    onClose: (isSearch?: boolean, isFlag?: string) => void
    onOK?: (val: any) => void
    title?: string
    catalogInfo?: any
}

const EditOpenCatlg: React.FC<IEditOpenCatlg> = ({
    open,
    onClose = noop,
    onOK = noop,
    title = __('来源业务场景'),
    catalogInfo = {},
}) => {
    const { id } = catalogInfo

    const [detail, setDetail] = useState<any>({})
    // 数据资源目录详情
    const [dataCatlgDetailOpen, setDataCatlgDetailOpen] =
        useState<boolean>(false)
    // 开放目录详情
    // const [detailOpen, setDetailOpen] = useState(false)
    const [form] = Form.useForm()
    const [btnLoading, setBtnLoading] = useState<boolean>(false)

    const getOpenCatlgInfo = async () => {
        try {
            if (!id) return
            const res = await queryOpenCatlgDetail(id)
            setDetail({ ...catalogInfo, ...(res || {}) })
        } catch (error) {
            // console.error(error)
        }
    }

    useEffect(() => {
        if (open) {
            getOpenCatlgInfo()
        }
    }, [open])

    useUpdateEffect(() => {
        const { open_type, open_level } = detail
        form.setFieldsValue({
            open_type,
            open_level,
        })
    }, [detail])

    const getModalFooter = () => {
        return (
            <Space size={16}>
                <Button onClick={() => onClose()}>{__('取消')}</Button>

                <Button
                    type="primary"
                    loading={btnLoading}
                    onClick={() => form.submit()}
                >
                    {__('确认')}
                </Button>
            </Space>
        )
    }

    const onFinish = async (values: any) => {
        // onOK(valueasync s)
        try {
            await editOpenCatlg({ id, ...values })
            onOK()
        } catch (error) {
            // console.error(error)
        }
    }

    return (
        <Modal
            title={__('编辑开放目录')}
            width={800}
            open={open}
            onCancel={() => onClose(true)}
            bodyStyle={{ height: 331 }}
            destroyOnClose
            maskClosable={false}
            className={styles.editOpenCatlgWrapper}
            footer={<div className={styles.footer}>{getModalFooter()}</div>}
        >
            <div className={styles.editOpenCatlgWrapper}>
                <div className={styles.dataCatlgItem}>
                    <div className={styles.catlgName}>
                        <FontIcon
                            name="icon-shujumuluguanli1"
                            type={IconType.COLOREDICON}
                            className={styles.nameIcon}
                        />
                        <div className={styles.catlgNameCont}>
                            <div
                                onClick={() => {
                                    setDataCatlgDetailOpen(true)
                                }}
                                title={detail?.name}
                                className={styles.names}
                            >
                                {detail?.name || '--'}
                            </div>
                            <div className={styles.code} title={detail.code}>
                                {__('目录编码：') + (detail?.code || '--')}
                            </div>
                        </div>
                    </div>
                </div>
                <Form form={form} name="validate_other" onFinish={onFinish}>
                    <Row>
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
                                        <Radio value={item.key}>
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
                                                    <Radio value={item.key}>
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

            {/* 数据资源目录详情 */}
            {dataCatlgDetailOpen && (
                <DataCatlgDetailDrawer
                    catlgItem={{
                        id: detail?.catalog_id,
                        name: detail?.name,
                    }}
                    open={dataCatlgDetailOpen}
                    onCancel={() => setDataCatlgDetailOpen(false)}
                />
            )}
            {/* 开放目录详情 */}
            {/* {detailOpen && (
                <OpenCatlgDetailDrawer
                    open={detailOpen}
                    catlgItem={detail}
                    onCancel={() => setDetailOpen(false)}
                />
            )} */}
        </Modal>
    )
}

export default EditOpenCatlg
