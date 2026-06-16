import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

type FooterLink = {
    label: string
    href: string
}

type TrustItem = {
    text: string
}

type LogoItem = {
    label: string
}

type Props = {
    brandName: string
    strapline: string
    supportEmail: string
    basedInText: string
    copyrightText: string

    logoText: string
    logoImage?: string
    logoImageHeight: number
    logoImageScale: number
    logoOffsetX: number
    logoOffsetY: number
    logoSpacingBottom: number

    link1Label: string
    link1Href: string
    link2Label: string
    link2Href: string
    link3Label: string
    link3Href: string
    link4Label: string
    link4Href: string
    link5Label: string
    link5Href: string
    link6Label: string
    link6Href: string

    trust1: string
    trust2: string
    trust3: string
    trust4: string

    showTrustRow: boolean
    showLogoBadges: boolean

    badge1: string
    badge2: string
    badge3: string
    badge4: string

    background: string
    textColor: string
    mutedColor: string
    lineColor: string
    badgeBackground: string
    badgeBorder: string
    linkColor: string
    maxWidth: number
    paddingTop: number
    paddingBottom: number
    sidePadding: number
}

export default function FMFooter(props: Props) {
    const {
        brandName,
        strapline,
        supportEmail,
        basedInText,
        copyrightText,
        logoText,
        logoImage,
        logoImageHeight,
        logoImageScale,
        logoOffsetX,
        logoOffsetY,
        logoSpacingBottom,

        link1Label,
        link1Href,
        link2Label,
        link2Href,
        link3Label,
        link3Href,
        link4Label,
        link4Href,
        link5Label,
        link5Href,
        link6Label,
        link6Href,

        trust1,
        trust2,
        trust3,
        trust4,

        showTrustRow,
        showLogoBadges,

        badge1,
        badge2,
        badge3,
        badge4,

        background,
        textColor,
        mutedColor,
        lineColor,
        badgeBackground,
        badgeBorder,
        linkColor,
        maxWidth,
        paddingTop,
        paddingBottom,
        sidePadding,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [openSection, setOpenSection] = useState<
        "explore" | "contact" | null
    >("explore")

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

    const links: FooterLink[] = [
        { label: link1Label, href: link1Href },
        { label: link6Label, href: link6Href },
        { label: link2Label, href: link2Href },
        { label: link3Label, href: link3Href },
        { label: link4Label, href: link4Href },
        { label: link5Label, href: link5Href },
    ].filter((item) => item.label?.trim())

    const trustItems: TrustItem[] = [
        { text: trust1 },
        { text: trust2 },
        { text: trust3 },
        { text: trust4 },
    ].filter((item) => item.text?.trim())

    const badges: LogoItem[] = [
        { label: badge1 },
        { label: badge2 },
        { label: badge3 },
        { label: badge4 },
    ].filter((item) => item.label?.trim())

    return (
        <footer
            ref={containerRef}
            style={{
                width: "100%",
                background,
                color: textColor,
                borderTop: `1px solid ${lineColor}`,
            }}
        >
            <div
                style={{
                    maxWidth,
                    margin: "0 auto",
                    padding: `${paddingTop}px ${sidePadding}px ${paddingBottom}px`,
                    display: "flex",
                    flexDirection: "column",
                    gap: isMobile ? 22 : 30,
                    boxSizing: "border-box",
                }}
            >
                <div style={heroRowStyle(isMobile, lineColor)}>
                    <div style={{ minWidth: 0 }}>
                        {logoImage ? (
                            <div
                                style={{
                                    height: isMobile
                                        ? Math.round(logoImageHeight * 0.82)
                                        : logoImageHeight,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    overflow: "visible",
                                    marginBottom: logoSpacingBottom,
                                }}
                            >
                                <img
                                    src={logoImage}
                                    alt={brandName}
                                    style={{
                                        height: "100%",
                                        width: "auto",
                                        display: "block",
                                        transform: `translate(${logoOffsetX}px, ${logoOffsetY}px) scale(${logoImageScale})`,
                                        transformOrigin: "left center",
                                    }}
                                />
                            </div>
                        ) : (
                            <div
                                style={{
                                    fontSize: isMobile ? 22 : 26,
                                    lineHeight: 0.94,
                                    fontWeight: 700,
                                    marginBottom: 16,
                                    letterSpacing: "-0.03em",
                                    whiteSpace: "pre-line",
                                }}
                            >
                                {logoText}
                            </div>
                        )}

                        <div
                            style={{
                                fontSize: isMobile ? 15 : 16,
                                lineHeight: 1.65,
                                color: mutedColor,
                                maxWidth: 480,
                            }}
                        >
                            {strapline}
                        </div>
                    </div>

                    {!isMobile && (
                        <div style={{ minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    marginBottom: 14,
                                    letterSpacing: "-0.01em",
                                }}
                            >
                                Explore
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                }}
                            >
                                {links.map((link, index) => (
                                    <a
                                        key={`${link.label}-${index}`}
                                        href={link.href || "#"}
                                        style={{
                                            color: linkColor,
                                            textDecoration: "none",
                                            fontSize: 15,
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isMobile && (
                        <div style={{ minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    marginBottom: 14,
                                    letterSpacing: "-0.01em",
                                }}
                            >
                                Contact
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                    fontSize: 15,
                                    lineHeight: 1.6,
                                    color: mutedColor,
                                }}
                            >
                                <div>{brandName}</div>
                                <div>{basedInText}</div>
                                <a
                                    href={`mailto:${supportEmail}`}
                                    style={{
                                        color: linkColor,
                                        textDecoration: "none",
                                    }}
                                >
                                    {supportEmail}
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {isMobile && (
                    <div
                        style={{
                            borderTop: `1px solid ${lineColor}`,
                            borderBottom: `1px solid ${lineColor}`,
                        }}
                    >
                        <AccordionSection
                            title="Explore"
                            isOpen={openSection === "explore"}
                            onToggle={() =>
                                setOpenSection((prev) =>
                                    prev === "explore" ? null : "explore"
                                )
                            }
                            lineColor={lineColor}
                            textColor={textColor}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 14,
                                    paddingBottom: 20,
                                }}
                            >
                                {links.map((link, index) => (
                                    <a
                                        key={`${link.label}-${index}`}
                                        href={link.href || "#"}
                                        style={{
                                            color: linkColor,
                                            textDecoration: "none",
                                            fontSize: 15,
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </AccordionSection>

                        <AccordionSection
                            title="Contact"
                            isOpen={openSection === "contact"}
                            onToggle={() =>
                                setOpenSection((prev) =>
                                    prev === "contact" ? null : "contact"
                                )
                            }
                            lineColor={lineColor}
                            textColor={textColor}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                    paddingBottom: 20,
                                    fontSize: 15,
                                    lineHeight: 1.6,
                                    color: mutedColor,
                                }}
                            >
                                <div>{brandName}</div>
                                <div>{basedInText}</div>
                                <a
                                    href={`mailto:${supportEmail}`}
                                    style={{
                                        color: linkColor,
                                        textDecoration: "none",
                                    }}
                                >
                                    {supportEmail}
                                </a>
                            </div>
                        </AccordionSection>
                    </div>
                )}

                {showTrustRow && trustItems.length > 0 && (
                    <div
                        style={{
                            borderTop: `1px solid ${lineColor}`,
                            paddingTop: isMobile ? 18 : 22,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 12,
                        }}
                    >
                        {trustItems.map((item, index) => (
                            <div
                                key={`${item.text}-${index}`}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: isMobile
                                        ? "9px 12px"
                                        : "10px 14px",
                                    border: `1px solid ${badgeBorder}`,
                                    background: badgeBackground,
                                    borderRadius: 999,
                                    fontSize: isMobile ? 13 : 14,
                                    lineHeight: 1.3,
                                    color: textColor,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 14,
                                        color: mutedColor,
                                    }}
                                >
                                    ✓
                                </span>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                )}

                {showLogoBadges && badges.length > 0 && (
                    <div
                        style={{
                            borderTop: `1px solid ${lineColor}`,
                            paddingTop: isMobile ? 18 : 22,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 12,
                        }}
                    >
                        {badges.map((badge, index) => (
                            <div
                                key={`${badge.label}-${index}`}
                                style={{
                                    padding: "12px 16px",
                                    border: `1px solid ${badgeBorder}`,
                                    borderRadius: 12,
                                    background: "#FFFFFF",
                                    fontSize: isMobile ? 12 : 13,
                                    fontWeight: 600,
                                    color: textColor,
                                    minHeight: 44,
                                    display: "inline-flex",
                                    alignItems: "center",
                                }}
                            >
                                {badge.label}
                            </div>
                        ))}
                    </div>
                )}

                <div
                    style={{
                        borderTop: `1px solid ${lineColor}`,
                        paddingTop: 18,
                        display: "flex",
                        justifyContent: isMobile
                            ? "flex-start"
                            : "space-between",
                        alignItems: isMobile ? "flex-start" : "center",
                        flexDirection: isMobile ? "column" : "row",
                        gap: 16,
                        flexWrap: "wrap",
                    }}
                >
                    <div
                        style={{
                            fontSize: 13,
                            lineHeight: 1.5,
                            color: mutedColor,
                        }}
                    >
                        {copyrightText}
                    </div>

                    <div
                        style={{
                            fontSize: 13,
                            lineHeight: 1.5,
                            color: mutedColor,
                        }}
                    >
                        Independent specialist in villa holidays in France
                    </div>
                </div>
            </div>
        </footer>
    )
}

function heroRowStyle(
    isMobile: boolean,
    lineColor: string
): React.CSSProperties {
    return {
        display: "grid",
        gridTemplateColumns: isMobile
            ? "1fr"
            : "minmax(340px, 1fr) 220px 220px",
        gap: isMobile ? 0 : 56,
        alignItems: "start",
        paddingBottom: isMobile ? 0 : 4,
    }
}

function AccordionSection({
    title,
    isOpen,
    onToggle,
    children,
    lineColor,
    textColor,
}: {
    title: string
    isOpen: boolean
    onToggle: () => void
    children: React.ReactNode
    lineColor: string
    textColor: string
}) {
    return (
        <div style={{ borderTop: `1px solid ${lineColor}` }}>
            <button
                onClick={onToggle}
                style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: "20px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: textColor,
                    fontSize: 18,
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    cursor: "pointer",
                    textAlign: "left",
                }}
            >
                <span>{title}</span>
                <span style={{ fontSize: 28, lineHeight: 1 }}>
                    {isOpen ? "−" : "+"}
                </span>
            </button>

            {isOpen && <div>{children}</div>}
        </div>
    )
}

FMFooter.defaultProps = {
    brandName: "French Maison",
    strapline:
        "French Maison is an independent specialist in villa holidays in France, offering a more personal, guided booking experience.",
    supportEmail: "info@frenchmaison.co.uk",
    basedInText: "Based in the UK",
    copyrightText: "© 2026 French Maison. All rights reserved.",

    logoText: "French\nMaison",
    logoImage: undefined,
    logoImageHeight: 64,
    logoImageScale: 1,
    logoOffsetX: 0,
    logoOffsetY: 0,
    logoSpacingBottom: 16,

    link1Label: "About French Maison",
    link1Href: "/about",
    link2Label: "How booking works",
    link2Href: "/how-booking-works",
    link3Label: "Contact",
    link3Href: "/contact",
    link4Label: "Privacy Policy",
    link4Href: "/privacy-policy",
    link5Label: "Terms",
    link5Href: "/terms",
    link6Label: "Journal",
    link6Href: "/blog",

    trust1: "Specialist in villa holidays in France",
    trust2: "Personal booking support",
    trust3: "Availability confirmed before payment",
    trust4: "Independent UK-based brand",

    showTrustRow: true,
    showLogoBadges: true,

    badge1: "Secure payment",
    badge2: "Trusted partner network",
    badge3: "Guided booking support",
    badge4: "UK-based support",

    background: "#F8F6F2",
    textColor: "#163B63",
    mutedColor: "rgba(22,59,99,0.72)",
    lineColor: "rgba(22,59,99,0.12)",
    badgeBackground: "#FFFFFF",
    badgeBorder: "rgba(22,59,99,0.12)",
    linkColor: "#163B63",
    maxWidth: 1440,
    paddingTop: 40,
    paddingBottom: 28,
    sidePadding: 32,
}

addPropertyControls(FMFooter, {
    brandName: {
        type: ControlType.String,
        title: "Brand",
        defaultValue: "French Maison",
    },
    strapline: {
        type: ControlType.String,
        title: "Strapline",
        displayTextArea: true,
        defaultValue:
            "French Maison is an independent specialist in villa holidays in France, offering a more personal, guided booking experience.",
    },
    supportEmail: {
        type: ControlType.String,
        title: "Email",
        defaultValue: "info@frenchmaison.co.uk",
    },
    basedInText: {
        type: ControlType.String,
        title: "Based In",
        defaultValue: "Based in the UK",
    },
    copyrightText: {
        type: ControlType.String,
        title: "Copyright",
        defaultValue: "© 2026 French Maison. All rights reserved.",
    },
    logoText: {
        type: ControlType.String,
        title: "Logo Text",
        defaultValue: "French\nMaison",
    },
    logoImage: {
        type: ControlType.Image,
        title: "Logo Image",
    },
    logoImageHeight: {
        type: ControlType.Number,
        title: "Logo Size",
        defaultValue: 64,
        min: 24,
        max: 180,
        step: 2,
    },
    logoImageScale: {
        type: ControlType.Number,
        title: "Logo Scale",
        defaultValue: 1,
        min: 0.6,
        max: 2,
        step: 0.05,
    },
    logoOffsetX: {
        type: ControlType.Number,
        title: "Logo X",
        defaultValue: 0,
        min: -120,
        max: 120,
        step: 1,
    },
    logoOffsetY: {
        type: ControlType.Number,
        title: "Logo Y",
        defaultValue: 0,
        min: -120,
        max: 120,
        step: 1,
    },
    logoSpacingBottom: {
        type: ControlType.Number,
        title: "Logo Gap",
        defaultValue: 16,
        min: 0,
        max: 48,
        step: 2,
    },

    link1Label: {
        type: ControlType.String,
        title: "Link 1",
        defaultValue: "About French Maison",
    },
    link1Href: {
        type: ControlType.String,
        title: "URL 1",
        defaultValue: "/about",
    },
    link2Label: {
        type: ControlType.String,
        title: "Link 2",
        defaultValue: "How booking works",
    },
    link2Href: {
        type: ControlType.String,
        title: "URL 2",
        defaultValue: "/how-booking-works",
    },
    link3Label: {
        type: ControlType.String,
        title: "Link 3",
        defaultValue: "Contact",
    },
    link3Href: {
        type: ControlType.String,
        title: "URL 3",
        defaultValue: "/contact",
    },
    link4Label: {
        type: ControlType.String,
        title: "Link 4",
        defaultValue: "Privacy Policy",
    },
    link4Href: {
        type: ControlType.String,
        title: "URL 4",
        defaultValue: "/privacy-policy",
    },
    link5Label: {
        type: ControlType.String,
        title: "Link 5",
        defaultValue: "Terms",
    },
    link5Href: {
        type: ControlType.String,
        title: "URL 5",
        defaultValue: "/terms",
    },
    link6Label: {
        type: ControlType.String,
        title: "Link 6",
        defaultValue: "Journal",
    },
    link6Href: {
        type: ControlType.String,
        title: "URL 6",
        defaultValue: "/blog",
    },

    trust1: {
        type: ControlType.String,
        title: "Trust 1",
        defaultValue: "Specialist in villa holidays in France",
    },
    trust2: {
        type: ControlType.String,
        title: "Trust 2",
        defaultValue: "Personal booking support",
    },
    trust3: {
        type: ControlType.String,
        title: "Trust 3",
        defaultValue: "Availability confirmed before payment",
    },
    trust4: {
        type: ControlType.String,
        title: "Trust 4",
        defaultValue: "Independent UK-based brand",
    },

    showTrustRow: {
        type: ControlType.Boolean,
        title: "Trust Row",
        defaultValue: true,
    },
    showLogoBadges: {
        type: ControlType.Boolean,
        title: "Logo Badges",
        defaultValue: true,
    },

    badge1: {
        type: ControlType.String,
        title: "Badge 1",
        defaultValue: "Secure payment",
    },
    badge2: {
        type: ControlType.String,
        title: "Badge 2",
        defaultValue: "Trusted partner network",
    },
    badge3: {
        type: ControlType.String,
        title: "Badge 3",
        defaultValue: "Guided booking support",
    },
    badge4: {
        type: ControlType.String,
        title: "Badge 4",
        defaultValue: "UK-based support",
    },

    background: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#F8F6F2",
    },
    textColor: {
        type: ControlType.Color,
        title: "Text",
        defaultValue: "#163B63",
    },
    mutedColor: {
        type: ControlType.Color,
        title: "Muted",
        defaultValue: "rgba(22,59,99,0.72)",
    },
    lineColor: {
        type: ControlType.Color,
        title: "Lines",
        defaultValue: "rgba(22,59,99,0.12)",
    },
    badgeBackground: {
        type: ControlType.Color,
        title: "Badge BG",
        defaultValue: "#FFFFFF",
    },
    badgeBorder: {
        type: ControlType.Color,
        title: "Badge Border",
        defaultValue: "rgba(22,59,99,0.12)",
    },
    linkColor: {
        type: ControlType.Color,
        title: "Links",
        defaultValue: "#163B63",
    },

    maxWidth: {
        type: ControlType.Number,
        title: "Max Width",
        defaultValue: 1440,
        min: 900,
        max: 1800,
        step: 10,
    },
    paddingTop: {
        type: ControlType.Number,
        title: "Top Pad",
        defaultValue: 40,
        min: 16,
        max: 120,
        step: 2,
    },
    paddingBottom: {
        type: ControlType.Number,
        title: "Bottom Pad",
        defaultValue: 28,
        min: 16,
        max: 120,
        step: 2,
    },
    sidePadding: {
        type: ControlType.Number,
        title: "Side Pad",
        defaultValue: 32,
        min: 12,
        max: 80,
        step: 2,
    },
})
