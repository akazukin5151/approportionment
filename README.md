# Approportionment for proportional representation

**[WebUI playground and sandbox](https://akazukin5151.github.io/approportionment/)** (Everything runs on your computer, nothing on the server)

[Yee diagrams](http://zesty.ca/voting/sim/) for multi-winner electoral methods designed for proportional representation.

**Electoral methods:**

- [D'Hondt](https://en.wikipedia.org/wiki/D'Hondt_method)
- [Webster/Sainte-Lague](https://en.wikipedia.org/wiki/Webster/Sainte-Lagu%C3%AB_method)
- [Droop quota](https://en.wikipedia.org/wiki/Droop_quota)
- [Hare quota](https://en.wikipedia.org/wiki/Hare_quota)
    - See [property-based test findings](#property-based-test-findings)
- Australian Single transferable vote
    - Unweighted inclusive Gregory method
    - See [STV rules](#stv-rules)

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

## stv 8 candidates stdev 1.0
![stv-8-1.0-normal](examples/stv-8-1.0-normal/number-of-seats-d/out.png)

## stv 8 candidates stdev 1.0 with min party discipline
![stv-8-1.0-min](examples/stv-8-1.0-min/number-of-seats-d/out.png)

## stv 8 candidates stdev 1.0 with avg party discipline
![stv-8-1.0-avg](examples/stv-8-1.0-avg/number-of-seats-d/out.png)

## stv 8 candidates stdev 0.5
![stv-8-0.5-normal](examples/stv-8-0.5-normal/number-of-seats-d/out.png)

## stv 8 candidates stdev 0.5 with min party discipline
![stv-8-0.5-min](examples/stv-8-0.5-min/number-of-seats-d/out.png)

## stv 8 candidates stdev 0.5 with avg party discipline
![stv-8-0.5-avg](examples/stv-8-0.5-avg/number-of-seats-d/out.png)

## stv 13 candidates stdev 1.0
![stv-13-1.0-normal](examples/stv-13-1.0-normal/number-of-seats-d/out.png)

## stv 13 candidates stdev 1.0 with min party discipline
![stv-13-1.0-min](examples/stv-13-1.0-min/number-of-seats-d/out.png)

## stv 13 candidates stdev 1.0 with avg party discipline
![stv-13-1.0-avg](examples/stv-13-1.0-avg/number-of-seats-d/out.png)

## stv 13 candidates stdev 0.5
![stv-13-0.5-normal](examples/stv-13-0.5-normal/number-of-seats-d/out.png)

## stv 13 candidates stdev 0.5 with min party discipline
![stv-13-0.5-min](examples/stv-13-0.5-min/number-of-seats-d/out.png)

## stv 13 candidates stdev 0.5 with avg party discipline
![stv-13-0.5-avg](examples/stv-13-0.5-avg/number-of-seats-d/out.png)

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

## Number of voters and the participation criterion

IRV and STV fails the [participation criterion](https://en.wikipedia.org/wiki/Participation_criterion). This means increasing or decreasing the number of voters can unexpectedly cause different results, especially if the turnout change is concentrated to supporters of a particular party/candidate.

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

The binary program is not entirely offline because it uses Dhall to pass settings, and uses the Dhall standard library, which is imported from its online repository.

0. Install requirements for plotting `pip install -r python/requirements.txt`
1. Edit `config/config.dhall` as you please. The schema is in `config/lib/schema.dhall`.
2. Statically type-check and validate the config with `dhall resolve --file config/config.dhall | dhall normalize --explain`
3. Compile with optimizations with `cargo build --release`
4. `target/release/approportionment config/config.dhall`
5. `python python/main.py`

Both the rust and python programs are lazy - if their output file exists they will not do anything, no matter if the output file is valid or not. For a clean run, remove all output directories (default: `out`)

You can run an STV example using the `config/stv.dhall` config and `python/stv.py` script to plot.

### Compilation features

By default, `cargo build` will enable the `binary` feature only.

- `binary`: build the binary with dhall config and feather output
- `wasm`: builds only the library functions needed for the WebUI
    - also enables `voters_sample`
- `wasm_debug`: enables the `debug` function for debugging the WebUI
    - also enables `wasm`
- `intrinsics`: replace mathematical operators in distance calculation with compiler intrinsics, which speeds up the program. Nightly Rust only and intrinsics will never be stabilized.
- `fma_non_stv`: use [fused mul add](https://en.wikipedia.org/wiki/Multiply%E2%80%93accumulate_operation) for non STV methods. Ignored if `intrinsics` is enabled
- `fma_stv`: use [fused mul add](https://en.wikipedia.org/wiki/Multiply%E2%80%93accumulate_operation) for STV methods. Ignored if `intrinsics` is enabled
- `progress_bar`: Enables [indicatif](https://github.com/console-rs/indicatif) to display a progress bar in the console
- `voters_sample`: Enables returning a sample of 100 voters for every election. Does nothing for binaries even if enabled
- `stv_party_discipline`: Only for STV; does nothing for non-STV. Voters will first rank parties by a certain measure. Candidates are ranked by party then by distance. Voters will always rank all candidates from a more preferred party over a less preferred party, even if individual candidate distances are larger
    - This is a feature rather than a config setting because it will noticeably degrade performance.
    - "Party" is called coalition in Dhall config
    - The "min rank method" ranks parties by their closest candidate
    - The "average rank method" ranks parties by the average distance of their candidates
    - If a candidate has no party (`coalition = None Natural`), they are given a unique standalone "party", which functions without party discipline as there is only one candidate in that "party".
- `test_real_stv`: enables unit tests that compare STV against real world elections. The blt files must be downloaded to `rust/stv/tests/real/data/`.

Ties are currently broken by selecting the first party/candidate. For a proper tiebreak implementation (random choice for non-STV and looking at previous rounds for STV), see the `tiebreak` branch. Alternatively, to just get data on how many ties there are, see the `report-ties` branch. They weren't merged because I think it's not worth the extra code and performance, and also difficult to add as a cargo feature.

### Speeding it up

- If you're willing to use nightly rust, you can use intrinsics to speed up the program. Remove the `.sample` from `rust-toolchain.toml.sample`. Run `cargo build --release --features intrinsics`
- You can also enable optimizations for your CPU. Prepend cargo with `RUSTFLAGS='-C target-cpu=native'`. This can be combined with the intrinsics feature for even better performance.
    - But this was slower for me in STV for 10,000 voters and >7 parties
- Fused multiply add (fma) might speed up the program. Quick benchmarks for me showed that it was faster for non STV methods but slower for STV, which is why there are two separate feature toggles.
- Try using [Profile-guided optimizations](https://doc.rust-lang.org/rustc/profile-guided-optimization.html). There's no code to add so it's up to you to provide samples and recompile. I suggest `config/config.dhall` and `config/stv.dhall` as they have a variety of methods and parties/candidates. I used 1000 voters for both configs, and saw a 35% speed up for `config.dhall` and a 5% speed up for STV [0]. Try using a more varied set of candidates for STV.

[0] This might be outdated now

### Development

Run all tests with

```sh
cargo test --lib
```

There are also tests that runs the STV algorithm with real world election data, which needs to be downloaded first.

```sh
cd rust/stv/tests/real/data/
wget $(cat urls.txt)
unzip 'CHttpHandler.ashx*'
cd ../../../../..  # repo root
cargo test --lib real --features test_real_stv
```

Benchmark the allocation functions only with

```sh
cargo bench --features stv_party_discipline
```

Use hyperfine to compare two versions with something like

```sh
# Just compiling two versions and renaming the binaries
# Git branches are examples
git checkout old
cargo b --release
mv target/release/approportionment/ target/release/approportionment-old

git checkout new
cargo b --release
mv target/release/approportionment/ target/release/approportionment-new

hyperfine --prepare 'rm -rf out' 'target/release/approportionment-{name} config/benchmark.dhall' -L name new,old
```

# Performance

## Allocation methods only

See [./benches/README.md](./benches/README.md)

## Whole program

- Results for whole program benchmarks, not allocation method benchmarks
- Rough times I get on my computer (Intel i7-8550U) with 8 cores of multithreading (I didn't close all other programs)
- All except 10,000 voters 7 candidates are ran with the `intrinsics` feature and `target-cpu=native`
- Note that these times includes the time to read the Dhall config file, so performance seems to increase with more voters. This is because the time spent reading the config becomes negligible for longer running times. 
- Most of the running time is used to randomly generate voters and count their ballots. The actual allocation methods are much faster than this, so this is actually mostly measuring how fast you can generate a random normal distribution, calculate distances, and write results to a file, but not how fast the allocation methods are.

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

See [performance-findings.md](performance-findings.md). Specific timings might be outdated but they should remain true in general

# Correctedness

## Accuracy

The STV algorithm is tested by a combination of unit tests, property based tests, regression tests. It is also compared to the Glasgow Council elections, passing tests for 22 out of 23 wards. The single ward that did not pass was because Australian STV truncate values early, while Scottish STV keeps 5 decimal places.

## Min and max bounds

Run `cargo clippy -- -W clippy::integer_arithmetic` to see all warnings. Not all of them are relevant but some do point out numerical limitations:

- Max number of seats for all methods = `usize::MAX`
    - Number of seats are stored in a `usize`
- Max number of voters for all methods = `isize::MAX`
    - Ballots are stored in a vector and allocations in Rust/LLVM cannot exceed this number
- Max number of parties for feather = `usize::MAX / (200 * 200)`
    - The number of rows are limited by `usize::MAX`, each party needs to duplicated for every `200 * 200` points
- Max number of parties = `isize::MAX`
    - The number of seats for each party is stored in a vector and allocations in Rust/LLVM cannot exceed this number

- All numbers are inclusive, meaning "less than or equal" is safe
- The minimum for seats, voters, and parties are `0`
- `usize` and `isize` depends on if you are compiling for a 32-bit or 64-bit machine. See the documentation ([usize](https://doc.rust-lang.org/stable/std/primitive.usize.html), [isize](https://doc.rust-lang.org/stable/std/primitive.isize.html))
- `usize::MAX` is `2^64 − 1` for 64-bit
- `isize::MAX` is `2^63 − 1` for 64-bit

# Limitations

There are other very important factors that the graphs do not emphasize enough or just ignores.

## District magnitude

The district magnitude (total number of seats) must be large enough, otherwise they will not be proportional enough no matter what allocation method is used. There just aren't enough seats to represent everyone fairly. Fortunately you can adjust the district magnitude for these simulations, so do use it to inform your choice. Small district magnitudes effectively increases the natural threshold, which brings us to the next point.

## Thresholds

This project does not simulate thresholds as they are usually nationwide, but the districts here are not necessarily nationwide. Thresholds obviously distort proportionality. Thresholds do not always prevent extremists from winning seats, in fact they might amplify their influence. See [The threshold of political pain: How a tiny reform radicalized Israeli politics](https://www.timesofisrael.com/the-threshold-of-political-pain-how-a-tiny-reform-radicalized-israeli-politics/). In my opinion, the entire point of proportional representation is to give representation to "unpopular" parties, so using thresholds to prevent "unpopular" parties from winning seats is contradictory and undemocratic.

A threshold at 5% sounds reasonable, after all if a party wins just 5%, isn't it unpopular enough to not win any seats? But it doesn't work like that because multiple parties will fail to reach the threshold. Suddenly your mere 5% threshold turns to be twice as effective and deprived [16% of the population](https://en.wikipedia.org/wiki/2013_German_federal_election#Results) from representation. In the most extreme case in [Turkey](https://en.wikipedia.org/wiki/2002_Turkish_general_election#Results), a mere 10% threshold was five times as effective and deprived 47% of the population from representation, and the AKP nearly won a 66% supermajority with only 34.28% of the vote.

If you're going to have an explicit threshold, I would reverse this and guarantee that most of the population will be represented. For example, "aim to represent at least 95% of the popular vote", aiming to represent as much parties as possible to hit 95% of the vote. No matter if 1 party or 10 parties failed to enter parliament, at most 5% of the population would be unrepresented.

## Levelling seats and nationwide proportionality

Finally, this project models a single constituency only and does not have levelling seats. This can be a single nationwide district like the Netherlands. This can also be a local constituency district (eg Dublin Central, Södermanlands län). All methods here are proportional only within their district. For local constituency districts, this means the results are only semi-proportional nationwide. For party list PR systems, levelling seats are often used to ensure the nationwide seats are proportional. None of the countries that use STV for the national legislature (Ireland, Australia, Malta) has nationwide compensatory seats. Proportional methods cannot be naively combined across districts.

This presents another problem for STV, because it is difficult to do nationwide compensatory seats. A nationwide STV district in parallel with local districts will not work because this is not compensatory. Either the STV used in local districts has to be modified to depend on nationwide rankings, or a party list system has to be used to provide levelling seats. The latter is problematic as it is no longer party agnostic and it is unclear how to give compensatory seats for independents. The former would add even more complexity to the already complex STV.

# Q&A

## What about mixed compensatory systems?

Mixed compensatory systems include [MMP](https://en.wikipedia.org/wiki/Mixed-member_proportional_representation) (New Zealand) and [AMS](https://en.wikipedia.org/wiki/Additional_member_system) (Scotland). It does not include non-compensatory systems like parallel voting (Japan) or mixed-member majoritarian (Italy).

Fundamentally, these simulations are for one electoral district. This can be one subnational district or one nationwide district. Mixed proportional systems has two types of seats, constituency and list seats. The two seats may follow different district boundaries, so these simulations cannot take arbitrarily different districts without doubling in scope.

Subject to the constitutional court's ruling, Germany is changing its MMP system into a form of semi-open, district local party list PR, approportioned nationwide. The Bundestag will be fixed in size and there will be a constituency and list vote on the ballot. Parties are first allocated seats based on their list vote. Constituency candidates are elected to fill their party's allocated seats, prioritising candidates with larger pluralities first. Constituency candidates who won a plurality might not be elected if their party did not win enough list votes. This prevents overhang seats, and therefore removes the need for levelling seats (which compensates for overhang seats). Notably, the nationwide 5% threshold applies to the party list vote, so any party that miss the threshold will win 0 seats, even if they have a plurality in constituencies. The current 3-seat buffer to qualify for PR will be abolished.

Effectively this becomes a semi-open list system (voters may influence the ranking of candidates within their constituency, but not in other constituencies), a district local list (each constituency has a unique list of candidates), approportioned nationwide (district local lists are approportioned nationwide, not per district).

This project will be able to model Germany's new system, as approportionment by parties are solely determined by the nationwide vote share (ignoring the threshold). It will not model the exact MPs elected from the constituency vote, but this is fine as the focus is not on individual MPs but approportionment of seats between parties.

## Why not use binary formats instead of JSON for the webui's import/export?

JSON is faster than the pure Javascript msgpack and cbor library. V8 is amazing! The large file size is indeed a limitation, but those binary formats couldn't significantly decrease the file size either.

Protobuf doesn't have official support for Javascript/Typescript. Flatbuffers requires compiling a C++ program, dragging in an entire language toolchain.

# See also
## Prior art

### Multi winner methods

* https://github.com/ParkerFriedland/TernaryPlot
* https://web.archive.org/web/20211128200121/https://forum.electionscience.org/t/apportionment-algorithems-visualized/569
    * Forum is shut down, so to see other posts, download the `warc.gz` archive [here](https://archive.org/details/forum.electionscience.org_20200626). Install [pywb](https://github.com/Webrecorder/pywb) to browse the archive to that url.
* https://bolson.org/voting/sim_one_seat/20090810/4b.html

### Single winner methods

Too many to list, but here's one of mine: https://github.com/akazukin5151/electoral-systems

- Both single and multi winner, with better mathematical evaluation tools: https://github.com/simberaj/votelib

### Ballot counting libraries

The ballot counting functions here are specifically optimized for the single purpose of simulating many anonymous elections. While it is fast, it is not ergonomic for counting an election, and does not support common output files (like `.blt`). Consider these instead:

- [tallystick](https://github.com/phayes/tallystick/)
- [stv-rs](https://github.com/gendx/stv-rs)

# TODO

### WebUI

- Catch exceptions from event handlers (top-level try-catch only catches exceptions throw in initial setup code, not event handlers)
- display a spinner on page load, and remove when it has finished loading

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

#### [Australian Federal Senate](https://www.legislation.gov.au/Details/C2022C00074)

All ballots are transferred, just at a fractional value. The transfer value remains as a decimal number, though when it is multiple to the ballots, the result is truncated (Part XVIII section 273 number 9b)

#### [Ireland Dáil](https://assets.gov.ie/111110/03f591cc-6312-4b21-8193-d4150169480e.pdf)

- Surplus to distribute is from the last parcel of votes that bought the candidate over the quota.
- Except, if all of those votes were first preference votes for that candidate (in other words, none of the votes were previously transferred; this is always true in the second count), then all votes will be examined

### How to transfer a count made up of first preferences and preferences that were transferred?

Consider the [food election example](https://github.com/akazukin5151/approportionment/blob/26327607e7299fc5c0217c09b9d9272daaf8d4dd/rust/stv/tests.rs#L27) from wikipedia.

#### [Australian Federal Senate](https://www.legislation.gov.au/Details/C2022C00074)

All 7 votes for #1 is transferred to #2. It is multiplied by the transfer value of `1/7`, making it 1, so the total votes for #2 is now `1 + 1 = 2`.

Then #2 is eliminated. The single original vote for #2, and all 7 votes that were transferred from #1, is transferred again to #3. Is this 8 full votes being transferred to #3? Or 1 full vote to #3 and 7 partial votes to #3?

First, let us clarify two types of transfers: surplus transfers and elimination transfers. The former is due to surplus votes from an elected candidate; the latter is due to votes to an eliminated candidate. My interpretation is:

- Section 9 governs surplus transfers, and the transfer value in such cases is always for the current candidate. It won't look at the transfer values of previous transfers
- Section 12 says treat transferred votes as if it was a first preference. This again implies transfer values of previous transfers is disregarded, after all there can't be previous transfers if we pretend the current tally are of first preference votes.

But elimination transfers have different rules:

Section 13AA(a) says that the transfer value is 1 full vote for both actual first preference and transferred first preferences. This implies 8 full votes for the above example.

However, 13AA(b)(ii) implies that for transferring eliminated candidates, if it has received transfers previously, then those votes must be multiplied by their transfer value first, before being transferred away. This is indeed what wikipedia describes [here](https://en.wikipedia.org/wiki/Counting_single_transferable_votes#Transfers_of_votes_of_eliminated_candidates) as "compounded fractional value"

So for surplus transfers, the transfer value only depends on the candidate being transferred out of. For elimination transfers, the transfer value for the current candidate is 1, but the overall transfer value is a compounded one, meaning it is the product of all previous transfer values that were applied to the ballot.

Going back to the example scenario, this is 1 full vote to #3 and 7 partial votes to #3. The transfer value for those 7 votes is the product of all previous and current transfer values: `1/7 * 1`. The transfer value for the single vote is 1. So #3 ultimately gets `1 + 1/7*7 = 2` new votes, and the new count is `4 + 2 = 6` votes. #3 is elected without a surplus and the problem ends here.

But what if there was a surplus? My interpretation is that only section 13 talks about multiplying previous transfer values before transferring, and section 13 is only for elimination transfers. So surplus transfers does not use compounded fractional votes. If #3 had a surplus, all votes for #3 would be transferred using #3's transfer value. Which can be larger than the surplus if there were enough votes that was previously transferred (which was weighted to be below the previous surplus), and no longer weighted when it is transferred out again.

This is consistent with Wikipedia's description of the Australian STV rules as unweighed inclusive Gregory - it is not not weighted for surplus transfers.

The full quote from section 9 says the transfer value is (emphasis mine):

> **the number of surplus votes** of the elected candidate shall be divided by the number of first preference votes received by the candidate and the resulting fraction shall be the transfer value

Comparing to [Scottish councils](https://www.legislation.gov.uk/ssi/2007/42/schedule/1/part/III/crossheading/counting-of-votes/made), section 48.3 says the transfer value is (emphasis mine):

> the value which is calculated by **multiplying the surplus of the transferring candidate by the value of the ballot paper when received by that candidate** [divided by] the total number of votes credited to that candidate

Australia just uses the surplus, while Scotland weights the surplus by the compounded transfer value first.

[Western Australia's](https://www.legislation.wa.gov.au/legislation/prod/filestore.nsf/FileURL/mrdoc_44407.pdf/$FILE/Electoral%20Act%201907%20-%20%5B17-b0-01%5D.pdf?OpenElement) upper house weights the surplus as well. Schedule 1 says that the first quota transfer work as usual, but there are different rules if a ballot is further transferred. Section 5 says (emphasis mine):

> (a) the number of surplus votes of the elected candidate shall be divided by the number of votes received by him and the resulting fraction shall be the surplus fraction;
> (b) in relation to any particular ballot papers for surplus votes of the elected candidate, the surplus fraction shall be **multiplied by the transfer value at which those ballot papers were transferred to the elected candidate**, or by one if they expressed first preference votes for the elected candidate, and **the product shall be the continued transfer value** of those particular ballot papers;

The "continued transfer value" is just the compounded transfer value.

### If multiple candidates reach quota, which surplus to transfer first?

#### [Australian Federal Senate](https://www.legislation.gov.au/Details/C2022C00074)

Part XVIII section 273 subsection (21) says transfer the largest surplus first

### How many candidates should a party run in STV?

- [Ireland (pdf)](https://data.oireachtas.ie/ie/oireachtas/electoralProcess/electionResults/dail/2020/2020-05-01_33rd-dail-general-election-results_en.pdf): Fianna Fáil and Fine Gael usually runs half the district magnitude (2-3), but sometimes either runs 1 in less popular districts. Sinn Féin usually runs 1, and 2 for popular districts. Other parties usually run just one candidate. Note that Sinn Féin ran too few candidates in the 2020 election; they would have won more seats if they ran more.
- [Australia](https://en.wikipedia.org/wiki/Results_of_the_2022_Australian_federal_election_(Senate)): The ballot allows voters to rank candidates as usual, but also to vote for a pre-determined rank endorsed by a party. Nevertheless, Australia has a two-party system as the lower house does not have proportional representation, so the two main parties runs all or nearly all of the district's available seats, while other parties run only a handful of candidates.
- Malta has a two-party system despite having STV, because the district magnitudes are too small, resulting in a ridiculously high effective electoral threshold that only the two main parties can cross. Anyway, the two main parties [fill the ballots](https://electoral.gov.mt/pr3-06-03-22-en) with way more candidates than *in the entire house*.
- Scotland: SNP usually runs 2 seats and the rest runs 1. Sometimes Labour runs 2, eg in [Glasgow](https://www.glasgow.gov.uk/index.aspx?articleid=29269) and [Fife](https://www.fife.gov.uk/kb/docs/articles/council-and-democracy/elections2/election-results/local-government-election-results/local-elections-2022). See also [Aberdeen](https://www.aberdeencity.gov.uk/LG2022/local-government-election-2022-results), [Highlands](https://www.highland.gov.uk/download/downloads/id/25105/count_booklet.pdf) (SNP running 1 candidate in some wards in Highlands)
    - [Orkney](https://www.orkney.gov.uk/Council/C/local-government-election-5-may-2022.htm) and [Shetland](https://www.shetland.gov.uk/downloads/download/1457/local-council-election-2022): Only the Green party ran candidates, the rest were independents

Current STV implementation bypasses this by forcing you to specify each individual candidate. In practice, it will be very tedious, hopefully teaching you how important this problem is. The plots will only show how successful a single candidate is, not the party they represent. In the WebUI, the solution is to group candidates in a coalitions. For party-list methods, this would be useful to analyze whether a governing coalition has a majority. For STV, this would be essential to analyzing how many seats a party has overall.

Currently the coalition feature works for the WebUI. For local plotting with python, the coalition feature is only available for STV

# Further extensions

### [Panachage](https://en.wikipedia.org/wiki/Panachage)

Panachage is when voters can vote for multiple candidates, across party lists if possible. The exact number of votes depends, but a common one is the value of the district magnitude. The votes are tallied according to normal PR list rules and candidates are elected according to the number of votes they won. Due to panachage there will be more votes than voters.

