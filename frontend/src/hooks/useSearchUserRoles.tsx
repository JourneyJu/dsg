// import { useEffect, useMemo, useState } from 'react'
// import { has } from 'lodash'
// import { allRoleList, formatError, getCurUserRoles, getRoleList } from '@/core'
// import { useCurrentUser } from './useCurrentUser'
// import { RoleColored } from '@/icons'
// import { loginRoutePath } from '@/routers/config'
// import { getInnerUrl } from '@/utils'

// export enum HasAccess {
//     isHasBusiness = 'isHasBusiness',
//     // 是否是资源owner，启用包含特殊情况用户是应用开发者，但之前被赋予了owner角色并将资源owner设置为当前用户
//     isOwner = 'isHasDownloadPermisOper',
// }

// const HasAccessRolesIds = {
//     [HasAccess.isHasBusiness]: [
//         allRoleList.TCNormal,
//         allRoleList.TCDataButler,
//         allRoleList.TCDataGovernEngineer,
//         allRoleList.TCDataOperationEngineer,
//         allRoleList.TCDataOwner,
//     ],
//     [HasAccess.isOwner]: [
//         allRoleList.TCNormal,
//         allRoleList.TCDataButler,
//         allRoleList.TCDataGovernEngineer,
//         allRoleList.TCDataOperationEngineer,
//         allRoleList.TCDataOwner,
//         allRoleList.ApplicationDeveloper,
//     ],
// }

// let globalUserRoles: Array<any> = []
// let pendingPromise: Promise<any> | null = null

// /**
//  * 自定义钩子，用于获取当前用户的角色信息
//  * @param userRoleName 用户角色名称，可选参数，默认为空字符串
//  * @returns 返回一个元组，第一个元素是需要的角色数组或者undefined，第二个元素是用户的所有角色数组
//  */
// export const useSearchUserRoles = (
//     userRoleIdOrRoles: string = '',
// ): [Array<any> | undefined | null, Array<any>] => {
//     // 定义状态变量userRoles，用于存储用户的所有角色信息
//     const [userRoles, setUserRoles] = useState<Array<any>>(globalUserRoles)
//     // 定义状态变量needUserRoles，用于存储用户需要的角色信息
//     const [needUserRoles, setNeedUserRoles] = useState<
//         Array<any> | undefined | null
//     >(null)
//     // 使用自定义钩子useCurrentUser获取当前用户的ID
//     const [userId] = useCurrentUser('ID')
//     const pathname = getInnerUrl(window.location.pathname)

//     /**
//      * 根据会话存储获取用户角色信息
//      */
//     const getRolesBySession = () => {
//         // 尝试从会话存储中获取用户角色信息
//         const sessionUserRoles = sessionStorage.getItem('AFUserRoles')
//         const currentUserRoles =
//             sessionUserRoles && JSON.parse(sessionUserRoles)?.[userId]

//         // 如果从会话存储中获取到当前用户的角色信息，则更新状态
//         if (currentUserRoles) {
//             setUserRoles(currentUserRoles)
//             globalUserRoles = currentUserRoles
//         } else {
//             // 否则，从服务器获取角色信息
//             getRolesByServer()
//         }
//     }

//     /**
//      * 从服务器获取当前用户的角色信息
//      */
//     const getRolesByServer = async () => {
//         if (loginRoutePath.includes(pathname)) {
//             return
//         }
//         pendingPromise = getCurUserRoles()
//             .then((res) => {
//                 // 处理服务器返回的角色信息，将其转换为所需的格式
//                 const roles = res.map((current) => ({
//                     id: current.id,
//                     name: current.name,
//                 }))
//                 // 更新用户角色状态，并将角色信息存储到会话存储中
//                 setUserRoles(roles)
//                 globalUserRoles = roles
//                 if (userId) {
//                     sessionStorage.setItem(
//                         'AFUserRoles',
//                         JSON.stringify({ [userId]: roles }),
//                     )
//                 }
//                 return res
//             })
//             .catch((err) => {
//                 // 处理错误
//                 formatError(err)
//                 return null
//             })
//     }

//     /**
//      * 根据给定的键搜索角色
//      *
//      * 此函数旨在从用户角色列表中查找与给定键匹配的角色它接受一个参数`key`，
//      * 该参数表示要搜索的角色的ID如果找到匹配的角色，则将其设置为`needUserRoles`状态变量
//      *
//      * @param key 要搜索的角色ID
//      */
//     const searchRoles = (key) => {
//         if (key) {
//             // 查找ID与给定键匹配的角色
//             if (has(HasAccessRolesIds, key)) {
//                 const foundRoles = userRoles.filter((role) => {
//                     return HasAccessRolesIds[key].includes(role.id)
//                 })
//                 setNeedUserRoles(
//                     foundRoles.length
//                         ? foundRoles
//                         : userRoles.length
//                         ? undefined
//                         : null,
//                 )
//             } else {
//                 const foundRole = userRoles.find((role) => key === role.id)
//                 // 将找到的角色设置为需要的角色
//                 setNeedUserRoles(
//                     foundRole
//                         ? [foundRole]
//                         : userRoles.length
//                         ? undefined
//                         : null,
//                 )
//             }
//         } else {
//             setNeedUserRoles(userRoles.length ? userRoles : null)
//         }
//     }

//     useEffect(() => {
//         searchRoles(userRoleIdOrRoles)
//     }, [userRoleIdOrRoles, userRoles])

//     // 在组件挂载时，从会话存储或服务器获取用户角色信息
//     useEffect(() => {
//         if (pendingPromise) {
//             pendingPromise.then(() => {
//                 setUserRoles(globalUserRoles)
//             })
//         } else {
//             getRolesBySession()
//         }
//     }, [])

//     // 使用 useMemo 钩子优化性能，只有当 needUserRoles 或 userRoles 变化时才重新计算
//     return useMemo(() => [needUserRoles, userRoles], [needUserRoles, userRoles])
// }
