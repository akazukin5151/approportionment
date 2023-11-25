'''
Script to remove unneeded data from the anime list data. The result
would be fetched by the site so we want to reduce wire transfer size.

but there are many data that would be useful to assess proportionality among multiple criteria
'''

import json
import pandas as pd

anime_df = pd.read_csv('data/mal/AnimeList.csv')
# type means TV, movie, etc
# we should use status to exclude currently airing shows
df = anime_df[[
    'anime_id', 'title', 'title_english', 'title_japanese',
    'image_url', 'type', 'source', 'episodes', 'status',
    'duration', 'score',
    'scored_by', 'rank', 'popularity', 'members', 'favorites',
    'premiered', 'producer', 'licensor', 'studio',
    'genre'
]]

df.set_index('anime_id').to_json('out/anime_data.json', orient='index')
