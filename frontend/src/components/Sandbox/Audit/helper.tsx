import { formatTime } from '@/utils'
import __ from '../locale'
import styles from './styles.module.less'

export const applyFieldsConfig = [
    {
        key: 'project_name',
        label: __('项目名称'),
        span: 24,
        render: (name) => <div className={styles['project-name']}>{name}</div>,
    },
    {
        key: 'applicant_name',
        label: __('申请人'),
        span: 24,
    },
    {
        key: 'applicant_phone',
        label: __('申请人电话'),
        span: 24,
    },
    {
        key: 'request_space',
        label: __('申请容量'),
        span: 24,
        render: (val) => (val ? `${val}G` : '--'),
    },
    {
        key: 'valid',
        label: __('有效期'),
        span: 24,
        render: (value, record) =>
            record.valid_start > 0 && record.valid_end > 0
                ? `${formatTime(record.valid_start)} - ${formatTime(
                      record.valid_end,
                  )}`
                : '--',
    },
    {
        key: 'reason',
        label: __('申请原因'),
        span: 24,
    },
]
