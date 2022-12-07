from abc import ABC
from matplotlib.patches import Circle
import matplotlib as mpl

class Colorscheme(ABC):
    """Interface that every colorscheme must implement"""
    def get_party_to_colorize(p, parties):
        """Extract party_to_colorize"""

    def get_cmap(p, df, total_seats):
        """Calculate cmap and calculate the color column for the df"""

    def legend_items(palette, unique_seats):
        """Calculate the legend items"""

class Majority(Colorscheme):
    def get_party_to_colorize(p, parties):
        return find_pc(parties, p['for_party'])

    def get_cmap(_, df, total_seats):
        df['seats_for_party'] = (
            (df['seats_for_party'] / total_seats) >= 0.5
        ).astype(int)
        red = mpl.colormaps['tab10'](3)
        green = mpl.colormaps['tab10'](2)
        cmap = [red, green]
        df['color'] = df['seats_for_party'].apply(
            lambda m: cmap[0] if m == 0 else cmap[1]
        )
        return cmap

    def legend_items(palette, _):
        return [Circle((0, 0), 1, color=c) for c in palette]

class Discrete(Colorscheme):
    def get_party_to_colorize(p, parties):
        return find_pc(parties, p['party_to_colorize'])

    def get_cmap(p, df_for_party, total_seats):
        cmap = p['palette_name']
        mapper = mpl.colormaps[cmap]
        # if this is a continuous colormap, resample it
        if mapper.N > 15:
            mapper = mapper.resampled(df_for_party['seats_for_party'].max())
        df_for_party['color'] = df_for_party['seats_for_party'].apply(mapper)
        return cmap

    def legend_items(palette, unique_seats):
        colors = mpl.colormaps[palette]
        # if this is a continuous colormap, resample it
        if colors.N > 15:
            colors = colors.resampled(unique_seats.size)
        return [Circle((0, 0), 1, color=colors(i)) for i in unique_seats]

def find_pc(parties, name):
    return [
        party
        for party in parties
        if party['name'] == name
    ][0]
