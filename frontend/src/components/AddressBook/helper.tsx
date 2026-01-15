import { ExclamationCircleFilled } from '@ant-design/icons'
import dataEmpty from '@/assets/dataEmpty.svg'
import { SortDirection, SortType } from '@/core'
import { Empty, Loader } from '@/ui'
import { confirm } from '@/utils/modalHelper'
import __ from './locale'

/**
 * 通讯录菜单
 */
export enum AddressBookMenuEnum {
    // 通讯录管理
    List = 'list',
}

/**
 * 通讯录操作
 */
export enum AddressBookOperate {
    // 编辑
    Edit = 'Edit',
    // 删除
    Delete = 'Delete',
}

export const AddressBookTabMap = {
    [AddressBookMenuEnum.List]: {
        title: __('通讯录管理'),

        // 表格列名
        columnKeys: [
            'name',
            'department',
            'contact_phone',
            'contact_mail',
            'action',
        ],
        // 操作项映射
        actionMap: [AddressBookOperate.Edit, AddressBookOperate.Delete],
        // 操作栏宽度
        actionWidth: 138,
        // 默认表头排序
        defaultTableSort: { name: SortDirection.DESC },
        initSearch: {
            limit: 10,
            offset: 1,
            sort: SortType.NAME,
            direction: SortDirection.DESC,
        },
    },
}

/**
 * 空数据
 */
export const renderEmpty = (marginTop: number = 36) => (
    <Empty
        iconSrc={dataEmpty}
        desc={__('暂无数据')}
        style={{ marginTop, width: '100%' }}
    />
)

/**
 * 加载中
 */
export const renderLoader = (marginTop: number = 104) => (
    <div style={{ marginTop, width: '100%' }}>
        <Loader />
    </div>
)

// 统一的弹窗样式
export const getConfirmModal = ({ title, content, onOk }) => {
    return confirm({
        title,
        icon: <ExclamationCircleFilled style={{ color: '#FAAD14' }} />,
        content,
        onOk,
    })
}
