"use client"

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type FAQ = {
    question: string
    answer: string
}

type Props = {
    maxWidth: number
    background: string
    cardBackground: string
    borderColor: string
    headingColor: string
    textColor: string
    mutedColor: string
    radius: number
    topPadding: number
    bottomPadding: number
}

const SERIF_STACK =
    '"Cormorant Garamond", "Libre Baskerville", Georgia, "Times New Roman", serif'

const SANS_STACK =
    '"Inter", "Inter var", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

const faqs: FAQ[] = [
    {
        question: "How does French Maison work?",
        answer: "French Maison helps you discover villas and holiday homes in France with a focus on live availability, making it easier to find properties that are genuinely bookable.",
    },
    {
        question: "Can I search by region?",
        answer: "Yes. You can explore villas across regions including Provence, Dordogne, Brittany, Loire Valley, Languedoc and more.",
    },
    {
        question: "Can I browse by villa type?",
        answer: "Yes. You can browse villas with pools, family villas, large villas and luxury villas across France.",
    },
    {
        question: "Are the villas shown available to book?",
        answer: "French Maison is built around an availability-first approach, helping surface villas that are genuinely available for your chosen travel period.",
    },
    {
        question: "When should I book a villa in France for summer?",
        answer: "Popular regions and school-holiday dates often book early, so it is best to start searching as early as possible for summer travel.",
    },
]

export default function HomepageSEOFAQ(props: Props) {
    const {
        maxWidth,
        background,
        cardBackground,
        borderColor,
        headingColor,
        textColor,
        mutedColor,
        radius,
        topPadding,
        bottomPadding,
    } = props

    return (
        <section
            aria-labelledby="fm-faq-heading"
            style={{
                width: "100%",
                background,
                padding: `${topPadding}px 20px ${bottomPadding}px`,
            }}
        >
            <div
                style={{ maxWidth, margin: "0 auto", display: "grid", gap: 20 }}
            >
                <h2 id="fm-faq-heading" style={{ margin: 0 }}>
                    <span
                        style={{
                            display: "block",
                            fontSize: "clamp(32px, 4vw, 46px)",
                            lineHeight: 1,
                            letterSpacing: "-0.03em",
                            color: headingColor,
                            fontFamily: SERIF_STACK,
                            fontWeight: 500,
                        }}
                    >
                        Frequently asked questions
                    </span>
                </h2>

                <div style={{ display: "grid", gap: 14 }}>
                    {faqs.map((faq) => (
                        <details
                            key={faq.question}
                            style={{
                                background: cardBackground,
                                border: `1px solid ${borderColor}`,
                                borderRadius: radius,
                                padding: "18px 20px",
                            }}
                        >
                            <summary
                                style={{
                                    cursor: "pointer",
                                    fontSize: 18,
                                    lineHeight: 1.45,
                                    fontWeight: 600,
                                    color: headingColor,
                                    fontFamily: SANS_STACK,
                                }}
                            >
                                {faq.question}
                            </summary>
                            <p
                                style={{
                                    margin: "14px 0 0",
                                    fontSize: 16,
                                    lineHeight: 1.75,
                                    color: textColor,
                                    fontFamily: SANS_STACK,
                                }}
                            >
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>

                <p
                    style={{
                        margin: 0,
                        fontSize: 15,
                        lineHeight: 1.7,
                        color: mutedColor,
                        fontFamily: SANS_STACK,
                    }}
                >
                    French Maison is designed to help make French villa
                    searching clearer, faster and more useful, especially for
                    high-demand dates and popular destinations.
                </p>
            </div>
        </section>
    )
}

HomepageSEOFAQ.defaultProps = {
    maxWidth: 1200,
    background: "#FFFFFF",
    cardBackground: "#F8FAFC",
    borderColor: "#E2E8F0",
    headingColor: "#153852",
    textColor: "#243648",
    mutedColor: "#5E6B78",
    radius: 24,
    topPadding: 20,
    bottomPadding: 20,
}

addPropertyControls(HomepageSEOFAQ, {
    maxWidth: {
        type: ControlType.Number,
        title: "Max Width",
        min: 800,
        max: 1400,
        step: 10,
    },
    background: { type: ControlType.Color, title: "Background" },
    cardBackground: { type: ControlType.Color, title: "Card BG" },
    borderColor: { type: ControlType.Color, title: "Border" },
    headingColor: { type: ControlType.Color, title: "Heading" },
    textColor: { type: ControlType.Color, title: "Text" },
    mutedColor: { type: ControlType.Color, title: "Muted" },
    radius: {
        type: ControlType.Number,
        title: "Radius",
        min: 0,
        max: 40,
        step: 1,
    },
    topPadding: {
        type: ControlType.Number,
        title: "Top Pad",
        min: 0,
        max: 120,
        step: 4,
    },
    bottomPadding: {
        type: ControlType.Number,
        title: "Bottom Pad",
        min: 0,
        max: 120,
        step: 4,
    },
})
