from abc import ABC
from matplotlib.patches import Circle
import matplotlib as mpl

class Colorscheme(ABC):
    """Interface that every colorscheme must implement"""
    def get_party_to_colorize(p, parties):
        """Extract party_to_colorize"""

    def get_cmap(p, df, total_seats):
        """Calculate cmap and calculate the color column for the df"""

    def legend_items(palette, max_):
        """Calculate the legend items and the number of items"""

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

    def legend_items(palette, max_):
        artists = [Circle((0, 0), 1, color=c) for c in palette]
        return (artists, max_ + 1)

class Discrete(Colorscheme):
    def get_party_to_colorize(p, parties):
        return find_pc(parties, p['party_to_colorize'])

    def get_cmap(p, df, total_seats):
        cmap = p['palette_name']
        df['color'] = df['seats_for_party'].apply(mpl.colormaps[cmap])
        return cmap

    def legend_items(palette, max_):
        colors = mpl.colormaps[palette]
        artists = [Circle((0, 0), 1, color=colors(i)) for i in range(max_)]
        return (artists, max_)

def find_pc(parties, name):
    return [
        party
        for party in parties
        if party['name'] == name
    ][0]
