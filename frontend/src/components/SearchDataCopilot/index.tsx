import React, { useState, useEffect, useMemo } from 'react'
import { Drawer, Image } from 'antd'
import { MessageOutlined } from '@ant-design/icons'
import Cookies from 'js-cookie'
// 使用 @kweaver-ai/chatkit 的 Assistant 组件作为 Copilot 实现
// 注：文档中提到的 Copilot 组件，实际在包中导出为 Assistant
import { Copilot, type CopilotProps } from '@kweaver-ai/chatkit'
import qaColored from '@/assets/qaColored.png'
import { useMicroAppProps } from '@/context'
import { getSearchAgentInfo } from '@/core/apis/afSailorService'
import { Loader } from '@/ui'
import styles from './styles.module.less'

const SearchDataCopilot: React.FC = () => {
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [agentInfo, setAgentInfo] = useState<{
        adp_agent_key: string
        adp_business_domain_id: string
    } | null>(null)
    const { microAppProps } = useMicroAppProps()

    // 获取 token，参考 Chatkit 组件的实现
    const { assistantToken, assistantRefreshToken } = useMemo(() => {
        const accessTokenFromMicroApp = microAppProps.props?.token?.accessToken
        const refreshTokenFromMicroApp =
            microAppProps.props?.token?.refreshToken

        const token =
            accessTokenFromMicroApp || Cookies.get('af.oauth2_token') || ''

        return {
            assistantToken: token,
            assistantRefreshToken: refreshTokenFromMicroApp
                ? async () => {
                      const res = await refreshTokenFromMicroApp()
                      return res?.accessToken || ''
                  }
                : undefined,
        }
    }, [microAppProps?.token])

    // 获取 Agent 信息
    useEffect(() => {
        if (visible && !agentInfo) {
            setLoading(true)
            getSearchAgentInfo()
                .then((res) => {
                    setAgentInfo(res.res)
                })
                .catch((err) => {
                    // 获取 Agent 信息失败，错误信息已在控制台输出
                    // eslint-disable-next-line no-console
                    console.error('获取 Agent 信息失败:', err)
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }, [visible])

    // 关闭抽屉时清空 agentInfo，下次打开时重新获取
    useEffect(() => {
        if (!visible) {
            setAgentInfo(null)
        }
    }, [visible])

    const baseUrl = `${window.location.origin}/api/agent-app/v1`

    const handleToggle = () => {
        setVisible(!visible)
    }

    const handleClose = () => {
        setVisible(false)
    }

    return (
        <>
            {/* 固定按钮 */}
            <div className={styles.fixedButton} onClick={handleToggle}>
                <Image src={qaColored} preview={false} />
            </div>

            {/* Copilot 抽屉 */}
            <Drawer
                open={visible}
                onClose={handleClose}
                placement="right"
                width={480}
                maskClosable={false}
                closable
                destroyOnClose={false}
                getContainer={false}
                className={styles.copilotDrawer}
                bodyStyle={{
                    padding: 0,
                    height: '100%',
                }}
            >
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Loader tip="加载中..." />
                    </div>
                ) : agentInfo ? (
                    <div className={styles.copilotContainer}>
                        {React.createElement(
                            Copilot as any,
                            {
                                title: '数据搜索助手',
                                visible: true,
                                baseUrl,
                                agentKey: agentInfo.adp_agent_key,
                                token: assistantToken,
                                refreshToken: assistantRefreshToken,
                                businessDomain:
                                    agentInfo.adp_business_domain_id,
                            } as CopilotProps,
                        )}
                    </div>
                ) : (
                    <div className={styles.errorContainer}>
                        <p>获取 Agent 信息失败，请稍后重试</p>
                    </div>
                )}
            </Drawer>
        </>
    )
}

export default SearchDataCopilot
