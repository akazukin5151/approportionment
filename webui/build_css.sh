# build css for production

sass css/styles.scss dist/styles_.css --style=compressed --no-source-map
sass css/vendor/simple.css dist/simple_.css --style=compressed --no-source-map

# the js api doesn't report rejected correctly, but the cli does
# but we can't report and write at the same time, so just duplicate it...
# complicated code wrangling with bash is banned
# ...unfortunately, globbing is "complicated bash". this recursive glob allows
# zero or many subdirectories starting from dist, so this includes dist/*.html,
# and any other html file in the subdirectories of dist.
npx purgecss --css dist/styles_.css --content 'dist/**/*.html' --content 'dist/**/*.js' --rejected | jq '.[0].rejected'
npx purgecss --css dist/styles_.css --content 'dist/**/*.html' --content 'dist/**/*.js' -o dist/styles.css

npx purgecss --css dist/simple_.css --content 'dist/*.html' --content 'dist/langs/*.html' --content 'dist/myanimelist/*.html' --content 'dist/*.js' --rejected | jq '.[0].rejected'
npx purgecss --css dist/simple_.css --content 'dist/*.html' --content 'dist/langs/*.html' --content 'dist/myanimelist/*.html' --content 'dist/*.js' -o dist/simple.css

rm dist/styles_.css
rm dist/simple_.css

