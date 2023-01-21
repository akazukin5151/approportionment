This directory contains the static resources for the site

## default_simulation_result.json

The simulation results for the default set of parties (4 parties in a square), with the default settings (except for number of voters set to 1000).

The file is generated through the webui's export functionality. Further processing was done to minify it and removing the opacity field. This is because the file is fetched by the client TS separately, and hence affects loading times.

The opacity field is there because d3's RGBColor type contains it, it was directly added to the cache without removing it. It is completely unused, so it is safe to remove
