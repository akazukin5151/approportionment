import os
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from matplotlib.patches import Circle
import matplotlib as mpl
import seaborn as sns
import dhall

def process_data(config, path, file):
    parties = [config['parties']['head']] + config['parties']['tail']
    party_to_colorize = [
        party
        for party in parties
        if party['name'] == config['party_to_colorize']
    ][0]

    df = pd.read_feather(path / file)
    df_for_party = df[
        (df.party_x == party_to_colorize['x'])
        & (df.party_y == party_to_colorize['y'])
    ]
    return df, df_for_party, party_to_colorize, parties

def color_to_palette(config, party_to_colorize):
    c = config['color']
    if c == 'Average':
        # TODO: port the average color function from rust
        raise NotImplementedError
    elif c == 'Continuous':
        pc = party_to_colorize['color']
        r, g, b = pc['r'] / 255, pc['g'] / 255, pc['b'] / 255
        return ListedColormap([[r, g, b, a / 100] for a in range(0, 100)])
    else:
        # Discrete, return palette name to use
        return c

def setup_subplots(config):
    if config['color'] == 'Continuous':
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

def plot_cbar_or_legend(df, fig, axes, palette, config):
    s = df.seats_for_party
    if len(axes) == 2:
        matrix = [range(s.min(), s.max() + 1)]
        psm = axes[1].pcolormesh(
            matrix,
            cmap=palette,
            rasterized=True
        )
        fig.colorbar(psm, cax=axes[1])
    elif config['color'] not in {'Continuous', 'Average'}:
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

def plot(config, path, file):
    df, df_for_party, party_to_colorize, parties = process_data(config, path, file)
    palette = color_to_palette(config, party_to_colorize)

    fig, axes = setup_subplots(config)
    plot_seats(df_for_party, palette, axes)
    plot_cbar_or_legend(df, fig, axes, palette, config)
    plot_parties(parties, axes)

    format_plot(axes)
    filename = Path(file).stem
    plt.savefig(f'examples/number-of-seats/{filename}.png')

def main():
    with open('config.dhall', 'r') as f:
        configs = dhall.load(f)

    # TODO: decouple the simulation config from the plot config.
    # a simulation should have multiple ways to plot it
    # so make color and party_to_colorize Lists instead
    for config in configs:
        path = Path(config['out_dir'])
        for file in os.listdir(path):
            if config['color'] == 'Average':
                continue
            plot(config, path, file)


if __name__ == '__main__':
    main()
