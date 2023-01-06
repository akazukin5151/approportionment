let Prelude =
      https://prelude.dhall-lang.org/v21.1.0/package.dhall
        sha256:0fed19a88330e9a8a3fbe1e8442aa11d12e38da51eb12ba8bcb56f3c25d0854a

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
      -- , schema.AllocationMethod.StvAustralia
      ]

let is_color_valid =
      \(color : schema.Rgb) ->
            Prelude.Natural.lessThanEqual color.r 255
        &&  Prelude.Natural.lessThanEqual color.g 255
        &&  Prelude.Natural.lessThanEqual color.b 255
        &&  Prelude.Natural.greaterThanEqual color.r 0
        &&  Prelude.Natural.greaterThanEqual color.g 0
        &&  Prelude.Natural.greaterThanEqual color.b 0

let are_colors_valid =
    -- usage: `assert : are_colors_valid [...] === True`
      \(xs : List schema.Rgb) ->
        Prelude.List.fold
          schema.Rgb
          xs
          Bool
          (\(color : schema.Rgb) -> \(acc : Bool) -> acc && is_color_valid color)
          True

let all_colors = [ red, green, blue, orange ]

let _ = assert : are_colors_valid all_colors === True

in  { red, blue, green, orange, all_methods }
