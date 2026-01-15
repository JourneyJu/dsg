import { FC, useMemo } from 'react'
import { CategoriesTreeType } from './const'
import OrganizationTree from '../OrganizationTree'
import { OriganizationType } from '../OrganizationTree/const'

interface ICategoryTree {
    // 类目树的类型
    categoryType: CategoriesTreeType

    // 类目树的id
    dataId: string

    needUncategorized?: boolean // 是否需要显示未分类
    unCategorizedKey?: string // 未分类的名称
}
// 获取组织树
const CategoryTree: FC<ICategoryTree> = ({
    categoryType,
    dataId,
    needUncategorized,
    unCategorizedKey,
}) => {
    const getCategoryTree = () => {
        switch (categoryType) {
            case CategoriesTreeType.SystemDeparetment:
                return (
                    <OrganizationTree
                        getSelectedNode={(sd) => {}}
                        isShowAll
                        isShowSearch
                        needUncategorized={needUncategorized}
                        unCategorizedKey={unCategorizedKey}
                    />
                )
            case CategoriesTreeType.SystemSubjectDomain:
                return <div>主题域树</div>
            case CategoriesTreeType.SystemInfomationSystem:
                return <div>信息系统树</div>
            case CategoriesTreeType.CustomerCategory:
                return <div>自定义树</div>
            default:
                return <div>不存在的树</div>
        }
    }
    return <div>{getCategoryTree()}</div>
}

export default CategoryTree
