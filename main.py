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

def color_to_legend(config):
    c = config['color']
    if c == 'Average':
        return 'none'
    elif c == 'Continuous':
        return 'full'
    else:  # Discrete
        return 'full'

def plot_examples(ax, colormap):
    """
    Helper function to plot data with associated colormap.
    """
    import numpy as np
    np.random.seed(19680801)
    data = np.random.randn(30, 30)
    psm = ax.pcolormesh(data, cmap=colormap, rasterized=True, vmin=0, vmax=8)
    return psm

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
        legend_expansion = color_to_legend(config)

        fig, axes = plt.subplots(ncols=2, figsize=(7, 5))
        sns.scatterplot(
            data=df_for_party,
            x='x',
            y='y',
            hue='seats_for_party',
            palette=palette,
            s=2,
            legend=legend_expansion,
            ax=axes[0]
        )
        cbar = plot_examples(axes[1], palette)
        fig.colorbar(cbar, cax=axes[1])
        axes[0].axis('off')
        sns.move_legend(axes[0], 'center right', bbox_to_anchor=(1.3, 0.5))
        plt.margins(0.01)
        plt.tight_layout()
        filename = Path(file).stem
        plt.savefig(f'examples/number-of-seats/{filename}.png')

