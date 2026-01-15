import { Architecture } from '../ResourcesDir/const'
import __ from './locale'

export enum TabKey {
    DepartmentResources = 'department_resources',
    AuthorizedResources = 'authorized_resources',
}

export const tabItems = [
    {
        key: TabKey.DepartmentResources,
        label: __('本部门数据资源目录'),
        title: __('本部门数据资源目录'),
    },
    {
        key: TabKey.AuthorizedResources,
        label: __('已授权目录'),
        title: __('已授权目录'),
    },
]

export const allNodeInfo = {
    name: __('全部'),
    id: '',
    path: '',
    type: Architecture.ALL,
}
