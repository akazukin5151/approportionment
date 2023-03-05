-- This config is a simplified one for running benchmarks
let n_voters = 100

let Prelude =
      https://prelude.dhall-lang.org/v21.1.0/package.dhall
        sha256:0fed19a88330e9a8a3fbe1e8442aa11d12e38da51eb12ba8bcb56f3c25d0854a

let NonEmpty = Prelude.NonEmpty.Type

let schema = ./lib/schema.dhall

let utils = ./lib/utils.dhall

let parties = ./example_utils/parties.dhall

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
        , n_voters
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
    = [ pastel_config "two_close" parties.two_close_parties False ]

in  { configs }
