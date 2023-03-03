/* eslint-disable no-magic-numbers */

import { Rgb } from "../types/core";

function compute_max_saturation(a: number, b: number): number {
  // Max saturation will be when one of r, g or b goes below zero.

  // Select different coefficients depending on which component goes below zero first
  let k0, k1, k2, k3, k4, wl, wm, ws;

  if (-1.88170328 * a - 0.80936493 * b > 1) {
    // Red component
    k0 = +1.19086277; k1 = +1.76576728; k2 = +0.59662641; k3 = +0.75515197; k4 = +0.56771245;
    wl = +4.0767416621; wm = -3.3077115913; ws = +0.2309699292;
  }
  else if (1.81444104 * a - 1.19445276 * b > 1) {
    // Green component
    k0 = +0.73956515; k1 = -0.45954404; k2 = +0.08285427; k3 = +0.12541070; k4 = +0.14503204;
    wl = -1.2684380046; wm = +2.6097574011; ws = -0.3413193965;
  }
  else {
    // Blue component
    k0 = +1.35733652; k1 = -0.00915799; k2 = -1.15130210; k3 = -0.50559606; k4 = +0.00692167;
    wl = -0.0041960863; wm = -0.7034186147; ws = +1.7076147010;
  }

  // Approximate max saturation using a polynomial:
  let S = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;

  // Do one step Halley's method to get closer
  // this gives an error less than 10e6, except for some blue hues where the dS/dh is close to infinite
  // this should be sufficient for most applications, otherwise do two/three steps 

  const k_l = +0.3963377774 * a + 0.2158037573 * b;
  const k_m = -0.1055613458 * a - 0.0638541728 * b;
  const k_s = -0.0894841775 * a - 1.2914855480 * b;

  {
    const l_ = 1 + S * k_l;
    const m_ = 1 + S * k_m;
    const s_ = 1 + S * k_s;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    const l_dS = 3 * k_l * l_ * l_;
    const m_dS = 3 * k_m * m_ * m_;
    const s_dS = 3 * k_s * s_ * s_;

    const l_dS2 = 6 * k_l * k_l * l_;
    const m_dS2 = 6 * k_m * k_m * m_;
    const s_dS2 = 6 * k_s * k_s * s_;

    const f = wl * l + wm * m + ws * s;
    const f1 = wl * l_dS + wm * m_dS + ws * s_dS;
    const f2 = wl * l_dS2 + wm * m_dS2 + ws * s_dS2;

    S = S - f * f1 / (f1 * f1 - 0.5 * f * f2);
  }

  return S;
}

type Cusp = { L_cusp: number, C_cusp: number }

function find_cusp(a: number, b: number): Cusp {
  // First, find the maximum saturation (saturation S = C/L)
  const S_cusp = compute_max_saturation(a, b);

  // Convert to linear sRGB to find the first point where at least one of r,g or b >= 1:
  const rgb_at_max = oklab_to_linear_srgb(1, S_cusp * a, S_cusp * b);
  const L_cusp = Math.cbrt(1 / Math.max(Math.max(rgb_at_max.r, rgb_at_max.g), rgb_at_max.b));
  const C_cusp = L_cusp * S_cusp;

  return { L_cusp, C_cusp };
}

function find_gamut_intersection(a: number, b: number, L1: number, C1: number, L0: number, cusp: Cusp | null = null): number {
  if (!cusp) {
    // Find the cusp of the gamut triangle
    cusp = find_cusp(a, b);
  }

  // Find the intersection for upper and lower half seprately
  let t;
  if (((L1 - L0) * cusp.C_cusp - (cusp.L_cusp - L0) * C1) <= 0) {
    // Lower half

    t = cusp.C_cusp * L0 / (C1 * cusp.L_cusp + cusp.C_cusp * (L0 - L1));
  }
  else {
    // Upper half

    // First intersect with triangle
    t = cusp.C_cusp * (L0 - 1) / (C1 * (cusp.L_cusp - 1) + cusp.C_cusp * (L0 - L1));

    // Then one step Halley's method
    {
      const dL = L1 - L0;
      const dC = C1;

      const k_l = +0.3963377774 * a + 0.2158037573 * b;
      const k_m = -0.1055613458 * a - 0.0638541728 * b;
      const k_s = -0.0894841775 * a - 1.2914855480 * b;

      const l_dt = dL + dC * k_l;
      const m_dt = dL + dC * k_m;
      const s_dt = dL + dC * k_s;


      // If higher accuracy is required, 2 or 3 iterations of the following block can be used:
      {
        const L = L0 * (1 - t) + t * L1;
        const C = t * C1;

        const l_ = L + C * k_l;
        const m_ = L + C * k_m;
        const s_ = L + C * k_s;

        const l = l_ * l_ * l_;
        const m = m_ * m_ * m_;
        const s = s_ * s_ * s_;

        const ldt = 3 * l_dt * l_ * l_;
        const mdt = 3 * m_dt * m_ * m_;
        const sdt = 3 * s_dt * s_ * s_;

        const ldt2 = 6 * l_dt * l_dt * l_;
        const mdt2 = 6 * m_dt * m_dt * m_;
        const sdt2 = 6 * s_dt * s_dt * s_;

        const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s - 1;
        const r1 = 4.0767416621 * ldt - 3.3077115913 * mdt + 0.2309699292 * sdt;
        const r2 = 4.0767416621 * ldt2 - 3.3077115913 * mdt2 + 0.2309699292 * sdt2;

        const u_r = r1 / (r1 * r1 - 0.5 * r * r2);
        let t_r = -r * u_r;

        const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s - 1;
        const g1 = -1.2684380046 * ldt + 2.6097574011 * mdt - 0.3413193965 * sdt;
        const g2 = -1.2684380046 * ldt2 + 2.6097574011 * mdt2 - 0.3413193965 * sdt2;

        const u_g = g1 / (g1 * g1 - 0.5 * g * g2);
        let t_g = -g * u_g;

        const b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s - 1;
        const b1 = -0.0041960863 * ldt - 0.7034186147 * mdt + 1.7076147010 * sdt;
        const b2 = -0.0041960863 * ldt2 - 0.7034186147 * mdt2 + 1.7076147010 * sdt2;

        const u_b = b1 / (b1 * b1 - 0.5 * b * b2);
        let t_b = -b * u_b;

        t_r = u_r >= 0 ? t_r : 10e5;
        t_g = u_g >= 0 ? t_g : 10e5;
        t_b = u_b >= 0 ? t_b : 10e5;

        t += Math.min(t_r, Math.min(t_g, t_b));
      }
    }
  }

  return t;
}

function get_ST_max(a_: number, b_: number, cusp: Cusp | null = null) {
  if (!cusp) {
    cusp = find_cusp(a_, b_);
  }

  const L = cusp.L_cusp;
  const C = cusp.C_cusp;
  return [C / L, C / (1 - L)];
}

function get_Cs(L: number, a_: number, b_: number) {
  const cusp = find_cusp(a_, b_);

  const C_max = find_gamut_intersection(a_, b_, L, 1, L, cusp);
  const ST_max = get_ST_max(a_, b_, cusp);

  const S_mid = 0.11516993 + 1 / (
    + 7.44778970 + 4.15901240 * b_
    + a_ * (- 2.19557347 + 1.75198401 * b_
      + a_ * (- 2.13704948 - 10.02301043 * b_
        + a_ * (- 4.24894561 + 5.38770819 * b_ + 4.69891013 * a_
        )))
  );

  const T_mid = 0.11239642 + 1 / (
    + 1.61320320 - 0.68124379 * b_
    + a_ * (+ 0.40370612 + 0.90148123 * b_
      + a_ * (- 0.27087943 + 0.61223990 * b_
        + a_ * (+ 0.00299215 - 0.45399568 * b_ - 0.14661872 * a_
        )))
  );

  const k = C_max / Math.min((L * ST_max[0]!), (1 - L) * ST_max[1]!);

  let C_mid;
  {
    const C_a = L * S_mid;
    const C_b = (1 - L) * T_mid;

    C_mid = 0.9 * k * Math.sqrt(Math.sqrt(1 / (1 / (C_a * C_a * C_a * C_a) + 1 / (C_b * C_b * C_b * C_b))));
  }

  let C_0;
  {
    const C_a = L * 0.4;
    const C_b = (1 - L) * 0.8;

    C_0 = Math.sqrt(1 / (1 / (C_a * C_a) + 1 / (C_b * C_b)));
  }

  return [C_0, C_mid, C_max];
}

function srgb_transfer_function(a: number): number {
  return .0031308 >= a ? 12.92 * a : 1.055 * Math.pow(a, .4166666666666667) - .055
}

function oklab_to_linear_srgb(L: number, a: number, b: number): Rgb {

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: (+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: (-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: (-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  }
}

function toe_inv(x: number): number {
  const k_1 = 0.206
  const k_2 = 0.03
  const k_3 = (1 + k_1) / (1 + k_2)
  return (x * x + k_1 * x) / (k_3 * (x + k_2))
}

export function okhsl_to_srgb(h: number, s: number, l: number): Rgb {
  if (l == 1) {
    return { r: 255, g: 255, b: 255 };
  }

  else if (l == 0) {
    return { r: 0, g: 0, b: 0 };
  }

  const a_ = Math.cos(2 * Math.PI * h);
  const b_ = Math.sin(2 * Math.PI * h);
  const L = toe_inv(l);

  const Cs = get_Cs(L, a_, b_);
  const C_0 = Cs[0]!;
  const C_mid = Cs[1]!;
  const C_max = Cs[2]!;

  let t, k_0, k_1, k_2;
  if (s < 0.8) {
    t = 1.25 * s;
    k_0 = 0;
    k_1 = 0.8 * C_0;
    k_2 = (1 - k_1 / C_mid);
  }
  else {
    t = 5 * (s - 0.8);
    k_0 = C_mid;
    k_1 = 0.2 * C_mid * C_mid * 1.25 * 1.25 / C_0;
    k_2 = (1 - (k_1) / (C_max - C_mid));
  }

  const C = k_0 + t * k_1 / (1 - k_2 * t);

  // If we would only use one of the Cs:
  //C = s*C_0;
  //C = s*1.25*C_mid;
  //C = s*C_max;

  const rgb = oklab_to_linear_srgb(L, C * a_, C * b_);
  return {
    r: 255 * srgb_transfer_function(rgb.r),
    g: 255 * srgb_transfer_function(rgb.g),
    b: 255 * srgb_transfer_function(rgb.b),
  }
}

