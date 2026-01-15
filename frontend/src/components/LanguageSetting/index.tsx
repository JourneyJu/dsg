import { Select } from 'antd'
import { useContext } from 'react'
import { LanguageContext } from '@/context/LanguageProvider'

const { Option } = Select

function LanguageSetting() {
    const { language, setLanguage } = useContext(LanguageContext)
    const handleLanguageChange = (value: string) => {
        setLanguage(value)
    }
    return (
        <div>
            <Select
                defaultValue={language}
                style={{ width: 120 }}
                bordered={false}
                onSelect={handleLanguageChange}
            >
                <Option value="zh-cn">简体中文</Option>
                <Option value="zh-tw">繁體中文</Option>
                <Option value="en-us">English</Option>
            </Select>
        </div>
    )
}

export default LanguageSetting
