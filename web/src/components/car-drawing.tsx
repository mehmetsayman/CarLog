import type { CSSProperties } from "react";

import { getDictionary } from "@/lib/i18n/server";

/**
 * Figure 1: the vehicle itself, drawn as a side elevation with the hood up.
 *
 * The open hood is the point of the drawing: a report is what you would see
 * if you could open the car's past the way a mechanic opens its engine bay.
 * Each numbered callout is something the registry keeps a record of; the
 * upper row sits around the engine bay, the lower row along the body. The one
 * red callout is the record that can never be removed.
 *
 * Colours are the theme's tokens, applied as styles rather than SVG attributes
 * so the drawing reverses with the rest of the sheet in the dark theme.
 */

const C = {
  ink: "var(--color-ink)",
  ink2: "var(--color-ink-2)",
  ink3: "var(--color-ink-3)",
  hair: "var(--color-hair)",
  paper: "var(--color-paper)",
  paper2: "var(--color-paper-2)",
  band: "var(--color-band)",
  red: "var(--color-red)",
  tire: "var(--color-tire)",
  shade: "var(--color-shade)",
} as const;

/** Fill and stroke as a style, where CSS variables always resolve. */
function paint(fill: string, stroke?: string): CSSProperties {
  return stroke ? { fill, stroke } : { fill };
}

const MONO: CSSProperties = { fontFamily: "var(--font-mono)" };
const LABEL: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontWeight: 700,
  fontVariationSettings: '"wdth" 80',
};

type CalloutKey = "vin" | "km" | "service" | "repair" | "parts" | "accident";

type Callout = {
  n: number;
  key: CalloutKey;
  at: readonly [number, number];
  to: readonly [number, number];
  /** Which side of the marker the text sits on. */
  side: "left" | "right";
  alert?: boolean;
};

const CALLOUTS: readonly Callout[] = [
  { n: 2, key: "km", at: [322, 78], to: [510, 178], side: "right" },
  { n: 1, key: "vin", at: [462, 78], to: [549, 197], side: "right" },
  { n: 3, key: "service", at: [700, 78], to: [606, 180], side: "left" },
  { n: 6, key: "repair", at: [318, 392], to: [330, 252], side: "right" },
  { n: 4, key: "parts", at: [492, 392], to: [528, 316], side: "right" },
  { n: 5, key: "accident", at: [690, 392], to: [680, 266], side: "left", alert: true },
];

const WHEELS = [200, 540];
const AXLE_Y = 292;
const TIRE_R = 48;
const ARCH_R = 56;

/** The hood, rotated up about its hinge at the base of the windshield. */
const HINGE = [557, 198] as const;
const HOOD_TIP = [636, 118] as const;

export async function CarDrawing() {
  const { t } = await getDictionary();

  return (
    <figure className="m-0">
      <div className="fig-frame overflow-hidden">
        <svg
          viewBox="0 0 720 430"
          role="img"
          aria-labelledby="fig1-title"
          className="block h-auto w-full"
        >
          <title id="fig1-title">{t.car.title}</title>

          <defs>
            <pattern id="car-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M20 0H0V20"
                strokeWidth="1"
                style={{ fill: "none", stroke: C.hair, opacity: 0.45 }}
              />
            </pattern>
            <pattern
              id="car-hatch"
              width="5"
              height="5"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="5" strokeWidth="0.8" style={{ stroke: C.ink3 }} />
            </pattern>
            <linearGradient id="car-glass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: C.band }} />
              <stop offset="1" style={{ stopColor: C.paper2 }} />
            </linearGradient>
            <linearGradient id="car-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: C.paper }} />
              <stop offset="0.62" style={{ stopColor: C.paper }} />
              <stop offset="1" style={{ stopColor: C.paper2 }} />
            </linearGradient>
          </defs>
          <rect width="720" height="430" fill="url(#car-grid)" />

          {/* Corner annotations */}
          <text x="24" y="30" fontSize="10" letterSpacing="1" style={{ ...LABEL, fill: C.ink }}>
            {t.car.view}
          </text>
          <text x="24" y="44" fontSize="9" style={{ ...MONO, fill: C.ink3 }}>
            {t.car.notToScale}
          </text>
          <text
            x="696"
            y="30"
            fontSize="10"
            letterSpacing="1"
            textAnchor="end"
            style={{ ...LABEL, fill: C.ink }}
          >
            CL-1
          </text>
          <text x="696" y="44" fontSize="9" textAnchor="end" style={{ ...MONO, fill: C.ink3 }}>
            {t.car.oneVehicle}
          </text>

          {/* Ground and shadow */}
          <ellipse cx="382" cy="341" rx="316" ry="7" style={paint(C.band)} />
          <line x1="40" y1="340" x2="700" y2="340" strokeWidth="1.2" style={{ stroke: C.ink }} />

          {/* Engine bay: what shows above the wings with the hood raised */}
          <g strokeWidth="1.1" strokeLinejoin="round" style={{ stroke: C.ink }}>
            <path d="M566 204 L566 186 L578 186 L578 204 Z" style={paint(C.ink2)} />
            <line x1="569" y1="186" x2="569" y2="182" strokeWidth="2" />
            <line x1="575" y1="186" x2="575" y2="182" strokeWidth="2" />
            <path
              d="M582 208 L583 186 Q584 176 594 176 L622 176 Q632 176 632 186 L633 208 Z"
              style={paint(C.band)}
            />
            {[594, 602, 610, 618].map((x) => (
              <line
                key={x}
                x1={x}
                y1="182"
                x2={x}
                y2="204"
                strokeWidth="0.8"
                style={{ stroke: C.ink3 }}
              />
            ))}
            <circle cx="624" cy="180" r="3" style={paint(C.paper2)} />
            <path d="M637 209 L638 190 L660 190 L663 210 Z" style={paint(C.paper)} />
            <line x1="641" y1="198" x2="659" y2="198" strokeWidth="0.8" style={{ stroke: C.ink3 }} />
          </g>

          {/* Wheel-arch shadows, behind the body */}
          {WHEELS.map((cx) => (
            <path
              key={cx}
              d={`M${cx - ARCH_R} ${AXLE_Y} A${ARCH_R} ${ARCH_R} 0 0 1 ${cx + ARCH_R} ${AXLE_Y} Z`}
              style={paint(C.shade)}
            />
          ))}

          {/* Body: one outline, both wheel arches cut out */}
          <path
            d={[
              "M100 296",
              "C86 296 78 290 78 278",
              "L76 250",
              "C76 236 82 228 94 224",
              "L106 217",
              "C132 209 172 206 216 204",
              "C246 178 276 154 312 143",
              "C350 132 420 130 456 134",
              "C480 137 500 149 520 165",
              "L556 197",
              "L646 206",
              "C664 208 673 214 677 224",
              "L683 254",
              "C685 276 678 292 664 296",
              `L${WHEELS[1] + ARCH_R + 2} 296`,
              `L${WHEELS[1] + ARCH_R} ${AXLE_Y}`,
              `A${ARCH_R} ${ARCH_R} 0 0 0 ${WHEELS[1] - ARCH_R} ${AXLE_Y}`,
              `L${WHEELS[0] + ARCH_R} ${AXLE_Y}`,
              `A${ARCH_R} ${ARCH_R} 0 0 0 ${WHEELS[0] - ARCH_R} ${AXLE_Y}`,
              `L${WHEELS[0] - ARCH_R - 2} 296`,
              "Z",
            ].join(" ")}
            fill="url(#car-body)"
            strokeWidth="1.8"
            strokeLinejoin="round"
            style={{ stroke: C.ink }}
          />

          {/* Side glass, B-pillar and reflections */}
          <path
            d="M242 200 C266 178 292 160 322 152 C356 144 420 142 452 146 C474 150 492 160 508 174 L533 198 Z"
            fill="url(#car-glass)"
            strokeWidth="1.3"
            strokeLinejoin="round"
            style={{ stroke: C.ink }}
          />
          <path d="M392 144 L401 144 L401 199 L392 199 Z" style={paint(C.ink)} />
          <g stroke="#ffffff" opacity="0.55">
            <path d="M280 196 L318 156" strokeWidth="5" />
            <path d="M296 196 L330 160" strokeWidth="2" />
            <path d="M428 196 L462 150" strokeWidth="4" />
          </g>

          {/* Beltline, crease, door cuts, handles, sill */}
          <g fill="none" strokeWidth="1" style={{ stroke: C.ink }}>
            <path d="M214 205 L540 202" />
            <path d="M266 205 C262 230 262 262 268 286" />
            <line x1="397" y1="203" x2="397" y2="288" />
            <path d="M530 202 C538 232 530 266 512 288" />
            <path d="M268 286 L512 288" />
            <rect x="236" y="214" width="14" height="12" rx="2" strokeWidth="0.9" />
            <path d="M600 278 L680 276" />
            <path d="M80 262 L140 262" />
          </g>
          <path
            d="M100 230 C260 223 500 219 668 223"
            fill="none"
            strokeWidth="0.9"
            style={{ stroke: C.ink3 }}
          />
          <rect x="344" y="212" width="22" height="5" rx="2.5" style={paint(C.ink2)} />
          <rect x="470" y="211" width="22" height="5" rx="2.5" style={paint(C.ink2)} />
          <path d="M256 290 L484 290" strokeWidth="2.4" style={{ stroke: C.ink }} />

          {/* Mirror */}
          <path d="M514 192 L530 186 Q538 185 538 192 L536 200 L518 200 Z" style={paint(C.ink)} />

          {/* Lamps and grille */}
          <path
            d="M644 209 L670 214 Q677 218 678 229 L656 229 Q648 222 644 209 Z"
            strokeWidth="1.2"
            style={paint(C.paper2, C.ink)}
          />
          <line x1="652" y1="220" x2="674" y2="222" strokeWidth="0.8" style={{ stroke: C.ink3 }} />
          {[256, 262, 268].map((y) => (
            <line
              key={y}
              x1="658"
              y1={y}
              x2="682"
              y2={y - 1}
              strokeWidth="1.2"
              style={{ stroke: C.ink2 }}
            />
          ))}
          <path d="M78 229 L104 221 L105 229 L79 236 Z" style={paint(C.red)} />

          {/* Hood, raised on its prop rod */}
          <path
            d={`M${HINGE[0]} ${HINGE[1]} Q596 148 ${HOOD_TIP[0]} ${HOOD_TIP[1]} L${HOOD_TIP[0] + 10} ${HOOD_TIP[1] + 8} Q606 160 ${HINGE[0] + 8} ${HINGE[1] + 3} Z`}
            strokeWidth="1.6"
            strokeLinejoin="round"
            style={paint(C.paper2, C.ink)}
          />
          <path
            d={`M${HINGE[0] + 5} ${HINGE[1] - 2} Q600 153 ${HOOD_TIP[0] + 3} ${HOOD_TIP[1] + 4}`}
            strokeWidth="0.8"
            strokeDasharray="3 2"
            style={{ fill: "none", stroke: C.ink3 }}
          />
          <path
            d={`M${HOOD_TIP[0]} ${HOOD_TIP[1]} L${HOOD_TIP[0] + 4} ${HOOD_TIP[1] - 5} L${HOOD_TIP[0] + 13} ${HOOD_TIP[1] + 2} L${HOOD_TIP[0] + 10} ${HOOD_TIP[1] + 8} Z`}
            style={paint(C.ink)}
          />
          <line x1="650" y1="210" x2="626" y2="142" strokeWidth="1.8" style={{ stroke: C.ink }} />
          <circle cx="626" cy="142" r="2" style={paint(C.ink)} />
          <circle cx={HINGE[0]} cy={HINGE[1]} r="3" style={paint(C.ink)} />

          {/* Wheels: tyre, alloy, brake disc, centre lines */}
          {WHEELS.map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={AXLE_Y} r={TIRE_R} strokeWidth="1" style={paint(C.tire, C.ink3)} />
              <circle
                cx={cx}
                cy={AXLE_Y}
                r={TIRE_R - 4}
                strokeWidth="1"
                style={{ fill: "none", stroke: C.ink2 }}
              />
              <circle cx={cx} cy={AXLE_Y} r="33" strokeWidth="3" style={paint(C.ink2, C.paper2)} />
              <circle cx={cx} cy={AXLE_Y} r="22" fill="url(#car-hatch)" />
              {[0, 72, 144, 216, 288].map((deg) => {
                const point = (angle: number, radius: number) => {
                  const rad = ((deg + angle - 90) * Math.PI) / 180;
                  return `${(cx + Math.cos(rad) * radius).toFixed(1)} ${(AXLE_Y + Math.sin(rad) * radius).toFixed(1)}`;
                };
                return (
                  <path
                    key={deg}
                    d={`M${point(-14, 8)} L${point(-9, 31)} L${point(9, 31)} L${point(14, 8)} Z`}
                    strokeWidth="0.8"
                    strokeLinejoin="round"
                    style={paint(C.paper2, C.ink)}
                  />
                );
              })}
              <circle cx={cx} cy={AXLE_Y} r="8" strokeWidth="1" style={paint(C.paper2, C.ink)} />
              <circle cx={cx} cy={AXLE_Y} r="2.5" style={paint(C.ink)} />
              <g strokeWidth="0.8" strokeDasharray="10 3 2 3" style={{ stroke: C.hair }}>
                <line x1={cx - 66} y1={AXLE_Y} x2={cx + 66} y2={AXLE_Y} />
                <line x1={cx} y1={AXLE_Y - 64} x2={cx} y2={AXLE_Y + 58} />
              </g>
            </g>
          ))}

          {/* Wheelbase dimension */}
          <g strokeWidth="0.8" style={{ stroke: C.ink3 }}>
            <line x1={WHEELS[0]} y1="352" x2={WHEELS[0]} y2="362" />
            <line x1={WHEELS[1]} y1="352" x2={WHEELS[1]} y2="362" />
            <line x1={WHEELS[0]} y1="357" x2={WHEELS[1]} y2="357" />
          </g>
          <rect x="330" y="351" width="80" height="12" style={paint(C.paper)} />
          <text x="370" y="360" fontSize="9" textAnchor="middle" style={{ ...MONO, fill: C.ink3 }}>
            {t.car.wheelbase}
          </text>

          {/* Callouts */}
          {CALLOUTS.map((c) => {
            const color = c.alert ? C.red : C.ink;
            const text = t.car.callouts[c.key];
            const textX = c.side === "right" ? c.at[0] + 17 : c.at[0] - 17;
            const anchor = c.side === "right" ? "start" : "end";
            return (
              <g key={c.n}>
                {/* Leave the marker vertically, clear of the label, then angle in. */}
                <polyline
                  points={`${c.at[0]},${c.at[1]} ${c.at[0]},${c.at[1] + (c.to[1] > c.at[1] ? 34 : -34)} ${c.to[0]},${c.to[1]}`}
                  strokeWidth="1"
                  style={{ fill: "none", stroke: color }}
                />
                <circle cx={c.to[0]} cy={c.to[1]} r="3" strokeWidth="1.4" style={paint(C.paper, color)} />
                <circle cx={c.at[0]} cy={c.at[1]} r="11" style={paint(color)} />
                <text
                  x={c.at[0]}
                  y={c.at[1] + 4}
                  fontSize="11"
                  textAnchor="middle"
                  style={{ ...LABEL, fill: C.paper }}
                >
                  {c.n}
                </text>
                <text
                  x={textX}
                  y={c.at[1] - 1}
                  fontSize="12"
                  textAnchor={anchor}
                  style={{ ...LABEL, fill: color }}
                >
                  {text.label}
                </text>
                <text
                  x={textX}
                  y={c.at[1] + 11}
                  fontSize="9.5"
                  textAnchor={anchor}
                  style={{ ...MONO, fill: C.ink3 }}
                >
                  {text.sub}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="fig-cap">
        <b>{t.common.figure} 1.</b> {t.car.caption}
      </figcaption>
    </figure>
  );
}
