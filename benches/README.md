# Benchmarks plots

## Time based benchmarks

- Rows: non-STV methods
- Columns: number of voters
- y-axis: running time
- x-axis: the number of seats

Divisor (highest averages) methods (D'Hondt and Sainte Lague) are O(n) with respect to the number of seats, so as the x-axis increases, time also increases linearly. Largest remainder methods (Droop and Hare) are O(1) with respect to the number of seats, so there is no correlation between the x and y variables.

D'Hondt did have an outlier with 10000 voters, so these benchmarks are rather noisy

![non_stv_seats_v_time_by_voters](non_stv_seats_v_time_by_voters.png)

- Top row: Divisor (highest averages) methods
- Bottom row: Largest remainder methods
- y-axis: log(running time)
- x-axis: log(number of voters)
- Color: number of seats

As the number of voters are multiplied by 10 in each iteration, the expected running time should also be multiplied by 10. In other words, we take the logarithm (base 10) of both axes because the number of voters grow exponentially on base 10.

The theoretical time complexity is O(N) with respect to the number of votes, which matches our observation.

Again, divisor methods are consistently slower when there are more seats, but largest remainder methods do not show such a trend.

![non_stv_seats_v_time_by_voters](non_stv_voters_v_time.png)

- Rows: number of STV candidates
- Color: STV party discipline methods
- y-axis: log(running time)
- x-axis: log(number of voters)

Interestingly, STV is theoretically supposed to have O(N^2) time complexity with respect to the number of votes, but we observe a linear relationship.

Using different party discipline methods does not fundamentally change the time complexity relationship, nor large shifts in the constant terms. Any changes are relatively minor.

![stv_voters_v_time_by_pd](stv_voters_v_time_by_pd.png)

## Cachegrind based benchmarks

- Charts: Measurement type
- Color: Number of voters
- y-axis: Measurement value
- x-axis: Number of seats

For all non-STV methods. Again, the number of voters grow exponentially so we scale the measurements to be exponential as well. There is a linear relationship as expected of O(N). The error bars reflects differences due to different values from different methods. There is little difference between the different number of seats on average; divisor methods are affected but not largest remainder methods, and on average they cancel out.

The L2 cache gets significantly more work when there are 10000 voters, indicating that the vector containing the ballots has exceeded what the L1 cache can handle, resulting in more evictions to the L2 cache and hence L2 accesses. There is a similar story for RAM though in a less serious scale.

The last plot directly compares the relative magnitudes of all the instructions on the same y-axis scale, just to emphasize that the 5 other charts has different y-axis scales.

![non stv](./iai_non_stv.png)

- Charts: Measurement type
- Color: non-STV methods
- y-axis: Measurement value
- x-axis: log(Number of voters)

This clarifies the correlation/time complexity relationship between "performance" and the number of votes. The colors shows that all methods has the same time complexity characteristics (meaning same constant time factors).

![non stv reg](./iai_non_stv_reg.png)

- Charts: non-STV and STV
- Color: Number of voters
- y-axis: Log(Measurement value)
- x-axis: Measurement type

This compares non-STV methods to STV. Note the log scale (because number of voters grow exponentially) means a "linear" difference between the two charts mean an entire magnitude of difference. This means, generally STV is 10 times slower than non-STV.

![comp](./iai_comp.png)

- Charts: Measurement type
- Color: Number of voters
- y-axis: log(Measurement value)
- x-axis: Number of STV candidates

This is the STV version of the first plot in this section. The correlations are broadly the same: there is little difference between different number of candidates (for non-STV, it's number of seats). Increasing number of voters scales linearly, which is good considering that STV is theoretically O(N^2).

The biggest difference is the L2 accesses. For non-STV, there was a sudden jump from 1000 voters to 10000 voters. For STV however, the jump was between 100 voters to 1000 voters, indicating that the STV ballots are more memory heavy (the entire rankings needs to be stored), so they overflow the L1 cache faster.

![stv n choices](./iai_stv_n_choices.png)

- Charts: Measurement type
- Color: STV party discipline type
- y-axis: log(Measurement value)
- x-axis: log(Number of voters)

Normal party discipline is actually misleadingly named, because it means no party discipline. No party discipline should be the fastest by a decent amount, but fortunately the party discipline overhead did not extend to the L2 cache and RAM.

![stv reg](./iai_stv_reg.png)

# Plotting it yourself

```sh
cargo bench
mkdir -p benches/out
python benches/analysis.py
python benches/iai.py
```

