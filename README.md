# Approportionment for proportional representation

**[WebUI playground and sandbox](https://akazukin5151.github.io/approportionment/)** (Everything runs on your computer, nothing on the server)

[Yee diagrams](http://zesty.ca/voting/sim/) for multi-winner electoral methods designed for proportional representation.

**Electoral methods:**

- [D'Hondt](https://en.wikipedia.org/wiki/D'Hondt_method)
- [Webster/Sainte-Lague](https://en.wikipedia.org/wiki/Webster/Sainte-Lagu%C3%AB_method)
- [Droop quota](https://en.wikipedia.org/wiki/Droop_quota)
- [Hare quota](https://en.wikipedia.org/wiki/Hare_quota)
    - See [property-based test findings](#property-based-test-findings)
- Australian Single transferable vote, see [STV rules](#stv-rules)

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

## stv-8
![stv-8](examples/stv-8/number-of-seats-d/out.png)

## stv-13
![stv-13](examples/stv-13/number-of-seats-d/out.png)

# Election methods findings

## Divisor methods dividing to 0

Divisor methods (eg D'Hondt, Sainte-Lague) can fail catastrophically if there is a very low number of voters, because it quickly divides the number of remaining votes to 0. When all or most parties have 0 votes, there is no meaningful way to find the party with the most votes to award a seat to.

## The hare quota should remain a decimal

The Hare Quota is basically `total_votes/total_seats`. But do you leave it as a decimal or turn it into an integer?

- Brazil rounds the fraction [(article 106)](https://www.planalto.gov.br/ccivil_03/Leis/L4737.htm)
- Hong Kong floors the fraction [(49(6))](https://www.elegislation.gov.hk/hk/cap542!en@2016-06-10T00:00:00?xpid=ID_1438403409546_001)

Both are vulnerable to giving more seats than the total seats possible. It's best to leave the quota as a decimal.

## Largest remainder methods might encounter more remaining seats than parties

See [forum discussion here](https://www.votingtheory.org/forum/topic/321/largest-remainders-methods-more-remaining-seats-than-parties)

Largest remainder methods works by first allocating seats based on the floor of a party's quota. The number of automatic seats given this way is usually less than the number of parties. It then gives an extra seat to parties with the largest remainder in their quota, until all seats have been filled.

However, it is possible to have a situation to allocate too few automatic seats. In this situation, giving every party 1 extra seat will still not reach the required seats to fill.

Toby Pereria's proposed solution is to give 1 extra seat for the party with the lowest `seats_won - votes_won / quota` until all seats have been filled.

Numerically large quotas like the Droop quota seems to be more vulnerable to this than the Hare quota.

# Usage

## WebUI

Go to https://akazukin5151.github.io/approportionment/ if you just want to use it. Alternatively you can run the WebUI entirely offline, as the website is entirely offline. Follow the instructions below for this, or for development.

### Requirements

- npm
- [wasm-pack](https://github.com/rustwasm/wasm-pack/). If wasm-pack doesn't work, try version 0.9.1
- [sass](https://sass-lang.com/)

### Build

```sh
wasm-pack build --target web -- --features wasm
cd webui
npm ci
npm run dev  # or npm run build

# Launch an http server (or use your preferred method)
cd dist
python -m http.server 8000
# Open http://0.0.0.0:8000/ in your browser (faster on chromium)
```

## Binary program

0. Install requirements for plotting `pip install -r python/requirements.txt`
1. Edit `config/config.dhall` as you please. The types and validator functions are in `config/lib/schema.dhall`.
2. Statically type-check and validate the config with `dhall resolve --file config/config.dhall | dhall normalize --explain`
3. Compile with optimizations for speed with `cargo build --release`
4. `target/release/approportionment config/config.dhall`
5. `python python/main.py`

Both the rust and python programs are lazy - if their output file exists they will not do the calculation, no matter if the output file is valid or not. For a clean run, remove all output directories

You can run an STV example using the `config/stv-profiling.dhall` config and `python/stv.py` script to plot.

### Feature list

By default, `cargo build` will enable the `binary` feature only.

- `binary`: build the binary with progress bar, dhall config, and feather output
- `wasm`: builds only the library functions needed for the WebUI
    - also enables `voters_sample`
- `wasm_debug`: enables the `debug` function for debugging the WebUI
    - also enables `wasm`
- `intrinsics`: replace mathematical operators in distance calculation with compiler intrinsics, which speeds up the program. Nightly Rust only and intrinsics will never be stabilized.
- `fma_non_stv`: use [fused mul add](https://en.wikipedia.org/wiki/Multiply%E2%80%93accumulate_operation) for non STV methods. Ignored if `intrinsics` is enabled
- `fma_stv`: use [fused mul add](https://en.wikipedia.org/wiki/Multiply%E2%80%93accumulate_operation) for STV methods. Ignored if `intrinsics` is enabled
- `progress_bar`: Enables [indicatif](https://github.com/console-rs/indicatif) to display a progress bar
- `voters_sample`: Enables returning a sample of 100 voters for every election. Does nothing for binaries even if enabled

### Speeding it up

- You should probably use a more flexible library dedicated to counting votes in general. The code here is focused one goal: simulating fictional elections. This means things like party names are irrelevant and therefore not supported to boost performance. For rust there's [tallystick](https://github.com/phayes/tallystick/).
- If you're willing to use nightly rust, you can use intrinsics to speed up the program. Remove the `.sample` from `rust-toolchain.toml.sample`. Run `cargo build --release --features intrinsics`
- You can also enable optimizations for your CPU. Prepend with `RUSTFLAGS='-C target-cpu=native'` **if and only if all of the following are true:**
    - You're using the intrinsics feature
    - You're *not* using STV for 10,000 voters and >7 parties
- Fused multiply add (fma) might speed up the program. Quick benchmarks for me showed that it was faster for non STV methods but slower for STV, which is why there are two separate feature toggles.
- Try using [Profile-guided optimizations](https://doc.rust-lang.org/rustc/profile-guided-optimization.html). There's no code to add so it's up to you to provide samples and recompile. I suggest `config/config.dhall` as it has a variety of parties and all non-STV methods; and `config/stv-profiling.dhall` for STV. I used 1000 voters for both configs, and saw a 35% speed up for `config.dhall` and a 5% speed up for STV. Try using a more varied sample for STV.

### Development

Run tests with

```sh
cargo test
```
Benchmark two versions with something like

```sh
# Just compiling two versions and renaming the binaries
# Git branches are examples
git checkout old
cargo b --release
mv target/release/approportionment/ target/release/approportionment-old

git checkout new
cargo b --release
mv target/release/approportionment/ target/release/approportionment-new

hyperfine --prepare 'rm -rf out/two_close' 'target/release/approportionment-{name} config/benchmark.dhall' -L name new,old
```

# Performance

- Rough times I get on my computer (Intel i7-8550U) with 8 cores of multithreading (I didn't close all other programs)
- All except 10,000 voters 7 candidates are ran with the `intrinsics` feature and `target-cpu=native`
- Note that these times includes the time to read the Dhall config file, so performance seems to increase with more voters. This is because the time spent reading the config becomes negligible for longer running times. 
- Most of the running time is used to randomly generate voters and count their ballots. The actual allocation methods are much faster than this, so this is actually mostly measuring how fast you can generate a random normal distribution and perform distance calculations, and not how fast the allocation methods are. STV is the exception, it is slower in allocating seats because it needs to count ballots potentially multiple times.

### Non-STV (D'Hondt, Sainte-Lague, Hare, and Droop combined)

Number of voters | Time (s) | Total votes   | Votes per second
---              | ---      | ---           | ---
100              | 1.5      | 16,000,000    | 10,666,666
1,000            | 2.2      | 160,000,000   | 72,727,272
10,000           | 10       | 1,600,000,000 | 160,000,000

- The total votes are calculated by `4 * 200 * 200 * n_voters`. There are 4 allocation methods, 200 rows, and 200 columns. `4 * 200 * 200` is the total number of elections ran, and every election has `n_voters` number of votes

### STV

Number of voters | Number of candidates | Time (s) | Total votes | Total marks   | Votes per second | Marks per second
---              | ---                  | ---      | ---         | ---           | ---              | ---
100              | 7                    | 2.7      | 4,000,000   | 28,000,000    | 1,481,481        | 10,370,370
100              | 12                   | 3.2      | 4,000,000   | 48,000,000    | 1,250,000        | 15,000,000
1,000            | 7                    | 9.5      | 40,000,000  | 280,000,000   | 4,210,526        | 29,473,684
1,000            | 12                   | 14.8     | 40,000,000  | 480,000,000   | 2,702,703        | 32,432,432
10,000           | 7                    | 78       | 400,000,000 | 2,800,000,000 | 5,128,205        | 35,897,436
10,000           | 12                   | 127      | 400,000,000 | 4,800,000,000 | 3,149,606        | 37,795,276

- Total marks is the number of votes times the number of candidates
- All voters rank all candidates, so every vote has a mark for every candidate
- This metric is here as a reminder that STV potentially looks at a single vote multiple times, so the number of candidates are as important as the number of voters

# Performance findings

## Parallelism

Parallel processing greatly increased the speed. For 1000 voters, it reduced a single-threaded program from 52 seconds to 32 seconds[0]. But there are a lot of loops, where should a loop be parallelized? There are three possible levels of parallelism: at the config level, at the allocation method level, and at the voter level. 

Benchmarks showed that voter-only (001) and config-and-allocation-method (110) are the fastest. The voter-only program has a slightly faster speed, but the difference is within the margin of error. It also has a higher variance of 1 second, while the config-and-allocation-method program has a lower variance of 0.6 seconds. Therefore, I chose to use parallelism at the config and allocation method levels (110).

[0] Note: this has been improved to 2.2 seconds now, but the general findings should still remain valid

## `count_freqs`

Profiling shows that the most used function is [0] `count_freqs`, which makes sense as it has to be run for every ballot. The function itself is very efficient, but I was wondering if there is still space for improvement. I rewrote the function in C, and the generated assembly was smaller than Rust's. But actual benchmarks did not show a statistically significant difference, so the Rust assembly was just as efficient despite having more lines -- Rust is really able to reach the speed of C.

[0] Note: it is no longer the most used function now.

## R star tree

For every voter, their distance to every party is calculated. This is in a tight loop and the calculation uses the euclidean distance involving a square root. But the distance itself is ignored, it is only used to find the party with the closest distance. So I tried using an R\* tree, a spatial data structure that is well optimized for a large number of queries, a small number of insertions, and finding the nearest neighbour. The parties are fixed in every config and there are only a few parties compared to tens of thousands of voters, so bulk loading the parties into an R\* tree will be very fast. Searching for nearest neighbour would be O(log(n)), which is very fast with a small n.

However, benchmarks showed that the R\* tree was slower. This is because of the constant term that big-O notation ignores. Nearest neighbour search isn't magical, it still does the euclidean distance calculation. So at the end it gave no benefits.

## Combining the output feather files

Re-creating the same schema every time seems to be inefficient, but benchmarks show the difference is statistically insignificant.

More importantly, will a single feather file be better? The python script reads all feather files in the dir, so there is no real benefit in splitting them up. Benchmarks show that python is slower in the single feather file version. So lifting the schema and plotting it, combined, is slower than the current, which is re-creating the schema every time and saving multiple feather files.

## Bounds checking

Rust will do bounds checking by default, even for release builds. Bounds checking is checking if the index to an array points to a valid element. This is important for memory safety -- it is undefined behaviour to access an invalid memory address. But if we are certain our indices will never go out of bounds, we can disable them. Does it help performance?

Profiling reveals that the most frequent bounds check is the ballot counting function. Disabling bounds check for that one, using the unsafe function `get_unchecked_mut`, resulted in no significant change for both non-STV and STV methods, even if there are 10000 ballots for each election. There's no point in potentially introducing UB over nothing, so bounds checking is kept.

# Correctedness

Run `cargo clippy -- -W clippy::integer_arithmetic` to see all warnings. Not all of them are relevant but some do point out numerical limitations:

- Max number of seats for all methods = `usize::MAX`
    - Number of seats are stored in a `usize`
- Max number of votes for all methods = `isize::MAX`
    - Ballots are stored in a vector and allocations in Rust/LLVM cannot exceed this number
- Max number of parties for feather = `usize::MAX / (200 * 200)`
    - The number of rows are limited by `usize::MAX`, each party needs to duplicated for every `200 * 200` points
- Max number of parties = `isize::MAX`
    - The number of seats for each party is stored in a vector and allocations in Rust/LLVM cannot exceed this number

- All numbers are inclusive, meaning "less than or equal" is safe
- The minimum for all three is `0`
- `usize` and `isize` depends on if you are compiling for a 32-bit or 64-bit machine. See the documentation ([usize](https://doc.rust-lang.org/stable/std/primitive.usize.html), [isize](https://doc.rust-lang.org/stable/std/primitive.isize.html))
- `usize::MAX` is `2^64 − 1` for 64-bit
- `isize::MAX` is `2^63 − 1` for 64-bit

# See also
## Prior art

* https://github.com/ParkerFriedland/TernaryPlot
* https://web.archive.org/web/20211128200121/https://forum.electionscience.org/t/apportionment-algorithems-visualized/569
    * Forum is shut down, so to see other posts, download the `warc.gz` archive [here](https://archive.org/details/forum.electionscience.org_20200626). Install [pywb](https://github.com/Webrecorder/pywb) to browse the archive to that url.
* https://bolson.org/voting/sim_one_seat/20090810/4b.html

## Single winner

https://github.com/akazukin5151/electoral-systems

# TODO

### Performance

- Flamegraph results for non-STV, from longest to fastest:
    1. generate_voters
    2. generate_ballots
    3. allocate_seats (regardless of allocation method)

### WebUI

- Consider moving progress to run button, as it can be out of scroll. At least consider disabling it initially
- Catch exceptions from event handlers (top-level try-catch only catches exceptions throw in initial setup code, not event handlers)
- display a spinner on page load, and remove when it has finished loading
- consider running simulation as soon as any setting is changed

### STV rules

You think STV is simple? I wish...

This is my best effort interpretation of the legal text. I don't have a lawyer so my interpretation can be wrong. I used legal text instead of academic papers because I wanted to have a faithful implementation according to a real-world system. STV is actually a system of different methods and all of them are different.

* https://en.wikipedia.org/wiki/Single_transferable_vote#Transfers_of_surplus_votes
* https://en.wikipedia.org/wiki/Counting_single_transferable_votes

* [Ireland, Dáil](https://assets.gov.ie/111110/03f591cc-6312-4b21-8193-d4150169480e.pdf)
    - Ceiling the largest remainders necessary to reach the surplus, and floor the rest ([121.6c](https://www.irishstatutebook.ie/eli/1992/act/23/section/121/enacted/en/html))
* [Scotland, councils](https://www.legislation.gov.uk/ssi/2007/42/schedule/1/made) ([simple english](https://blog.opavote.com/2016/11/plain-english-explanation-of-scottish.html))
    - Like Australia, but has fractional transfers up to 5 decimal places
    - Re-transfers from an eliminated candidate uses their original transfer value. (If a vote was transferred to a candidate, it becomes a fractional vote, and that candidate is eliminated, then the fractional vote is transferred as the fraction)
* [Malta](https://legislation.mt/eli/cap/354/eng/pdf), page 117
    - All ballots examined, reduce the value, round down, and transfer. If rounding down causes less transfers than needed, round the highest decimals up until the entire surplus is transferred.
    - Decimals in the share of surplus are rounded to favour the larger party
    - If there are multiple surpluses, transfer the one that appeared first in the counts. Eg candidate A has a surplus, candidate B gains a bigger surplus in another count, candidate A's surplus should still be transferred first.
    - Transfer of surpluses only considers the batch of votes that was transferred the soonest. Eg A's count is made up of first and second preferences. A's surplus is transferred from the second preferences first. If after such transferral there is still a surplus, the remaining surplus are exhausted.

### Which ballots to transfer?

#### [Australia Senate](https://www.legislation.gov.au/Details/C2022C00074)

All ballots are transferred, just at a fractional value. The transfer value remains as a decimal number, though when it is multiple to the ballots, the result is truncated (Part XVIII section 273 number 9b)

#### [Ireland Dáil](https://assets.gov.ie/111110/03f591cc-6312-4b21-8193-d4150169480e.pdf)

- Surplus to distribute is from the last parcel of votes that bought the candidate over the quota.
- Except, if all of those votes were first preference votes for that candidate (in other words, none of the votes were previously transferred; this is always true in the second count), then all votes will be examined

### How to transfer a count made up of first preferences and preferences that were transferred?

Consider the [food election example](https://github.com/akazukin5151/approportionment/blob/26327607e7299fc5c0217c09b9d9272daaf8d4dd/rust/stv/tests.rs#L27) from wikipedia.

All 7 votes for #1 is transferred to #2. It is multiplied by the transfer value of `1/7`, making it 1, so the total votes for #2 is now `1 + 1 = 2`.

Then #2 is eliminated. The single original vote for #2, and all 7 votes that were transferred from #1, is transferred again to #3. Is this 8 full votes being transferred to #3? Or 1 full vote to #3 and 7 partial votes to #3?

#### [Australia Senate](https://www.legislation.gov.au/Details/C2022C00074)

First, let us clarify two types of transfers: surplus transfers and elimination transfers. The former is due to surplus votes from an elected candidate; the latter is due to votes to an eliminated candidate. My interpretation is:

- Section 9 governs surplus transfers, and the transfer value in such cases is always for the current candidate. It won't look at the transfer values of previous transfers
- Section 12 says treat transferred votes as if it was a first preference. This again implies transfer values of previous transfers is disregarded, after all there can't be previous transfers if we pretend the current tally are of first preference votes.

But elimination transfers have different rules:

Section 13AA(a) says that the transfer value is 1 full vote for both actual first preference and transferred first preferences. This implies 8 full votes for the above example.

However, 13AA(b)(ii) implies that for transferring eliminated candidates, if it has received transfers previously, then those votes must be multiplied by their transfer value first, before being transferred away. This is indeed what wikipedia describes [here](https://en.wikipedia.org/wiki/Counting_single_transferable_votes#Transfers_of_votes_of_eliminated_candidates) as "compounded fractional value"

So for surplus transfers, the transfer value only depends on the candidate being transferred out of. For elimination transfers, the transfer value for the current candidate is 1, but the overall transfer value is a compounded one, meaning it is the product of all previous transfer values that were applied to the ballot.

Going back to the example scenario, this is 1 full vote to #3 and 7 partial votes to #3. The transfer value for those 7 votes is the product of all previous and current transfer values: `1/7 * 1`. The transfer value for the single vote is 1. So #3 ultimately gets `1 + 1/7*7 = 2` new votes, and the new count is `4 + 2 = 6` votes. #3 is elected without a surplus and the problem ends here.

But what if there was a surplus? My interpretation is that only section 13 talks about multiplying previous transfer values before transferring, and section 13 is only for elimination transfers. So surplus transfers does not use compounded fractional votes. If #3 had a surplus, all votes for #3 would be transferred using #3's transfer value. Which can be larger than the surplus if there were enough votes that was previously transferred (which was weighted to be below the previous surplus), and no longer weighted when it is transferred out again.

### If multiple candidates reach quota, which surplus to transfer first?

#### [Australia Senate](https://www.legislation.gov.au/Details/C2022C00074)

Part XVIII section 273 subsection (21) says transfer the largest surplus first

### What to do when a vote transfer causes a candidate to reach the quota?

#### [Australia Senate](https://www.legislation.gov.au/Details/C2022C00074)

Part XVIII section 273 number 9 says:

> and any continuing candidate who has received a number of votes equal to or greater than the quota on the completion of any such transfer shall be elected.

This suggests that candidates that reached the quota immediately after a transfer, is immediately elected, and their surplus transferred. (TODO)

### How many candidates should a party run in STV?

- [Ireland (pdf)](https://data.oireachtas.ie/ie/oireachtas/electoralProcess/electionResults/dail/2020/2020-05-01_33rd-dail-general-election-results_en.pdf): Fianna Fáil and Fine Gael usually runs half the district magnitude (2-3), but sometimes either runs 1 in less popular districts. Sinn Féin usually runs 1, and 2 for popular districts. Other parties usually run just one candidate. Note that Sinn Féin ran too few candidates in the 2020 election; they would have won more seats if they ran more.
- [Australia](https://en.wikipedia.org/wiki/Results_of_the_2022_Australian_federal_election_(Senate)): The ballot allows voters to rank candidates as usual, but also to vote for a pre-determined rank endorsed by a party. Nevertheless, Australia has a two-party system as the lower house does not have proportional representation, so the two main parties runs all or nearly all of the district's available seats, while other parties run only a handful of candidates.
- Malta has a two-party system despite having STV, because the district magnitudes are too small, resulting in a ridiculously high effective electoral threshold that only the two main parties can cross. Anyway, the two main parties [fill the ballots](https://electoral.gov.mt/pr3-06-03-22-en) with way more candidates than *in the entire house*.
- Scotland: SNP usually runs 2 seats and the rest runs 1. Sometimes Labour runs 2, eg in [Glasgow](https://www.glasgow.gov.uk/index.aspx?articleid=29269) and [Fife](https://www.fife.gov.uk/kb/docs/articles/council-and-democracy/elections2/election-results/local-government-election-results/local-elections-2022). See also [Aberdeen](https://www.aberdeencity.gov.uk/LG2022/local-government-election-2022-results), [Highlands](https://www.highland.gov.uk/download/downloads/id/25105/count_booklet.pdf) (SNP running 1 candidate in some wards in Highlands)
    - [Orkney](https://www.orkney.gov.uk/Council/C/local-government-election-5-may-2022.htm) and [Shetland](https://www.shetland.gov.uk/downloads/download/1457/local-council-election-2022): Only the Green party ran candidates, the rest were independents

Current STV implementation bypasses this by forcing you to specify each individual candidate. In practice, it will be very tedious, hopefully teaching you how important this problem is. The plots will only show how successful a single candidate is, not the party they represent. In the WebUI, the solution is to group candidates in a coalitions. For party-list methods, this would be useful to analyze whether a governing coalition has a majority. For STV, this would be essential to analyzing how many seats a party has overall.

TODO: implement coalition feature in python for local plotting
