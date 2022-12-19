# WebUI frontend

This is the code for the WebUI frontend

## Technologies
- WebAssembly for universal usage
- WebGL for fast plotting (faster than the DOM with d3, or the html canvas)
- Typescript for statically typed code

## Features
- Interactively move coordinates of parties
- Add and remove parties
- Customizable number of voters and number of seats
- Customizable allocation method

## Usage

Install [wasm-pack](https://github.com/rustwasm/wasm-pack/) and npm. If wasm-pack doesn't work, try version 0.9.1

```sh
wasm-pack build --target web -- --features wasm
cd typescript
npm ci
npm run dev  # or npm run build

# Launch an http server
cd dist
python -m http.server 8000
# Open http://0.0.0.0:8000/ in your browser (faster on chromium)
```

