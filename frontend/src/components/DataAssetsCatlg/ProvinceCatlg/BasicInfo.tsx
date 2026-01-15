import { memo, useEffect, useState } from 'react'
import Icon from '@ant-design/icons'
import classnames from 'classnames'
import { isArray } from 'lodash'
import { DetailsLabel } from '@/ui'
import { formatError, IPrvcDataCatlgDetail } from '@/core'

import styles from './styles.module.less'
import __ from './locale'
import { SubTitle } from '../helper'
import {
    basicInfoDetailsList,
    pCatlgDataClassificationMap,
    PCatlgShareTypeEnum,
    PCatlgUpdateCycleEnum,
} from './helper'
import { ReactComponent as icon1 } from '@/assets/DataAssetsCatlg/icon1.svg'
import { OpenTypeEnum } from '@/components/ResourcesDir/const'

interface IBasicInfo {
    id: string
    detail: IPrvcDataCatlgDetail
}

const BasicInfo = ({ id, detail }: IBasicInfo) => {
    return (
        <div
            className={classnames(
                styles.rescInfoWrapper,
                styles.basicInfoWrapper,
            )}
        >
            <div className={styles.infoHeader}>
                <Icon component={icon1} className={styles.icon} />
                <div>{__('资源信息')}</div>
            </div>
            <div className={styles.infoContentWrapper}>
                <div className={styles.infoContent}>
                    {basicInfoDetailsList.map((mod) => {
                        return (
                            <>
                                <div className={styles.modTitle}>
                                    {mod?.label}
                                </div>
                                <DetailsLabel
                                    wordBreak
                                    border
                                    labelWidth="234px"
                                    isNeedColon={false}
                                    detailsList={mod?.list?.map((item) => {
                                        const { key } = item
                                        let value = detail?.[item.key]
                                        if (
                                            key === 'update_cycle' &&
                                            value ===
                                                PCatlgUpdateCycleEnum.OTHER
                                        ) {
                                            value =
                                                detail?.other_update_cycle ||
                                                '--'
                                            return {
                                                ...item,
                                                value,
                                                options: [],
                                            }
                                        }
                                        if (
                                            (key === 'share_condition' &&
                                                value ===
                                                    PCatlgShareTypeEnum.NOSHARE) ||
                                            (key === 'open_condition' &&
                                                value === OpenTypeEnum.NOOPEN)
                                        ) {
                                            value = '--'
                                        }
                                        if (key === 'catalog_tag') {
                                            value = isArray(value) ? value : []
                                            return {
                                                ...item,
                                                value:
                                                    value?.map((tag) => {
                                                        return pCatlgDataClassificationMap[
                                                            tag
                                                        ]
                                                    }) || [],
                                            }
                                        }

                                        value = value || '--'

                                        return {
                                            ...item,
                                            value,
                                        }
                                    })}
                                    style={{
                                        paddingBottom: '8px',
                                    }}
                                />
                            </>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default memo(BasicInfo)
