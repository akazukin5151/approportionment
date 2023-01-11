from pathlib import Path
import json
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import scipy.stats as ss

def load_data():
    df = pd.DataFrame()

    data_dir = Path('./data/')
    for file in data_dir.iterdir():
        splitted = file.stem.split('-')
        nvoters = splitted[0]
        extra_parties = splitted[1]
        exe_name = splitted[2]
        with open(file, 'r') as f:
            j = json.load(f)
        # exclude the first time record due to warmup
        times = j['results'][0]['times'][1:]
        df1 = pd.DataFrame(times, columns=['times'])
        df1['nvoters'] = int(nvoters)
        df1['extra_parties'] = extra_parties
        df1['exe_name'] = exe_name
        #df1['p1'] = exe_name[0] == '1'
        #df1['p2'] = exe_name[1] == '1'
        #df1['p3'] = exe_name[2] == '1'
        #df1['p4'] = exe_name[3] == '1'
        df = pd.concat([df, df1])
    return df

def grid_of_boxplots(df):
    means = df.groupby('exe_name')['times'].mean()
    s = means.sort_values()
    exes = s.index

    fig, axes = plt.subplots(4, 4, figsize=(15, 15), sharey=True)
    for (idx, ax) in enumerate(axes.flatten()):
        sub_df = df[df['exe_name'] == exes[idx]]
        ax.set_title(exes[idx])
        sns.boxplot(
            data=sub_df, y='times', x='nvoters', hue='extra_parties', ax=ax,
            order=[100, 1000, 10000], hue_order=['True', 'False']
        )
        if idx != 0:
            ax.get_legend().remove()
        sns.despine(ax=ax)

    plt.tight_layout()
    plt.savefig('matrix.png')
    plt.close()

def grid_of_regplots(df):
    means = df.groupby('exe_name')['times'].mean()
    s = means.sort_values()
    exes = s.index

    fig, axes = plt.subplots(4, 4, figsize=(15, 15), sharey=True)
    for (idx, ax) in enumerate(axes.flatten()):
        ax.set_title(exes[idx])
        for party in {'True', 'False'}:
            sub_df = df[
                (df['exe_name'] == exes[idx])
                & (df['extra_parties'] == party)
            ]
            mean_time = pd.DataFrame(
                sub_df.groupby('nvoters')['times'].mean()
            ).reset_index()
            x = mean_time['nvoters']
            y = mean_time['times']
            print(mean_time)
            reg = ss.linregress(x=x, y=y)
            tinv = lambda p, df: abs(ss.t.ppf(p / 2, df))
            ts = tinv(0.05, len(x) - 2)
            p = ts * reg.stderr / reg.slope * 100
            print(reg.rvalue ** 2)
            print(f"{ts*reg.stderr:.6f} / {reg.slope:.6f} = {p:3f}%")

            ax.plot(x, y, 'o')
            ax.plot(x, reg.intercept + reg.slope * x, 'r')
        sns.despine(ax=ax)

    plt.tight_layout()
    plt.savefig('reg.png')
    plt.close()


def best_boxplots(df):
    cols = ['1000', '1010', '0000']
    best = df[
        df['exe_name'].isin(cols)
    ]
    g = sns.FacetGrid(data=best, col='exe_name', height=5, col_order=cols)
    g.map_dataframe(
        sns.boxplot, x='nvoters', y='times', hue='extra_parties',
        order=[100, 1000, 10000], hue_order=['True', 'False'],
        palette='tab10'
    )

    g.tight_layout()
    g.savefig('boxplots.png')
    plt.close()

def main():
    df = load_data()
    #grid_of_regplots(df)
    grid_of_boxplots(df)
    best_boxplots(df)


if __name__ == '__main__':
    main()
