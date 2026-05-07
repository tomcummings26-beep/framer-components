import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

type TrustItem = {
    text: string
    icon: string
}

type Props = {
    items: TrustItem[]
    background: string
    textColor: string
    dividerColor: string
    borderColor: string
    iconColor: string
    linkColor: string
    fontSize: number
    fontWeight: number
    height: number
    horizontalPadding: number
    gap: number
    radius: number
    showBorder: boolean
    mobileScrollable: boolean
}

const defaultItems: TrustItem[] = [
    { icon: "🇫🇷", text: "Specialist in villa holidays in France" },
    { icon: "✓", text: "Personal booking support" },
    { icon: "✓", text: "Availability confirmed before payment" },
    { icon: "✓", text: "Independent UK-based brand" },
]

export default function FMTrustBar(props: Props) {
    const {
        items = defaultItems,
        background = "#F7F4EF",
        textColor = "#163B63",
        dividerColor = "rgba(22,59,99,0.16)",
        borderColor = "rgba(22,59,99,0.12)",
        iconColor = "#163B63",
        fontSize = 15,
        fontWeight = 500,
        height = 56,
        horizontalPadding = 20,
        gap = 18,
        radius = 0,
        showBorder = true,
        mobileScrollable = true,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const [isMobile, setIsMobile] = useState(false)
    const validItems = items.filter((item) => item?.text?.trim())
    const visibleItems = isMobile ? validItems.slice(0, 2) : validItems

    useEffect(() => {
        const updateViewport = () => {
            const width = containerRef.current?.offsetWidth || window.innerWidth
            setIsMobile(width < 768)
        }

        updateViewport()

        const observer =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(updateViewport)
                : null

        if (containerRef.current && observer) {
            observer.observe(containerRef.current)
        }

        window.addEventListener("resize", updateViewport)
        return () => {
            window.removeEventListener("resize", updateViewport)
            observer?.disconnect()
        }
    }, [])

    return (
        <div
            ref={containerRef}
            style={wrapStyle(background, borderColor, radius, showBorder)}
        >
            <div
                style={innerStyle(
                    height,
                    horizontalPadding,
                    mobileScrollable,
                    isMobile
                )}
            >
                {visibleItems.map((item, index) => (
                    <React.Fragment key={`${item.text}-${index}`}>
                        <div style={itemStyle(gap, isMobile)}>
                            <span
                                style={iconBadgeStyle(
                                    iconColor,
                                    dividerColor,
                                    fontSize,
                                    isMobile
                                )}
                                aria-hidden="true"
                            >
                                <span style={iconStyle(iconColor, fontSize)}>
                                    {item.icon || "✓"}
                                </span>
                            </span>
                            <span
                                style={textStyle(
                                    textColor,
                                    fontSize,
                                    fontWeight,
                                    isMobile
                                )}
                            >
                                {item.text}
                            </span>
                        </div>

                        {!isMobile && index < visibleItems.length - 1 && (
                            <div
                                style={dividerStyle(
                                    dividerColor,
                                    height,
                                    isMobile
                                )}
                                aria-hidden="true"
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

function wrapStyle(
    background: string,
    borderColor: string,
    radius: number,
    showBorder: boolean
): React.CSSProperties {
    return {
        width: "100%",
        background,
        borderTop: showBorder ? `1px solid ${borderColor}` : "none",
        borderBottom: showBorder ? `1px solid ${borderColor}` : "none",
        borderRadius: radius,
        overflow: "hidden",
        position: "relative",
    }
}

function innerStyle(
    height: number,
    horizontalPadding: number,
    mobileScrollable: boolean,
    isMobile: boolean
): React.CSSProperties {
    return {
        display: isMobile ? "grid" : "flex",
        gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : undefined,
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "nowrap",
        minHeight: Math.max(height, isMobile ? 72 : height),
        padding: isMobile
            ? `10px ${Math.max(14, horizontalPadding - 2)}px`
            : `0 ${horizontalPadding}px`,
        overflowX: "hidden",
        overflowY: "hidden",
        whiteSpace: isMobile ? "normal" : "nowrap",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
        gap: isMobile ? 16 : 12,
    }
}

function itemStyle(gap: number, isMobile: boolean): React.CSSProperties {
    return {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: isMobile ? "flex-start" : "center",
        gap: isMobile ? 8 : Math.max(8, gap * 0.45),
        flex: isMobile ? "1 1 0" : "0 0 auto",
        minWidth: 0,
        padding: isMobile ? "14px 0" : "16px 0",
    }
}

function iconStyle(color: string, fontSize: number): React.CSSProperties {
    return {
        color,
        fontSize: Math.max(14, fontSize),
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 18,
    }
}

function iconBadgeStyle(
    color: string,
    dividerColor: string,
    fontSize: number,
    isMobile: boolean
): React.CSSProperties {
    return {
        width: isMobile ? 24 : 24,
        height: isMobile ? 24 : 24,
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.76)",
        border: `1px solid ${dividerColor}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
        color,
        flex: "0 0 auto",
        fontSize: Math.max(12, fontSize - 1),
    }
}

function textStyle(
    color: string,
    fontSize: number,
    fontWeight: number,
    isMobile: boolean
): React.CSSProperties {
    return {
        color,
        fontSize: isMobile ? Math.max(12, fontSize - 2) : fontSize,
        fontWeight,
        lineHeight: isMobile ? 1.25 : 1.2,
        letterSpacing: "-0.01em",
        fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        whiteSpace: isMobile ? "normal" : "nowrap",
        overflow: "hidden",
        textOverflow: isMobile ? "clip" : "ellipsis",
    }
}

function dividerStyle(
    color: string,
    height: number,
    isMobile: boolean
): React.CSSProperties {
    return {
        width: 1,
        height: Math.max(18, Math.round(height * 0.38)),
        background: color,
        margin: isMobile ? "0 16px" : "0 18px",
        flexShrink: 0,
        opacity: 0.8,
    }
}

addPropertyControls(FMTrustBar, {
    items: {
        type: ControlType.Array,
        title: "Items",
        control: {
            type: ControlType.Object,
            controls: {
                icon: {
                    type: ControlType.String,
                    title: "Icon",
                    defaultValue: "✓",
                },
                text: {
                    type: ControlType.String,
                    title: "Text",
                    defaultValue: "Trust signal",
                },
            },
        },
        defaultValue: defaultItems,
        maxCount: 6,
    },
    background: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#F7F4EF",
    },
    textColor: {
        type: ControlType.Color,
        title: "Text",
        defaultValue: "#163B63",
    },
    iconColor: {
        type: ControlType.Color,
        title: "Icon",
        defaultValue: "#163B63",
    },
    dividerColor: {
        type: ControlType.Color,
        title: "Divider",
        defaultValue: "rgba(22,59,99,0.16)",
    },
    borderColor: {
        type: ControlType.Color,
        title: "Border",
        defaultValue: "rgba(22,59,99,0.12)",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Text Size",
        defaultValue: 15,
        min: 12,
        max: 20,
        step: 1,
        unit: "px",
    },
    fontWeight: {
        type: ControlType.Number,
        title: "Weight",
        defaultValue: 500,
        min: 400,
        max: 700,
        step: 100,
    },
    height: {
        type: ControlType.Number,
        title: "Height",
        defaultValue: 56,
        min: 40,
        max: 100,
        step: 2,
        unit: "px",
    },
    horizontalPadding: {
        type: ControlType.Number,
        title: "Padding X",
        defaultValue: 20,
        min: 8,
        max: 40,
        step: 2,
        unit: "px",
    },
    gap: {
        type: ControlType.Number,
        title: "Item Gap",
        defaultValue: 18,
        min: 8,
        max: 32,
        step: 1,
        unit: "px",
    },
    radius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: 0,
        min: 0,
        max: 24,
        step: 1,
        unit: "px",
    },
    showBorder: {
        type: ControlType.Boolean,
        title: "Border",
        defaultValue: true,
    },
    mobileScrollable: {
        type: ControlType.Boolean,
        title: "Mobile Scroll",
        defaultValue: true,
    },
})
