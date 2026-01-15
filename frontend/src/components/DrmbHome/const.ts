import { LoginPlatform } from '@/core'
import __ from './locale'
import businessAnalysis from '@/assets/homePage/businessAnalysis.jpg'
import businessApplication from '@/assets/homePage/businessApplication.jpg'
import capitalAnalysis from '@/assets/homePage/capitalAnalysis.jpg'
import dataResource from '@/assets/homePage/dataResource.jpg'

export const firstLineMenuKeys = {
    key: 'md-data-asset-manage',
}

export const secondLineMenuKeys = [
    {
        key: 'md-data-get',
        // ignoreKeys: ['frontMachineMgt'],
    },
    {
        key: 'md-data-process',
    },
    {
        key: 'md-data-understand',
    },
    {
        key: 'md-data-service',
    },
]

export const thirdLineMenuKeys = {
    key: 'md-operation-work-order',
}

export const fourthLineMenuKeys = {
    key: 'md-province',
}

export const personalCenterKeys = {
    key: 'md-personal-center',
}

/**
 * 快捷入口
 */
export const shortcutMenus = [
    {
        key: LoginPlatform.drmp,
        label: __('数据资源管理平台门户'),
        desc: __('服务超市的介绍'),
        colors: ['rgba(0, 198, 255, 1)', 'rgba(0, 148, 255, 1)'],
        bgColor: 'rgba(0, 148, 255, .65)',
        platform: LoginPlatform.drmp,
        bg: dataResource,
        icon: 'icon-pingtai',
    },
    {
        key: 'asset-view',
        label: __('资产全景分析'),
        desc: __('资产全景分析的介绍'),
        colors: ['rgba(190, 165, 255, .3)', 'rgba(144, 108, 255, .3)'],
        bgColor:
            'linear-gradient( 180deg, rgba(190, 165, 255, 0.195) 0%, rgba(144, 108, 255, 0.195) 100%)',
        isDeveloping: true,
        bg: capitalAnalysis,
        icon: 'icon-zichanquanjingmianxing',
    },
    {
        key: LoginPlatform.ca,
        label: __('业务认知应用平台'),
        desc: __('业务认知的介绍'),
        colors: ['#43E4CE', '#14CBB0'],
        bgColor:
            ' linear-gradient(  rgba(20, 203, 176, 1) 0%, rgba(67, 228, 206, 1) 100%)',
        platform: LoginPlatform.ca,
        bg: businessApplication,
        icon: 'icon-yingyong2',
    },
    {
        key: LoginPlatform.cd,
        label: __('业务认知分析平台'),
        desc: __('业务认知分析平台的介绍'),
        colors: ['rgba(120, 164, 255, 1)', 'rgba(88, 127, 255, 1)'],
        bgColor:
            'linear-gradient(  rgba(88, 127, 255, .65) 0%, rgba(120, 164, 255, .65) 100%)',
        platform: LoginPlatform.cd,
        bg: businessAnalysis,
        icon: 'icon-fenxi',
    },
]
