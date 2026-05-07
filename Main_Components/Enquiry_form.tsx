"use client"

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Props = {
    heading: string
    intro: string
    submitLabel: string
    successMessage: string
    source: string
}

type Villa = {
    villa_id: number
    name: string
    region?: string
    sub_region?: string
}

const API_BASE = "https://villa-api-production.up.railway.app"
const ENQUIRY_ENDPOINT = "https://fmenquiry-production.up.railway.app/enquiry"

const ACCENT = "#153852"
const BORDER = "#d7dde6"
const TEXT = "#374151"
const MUTED = "#6b7280"
const PANEL = "#f8f5ef"

export default function EnquiryFormPage({
    heading = "Ask us a question",
    intro = "Tell us a little about your trip and we will come back to you as soon as possible.",
    submitLabel = "Send enquiry",
    successMessage = "Thanks, your enquiry has been sent.",
    source = "Villa Page",
}: Props) {
    const [villaId, setVillaId] = React.useState<number | undefined>(undefined)
    const [villaRegion, setVillaRegion] = React.useState("")
    const [villaInterest, setVillaInterest] = React.useState("")
    const [customerName, setCustomerName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [phone, setPhone] = React.useState("")
    const [message, setMessage] = React.useState("")
    const [arrivalDate, setArrivalDate] = React.useState("")
    const [departureDate, setDepartureDate] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [submitError, setSubmitError] = React.useState("")
    const [submitSuccess, setSubmitSuccess] = React.useState(false)

    const hasVillaContext = Boolean(villaId)

    React.useEffect(() => {
        if (typeof window === "undefined") return

        const params = new URLSearchParams(window.location.search)
        const urlVillaId = params.get("id")
        if (!urlVillaId) return

        const numericId = Number(urlVillaId)
        if (!numericId) return

        fetch(`${API_BASE}/villas`)
            .then((res) => res.json())
            .then((data: Villa[]) => {
                const match = data.find((item) => item.villa_id === numericId)
                if (!match) return

                setVillaId(match.villa_id)
                setVillaInterest(match.name)
                setVillaRegion(
                    match.sub_region
                        ? `${match.sub_region}, ${match.region || ""}`.replace(
                              /,\s*$/,
                              ""
                          )
                        : match.region || ""
                )

                setMessage((prev) =>
                    prev.trim()
                        ? prev
                        : `Hi, I'd like to ask a question about ${match.name}.`
                )
            })
            .catch(() => {})
    }, [])

    function getNights(start: string, end: string) {
        if (!start || !end) return undefined
        const diff = new Date(end).getTime() - new Date(start).getTime()
        if (!Number.isFinite(diff) || diff <= 0) return undefined
        return Math.round(diff / 86400000)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSubmitError("")
        setSubmitSuccess(false)

        if (!customerName.trim()) {
            setSubmitError("Please enter your name.")
            return
        }

        if (!email.trim()) {
            setSubmitError("Please enter your email.")
            return
        }

        if (!message.trim()) {
            setSubmitError("Please enter your question.")
            return
        }

        try {
            setIsSubmitting(true)

            const nights = getNights(arrivalDate, departureDate)
            const pageUrl =
                typeof window !== "undefined" ? window.location.href : ""
            const villaNameValue =
                villaInterest.trim() ||
                (hasVillaContext ? "Villa enquiry" : "General enquiry")
            const villaRegionValue = villaRegion.trim() || "General"
            const villaUrlValue = pageUrl

            const normalizedSource =
                source.trim() === "Standalone Enquiry Page"
                    ? "Villa Page"
                    : source.trim() || "Villa Page"

            const payload: Record<string, any> = {
                customer_name: customerName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                message: message.trim(),
                source: normalizedSource,
                page_url: pageUrl,
                referrer:
                    typeof document !== "undefined" ? document.referrer : "",
                user_agent:
                    typeof navigator !== "undefined" ? navigator.userAgent : "",
                arrival_date: arrivalDate || undefined,
                departure_date: departureDate || undefined,
                nights: typeof nights === "number" ? nights : undefined,
                villa_name: villaNameValue,
                villa_region: villaRegionValue,
                villa_url: villaUrlValue,
            }

            if (hasVillaContext) {
                payload.villa_id = villaId
            }

            const res = await fetch(ENQUIRY_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            const raw = await res.text()
            let data: any = {}

            try {
                data = raw ? JSON.parse(raw) : {}
            } catch {
                data = { raw }
            }

            if (!res.ok) {
                throw new Error(
                    data?.error ||
                        data?.message ||
                        data?.raw ||
                        "Failed to send enquiry"
                )
            }

            setSubmitSuccess(true)
            setCustomerName("")
            setEmail("")
            setPhone("")
            setMessage("")
            setArrivalDate("")
            setDepartureDate("")
            setVillaInterest("")
            setVillaRegion("")
            setVillaId(undefined)
        } catch (error: any) {
            setSubmitError(
                error?.message || "Something went wrong. Please try again."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                <div style={{ marginBottom: 24 }}>
                    <div style={eyebrowStyle}>French Maison</div>
                    <div role="heading" aria-level={1} style={headingStyle}>
                        {heading}
                    </div>
                    <p style={introStyle}>{intro}</p>
                </div>

                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={gridStyle}>
                        <Field
                            label="Full name"
                            value={customerName}
                            onChange={setCustomerName}
                            placeholder="Your name"
                            autoComplete="name"
                        />
                        <Field
                            label="Email"
                            value={email}
                            onChange={setEmail}
                            placeholder="you@example.com"
                            type="email"
                            autoComplete="email"
                        />
                        <Field
                            label="Phone"
                            value={phone}
                            onChange={setPhone}
                            placeholder="Optional"
                            autoComplete="tel"
                        />
                        <Field
                            label="Villa of interest"
                            value={villaInterest}
                            onChange={setVillaInterest}
                            placeholder="Optional"
                        />
                        <Field
                            label="Arrival"
                            value={arrivalDate}
                            onChange={setArrivalDate}
                            type="date"
                        />
                        <Field
                            label="Departure"
                            value={departureDate}
                            onChange={setDepartureDate}
                            type="date"
                        />
                    </div>

                    <div style={{ marginTop: 18 }}>
                        <label style={labelStyle}>Question</label>
                        <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="How can we help?"
                            style={textareaStyle}
                            rows={7}
                        />
                    </div>

                    {submitError ? (
                        <div style={errorStyle}>{submitError}</div>
                    ) : null}

                    {submitSuccess ? (
                        <div style={successStyle}>{successMessage}</div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={submitButtonStyle(isSubmitting)}
                    >
                        {isSubmitting ? "Sending..." : submitLabel}
                    </button>
                </form>
            </div>
        </div>
    )
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    autoComplete,
}: {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: string
    autoComplete?: string
}) {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                autoComplete={autoComplete}
                style={inputStyle}
            />
        </div>
    )
}

const pageStyle: React.CSSProperties = {
    width: "100%",
    padding: "24px",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    background: "#ffffff",
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
}

const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 880,
    background: PANEL,
    border: `1px solid ${BORDER}`,
    borderRadius: 24,
    boxShadow: "0 12px 32px rgba(21,56,82,0.08)",
    padding: "28px",
    boxSizing: "border-box",
}

const eyebrowStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: MUTED,
    marginBottom: 8,
}

const headingStyle: React.CSSProperties = {
    fontFamily:
        '"Cormorant Garamond", "Libre Baskerville", Georgia, "Times New Roman", serif',
    fontSize: 40,
    lineHeight: 0.98,
    letterSpacing: "-0.02em",
    fontWeight: 500,
    color: ACCENT,
    marginBottom: 10,
}

const introStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.7,
    color: TEXT,
}

const formStyle: React.CSSProperties = {
    width: "100%",
}

const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
}

const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: MUTED,
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 48,
    padding: "0 14px",
    borderRadius: 14,
    border: `1px solid ${BORDER}`,
    background: "#ffffff",
    boxSizing: "border-box",
    fontSize: 15,
    color: "#111827",
    outline: "none",
}

const textareaStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 16,
    border: `1px solid ${BORDER}`,
    background: "#ffffff",
    boxSizing: "border-box",
    fontSize: 15,
    lineHeight: 1.6,
    color: "#111827",
    outline: "none",
    resize: "vertical",
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
}

const errorStyle: React.CSSProperties = {
    marginTop: 14,
    color: "#b91c1c",
    fontSize: 14,
}

const successStyle: React.CSSProperties = {
    marginTop: 14,
    color: "#15803d",
    fontSize: 14,
    fontWeight: 600,
}

const submitButtonStyle = (disabled: boolean): React.CSSProperties => ({
    marginTop: 20,
    minHeight: 52,
    padding: "0 20px",
    border: "none",
    borderRadius: 14,
    background: disabled ? "#7f93a4" : ACCENT,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
})

addPropertyControls(EnquiryFormPage, {
    heading: {
        type: ControlType.String,
        title: "Heading",
        defaultValue: "Ask us a question",
    },
    intro: {
        type: ControlType.String,
        title: "Intro",
        defaultValue:
            "Tell us a little about your trip and we will come back to you as soon as possible.",
    },
    submitLabel: {
        type: ControlType.String,
        title: "Button",
        defaultValue: "Send enquiry",
    },
    successMessage: {
        type: ControlType.String,
        title: "Success",
        defaultValue: "Thanks, your enquiry has been sent.",
    },
    source: {
        type: ControlType.String,
        title: "Source",
        defaultValue: "Villa Page",
    },
})
