import os
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
import seaborn as sns
import dhall

with open('config.dhall', 'r') as f:
    configs = dhall.load(f)

def color_to_palette(config, party_to_colorize):
    c = config['color']
    if c == 'Average':
        raise NotImplementedError
    elif c == 'Continuous':
        pc = party_to_colorize['color']
        r, g, b = pc['r'] / 255, pc['g'] / 255, pc['b'] / 255
        return ListedColormap([[r, g, b, a / 100] for a in range(0, 100)])
    else:
        # Discrete, return palette name to use
        return c


for config in configs:
    path = Path(config['out_dir'])
    for file in os.listdir(path):
        if config['color'] == 'Average':
            continue

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

        palette = color_to_palette(config, party_to_colorize)

        fig, axes = plt.subplots(ncols=2, figsize=(7, 5), width_ratios=[20, 1])
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

        s = df.seats_for_party
        matrix = [range(s.min(), s.max() + 1)]
        psm = axes[1].pcolormesh(
            matrix,
            cmap=palette,
            rasterized=True
        )
        fig.colorbar(psm, cax=axes[1])

        for ax in axes:
            ax.margins(0.01)
        plt.tight_layout()
        filename = Path(file).stem
        plt.savefig(f'examples/number-of-seats/{filename}.png')

