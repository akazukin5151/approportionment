# to ensure clean build
rm -r typescript/dist
rm -r typescript/node_modules
rm -r pkg
rm -r target/wasm32-unknown-unknown

# build
wasm-pack build --target web
cd typescript
npm ci
npm run dev

# open
cd dist
python -m http.server 8000
# Open http://0.0.0.0:8000/ in browser
