import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */

type Props = {
    imageUrl: string
    alt: string
    desktopHeight: number
    mobileHeight: number
    desktopWidth: number
    mobileWidth: number
    quality: number
    focalX: number
    focalY: number
    borderRadius: number
    overlayOpacity: number
}

const MOBILE_BREAKPOINT = 768

const getOptimizedImage = (url: string, width: number, quality = 82) => {
    const base = "https://img.frenchmaison.co.uk/"
    if (!url) return ""

    if (url.includes("img.frenchmaison.co.uk")) return url

    const standardWidths = [480, 768, 960, 1200, 1600, 2000, 2400]
    const roundToNearest = (target: number) =>
        standardWidths.reduce((prev, curr) =>
            Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
        )

    const dpr =
        typeof window !== "undefined"
            ? Math.min(window.devicePixelRatio || 1, 2)
            : 1

    const finalWidth = roundToNearest(Math.round(width * dpr))
    return `${base}?url=${encodeURIComponent(
        url
    )}&width=${finalWidth}&quality=${quality}`
}

export default function HeroImage({
    imageUrl = "",
    alt = "Homepage hero image",
    desktopHeight = 640,
    mobileHeight = 420,
    desktopWidth = 2000,
    mobileWidth = 960,
    quality = 82,
    focalX = 50,
    focalY = 50,
    borderRadius = 0,
    overlayOpacity = 0,
}: Props) {
    const wrapperRef = React.useRef<HTMLDivElement>(null)
    const [isMobile, setIsMobile] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)
    const [useDirectSrc, setUseDirectSrc] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    React.useEffect(() => {
        const updateViewport = () => {
            const width = wrapperRef.current?.offsetWidth || window.innerWidth
            setIsMobile(width < MOBILE_BREAKPOINT)
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

    React.useEffect(() => {
        setUseDirectSrc(false)
    }, [imageUrl, quality, desktopWidth, mobileWidth, isMobile])

    const requestedWidth = isMobile ? mobileWidth : desktopWidth
    const optimizedSrc = getOptimizedImage(imageUrl, requestedWidth, quality)
    const imageSrc = useDirectSrc ? imageUrl : optimizedSrc

    return (
        <div
            ref={wrapperRef}
            suppressHydrationWarning
            style={{
                position: "relative",
                width: "100%",
                height: mounted
                    ? isMobile
                        ? mobileHeight
                        : desktopHeight
                    : desktopHeight,
                overflow: "hidden",
                borderRadius,
                background: "#e5e7eb",
            }}
        >
            {imageSrc ? (
                <img
                    src={imageSrc}
                    alt={alt}
                    sizes="100vw"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    onError={() => {
                        if (!useDirectSrc && imageUrl) {
                            setUseDirectSrc(true)
                        }
                    }}
                    style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: `${focalX}% ${focalY}%`,
                    }}
                />
            ) : null}

            {overlayOpacity > 0 ? (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: `rgba(0, 0, 0, ${overlayOpacity})`,
                        pointerEvents: "none",
                    }}
                />
            ) : null}
        </div>
    )
}

addPropertyControls(HeroImage, {
    imageUrl: {
        type: ControlType.String,
        title: "Image URL",
        defaultValue: "https://assets.frenchmaison.co.uk/heroimage.jpg",
        placeholder: "https://...",
    },
    alt: {
        type: ControlType.String,
        title: "Alt",
        defaultValue: "Homepage hero image",
    },
    desktopHeight: {
        type: ControlType.Number,
        title: "Desk H",
        defaultValue: 640,
        min: 240,
        max: 1400,
        step: 10,
    },
    mobileHeight: {
        type: ControlType.Number,
        title: "Mob H",
        defaultValue: 420,
        min: 180,
        max: 1000,
        step: 10,
    },
    desktopWidth: {
        type: ControlType.Number,
        title: "Desk W",
        defaultValue: 2000,
        min: 800,
        max: 3200,
        step: 20,
    },
    mobileWidth: {
        type: ControlType.Number,
        title: "Mob W",
        defaultValue: 960,
        min: 320,
        max: 1600,
        step: 20,
    },
    quality: {
        type: ControlType.Number,
        title: "Quality",
        defaultValue: 82,
        min: 40,
        max: 100,
        step: 1,
    },
    focalX: {
        type: ControlType.Number,
        title: "Focus X",
        defaultValue: 50,
        min: 0,
        max: 100,
        step: 1,
    },
    focalY: {
        type: ControlType.Number,
        title: "Focus Y",
        defaultValue: 50,
        min: 0,
        max: 100,
        step: 1,
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: 0,
        min: 0,
        max: 80,
        step: 1,
    },
    overlayOpacity: {
        type: ControlType.Number,
        title: "Overlay",
        defaultValue: 0,
        min: 0,
        max: 0.8,
        step: 0.05,
    },
})
