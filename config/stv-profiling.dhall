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
        https://prelude.dhall-lang.org/v21.1.0/package.dhall

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

let extra_parties =
      [ { x = 0.1, y = -0.1, color = None schema.Rgb, name = None Text }
      , { x = 0.2, y = -0.2, color = None schema.Rgb, name = None Text }
      , { x = 0.4, y = -0.3, color = None schema.Rgb, name = None Text }
      , { x = 0.5, y = -0.4, color = None schema.Rgb, name = None Text }
      , { x = 0.6, y = -0.5, color = None schema.Rgb, name = None Text }
      ]

let stv_parties
    : NonEmpty schema.Party
    = let extra =
            if use_extra_parties then extra_parties else [] : List schema.Party

      let tail =
            Prelude.List.concat
              schema.Party
              [ [ { x = 0.7
                  , y = 0.7
                  , color = None schema.Rgb
                  , name = None Text
                  }
                , { x = 0.7
                  , y = -0.7
                  , color = None schema.Rgb
                  , name = None Text
                  }
                , { x = -0.7
                  , y = -0.7
                  , color = None schema.Rgb
                  , name = None Text
                  }
                , { x = -0.4
                  , y = -0.6
                  , color = None schema.Rgb
                  , name = None Text
                  }
                , { x = 0.3
                  , y = -0.8
                  , color = None schema.Rgb
                  , name = None Text
                  }
                , { x = -0.4
                  , y = 0.5
                  , color = None schema.Rgb
                  , name = None Text
                  }
                , { x = 0.3
                  , y = -0.6
                  , color = None schema.Rgb
                  , name = None Text
                  }
                ]
              , extra
              ]

      in  { head =
            { x = -0.7, y = 0.7, color = None schema.Rgb, name = None Text }
          , tail
          }

let configs
    : List schema.Config
    = [ pastel_config "stv" stv_parties False ]

in  { show_progress_bar = False, configs }
