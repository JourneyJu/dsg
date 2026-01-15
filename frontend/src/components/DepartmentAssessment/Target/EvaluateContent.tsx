import { Input } from 'antd'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import styles from './styles.module.less'
import __ from '../locale'

interface EvaluateContentProps {
    initContent: string
}
const EvaluateContent = forwardRef(
    ({ initContent }: EvaluateContentProps, ref) => {
        const [evaluateContent, setEvaluateContent] = useState('')

        useImperativeHandle(ref, () => ({
            getEvaluateContent: () => evaluateContent,
        }))

        useEffect(() => {
            if (initContent) {
                setEvaluateContent(initContent)
            }
        }, [initContent])

        return (
            <div className={styles['evaluate-content-wrapper']}>
                <div className={styles['evaluate-content-title']}>
                    {__('评价内容')}
                </div>
                <Input.TextArea
                    placeholder={__('请输入评价内容')}
                    className={styles['evaluate-content-textarea']}
                    value={evaluateContent}
                    showCount
                    maxLength={800}
                    onChange={(e) => {
                        setEvaluateContent(e.target.value)
                    }}
                />
            </div>
        )
    },
)

export default EvaluateContent
