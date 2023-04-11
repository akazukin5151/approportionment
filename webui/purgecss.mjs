import * as fs from 'node:fs/promises'
import { PurgeCSS } from 'purgecss'

{
  const purgeCSSResult = await new PurgeCSS().purge({
    content: ['dist/*.js', 'dist/*.html'],
    css: ['dist/styles_.css'],
    safelist: []
  })

  const f = await fs.open('dist/styles.css', 'w')
  f.writeFile(purgeCSSResult[0].css)
}

{
  const purgeCSSResult = await new PurgeCSS().purge({
    content: ['dist/*.js', 'dist/*.html'],
    css: ['dist/simple_.css'],
    safelist: ['figure']
  })

  const f = await fs.open('dist/simple.css', 'w')
  f.writeFile(purgeCSSResult[0].css)
}

