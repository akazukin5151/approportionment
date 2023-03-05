-- This config is for running benchmarks
-- It modifies the number of voters in config.dhall, and optionally applies
-- a filter on config indices
let n_voters = 100

let idx_filter
    : Optional (List Natural)
    = Some [ 2 ]

let Prelude =
      https://prelude.dhall-lang.org/v21.1.0/package.dhall
        sha256:0fed19a88330e9a8a3fbe1e8442aa11d12e38da51eb12ba8bcb56f3c25d0854a

let schema = ./lib/schema.dhall

let original_config = ./config.dhall

let n_voters_modified
    : List schema.Config
    = Prelude.List.map
        schema.Config
        schema.Config
        (\(cfg : schema.Config) -> cfg // { n_voters })
        original_config.configs

let extract_cfg
    : Natural -> List schema.Config
    = -- Given an indice, access the config at that position and return
      -- the resulting Optional as a List (which can be empty or a single value,
      -- which is the config at the indice)
      \(idx : Natural) ->
        let o_cfg = Prelude.List.index idx schema.Config n_voters_modified

        in  Prelude.Optional.toList schema.Config o_cfg

let configs =
    -- if no filter is given, run all configs
    -- if a filter is given, extract all configs then flatten the resulting list
      merge
        { None = n_voters_modified
        , Some =
            \(idxs : List Natural) ->
              Prelude.List.concatMap Natural schema.Config extract_cfg idxs
        }
        idx_filter

in  { configs }
