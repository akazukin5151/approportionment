-- Example usage:
-- NVOTERS='\(n: Natural) -> 1000' EXTRA_PARTIES=True dhall resolve --file config/stv-profiling.dhall | dhall normalize --explain
-- The NVOTERS env var is a constant function that ignores its input and returns a Natural
-- Because env:NVOTERS alone raises import resolution disabled error
let n_voters
    : Natural
    = env:NVOTERS 0 ? 10000

let use_extra_parties
    : Bool
    = env:EXTRA_PARTIES ? False

let Prelude =
      https://raw.githubusercontent.com/dhall-lang/dhall-lang/v21.1.0/Prelude/package.dhall

let NonEmpty = Prelude.NonEmpty.Type

let schema = ./lib/schema.dhall

let utils = ./lib/utils.dhall

let parties = ./lib/parties.dhall

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

let extra_parties =
      [ { x = -0.9
        , y = 0.6
        , color = Some { r = 208, g = 166, b = 67 }
        , name = None Text
        , coalition = Some 3
        }
      , { x = 0.8
        , y = 0.6
        , color = Some { r = 149, g = 177, b = 61 }
        , name = Some "A"
        , coalition = Some 0
        }
      , { x = -0.8
        , y = -0.5
        , color = Some { r = 85, g = 183, b = 77 }
        , name = None Text
        , coalition = Some 2
        }
      , { x = 0.8
        , y = -0.5
        , color = Some { r = 77, g = 170, b = 207 }
        , name = None Text
        , coalition = Some 1
        }
      , { x = 0.0
        , y = -0.8
        , color = Some { r = 176, g = 92, b = 198 }
        , name = None Text
        , coalition = None Natural
        }
      ]

let stv_parties
    : NonEmpty schema.Party
    = let extra =
            if use_extra_parties then extra_parties else [] : List schema.Party

      let tail =
          -- I used https://medialab.github.io/iwanthue/ to generate the colors
            Prelude.List.concat
              schema.Party
              [ [ { x = 0.7
                  , y = 0.7
                  , color = Some { r = 210, g = 64, b = 74 }
                  , name = Some "C"
                  , coalition = Some 0
                  }
                , { x = 0.7
                  , y = -0.7
                  , color = Some { r = 201, g = 109, b = 59 }
                  , name = None Text
                  , coalition = Some 1
                  }
                , { x = -0.7
                  , y = -0.7
                  , color = Some { r = 143, g = 125, b = 59 }
                  , name = None Text
                  , coalition = Some 2
                  }
                , { x = -0.4
                  , y = -0.6
                  , color = Some { r = 75, g = 125, b = 64 }
                  , name = None Text
                  , coalition = Some 2
                  }
                , { x = 0.4
                  , y = 0.6
                  , color = Some { r = 95, g = 188, b = 144 }
                  , name = Some "B"
                  , coalition = Some 0
                  }
                , { x = -0.4
                  , y = 0.5
                  , color = Some { r = 114, g = 119, b = 202 }
                  , name = None Text
                  , coalition = Some 3
                  }
                , { x = 0.4
                  , y = -0.5
                  , color = Some { r = 202, g = 89, b = 150 }
                  , name = None Text
                  , coalition = Some 1
                  }
                ]
              , extra
              ]

      in  { head =
            { x = -0.7
            , y = 0.7
            , color = Some { r = 191, g = 104, b = 119 }
            , name = None Text
            , coalition = Some 3
            }
          , tail
          }

let configs
    : List schema.Config
    = [ pastel_config "stv" stv_parties False ]

in  { configs }
