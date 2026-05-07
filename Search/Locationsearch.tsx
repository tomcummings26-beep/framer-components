import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

type DestinationOption = {
    label: string
    shortLabel: string
    path?: string
    region?: string
    subRegion?: string
}

type StayOption = {
    label: string
    shortLabel: string
    availabilityTag?: string
    month?: string
    year?: string
}

type Props = {
    resultsPath: string
    heading: string
    searchButtonLabel: string
    stayPrompt: string
    wherePrompt: string
    includeMonths2026: boolean
}

const ACCENT = "#153852"
const GOLD = "#D9A62E"
const PANEL = "#F7F3EE"
const BORDER = "#E6DED3"
const TEXT_MUTED = "#756B60"
const PAGE_MAX_WIDTH = 1360
const ALL_VILLAS_PATH = "/villatype/villas"
const AVAILABILITY_PATHS: Record<string, string> = {
    "Available in next 30 days": "/byavailability/30days",
    "Summer Holiday 2026 Availability": "/byavailability/summerholiday",
    "Peak Season 2026 Availability": "/byavailability/peak",
}

const DESTINATIONS: DestinationOption[] = [
    {
        label: "Don't mind",
        shortLabel: "Anywhere in France",
    },
    {
        label: "Provence",
        shortLabel: "Provence",
        path: "popular-regions/southoffrance/provence",
        region: "South of France",
        subRegion: "Provence",
    },
    {
        label: "French Riviera",
        shortLabel: "French Riviera",
        path: "popular-regions/southoffrance/frenchriviera",
        region: "South of France",
        subRegion: "French Riviera",
    },
    {
        label: "Languedoc",
        shortLabel: "Languedoc",
        path: "popular-regions/southoffrance/languedoc",
        region: "South of France",
        subRegion: "Languedoc",
    },
    {
        label: "Rhone",
        shortLabel: "Rhone",
        path: "popular-regions/southoffrance/rhone",
        region: "South of France",
        subRegion: "Rhone",
    },
    {
        label: "Champagne",
        shortLabel: "Champagne",
        path: "popular-regions/northernfrance/champagne",
        region: "Northern France",
        subRegion: "Champagne",
    },
    {
        label: "Normandy",
        shortLabel: "Normandy",
        path: "popular-regions/northernfrance/normandy",
        region: "Northern France",
        subRegion: "Normandy",
    },
    {
        label: "Aquitaine",
        shortLabel: "Aquitaine",
        path: "popular-regions/southwestfrance/aquitaine",
        region: "South West France",
        subRegion: "Aquitaine",
    },
    {
        label: "Dordogne",
        shortLabel: "Dordogne",
        path: "popular-regions/southwestfrance/dordogne",
        region: "South West France",
        subRegion: "Dordogne",
    },
    {
        label: "Pyrenees",
        shortLabel: "Pyrenees",
        path: "popular-regions/southwestfrance/pyrenees",
        region: "South West France",
        subRegion: "Pyrenees",
    },
    {
        label: "Brittany",
        shortLabel: "Brittany",
        path: "popular-regions/brittanyatlantic/brittany",
        region: "Brittany & Atlantic Coast",
        subRegion: "Brittany",
    },
    {
        label: "Atlantic Coast",
        shortLabel: "Atlantic Coast",
        path: "popular-regions/brittanyatlantic/atlanticcoast",
        region: "Brittany & Atlantic Coast",
        subRegion: "Atlantic Coast",
    },
    {
        label: "Ile de Re",
        shortLabel: "Ile de Re",
        path: "popular-regions/brittanyatlantic/iledere",
        region: "Brittany & Atlantic Coast",
        subRegion: "Ile de Re",
    },
    {
        label: "Burgundy",
        shortLabel: "Burgundy",
        path: "popular-regions/burgundy",
        region: "Burgundy",
    },
    {
        label: "Loire Valley",
        shortLabel: "Loire Valley",
        path: "popular-regions/loirevalley",
        region: "Loire Valley",
    },
    {
        label: "Paris",
        shortLabel: "Paris",
        path: "popular-regions/paris",
        region: "Paris",
    },
]

const MONTH_OPTIONS_2026: StayOption[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
].map((month) => ({
    label: `${month} 2026`,
    shortLabel: `${month} 2026`,
    availabilityTag: `Available in ${month}`,
    month,
    year: "2026",
}))

const STAY_HIGHLIGHTS: StayOption[] = [
    {
        label: "Summer Holiday 2026",
        shortLabel: "Summer Holiday 2026",
        availabilityTag: "Summer Holiday 2026 Availability",
        year: "2026",
    },
    {
        label: "Peak Season 2026",
        shortLabel: "Peak Season 2026",
        availabilityTag: "Peak Season 2026 Availability",
        year: "2026",
    },
    {
        label: "Next 30 Days",
        shortLabel: "Next 30 Days",
        availabilityTag: "Available in next 30 days",
    },
]

export default function HomePageSearch({
    resultsPath = "search",
    heading = "Find your perfect villa",
    searchButtonLabel = "Search",
    stayPrompt = "When do you want to stay?",
    wherePrompt = "Where?",
    includeMonths2026 = true,
}: Props) {
    const [selectedStay, setSelectedStay] = useState<StayOption | null>(null)
    const [selectedDestination, setSelectedDestination] =
        useState<DestinationOption>(DESTINATIONS[0])
    const [activePanel, setActivePanel] = useState<"stay" | "where" | null>(
        null
    )
    const [isMobile, setIsMobile] = useState(false)

    const wrapperRef = useRef<HTMLDivElement>(null)

    const stayOptions = useMemo(() => {
        const visibleMonths2026 = MONTH_OPTIONS_2026.filter(
            shouldShowMonthOption
        )

        return includeMonths2026
            ? [...STAY_HIGHLIGHTS, ...visibleMonths2026]
            : STAY_HIGHLIGHTS
    }, [includeMonths2026])

    useEffect(() => {
        const updateViewport = () => {
            setIsMobile(window.innerWidth < 768)
        }

        updateViewport()
        window.addEventListener("resize", updateViewport)
        return () => window.removeEventListener("resize", updateViewport)
    }, [])

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setActivePanel(null)
            }
        }

        document.addEventListener("mousedown", handleOutsideClick)
        return () =>
            document.removeEventListener("mousedown", handleOutsideClick)
    }, [])

    const goToResults = () => {
        const destinationIsAnywhere =
            selectedDestination.label === "Don't mind" ||
            !selectedDestination.path

        const chosenPath = resolveSearchPath(
            destinationIsAnywhere,
            selectedDestination.path,
            selectedStay,
            resultsPath
        )
        const params = new URLSearchParams()

        if (selectedStay?.availabilityTag) {
            params.set("availability", selectedStay.availabilityTag)
            params.set("when", selectedStay.label)
        }

        if (selectedDestination.label !== "Don't mind") {
            params.set("where", selectedDestination.label)
        }

        if (selectedDestination.region) {
            params.set("region", selectedDestination.region)
        }

        if (selectedDestination.subRegion) {
            params.set("sub_region", selectedDestination.subRegion)
        }

        const query = params.toString()
        window.location.href = query ? `${chosenPath}?${query}` : chosenPath
    }

    return (
        <div
            ref={wrapperRef}
            style={{
                width: "100%",
                color: ACCENT,
                fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
            }}
        >
            <div style={pageShellStyle(isMobile)}>
                <div style={outerShellStyle(isMobile)}>
                    <div style={headingWrapStyle(isMobile)}>
                        <div style={eyebrowStyle}>Villa Search</div>
                        <div
                            role="heading"
                            aria-level={2}
                            style={headingStyle(isMobile)}
                        >
                            {heading}
                        </div>
                    </div>

                    <div style={searchShellStyle(isMobile)}>
                        <div style={fieldWrapStyle}>
                            <SearchField
                                title={stayPrompt}
                                value={selectedStay?.shortLabel || "Any time"}
                                hint="Browse months and key holiday periods"
                                isOpen={activePanel === "stay"}
                                isMobile={isMobile}
                                onClick={() =>
                                    setActivePanel(
                                        activePanel === "stay" ? null : "stay"
                                    )
                                }
                                icon={<CalendarIcon />}
                            />

                            {activePanel === "stay" && (
                                <DropdownPanel isMobile={isMobile}>
                                    {stayOptions.map((option) => {
                                        const selected =
                                            selectedStay?.label === option.label

                                        return (
                                            <OptionRow
                                                key={option.label}
                                                title={option.label}
                                                subtitle={
                                                    option.availabilityTag
                                                        ? `Uses tag: ${option.availabilityTag}`
                                                        : "Flexible search"
                                                }
                                                selected={selected}
                                                onClick={() => {
                                                    setSelectedStay(option)
                                                    setActivePanel(null)
                                                }}
                                            />
                                        )
                                    })}
                                </DropdownPanel>
                            )}
                        </div>

                        {!isMobile && <Divider />}

                        <div style={fieldWrapStyle}>
                            <SearchField
                                title={wherePrompt}
                                value={selectedDestination.shortLabel}
                                hint="Choose a region or keep it flexible"
                                isOpen={activePanel === "where"}
                                isMobile={isMobile}
                                onClick={() =>
                                    setActivePanel(
                                        activePanel === "where" ? null : "where"
                                    )
                                }
                                icon={<PinIcon />}
                            />

                            {activePanel === "where" && (
                                <DropdownPanel isMobile={isMobile}>
                                    {DESTINATIONS.map((option) => {
                                        const selected =
                                            selectedDestination.label ===
                                            option.label

                                        return (
                                            <OptionRow
                                                key={option.label}
                                                title={option.label}
                                                subtitle={
                                                    option.region &&
                                                    option.subRegion
                                                        ? `${option.region} • ${option.subRegion}`
                                                        : option.region ||
                                                          "Search all French regions"
                                                }
                                                selected={selected}
                                                onClick={() => {
                                                    setSelectedDestination(
                                                        option
                                                    )
                                                    setActivePanel(null)
                                                }}
                                            />
                                        )
                                    })}
                                </DropdownPanel>
                            )}
                        </div>

                        <button
                            onClick={goToResults}
                            style={buttonStyle(isMobile)}
                        >
                            {searchButtonLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const pageShellStyle = (isMobile: boolean): React.CSSProperties => ({
    width: "100%",
    maxWidth: PAGE_MAX_WIDTH,
    margin: "0 auto",
    padding: isMobile ? "0 16px" : "0 24px",
    boxSizing: "border-box",
})

function SearchField({
    title,
    value,
    hint,
    icon,
    isOpen,
    isMobile,
    onClick,
}: {
    title: string
    value: string
    hint: string
    icon: React.ReactNode
    isOpen: boolean
    isMobile: boolean
    onClick: () => void
}) {
    return (
        <button onClick={onClick} style={fieldStyle(isOpen, isMobile)}>
            <div style={iconWrapStyle}>{icon}</div>
            <div style={{ flex: 1, textAlign: "left" }}>
                <div style={fieldTitleStyle}>{title}</div>
                <div style={fieldValueStyle(value)}>{value}</div>
                <div style={fieldHintStyle}>{hint}</div>
            </div>
            <div style={chevronStyle(isOpen)}>⌄</div>
        </button>
    )
}

function DropdownPanel({
    children,
    isMobile,
}: {
    children: React.ReactNode
    isMobile: boolean
}) {
    return <div style={dropdownStyle(isMobile)}>{children}</div>
}

function OptionRow({
    title,
    subtitle,
    selected,
    onClick,
}: {
    title: string
    subtitle: string
    selected: boolean
    onClick: () => void
}) {
    return (
        <button onClick={onClick} style={optionStyle(selected)}>
            <div style={optionTitleStyle}>{title}</div>
            <div style={optionSubtitleStyle}>{subtitle}</div>
        </button>
    )
}

function Divider() {
    return (
        <div
            style={{
                width: 1,
                alignSelf: "stretch",
                background: BORDER,
                minHeight: 64,
            }}
        />
    )
}

function PinIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
                d="M12 21s6-5.7 6-11a6 6 0 1 0-12 0c0 5.3 6 11 6 11Z"
                stroke={ACCENT}
                strokeWidth="1.7"
            />
            <circle cx="12" cy="10" r="2.4" fill={GOLD} />
        </svg>
    )
}

function CalendarIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect
                x="3.5"
                y="5.5"
                width="17"
                height="15"
                rx="2.5"
                stroke={ACCENT}
                strokeWidth="1.7"
            />
            <path
                d="M7.5 3.8v3.4M16.5 3.8v3.4M3.5 9.5h17"
                stroke={ACCENT}
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <circle cx="9" cy="13.2" r="1" fill={GOLD} />
            <circle cx="12.5" cy="13.2" r="1" fill={GOLD} />
            <circle cx="16" cy="13.2" r="1" fill={GOLD} />
        </svg>
    )
}

const outerShellStyle = (isMobile: boolean): React.CSSProperties => ({
    width: "100%",
    background: PANEL,
    borderRadius: isMobile ? 28 : 32,
    padding: isMobile ? "16px 14px 14px" : "16px 20px 18px",
    boxSizing: "border-box",
    boxShadow: "0 16px 40px rgba(21,56,82,0.08)",
    border: `1px solid ${BORDER}`,
    position: "relative",
    zIndex: 40,
    overflow: "visible",
})

const headingWrapStyle = (isMobile: boolean): React.CSSProperties => ({
    marginBottom: isMobile ? 10 : 12,
})

const eyebrowStyle: React.CSSProperties = {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    fontSize: 10,
    fontWeight: 700,
    color: TEXT_MUTED,
    marginBottom: 4,
}

const headingStyle = (isMobile: boolean): React.CSSProperties => ({
    margin: 0,
    fontSize: isMobile ? 22 : 30,
    lineHeight: isMobile ? 1 : 0.98,
    fontWeight: 500,
    letterSpacing: "-0.02em",
    fontFamily:
        '"Cormorant Garamond", "Libre Baskerville", Georgia, "Times New Roman", serif',
})

const searchShellStyle = (isMobile: boolean): React.CSSProperties => ({
    position: "relative",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? 8 : 0,
    alignItems: "stretch",
    background: "#FFFDFC",
    borderRadius: isMobile ? 22 : 26,
    border: `1px solid ${BORDER}`,
    padding: isMobile ? 8 : 8,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
    zIndex: 41,
    overflow: "visible",
})

const fieldWrapStyle: React.CSSProperties = {
    position: "relative",
    flex: 1,
    minWidth: 0,
}

const fieldStyle = (
    isOpen: boolean,
    isMobile: boolean
): React.CSSProperties => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "none",
    background: isOpen ? "#F4EEE6" : "transparent",
    borderRadius: 16,
    padding: isMobile ? "10px 10px" : "10px 12px",
    cursor: "pointer",
    minHeight: isMobile ? 56 : 58,
    color: ACCENT,
})

const iconWrapStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "#FBF4E1",
    flexShrink: 0,
}

const fieldTitleStyle: React.CSSProperties = {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: TEXT_MUTED,
    marginBottom: 2,
}

const fieldValueStyle = (value: string): React.CSSProperties => ({
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: value ? ACCENT : "#8F857A",
    marginBottom: 1,
})

const fieldHintStyle: React.CSSProperties = {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    fontSize: 10,
    color: "#8F857A",
    lineHeight: 1.25,
}

const chevronStyle = (isOpen: boolean): React.CSSProperties => ({
    fontSize: 18,
    color: TEXT_MUTED,
    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
    transition: "transform 0.18s ease",
    lineHeight: 1,
})

const buttonStyle = (isMobile: boolean): React.CSSProperties => ({
    border: "none",
    background: GOLD,
    color: "#23190B",
    borderRadius: 16,
    minWidth: isMobile ? "100%" : 148,
    minHeight: isMobile ? 48 : 58,
    padding: isMobile ? "12px 16px" : "0 24px",
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    fontWeight: 700,
    fontSize: isMobile ? 16 : 15,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(217,166,46,0.26)",
})

const dropdownStyle = (isMobile: boolean): React.CSSProperties => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: "calc(100% + 6px)",
    background: "#FFFDFC",
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: 6,
    boxShadow: "0 20px 42px rgba(21,56,82,0.12)",
    zIndex: 9999,
    maxHeight: isMobile ? 240 : 300,
    overflowY: "auto",
})

function normalizePath(path: string) {
    if (!path) return "/"
    return path.startsWith("/") ? path : `/${path}`
}

function resolveSearchPath(
    destinationIsAnywhere: boolean,
    destinationPath: string | undefined,
    selectedStay: StayOption | null,
    fallbackPath: string
) {
    if (!destinationIsAnywhere) {
        return normalizePath(destinationPath || fallbackPath)
    }

    if (selectedStay?.month) {
        return ALL_VILLAS_PATH
    }

    if (selectedStay?.availabilityTag) {
        return (
            AVAILABILITY_PATHS[selectedStay.availabilityTag] ||
            normalizePath(fallbackPath)
        )
    }

    return ALL_VILLAS_PATH
}

function shouldShowMonthOption(option: StayOption) {
    if (!option.month || !option.year) return true

    const monthIndex = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ].indexOf(option.month)

    if (monthIndex === -1) return true

    const now = new Date()
    const optionYear = Number(option.year)
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    if (optionYear > currentYear) return true
    if (optionYear < currentYear) return false

    return monthIndex >= currentMonth
}

const optionStyle = (selected: boolean): React.CSSProperties => ({
    width: "100%",
    border: "none",
    background: selected ? "#F4EEE6" : "transparent",
    borderRadius: 12,
    padding: "10px 12px",
    textAlign: "left",
    cursor: "pointer",
    color: ACCENT,
})

const optionTitleStyle: React.CSSProperties = {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 2,
}

const optionSubtitleStyle: React.CSSProperties = {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    fontSize: 11,
    color: TEXT_MUTED,
}

addPropertyControls(HomePageSearch, {
    resultsPath: {
        type: ControlType.String,
        title: "Results Path",
        defaultValue: "search",
        placeholder: "search",
    },
    heading: {
        type: ControlType.String,
        title: "Heading",
        defaultValue: "Find your perfect villa",
    },
    stayPrompt: {
        type: ControlType.String,
        title: "Stay Label",
        defaultValue: "When do you want to stay?",
    },
    wherePrompt: {
        type: ControlType.String,
        title: "Where Label",
        defaultValue: "Where?",
    },
    searchButtonLabel: {
        type: ControlType.String,
        title: "Button",
        defaultValue: "Search",
    },
    includeMonths2026: {
        type: ControlType.Boolean,
        title: "Show Months",
        defaultValue: true,
    },
})
