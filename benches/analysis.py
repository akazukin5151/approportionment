''' Visualizes benchmark results
Run `cargo bench --features stv_party_discipline`
From the repo root dir, run `python benches/analysis.py`
'''

import json
import itertools
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def non_stv():
    methods = ['dhondt', 'sainte_lague', 'droop', 'hare']
    df = pd.DataFrame(columns=['method', 'n_voters', 'n_seats', 'time (μs)'])

    xs = itertools.product(methods, [100, 1000, 10000], [10, 20, 30, 40, 50])

    for method, nv, ns in xs:
        path = f'target/criterion/{method}-{nv} voters/{ns}/new/estimates.json'
        with open(path, 'r') as f:
            data = json.load(f)
            time = data['mean']['point_estimate'] / 1e3
            df.loc[len(df)] = [method, nv, ns, time]

    g = sns.FacetGrid(
        df, row='method', col='n_voters', sharey='col'
    )
    g.map(sns.regplot, 'n_seats', 'time (μs)')

    g.tight_layout()
    g.savefig('benches/out.png')
    plt.close()


def stv():
    df = pd.DataFrame(
        columns=['n_cands', 'n_voters', 'party_discipline', 'time (μs)']
    )

    xs = itertools.product([8, 13], [100, 1000, 10000], ['normal', 'min', 'avg'])

    for nc, nv, disc in xs:
        name = f'stv-{nc}-{disc}'
        path = f'target/criterion/{name}/{name}/{nv}/new/estimates.json'
        with open(path, 'r') as f:
            data = json.load(f)
            time = data['mean']['point_estimate'] / 1e3
            df.loc[len(df)] = [nc, nv, disc, time]

    g = sns.FacetGrid(
        df, row='n_cands', col='party_discipline', legend_out=True,
    )
    g.map(sns.regplot, 'n_voters', 'time (μs)')
    g.add_legend()

    for ax in g.axes.flatten():
        ax.set_xscale('log')
        ax.set_yscale('log')

    g.savefig('benches/stv.png')
    plt.close()


non_stv()
stv()
