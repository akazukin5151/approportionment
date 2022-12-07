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

let red
    : schema.Rgb
    = { r = 244, g = 67, b = 54 }

let blue
    : schema.Rgb
    = { r = 33, g = 150, b = 243 }

let green
    : schema.Rgb
    = { r = 76, g = 175, b = 80 }

let orange
    : schema.Rgb
    = { r = 255, g = 152, b = 0 }

let all_methods
    : List schema.AllocationMethod
    = [ schema.AllocationMethod.DHondt
      , schema.AllocationMethod.WebsterSainteLague
      , schema.AllocationMethod.Droop
      , schema.AllocationMethod.Hare
      ]

let square_parties
    : NonEmpty schema.Party
    = { head = { x = -0.7, y = 0.7, name = "A", color = red }
      , tail =
        [ { x = 0.7, y = 0.7, name = "B", color = blue }
        , { x = 0.7, y = -0.7, name = "C", color = green }
        , { x = -0.7, y = -0.7, name = "D", color = orange }
        ]
      }

let equilateral_parties
    : NonEmpty schema.Party
    = { head = { x = 0.0, y = 0.7, name = "A", color = red }
      , tail =
        [ { x = -0.7, y = -0.7, name = "B", color = blue }
        , { x = 0.7, y = -0.7, name = "C", color = green }
        ]
      }

let two_close_parties
    : NonEmpty schema.Party
    = { head = { x = -0.8, y = -0.6, name = "A", color = red }
      , tail =
        [ { x = -0.2, y = -0.7, name = "C", color = green }
        , { x = 0.0, y = -0.73, name = "B", color = blue }
        ]
      }

let two_close_right_parties
    : NonEmpty schema.Party
    = { head = { x = -0.5, y = 0.0, name = "A", color = red }
      , tail =
        [ { x = 0.4, y = -0.1, name = "C", color = green }
        , { x = 0.5, y = 0.1, name = "B", color = blue }
        ]
      }

let colinear_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = -0.6, name = "A", color = red }
      , tail =
        [ { x = 0.0, y = 0.0, name = "C", color = green }
        , { x = 0.2, y = 0.2, name = "B", color = blue }
        ]
      }

let middle_four_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = -0.4, name = "A", color = red }
      , tail =
        [ { x = -0.3, y = -0.4, name = "C", color = green }
        , { x = 0.6, y = 0.5, name = "B", color = blue }
        , { x = 0.8, y = -0.6, name = "D", color = orange }
        ]
      }

let on_triangle_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = 0.2, name = "A", color = red }
      , tail =
        [ { x = -0.5, y = 0.18, name = "C", color = green }
        , { x = -0.4, y = -0.35, name = "B", color = blue }
        , { x = 0.6, y = 0.07, name = "D", color = orange }
        ]
      }

let tick_parties
    : NonEmpty schema.Party
    = { head = { x = -0.6, y = 0.3, name = "A", color = red }
      , tail =
        [ { x = -0.5, y = 0.2, name = "C", color = green }
        , { x = -0.1, y = 0.25, name = "B", color = blue }
        , { x = 0.6, y = 0.35, name = "D", color = orange }
        ]
      }

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
        { allocation_methods = all_methods
        , colorschemes = generic_colorschemes name majority
        , data_out_dir = "out/" ++ name
        , n_seats = 10
        , n_voters = 1000
        , parties
        }

let configs
    : schema.Configs
    = [ generic_config "square" square_parties True
      , generic_config "equilateral" equilateral_parties True
      , generic_config "two_close" two_close_parties False
      , generic_config "two_close_right" two_close_right_parties True
      , generic_config "middle_four" middle_four_parties False
      , generic_config "on_triangle" on_triangle_parties False
      , generic_config "tick" tick_parties True
      , { allocation_methods = all_methods
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
        , parties = colinear_parties
        }
      ]

let all_colors = [ red, green, blue, orange ]

let _ = assert : schema.are_colors_valid all_colors === True

in  configs
