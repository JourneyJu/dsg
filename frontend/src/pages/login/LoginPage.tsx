import { useEffect } from 'react'
import OAuthLogin from '@/components/OAuthLogin'

function LoginPage() {
    useEffect(() => {
        document.title = 'xx市数据资源管理平台'
    }, [])

    return <OAuthLogin />
}

export default LoginPage
