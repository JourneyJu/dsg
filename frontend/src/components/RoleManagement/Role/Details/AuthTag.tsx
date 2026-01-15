import classnames from 'classnames'
import styles from './styles.module.less'
import { PermissionScope } from '@/core'

interface IAuthTag {
    auth: any
    // 区分范围颜色
    diffScope?: boolean
}

export const AuthTag = ({ auth, diffScope = false }: IAuthTag) => {
    const { name, scope } = auth

    return (
        <div
            className={classnames(styles.authTag, {
                [styles.scopeBg]:
                    scope === PermissionScope.Organization && diffScope,
            })}
        >
            <span className={styles.authName} title={name}>
                {name}
            </span>
        </div>
    )
}

export default AuthTag
