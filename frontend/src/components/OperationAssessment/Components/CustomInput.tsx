import React from 'react'
import { Input, InputProps, Tooltip } from 'antd'
import classNames from 'classnames'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import styles from './styles.module.less'

interface CustomInputProps extends InputProps {
    /** 是否显示异常状态 */
    hasError?: boolean
    /** 异常状态下的提示信息 */
    errorMessage?: string
}

const CustomInput: React.FC<CustomInputProps> = ({
    hasError = false,
    errorMessage,
    suffix: originalSuffix,
    ...restProps
}) => {
    const suffix = hasError ? (
        <Tooltip
            title={
                <span style={{ color: 'rgba(0,0,0,0.85)' }}>
                    {errorMessage}
                </span>
            }
            placement="right"
            color="#fff"
        >
            <FontIcon
                name="icon-xinxitishi"
                type={IconType.FONTICON}
                className={styles['custom-input-error-icon']}
            />
        </Tooltip>
    ) : (
        originalSuffix
    )

    return (
        <Input
            {...restProps}
            className={classNames(
                styles['custom-input'],
                hasError && styles['custom-input-error'],
            )}
            suffix={suffix}
        />
    )
}

export default CustomInput
