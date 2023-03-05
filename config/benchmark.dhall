-- This config is for running benchmarks
-- It modifies the number of voters in config.dhall, and optionally applies
-- a filter on config indices
let n_voters = 100

let idx_filter
    : Optional (List Natural)
    = Some [ 2 ]

let original_config = ./config.dhall

let modifier = ./example_utils/modifier.dhall

let configs = modifier.make_configs n_voters idx_filter original_config.configs

in  { configs }
