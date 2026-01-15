import {
    Button,
    Col,
    Drawer,
    Form,
    Input,
    message,
    Radio,
    Row,
    Space,
} from 'antd'
import { clone, has, noop, omit, pick } from 'lodash'
import classnames from 'classnames'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CloseOutlined, InfoCircleFilled } from '@ant-design/icons'
import moment from 'moment'
import styles from './styles.module.less'
import __ from '../locale'
import { CommonTitle, DetailsLabel } from '@/ui'
import {
    ImplementDataPushConfig,
    ImplementDataPushStrategy,
    ImplementGroupConfig,
    ImplementGroupKeys,
    ImplementStatusConfig,
} from './const'
import Editor, { getFormatSql } from '@/components/IndicatorManage/Editor'
import { formatTime, useQuery } from '@/utils'
import {
    dataAnalDataPush,
    formatError,
    getCityShareApplyDetail,
    getConnectorTypeMap,
    getDataBaseDetails,
    getDataFormFields,
    getDataPushDetail,
    getDatasheetViewDetails,
    getDataViewBaseInfo,
    getRescDirColumnInfo,
    IConfirmInfo,
    IConnectorMapSourceType,
    IDataAnalImplementInfo,
    IDataFormField,
    implementCityShareApply,
} from '@/core'
import SchedulePlanForm from '@/components/DataPush/SchedulePlanForm'
import PushField from '@/components/DataPush/CreateDataPush/PushField'
import FilterRuleEditor from '@/components/DataPush/CreateDataPush/FilterRuleEditor'
import {
    ScheduleExecuteStatus,
    TransmitMode,
} from '@/components/DataPush/const'
import IncrementalForm from '@/components/DataPush/CreateDataPush/IncrementalForm'
import { pushMechanism } from '@/components/DataPush/Details/helper'
import { IDetailsLabel } from '@/components/ApiServices/const'
import { formatFieldData } from '@/components/DataPush/CreateDataPush/helper'
import { schedulePlan } from '@/components/DataPush/helper'
import DrawerHeader from '@/components/CitySharing/component/DrawerHeader'
import PushFieldDetail from '@/components/CitySharing/Implement/PushFieldDetail'
import { resourceUtilizationOptions } from '@/components/CitySharing/Apply/helper'
import { TagsView } from './helper'
import { changeDataType } from '@/components/CitySharing/Implement/helper'

interface IPushConfigProps {
    open: boolean
    onClose: () => void
    applyId: string
    model?: 'detail' | 'pushConfig'
    rejectReason?: string
    isConfirmPlan?: boolean
    isViewPlan?: boolean
    analysisId?: string
    implItem: IDataAnalImplementInfo
    onConfirm?: (confirmInfo: IConfirmInfo) => void
    onOk?: (pushId: string) => void
}
export const PushConfig = ({
    open,
    onClose,
    applyId,
    rejectReason,
    model = 'pushConfig',
    isConfirmPlan = false,
    isViewPlan = false,
    analysisId,
    onConfirm = noop,
    implItem,
    onOk,
}: IPushConfigProps) => {
    // 目录数据
    const [catalogsData, setCatalogsData] = useState<any>()

    // 数据资源信息
    const [dataResourceInfo, setDataResourceInfo] = useState<any>()

    // 资源使用配置
    const [resourceUsageInfo, setResourceUsageInfo] = useState<any>()

    const [sourceData, setSourceData] = useState<any>()

    const [sourceInfo, setSourceInfo] = useState<any>()

    const [targetData, setTargetData] = useState<any>()

    const [pushFields, setPushFields] = useState<any>([])

    const [detailPushFields, setDetailPushFields] = useState<any>([])

    const [sqlScript, setSqlScript] = useState<string>('')

    const [dataViewId, setDataViewId] = useState<string>('')

    const [pushDetails, setPushDetails] = useState<any>({})

    const [sourceFields, setSourceFields] = useState<Array<any>>([])
    // 启用的脱敏规则
    const [desensitizationRule, setDesensitizationRule] =
        useState<boolean>(true)

    const sqlScriptRef = useRef<any>()

    const pushFieldRef = useRef<any>()
    const query = useQuery()

    const urlApplyId = query.get('applyId') || ''

    const [incrementalForm] = Form.useForm()

    const [schedulePlanForm] = Form.useForm()

    const [auditForm] = Form.useForm()

    useMemo(() => {
        setSourceFields(
            sourceFields.map((item) => ({
                ...item,
                selected_flag: pushFields.find(
                    (item2) => item2.source_field_id === item.id,
                )?.selected_flag,
            })),
        )
    }, [pushFields])

    useEffect(() => {
        getData()
    }, [implItem])

    useEffect(() => {
        if (sourceData?.fields?.length && targetData?.fields?.length) {
            setPushFields(
                sourceData.fields.map((item) => {
                    const foundField = targetData.fields.find(
                        (targetItem) =>
                            targetItem.technical_name === item.technical_name,
                    )
                    if (foundField) {
                        return {
                            ...item,
                            source_field_id: item.id,
                            data_type: foundField?.data_type || item.data_type,
                        }
                    }
                    return {
                        source_field_id: item.id,
                    }
                }),
            )
            if (sourceData?.fields?.length) {
                setSourceFields(sourceData.fields)
            }
        }
    }, [sourceData, targetData, detailPushFields])

    /**
     * 获取目录数据
     */
    const getData = async () => {
        try {
            setDataResourceInfo({
                data_res_name: implItem?.view_busi_name,
                data_res_code: implItem.view_code,
                res_name: implItem?.view_busi_name,
                name: implItem?.view_busi_name,
                org_name: implItem?.org_name,
                org_path: implItem?.org_path,
            })
            setResourceUsageInfo({
                supply_type:
                    implItem?.use_conf.supply_type === 'view'
                        ? __('库表交换')
                        : '--',
                area_range: implItem.use_conf.area_range,

                time_range: implItem.use_conf.time_range,
                push_frequency: implItem.use_conf.push_frequency,
                available_date_type:
                    implItem.use_conf.available_date_type ||
                    implItem.use_conf.available_date_type === 0
                        ? resourceUtilizationOptions.find(
                              (item) =>
                                  item.value ===
                                  implItem.use_conf.available_date_type,
                          )?.label
                        : '--',
            })

            getSourceInfo()

            setDataViewId(implItem.view_id || '')
        } catch (err) {
            formatError(err)
        }
    }

    /**
     * 获取源数据信息
     * @param id
     * @param columnIds
     */
    const getSourceInfo = async () => {
        try {
            const columnIds = JSON.parse(implItem.use_conf.column_ids)
            const [source_info, source_detail, dataFormFields] =
                await Promise.all([
                    getDatasheetViewDetails(implItem.view_id),
                    getDataViewBaseInfo(implItem.view_id),
                    getDataFormFields(
                        implItem.view_tech_name,
                        implItem.datasource_id!,
                    ),
                ])
            const newSourceFields = source_info.fields.filter((item) =>
                columnIds.includes(item.id),
            )

            const keys = [
                'id',
                'business_name',
                'technical_name',
                'primary_key',
                'is_nullable',
            ]

            const fields =
                dataFormFields
                    ?.filter((item) =>
                        newSourceFields.find(
                            (item2) => item2.technical_name === item.name,
                        ),
                    )
                    ?.map((item) => {
                        const findTableField: any = newSourceFields.find(
                            (item2) => item2.technical_name === item.name,
                        )
                        const formatData = formatFieldData(item)
                        const { data_type } = formatFieldData(item)
                        return {
                            ...pick(findTableField, keys),
                            ...formatData,
                            comment: findTableField?.description,
                            data_type,
                            data_length:
                                findTableField?.data_length ||
                                findTableField?.data_length === 0
                                    ? findTableField?.data_length
                                    : undefined,
                            precision:
                                (findTableField?.data_accuracy ||
                                    findTableField?.data_accuracy === 0) &&
                                findTableField?.data_accuracy !== -1
                                    ? findTableField?.data_accuracy
                                    : undefined,
                        }
                    }) || []

            setSourceInfo({
                datasource_id: source_info.datasource_id,
                datasource_type: source_info.datasource_type,
                datasource_name: source_detail.datasource_name,
                name: source_info.technical_name,
                catalog_id: implItem.catalog_id,
            })
            if (model === 'pushConfig') {
                setSourceData({
                    datasource_id: source_info.datasource_id,
                    datasource_type: source_info.datasource_type,
                    datasource_name: source_detail.datasource_name,
                    name: source_info.technical_name,
                    fields,
                    catalog_id: implItem.catalog_id,
                })
            }

            getTargetInfo(
                implItem.use_conf.dst_data_source_id,
                implItem.use_conf.dst_view_name,
                implItem.use_conf.dst_view_name ? undefined : fields,
                source_info.datasource_type,
            )
        } catch (err) {
            formatError(err)
        }
    }

    const getSourceFieldsMapping = async (
        sourceTableFields: any[],
        sourceConnectorName?: string,
        targetConnectorName?: string,
    ): Promise<any[]> => {
        if (
            !sourceTableFields?.length ||
            !sourceConnectorName ||
            !targetConnectorName
        ) {
            return []
        }
        try {
            // 组织数据转换的参数
            const toChangeSourceData: Array<IConnectorMapSourceType> =
                sourceTableFields.map((currentField, index) => ({
                    index,
                    sourceTypeName: currentField.data_type,
                    precision: currentField.data_length,
                    decimalDigits: currentField.precision,
                }))

            const mapRes = await getConnectorTypeMap({
                sourceConnectorName,
                targetConnectorName,
                type: toChangeSourceData,
            })
            // 变换转换后的数据格式
            const newMapData = mapRes?.type?.reduce((preData, currentData) => {
                const { index, ...rest } = currentData
                return {
                    ...preData,
                    [index]: rest,
                }
            }, {})
            // 回填转换后的数据组织成目标数据
            const newTargetData = sourceTableFields.map(
                (currentField, index) => ({
                    ...currentField,
                    data_length:
                        newMapData[index]?.precision ||
                        currentField.data_length,
                    precision:
                        newMapData[index]?.decimalDigits ||
                        currentField.precision,
                    data_type: newMapData[index].targetTypeName || 'undefined',
                    // unmapped: !newMapData[index].targetTypeName,
                }),
            )

            return newTargetData
        } catch (error) {
            formatError(error)
            return []
        }
    }
    /**
     * 获取目标数据信息
     * @param datasourceId 数据源id
     * @param dst_view_name 目标库表名称
     * @param fields 目标字段 如果是新建表 则以源表字段 当作 目标表字段
     */
    const getTargetInfo = async (
        datasourceId,
        dst_view_name,
        fields,
        sourceInfoType,
    ) => {
        // 如果目标库表名称存在，则获取目标数据信息 不存在则为新建表
        let targetFields: IDataFormField[] = []
        let formatFields
        const targetDetail = await getDataBaseDetails(datasourceId)
        if (dst_view_name) {
            targetFields = await getDataFormFields(dst_view_name, datasourceId)
        } else {
            formatFields = await getSourceFieldsMapping(
                fields,
                sourceInfoType,
                targetDetail.type,
            )
        }

        setTargetData({
            datasource_name: targetDetail.name,
            datasource_id: datasourceId,
            name: dst_view_name || `${implItem?.view_tech_name}${Date.now()}`,
            datasource_type: targetDetail.type,
            fields:
                formatFields ||
                targetFields.map((item) => {
                    const newItem = formatFieldData(item)
                    return {
                        ...newItem,
                        technical_name: item.name,
                    }
                }),
        })
    }

    const getItemContent = (configs: any, groupKey?: string) => {
        return (
            <Col span={configs.span} style={{ display: 'flex' }}>
                <span className={styles.labelWrapper}>{configs.label}</span>
                <span>{configs.value || '--'}</span>
                {groupKey === 'target_info' && configs.key === 'name' && (
                    <div
                        className={
                            implItem.use_conf.dst_view_name
                                ? styles.existTableTipContainer
                                : styles.newTableTipContainer
                        }
                    >
                        {implItem.use_conf.dst_view_name
                            ? __('已有表')
                            : __('新建表')}
                    </div>
                )}
            </Col>
        )
    }

    const pushConfigContent = (configs: any) => {
        switch (configs.key) {
            case 'source_info':
                return (
                    <Row gutter={[16, 16]}>
                        {configs.configs.map((item) => {
                            const configInfo = {
                                ...item,
                                value: sourceInfo?.[item.key] || '--',
                            }
                            return getItemContent(configInfo)
                        })}
                    </Row>
                )
            case 'target_info':
                return (
                    <Row gutter={[16, 16]}>
                        {configs.configs.map((item) => {
                            const configInfo = {
                                ...item,
                                value: targetData?.[item.key] || '--',
                            }
                            return getItemContent(configInfo, 'target_info')
                        })}
                    </Row>
                )
            case 'push_field':
                return model === 'detail' ? (
                    <PushFieldDetail
                        sourceFields={sourceData?.fields || []}
                        targetFields={pushFields || []}
                    />
                ) : (
                    <PushField
                        isCreate={!implItem.use_conf.dst_view_name}
                        sourceFields={sourceData?.fields || []}
                        targetFields={
                            implItem.use_conf.dst_view_name
                                ? targetData?.fields || []
                                : sourceData?.fields || []
                        }
                        pushFields={pushFields}
                        ignoreRule={false}
                        desensitizationRule={desensitizationRule}
                        setDesensitizationRule={setDesensitizationRule}
                        setPushFields={(value) => {
                            // setSourceFields(
                            //     sourceFields.map((item) => {
                            //         const foundField = value.find(
                            //             (item2) =>
                            //                 item.id === item2.source_field_id,
                            //         )
                            //         if (foundField) {
                            //             return {
                            //                 ...item,
                            //                 selected_flag: true,
                            //             }
                            //         }
                            //         return item
                            //     }),
                            // )
                            setPushFields(value)
                        }}
                        ref={pushFieldRef}
                    />
                )
            case 'push_strategy':
                return model === 'detail' ? (
                    pushStrategyDetail()
                ) : (
                    <IncrementalForm
                        form={incrementalForm}
                        fieldList={sourceFields || []}
                    />
                )
            case 'filter_rule':
                return model === 'detail' ? (
                    sqlScript ? (
                        <div className={styles.filterRule}>
                            <Editor
                                style={{ maxHeight: 320, overflow: 'scroll' }}
                                grayBackground
                                highlightActiveLine={false}
                                value={getFormatSql(sqlScript)}
                                editable={false}
                                readOnly
                            />
                        </div>
                    ) : (
                        '--'
                    )
                ) : (
                    <FilterRuleEditor
                        ref={sqlScriptRef}
                        value={sqlScript}
                        onChange={setSqlScript}
                        fieldList={sourceData?.fields || []}
                        dataViewId={dataViewId}
                    />
                )
            case 'push_frequency':
                return model === 'detail' ? (
                    schedulePlanDetail()
                ) : (
                    <SchedulePlanForm
                        form={schedulePlanForm}
                        fields={sourceData?.fields || []}
                    />
                )
            default:
                return <div>{configs.label}</div>
        }
    }

    /**
     * 推送机制详情
     * @returns
     */
    const pushStrategyDetail = () => {
        const adaptiveData = pushMechanism
            .filter((item) => !item.hidden?.(pushDetails))
            .map((item) => {
                const newItem = clone(item)
                newItem.value = pushDetails?.[newItem.key]
                if (item.render) {
                    newItem.render = () =>
                        item.render(pushDetails?.[newItem.key], pushDetails)
                }
                return {
                    ...newItem,
                    hidden: false,
                    labelStyles: {
                        color: 'rgb(0 0 0 / 45%)',
                    },
                }
            })
        return (
            <DetailsLabel
                wordBreak
                detailsList={adaptiveData as IDetailsLabel[]}
                labelWidth="108px"
                overflowEllipsis={false}
            />
        )
    }

    const schedulePlanDetail = () => {
        const adaptiveData = schedulePlan
            .filter((item) => !item.hidden?.(pushDetails))
            .map((item) => {
                const newItem = clone(item)
                newItem.value = pushDetails?.[newItem.key]
                if (item.render) {
                    newItem.render = () =>
                        item.render(pushDetails?.[newItem.key], pushDetails)
                }
                return {
                    ...newItem,
                    hidden: false,
                    labelStyles: {
                        color: 'rgb(0 0 0 / 45%)',
                    },
                }
            })
        return (
            <DetailsLabel
                wordBreak
                detailsList={adaptiveData as IDetailsLabel[]}
                labelWidth="108px"
                overflowEllipsis={false}
            />
        )
    }

    const getSchedulePlanItem = (itemConfig, scheduleData) => {
        switch (itemConfig.key) {
            case 'schedule_type':
                return (
                    <span>
                        {scheduleData?.schedule_start
                            ? formatTime(
                                  targetData.schedule_start * 1000,
                                  'YYYY-MM-DD',
                              )
                            : '--'}
                        <span className={styles.arrow}> ⇀ </span>
                        {scheduleData?.schedule_end
                            ? formatTime(
                                  targetData.schedule_end * 1000,
                                  'YYYY-MM-DD',
                              )
                            : '--'}
                    </span>
                )
            case 'plan_month':
                return (
                    <TagsView
                        data={scheduleData?.plan_month?.map(
                            (item) => `${item}${__('月')}`,
                        )}
                    />
                )
            case 'plan_day':
                return (
                    <TagsView
                        data={scheduleData?.plan_day?.map(
                            (item) => `${item}${__('日')}`,
                        )}
                    />
                )
            default:
                return <span>{scheduleData?.[itemConfig.key]}</span>
        }
    }

    const pushConfigContainer = (configs: any) => {
        return (
            <div className={styles.pushItemWrapper}>
                <div className={styles.title}>{configs.label}</div>
                <div>{pushConfigContent(configs)}</div>
            </div>
        )
    }

    /**
     * 获取组内容
     * @param groupKey 组key
     * @returns 组内容
     */
    const getGroupContent = (groupKey: string) => {
        switch (groupKey) {
            case ImplementGroupKeys.DATA_RESOURCE_INFO:
                return (
                    <Row gutter={[16, 16]}>
                        {ImplementGroupConfig[
                            ImplementGroupKeys.DATA_RESOURCE_INFO
                        ].map((item) => {
                            const configInfo = {
                                ...item,
                                value: dataResourceInfo?.[item.key] || '--',
                            }

                            return getItemContent(configInfo)
                        })}
                    </Row>
                )
            case ImplementGroupKeys.RESOURCE_USAGE_CONFIG:
                return (
                    <Row gutter={[16, 16]}>
                        {ImplementGroupConfig[
                            ImplementGroupKeys.RESOURCE_USAGE_CONFIG
                        ].map((item) => {
                            const configInfo = {
                                ...item,
                                value: resourceUsageInfo?.[item.key] || '--',
                            }
                            return getItemContent(configInfo)
                        })}
                    </Row>
                )
            case ImplementGroupKeys.DATA_PUSH_CONFIG:
                return (
                    <div className={styles.pushItemWrapper}>
                        {ImplementDataPushConfig.map((item) =>
                            pushConfigContainer(item),
                        )}
                    </div>
                )
            case ImplementGroupKeys.PUSH_STRATEGY:
                return (
                    <div className={styles.pushItemWrapper}>
                        {ImplementDataPushStrategy.map((item) =>
                            pushConfigContainer(item),
                        )}
                    </div>
                )
            default:
                return <div>--</div>
        }
    }

    const handleSaveAudit = (values) => {
        onConfirm?.(values)
    }

    // 检查表单数据
    const checkForm = async () => {
        const [incrementalValidate, schedulePlanValidate] =
            await Promise.allSettled([
                incrementalForm.validateFields(),
                schedulePlanForm.validateFields(),
            ])
        pushFieldRef.current.validate()
        if (pushFieldRef.current) {
            if (!pushFields.some((item) => item.selected_flag)) {
                document.getElementById('pushField')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                })
                message.error(__('请选择推送字段'))
                return false
            }
            const { validateStatus } = pushFieldRef.current.validate()
            if (!validateStatus) {
                document.getElementById('pushField')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                })
                return false
            }
        }
        if (incrementalValidate.status === 'rejected') {
            incrementalForm.scrollToField(
                incrementalValidate?.reason?.errorFields[0]?.name,
            )
            return false
        }
        if (schedulePlanValidate.status === 'rejected') {
            schedulePlanForm.scrollToField(
                schedulePlanValidate?.reason?.errorFields[0]?.name,
            )
            return false
        }
        return true
    }

    const handlePublish = async () => {
        try {
            const check = await checkForm()
            if (!check) {
                return
            }
            const incrementalFormInfo = incrementalForm.getFieldsValue()
            const schedulePlanValues = schedulePlanForm.getFieldsValue()
            // 推送机制
            const { increment_timestamp, transmit_mode, primary_key } =
                incrementalFormInfo
            const {
                schedule_time,
                plan_date,
                schedule_execute_status,
                ...other3
            } = schedulePlanValues

            const pushParams = {
                channel: 2,
                name: `${implItem.view_busi_name}数据推送`,
                description: '',
                push_status: 0,
                target_table_exists: true,
                ...incrementalFormInfo,
                primary_key: primary_key ? primary_key.join(',') : undefined,
                increment_timestamp: increment_timestamp
                    ? moment(increment_timestamp).unix()
                    : transmit_mode === TransmitMode.Incremental
                    ? moment().unix()
                    : undefined,
                ...other3,
                schedule_time: schedule_time
                    ? moment(schedule_time).format('YYYY-MM-DD HH:mm:ss')
                    : undefined,
                schedule_start: plan_date?.[0]
                    ? moment(plan_date[0]).format('YYYY-MM-DD')
                    : undefined,
                schedule_end: plan_date?.[1]
                    ? moment(plan_date[1]).format('YYYY-MM-DD')
                    : undefined,
                target_datasource_id: targetData?.datasource_id,
                source_catalog_id:
                    sourceInfo?.catalog_id || sourceData?.catalog_id,

                target_table_name: targetData?.name,
                filter_condition: sqlScript,
                sync_model_fields: pushFields
                    .filter((item) => item.selected_flag)
                    .map((item) => {
                        return {
                            ...omit(item, [
                                'selected_flag',
                                'errorTips',
                                'original_data_type',
                                'id',
                                'source_field_id',
                            ]),
                            source_tech_name: sourceData?.fields.find(
                                (item2) => item2.id === item.source_field_id,
                            )?.technical_name,
                        }
                    }),
            }
            const res = await dataAnalDataPush(applyId, {
                id: implItem.id,
                params: JSON.stringify(pushParams),
            })
            message.success('数据推送配置成功')
            onClose()
            onOk?.(res)
        } catch (err) {
            formatError(err)
        }
    }

    return (
        <Drawer
            open={open}
            width={isConfirmPlan ? '85%' : '100%'}
            placement="right"
            closable={false}
            bodyStyle={{
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 1080,
            }}
            contentWrapperStyle={{ minWidth: 800 }}
            destroyOnClose
            maskClosable={false}
            mask={false}
            push={false}
        >
            <div className={classnames(styles['push-config-wrapper'])}>
                <DrawerHeader
                    title={__('数据推送配置')}
                    fullScreen
                    onClose={onClose}
                />

                {/* 内容 */}
                <div className={styles.bottom}>
                    <div className={styles.content}>
                        <div className={styles['content-body']}>
                            {rejectReason && (
                                <div className={styles.rejectInfoWrapper}>
                                    <div className={styles.icon}>
                                        <InfoCircleFilled />
                                    </div>
                                    <div className={styles.contentWrapper}>
                                        <div className={styles.title}>
                                            {__('驳回说明')}
                                        </div>
                                        <div>{rejectReason}</div>
                                    </div>
                                </div>
                            )}
                            {ImplementStatusConfig.map((item) => (
                                <div
                                    className={styles['common-title']}
                                    key={item.key}
                                >
                                    <CommonTitle title={item.label} />
                                    <div className={styles.groupContainer}>
                                        {getGroupContent(item.key)}
                                    </div>
                                </div>
                            ))}

                            {isConfirmPlan && !isViewPlan && (
                                <div className={styles['confirm-form-wrapper']}>
                                    <div className={styles.splitLine} />
                                    <div>
                                        <Form
                                            form={auditForm}
                                            layout="vertical"
                                            onFinish={handleSaveAudit}
                                        >
                                            <Form.Item
                                                label={__('审核意见')}
                                                required
                                                name="solution_confirm_result"
                                                initialValue="pass"
                                            >
                                                <Radio.Group>
                                                    <Radio value="pass">
                                                        {__('通过')}
                                                    </Radio>
                                                    <Radio value="reject">
                                                        {__('驳回')}
                                                    </Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                            <Form.Item name="solution_confirm_remark">
                                                <Input.TextArea
                                                    maxLength={300}
                                                    style={{
                                                        resize: 'none',
                                                        height: 100,
                                                    }}
                                                    showCount
                                                />
                                            </Form.Item>
                                        </Form>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 底部栏 */}
                        {model === 'pushConfig' && (
                            <div className={styles.footer}>
                                <Space>
                                    <Button
                                        className={styles.btn}
                                        onClick={() => {
                                            onClose?.()
                                        }}
                                    >
                                        {__('取消')}
                                    </Button>
                                    <Button
                                        type="primary"
                                        className={styles.btn}
                                        // loading={saveLoading}
                                        onClick={() => {
                                            handlePublish()
                                        }}
                                    >
                                        {__('提交')}
                                    </Button>
                                </Space>
                            </div>
                        )}
                        {isConfirmPlan && !isViewPlan && (
                            <div className={styles.footer}>
                                <Space>
                                    <Button
                                        className={styles.btn}
                                        onClick={() => {
                                            onClose?.()
                                        }}
                                    >
                                        {__('取消')}
                                    </Button>
                                    <Button
                                        type="primary"
                                        className={styles.btn}
                                        // loading={saveLoading}
                                        onClick={() => {
                                            auditForm.submit()
                                        }}
                                    >
                                        {__('确定')}
                                    </Button>
                                </Space>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Drawer>
    )
}

export default PushConfig
