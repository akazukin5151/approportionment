import os
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import dhall

with open('config.dhall', 'r') as f:
    configs = dhall.load(f)

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

        _, ax = plt.subplots(figsize=(7, 5))
        sns.scatterplot(
            data=df_for_party,
            x='x',
            y='y',
            hue='seats_for_party',
            palette='Greens',
            s=2
        )
        ax.axis('off')
        sns.move_legend(ax, 'center right', bbox_to_anchor=(1.3, 0.5))
        plt.margins(0.01)
        plt.tight_layout()
        filename = Path(file).stem
        plt.savefig(f'examples/number-of-seats/{filename}.png')
