import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Props = {
    lineOne: string
    lineTwo: string
    align: "left" | "center" | "right"
    maxWidth: number
    lineOneColor: string
    lineTwoColor: string
    desktopLineOneSize: number
    desktopLineTwoSize: number
    mobileLineOneSize: number
    mobileLineTwoSize: number
}

const SERIF_STACK =
    '"Cormorant Garamond", "Libre Baskerville", Georgia, "Times New Roman", serif'

export default function HeroHeadline({
    lineOne = "French Villas & Holiday Homes in France",
    lineTwo = "With Live Availability",
    align = "center",
    maxWidth = 900,
    lineOneColor = "#153852",
    lineTwoColor = "#EDE7DE",
    desktopLineOneSize = 74,
    desktopLineTwoSize = 72,
    mobileLineOneSize = 42,
    mobileLineTwoSize = 40,
}: Props) {
    const [isMobile, setIsMobile] = React.useState(false)
    const wrapperRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const updateViewport = () => {
            const width = wrapperRef.current?.offsetWidth || window.innerWidth
            setIsMobile(width < 768)
        }

        updateViewport()

        const observer =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(updateViewport)
                : null

        if (wrapperRef.current && observer) {
            observer.observe(wrapperRef.current)
        }

        window.addEventListener("resize", updateViewport)

        return () => {
            window.removeEventListener("resize", updateViewport)
            observer?.disconnect()
        }
    }, [])

    return (
        <div ref={wrapperRef} style={wrapperStyle(align, maxWidth)}>
            <h1 style={headingStyle(align)}>
                <span
                    style={lineStyle(
                        isMobile ? mobileLineOneSize : desktopLineOneSize,
                        lineOneColor
                    )}
                >
                    {lineOne}
                </span>
                <span
                    style={lineStyle(
                        isMobile ? mobileLineTwoSize : desktopLineTwoSize,
                        lineTwoColor
                    )}
                >
                    {lineTwo}
                </span>
            </h1>
        </div>
    )
}

const wrapperStyle = (
    align: "left" | "center" | "right",
    maxWidth: number
): React.CSSProperties => ({
    width: "100%",
    maxWidth,
    margin: "0 auto",
    textAlign: align,
    display: "flex",
    flexDirection: "column",
    alignItems:
        align === "left"
            ? "flex-start"
            : align === "right"
              ? "flex-end"
              : "center",
})

const headingStyle = (
    align: "left" | "center" | "right"
): React.CSSProperties => ({
    margin: 0,
    display: "flex",
    flexDirection: "column",
    alignItems:
        align === "left"
            ? "flex-start"
            : align === "right"
              ? "flex-end"
              : "center",
})

const lineStyle = (fontSize: number, color: string): React.CSSProperties => ({
    display: "block",
    fontFamily: SERIF_STACK,
    fontSize,
    fontWeight: 500,
    lineHeight: 0.92,
    letterSpacing: "-0.03em",
    color,
    whiteSpace: "nowrap",
    textWrap: "balance",
})

addPropertyControls(HeroHeadline, {
    lineOne: {
        type: ControlType.String,
        title: "Line 1",
        defaultValue: "French Villas & Holiday Homes in France",
    },
    lineTwo: {
        type: ControlType.String,
        title: "Line 2",
        defaultValue: "With Live Availability",
    },
    align: {
        type: ControlType.Enum,
        title: "Align",
        defaultValue: "center",
        options: ["left", "center", "right"],
        optionTitles: ["Left", "Center", "Right"],
    },
    maxWidth: {
        type: ControlType.Number,
        title: "Max Width",
        defaultValue: 900,
        min: 300,
        max: 1600,
        step: 10,
    },
    lineOneColor: {
        type: ControlType.Color,
        title: "Line 1 Color",
        defaultValue: "#153852",
    },
    lineTwoColor: {
        type: ControlType.Color,
        title: "Line 2 Color",
        defaultValue: "#EDE7DE",
    },
    desktopLineOneSize: {
        type: ControlType.Number,
        title: "Desk L1",
        defaultValue: 74,
        min: 24,
        max: 160,
        step: 1,
    },
    desktopLineTwoSize: {
        type: ControlType.Number,
        title: "Desk L2",
        defaultValue: 72,
        min: 24,
        max: 160,
        step: 1,
    },
    mobileLineOneSize: {
        type: ControlType.Number,
        title: "Mob L1",
        defaultValue: 42,
        min: 18,
        max: 80,
        step: 1,
    },
    mobileLineTwoSize: {
        type: ControlType.Number,
        title: "Mob L2",
        defaultValue: 40,
        min: 18,
        max: 80,
        step: 1,
    },
})
