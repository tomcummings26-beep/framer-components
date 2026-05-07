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

type StepItem = {
    number: string
    title: string
    body: string
}

type Props = {
    heading: string
    subheading: string
    intro: string

    stat1Value: string
    stat1Label: string
    stat2Value: string
    stat2Label: string
    stat3Value: string
    stat3Label: string
    stat4Value: string
    stat4Label: string

    step1Title: string
    step1Body: string
    step2Title: string
    step2Body: string
    step3Title: string
    step3Body: string
    step4Title: string
    step4Body: string

    reassurance1Title: string
    reassurance1Body: string
    reassurance2Title: string
    reassurance2Body: string
    reassurance3Title: string
    reassurance3Body: string

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

export default function HowBookingWorksFrenchMaison(props: Props) {
    const {
        heading,
        subheading,
        intro,

        stat1Value,
        stat1Label,
        stat2Value,
        stat2Label,
        stat3Value,
        stat3Label,
        stat4Value,
        stat4Label,

        step1Title,
        step1Body,
        step2Title,
        step2Body,
        step3Title,
        step3Body,
        step4Title,
        step4Body,

        reassurance1Title,
        reassurance1Body,
        reassurance2Title,
        reassurance2Body,
        reassurance3Title,
        reassurance3Body,

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

    const steps: StepItem[] = [
        { number: "01", title: step1Title, body: step1Body },
        { number: "02", title: step2Title, body: step2Body },
        { number: "03", title: step3Title, body: step3Body },
        { number: "04", title: step4Title, body: step4Body },
    ].filter((s) => s.title?.trim())

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
                    gap: isMobile ? 24 : 28,
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
                    className="fm-booking-top"
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
                                maxWidth: isMobile ? "100%" : 720,
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

                {/* Steps */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: isMobile ? 16 : 18,
                    }}
                >
                    {steps.map((step, index) => (
                        <div
                            key={`${step.number}-${index}`}
                            style={{
                                background: cardBackground,
                                border: `1px solid ${borderColor}`,
                                borderRadius: radius,
                                padding: isMobile ? 20 : 22,
                                boxSizing: "border-box",
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                                position: "relative",
                                boxShadow: isMobile
                                    ? "none"
                                    : "0 8px 18px rgba(21,56,82,0.03)",
                            }}
                        >
                            {!isMobile && index < steps.length - 2 && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 42,
                                        right: -20,
                                        width: 20,
                                        height: 1,
                                        background: borderColor,
                                    }}
                                />
                            )}

                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 40,
                                    height: 40,
                                    borderRadius: 999,
                                    background: background,
                                    border: `1px solid ${borderColor}`,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: accentColor,
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {step.number}
                            </div>

                            <h3
                                style={{
                                    fontSize: isMobile ? 21 : 22,
                                    lineHeight: 1.1,
                                    letterSpacing: "-0.025em",
                                    color: textColor,
                                    margin: 0,
                                    fontWeight: 700,
                                }}
                            >
                                {step.title}
                            </h3>

                            <p
                                style={{
                                    fontSize: isMobile ? 15 : 15,
                                    lineHeight: 1.7,
                                    color: mutedColor,
                                    margin: 0,
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {step.body}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Reassurance with supporting imagery */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: isMobile
                            ? "1fr"
                            : "repeat(3, minmax(0, 1fr))",
                        gap: isMobile ? 18 : 20,
                        marginTop: -2,
                    }}
                >
                    {[
                        {
                            title: reassurance1Title,
                            body: reassurance1Body,
                            image: images[0],
                        },
                        {
                            title: reassurance2Title,
                            body: reassurance2Body,
                            image: images[1],
                        },
                        {
                            title: reassurance3Title,
                            body: reassurance3Body,
                            image: images[2],
                        },
                    ]
                        .filter((item) => item.title?.trim())
                        .map((item, index) => (
                            <div
                                key={`${item.title}-${index}`}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 14,
                                }}
                            >
                                <BookingInfoCard
                                    title={item.title}
                                    body={item.body}
                                    cardBackground={cardBackground}
                                    borderColor={borderColor}
                                    textColor={textColor}
                                    mutedColor={mutedColor}
                                    radius={radius}
                                    isMobile={isMobile}
                                    compact
                                />

                                {item.image?.src ? (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 12,
                                        }}
                                    >
                                        <div
                                            style={{
                                                borderRadius: radius + 6,
                                                overflow: "hidden",
                                                minHeight: isMobile
                                                    ? 300
                                                    : undefined,
                                                aspectRatio: isMobile
                                                    ? undefined
                                                    : "4 / 5",
                                                background: "#EDE8DF",
                                                border: `1px solid ${borderColor}`,
                                            }}
                                        >
                                            <img
                                                src={item.image.src}
                                                alt=""
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    display: "block",
                                                }}
                                            />
                                        </div>

                                        {item.image.caption?.trim() ? (
                                            <p
                                                style={{
                                                    margin: 0,
                                                    fontSize: isMobile
                                                        ? 15
                                                        : 14,
                                                    lineHeight: 1.6,
                                                    color: mutedColor,
                                                    padding: "0 4px",
                                                }}
                                            >
                                                {item.image.caption}
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                </div>

                {/* Trust pills */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: isMobile ? 10 : 12,
                        marginTop: 0,
                    }}
                >
                    {pills.map((pill, index) => (
                        <div
                            key={`${pill.text}-${index}`}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                padding: isMobile ? "9px 12px" : "10px 14px",
                                borderRadius: 999,
                                border: `1px solid ${borderColor}`,
                                background: cardBackground,
                                color: textColor,
                                fontSize: isMobile ? 13 : 14,
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
                        gridTemplateColumns: isMobile ? "1fr" : "1.3fr auto",
                        gap: isMobile ? 18 : 24,
                        alignItems: "center",
                        marginTop: 4,
                    }}
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
                            justifyContent: isMobile
                                ? "flex-start"
                                : "flex-end",
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
                    .fm-booking-top {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    )
}

function BookingInfoCard(props: {
    title: string
    body: string
    cardBackground: string
    borderColor: string
    textColor: string
    mutedColor: string
    radius: number
    isMobile?: boolean
    compact?: boolean
}) {
    return (
        <div
            style={{
                background: props.compact
                    ? "rgba(255,255,255,0.55)"
                    : props.cardBackground,
                border: `1px solid ${props.borderColor}`,
                borderLeft: props.compact
                    ? `3px solid ${props.textColor}`
                    : `1px solid ${props.borderColor}`,
                borderRadius: props.radius,
                padding: props.compact
                    ? props.isMobile
                        ? 18
                        : 20
                    : props.isMobile
                      ? 20
                      : 22,
                boxSizing: "border-box",
            }}
        >
            <h3
                style={{
                    fontSize: props.compact
                        ? props.isMobile
                            ? 19
                            : 20
                        : props.isMobile
                          ? 22
                          : 24,
                    lineHeight: 1.1,
                    letterSpacing: "-0.025em",
                    color: props.textColor,
                    margin: 0,
                    marginBottom: props.compact ? 10 : 14,
                    fontWeight: 700,
                }}
            >
                {props.title}
            </h3>
            <p
                style={{
                    fontSize: props.compact ? 15 : 16,
                    lineHeight: props.compact ? 1.6 : 1.75,
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

HowBookingWorksFrenchMaison.defaultProps = {
    subheading: "How booking works",
    heading:
        "A clear, personal booking process from first request to confirmed stay",
    intro: "French Maison is designed to make booking a villa in France feel more reassuring and straightforward. We guide guests through each step clearly, confirm availability before any payment is taken, and stay involved to help from first enquiry to final confirmation.",

    stat1Value: "2005",
    stat1Label: "Operating since",
    stat2Value: "1,000+",
    stat2Label: "Holidays booked",
    stat3Value: "Before payment",
    stat3Label: "Availability confirmed",
    stat4Value: "Personal",
    stat4Label: "Booking support",

    step1Title: "Request your stay",
    step1Body:
        "Once you have found a villa and selected your dates, you can submit a request to book with French Maison.\n\nAt this stage, no payment is taken. We use your request to begin the availability check and make sure the villa and dates are suitable for your stay.",

    step2Title: "We confirm availability",
    step2Body:
        "We confirm your requested dates with our booking partner and check the latest availability before moving forward.\n\nIf the villa is available, we come back to you with the next steps to secure the booking. If anything has changed, we can help you look at suitable alternatives.",

    step3Title: "You secure your booking",
    step3Body:
        "Once availability is confirmed, we guide you through the next step to secure your stay.\n\nThis is when deposit and payment details are handled. We keep the process clear, explain timings, and help you understand what happens next before anything is finalised.",

    step4Title: "Your stay is confirmed",
    step4Body:
        "Once the booking is secured, your villa stay is confirmed and we continue to support you through the remaining stages.\n\nThat includes making the next steps clear, helping with balance timings where relevant, and staying available if you have questions before travel.",

    reassurance1Title: "No payment before confirmation",
    reassurance1Body:
        "A booking request does not mean an immediate charge. We confirm availability before asking you to secure the villa, helping the process feel fairer and more reassuring.",

    reassurance2Title: "A more personal approach",
    reassurance2Body:
        "French Maison is supported by a small, knowledgeable team who care about making the process clear and supportive. If you have questions, we are here to help.",

    reassurance3Title: "Clear next steps throughout",
    reassurance3Body:
        "From deposit timing to final confirmation, we aim to make each stage easy to understand. The goal is a booking journey that feels calm, clear, and well guided.",

    pill1: "Availability confirmed before payment",
    pill2: "Personal booking support",
    pill3: "1,000+ holidays booked",
    pill4: "Operating since 2005",
    pill5: "Independent UK-based brand",
    pill6: "Hand-picked villas across France",

    image1: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
    image2: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1000&q=80",
    image3: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
    image1Caption:
        "We want the booking process to feel as considered and reassuring as the villas themselves — clear, calm, and grounded in real support.",
    image2Caption:
        "Behind every request is a small team helping guests move from villa discovery to confirmed stay with confidence.",
    image3Caption:
        "Each stage is designed to feel clearer and more manageable, so guests understand what happens next without feeling rushed.",

    ctaTitle: "Ready to book, or still deciding?",
    ctaBody:
        "Explore the collection, ask us a question, or request to book with French Maison. We are here to help you choose well and move forward with confidence.",
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

addPropertyControls(HowBookingWorksFrenchMaison, {
    heading: { type: ControlType.String, title: "Heading" },
    subheading: { type: ControlType.String, title: "Eyebrow" },
    intro: { type: ControlType.String, title: "Intro", displayTextArea: true },

    stat1Value: { type: ControlType.String, title: "Stat 1 Value" },
    stat1Label: { type: ControlType.String, title: "Stat 1 Label" },
    stat2Value: { type: ControlType.String, title: "Stat 2 Value" },
    stat2Label: { type: ControlType.String, title: "Stat 2 Label" },
    stat3Value: { type: ControlType.String, title: "Stat 3 Value" },
    stat3Label: { type: ControlType.String, title: "Stat 3 Label" },
    stat4Value: { type: ControlType.String, title: "Stat 4 Value" },
    stat4Label: { type: ControlType.String, title: "Stat 4 Label" },

    step1Title: { type: ControlType.String, title: "Step 1 Title" },
    step1Body: {
        type: ControlType.String,
        title: "Step 1 Body",
        displayTextArea: true,
    },
    step2Title: { type: ControlType.String, title: "Step 2 Title" },
    step2Body: {
        type: ControlType.String,
        title: "Step 2 Body",
        displayTextArea: true,
    },
    step3Title: { type: ControlType.String, title: "Step 3 Title" },
    step3Body: {
        type: ControlType.String,
        title: "Step 3 Body",
        displayTextArea: true,
    },
    step4Title: { type: ControlType.String, title: "Step 4 Title" },
    step4Body: {
        type: ControlType.String,
        title: "Step 4 Body",
        displayTextArea: true,
    },

    reassurance1Title: { type: ControlType.String, title: "Card 1 Title" },
    reassurance1Body: {
        type: ControlType.String,
        title: "Card 1 Body",
        displayTextArea: true,
    },
    reassurance2Title: { type: ControlType.String, title: "Card 2 Title" },
    reassurance2Body: {
        type: ControlType.String,
        title: "Card 2 Body",
        displayTextArea: true,
    },
    reassurance3Title: { type: ControlType.String, title: "Card 3 Title" },
    reassurance3Body: {
        type: ControlType.String,
        title: "Card 3 Body",
        displayTextArea: true,
    },

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
