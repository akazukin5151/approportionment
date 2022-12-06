import os
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from matplotlib.patches import Circle
import matplotlib as mpl
import seaborn as sns
import dhall

def main():
    with open('config.dhall', 'r') as f:
        configs = dhall.load(f)

    for config in configs:
        path = Path(config['data_out_dir'])
        for file in os.listdir(path):
            plot_all(config, path, file)

def plot_all(config, path, file):
    df = pd.read_feather(path / file)
    parties = [config['parties']['head']] + config['parties']['tail']
    for colorscheme in config['colorschemes']:
        plot_out_dir = colorscheme['plot_out_dir']
        filename = Path(file).stem
        path = Path(plot_out_dir) / (filename + '.png')
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
        # red and green; ListedColormap doesn't work for some reason
        cmap = [sns.color_palette()[3], sns.color_palette()[2]]
        return True, party_to_colorize, cmap
    else:
        # Discrete color
        party_to_colorize = find_pc(parties, p['party_to_colorize'])
        return True, party_to_colorize, p['palette_name']

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

    fig, axes = setup_subplots(is_discrete)
    plot_seats(df_for_party, palette, axes)
    plot_cbar_or_legend(df, fig, axes, palette, is_discrete)
    plot_parties(parties, axes, party_to_colorize)

    format_plot(axes)
    path.parent.mkdir(exist_ok=True, parents=True)
    plt.savefig(path)
    plt.close()

def setup_subplots(is_discrete):
    if not is_discrete:
        return plt.subplots(ncols=2, figsize=(7, 5), width_ratios=[20, 1])
    fig, ax = plt.subplots(figsize=(7, 5))
    return fig, [ax]

def plot_seats(df_for_party, palette, axes):
    # if there is no majority anywhere, then remove green
    # otherwise it will complain about not matching lens
    if len(df_for_party['seats_for_party'].unique()) == 1:
        palette = [palette[0]]
    sns.scatterplot(
        data=df_for_party,
        x='x',
        y='y',
        hue='seats_for_party',
        palette=palette,
        s=5,
        edgecolor=None,
        legend='full',
        ax=axes[0]
    )
    axes[0].axis('off')

def plot_cbar_or_legend(df, fig, axes, palette, is_discrete):
    s = df.seats_for_party
    if is_discrete and isinstance(palette, str):
        # Discrete
        axes[0].legend().set_title('')
    else:
        # Majority
        artists = [Circle((0, 0), 1, color=c) for c in palette]
        axes[0].legend(artists, range(s.max() + 1))

def plot_parties(parties, axes, party_to_colorize):
    df = pd.DataFrame(parties)
    df['colorized'] = False
    idx = df[df['name'] == party_to_colorize['name']].index[0]
    df.loc[idx, 'colorized'] = True
    palette = df['color'].apply(
        lambda x: (x['r'] / 255, x['g'] / 255, x['b'] / 255)
    ).to_list()

    sns.scatterplot(
        data=df,
        x='x',
        y='y',
        hue='name',
        style='colorized',
        markers=['o', 'D'],
        s=90,
        linewidth=2,
        ax=axes[0],
        legend=None,
        palette=palette
    )

def format_plot(axes):
    for ax in axes:
        ax.margins(0.01)

    plt.tight_layout()


if __name__ == '__main__':
    main()
