let Prelude =
      https://prelude.dhall-lang.org/v21.1.0/package.dhall
        sha256:0fed19a88330e9a8a3fbe1e8442aa11d12e38da51eb12ba8bcb56f3c25d0854a

let schema = ../lib/schema.dhall

let n_voters_modifier
    : Natural -> List schema.Config -> List schema.Config
    = \(n_voters : Natural) ->
        Prelude.List.map
          schema.Config
          schema.Config
          (\(cfg : schema.Config) -> cfg // { n_voters })

let cfg_extractor
    : List schema.Config -> Natural -> List schema.Config
    = -- Given an indice, access the config at that position and return
      -- the resulting Optional as a List (which can be empty or a single value,
      -- which is the config at the indice)
      \(configs : List schema.Config) ->
      \(idx : Natural) ->
        let o_cfg = Prelude.List.index idx schema.Config configs

        in  Prelude.Optional.toList schema.Config o_cfg

let make_configs =
      \(n_voters : Natural) ->
      \(idx_filter : Optional (List Natural)) ->
      \(original_config : List schema.Config) ->
        let n_voters_modified = n_voters_modifier n_voters original_config

        let extractor = cfg_extractor n_voters_modified

        let res =
            -- if no filter is given, run all configs
            -- if a filter is given, extract all configs then
            -- flatten the resulting list
              merge
                { None = n_voters_modified
                , Some =
                    \(idxs : List Natural) ->
                      Prelude.List.concatMap
                        Natural
                        schema.Config
                        extractor
                        idxs
                }
                idx_filter

        in  res

in  { make_configs }
