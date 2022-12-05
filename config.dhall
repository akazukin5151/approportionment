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

let parties
    : NonEmpty schema.Party
    = { head = { x = -0.7, y = 0.7, name = "A", color = red }
      , tail =
        [ { x = 0.7, y = 0.7, name = "B", color = blue }
        , { x = 0.7, y = -0.7, name = "C", color = green }
        , { x = -0.7, y = -0.7, name = "D", color = orange }
        ]
      }

let all_methods
    : List schema.AllocationMethod
    = [ schema.AllocationMethod.DHondt
      , schema.AllocationMethod.WebsterSainteLague
      , schema.AllocationMethod.Droop
      , schema.AllocationMethod.Hare
      ]

let colorschemes =
    -- { palette = schema.Palette.Continuous "C"
    -- , plot_out_dir = "examples/square/number-of-seats-c"
    -- }
    -- { palette = schema.Palette.Average
    -- , plot_out_dir = "examples/square/average-party"
    -- }
      [ { palette =
            schema.Palette.Discrete
              { party_to_colorize = "C", palette_name = "tab10" }
        , plot_out_dir = "examples/square/number-of-seats-d"
        }
      ]

let configs
    : schema.Configs
    = [ { allocation_methods = all_methods
        , colorschemes
        , data_out_dir = "out/square"
        , n_seats = 10
        , n_voters = 1000
        , parties
        }
      ]

let all_colors = [ red, green, blue, orange ]

let _ = assert : schema.are_colors_valid all_colors === True

in  configs
