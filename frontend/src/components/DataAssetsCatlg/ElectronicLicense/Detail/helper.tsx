import Icon from '@ant-design/icons'
import __ from './locale'
import { DepartmentOutlined, FontIcon, ThemeOutlined } from '@/icons'
import styles from '../styles.module.less'
import { IconType } from '@/icons/const'
import { DivisionCodeList } from '@/components/ResourcesDir/const'

// 业务逻辑实体列表项参数
export const itemOtherInfo = [
    {
        infoKey: 'type',
        title: (
            <FontIcon
                name="icon-leixing"
                style={{ fontSize: 14 }}
                className={styles.commonIcon}
            />
        ),
        toolTipTitle: `${__('证件类型：')}`,
    },
    {
        infoKey: 'department',
        title: (
            <DepartmentOutlined
                className={styles.commonIcon}
                style={{ fontSize: 16 }}
            />
        ),
        toolTipTitle: `${__('管理部门：')}`,
    },
]

// 列表-库表卡片-参数详情项
export const cardBaiscInfoList = [
    {
        label: __('编码：'),
        value: '',
        key: 'code',
        span: 24,
    },
    {
        label: __('证件类型：'),
        value: '',
        key: 'type',
        span: 24,
    },
    {
        label: __('有效期'),
        value: '',
        key: 'expire',
        span: 24,
        // type: 'timestamp',
    },
]

export const basicInfoDetailsList = [
    {
        label: __('基本属性'),
        key: 'basic',
        list: [
            {
                label: __('证件类型'),
                value: '',
                key: 'type',
                span: 12,
            },

            {
                label: __('发证级别'),
                value: '',
                key: 'certification_level',
                span: 12,
            },
            {
                label: __('行业'),
                value: '',
                key: 'industry_department',
                span: 12,
            },
            {
                label: __('证照主体'),
                value: '',
                key: 'holder_type',
                span: 12,
            },
            {
                label: __('管理部门'),
                value: '',
                key: 'department',
                span: 12,
            },
            {
                label: __('有效期'),
                value: '',
                key: 'expire',
                span: 12,
            },
            {
                label: __('更新时间'),
                value: '',
                key: 'updated_at',
            },
        ],
    },
]
