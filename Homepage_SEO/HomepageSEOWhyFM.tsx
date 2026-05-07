"use client"

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Props = {
    maxWidth: number
    background: string
    cardBackground: string
    borderColor: string
    textColor: string
    mutedColor: string
    headingColor: string
    radius: number
    topPadding: number
    bottomPadding: number
}

const SERIF_STACK =
    '"Cormorant Garamond", "Libre Baskerville", Georgia, "Times New Roman", serif'

const SANS_STACK =
    '"Inter", "Inter var", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export default function HomepageSEOWhyFM(props: Props) {
    const {
        maxWidth,
        background,
        cardBackground,
        borderColor,
        textColor,
        mutedColor,
        headingColor,
        radius,
        topPadding,
        bottomPadding,
    } = props

    return (
        <section
            aria-labelledby="fm-why-heading"
            style={{
                width: "100%",
                background,
                padding: `${topPadding}px 20px ${bottomPadding}px`,
            }}
        >
            <div
                style={{
                    maxWidth,
                    margin: "0 auto",
                    background: cardBackground,
                    border: `1px solid ${borderColor}`,
                    borderRadius: radius,
                    padding: 28,
                    display: "grid",
                    gap: 18,
                }}
            >
                <h2 id="fm-why-heading" style={{ margin: 0 }}>
                    <span
                        style={{
                            display: "block",
                            fontSize: "clamp(20px, 4vw, 33px)",
                            lineHeight: 1,
                            letterSpacing: "-0.03em",
                            color: headingColor,
                            fontFamily: SERIF_STACK,
                            fontWeight: 500,
                        }}
                    >
                        Why choose French Maison?
                    </span>
                </h2>

                <p
                    style={{
                        margin: 0,
                        fontSize: 17,
                        lineHeight: 1.8,
                        color: textColor,
                        fontFamily: SANS_STACK,
                    }}
                >
                    French Maison offers a more thoughtful way to find and book
                    villas in France. With a carefully curated collection of
                    holiday homes, live availability signals and trusted booking
                    partners, we help you focus on the options that genuinely
                    fit your plans, with less uncertainty and a more confident
                    booking experience.
                </p>

                <ul
                    style={{
                        margin: 0,
                        paddingLeft: 20,
                        display: "grid",
                        gap: 10,
                        color: mutedColor,
                        fontSize: 16,
                        lineHeight: 1.7,
                        fontFamily: SANS_STACK,
                    }}
                >
                    <li>Live availability signals</li>
                    <li>Curated villas across France</li>
                    <li>
                        Search by priority region, villa type and travel period
                    </li>
                    <li>Trusted property owners</li>
                </ul>
            </div>
        </section>
    )
}

HomepageSEOWhyFM.defaultProps = {
    maxWidth: 1200,
    background: "#FFFFFF",
    cardBackground: "#F8FAFC",
    borderColor: "#E2E8F0",
    textColor: "#243648",
    mutedColor: "#5E6B78",
    headingColor: "#153852",
    radius: 24,
    topPadding: 20,
    bottomPadding: 20,
}

addPropertyControls(HomepageSEOWhyFM, {
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
    textColor: { type: ControlType.Color, title: "Text" },
    mutedColor: { type: ControlType.Color, title: "Muted" },
    headingColor: { type: ControlType.Color, title: "Heading" },
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
