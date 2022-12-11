# Approportionment for proportional representation

Like [Yee diagrams](http://zesty.ca/voting/sim/) but for multi-winner electoral methods designed for proportional representation.

**Electoral methods:**

- [D'Hondt](https://en.wikipedia.org/wiki/D'Hondt_method)
- [Webster/Sainte-Lague](https://en.wikipedia.org/wiki/Webster/Sainte-Lagu%C3%AB_method)
- [Droop quota](https://en.wikipedia.org/wiki/Droop_quota)
- [Hare quota](https://en.wikipedia.org/wiki/Hare_quota)
    - See [property-based test findings](#property-based-test-findings)

The x and y coordinates is a spatial representation of voters and parties. The coloured circles are the parties. The diamond is the party whose seats are colored.

Every coordinate is the voter mean. A normal distribution is generated around that mean coordinate. Every voter casts a ballot and the ballots are counted. The color of a coordinate is the number of seats won by the diamond party.

In general, the closer the coordinate is to the diamond party, more voters like that party, so it would win more seats. The further away, the less seats it would win, but it is rarely 0 seats unless if the distance is large enough, because proportional representation awards seats to less popular parties as well.

## equilateral
![equilateral](examples/equilateral/number-of-seats-d/out.png)

## colinear1
![colinear1](examples/colinear1/number-of-seats-d/out.png)

## two_close_right
![two_close_right](examples/two_close_right/number-of-seats-d/out.png)

## two_close
![two_close](examples/two_close/number-of-seats-d/out.png)

## colinear2
![colinear2](examples/colinear2/number-of-seats-d/out.png)

## square
![square](examples/square/number-of-seats-d/out.png)

## tick
![tick](examples/tick/number-of-seats-d/out.png)

## on_triangle
![on_triangle](examples/on_triangle/number-of-seats-d/out.png)

## middle_four
![middle_four](examples/middle_four/number-of-seats-d/out.png)

# Property-based test findings

## The hare quota should remain a decimal

The Hare Quota is basically `total_votes/total_seats`. But do you leave it as a decimal or turn it into an integer?

- Brazil rounds the fraction [(article 106)](https://www.planalto.gov.br/ccivil_03/Leis/L4737.htm)
- Hong Kong floors the fraction [(49(6))](https://www.elegislation.gov.hk/hk/cap542!en@2016-06-10T00:00:00?xpid=ID_1438403409546_001)

Both are vulnerable to giving more seats than the total seats possible. It's best to leave the quota as a decimal.

# Usage

0. Install requirements for plotting `pip install -r python/requirements.txt`
1. Edit `config/config.dhall` as you please. The types and validator functions are in `config/schema.dhall`.
    - You might want to make `show_progress_bar = True`, until you're used to it
2. Statically type-check and validate the config with `dhall resolve --file config/config.dhall | dhall normalize --explain`
3. Compile with optimizations for speed with `cargo build --release`
4. `target/release/approportionment config/config.dhall`
5. `python python/main.py`

Both the rust and python programs are lazy - if their output file exists they will not do the calculation, no matter if the output file is valid or not. For a clean run, remove all output directories

Run tests with

```sh
cargo test
```
Property-based tests will be slow and don't always catch violations. They are not substitutes for theorem proves.

Run benchmarks with something like

```sh
hyperfine --prepare 'rm out/two_close/DHondt.feather' 'target/release/approportionment-{name} config/config.dhall' -L name lto,nolto
```

# Other findings

Divisor methods (eg D'Hondt, Sainte-Lague) can fail catastrophically if there is a very low number of voters, because it quickly divides the number of remaining votes to 0. When all or most parties have 0 votes, there is no meaningful way to find the party with the most votes to award a seat to.

## Parallelism

Parallel processing greatly increased the speed. For 1000 voters, it reduced a single-threaded program from 52 seconds to 32 seconds. But there are a lot of loops, where should a loop be parallelized? There are three possible levels of parallelism: at the config level, at the allocation method level, and at the voter level. 

Benchmarks showed that voter-only (001) and config-and-allocation-method (110) are the fastest. The voter-only program has a slightly faster speed, but the difference is within the margin of error. It also has a higher variance of 1 second, while the config-and-allocation-method program has a lower variance of 0.6 seconds. Therefore, I chose to use parallelism at the config and allocation method levels (110).

## `count_freqs`

Profiling shows that the most used function is `count_freqs`, which makes sense as it has to be run for every ballot. The function itself is very efficient, but I was wondering if there is still space for improvement. I rewrote the function in C, and the generated assembly was smaller than Rust's. But actual benchmarks did not show a statistically significant difference, so the Rust assembly was just as efficient despite having more lines -- Rust is really able to reach the speed of C.

## R star tree

For every voter, their distance to every party is calculated. This is in a tight loop and the calculation uses the euclidean distance involving a square root. But the distance itself is ignored, it is only used to find the party with the closest distance. So I tried using an R\* tree, a spatial data structure that is well optimized for a large number of queries, a small number of insertions, and finding the nearest neighbour. The parties are fixed in every config and there are only a few parties compared to tens of thousands of voters, so bulk loading the parties into an R\* tree will be very fast. Searching for nearest neighbour would be O(log(n)), which is very fast with a small n.

However, benchmarks showed that the R\* tree was slower. This is because of the constant term that big-O notation ignores. Nearest neighbour search isn't magical, it still does the euclidean distance calculation. So at the end it gave no benefits.

## Combining the output feather files

Re-creating the same schema every time seems to be inefficient, but benchmarks show the difference is statistically insignificant.

More importantly, will a single feather file be better? The python script reads all feather files in the dir, so there is no real benefit in splitting them up. Benchmarks show that python is slower in the single feather file version. So lifting the schema and plotting it, combined, is slower than the current, which is re-creating the schema every time and saving multiple feather files.

# See also
## Prior art

* https://github.com/ParkerFriedland/TernaryPlot
* https://web.archive.org/web/20211128200121/https://forum.electionscience.org/t/apportionment-algorithems-visualized/569
    * Forum is shut down, so to see other posts, download the `warc.gz` archive [here](https://archive.org/details/forum.electionscience.org_20200626). Install [pywb](https://github.com/Webrecorder/pywb) to browse the archive to that url.
* https://bolson.org/voting/sim_one_seat/20090810/4b.html

## Single winner

https://github.com/akazukin5151/electoral-systems

## TODO

### Colors

Fundamentally, how do you even blend more than 2 colors together? Eg: blending red, green, and blue should result in what color? Orange means ignoring blue, purple means ignoring green, cyan means ignoring red.

* https://redrainkim.github.io/assets/images/color-colors-wheel-names-degrees-rgb-hsb-hsv-hue-78027630.jpg
* https://texample.net//media/tikz/examples/PNG/rgb-triangle.png
https://stackoverflow.com/questions/726549/algorithm-for-additive-color-mixing-for-rgb-values

### STV rules

You think STV is simple? I wish...

* https://en.wikipedia.org/wiki/Single_transferable_vote#Transfers_of_surplus_votes
* https://en.wikipedia.org/wiki/Counting_single_transferable_votes

* [Ireland, Dail](https://assets.gov.ie/111110/03f591cc-6312-4b21-8193-d4150169480e.pdf)
* [Australia, Senate](https://aec.gov.au/Voting/counting/senate_count.htm)
    - All of a candidate's votes are transferred, at a reduced value (but is it fractional?)
* [Scotland, councils](https://www.legislation.gov.uk/ssi/2007/42/schedule/1/made) ([simple english](https://blog.opavote.com/2016/11/plain-english-explanation-of-scottish.html))
    - Like Australia, but has fractional transfers up to 5 decimal places
    - Re-transfers from an eliminated candidate uses their original transfer value. (If a vote was transferred to a candidate, it becomes a fractional vote, and that candidate is eliminated, then the fractional vote is transferred as the fraction)
* [Malta](https://legislation.mt/eli/cap/354/eng/pdf), page 117
    - All ballots examined, reduce the value, round down, and transfer. If rounding down causes less transfers than needed, round the highest decimals up until the entire surplus is transferred.
    - If there are multiple surpluses, transfer the one that appeared first in the counts. Eg candidate A has a surplus, candidate B gains a bigger surplus in another count, candidate A's surplus should still be transferred first.
    - Transfer of surpluses only considers the batch of votes that was transferred the soonest. Eg A's count is made up of first and second preferences. A's surplus is transferred from the second preferences only. If after such transferral there is still a surplus, the remaining surplus are exhausted.
