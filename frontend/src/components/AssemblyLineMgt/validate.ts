import { trim } from 'lodash'
import { nameReg } from '@/utils'
import { assemblyLineCheckUniqueness } from '@/core/apis/assemblyLine'
import __ from './locale'

/**
 * 工作流程唯一性校验
 * @param fid string 工作流程ID
 * @returns
 */
export const validateAssemblyLineUniqueness = (fid?: string) => {
    return (_: any, value: string) => {
        return new Promise((resolve, reject) => {
            const trimValue = trim(value)
            if (!trimValue) {
                reject(new Error(__('输入不能为空')))
                return
            }
            // if (trimValue && !nameReg.test(trimValue)) {
            //     reject(new Error(__('仅支持中英文、数字、下划线及中划线')))
            //     return
            // }
            const errorMsg = __('该工作流程名称已存在，请重新输入')
            assemblyLineCheckUniqueness({
                name: value,
                flowchart_id: fid,
            })
                .then(() => {
                    resolve(1)
                })
                .catch(() => {
                    reject(new Error(errorMsg))
                })
        })
    }
}
