import React, { useContext, useEffect, useMemo, useState } from 'react'
import { FileZipOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, message, Upload, UploadProps } from 'antd'
import { RcFile } from 'antd/lib/upload'
import Cookies from 'js-cookie'
import styles from './styles.module.less'
import { DeleteColored } from '@/icons'
import {
    downloadDemandFileV2,
    formatError,
    getFullRequestPath,
    getToken,
} from '@/core'
import { streamToFile } from '@/utils'
import __ from './locale'
import FileIcon from '../FileIcon'
import { MicroWidgetPropsContext } from '@/context'

interface IUploadAttachment {
    value?: any
    onChange?: (val) => void
    path?: string
    downloadApi?: (id: string) => Promise<any>
    delApi?: (id: string) => Promise<any>
}
const UploadAttachment: React.FC<IUploadAttachment> = ({
    value,
    onChange,
    path = '/api/demand-management/v2/file',
    downloadApi = downloadDemandFileV2,
    delApi,
}) => {
    const [fileInfo, setFileInfo] = useState<any[]>([])

    const [errorText, setErrorText] = useState('')

    const { microWidgetProps } = useContext(MicroWidgetPropsContext)

    useEffect(() => {
        if (value) {
            setFileInfo(value)
        }
    }, [value])

    const getSuffix = (name: string) => {
        return name.substring(name.lastIndexOf('.') + 1)
    }

    const uploadProps: UploadProps = {
        name: 'file',
        action: getFullRequestPath({
            microWidgetProps,
            path,
        }),
        showUploadList: false,
        accept: '.doc,.docx,.xlsx,.xls,.pdf',
        headers: {
            Authorization: getToken({ microWidgetProps }),
        },
        multiple: true,
        beforeUpload: (file: RcFile) => {
            const fileSuffix = file.name.substring(
                file.name.lastIndexOf('.') + 1,
            )
            if (!['doc', 'docx', 'xlsx', 'xls', 'pdf'].includes(fileSuffix)) {
                setErrorText(__('不支持的文件类型'))
                message.error(__('不支持的文件类型'))
                return false
            }
            const isLt10M = file.size / 1024 / 1024 > 10
            if (isLt10M) {
                setErrorText(__('文件不可超过10M'))
                message.error(__('文件不可超过10M'))
                return false
            }
            setErrorText('')
            return true
        },
        onChange({ file, fileList }) {
            if (file.status === 'error') {
                setErrorText(file.response.description)
            }
            if (file.status === 'done') {
                const { id } = file.response
                const newFileInfo = [...fileInfo, { id, name: file.name }]
                setFileInfo(newFileInfo)
                onChange?.(newFileInfo)
                message.success(`${file.name} ${__('上传成功')}`)
            }
        },
    }

    const handleDelete = async (file: any) => {
        if (delApi) {
            try {
                await delApi(file.id)
                setFileInfo(fileInfo.filter((f) => f.id !== file.id))
                onChange?.(fileInfo.filter((f) => f.id !== file.id))
            } catch (error) {
                formatError(error)
            }
        } else {
            setFileInfo(fileInfo.filter((f) => f.id !== file.id))
            onChange?.(fileInfo.filter((f) => f.id !== file.id))
        }
    }

    const handleDownload = async (file: any) => {
        try {
            if (!file.id) return
            const res = await downloadApi(file.id)
            // 将文件流转换成文件
            streamToFile(res, file.name)
        } catch (error) {
            formatError(error)
        }
    }

    return (
        <div className={styles.UploadAttachment}>
            <div className={styles.fileDesc}>
                <div className={styles.fileOrder}>·</div>
                {__('支持类型.doc、docx、.xlsx、.xls、.pdf，文件不得超过10MB')}
            </div>
            <div className={styles.fileDesc}>
                <div className={styles.fileOrder}>·</div>
                {__('需上传业务流程说明书、业务规则说明书')}
            </div>

            <div className={styles.uploadWrapper}>
                <Upload {...uploadProps}>
                    <Button
                        className={styles.uploadBtn}
                        type="primary"
                        icon={<UploadOutlined />}
                    >
                        {__('上传文件')}
                    </Button>
                </Upload>
            </div>
            {fileInfo.map((file) => (
                <div className={styles.filterWrapper}>
                    <div className={styles.fileAndIcon}>
                        <FileIcon suffix={getSuffix(file.name)} />
                        <div
                            className={styles.fileName}
                            onClick={() => handleDownload(file)}
                            title={file.name}
                        >
                            {file.name}
                        </div>
                    </div>
                    <DeleteColored
                        className={styles.deleteIcon}
                        onClick={() => handleDelete(file)}
                    />
                </div>
            ))}
        </div>
    )
}

export default UploadAttachment
