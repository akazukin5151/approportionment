-- To type-check the config, run
-- `dhall resolve --file config.dhall | dhall normalize --explain`
--
-- Instead of the relative path, the schema can also be imported from this url
-- `https://raw.githubusercontent.com/akazukin5151/approportionment/main/schema.dhall`
-- which can be useful if distributing the executable without the schema file
-- Run `dhall freeze config.dhall` to append a hash for the url, to ensure
-- it doesn't change for security reasons
let Prelude =
      https://prelude.dhall-lang.org/v21.1.0/package.dhall
        sha256:0fed19a88330e9a8a3fbe1e8442aa11d12e38da51eb12ba8bcb56f3c25d0854a

let NonEmpty = Prelude.NonEmpty.Type

let schema = ./schema.dhall

let utils = ./utils.dhall

let parties = ./parties.dhall

let generic_colorschemes =
    -- { palette = schema.Palette.Average
    -- , plot_out_dir = "examples/square/average-party"
    -- }
      \(name : Text) ->
      \(majority : Bool) ->
        let extra =
              if    majority
              then  [ { palette = schema.Palette.Majority { for_party = "C" }
                      , plot_out_dir = "examples/" ++ name ++ "/majority"
                      }
                    ]
              else  [] : List schema.Colorscheme

        in  Prelude.List.concat
              schema.Colorscheme
              [ [ { palette =
                      schema.Palette.Discrete
                        { party_to_colorize = "C", palette_name = "Pastel1" }
                  , plot_out_dir = "examples/" ++ name ++ "/number-of-seats-d"
                  }
                ]
              , extra
              ]

let generic_config =
      \(name : Text) ->
      \(parties : NonEmpty schema.Party) ->
      \(majority : Bool) ->
        { allocation_methods = utils.all_methods
        , colorschemes = generic_colorschemes name majority
        , data_out_dir = "out/" ++ name
        , n_seats = 10
        , n_voters = 1000
        , parties
        }

let configs
    : schema.Configs
    = [ generic_config "square" parties.square_parties True
      , generic_config "equilateral" parties.equilateral_parties True
      , generic_config "two_close" parties.two_close_parties False
      , generic_config "two_close_right" parties.two_close_right_parties True
      , generic_config "middle_four" parties.middle_four_parties False
      , generic_config "on_triangle" parties.on_triangle_parties False
      , generic_config "tick" parties.tick_parties True
      , { allocation_methods = utils.all_methods
        , colorschemes =
          [ { palette =
                schema.Palette.Discrete
                  { party_to_colorize = "B", palette_name = "Pastel1" }
            , plot_out_dir = "examples/colinear1/number-of-seats-d"
            }
          , { palette = schema.Palette.Majority { for_party = "B" }
            , plot_out_dir = "examples/colinear1/majority"
            }
          , { palette =
                schema.Palette.Discrete
                  { party_to_colorize = "C", palette_name = "Pastel1" }
            , plot_out_dir = "examples/colinear2/number-of-seats-d"
            }
          ]
        , data_out_dir = "out/colinear"
        , n_seats = 10
        , n_voters = 1000
        , parties = parties.colinear_parties
        }
      ]

in  configs
