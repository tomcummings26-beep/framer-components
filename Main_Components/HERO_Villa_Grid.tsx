import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

// ✅ Cloudflare image proxy helper
const getOptimizedImage = (url: string, width: number, quality = 80) => {
    const base = "https://img.frenchmaison.co.uk/"
    if (!url) return ""

    const standardWidths = [400, 800, 1200, 1600, 2000]
    const roundToNearest = (target: number) =>
        standardWidths.reduce((prev, curr) =>
            Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
        )

    const dpr =
        typeof window !== "undefined"
            ? Math.min(window.devicePixelRatio || 1, 2)
            : 1

    const finalWidth = roundToNearest(Math.round(width * dpr))
    return `${base}?url=${encodeURIComponent(url)}&width=${finalWidth}&quality=${quality}`
}

type Villa = {
    villa_id: number | string
    name: string
    region: string
    sub_region: string
    country: string
    capacity: number
    bedrooms: number
    bathrooms: number
    main_photo: string
    photos?: string[]
    url: string
    description: string
    availability_tags?: string[]
    price_gbp_min?: number
    price_gbp_max?: number
    has_pool?: boolean
    is_family_villa?: boolean
    is_large_villa?: boolean
    is_luxury_villa?: boolean
}

type Props = {
    monthTag?: string
    region?: string
    excludeRegion?: string
    sub_region?: string
    minCapacity?: number
    limit?: number
    requirePool?: boolean
    requireFamily?: boolean
    requireLarge?: boolean
    requireLuxury?: boolean
    titleLuxury?: string
    titlePool?: string
    titleFamily?: string
    titleLarge?: string
    titleMonth?: string
}

type AvailabilityFilterOption = {
    label: string
    availabilityTag: string
    month?: string
    year?: string
}

const SELECTED_HEX = "#153852"
const MONTH_NAMES = [
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
] as const

const AVAILABILITY_FILTER_OPTIONS: AvailabilityFilterOption[] = [
    {
        label: "Next 30 Days",
        availabilityTag: "Available in next 30 days",
    },
    {
        label: "Peak Season 2026",
        availabilityTag: "Peak Season 2026 Availability",
    },
    {
        label: "Summer Holiday 2026",
        availabilityTag: "Summer Holiday 2026 Availability",
    },
    ...MONTH_NAMES.map((month) => ({
        label: `${month} 2026`,
        availabilityTag: `Available in ${month}`,
        month,
        year: "2026",
    })),
]
const PRICE_FILTER_VALUES = new Set([
    "under3k",
    "3to5",
    "5to10",
    "10to15",
    "15plus",
])
const CAPACITY_FILTER_VALUES = new Set([
    "2",
    "4",
    "6",
    "8",
    "10",
    "12",
    "14",
    "15",
])

const getUrlFilterState = () => {
    if (typeof window === "undefined") {
        return {
            availability: "",
            when: "",
            region: "",
            subRegion: "",
            price: "",
            sleeps: "",
        }
    }

    const params = new URLSearchParams(window.location.search)
    const price = params.get("price") || ""
    const sleeps = params.get("sleeps") || ""

    return {
        availability: params.get("availability") || "",
        when: params.get("when") || "",
        region: params.get("region") || "",
        subRegion: params.get("sub_region") || "",
        price: PRICE_FILTER_VALUES.has(price) ? price : "",
        sleeps: CAPACITY_FILTER_VALUES.has(sleeps) ? sleeps : "",
    }
}

function shouldShowMonthAvailability(option: AvailabilityFilterOption) {
    if (!option.month || !option.year) return true

    const monthIndex = MONTH_NAMES.indexOf(option.month)
    if (monthIndex === -1) return true

    const now = new Date()
    const optionYear = Number(option.year)
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    if (optionYear > currentYear) return true
    if (optionYear < currentYear) return false

    return monthIndex >= currentMonth
}

export default function FilteredVillasGrid({
    monthTag = "",
    region = "",
    excludeRegion = "",
    sub_region = "",
    minCapacity = 0,
    limit = 12,
    requirePool = false,
    requireFamily = false,
    requireLarge = false,
    requireLuxury = false,
    titleLuxury = "Luxury Villas",
    titlePool = "With Pool",
    titleFamily = "Family Villas",
    titleLarge = "Large Villas",
    titleMonth = "",
}: Props) {
    const [allVillas, setAllVillas] = useState<Villa[]>([])
    const [visibleCount, setVisibleCount] = useState(limit)
    const [loaded, setLoaded] = useState(false)
    const [urlFilters, setUrlFilters] = useState(() => {
        const { availability, when, region, subRegion } = getUrlFilterState()
        return { availability, when, region, subRegion }
    })

    const [priceFilter, setPriceFilter] = useState<string>(
        () => getUrlFilterState().price
    )
    const [capacityFilter, setCapacityFilter] = useState<string>(
        () => getUrlFilterState().sleeps
    )

    const effectiveMonthTag =
        urlFilters.availability && urlFilters.availability.trim() !== ""
            ? urlFilters.availability
            : monthTag
    const effectiveRegion =
        region && region.trim() !== "" ? region : urlFilters.region
    const effectiveSubRegion =
        sub_region && sub_region.trim() !== ""
            ? sub_region
            : urlFilters.subRegion
    const displayLocationLabel =
        effectiveSubRegion && effectiveSubRegion.trim() !== ""
            ? effectiveSubRegion
            : effectiveRegion
    const displayMonthLabel =
        titleMonth && titleMonth.trim() !== ""
            ? titleMonth
            : urlFilters.when || effectiveMonthTag
    const visibleAvailabilityOptions = useMemo(
        () => AVAILABILITY_FILTER_OPTIONS.filter(shouldShowMonthAvailability),
        []
    )

    useEffect(() => {
        if (typeof window === "undefined") return

        const syncFromUrl = () => {
            const { availability, when, region, subRegion, price, sleeps } =
                getUrlFilterState()

            setUrlFilters({ availability, when, region, subRegion })
            setPriceFilter(price)
            setCapacityFilter(sleeps)
        }

        syncFromUrl()
        window.addEventListener("popstate", syncFromUrl)
        return () => window.removeEventListener("popstate", syncFromUrl)
    }, [])

    useEffect(() => {
        setVisibleCount(limit)
    }, [priceFilter, capacityFilter, limit])

    useEffect(() => {
        if (typeof window === "undefined") return

        const params = new URLSearchParams(window.location.search)

        if (priceFilter) params.set("price", priceFilter)
        else params.delete("price")

        if (capacityFilter) params.set("sleeps", capacityFilter)
        else params.delete("sleeps")

        const search = params.toString()
        const nextUrl = `${window.location.pathname}${
            search ? `?${search}` : ""
        }${window.location.hash}`

        window.history.replaceState(window.history.state, "", nextUrl)
    }, [priceFilter, capacityFilter])

    useEffect(() => {
        setLoaded(false)

        fetch("https://villa-api-production.up.railway.app/villas")
            .then((res) => res.json())
            .then((data: Villa[]) => {
                let filtered = data.filter((v) => Boolean(v.main_photo))

                if (effectiveMonthTag && effectiveMonthTag.trim() !== "") {
                    filtered = filtered.filter(
                        (v) =>
                            Array.isArray(v.availability_tags) &&
                            v.availability_tags.includes(effectiveMonthTag)
                    )
                }

                if (requirePool) {
                    filtered = filtered.filter((v) => v.has_pool === true)
                }

                if (requireFamily) {
                    filtered = filtered.filter(
                        (v) => v.is_family_villa === true
                    )
                }

                if (requireLarge) {
                    filtered = filtered.filter((v) => v.is_large_villa === true)
                }

                if (requireLuxury) {
                    filtered = filtered.filter(
                        (v) => v.is_luxury_villa === true
                    )
                }

                if (effectiveRegion && effectiveRegion.trim() !== "") {
                    filtered = filtered.filter(
                        (v) => v.region === effectiveRegion
                    )
                }

                if (excludeRegion && excludeRegion.trim() !== "") {
                    filtered = filtered.filter(
                        (v) => v.region !== excludeRegion
                    )
                }

                if (effectiveSubRegion && effectiveSubRegion.trim() !== "") {
                    filtered = filtered.filter(
                        (v) => v.sub_region === effectiveSubRegion
                    )
                }

                if (minCapacity && minCapacity > 0) {
                    filtered = filtered.filter(
                        (v) => (v.capacity || 0) >= minCapacity
                    )
                }

                setAllVillas(filtered)
            })
            .catch((err) => {
                console.error("Error fetching villas:", err)
                setAllVillas([])
            })
            .finally(() => setLoaded(true))
    }, [
        effectiveMonthTag,
        effectiveRegion,
        excludeRegion,
        effectiveSubRegion,
        minCapacity,
        requirePool,
        requireFamily,
        requireLarge,
        requireLuxury,
    ])

    const userFilteredVillas = useMemo(() => {
        let filtered = allVillas.filter((villa) => {
            const max = villa.price_gbp_max || 0
            const cap = villa.capacity || 0

            let pricePass = true
            if (priceFilter === "under3k") pricePass = max < 3000
            else if (priceFilter === "3to5")
                pricePass = max >= 3000 && max < 5000
            else if (priceFilter === "5to10")
                pricePass = max >= 5000 && max < 10000
            else if (priceFilter === "10to15")
                pricePass = max >= 10000 && max < 15000
            else if (priceFilter === "15plus") pricePass = max >= 15000

            let capacityPass = true
            if (capacityFilter) {
                const required = parseInt(capacityFilter, 10)
                if (!isNaN(required)) capacityPass = cap >= required
            }

            return pricePass && capacityPass
        })

        const priceValue = (v: Villa) => {
            const min = v.price_gbp_min ?? 0
            const max = v.price_gbp_max ?? 0
            if (min > 0) return min
            if (max > 0) return max
            return Number.POSITIVE_INFINITY
        }

        filtered.sort((a, b) => {
            const capA = a.capacity || 0
            const capB = b.capacity || 0
            const pA = priceValue(a)
            const pB = priceValue(b)

            if (capacityFilter) {
                if (capA !== capB) return capA - capB
                return pA - pB
            }

            if (priceFilter) {
                if (pA !== pB) return pA - pB
                return capA - capB
            }

            if (pA !== pB) return pA - pB
            return capA - capB
        })

        return filtered
    }, [allVillas, priceFilter, capacityFilter])

    if (!loaded) return <p>Loading villas...</p>
    if (loaded && userFilteredVillas.length === 0) {
        return <p>No villas match this collection yet.</p>
    }

    const visibleVillas = userFilteredVillas.slice(0, visibleCount)
    const hasMore = visibleCount < userFilteredVillas.length

    const hasTopPills =
        requireLuxury ||
        requirePool ||
        requireFamily ||
        requireLarge ||
        (displayLocationLabel && displayLocationLabel.trim() !== "") ||
        (displayMonthLabel && displayMonthLabel.trim() !== "")
    const updateAvailabilityFilter = (availability: string) => {
        const matchingOption = AVAILABILITY_FILTER_OPTIONS.find(
            (option) => option.availabilityTag === availability
        )

        setUrlFilters((current) => ({
            ...current,
            availability,
            when: matchingOption?.label || "",
        }))

        if (typeof window === "undefined") return

        const params = new URLSearchParams(window.location.search)
        if (availability) {
            params.set("availability", availability)
            params.set("when", matchingOption?.label || availability)
        } else {
            params.delete("availability")
            params.delete("when")
        }

        const search = params.toString()
        const nextUrl = `${window.location.pathname}${
            search ? `?${search}` : ""
        }${window.location.hash}`

        window.history.replaceState(window.history.state, "", nextUrl)
    }

    return (
        <div style={{ width: "100%" }}>
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "24px",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={labelStyle}>Availability</label>
                    <select
                        value={
                            visibleAvailabilityOptions.some(
                                (option) =>
                                    option.availabilityTag === effectiveMonthTag
                            )
                                ? effectiveMonthTag
                                : ""
                        }
                        onChange={(e) =>
                            updateAvailabilityFilter(e.target.value)
                        }
                        style={selectStyle}
                    >
                        <option value="">Any Availability</option>
                        {visibleAvailabilityOptions.map((option) => (
                            <option
                                key={option.availabilityTag}
                                value={option.availabilityTag}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={labelStyle}>Weekly Price</label>
                    <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="">All Prices</option>
                        <option value="under3k">Below £3k</option>
                        <option value="3to5">£3k–£5k</option>
                        <option value="5to10">£5k–£10k</option>
                        <option value="10to15">£10k–£15k</option>
                        <option value="15plus">£15k+</option>
                    </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={labelStyle}>Sleeps</label>
                    <select
                        value={capacityFilter}
                        onChange={(e) => setCapacityFilter(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="">All Sizes</option>
                        {[2, 4, 6, 8, 10, 12, 14, 15].map((num) => (
                            <option key={num} value={num}>
                                Sleeps {num}+
                            </option>
                        ))}
                    </select>
                </div>

                {hasTopPills && (
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                            alignItems: "center",
                            position: "relative",
                            top: "8px",
                        }}
                    >
                        {requireLuxury && (
                            <span style={pillStyle}>{titleLuxury}</span>
                        )}
                        {requirePool && (
                            <span style={pillStyle}>{titlePool}</span>
                        )}
                        {requireFamily && (
                            <span style={pillStyle}>{titleFamily}</span>
                        )}
                        {requireLarge && (
                            <span style={pillStyle}>{titleLarge}</span>
                        )}
                        {displayLocationLabel &&
                            displayLocationLabel.trim() !== "" && (
                                <span style={pillStyle}>
                                    {displayLocationLabel}
                                </span>
                            )}
                        {displayMonthLabel &&
                            displayMonthLabel.trim() !== "" && (
                                <span style={pillStyle}>
                                    {displayMonthLabel}
                                </span>
                            )}
                    </div>
                )}

                {(urlFilters.availability || priceFilter || capacityFilter) && (
                    <button
                        onClick={() => {
                            updateAvailabilityFilter("")
                            setPriceFilter("")
                            setCapacityFilter("")
                        }}
                        style={resetButtonStyle}
                    >
                        Reset
                    </button>
                )}
            </div>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "20px",
                    justifyContent: "space-between",
                }}
            >
                {visibleVillas.map((villa) => (
                    <VillaCard
                        key={villa.villa_id}
                        villa={villa}
                        monthTag={effectiveMonthTag}
                        requireLuxury={requireLuxury}
                        requirePool={requirePool}
                        requireFamily={requireFamily}
                        requireLarge={requireLarge}
                        titleMonth={displayMonthLabel}
                        titleFamily={titleFamily}
                        titleLarge={titleLarge}
                    />
                ))}
            </div>

            {hasMore && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button
                        onClick={() => setVisibleCount((c) => c + 12)}
                        style={{
                            padding: "10px 18px",
                            background: "#153852",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "15px",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                    >
                        See More Villas ↓
                    </button>
                </div>
            )}
        </div>
    )
}

const labelStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 500,
    marginBottom: "4px",
    color: "#374151",
}

const selectStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    background: "white",
    cursor: "pointer",
    minWidth: "150px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
}

const resetButtonStyle: React.CSSProperties = {
    padding: "9px 14px",
    borderRadius: "8px",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    fontSize: "14px",
}

const pillStyle: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: 600,
    border: `1px solid ${SELECTED_HEX}`,
    background: SELECTED_HEX,
    color: "white",
    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
}

function VillaCard({
    villa,
    monthTag,
    requireLuxury,
    requirePool,
    requireFamily,
    requireLarge,
    titleMonth,
    titleFamily,
    titleLarge,
}: {
    villa: Villa
    monthTag?: string
    requireLuxury: boolean
    requirePool: boolean
    requireFamily: boolean
    requireLarge: boolean
    titleMonth?: string
    titleFamily?: string
    titleLarge?: string
}) {
    const [photoIndex, setPhotoIndex] = useState(0)

    const photos = useMemo(() => {
        const list = villa.photos ? [...villa.photos] : []
        if (villa.main_photo && !list.includes(villa.main_photo)) {
            list.unshift(villa.main_photo)
        }
        return list
    }, [villa.photos, villa.main_photo])

    useEffect(() => {
        const loadSequentially = async () => {
            for (const url of photos) {
                const img = new Image()
                img.src = getOptimizedImage(url, 800)
                await new Promise((r) => setTimeout(r, 200))
            }
        }
        loadSequentially()
    }, [photos])

    const nextPhoto = () => {
        const next = (photoIndex + 1) % photos.length
        const img = new Image()
        img.src = getOptimizedImage(photos[next], 800)
        img.decode?.()
            .then(() => setPhotoIndex(next))
            .catch(() => setPhotoIndex(next))
    }

    const prevPhoto = () => {
        const prev = photoIndex === 0 ? photos.length - 1 : photoIndex - 1
        const img = new Image()
        img.src = getOptimizedImage(photos[prev], 800)
        img.decode?.()
            .then(() => setPhotoIndex(prev))
            .catch(() => setPhotoIndex(prev))
    }

    const min = villa.price_gbp_min ? Math.floor(villa.price_gbp_min) : 0
    const max = villa.price_gbp_max ? Math.floor(villa.price_gbp_max) : 0
    const priceLabel =
        min > 0 && max > 0
            ? `£${min.toLocaleString()} – £${max.toLocaleString()} / week`
            : min > 0
              ? `£${min.toLocaleString()} / week`
              : "Price on request"

    return (
        <div
            style={{
                flex: "1 1 calc(33% - 20px)",
                minWidth: "280px",
                maxWidth: "400px",
                border: "1px solid #ddd",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "214px",
                    backgroundColor: "#f5f5f5",
                    overflow: "hidden",
                }}
            >
                {photos.map((url, i) => (
                    <img
                        key={i}
                        src={getOptimizedImage(url, 800)}
                        alt={villa.name}
                        width="800"
                        height="600"
                        decoding="async"
                        loading={i === 0 ? "eager" : "lazy"}
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: i === photoIndex ? "block" : "none",
                        }}
                    />
                ))}

                {photos.length > 1 && (
                    <>
                        <button onClick={prevPhoto} style={arrowStyle("left")}>
                            ‹
                        </button>
                        <button onClick={nextPhoto} style={arrowStyle("right")}>
                            ›
                        </button>
                    </>
                )}
            </div>

            <div
                style={{
                    padding: "10px 16px 16px",
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                }}
            >
                <div>
                    <h3
                        style={{
                            fontSize: "18px",
                            marginBottom: "4px",
                            fontWeight: 600,
                            color: "#153852",
                            lineHeight: 1.15,
                        }}
                    >
                        {villa.name}
                    </h3>
                    <p
                        style={{
                            color: "#6b7280",
                            marginBottom: "6px",
                            fontSize: "13px",
                            lineHeight: 1.35,
                        }}
                    >
                        {villa.region} – {villa.sub_region}
                    </p>
                    <p
                        style={{
                            marginBottom: "8px",
                            fontSize: "13px",
                            lineHeight: 1.38,
                            color: "#111827",
                        }}
                    >
                        Sleeps {villa.capacity} • {villa.bedrooms} bedrooms •{" "}
                        {villa.bathrooms} bathrooms
                    </p>
                    <p
                        style={{
                            fontWeight: 600,
                            marginBottom: "12px",
                            color: "#111827",
                            fontSize: "15px",
                            lineHeight: 1.25,
                        }}
                    >
                        {priceLabel}
                    </p>

                    <div style={{ marginBottom: "14px" }}>
                        {requireLuxury && (
                            <Tag
                                bg="#fdf2f8"
                                text="#be185d"
                                label="Luxury Villa"
                            />
                        )}
                        {requirePool && (
                            <Tag bg="#f0fdf4" text="#15803d" label="Pool" />
                        )}
                        {requireFamily && (
                            <Tag
                                bg="#fff7ed"
                                text="#c2410c"
                                label={titleFamily || "Family Villa"}
                            />
                        )}
                        {requireLarge && (
                            <Tag
                                bg="#f5f3ff"
                                text="#6d28d9"
                                label={titleLarge || "Large Villa"}
                            />
                        )}
                        {monthTag && titleMonth && titleMonth.trim() !== "" && (
                            <Tag
                                bg="#eff6ff"
                                text="#1d4ed8"
                                label={titleMonth}
                            />
                        )}
                    </div>
                </div>

                <a
                    href={`/villa?id=${villa.villa_id}`}
                    style={{
                        display: "inline-block",
                        padding: "10px 16px",
                        background: "#153852",
                        color: "white",
                        borderRadius: "10px",
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: "15px",
                        lineHeight: 1.2,
                        alignSelf: "flex-start",
                    }}
                >
                    View Property →
                </a>
            </div>
        </div>
    )
}

function Tag({ bg, text, label }: { bg: string; text: string; label: string }) {
    return (
        <span
            style={{
                display: "inline-block",
                background: bg,
                color: text,
                padding: "4px 8px",
                marginRight: "6px",
                marginBottom: "4px",
                borderRadius: "6px",
                fontSize: "12px",
            }}
        >
            {label}
        </span>
    )
}

const arrowStyle = (side: "left" | "right") => ({
    position: "absolute" as const,
    top: "50%",
    [side]: "12px",
    transform: "translateY(-50%)",
    background: "rgba(17,24,39,0.42)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "34px",
    height: "34px",
    fontSize: "22px",
    fontWeight: 600,
    cursor: "pointer",
    backdropFilter: "blur(6px)",
})

addPropertyControls(FilteredVillasGrid, {
    monthTag: {
        type: ControlType.Enum,
        title: "Availability",
        defaultValue: "",
        options: [
            "",
            "Available in January",
            "Available in February",
            "Available in March",
            "Available in April",
            "Available in May",
            "Available in June",
            "Available in July",
            "Available in August",
            "Available in September",
            "Available in October",
            "Available in November",
            "Available in December",
            "Available in next 30 days",
            "Peak Season 2026 Availability",
            "Summer Holiday 2026 Availability",
        ],
        optionTitles: [
            "None",
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
            "Next 30 Days",
            "Peak Season 2026",
            "Summer Holiday 2026",
        ],
    },
    region: {
        type: ControlType.String,
        title: "Region",
        defaultValue: "",
        placeholder: "e.g. South of France",
    },
    excludeRegion: {
        type: ControlType.String,
        title: "Exclude Region",
        defaultValue: "",
        placeholder: "e.g. Provence",
    },
    sub_region: {
        type: ControlType.String,
        title: "Sub Region",
        defaultValue: "",
        placeholder: "e.g. Languedoc",
    },
    minCapacity: {
        type: ControlType.Number,
        title: "Min Capacity",
        min: 0,
        defaultValue: 0,
    },
    limit: {
        type: ControlType.Number,
        title: "Initial Limit",
        defaultValue: 12,
        min: 1,
    },
    requirePool: {
        type: ControlType.Boolean,
        title: "Pool Only",
        defaultValue: false,
    },
    requireFamily: {
        type: ControlType.Boolean,
        title: "Family Only",
        defaultValue: false,
    },
    requireLarge: {
        type: ControlType.Boolean,
        title: "Large Only",
        defaultValue: false,
    },
    requireLuxury: {
        type: ControlType.Boolean,
        title: "Luxury Only",
        defaultValue: false,
    },
    titleLuxury: {
        type: ControlType.String,
        title: "Luxury Pill",
        defaultValue: "Luxury Villas",
        placeholder: "Optional label",
    },
    titlePool: {
        type: ControlType.String,
        title: "Pool Pill",
        defaultValue: "With Pool",
        placeholder: "Optional label",
    },
    titleFamily: {
        type: ControlType.String,
        title: "Family Pill",
        defaultValue: "Family Villas",
        placeholder: "Optional label",
    },
    titleLarge: {
        type: ControlType.String,
        title: "Large Pill",
        defaultValue: "Large Villas",
        placeholder: "Optional label",
    },
    titleMonth: {
        type: ControlType.String,
        title: "Availability Pill",
        defaultValue: "",
        placeholder: "Optional override",
    },
})
