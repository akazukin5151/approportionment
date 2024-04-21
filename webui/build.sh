set -e

MODE=${1:-production}

npx webpack --mode=$MODE

cp -r html/* dist/

cp css/vendor/github-corner.css dist/
if [ "$MODE" == "production" ]; then
    ./build_css.sh
else
    sass css/styles.scss dist/styles.css --style=compressed --no-source-map
    sass css/vendor/simple.css dist/simple.css --style=compressed --no-source-map
fi

cp -r static/examples/ dist/
cp static/favicon.svg dist/
cp -r static/previews dist/
cp -r static/icons dist/
cp -r static/myanimelist dist/
cp -r static/langs dist/
cp -r static/langs_pairwise dist/
