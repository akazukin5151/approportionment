import os
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from matplotlib.patches import Circle
import matplotlib as mpl
import dhall

import colorschemes

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
    for colorscheme_dict in config['colorschemes']:
        df_copy = df.copy()
        plot_out_dir = colorscheme_dict['plot_out_dir']
        path = Path(plot_out_dir) / 'out.png'
        if path.exists():
            continue

        p = colorscheme_dict['palette']
        colorscheme_cls = parse_colorscheme(p)
        party_to_colorize = colorscheme_cls.get_party_to_colorize(p, parties)
        cmap = colorscheme_cls.get_cmap(p, df_copy, config['n_seats'])
        plot_colorscheme(
            df_copy, party_to_colorize, colorscheme_cls, parties, cmap,
            path
        )

def parse_colorscheme(p):
    if 'for_party' in p:
        return colorschemes.Majority
    else:
        return colorschemes.Discrete

def plot_colorscheme(
    df, party_to_colorize, colorscheme, parties, palette, path
):
    df_for_party = df[
        (df.party_x == party_to_colorize['x'])
        & (df.party_y == party_to_colorize['y'])
    ]

    fig, axes = plt.subplots(ncols=2, nrows=2, figsize=(11, 10))
    plot_seats(df_for_party, palette, axes)
    plot_legend(fig, df, palette, axes, colorscheme)
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

def plot_legend(fig, df, palette, axes, colorscheme):
    s = df.seats_for_party
    max_ = s.max()
    artists, max_ = colorscheme.legend_items(palette, max_)

    # plot the legend in the rightmost subplot, first row
    axes[0, -1].legend(
        artists,
        range(max_),
        loc='upper right',
        bbox_to_anchor=(0.98, 0.95),
        bbox_transform=fig.transFigure
    )

def rgb_to_mpl_color(x):
    return (x['r'] / 255, x['g'] / 255, x['b'] / 255)

def plot_parties(parties, axes, party_to_colorize):
    name = party_to_colorize['name']
    normal_parties = [x for x in parties if x['name'] != name]
    ptc = [x for x in parties if x['name'] == name][0]
    df = pd.DataFrame(normal_parties)

    color = rgb_to_mpl_color(ptc['color'])
    palette = df['color'].apply(rgb_to_mpl_color)

    for ax in axes.flatten():
        ax.scatter(
            x=df['x'],
            y=df['y'],
            c=palette,
            s=90,
            linewidth=2,
            edgecolor='white'
        )
        ax.scatter(
            x=ptc['x'],
            y=ptc['y'],
            color=color,
            s=90,
            linewidth=2,
            marker='D',
            edgecolor='white'
        )

def format_plot(axes):
    for ax in axes.flatten():
        for x in {'right', 'top', 'left', 'bottom'}:
            ax.axis('off')
    plt.tight_layout()


if __name__ == '__main__':
    main()
