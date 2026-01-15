import { FC, useEffect, useState } from 'react'
import { Select } from 'antd'
import { ICategoryItem, getCategory } from '@/core'
import { CategoriesTreeType, ICategoryItemTree, categoryFomat } from './const'
import styles from './styles.module.less'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import CategoryTree from './CategoryTree'

interface ICategoriesTrees {
    needUncategorized?: boolean // 是否需要显示未分类
    unCategorizedKey?: string // 未分类的名称
}

const CategoriesTrees: FC<ICategoriesTrees> = ({
    needUncategorized,
    unCategorizedKey,
}) => {
    // 当前可选的类目树
    const [categorys, setCategorys] = useState<Array<ICategoryItemTree>>([])

    // 当前选中的类目树的id
    const [selectedKey, setSeletedKey] = useState<string>('')

    // 当前选中树的类型
    const [selectedTreeType, setSelectedTreeType] =
        useState<CategoriesTreeType>()

    useEffect(() => {
        getSystemDefaultCategories()
    }, [])

    /**
     * 获取系统默认启用的类目
     */
    const getSystemDefaultCategories = async () => {
        const { entries } = await getCategory({})
        const enableCategory = categoryFomat(
            entries.filter((currentData) => currentData.using),
        )
        setCategorys(enableCategory)
        setSeletedKey(enableCategory?.[0]?.id || '')
        setSelectedTreeType(enableCategory?.[0]?.treeType)
    }

    return (
        <div className={styles.treeWrapper}>
            <div className={styles.viewModeWrapper}>
                <FontIcon name="icon-fuwulingyu" type={IconType.COLOREDICON} />

                {categorys?.length === 1 ? (
                    <span className={styles.modeTitle}>
                        {categorys?.[0].name}
                    </span>
                ) : (
                    <Select
                        value={selectedKey}
                        bordered={false}
                        options={categorys.map((item: ICategoryItemTree) => ({
                            value: item.id,
                            label: item.name,
                            treeType: item.treeType,
                        }))}
                        onChange={(key, option) => {
                            setSeletedKey(key)
                            setSelectedTreeType(
                                (
                                    option as {
                                        value: string
                                        label: string
                                        treeType: CategoriesTreeType
                                    }
                                )?.treeType as CategoriesTreeType,
                            )
                        }}
                        className={styles.viewSelect}
                    />
                )}
            </div>
            {selectedTreeType ? (
                <CategoryTree
                    categoryType={selectedTreeType}
                    dataId={selectedKey}
                    needUncategorized={needUncategorized}
                    unCategorizedKey={unCategorizedKey}
                />
            ) : null}
        </div>
    )
}

export default CategoriesTrees
