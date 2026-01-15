import { useEffect, useState } from 'react'
import classnames from 'classnames'
import { Button, Radio, Space } from 'antd'
import __ from './locale'
import styles from './styles.module.less'
import { useGeneralConfig } from '@/hooks/useGeneralConfig'
import {
    formatError,
    SampleDataType,
    setGovernmentDataShare,
    settGeneralConfigUsing,
    updateGlobalConfigValue,
} from '@/core'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { useUserPermCtx } from '@/context/UserPermissionProvider'
import NumberInput from '@/ui/NumberInput'
import { NumberType } from '@/ui/NumberInput/const'

const InitConfig = ({ onClose }: { onClose: () => void }) => {
    const [using, setUsing] = useState<1 | 2>(1)
    // const [dataShare, setDataShare] = useState<string>('false')
    // const [localApp, setLocalApp] = useState<string>('false')

    const [generalConfig, updateInitGeneralConfig] = useGeneralConfig()
    const { checkPermission } = useUserPermCtx()
    const { Group } = Radio
    const [sampleDataCount, setSampleDataCount] = useState<string>('5')
    const [sampleDataType, setSampleDataType] = useState<SampleDataType>(
        SampleDataType.Synthetic,
    )

    useEffect(() => {
        if (checkPermission('manageGeneralConfig')) {
            if (generalConfig.using === 1 || generalConfig.using === 2) {
                onClose()
            }
        } else {
            onClose()
        }
    }, [generalConfig])

    /**
     *  保存配置
     * @param value
     */
    const setConfigUsing = async (value: 1 | 2) => {
        try {
            const configUpdates = [
                {
                    key: 'using',
                    value: using.toString(),
                },
                // {
                //     key: 'government_data_share',
                //     value: dataShare,
                // },
                // {
                //     key: 'local_app',
                //     value: localApp,
                // },
                {
                    key: 'sample_data_count',
                    value: sampleDataCount,
                },
                {
                    key: 'sample_data_type',
                    value: sampleDataType,
                },
            ]
            await Promise.all(configUpdates.map(updateGlobalConfigValue))
            updateInitGeneralConfig()
            window.location.reload()
        } catch (err) {
            formatError(err)
        }
    }

    return (
        <div className={styles.initContainer}>
            <div className={styles.title}>
                <div className={styles.text}>{__('初始设置')}</div>
                <div className={styles.description}>
                    {__('管理员您好，为了确保系统正常的运行，请进行以下配置：')}
                </div>
            </div>
            <div className={styles.selectContainer}>
                <div className={styles.configWrapper}>
                    <div className={styles.titleLabel}>
                        {__('1、请选以下一种数据资源管理方式：')}
                    </div>
                    <div className={styles.itemContainer}>
                        <div
                            className={classnames(
                                styles.initConfigItem,
                                using === 1
                                    ? styles.initConfigItemSelected
                                    : styles.initConfigItemUnselected,
                            )}
                            style={{ marginBottom: 16 }}
                            onClick={(e) => {
                                setUsing(1)
                            }}
                        >
                            <div className={styles.fontIcon}>
                                <FontIcon
                                    name="icon-shujumuluguanli1"
                                    type={IconType.COLOREDICON}
                                />
                            </div>
                            <div className={styles.text}>
                                <div>{__('数据资源目录')}</div>
                                <div className={styles.textContent}>
                                    {__(
                                        '启用后，数据资源需要通过数据编目才能在数据服务超市进行展示。',
                                    )}
                                </div>
                            </div>
                        </div>
                        <div
                            className={classnames(
                                styles.initConfigItem,
                                using === 2
                                    ? styles.initConfigItemSelected
                                    : styles.initConfigItemUnselected,
                            )}
                            onClick={(e) => {
                                setUsing(2)
                            }}
                        >
                            <div className={styles.fontIcon}>
                                <FontIcon
                                    name="icon-bendidaoruyewubiao"
                                    type={IconType.COLOREDICON}
                                />
                            </div>
                            <div className={styles.text}>
                                <div>{__('数据资源')}</div>
                                <div className={styles.textContent}>
                                    {__(
                                        '启用后，数据资源可发布、上线至数据服务超市进行展示。',
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {using === 1 && (
                    <Space size={12} direction="vertical">
                        {/* <div className={styles.configWrapper}>
                            <div className={styles.titleLabel}>
                                {__('2、是否开启「一体化政务数据共享」功能？')}
                            </div>
                            <div>
                                <span className={styles.description}>
                                    {__(
                                        '开启后，可实现与上级平台的数据共享，例如同步省级组织架构，数据目录的上报，资源的共享申请等…. 详见',
                                    )}
                                </span>
                                <Button
                                    type="link"
                                    onClick={() => {
                                        window.open(
                                            'https://docs.aishu.cn/help/anyfabric-enterprise-2',
                                        )
                                    }}
                                >
                                    {__('《帮助文档》')}
                                </Button>
                            </div>
                            <div>
                                <Group
                                    onChange={(e) => {
                                        setDataShare(e.target.value)
                                    }}
                                    value={dataShare}
                                >
                                    <Radio value="true">{__('是')}</Radio>
                                    <Radio value="false">{__('否')}</Radio>
                                </Group>
                            </div>
                        </div>
                        <div className={styles.configWrapper}>
                            <div className={styles.titleLabel}>
                                {__('3、是否开启「生成本地应用凭证」功能？')}
                            </div>
                            <div>
                                <span className={styles.description}>
                                    {__(
                                        '开启后，业务系统用户可以调用权限范围内的 Open API。',
                                    )}
                                </span>
                            </div>
                            <div>
                                <Group
                                    onChange={(e) => {
                                        setLocalApp(e.target.value)
                                    }}
                                    value={localApp}
                                >
                                    <Radio value="true">{__('是')}</Radio>
                                    <Radio value="false">{__('否')}</Radio>
                                </Group>
                            </div>
                        </div> */}
                        <div className={styles.sampleDataConfigWrapper}>
                            <div className={styles.titleLabel}>
                                {__('4、请设置服务超市样例数据：')}
                            </div>
                            <div>
                                <span className={styles.description}>
                                    {__('请选择服务超市样例数据条数。')}
                                </span>
                            </div>
                            <div className={styles.numberInputWrapper}>
                                <NumberInput
                                    type={NumberType.Natural}
                                    max={50}
                                    min={1}
                                    value={sampleDataCount}
                                    onChange={(value) => {
                                        setSampleDataCount(value.toString())
                                    }}
                                    placeholder={__('条数（1-50）')}
                                />
                                <span>{__('条')}</span>
                            </div>
                            <div>
                                <span className={styles.description}>
                                    {__('请选择服务超市样例数据展示方式。')}
                                </span>
                            </div>
                            <div>
                                <Group
                                    value={sampleDataType}
                                    onChange={(e) => {
                                        setSampleDataType(e.target.value)
                                    }}
                                >
                                    <Radio value={SampleDataType.Synthetic}>
                                        {__('合成数据')}
                                    </Radio>
                                    <Radio value={SampleDataType.Real}>
                                        {__('真实数据')}
                                    </Radio>
                                </Group>
                            </div>
                            <div>
                                <span className={styles.description}>
                                    {sampleDataType === SampleDataType.Synthetic
                                        ? __(
                                              '通过大模型的能力，参考真实数据特征，合成仿真数据',
                                          )
                                        : __(
                                              '涉密数据为全部脱敏，示例：**********，敏感数据为尾部脱敏，脱敏位数为数据总位数的一半，示例：1234****',
                                          )}
                                </span>
                            </div>
                        </div>
                    </Space>
                )}
            </div>
            <div className={styles.confirmButton}>
                <Button
                    onClick={() => {
                        setConfigUsing(using)
                        onClose()
                    }}
                    type="primary"
                >
                    {__('开启数据运营之旅 →')}
                </Button>
            </div>
        </div>
    )
}

export default InitConfig
