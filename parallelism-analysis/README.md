Should `generate_stv_ballots` be parallelized and where? There are four possible locations that can be parallelized. Benchmarks were ran on Github Actions to decide. All permutations of them and all combinations of number of voters and number of candidates are used.

Numbers are bitfields that corresponds to whether the nth-location is parallelized or not. For example, `1011` means the first, third, and fourth locations are parallelized.

![matrix](./matrix.png)

![boxplots](./boxplots.png)

https://github.com/akazukin5151/approportionment/suites/10288313817/artifacts/506055209

Missing data is due to workflows that were killed due to taking too much time - don't want to use them anyway!

Initially I chose to parallelize the first loop (1000), but then again benchmarks on my own computer don't show a significant improvement. `generate_stv_ballots` is being called too often, completely flooding the flamegraph with rayon. Github CI machines aren't designed for benchmarking anyway, so I don't think introducing something more complex without clear performance gains is worth it.
