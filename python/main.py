from typing import TYPE_CHECKING
import os
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
import dhall

import colorschemes

if TYPE_CHECKING:
    from typing import Any, Type, Union, cast
    import matplotlib as mpl
    import numpy.typing as npt

def main() -> None:
    with open('config/config.dhall', 'r') as f:
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

def plot_all(config: Any, df: pd.DataFrame) -> None:
    parties = [config['parties']['head']] + config['parties']['tail']
    for colorscheme_dict in config['colorschemes']:
        df_copy = df.copy()
        plot_out_dir = colorscheme_dict['plot_out_dir']
        path = Path(plot_out_dir) / 'out.png'
        if path.exists():
            continue

        p = colorscheme_dict['palette']
        colorscheme_cls = parse_colorscheme(p)
        plot_colorscheme(
            df_copy,
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

def plot_colorscheme(
    df: pd.DataFrame,
    colorscheme: Type[colorschemes.Colorscheme],
    p: dict[str, str],
    parties: list[dict[str, Union[str, int]]],
    path: Path,
    total_seats: int
) -> None:
    party_to_colorize = colorscheme.get_party_to_colorize(p, parties)

    df_for_party = df[
        (df.party_x == party_to_colorize['x'])
        & (df.party_y == party_to_colorize['y'])
    ]

    cmap = colorscheme.get_cmap(p, df_for_party, total_seats)

    fig, axes = plt.subplots(ncols=2, nrows=2, figsize=(11, 10))
    plot_seats(df_for_party, cmap, axes)
    plot_legend(fig, df_for_party, cmap, axes, colorscheme)
    parties_ = cast(list[dict[str, dict[str, int]]], parties)
    plot_parties(parties_, axes, party_to_colorize)

    format_plot(axes)
    path.parent.mkdir(exist_ok=True, parents=True)
    plt.savefig(path)
    plt.close()

def plot_seats(
    df_for_party: pd.DataFrame,
    palette: Union[str, list[list[float]]],
    axes: npt.NDArray[mpl.axes.Axes]
) -> None:
    # if there is no majority anywhere, then remove green
    # otherwise it will complain about not matching lens
    if len(df_for_party['seats_for_party'].unique()) == 1:
        palette = cast(list[list[float]], palette)
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

def plot_legend(
    fig: mpl.figure.Figure,
    df_for_party: pd.DataFrame,
    palette: Union[str, list[list[float]]],
    axes: npt.NDArray[mpl.axes.Axes],
    colorscheme: Type[colorschemes.Colorscheme]
) -> None:
    unique_seats = df_for_party.seats_for_party.unique()
    unique_seats.sort()
    artists = colorscheme.legend_items(palette, unique_seats)

    # plot the legend in the rightmost subplot, first row
    axes[0, -1].legend(
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
    axes: npt.NDArray[mpl.axes.Axes],
    party_to_colorize: dict[str, Union[str, int]]
) -> None:
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

def format_plot(axes: npt.NDArray[mpl.axes.Axes]) -> None:
    for ax in axes.flatten():
        for x in {'right', 'top', 'left', 'bottom'}:
            ax.axis('off')
    plt.tight_layout()


if __name__ == '__main__':
    main()
