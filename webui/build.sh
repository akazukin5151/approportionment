set -e

MODE=${1:-production}
npx webpack --mode=$MODE

cp html/index.html dist/

sass css/styles.scss dist/styles_.css --style=compressed --no-source-map
sass css/vendor/simple.css dist/simple_.css --style=compressed --no-source-map
cp css/vendor/github-corner.css dist/
node purgecss.mjs
rm dist/styles_.css
rm dist/simple_.css

cp static/*.json dist/
cp static/favicon.svg dist/
cp -r static/previews dist/
