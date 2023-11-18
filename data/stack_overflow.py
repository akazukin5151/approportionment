import pandas as pd
import networkx as nx
import matplotlib.pyplot as plt


df = pd.read_csv('./data/stack-overflow-developer-survey-2022/survey_results_public.csv')

uniques = df['LanguageWantToWorkWith'].dropna().str.split(';', expand=True).stack().reset_index(drop=True).unique()
# print(uniques)

# g = nx.DiGraph()
# g.add_nodes_from(uniques)

splitted = df['LanguageWantToWorkWith'].dropna()

df1 = pd.DataFrame()
for unique in uniques:
    xs = splitted[
        splitted.str.contains(unique.replace('++', r'\+\+'))
    ].str.split(';', expand=True).stack().reset_index(drop=True).value_counts()

    sum = 0
    for other, num in xs.items():
        if other != unique:
            # g.add_edge(unique, other, weight=num)
            sum += num

    df1[unique] = xs.drop(unique) / sum * 100

# total = df1.sum()
# widths = [df1[a][b] / total[a] for a, b in g.edges()]
# pos = nx.circular_layout(g)
# nx.draw_networkx_nodes(g, pos)
# nx.draw_networkx_edges(g, pos, width=widths, arrowsize=5)
# nx.draw_networkx_labels(g, pos)
# plt.show()

print(df1)
df1.to_csv('out.csv')
