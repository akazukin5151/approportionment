# Performance findings

Specific timings might be outdated but they should remain true in general

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

