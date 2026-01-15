import React, { ReactNode, useContext } from 'react'
import { IntlProvider as ReactIntlProvider } from 'react-intl'
import { LanguageContext } from './LanguageProvider'

interface IIntlProvider {
    children: ReactNode
}

interface IMessage {
    [language: string]: {
        [id: string]: string
    }
}

// const messages: IMessage = {
//     'zh-cn': zh,
//     'zh-tw': tw,
//     'en-us': en,
// }

export const IntlProvider: React.FC<IIntlProvider> = ({ children }) => {
    const { language } = useContext(LanguageContext)
    return (
        <ReactIntlProvider
            // messages={messages[language]}
            locale={language}
            defaultLocale="zh-cn"
        >
            {children}
        </ReactIntlProvider>
    )
}
