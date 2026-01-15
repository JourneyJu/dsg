import { formatTime } from '@/utils'
import { DownloadFile } from '../CitySharing/Details/helper'
import __ from './locale'
import {
    analysisConclusionConfig,
    commissionTypeOptions,
    outputTypeOptions,
} from './const'

export interface IFieldConfig {
    key: string
    label: string
    span: number
    title?: string
    render?: (va: any, record: any) => any
}

export const applyFieldsConfig: IFieldConfig[] = [
    {
        key: 'name',
        label: __('需求名称'),
        span: 12,
    },
    {
        key: 'code',
        label: __('需求编码'),
        span: 12,
    },
    {
        key: 'commission_type',
        label: __('委托方式'),
        span: 12,
        render: (val, record) =>
            commissionTypeOptions.find((item) => item.value === val)?.label,
    },
    {
        key: 'apply_org_name',
        label: __('申请部门'),
        span: 12,
        title: 'apply_org_path',
    },
    {
        key: 'contact',
        label: __('需求联系人'),
        span: 12,
    },
    {
        key: 'contact_phone',
        label: __('联系人电话'),
        span: 12,
    },
    {
        key: 'created_at',
        label: __('申请时间'),
        span: 12,
        render: (val, record) =>
            record.created_at ? formatTime(record.created_at) : '--',
    },
    {
        key: 'finish_date',
        label: __('期望完成时间'),
        span: 12,
        render: (val, record) =>
            record.finish_date
                ? formatTime(record.finish_date, 'YYYY-MM-DD')
                : '--',
    },
    {
        key: 'output_type',
        label: __('期望分析成果'),
        span: 24,
        render: (val, record) =>
            outputTypeOptions.find((item) => item.value === val)?.label,
    },
    {
        key: 'business_scene',
        label: __('业务场景描述'),
        span: 24,
    },
    {
        key: 'expect_effect',
        label: __('预期应用成效'),
        span: 24,
    },
    {
        key: 'attachments',
        label: __('附件'),
        span: 24,
        render: (attachments: { id: string; name: string }[], record: any) => {
            return attachments && attachments.length > 0
                ? attachments.map((attachment) => (
                      <DownloadFile
                          data={{
                              id: attachment.id,
                              name: attachment.name,
                          }}
                      />
                  ))
                : '--'
        },
    },
]

export const demandFieldsConfig: IFieldConfig[] = [
    {
        key: 'name',
        label: __('需求名称'),
        span: 12,
    },
    {
        key: 'code',
        label: __('需求编码'),
        span: 12,
    },
    {
        key: 'commission_type',
        label: __('委托方式'),
        span: 12,
        render: (val, record) =>
            commissionTypeOptions.find((item) => item.value === val)?.label,
    },
    {
        key: 'created_at',
        label: __('申请时间'),
        span: 12,
        render: (val, record) =>
            record.created_at ? formatTime(record.created_at) : '--',
    },
    {
        key: 'finish_date',
        label: __('期望完成时间'),
        span: 12,
        render: (val, record) =>
            record.finish_date
                ? formatTime(record.finish_date, 'YYYY-MM-DD')
                : '--',
    },
    {
        key: 'output_type',
        label: __('期望分析成果'),
        span: 24,
        render: (val, record) =>
            outputTypeOptions.find((item) => item.value === val)?.label,
    },
    {
        key: 'business_scene',
        label: __('业务场景描述'),
        span: 24,
    },
    {
        key: 'expect_effect',
        label: __('预期应用成效'),
        span: 24,
    },
    {
        key: 'attachments',
        label: __('附件'),
        span: 24,
        render: (attachments: { id: string; name: string }[], record: any) => {
            return attachments && attachments.length > 0
                ? attachments.map((attachment) => (
                      <DownloadFile
                          data={{
                              id: attachment.id,
                              name: attachment.name,
                          }}
                      />
                  ))
                : '--'
        },
    },
]

export const departmentFieldsConfig: IFieldConfig[] = [
    {
        key: 'apply_org_name',
        label: __('申请部门'),
        span: 12,
        title: 'apply_org_path',
    },
    {
        key: 'contact',
        label: __('需求联系人'),
        span: 12,
    },
    {
        key: 'contact_phone',
        label: __('联系人电话'),
        span: 12,
    },
]

export const feedbackFieldsConfig: IFieldConfig[] = [
    {
        key: 'feedback_content',
        label: __('服务成效'),
        span: 24,
    },
]
export const resInfoFieldsConfig: IFieldConfig[] = [
    {
        key: 'view_busi_name',
        label: __('数据资源名称'),
        span: 12,
        title: 'apply_org_path',
    },
    {
        key: 'view_code',
        label: __('编码'),
        span: 12,
    },
    {
        key: 'apply_org_name',
        label: __('所属部门'),
        span: 12,
    },
    {
        key: 'share_condition',
        label: __('共享条件'),
        span: 12,
    },
]

export const filterObj = (obj: any) => {
    return Object.assign(
        {},
        ...Object.keys(obj)
            .filter(
                (key) =>
                    obj[key] !== undefined &&
                    obj[key] !== null &&
                    obj[key] !== '',
            )
            .map((key) => ({ [key]: obj[key] })),
    )
}

export const analysisFieldsConfig = [
    {
        key: 'feasibility',
        label: __('分析结论'),
        value: '',
        span: 12,
        render: (val, record) =>
            analysisConclusionConfig.find(
                (item) => item.value === record.feasibility,
            )?.label,
    },
    {
        key: 'analyser_name',
        label: __('分析人'),
        value: '',
        span: 12,
    },
    {
        key: 'conclusion',
        label: __('分析及确认结果'),
        value: '',
        span: 24,
    },
]
