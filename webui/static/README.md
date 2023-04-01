This directory contains the static resources for the site

`run.sh` is used to remove the opacity field. The opacity field is there because d3's RGBColor type contains it, it was directly added to the cache without removing it. It is completely unused, so it is safe to remove

The files are fetched by the browser, and hence affects network times, so reducing file size is important.

## square.json

The simulation results for 4 parties in a square.

## Estonia 2023 parliamentary election

From the newspaper Postimees: https://teddit.pussthecat.org/ypinmy3y4xja1.jpg?teddit_proxy=i.redd.it

Alternatively, from Andres Reiljan, a politologist at the Johan Skytte institute of Tartu University: https://s.err.ee/photo/crop/2023/03/04/1812992hbdc2t24.png

## Finland 2023 parliamentary election

https://www.iltalehti.fi/politiikka/a/d133c298-a509-4697-bfcf-8d9fdcb71ebf
