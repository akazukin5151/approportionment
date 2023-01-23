MODE=${1:-production}
npx webpack --mode=$MODE
cp html/index.html dist/
cp css/styles.css dist/
cp vendor/*.css dist/
cp static/default_simulation_result.json dist/
