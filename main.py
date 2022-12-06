import os
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from matplotlib.patches import Circle
import matplotlib as mpl
import dhall

def main():
    with open('config.dhall', 'r') as f:
        configs = dhall.load(f)

    for config in configs:
        path = Path(config['data_out_dir'])
        dfs = []
        for file in os.listdir(path):
            method_df = pd.read_feather(path / file)
            method_df['method'] = file.replace('.feather', '')
            dfs.append(method_df)
        df = pd.concat(dfs)
        plot_all(config, df)

def plot_all(config, df):
    parties = [config['parties']['head']] + config['parties']['tail']
    for colorscheme in config['colorschemes']:
        plot_out_dir = colorscheme['plot_out_dir']
        path = Path(plot_out_dir) / 'out.png'
        if path.exists():
            continue

        is_discrete, party_to_colorize, cmap = parse_colorscheme(
            colorscheme['palette'], parties, df, config['n_seats']
        )
        if is_discrete is None:
            continue
        plot_colorscheme(
            df, party_to_colorize, colorscheme, parties, cmap, is_discrete, path
        )

def parse_colorscheme(p, parties, df, total_seats):
    if p == 'Average':
        # TODO: port the average color function from rust
        return None, None, None
    elif 'for_party' in p:
        # Majority
        party_to_colorize = find_pc(parties, p['for_party'])
        df['seats_for_party'] = (
            (df['seats_for_party'] / total_seats) >= 0.5
        ).astype(int)
        red = mpl.colormaps['tab10'](3)
        green = mpl.colormaps['tab10'](2)
        cmap = [red, green]
        df['color'] = df['seats_for_party'].apply(
            lambda m: cmap[0] if m == 0 else cmap[1]
        )
        return True, party_to_colorize, cmap
    else:
        # Discrete color
        party_to_colorize = find_pc(parties, p['party_to_colorize'])
        cmap = p['palette_name']
        df['color'] = df['seats_for_party'].apply(mpl.colormaps[cmap])
        return True, party_to_colorize, cmap

def find_pc(parties, name):
    return [
        party
        for party in parties
        if party['name'] == name
    ][0]

def plot_colorscheme(
    df, party_to_colorize, colorscheme, parties, palette, is_discrete, path
):
    df_for_party = df[
        (df.party_x == party_to_colorize['x'])
        & (df.party_y == party_to_colorize['y'])
    ]

    fig, axes = plt.subplots(ncols=2, nrows=2, figsize=(7, 5))
    plot_seats(df_for_party, palette, axes)
    plot_cbar_or_legend(fig, df, palette, is_discrete)
    plot_parties(parties, axes, party_to_colorize)

    format_plot(axes)
    path.parent.mkdir(exist_ok=True, parents=True)
    plt.savefig(path)
    plt.close()

def plot_seats(df_for_party, palette, axes):
    # if there is no majority anywhere, then remove green
    # otherwise it will complain about not matching lens
    if len(df_for_party['seats_for_party'].unique()) == 1:
        palette = [palette[0]]

    methods = df_for_party.method.unique()
    for ax, method in zip(axes.flatten(), methods):
        df_for_method = df_for_party[df_for_party.method == method]
        ax.set_title(method)
        ax.scatter(
            x=df_for_method['x'],
            y=df_for_method['y'],
            c=df_for_method['color'],
            s=5,
            edgecolor=None,
            lw=0,
            alpha=1,
        )

def plot_cbar_or_legend(fig, df, palette, is_discrete):
    s = df.seats_for_party
    max_ = s.max()
    if is_discrete and isinstance(palette, str):
        # Discrete
        colors = mpl.colormaps[palette]
        artists = [Circle((0, 0), 1, color=colors(i)) for i in range(max_)]
    else:
        # Majority
        artists = [Circle((0, 0), 1, color=c) for c in palette]
    fig.legend(artists, range(s.max()), loc='upper right')

def plot_parties(parties, axes, party_to_colorize):
    df = pd.DataFrame(parties)
    df['colorized'] = False
    idx = df[df['name'] == party_to_colorize['name']].index[0]
    df.loc[idx, 'colorized'] = True
    palette = df['color'].apply(
        lambda x: (x['r'] / 255, x['g'] / 255, x['b'] / 255)
    ).to_list()

    for ax in axes.flatten():
        ax.scatter(x=df['x'], y=df['y'], c=palette)
        #hue='name',
        #style='colorized',
        #markers=['o', 'D'],
        #s=90,
        #linewidth=2,
        #palette=palette

def format_plot(axes):
    for ax in axes.flatten():
        for x in {'right', 'top', 'left', 'bottom'}:
            ax.axis('off')
    plt.tight_layout()


if __name__ == '__main__':
    main()
