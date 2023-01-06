-- This config is a simplified one for profiling STV
let n_voters = 100

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
        { allocation_methods = [ schema.AllocationMethod.StvAustralia ]
        , colorschemes = generic_colorschemes name majority
        , data_out_dir = "out/" ++ name
        , n_seats = 3
        , n_voters
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

let stv_parties
    : NonEmpty schema.Party
    = { head = { x = -0.7, y = 0.7, color = None schema.Rgb, name = None Text }
      , tail =
        [ { x = 0.7, y = 0.7, color = None schema.Rgb, name = None Text }
        , { x = 0.7, y = -0.7, color = None schema.Rgb, name = None Text }
        , { x = -0.7, y = -0.7, color = None schema.Rgb, name = None Text }
        , { x = -0.4, y = -0.6, color = None schema.Rgb, name = None Text }
        , { x = 0.3, y = -0.8, color = None schema.Rgb, name = None Text }
        , { x = -0.4, y = 0.5, color = None schema.Rgb, name = None Text }
        , { x = 0.3, y = -0.6, color = None schema.Rgb, name = None Text }
        -- uncomment to test parallel sort of distances
        -- , { x = 0.1, y = -0.1, color = None schema.Rgb, name = None Text }
        -- , { x = 0.2, y = -0.2, color = None schema.Rgb, name = None Text }
        -- , { x = 0.4, y = -0.3, color = None schema.Rgb, name = None Text }
        -- , { x = 0.5, y = -0.4, color = None schema.Rgb, name = None Text }
        -- , { x = 0.6, y = -0.5, color = None schema.Rgb, name = None Text }
        ]
      }

let configs
    : List schema.Config
    = [ pastel_config "stv" stv_parties False ]

in  { show_progress_bar = False, configs }
