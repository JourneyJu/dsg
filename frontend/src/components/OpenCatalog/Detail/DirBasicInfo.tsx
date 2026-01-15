import { Tooltip, Button } from 'antd'
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
    useMemo,
} from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { FontIcon, AppDataContentColored } from '@/icons'
import { IconType } from '@/icons/const'
import { ICatlgContent } from '@/core/apis/dataCatalog/index.d'
import styles from './styles.module.less'
import {
    formatError,
    queryOpenCatlgDetail,
    reqDataCatlgBasicInfo,
    getDataCatalogMount,
    getDataCatalogMountFrontend,
    getCategory,
    SystemCategory,
    detailFrontendServiceOverview,
    getDatasheetViewDetails,
} from '@/core'
import __ from './locale'
import { basicInfoDetailsList } from './helper'
import { Expand, DetailsLabel, Loader } from '@/ui'

import { useGeneralConfig } from '@/hooks/useGeneralConfig'
import { LabelTitle } from '@/components/ResourcesDir/BaseInfo'
import { OpenTypeEnum } from '../helper'

interface IDirBasicInfo {
    // 开放目录id
    id: string
    // 关联目录id
    catalogId: string
    details?: any
    // 是否审核
    isAudit?: boolean
    isMarket?: boolean
}
// DirDetailContent传参数
const DirBasicInfo = forwardRef((props: IDirBasicInfo, ref) => {
    const { id, catalogId, isAudit, details, isMarket } = props
    const navigator = useNavigate()

    const [loading, setLoading] = useState(false)
    const [loginViewOpen, setLoginViewOpen] = useState(false)
    const [applicationServiceOpen, setApplicationServiceOpen] = useState(false)
    const [logicViewId, setLoginViewId] = useState<string>('')

    const [dirContent, setDirContent] = useState<any>()

    const [basicInfoDetailsData, setBasicInfoDetailsData] =
        useState<any[]>(basicInfoDetailsList)
    const [{ using, governmentSwitch }] = useGeneralConfig()

    const governmentStatus = useMemo(() => {
        return governmentSwitch.on
    }, [governmentSwitch])

    const getDirName = () => {
        return dirContent?.name || ''
    }

    useImperativeHandle(ref, () => ({
        getDirName,
    }))

    const getOpenCatlgDetail = async () => {
        if (!id) return
        try {
            setLoading(true)
            const data = await queryOpenCatlgDetail(id)
            setDirContent(data)
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (details) {
            setDirContent(details)
        } else if (id) {
            getOpenCatlgDetail()
        }
    }, [id, details])

    useEffect(() => {
        if (dirContent) {
            valueBasicInfo(dirContent)
        }
    }, [dirContent])

    const valueBasicInfo = (data: any) => {
        const filterKeys: string[] = []
        const list = basicInfoDetailsData?.map((item) => {
            const itemList = item?.list.map((it) => {
                const obj = { ...it, value: data[it.key] }
                if (['updated_at', 'publish_at'].includes(it.key)) {
                    obj.value = data[it.key]
                        ? moment(data[it.key]).format('YYYY-MM-DD HH:mm:ss')
                        : '--'
                }
                if (
                    it.key === 'open_type' &&
                    data[it.key] === OpenTypeEnum.NoCondition
                ) {
                    filterKeys.push('open_level')
                }
                return obj
            })
            return {
                ...item,
                list: itemList.filter((it) => !filterKeys.includes(it.key)),
            }
        })
        setBasicInfoDetailsData(list.filter((item) => item.list?.length))
    }

    return loading ? (
        <Loader />
    ) : (
        <div className={styles.basicContentWrapper}>
            {!isMarket && (
                <div className={styles.headerBox}>
                    <div className={styles.headerTitle}>
                        <div className={styles.headerLeft}>
                            <AppDataContentColored className={styles.icon} />
                            <div className={styles.titleBox}>
                                <div
                                    className={styles.title}
                                    title={dirContent?.name}
                                >
                                    {dirContent?.name || '--'}
                                </div>
                                {/* <div className={styles.info}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.lable}>
                                            {__('编码')}：
                                        </span>
                                        <span className={styles.text}>
                                            {dirContent?.code}
                                        </span>
                                    </div>
                                </div> */}
                                <div className={styles.desc}>
                                    <span>{__('数据资源目录描述')}：</span>
                                    {dirContent?.description ? (
                                        <Expand
                                            expandTips={__('展开')}
                                            content={dirContent?.description}
                                        />
                                    ) : (
                                        '--'
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* <div className={styles.desc}>
                        <span>{__('数据资源目录描述')}：</span>
                        {dirContent?.description ? (
                            <Expand
                                expandTips={__('展开')}
                                content={dirContent?.description}
                            />
                        ) : (
                            '--'
                        )}
                    </div> */}
                </div>
            )}
            <div className={styles.basicContent}>
                {basicInfoDetailsData.map((item) => {
                    return (
                        <div key={item.key}>
                            {isMarket ? (
                                <div
                                    style={{
                                        marginBottom: '20px',
                                        fontWeight: 550,
                                    }}
                                >
                                    {item.label}
                                </div>
                            ) : (
                                <LabelTitle label={item.label} />
                            )}
                            <div style={{ marginBottom: '20px' }}>
                                <DetailsLabel
                                    wordBreak
                                    labelWidth="160px"
                                    detailsList={item.list}
                                    border={isMarket}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
})

export default DirBasicInfo
