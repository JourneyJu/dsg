import { AuditStatus, AuditType } from '@/core'
import __ from './locale'
import styles from './styles.module.less'

export enum OpenCatlgAuditTabType {
    ToAudit = 'toAudit',
    Audited = 'audited',
}

export const tabItems = [
    { label: '待审核', key: OpenCatlgAuditTabType.ToAudit, children: '' },
    { label: '已审核', key: OpenCatlgAuditTabType.Audited, children: '' },
]

export const auditStatusList = [
    { label: __('待审核'), value: AuditStatus.TODO },
    { label: __('已通过'), value: AuditStatus.FULFILLED, bgColor: '#52C41B' },
    { label: __('已驳回'), value: AuditStatus.REJECTED, bgColor: '#E60012' },
    { label: __('审核中'), value: AuditStatus.PENDING },
]

export const auditTypeList = [
    { label: __('上线审核'), value: AuditType.OnlineAudit },
    { label: __('下线审核'), value: AuditType.OfflineAudit },
    { label: __('发布审核'), value: AuditType.PublishAudit },
]

/**
 * 显示审核状态
 * @param key 接口返回字段
 * @param useStrValue 是否使用strValue字段
 * @param 资源目录使用key，接口服务使用strValue
 * @returns
 */
export const getState = (key: string, data?: any[]) => {
    const list = data || auditTypeList

    const { label, bgColor = '#d8d8d8' } =
        list.find((item) => item.value === key) || {}

    return (
        <div className={styles.state}>
            <span className={styles.dot} style={{ background: bgColor }} />
            {label}
        </div>
    )
}

export const menus = [{ key: 'updated_at', label: __('按申请时间排序') }]

export const auditOpenCatlgInfos: any[] = [
    {
        label: __('开放目录名称：'),
        value: 'catalog_title',
    },
    {
        label: __('申请时间：'),
        value: 'apply_time',
        type: 'timestamp',
    },
]

export interface IOpenCatlgAuditItem {
    applier_id: string
    applier_name: string
    apply_code: string
    apply_time: number
    catalog_code: string
    catalog_id: string
    catalog_title: string
    id: string
}
