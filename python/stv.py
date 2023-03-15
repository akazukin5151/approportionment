from __future__ import annotations
from typing import TYPE_CHECKING, cast
import os
import multiprocessing
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import dhall

import colorschemes

if TYPE_CHECKING:
    from typing import Any, Type, Union
    import matplotlib as mpl
    import numpy.typing as npt

def main() -> None:
    with open('config/stv.dhall', 'r') as f:
        c = dhall.load(f)

    with multiprocessing.Pool() as pool:
        pool.map(plot_config, c['configs'])

def plot_config(config: Any) -> None:
    path = Path(config['data_out_dir'])
    dfs = []
    for file in os.listdir(path):
        method_df = pd.read_feather(path / file)
        method_df['method'] = file.replace('.feather', '')
        dfs.append(method_df)
    df = pd.concat(dfs)
    plot_all(config, df)

def plot_all(config: Any, df: pd.DataFrame) -> None:
    parties = [config['parties']['head']] + config['parties']['tail']
    for colorscheme_dict in config['colorschemes']:
        plot_out_dir = colorscheme_dict['plot_out_dir']
        path = Path(plot_out_dir) / 'out.png'
        if path.exists():
            continue

        p = colorscheme_dict['palette']
        colorscheme_cls = parse_colorscheme(p)
        plot_colorscheme(
            df,
            colorscheme_cls,
            p,
            parties,
            path,
            config['n_seats']
        )

def parse_colorscheme(
    p: dict[str, dict[str, str]]
) -> Type[colorschemes.Colorscheme]:
    if 'for_party' in p:
        return colorschemes.Majority
    else:
        return colorschemes.Discrete

def has_coalitions(parties: list[dict[str, Union[str, int]]]) -> bool:
    for party in parties:
        if party['coalition'] is not None:
            return True
    return False

def plot_colorscheme(
    df: pd.DataFrame,
    colorscheme: Type[colorschemes.Colorscheme],
    p: dict[str, str],
    parties: list[dict[str, Union[str, int]]],
    path: Path,
    total_seats: int
) -> None:
    if has_coalitions(parties):
        df_for_party, parties_to_colorize = sum_party_by_coalition(
            df, colorscheme, p, parties, path, total_seats
        )
    else:
        party_to_colorize = colorscheme.get_party_to_colorize(p, parties)
        df_for_party = df[
            (df.party_x == party_to_colorize['x'])
            & (df.party_y == party_to_colorize['y'])
        ]
        parties_to_colorize = [party_to_colorize]

    cmap = colorscheme.get_cmap(p)
    colorscheme.add_color_col(cmap, df_for_party, total_seats)

    fig, ax = plt.subplots(figsize=(5, 5))
    plot_seats(df_for_party, cmap, ax)
    plot_legend(fig, df_for_party, cmap, ax, colorscheme)
    parties_ = cast(list[dict[str, dict[str, int]]], parties)
    plot_parties(parties_, ax, parties_to_colorize)

    format_plot(ax)
    path.parent.mkdir(exist_ok=True, parents=True)
    plt.savefig(path)
    plt.close()

def sum_party_by_coalition(
    df: pd.DataFrame,
    colorscheme: Type[colorschemes.Colorscheme],
    p: dict[str, str],
    parties: list[dict[str, Union[str, int]]],
    path: Path,
    total_seats: int
) -> tuple[pd.DataFrame, pd.DataFrame]:
    party_to_colorize = colorscheme.get_party_to_colorize(p, parties)
    coalition_to_colorize = party_to_colorize['coalition']
    parties_in_coalition = [
        party
        for party in parties
        if party['coalition'] == coalition_to_colorize
    ]

    xs = [x['x'] for x in parties_in_coalition]
    ys = [x['y'] for x in parties_in_coalition]
    df_for_coalition = df[
        (np.logical_or.reduce([np.isclose(df.party_x, x) for x in xs]))
        & (np.logical_or.reduce([np.isclose(df.party_y, x) for x in ys]))
    ]
    df_for_party = df_for_coalition.groupby(
        ['x', 'y']
    ).seats_for_party.sum(min_count=1).reset_index()
    return (df_for_party, parties_in_coalition)

def plot_seats(
    df_for_party: pd.DataFrame,
    palette: Union[str, list[list[float]]],
    ax: mpl.axes.Axes
) -> None:
    # if there is no majority anywhere, then remove green
    # otherwise it will complain about not matching lens
    if len(df_for_party['seats_for_party'].unique()) == 1:
        palette = cast(list[list[float]], palette)
        palette = [palette[0]]

    ax.set_title('StvAustralia')
    ax.scatter(
        x=df_for_party['x'],
        y=df_for_party['y'],
        c=df_for_party['color'],
        marker='s',
        s=5,
        edgecolor=None,
        lw=0,
        alpha=1,
    )

def plot_legend(
    fig: mpl.figure.Figure,
    df_for_party: pd.DataFrame,
    palette: Union[str, list[list[float]]],
    ax: mpl.axes.Axes,
    colorscheme: Type[colorschemes.Colorscheme]
) -> None:
    unique_seats = df_for_party.seats_for_party.unique()
    unique_seats.sort()
    artists = colorscheme.legend_items(palette, unique_seats)

    # plot the legend in the rightmost subplot, first row
    ax.legend(
        artists,
        unique_seats,
        loc='upper right',
        bbox_to_anchor=(0.98, 0.95),
        bbox_transform=fig.transFigure
    )

def rgb_to_mpl_color(x: dict[str, int]) -> tuple[float, float, float]:
    return (x['r'] / 255, x['g'] / 255, x['b'] / 255)

def plot_parties(
    parties: list[dict[str, dict[str, int]]],
    ax: mpl.axes.Axes,
    parties_to_colorize: list[dict[str, Union[str, int]]]
) -> None:
    # all parties in coalition needs a name (not None)
    names = [p['name'] for p in parties_to_colorize]
    normal_parties = [x for x in parties if x['name'] not in names]
    pstc = [x for x in parties if x['name'] in names]
    df = pd.DataFrame(normal_parties)

    colors = [rgb_to_mpl_color(ptc['color']) for ptc in pstc]
    palette = df['color'].apply(rgb_to_mpl_color)

    ax.scatter(
        x=df['x'],
        y=df['y'],
        c=palette,
        s=90,
        linewidth=2,
        edgecolor='white'
    )
    ax.scatter(
        x=[ptc['x'] for ptc in pstc],
        y=[ptc['y'] for ptc in pstc],
        color=colors,
        s=90,
        linewidth=2,
        marker='D',
        edgecolor='white'
    )

def format_plot(ax: mpl.axes.Axes) -> None:
    for x in {'right', 'top', 'left', 'bottom'}:
        ax.axis('off')
    plt.tight_layout()


if __name__ == '__main__':
    main()
