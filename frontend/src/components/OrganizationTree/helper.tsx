import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { OriganizationType } from './const'

/**
 * 组织图标
 */
export const OriganizationNodeIcon = {
    // 组织图标
    [OriganizationType.Origanization]: (
        <FontIcon name="icon-zuzhi" type={IconType.FONTICON} />
    ),
    // 部门图标
    [OriganizationType.Department]: (
        <FontIcon name="icon-bumen" type={IconType.FONTICON} />
    ),
}
