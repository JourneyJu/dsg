import __ from './locale'
import { cardList, initSearchCondition, whiteListOptions } from './const'
import { SearchType } from '@/components/SearchLayout/const'

export const searchFormInitData = [
    {
        label: __('子系统名称'),
        key: 'info_system_id',
        type: SearchType.InfoSystem,
        itemProps: {
            allowClear: true,
            placeholder: __('请选择'),
            mode: 'multiple',
            disableDetailFetch: true,
        },
    },
    {
        label: __('建设单位'),
        key: 'construction_unit',
        type: SearchType.DepartmentAndOrgSelect,
        itemProps: {
            allowClear: true,
            placeholder: __('请选择'),
        },
    },
    {
        label: (
            <span>
                <span style={{ color: 'rgb(230, 0, 19)' }}>*</span>
                {__('查询时间')}
            </span>
        ),
        key: 'queryTime',
        type: SearchType.RangePicker,
        itemProps: {
            format: 'YYYY-MM-DD',
        },
        startTime: 'start_date',
        endTime: 'end_date',
    },
    {
        label: __('验收时间'),
        key: 'acceptanceTime',
        type: SearchType.RangePicker,
        itemProps: {
            format: 'YYYY-MM-DD',
        },
        startTime: 'acceptance_start',
        endTime: 'acceptance_end',
    },
]

export const systemSearchFormInitData = [
    {
        label: __('表名称、表中文注释'),
        key: 'keyword',
        type: SearchType.Input,
        defaultValue: initSearchCondition.keyword,
        isAlone: true,
        itemProps: {
            maxLength: 255,
        },
    },
    {
        label: __('单位名称'),
        key: 'department_id',
        type: SearchType.DepartmentAndOrgSelect,
        itemProps: {
            allowClear: true,
            placeholder: __('请选择'),
        },
    },
    {
        label: __('系统名称'),
        key: 'info_system_id',
        type: SearchType.InfoSystem,
        itemProps: {
            allowClear: true,
            mode: 'multiple',
            disableDetailFetch: true,
            placeholder: __('请选择'),
        },
    },
    {
        label: (
            <span>
                <span style={{ color: 'rgb(230, 0, 19)' }}>*</span>
                {__('查询时间')}
            </span>
        ),
        key: 'queryTime',
        type: SearchType.RangePicker,
        itemProps: {
            format: 'YYYY-MM-DD',
        },
        startTime: 'start_date',
        endTime: 'end_date',
    },
    {
        label: __('验收时间'),
        key: 'acceptanceTime',
        type: SearchType.RangePicker,
        itemProps: {
            format: 'YYYY-MM-DD',
        },
        startTime: 'acceptance_start',
        endTime: 'acceptance_end',
    },
    {
        label: __('白名单'),
        key: 'is_whitelisted',
        type: SearchType.Select,
        itemProps: {
            placeholder: __('请选择'),
            options: whiteListOptions,
        },
    },
]

export const cardLabel = (text) => {
    const { label, color, bgColor } =
        cardList?.find((item) => item.value === text) || {}
    if (!label) {
        return text || '--'
    }
    return (
        <span
            style={{
                color,
                backgroundColor: bgColor,
                width: '60px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {label}
        </span>
    )
}
