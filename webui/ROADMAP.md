# fix

adding parties doesnt work for color wheel

---

1. disable real time progress bar
2. run
3. enable progress bar
4. run
5. no progress bar appears

---

1. set n voters to 1000 (or something that takes long enough)
2. run (run button disabled now)
3. change a setting (eg method)
4. run button pulses (despite not clickable and still running)

--- 

- when popup is covering load example button, hovering the button causes the highlight to show over the popup, despite having a lower z index

---

performance issues in rotating color wheel when increase contrast is enabled

# refactor

(lib): not all voters should follow a single strategy, but voters don't use different strategies in a uniform way. one sided strategy is more interesting to simulate. for now just have every voter follow a single strategy -- it's just that having a slider for proportion isn't the most ideal either, so don't spend too much time designing it.

# features

- RRV party bullet
    - This will require carrying party/coalition info to wasm. might as well also support STV party discipline
- RRV unnormalized linear interpolation

# UI

100, 1000, and 10000 voters are very common. add a button to quickly select them, and a custom input field for others.

or just a (log?) slider from 100 to 10000. anything more is impractical and anything less is not representative anyway.

- when they are lots of candidates, it's hard to distinguish between parties in coalition table, especially when randomly generated candidates ended up with a similar black color

- table headers
    - small caps for headers instead of bold (larger letter spacing if needed)
        - softer colors to blend in with header
    - look at examples like page 244, 130 and 158

- consider de emphasizing h4 section headers, as they're more like labels. maybe normal weight and center?

- better checkbox design (page 222)

- find one or two primary hue, vary colors along saturation/lightness
    - use for primary buttons, run button

- page 251: pulsing colors for the "i"s in the h1
- page 216: background bleed on favicon
- page 232: full "header"/hero "favicon"
