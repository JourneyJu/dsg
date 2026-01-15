import React, { memo, useEffect, useMemo, useRef } from 'react'
import classNames from 'classnames'
import { Pie } from '@antv/g2plot'
import styles from './styles.module.less'
import { formatThousand } from '@/utils/number'

interface PieCardProps {
    title: string
    hasTitleFlag?: boolean
    data?: { type: string; value: number; color?: string }[]
    extra?: React.ReactNode
    className?: string
    layout?: 'horizontal' | 'vertical'
    legendLayout?: 'single' | 'double'
}

/** 饼图卡片组件 */
const PieCard: React.FC<PieCardProps> = ({
    title,
    hasTitleFlag = true,
    data = [],
    extra,
    className,
    layout = 'horizontal',
    legendLayout = 'single',
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const pieIns = useRef<Pie>()

    const total = useMemo(() => {
        const count = data.reduce((acc, item) => acc + (item.value || 0), 0)
        return formatThousand(count, '0')
    }, [data])

    useEffect(() => {
        if (containerRef.current) {
            const pie = new Pie(containerRef.current, {
                data,
                // autoFit: true,
                width: hasTitleFlag ? 248 : 226,
                height: hasTitleFlag ? 168 : 146,
                padding: [0, 0, 0, 0],
                angleField: 'value',
                colorField: 'type',
                radius: 1,
                legend: false,
                color: (d: any) => {
                    const item = data.find(
                        (dataItem) => dataItem.type === d.type,
                    )
                    return item?.color || '#ccc'
                },
                innerRadius: hasTitleFlag ? 0.75 : 0,
                theme: 'custom-theme',
                interactions: [{ type: 'element-active' }],
                label: false,
                statistic: hasTitleFlag
                    ? {
                          title: false,
                          content: {
                              style: {
                                  whiteSpace: 'pre-wrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  textAlign: 'center',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: '100%',
                                  width: '100%',
                              },
                              customHtml: (container, view, datum) => {
                                  return `<div style="
                                  display: flex;
                                  flex-direction: column;
                                  align-items: center;
                                  justify-content: center;
                                  height: 100%;
                                  width: 100%;
                                  text-align: center;
                              ">
                                  <div style="
                                      font-size: 12px;
                                      color: #78839F;
                                      line-height: 1.2;
                                      margin-bottom: 4px;
                                      overflow: hidden;
                                      text-overflow: ellipsis;
                                      white-space: nowrap;
                                      max-width: 100%;
                                      font-weight: 400;
                                  ">目录总数</div>
                                  <div style="
                                      font-size: 20px;
                                      color: rgba(0,0,0,0.85);
                                      line-height: 1.2;
                                      overflow: hidden;
                                      text-overflow: ellipsis;
                                      white-space: nowrap;
                                      font-weight: 550;
                                      max-width: 100%;
                                  " title="${total}">${total}</div>
                              </div>`
                              },
                          },
                      }
                    : undefined,
                state: {
                    active: {
                        style: {
                            lineWidth: 0,
                        },
                    },
                },
            })

            pie.render()
            pieIns.current = pie
        }
        return () => {
            pieIns.current?.destroy()
        }
    }, [data, hasTitleFlag, total])

    useMemo(() => {
        if (data) {
            pieIns.current?.changeData(data)
        }
    }, [data])

    return (
        <div className={classNames(styles['pie-card'], className)}>
            <div className={styles['pie-card-header']}>
                <div
                    className={classNames(styles.title, {
                        [styles['title-flag']]: hasTitleFlag,
                    })}
                >
                    {title}
                </div>
                <div className={styles.extra}>{extra}</div>
            </div>
            <div
                className={classNames(styles['pie-card-content'], {
                    [styles.horizontal]: layout === 'horizontal',
                    [styles.vertical]: layout === 'vertical',
                })}
            >
                <div className={styles['pie-card-content-chart']}>
                    <div ref={containerRef} />
                </div>
                <div
                    className={classNames(styles['pie-card-content-legend'], {
                        [styles.single]: legendLayout === 'single',
                        [styles.double]: legendLayout === 'double',
                    })}
                >
                    {data?.map((item, index) => {
                        // 双列布局时，重新计算索引以实现先左列后右列的排列
                        const displayIndex =
                            legendLayout === 'double'
                                ? index < Math.ceil(data.length / 2)
                                    ? index * 2
                                    : (index - Math.ceil(data.length / 2)) * 2 +
                                      1
                                : index
                        return (
                            <div
                                key={item.type}
                                className={styles.item}
                                style={{ order: displayIndex }}
                            >
                                <div className={styles.name}>
                                    <span style={{ background: item.color }} />
                                    <span>{item.type}</span>
                                </div>
                                <div
                                    className={styles.value}
                                    title={(item.value ?? 0).toString()}
                                >
                                    {formatThousand(item.value, '0')}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default memo(PieCard)
