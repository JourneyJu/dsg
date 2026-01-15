/*
 * @Author: ju.zhao ju.zhao@aishu.cn
 * @Date: 2024-01-25 17:07:52
 * @LastEditors: ju.zhao ju.zhao@aishu.cn
 * @LastEditTime: 2024-01-25 17:07:52
 * @FilePath: /AnyFabrik/any-fabric-front-end/src/components/AutoFormView/helper.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { ReactNode } from 'react'

/**
 * 展示组件类型
 */
enum DisplayInfoComponentType {
    // 文本组件
    Text = 'text',

    // 判断组件
    BooleanText = 'booleanText',

    // 文本域组件
    AreaText = 'areaText',

    // 选择框内容
    SelectText = 'selectText',

    // tag显示组件
    TagText = 'TagText',

    // 组集合
    GroupType = 'groupType',

    // 自定义
    Custom = 'custom',

    // 组集合2
    GroupType2 = 'groupType2',
}

export { DisplayInfoComponentType }
