-- This config is for running benchmarks
-- It modifies the number of voters in stv.dhall, and optionally applies
-- a filter on config indices
--
-- The STV config indices are grouped by rank method, so first
-- identify the rank method you want (eg min) and its indice (1)
-- Then each rank method has 4 permutations between n_candidates and stdev.
-- Identify the permutation you want (eg 13 cands, stdev 1.0) and its indice (2)
-- The index for the concated config is 4r+p, where r is the rank method indice
-- and p is the permutation indice (eg 4*1+2 = 6 for min rank, 13 cands, stdev 1.0)
let n_voters = 100

let idx_filter
    : Optional (List Natural)
    = Some [ 0 ]

let original_config = ./stv.dhall

let modifier = ./example_utils/modifier.dhall

let configs = modifier.make_configs n_voters idx_filter original_config.configs

in  { configs }
