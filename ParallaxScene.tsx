import { addPropertyControls, ControlType } from "framer"
import { useEffect, useRef, useState } from "react"

/**
 * Last Call Collective — Sticky Parallax Walk-In
 *
 * HOW IT WORKS:
 * The outer wrapper is tall (scrollHeight prop, e.g. 400vh).
 * The inner scene is sticky — it pins to the top of the viewport
 * and stays there while the user scrolls through the full height.
 * Scroll progress (0→1) drives all layer transforms,
 * so it feels like a cinematic dolly push into the bar.
 *
 * Layer 1 = closest (foreground leaves/sign) — moves most
 * Layer 9 = star sky — barely moves
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function ParallaxScene(props) {
    const {
        layer1,
        layer2,
        layer3,
        layer4,
        layer5,
        layer6,
        layer7,
        layer8,
        layer9,
        scrollHeight,
        intensity,
        smoothing,
        scaleZoom,
        scaleStrength,
    } = props

    const outerRef = useRef(null)
    const [progress, setProgress] = useState(0)
    const rafRef = useRef(null)
    const lerpedProgress = useRef(0)

    useEffect(() => {
        function tick() {
            const outer = outerRef.current
            if (!outer) {
                rafRef.current = requestAnimationFrame(tick)
                return
            }
            const rect = outer.getBoundingClientRect()
            const viewH =
                typeof window !== "undefined" ? window.innerHeight : 800
            const outerH = outer.offsetHeight
            const raw = -rect.top / (outerH - viewH)
            const clamped = Math.max(0, Math.min(1, raw))
            lerpedProgress.current +=
                (clamped - lerpedProgress.current) * smoothing
            setProgress(lerpedProgress.current)
            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafRef.current)
    }, [smoothing])

    const layers = [
        layer1,
        layer2,
        layer3,
        layer4,
        layer5,
        layer6,
        layer7,
        layer8,
        layer9,
    ]

    // Exponential depth curve: foreground (i=0) depth=1, sky (i=8) depth≈0.018
    // depth(i) = e^(-i * K)  where K=0.6
    const K = 0.6

    const viewH =
        typeof window !== "undefined" ? window.innerHeight : 800

    return (
        <div
            ref={outerRef}
            style={{
                position: "relative",
                width: "100%",
                height: scrollHeight,
            }}
        >
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    width: "100%",
                    height: "100vh",
                    overflow: "hidden",
                    background: "#000",
                }}
            >
                {layers.map((src, i) => {
                    if (!src) return null
                    const depth = Math.exp(-i * K)
                    const ty = progress * viewH * intensity * depth * -1
                    const scale = scaleZoom
                        ? 1 + progress * scaleStrength * depth
                        : 1
                    const scaleX = scaleZoom
                        ? 1 + progress * scaleStrength * depth * 0.4
                        : 1
                    return (
                        <img
                            key={i}
                            src={typeof src === "string" ? src : src?.src}
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "130%",
                                objectFit: "cover",
                                objectPosition: "center 35%",
                                transform: `translateY(${ty}px) scale(${scaleX}, ${scale})`,
                                transformOrigin: "50% 65%",
                                willChange: "transform",
                            }}
                        />
                    )
                })}
            </div>
        </div>
    )
}

addPropertyControls(ParallaxScene, {
    scrollHeight: {
        title: "Scroll Height",
        type: ControlType.String,
        defaultValue: "400vh",
    },
    intensity: {
        title: "Intensity",
        type: ControlType.Number,
        defaultValue: 0.55,
        min: 0,
        max: 2,
        step: 0.01,
    },
    smoothing: {
        title: "Smoothing",
        type: ControlType.Number,
        defaultValue: 0.07,
        min: 0.01,
        max: 0.5,
        step: 0.01,
    },
    scaleZoom: {
        title: "Scale Zoom",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    scaleStrength: {
        title: "Scale Strength",
        type: ControlType.Number,
        defaultValue: 0.18,
        min: 0,
        max: 1,
        step: 0.01,
    },
    layer1: { title: "Layer 1 — Foreground", type: ControlType.Image },
    layer2: { title: "Layer 2 — Torches", type: ControlType.Image },
    layer3: { title: "Layer 3 — Walkway", type: ControlType.Image },
    layer4: { title: "Layer 4 — Tiki Figures", type: ControlType.Image },
    layer5: { title: "Layer 5 — Sign", type: ControlType.Image },
    layer6: { title: "Layer 6 — Bar Building", type: ControlType.Image },
    layer7: { title: "Layer 7 — Mountains", type: ControlType.Image },
    layer8: { title: "Layer 8 — Earth + Galaxy", type: ControlType.Image },
    layer9: { title: "Layer 9 — Sky", type: ControlType.Image },
})
