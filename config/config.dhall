-- To type-check the config, run
-- `dhall resolve --file config.dhall | dhall normalize --explain`
--
-- Instead of the relative path, the schema can also be imported from this url
-- `https://raw.githubusercontent.com/akazukin5151/approportionment/main/config/schema.dhall`
-- which can be useful if distributing the executable without the schema file
-- Run `dhall freeze config.dhall` to append a hash for the url, to ensure
-- it doesn't change for security reasons
--
let Prelude =
      https://prelude.dhall-lang.org/v21.1.0/package.dhall
        sha256:0fed19a88330e9a8a3fbe1e8442aa11d12e38da51eb12ba8bcb56f3c25d0854a

let NonEmpty = Prelude.NonEmpty.Type

let schema = ./schema.dhall

let utils = ./utils.dhall

let parties = ./parties.dhall

let generic_colorschemes_with_palette =
    -- { palette = schema.Palette.Average
    -- , plot_out_dir = "examples/square/average-party"
    -- }
      \(palette_name : Text) ->
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
                        { party_to_colorize = "C", palette_name }
                  , plot_out_dir = "examples/" ++ name ++ "/number-of-seats-d"
                  }
                ]
              , extra
              ]

let generic_colorschemes = generic_colorschemes_with_palette "magma"

let generic_config =
      \(name : Text) ->
      \(parties : NonEmpty schema.Party) ->
      \(majority : Bool) ->
        { allocation_methods = utils.all_methods
        , colorschemes = generic_colorschemes name majority
        , data_out_dir = "out/" ++ name
        , n_seats = 10
        , n_voters = 10000
        , stdev = 1.0
        , parties
        }

let pastel_config =
      \(name : Text) ->
      \(parties : NonEmpty schema.Party) ->
      \(majority : Bool) ->
            generic_config name parties majority
        //  { colorschemes =
                generic_colorschemes_with_palette "Pastel1" name majority
            }

let configs
    : List schema.Config
    = [ generic_config "square" parties.square_parties True
      , generic_config "equilateral" parties.equilateral_parties True
      , pastel_config "two_close" parties.two_close_parties False
      , generic_config "two_close_right" parties.two_close_right_parties True
      , pastel_config "middle_four" parties.middle_four_parties False
      , pastel_config "on_triangle" parties.on_triangle_parties False
      , generic_config "tick" parties.tick_parties True
      ,     generic_config "colinear" parties.colinear_parties False
        //  { colorschemes =
              [ { palette =
                    schema.Palette.Discrete
                      { party_to_colorize = "B", palette_name = "magma" }
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
            }
      ]

in  { configs }
