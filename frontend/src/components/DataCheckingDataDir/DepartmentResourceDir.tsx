import ResourcesEdited from '../ResourcesDir/ResourcesEdited'
import { TableResourcesListType } from '../ResourcesDir/const'

interface IDepartmentResourceDir {
    selectedTreeNode: any
}

/**
 * 本部门数据资源目录
 * 基于 ResourcesEdited 组件，使用 DepartmentResourceDir 类型：
 * - 不显示新建和导入按钮
 * - 隐藏可信度评估列
 * - 详情跳转在新窗口打开
 */
const DepartmentResourceDir = (props: IDepartmentResourceDir) => {
    const { selectedTreeNode } = props

    return (
        <ResourcesEdited
            selectedTreeNode={selectedTreeNode}
            updateResourcesSum={() => {}}
            tableResourcesListType={
                TableResourcesListType.DepartmentResourceDir
            }
        />
    )
}

export default DepartmentResourceDir
