import React, { useEffect, useState } from 'react'
import { message, Upload } from 'antd'
import type { RcFile } from 'antd/es/upload/interface'
import classnames from 'classnames'
import background from '@/assets/defaultCover.png'
import { uploadProjectCover, formatError, messageError } from '@/core'
import styles from './styles.module.less'
import { ProjectStatus } from './types'
import __ from './locale'
import { FontIcon, RecycleBinOutlined } from '@/icons'
import { getOssResourceUrl } from '@/utils'

interface IProjectCover {
    value?: string
    status?: ProjectStatus
    isThirdParty?: boolean
    onChange?: (value: string) => void
}

const ProjectCover: React.FC<IProjectCover> = ({
    value,
    status,
    isThirdParty,
    onChange,
}) => {
    const [isHover, setIsHover] = useState(false)
    const [data, setData] = useState<string>()
    const [isloadError, setIsLoadError] = useState(false)
    const [imageUrl, setImageUrl] = useState('')

    const getImage = async (id: string) => {
        const url = await getOssResourceUrl(id)
        setImageUrl(url)
    }

    useEffect(() => {
        setData(value)
        if (value) {
            getImage(value)
        }
    }, [value])

    const beforeUpload = async (file: RcFile) => {
        const isJpgOrPng = ['image/jpeg', 'image/png', 'image/jpg'].includes(
            file.type,
        )
        const isLt1M = file.size / 1024 / 1024 < 1

        if (!isJpgOrPng || !isLt1M) {
            messageError(__('仅支持JPG、JPEG、PNG格式，且大小不可超过1M'))
            return false
        }
        const fileList = [file]
        const formData = new FormData()
        fileList.forEach((f) => {
            formData.append('file', f as RcFile)
        })
        try {
            const res = await uploadProjectCover(formData)
            onChange?.(res.uuid)
        } catch (error) {
            formatError(error)
        }

        return false
    }

    return (
        <div className={styles.projectCover}>
            <div
                className={styles.coverWrapper}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
            >
                {isHover && data && status !== ProjectStatus.COMPLETED && (
                    <div
                        className={styles.coverMask}
                        onClick={() => {
                            setData(undefined)
                            onChange?.('')
                            message.success(__('恢复成功'))
                        }}
                    >
                        {__('恢复默认封面')}
                    </div>
                )}
                <img
                    alt="project"
                    // `/api/task-center/v1/oss/${data}`
                    src={
                        data && !isloadError && imageUrl ? imageUrl : background
                    }
                    height={130}
                    width={200}
                    className={data ? styles.projectImg : undefined}
                    onErrorCapture={() => setIsLoadError(true)}
                />
                <div className={styles.thirdPartyTag} hidden={!isThirdParty}>
                    <FontIcon
                        name="icon-guanlianweibiao"
                        style={{ fontSize: 10 }}
                    />
                    {__('来自第三方')}
                </div>
            </div>

            <div className={styles.upload}>
                <Upload
                    disabled={status === ProjectStatus.COMPLETED}
                    name="cover"
                    accept=".jpg,.jpeg,.png"
                    className="avatar-uploader"
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                >
                    <div
                        className={classnames(
                            styles.uploadBtn,
                            status === ProjectStatus.COMPLETED &&
                                styles.disableUploadBtn,
                        )}
                    >
                        {__('设置封面')}
                    </div>
                </Upload>
                <div className={styles.uploadTip}>
                    {__('（封面支持JPG、JPEG、PNG格式，且大小不可超过1M）')}
                </div>
            </div>
        </div>
    )
}

export default ProjectCover
