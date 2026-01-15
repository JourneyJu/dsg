import { useEffect, useMemo, useRef, useState } from 'react'
import { Tree, Divider, List, Skeleton, Button } from 'antd'
import InfiniteScroll from 'react-infinite-scroll-component'
import axios from 'axios'
import { DataNode } from 'antd/lib/tree'
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'
import { servFolderTree, servInfoList } from '@/core'
import __ from '../locale'

interface DataType {
    pageNum: number
    pageSize: number
    total: string
    totalPage: number
    list: any[]
}

// 长沙数据局专有的空间地理服务 tab
const CSSJJSpatialService = () => {
    const [treeData, setTreeData] = useState<DataNode[]>([])
    const [currentFolderId, setCurrentFolderId] = useState('')

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any[]>([])
    const [page, setPage] = useState(1)
    const [totalPage, setTotalPage] = useState(1)

    const init = async () => {
        const res = await servFolderTree({ foldType: 'dataServ' })

        const updatedTree: DataNode[] = res.data.map((obj) => ({
            key: obj.id, // 修改属性名
            title: obj.label, // 修改属性名
            children: getChildren(obj.children),
        }))

        setTreeData(updatedTree)

        // await getServInfoList(page)
    }

    function getChildren(children: any[]): any[] {
        if (children === null) {
            return [] // 递归终止条件
        }
        const tempChildren = children.map((child_obj) => ({
            key: child_obj.id, // 修改属性名
            title: child_obj.label, // 修改属性名
            children: getChildren(child_obj.children), // 递归调用
        }))

        return tempChildren
    }

    const getServInfoList = async (page_num: number) => {
        const res = await servInfoList(page, currentFolderId)
        if (page_num === 1) {
            setData(res.data.list)
        } else {
            setData([...data, ...res.data.list])
        }
        setTotalPage(res.data.totalPage)
        setPage(page_num + 1)
    }

    const loadMoreData = async () => {
        if (loading) {
            return
        }
        setLoading(true)
        await getServInfoList(page)
        setLoading(false)
    }

    useEffect(() => {
        init()
        loadMoreData()
    }, [])

    const jump = (e: any) => {
        // eslint-disable-next-line no-console
        window.open(
            `http://172.26.0.138:12300/#/data-center/preview-detail?type=dataServ&id=${e.servId}&apply=0`,
            '_blank',
        )
    }

    const onSelect = async (selectedKeys: any, info: any) => {
        setCurrentFolderId(selectedKeys[0])
        await getServInfoList(1)
    }

    const onClickItem = (item: any) => {
        window.open(
            `http://172.26.0.138:12300/#/data-center/preview-detail?type=dataServ&id=${item.servId}&apply=0`,
            '_blank',
        )
    }

    return (
        <div
            style={{
                display: 'flex',
                padding: '16px 68px 24px 68px',
                height: '100%',
                background: '#f0f2f6',
            }}
        >
            <Tree
                style={{
                    width: '280px',
                    marginLeft: '30px',
                    paddingTop: '10px',
                }}
                treeData={treeData}
                onSelect={onSelect}
            />
            <div
                style={{
                    flexGrow: 1,
                    height: '100%',
                    padding: '0 16px',
                    background: '#fff',
                    marginLeft: '16px',
                }}
            >
                {/* <div style={{ height: '50px' }}>
                    <CaretUpOutlined />
                    <CaretDownOutlined />
                </div>
                <div style={{ height: '2px', background: '#f0f2f6' }} /> */}
                <div
                    id="scrollableDiv"
                    style={{
                        overflow: 'auto',
                        height: '100%',
                    }}
                >
                    <InfiniteScroll
                        dataLength={data.length}
                        next={loadMoreData}
                        hasMore={page <= totalPage}
                        loader={<Skeleton paragraph={{ rows: 1 }} active />}
                        endMessage={<Divider plain>已经到底了</Divider>}
                        scrollableTarget="scrollableDiv"
                    >
                        <List
                            dataSource={data}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() => onClickItem(item)}
                                    key={item.servId}
                                >
                                    <List.Item.Meta
                                        style={{
                                            padding: '10px',
                                            whiteSpace: 'pre',
                                        }}
                                        title={item.servText}
                                        description={`目录类型：${item.servType}       服务目录：${item.folderName}        创建时间：${item.cdate}    `}
                                    />
                                    <Button
                                        type="primary"
                                        style={{ marginRight: '20px' }}
                                        onClick={() => {
                                            jump(item)
                                        }}
                                    >
                                        提出申请
                                    </Button>
                                </List.Item>
                            )}
                        />
                    </InfiniteScroll>
                </div>
            </div>
        </div>
    )
}

export default CSSJJSpatialService
