set -e

MODE=${1:-production}

npx webpack --mode=$MODE

cp html/index.html dist/

cp css/vendor/github-corner.css dist/
if [ "$MODE" == "production" ]; then
    ./build_css.sh
else
    sass css/styles.scss dist/styles.css --style=compressed --no-source-map
    sass css/vendor/simple.css dist/simple.css --style=compressed --no-source-map
fi

cp static/*.json dist/
cp static/favicon.svg dist/
cp -r static/previews dist/
