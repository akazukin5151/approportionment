import os
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from matplotlib.patches import Circle
import matplotlib as mpl
import seaborn as sns
import dhall

def setup_subplots(is_discrete):
    if not is_discrete:
        return plt.subplots(ncols=2, figsize=(7, 5), width_ratios=[20, 1])
    fig, ax = plt.subplots(figsize=(7, 5))
    return fig, [ax]

def plot_seats(df_for_party, palette, axes):
    sns.scatterplot(
        data=df_for_party,
        x='x',
        y='y',
        hue='seats_for_party',
        palette=palette,
        s=2,
        legend=None,
        ax=axes[0]
    )
    axes[0].axis('off')

def plot_cbar_or_legend(df, fig, axes, palette, is_discrete):
    s = df.seats_for_party
    if len(axes) == 2:
        matrix = [range(s.min(), s.max() + 1)]
        psm = axes[1].pcolormesh(
            matrix,
            cmap=palette,
            rasterized=True
        )
        fig.colorbar(psm, cax=axes[1])
    elif is_discrete:
        colors = mpl.colormaps[palette].colors
        artists = [Circle((0, 0), 1, color=c) for c in colors]
        axes[0].legend(artists, range(s.max() + 1))

def plot_parties(parties, axes):
    df = pd.DataFrame(parties)
    palette = df['color'].apply(
        lambda x: (x['r'] / 255, x['g'] / 255, x['b'] / 255)
    ).to_list()
    sns.scatterplot(
        data=df,
        x='x',
        y='y',
        hue='name',
        s=50,
        ax=axes[0],
        legend=False,
        palette=palette
    )

def format_plot(axes):
    for ax in axes:
        ax.margins(0.01)

    plt.tight_layout()

def plot_all(config, path, file):
    df = pd.read_feather(path / file)
    parties = [config['parties']['head']] + config['parties']['tail']
    for colorscheme in config['colorschemes']:
        is_discrete, party_to_colorize, cmap = parse_colorscheme(
            colorscheme['palette'], parties
        )
        if is_discrete is None:
            continue
        plot_colorscheme(
            df, party_to_colorize, colorscheme, file, parties, cmap, is_discrete
        )

def parse_colorscheme(p, parties):
    is_discrete = False
    if p == 'Average':
        # TODO: port the average color function from rust
        return None, None, None
    elif isinstance(p, dict):
        # Discrete color
        party_to_colorize = find_pc(parties, p['party_to_colorize'])
        cmap = p['palette_name']
        is_discrete = True
    else:
        # Continuous color - str
        party_to_colorize = find_pc(parties, p)
        pc = party_to_colorize['color']
        r, g, b = pc['r'] / 255, pc['g'] / 255, pc['b'] / 255
        cmap = ListedColormap([[r, g, b, a / 100] for a in range(0, 100)])
    return is_discrete, party_to_colorize, cmap

def find_pc(parties, name):
    return [
        party
        for party in parties
        if party['name'] == name
    ][0]

def plot_colorscheme(
    df, party_to_colorize, colorscheme, file, parties, palette, is_discrete
):
    df_for_party = df[
        (df.party_x == party_to_colorize['x'])
        & (df.party_y == party_to_colorize['y'])
    ]

    fig, axes = setup_subplots(is_discrete)
    plot_seats(df_for_party, palette, axes)
    plot_cbar_or_legend(df, fig, axes, palette, is_discrete)
    plot_parties(parties, axes)

    format_plot(axes)
    plot_out_dir = colorscheme['plot_out_dir']
    filename = Path(file).stem
    path = Path(plot_out_dir) / (filename + '.png')
    path.parent.mkdir(exist_ok=True, parents=True)
    plt.savefig(path)

def main():
    with open('config.dhall', 'r') as f:
        configs = dhall.load(f)

    for config in configs:
        path = Path(config['data_out_dir'])
        for file in os.listdir(path):
            plot_all(config, path, file)


if __name__ == '__main__':
    main()
