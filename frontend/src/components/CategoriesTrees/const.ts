import { ICategoryItem, SystemCategory } from '@/core'

/**
 * 所有树的枚举
 */
export enum CategoriesTreeType {
    // 系统部门树
    SystemDeparetment = 'system_department',

    // 系统主题域
    SystemSubjectDomain = 'system_subject_domain',

    // 系统信息系统
    SystemInfomationSystem = 'system_infomation_system',

    // 自定义类目
    CustomerCategory = 'customer_category',
}

// 类目树的显示
export interface ICategoryItemTree extends ICategoryItem {
    // 树类型
    treeType: CategoriesTreeType
}

/**
 * 数据格式化
 */
export const categoryFomat = (
    data: Array<ICategoryItem>,
): Array<ICategoryItemTree> => {
    return data.map((currentData) => {
        switch (true) {
            case currentData.id === SystemCategory.Organization:
                // 组织部门类目数据
                return {
                    ...currentData,
                    treeType: CategoriesTreeType.SystemDeparetment,
                }
            case currentData.id === SystemCategory.SubjectDomain:
                // 主题组织树
                return {
                    ...currentData,
                    treeType: CategoriesTreeType.SystemSubjectDomain,
                }
            case currentData.id === SystemCategory.InformationSystem:
                // 信息系统组织树
                return {
                    ...currentData,
                    treeType: CategoriesTreeType.SystemInfomationSystem,
                }
            default:
                // 自定义类目树
                return {
                    ...currentData,
                    treeType: CategoriesTreeType.CustomerCategory,
                }
        }
    })
}
