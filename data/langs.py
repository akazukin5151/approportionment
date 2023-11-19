import json
import pandas as pd
import matplotlib as mpl
import matplotlib.pyplot as plt
import seaborn as sns

with open('./out/langs/langs.json', 'r') as f:
    j = json.load(f)

choices = j['choices']
rounds = j['rounds']

def find(d, key):
    for k, v in d.items():
        if v == key:
            return k

rs = {}
for round in rounds:
    for i, x in enumerate(round):
        name = find(choices, i)
        r = rs.get(name)
        if r is not None:
            r.append(x)
        else:
            rs[name] = [x]

df = pd.DataFrame.from_records(rs).T

df.columns = ['r' + str(i) for i in range(0, 5)]
df.sort_values(by=['r0'], inplace=True, ascending=False)

df1 = df.reset_index().melt(['index'], var_name='round_num', value_name='approvals')
df2 = df1.copy()

langs = df['r0'].index
colors = []
palette = sns.color_palette()
for idx in range(len(langs)):
    rgb = palette[idx % len(palette)]
    hex_ = mpl.colors.rgb2hex(rgb)
    colors.append(hex_)

df1['bar_color'] = colors * len(df.columns)
df1['edge_color'] = 'none'
winners = []
for round in df.columns[1:]:
    round_num = int(round[1:])
    prev_round = 'r' + str(round_num - 1)
    winning_rows = df[df[round] == 0]
    winner = winning_rows.index[-1]
    winning_vote = winning_rows[prev_round].iloc[-1]
    for round_ in range(round_num, len(df.columns)):
        idx = df1[(df1['index'] == winner) & (df1['round_num'] == f'r{round_}')].index[0]
        df1.loc[idx, 'approvals'] = winning_vote
        df1.loc[idx, 'bar_color'] = 'none'
        df1.loc[idx, 'edge_color'] = 'red'
    winners.append(winner)

_, axes = plt.subplots(ncols=len(df.columns), figsize=(20, 10))
for idx, ax in enumerate(axes):
    subdf = df1[df1['round_num'] == 'r' + str(idx)]
    ax.barh(subdf['index'], subdf['approvals'], color=subdf['bar_color'], edgecolor=subdf['edge_color'])
    ax.invert_yaxis()
    ax.set_title(f'Round {idx}')

plt.tight_layout()
plt.savefig('out/langs/rounds.png')
plt.close()

palette = sns.color_palette(n_colors=len(df.columns))
labels = ['Round 0'] + [f'Round {idx + 1} - {winner}' for idx, winner in enumerate(winners)]
_, ax = plt.subplots(figsize=(20, 10))
for round in range(len(df.columns)):
    subdf = df2[df2['round_num'] == 'r' + str(round)]
    ax.barh(subdf['index'], subdf['approvals'], color=palette[round], label=labels[round])

ax.invert_yaxis()
plt.legend()
plt.tight_layout()
plt.savefig('out/langs/stacked.png')
plt.close()

df = df.head(10)
# dfn = df.sum(axis=1)
pct = df.div(df['r0'], axis=0)
df2 = pct.reset_index().melt(['index'], var_name='round_num', value_name='pct')

plt.subplots(figsize=(20, 10))
sns.pointplot(df2, x='round_num', y='pct', hue='index')
plt.tight_layout()
plt.savefig('out/langs/line.png')
