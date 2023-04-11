set -e
MODE=${1:-production}
npx webpack --mode=$MODE
cp html/index.html dist/
sass css/styles.scss dist/styles.css --style=compressed --no-source-map
sass css/vendor/simple.css dist/simple.css --style=compressed --no-source-map
cp css/vendor/github-corner.css dist/
cp static/*.json dist/
cp static/favicon.svg dist/
cp -r static/previews dist/
