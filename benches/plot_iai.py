import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
from parse_iai import parse_data

def clean_data(data):
    df = pd.DataFrame(data).T
    df.reset_index(inplace=True)
    df = df.melt(id_vars=['index'])
    df.columns = ['name', 'type', 'num']

    splitted = df['name'].str.split('_', expand=True)
    # inaccurate for splitted, only for merged df later
    splitted.columns = ['method', 'n_seats', 'n_voters', 'party_discipline']

    non_stv_info = splitted.query('method != "stv"')
    non_stv_info['n_choices'] = 3

    stv_info = splitted.query('method == "stv"')
    # the n_seats col is actually storing n_choices
    stv_info['n_choices'] = stv_info['n_seats']
    # n_seats is constant for all stv
    stv_info['n_seats'] = 3
    # swap party_discipline and n_voters, keep n_choices last to match
    # with non_stv_info
    stv_info = stv_info[
        ['method', 'n_seats', 'party_discipline', 'n_voters', 'n_choices']
    ]
    # restore accurate names for swapped party_discipline and n_voters
    stv_info.columns = [
        'method', 'n_seats', 'n_voters', 'party_discipline', 'n_choices'
    ]

    all_info = pd.concat([non_stv_info, stv_info])

    df = pd.concat([df, all_info], axis=1)
    df.drop('name', inplace=True, axis=1)
    df = df[[
        'method',
        'n_seats',
        'n_choices',
        'n_voters',
        'party_discipline',
        'type',
        'num'
    ]]

    df['n_seats'] = df['n_seats'].astype(int)
    df['n_voters'] = df['n_voters'].astype(int)
    df['n_choices'] = df['n_choices'].astype(int)
    df['num'] = df['num'].astype(int)
    df['log(n_voters)'] = np.log(df.n_voters)
    df['log(num)'] = np.log(df.num)
    return df

def plot_simple_reg(df, conds, hue, name):
    df1 = df[conds]
    g = sns.FacetGrid(
        df1, col='type', col_wrap=3, sharey=False, hue=hue,
    )
    g.map(sns.regplot, 'log(n_voters)', 'log(num)')
    g.add_legend()
    sns.move_legend(g, 'lower right')

    plt.tight_layout()
    plt.savefig(f'benches/out/{name}.png')
    plt.close()

def plot_by_type(df, conds, x, order, name):
    df1 = df[conds]
    types = df1['type'].unique()
    fig = plt.figure(figsize=(10, 7))
    ax = fig.add_subplot(2, 3, 1)
    axes = [ax]
    axes.append(fig.add_subplot(2, 3, 2, sharex=ax))
    axes.append(fig.add_subplot(2, 3, 3, sharex=ax))
    axes.append(fig.add_subplot(2, 3, 4, sharex=ax))
    axes.append(fig.add_subplot(2, 3, 5, sharex=ax))
    last_ax = fig.add_subplot(2, 3, 6)
    for idx, (ax, ty) in enumerate(zip(axes, types)):
        sns.barplot(
            df1.query(f"type == '{ty}'"),
            ax=ax, x=x, y='num', hue='n_voters', order=order,
            palette='Greens'
        )
        if idx == 4:
            sns.move_legend(
                ax, 'lower center', ncols=2, bbox_to_anchor=(.5, -0.45),
                frameon=False, title=''
            )
        else:
            ax.get_legend().remove()
        ax.set_title(ty)
        ax.set_yscale('log')
        ax.set_ylim((1, ax.get_ylim()[1]))
        sns.despine(ax=ax)

    sns.barplot(
        df1, ax=last_ax, x='type', y='num', hue='n_voters',
        palette='Greens'
    )
    last_ax.get_legend().remove()
    last_ax.set_yscale('log')
    last_ax.set_ylim((1, last_ax.get_ylim()[1]))
    sns.despine(ax=last_ax)
    last_ax.set_xticklabels(last_ax.get_xticklabels(), rotation=45)
    last_ax.set_xlabel('')

    plt.tight_layout()
    plt.savefig(f'benches/out/{name}.png')
    plt.close()

def comp(df):
    _, axes = plt.subplots(ncols=2, figsize=(10, 7), sharex=True, sharey=True)
    for idx, (ax, f) in enumerate(zip(axes.flatten(), [lambda x: ~x, lambda x: x])):
        cond = f(df['method'] == 'stv')
        sns.barplot(
            df[cond],
            ax=ax, x='type', y='num', hue='n_voters',
            palette='Greens'
        )
        if idx == 1:
            ax.get_legend().remove()
            ax.set_title('STV')
        else:
            ax.set_title('Non-STV')
        ax.set_yscale('log')
        ax.set_ylim((1, 1e8))
        sns.despine(ax=ax)
        ax.set_xticklabels(ax.get_xticklabels(), rotation=45)
        ax.set_xlabel('')
        loc = ticker.LogLocator(base=10, subs=np.arange(0.1, 1, 0.1), numticks=10)
        ax.yaxis.set_minor_locator(loc)
        ax.grid(which='both')
        ax.set_axisbelow(True)

    plt.tight_layout()
    plt.savefig('benches/out/iai_comp.png')
    plt.close()


data = parse_data()
df = clean_data(data)
plot_by_type(df, df['method'] != 'stv', 'n_seats', [10, 50], 'iai_non_stv')
plot_simple_reg(df, df['method'] != 'stv', 'method', 'iai_non_stv_reg')
comp(df)
plot_by_type(df, df['method'] == 'stv', 'n_choices', [8, 13], 'iai_stv_n_choices')
plot_simple_reg(df, df['method'] == 'stv', 'party_discipline', 'iai_stv_reg')
