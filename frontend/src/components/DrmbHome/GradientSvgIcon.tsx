import React, { useState } from 'react'
import classnames from 'classnames'
// 接收SVG组件和渐变颜色配置
interface GradientSvgProps {
    name: string
    colors?: string[]
    bgColors?: string[]
    gradientType?: 'linear' | 'radial'
    gradientAngle?: number
    style?: React.CSSProperties
    className?: string
}

const GradientSvgIcon: React.FC<GradientSvgProps> = ({
    name,
    colors = ['rgba(0, 198, 255, 1)', 'rgba(0, 148, 255, 1)'],
    bgColors = ['rgba(24, 144, 255, 0.08)'],
    gradientType = 'linear',
    gradientAngle = 0,
    style,
    className = '',
    ...props
}) => {
    // 生成随机ID，避免ID冲突
    const [gradientId] = useState(
        `gradient-${Math.random().toString(36).substr(2, 9)}`,
    )

    // 计算渐变角度的坐标
    const getAngleCoordinates = () => {
        const radian = (gradientAngle * Math.PI) / 180
        return {
            x1: '0%',
            y1: '0%',
            x2: `${Math.sin(radian) * 100}%`,
            y2: `${Math.cos(radian) * 100}%`,
        }
    }

    // 生成渐变色标
    const renderGradientStops = () => {
        return colors.map((color, index) => (
            <stop
                key={index}
                offset={`${(index / (colors.length - 1)) * 100}%`}
                stopColor={color}
            />
        ))
    }

    return (
        <span
            role="img"
            className={classnames('any-fabric-anticon', className)}
            style={{
                background:
                    bgColors?.length === 1
                        ? bgColors[0]
                        : `linear-gradient( 180deg, ${bgColors[0]} 0%, ${bgColors[1]} 100%)`,
                ...style,
            }}
            {...props}
        >
            <svg
                viewBox="0 0 1024 1024"
                width="1em"
                height="1em"
                fill={`url(#${gradientId})`}
            >
                <defs>
                    {gradientType === 'linear' ? (
                        <linearGradient
                            id={gradientId}
                            {...getAngleCoordinates()}
                        >
                            {renderGradientStops()}
                        </linearGradient>
                    ) : (
                        <radialGradient
                            id={gradientId}
                            cx="50%"
                            cy="50%"
                            r="70%"
                        >
                            {renderGradientStops()}
                        </radialGradient>
                    )}
                </defs>
                {/* 使用传入的SVG组件 */}
                <g fill={`url(#${gradientId})`}>
                    <svg aria-hidden="true">
                        <use xlinkHref={`#${name}`} />
                    </svg>
                </g>
            </svg>
        </span>
    )
}

export default GradientSvgIcon
