import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useUpdateEffect } from 'ahooks'
import { Anchor, Tag } from 'antd'
import moment from 'moment'

import classnames from 'classnames'
import { ICAFileItem } from '@/core'

import styles from './styles.module.less'
import __ from './locale'
import { detailConfig, fileTypeOptions } from './helper'

import CustomDrawer from '../CustomDrawer'
import FileIcon from '../FileIcon'
import { DetailsLabel } from '@/ui'
import { LabelTitle } from '../ApiServices/helper'

const { Link } = Anchor

interface IDetails {
    visible: boolean
    title?: string
    // dataEleMatchType?: DataEleMatchType
    fileId: string
    fileItem: ICAFileItem
    onClose: () => void
    handleError?: (errorKey: string) => void
    getContainer?: any
}

// 关联数据默认页码
const defaultPageSize = 5

const Details: React.FC<IDetails> = ({
    visible,
    title = __('详情'),
    fileId,
    fileItem,
    onClose,
    handleError,
    getContainer,
}) => {
    const [loading, setLoading] = useState(true)

    // 文件详情
    const [details, setDetails] = useState<any>()
    const [detailList, setDetailList] = useState<any>(detailConfig)

    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (visible && fileId) {
            valueDetailInfo(fileItem)
        }
    }, [visible])

    const renderRowInfo = (config: any) => {
        return (
            <div className={styles.tableItem}>
                {config?.map((cItem: any) => {
                    const { key, label } = cItem
                    let showContent = details?.[key]

                    if (key === 'type') {
                        showContent = fileTypeOptions?.find(
                            (item: any) => item.value === showContent,
                        )?.label
                    }
                    if (key === 'created_at') {
                        showContent = moment(showContent).format(
                            'YYYY-MM-DD HH:mm:ss',
                        )
                    }

                    return (
                        <div className={styles.tableRow} key={key}>
                            <div className={styles.firstCol}>{label}</div>
                            <div className={styles.secCol}>
                                {showContent || '--'}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const valueDetailInfo = (data: any) => {
        const detailInfo = detailConfig?.map((cItem) => {
            const { key } = cItem
            let value: any = data[key]
            if (key === 'created_at') {
                value = value
                    ? moment(value || '').format('YYYY-MM-DD hh:mm:ss')
                    : '--'
            }
            if (key === 'type') {
                value = fileTypeOptions?.find(
                    (item: any) => item.value === value,
                )?.label
            }
            return {
                ...cItem,
                value: value || '--',
                render:
                    cItem.key === 'fileName'
                        ? () => {
                              return (
                                  <Tag
                                      title={value}
                                      key={data.id}
                                      className={styles.fileNameTagWrapper}
                                  >
                                      <FileIcon suffix={data.fileType} />

                                      <span className={styles.fileName}>
                                          {value || '--'}
                                      </span>
                                  </Tag>
                              )
                          }
                        : undefined,
            }
        })
        setDetailList(detailInfo)
    }

    return visible ? (
        <div>
            <CustomDrawer
                title={title}
                placement="right"
                push={{ distance: 0 }}
                className={`${styles.fileDetailsWrapper}`}
                onClose={onClose}
                open={visible}
                width={640}
                isShowHeader={false}
                isShowFooter={false}
                contentWrapperStyle={{
                    boxShadow: '-6px 0px 6px -4px rgba(0, 0, 0, 0.1)',
                }}
                headerStyle={{ display: 'block' }}
                bodyStyle={{
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
                customBodyStyle={{
                    height: '100%',
                }}
                mask={false}
                maskClosable
                maskStyle={undefined}
                getContainer={getContainer}
            >
                <div className={styles.bodyWrapper} ref={ref}>
                    <div className={styles.detailContent}>
                        <div className={classnames(styles.infoWrapper)}>
                            <LabelTitle label={__('基本信息')} />
                            <DetailsLabel
                                wordBreak
                                labelWidth="80px"
                                detailsList={detailList}
                            />
                        </div>
                    </div>
                </div>
            </CustomDrawer>
        </div>
    ) : (
        <div />
    )
}

export default Details
