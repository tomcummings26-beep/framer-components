import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

type StatItem = {
    value: string
    label: string
}

type PillItem = {
    text: string
}

type Props = {
    heading: string
    subheading: string
    intro: string
    storyTitle: string
    storyBody: string
    promiseTitle: string
    promiseBody: string
    supportTitle: string
    supportBody: string

    stat1Value: string
    stat1Label: string
    stat2Value: string
    stat2Label: string
    stat3Value: string
    stat3Label: string
    stat4Value: string
    stat4Label: string

    pill1: string
    pill2: string
    pill3: string
    pill4: string
    pill5: string
    pill6: string

    image1: string
    image2: string
    image3: string
    image1Caption: string
    image2Caption: string
    image3Caption: string

    ctaTitle: string
    ctaBody: string
    primaryLabel: string
    primaryLink: string
    secondaryLabel: string
    secondaryLink: string

    background: string
    cardBackground: string
    textColor: string
    mutedColor: string
    borderColor: string
    accentColor: string
    buttonTextColor: string

    maxWidth: number
    radius: number
    sectionPaddingY: number
    sectionPaddingX: number
}

export default function AboutFrenchMaison(props: Props) {
    const {
        heading,
        subheading,
        intro,
        storyTitle,
        storyBody,
        promiseTitle,
        promiseBody,
        supportTitle,
        supportBody,

        stat1Value,
        stat1Label,
        stat2Value,
        stat2Label,
        stat3Value,
        stat3Label,
        stat4Value,
        stat4Label,

        pill1,
        pill2,
        pill3,
        pill4,
        pill5,
        pill6,

        image1,
        image2,
        image3,
        image1Caption,
        image2Caption,
        image3Caption,

        ctaTitle,
        ctaBody,
        primaryLabel,
        primaryLink,
        secondaryLabel,
        secondaryLink,

        background,
        cardBackground,
        textColor,
        mutedColor,
        borderColor,
        accentColor,
        buttonTextColor,

        maxWidth,
        radius,
        sectionPaddingY,
        sectionPaddingX,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const updateViewport = () => {
            const width = containerRef.current?.offsetWidth || window.innerWidth
            setIsMobile(width < 900)
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

    const stats: StatItem[] = [
        { value: stat1Value, label: stat1Label },
        { value: stat2Value, label: stat2Label },
        { value: stat3Value, label: stat3Label },
        { value: stat4Value, label: stat4Label },
    ].filter((s) => s.value?.trim() && s.label?.trim())

    const pills: PillItem[] = [
        { text: pill1 },
        { text: pill2 },
        { text: pill3 },
        { text: pill4 },
        { text: pill5 },
        { text: pill6 },
    ].filter((p) => p.text?.trim())

    const images = [
        { src: image1, caption: image1Caption },
        { src: image2, caption: image2Caption },
        { src: image3, caption: image3Caption },
    ].filter((item) => item.src)

    return (
        <section
            ref={containerRef}
            style={{
                width: "100%",
                background,
                padding: `${sectionPaddingY}px ${sectionPaddingX}px`,
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    maxWidth,
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 32,
                }}
            >
                {/* Intro */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1.1fr 0.9fr",
                        gap: 28,
                        alignItems: "start",
                    }}
                    className="fm-about-top"
                >
                    <div>
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: mutedColor,
                                marginBottom: 14,
                            }}
                        >
                            {subheading}
                        </div>

                        <h2
                            style={{
                                fontSize: isMobile ? 44 : 48,
                                lineHeight: isMobile ? 1.02 : 1.04,
                                letterSpacing: "-0.04em",
                                color: textColor,
                                margin: 0,
                                fontWeight: 700,
                                maxWidth: isMobile ? "100%" : 880,
                            }}
                        >
                            {heading}
                        </h2>

                        <p
                            style={{
                                fontSize: isMobile ? 18 : 19,
                                lineHeight: isMobile ? 1.58 : 1.65,
                                color: mutedColor,
                                marginTop: 20,
                                marginBottom: 0,
                                maxWidth: isMobile ? "100%" : 700,
                            }}
                        >
                            {intro}
                        </p>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 14,
                        }}
                    >
                        {stats.map((stat, index) => (
                            <div
                                key={`${stat.value}-${index}`}
                                style={{
                                    background: cardBackground,
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: radius,
                                    padding: isMobile ? 18 : 20,
                                    minHeight: isMobile ? 108 : 112,
                                    boxSizing: "border-box",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: isMobile ? 28 : 30,
                                        lineHeight: 1,
                                        fontWeight: 700,
                                        letterSpacing: "-0.03em",
                                        color: textColor,
                                        marginBottom: 10,
                                    }}
                                >
                                    {stat.value}
                                </div>
                                <div
                                    style={{
                                        fontSize: isMobile ? 14 : 15,
                                        lineHeight: 1.45,
                                        color: mutedColor,
                                    }}
                                >
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Image row */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: isMobile
                            ? "1fr"
                            : images.length === 3
                              ? "1fr 1fr 1fr"
                              : "1fr 1fr",
                        gap: isMobile ? 18 : 16,
                    }}
                    className="fm-about-images"
                >
                    {images.map((image, index) => (
                        <div
                            key={`${image.src}-${index}`}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: isMobile ? 12 : 0,
                            }}
                        >
                            <div
                                style={{
                                    borderRadius: radius + 6,
                                    overflow: "hidden",
                                    minHeight: isMobile ? 300 : 340,
                                    background: "#EDE8DF",
                                    border: `1px solid ${borderColor}`,
                                }}
                            >
                                <img
                                    src={image.src}
                                    alt=""
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                    }}
                                />
                            </div>

                            {isMobile && image.caption?.trim() ? (
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 15,
                                        lineHeight: 1.65,
                                        color: mutedColor,
                                        padding: "0 4px",
                                    }}
                                >
                                    {image.caption}
                                </p>
                            ) : null}
                        </div>
                    ))}
                </div>

                {/* Core story cards */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 18,
                    }}
                    className="fm-about-cards"
                >
                    <InfoCard
                        title={storyTitle}
                        body={storyBody}
                        cardBackground={cardBackground}
                        borderColor={borderColor}
                        textColor={textColor}
                        mutedColor={mutedColor}
                        radius={radius}
                        isMobile={isMobile}
                    />
                    <InfoCard
                        title={promiseTitle}
                        body={promiseBody}
                        cardBackground={cardBackground}
                        borderColor={borderColor}
                        textColor={textColor}
                        mutedColor={mutedColor}
                        radius={radius}
                        isMobile={isMobile}
                    />
                    <InfoCard
                        title={supportTitle}
                        body={supportBody}
                        cardBackground={cardBackground}
                        borderColor={borderColor}
                        textColor={textColor}
                        mutedColor={mutedColor}
                        radius={radius}
                        isMobile={isMobile}
                    />
                </div>

                {/* Trust pills */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                    }}
                >
                    {pills.map((pill, index) => (
                        <div
                            key={`${pill.text}-${index}`}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                padding: isMobile ? "10px 14px" : "12px 16px",
                                borderRadius: 999,
                                border: `1px solid ${borderColor}`,
                                background: cardBackground,
                                color: textColor,
                                fontSize: isMobile ? 14 : 15,
                                lineHeight: 1.35,
                            }}
                        >
                            <span style={{ color: accentColor }}>✓</span>
                            <span>{pill.text}</span>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div
                    style={{
                        background: cardBackground,
                        border: `1px solid ${borderColor}`,
                        borderRadius: radius + 4,
                        padding: isMobile ? 22 : 26,
                        display: "grid",
                        gridTemplateColumns: "1.3fr auto",
                        gap: 20,
                        alignItems: "center",
                    }}
                    className="fm-about-cta"
                >
                    <div>
                        <h3
                            style={{
                                fontSize: isMobile ? 28 : 30,
                                lineHeight: 1.08,
                                letterSpacing: "-0.03em",
                                color: textColor,
                                margin: 0,
                                fontWeight: 700,
                            }}
                        >
                            {ctaTitle}
                        </h3>
                        <p
                            style={{
                                fontSize: isMobile ? 16 : 17,
                                lineHeight: 1.6,
                                color: mutedColor,
                                marginTop: 12,
                                marginBottom: 0,
                                maxWidth: 760,
                            }}
                        >
                            {ctaBody}
                        </p>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 12,
                            justifyContent: "flex-end",
                        }}
                    >
                        <a
                            href={primaryLink || "#"}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: isMobile ? "14px 20px" : "16px 22px",
                                borderRadius: 14,
                                background: accentColor,
                                color: buttonTextColor,
                                textDecoration: "none",
                                fontSize: 15,
                                fontWeight: 700,
                                minWidth: 180,
                            }}
                        >
                            {primaryLabel}
                        </a>

                        <a
                            href={secondaryLink || "#"}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: isMobile ? "14px 20px" : "16px 22px",
                                borderRadius: 14,
                                background: "transparent",
                                color: textColor,
                                textDecoration: "none",
                                fontSize: 15,
                                fontWeight: 700,
                                border: `1px solid ${borderColor}`,
                                minWidth: 180,
                            }}
                        >
                            {secondaryLabel}
                        </a>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1100px) {
                    .fm-about-top,
                    .fm-about-cards,
                    .fm-about-cta {
                        grid-template-columns: 1fr !important;
                    }
                }

                @media (max-width: 900px) {
                    .fm-about-images {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    )
}

function InfoCard(props: {
    title: string
    body: string
    cardBackground: string
    borderColor: string
    textColor: string
    mutedColor: string
    radius: number
    isMobile?: boolean
}) {
    return (
        <div
            style={{
                background: props.cardBackground,
                border: `1px solid ${props.borderColor}`,
                borderRadius: props.radius,
                padding: props.isMobile ? 20 : 22,
                boxSizing: "border-box",
            }}
        >
            <h3
                style={{
                    fontSize: props.isMobile ? 22 : 24,
                    lineHeight: 1.1,
                    letterSpacing: "-0.025em",
                    color: props.textColor,
                    margin: 0,
                    marginBottom: 14,
                    fontWeight: 700,
                }}
            >
                {props.title}
            </h3>
            <p
                style={{
                    fontSize: props.isMobile ? 16 : 16,
                    lineHeight: 1.75,
                    color: props.mutedColor,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                }}
            >
                {props.body}
            </p>
        </div>
    )
}

AboutFrenchMaison.defaultProps = {
    subheading: "About French Maison",
    heading: "A more personal way to book villa holidays in France",
    intro: "Since 2005, French Maison has helped guests discover hand-picked villas across France with a more personal, guided booking experience. We combine specialist regional knowledge, carefully chosen properties, and human support at every step — from first enquiry to confirmed stay.",

    storyTitle: "Our story",
    storyBody:
        "French Maison was created to make finding a villa in France feel more considered, more personal, and more trustworthy.\n\nRather than overwhelming guests with endless generic listings, we focus on a curated collection of villas chosen for their quality, character, and appeal for real holidays — from family escapes to longer summer stays.",

    promiseTitle: "What makes us different",
    promiseBody:
        "We specialise in France, and that focus matters.\n\nOur villas are hand-picked, our content is designed to help guests choose with confidence, and our booking process is built to feel clear and reassuring. Availability is confirmed before payment, and we stay involved to guide guests through each stage.",

    supportTitle: "A small team, here to help",
    supportBody:
        "French Maison is supported by a small, knowledgeable team who care about making the process smooth from start to finish.\n\nWhether you need help understanding a villa, choosing a region, or moving from enquiry to confirmed booking, we are here to help every step of the way.",

    stat1Value: "2005",
    stat1Label: "Operating since",
    stat2Value: "1,000+",
    stat2Label: "Holidays booked",
    stat3Value: "Hand-picked",
    stat3Label: "Villa-first collection",
    stat4Value: "France",
    stat4Label: "Specialist destination focus",

    pill1: "Operating since 2005",
    pill2: "1,000+ holidays booked",
    pill3: "Hand-picked villas across France",
    pill4: "Personal booking support",
    pill5: "Availability confirmed before payment",
    pill6: "Independent UK-based brand",

    image1: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
    image2: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
    image3: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1000&q=80",
    image1Caption:
        "We focus on villas that feel right for real holidays in France, from slower countryside stays to longer summer breaks.",
    image2Caption:
        "Our destination focus means we understand the differences between regions, seasons, and the style of stay guests are really looking for.",
    image3Caption:
        "Behind the site is a small team that cares about making the process feel personal, clear, and supportive from first enquiry onwards.",

    ctaTitle: "Planning your next villa stay in France?",
    ctaBody:
        "Explore our collection, ask us a question, or request to book with French Maison. We’re here to help you find the right villa and guide you through the next steps with confidence.",
    primaryLabel: "Explore villas",
    primaryLink: "/",
    secondaryLabel: "Contact us",
    secondaryLink: "/contact",

    background: "#F8F6F2",
    cardBackground: "#FFFFFF",
    textColor: "#163B63",
    mutedColor: "rgba(22,59,99,0.76)",
    borderColor: "rgba(22,59,99,0.12)",
    accentColor: "#163B63",
    buttonTextColor: "#FFFFFF",

    maxWidth: 1440,
    radius: 24,
    sectionPaddingY: 56,
    sectionPaddingX: 32,
}

addPropertyControls(AboutFrenchMaison, {
    heading: { type: ControlType.String, title: "Heading" },
    subheading: { type: ControlType.String, title: "Eyebrow" },
    intro: { type: ControlType.String, title: "Intro", displayTextArea: true },

    storyTitle: { type: ControlType.String, title: "Story Title" },
    storyBody: {
        type: ControlType.String,
        title: "Story Body",
        displayTextArea: true,
    },
    promiseTitle: { type: ControlType.String, title: "Promise Title" },
    promiseBody: {
        type: ControlType.String,
        title: "Promise Body",
        displayTextArea: true,
    },
    supportTitle: { type: ControlType.String, title: "Support Title" },
    supportBody: {
        type: ControlType.String,
        title: "Support Body",
        displayTextArea: true,
    },

    stat1Value: { type: ControlType.String, title: "Stat 1 Value" },
    stat1Label: { type: ControlType.String, title: "Stat 1 Label" },
    stat2Value: { type: ControlType.String, title: "Stat 2 Value" },
    stat2Label: { type: ControlType.String, title: "Stat 2 Label" },
    stat3Value: { type: ControlType.String, title: "Stat 3 Value" },
    stat3Label: { type: ControlType.String, title: "Stat 3 Label" },
    stat4Value: { type: ControlType.String, title: "Stat 4 Value" },
    stat4Label: { type: ControlType.String, title: "Stat 4 Label" },

    pill1: { type: ControlType.String, title: "Pill 1" },
    pill2: { type: ControlType.String, title: "Pill 2" },
    pill3: { type: ControlType.String, title: "Pill 3" },
    pill4: { type: ControlType.String, title: "Pill 4" },
    pill5: { type: ControlType.String, title: "Pill 5" },
    pill6: { type: ControlType.String, title: "Pill 6" },

    image1: { type: ControlType.Image, title: "Image 1" },
    image2: { type: ControlType.Image, title: "Image 2" },
    image3: { type: ControlType.Image, title: "Image 3" },
    image1Caption: {
        type: ControlType.String,
        title: "Img 1 Text",
        displayTextArea: true,
    },
    image2Caption: {
        type: ControlType.String,
        title: "Img 2 Text",
        displayTextArea: true,
    },
    image3Caption: {
        type: ControlType.String,
        title: "Img 3 Text",
        displayTextArea: true,
    },

    ctaTitle: { type: ControlType.String, title: "CTA Title" },
    ctaBody: {
        type: ControlType.String,
        title: "CTA Body",
        displayTextArea: true,
    },
    primaryLabel: { type: ControlType.String, title: "Primary Btn" },
    primaryLink: { type: ControlType.String, title: "Primary URL" },
    secondaryLabel: { type: ControlType.String, title: "Secondary Btn" },
    secondaryLink: { type: ControlType.String, title: "Secondary URL" },

    background: { type: ControlType.Color, title: "Background" },
    cardBackground: { type: ControlType.Color, title: "Card BG" },
    textColor: { type: ControlType.Color, title: "Text" },
    mutedColor: { type: ControlType.Color, title: "Muted" },
    borderColor: { type: ControlType.Color, title: "Border" },
    accentColor: { type: ControlType.Color, title: "Accent" },
    buttonTextColor: { type: ControlType.Color, title: "Btn Text" },

    maxWidth: {
        type: ControlType.Number,
        title: "Max Width",
        defaultValue: 1440,
        min: 900,
        max: 1800,
        step: 10,
    },
    radius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: 24,
        min: 8,
        max: 40,
        step: 1,
    },
    sectionPaddingY: {
        type: ControlType.Number,
        title: "Pad Y",
        defaultValue: 56,
        min: 16,
        max: 140,
        step: 2,
    },
    sectionPaddingX: {
        type: ControlType.Number,
        title: "Pad X",
        defaultValue: 32,
        min: 12,
        max: 80,
        step: 2,
    },
})
