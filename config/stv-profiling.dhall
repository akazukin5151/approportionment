-- Example usage:
-- NVOTERS='\(n: Natural) -> 1000' EXTRA_PARTIES=True dhall resolve --file config/stv-profiling.dhall | dhall normalize --explain
-- The NVOTERS env var is a constant function that ignores its input and returns a Natural
-- Because env:NVOTERS alone raises import resolution disabled error
let n_voters
    : Natural
    = env:NVOTERS 0 ? 100

let use_extra_parties
    : Bool
    = env:EXTRA_PARTIES ? False

let Prelude =
      https://raw.githubusercontent.com/dhall-lang/dhall-lang/v21.1.0/Prelude/package.dhall

let NonEmpty = Prelude.NonEmpty.Type

let schema = ./lib/schema.dhall

let maker = ./example_utils/stv_parties.dhall

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
        { allocation_methods =
          [ schema.AllocationMethod.StvAustralia
              { normal = 1.0, min_party = 0.0, avg_party = 0.0 }
          ]
        , colorschemes = generic_colorschemes name majority
        , data_out_dir = "out/" ++ name
        , n_seats = 3
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
    = [ pastel_config "stv" (maker.make_stv_parties use_extra_parties) False ]

in  { configs }
