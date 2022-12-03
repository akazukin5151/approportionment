let Prelude =
      https://prelude.dhall-lang.org/v21.1.0/package.dhall
        sha256:0fed19a88330e9a8a3fbe1e8442aa11d12e38da51eb12ba8bcb56f3c25d0854a

let Rgb
    : Type
    = { r : Natural, g : Natural, b : Natural }

let Party
    : Type
    = { x : Double, y : Double, name : Text, color : Rgb }

let Color
    : Type
    = < Continuous | Discrete | Average >

let AllocationMethod
    : Type
    = < DHondt | WebsterSainteLague | Droop | Hare >

let Config
    : Type
    = { allocation_methods : List AllocationMethod
      , color : Color
      , party_to_colorize : Optional Text
      , out_dir : Text
      , n_seats : Natural
      , n_voters : Natural
      , parties : List Party
      }

let Configs
    : Type
    = List Config

let validate_color =
      \(color : Rgb) ->
            Prelude.Natural.lessThanEqual color.r 255
        &&  Prelude.Natural.lessThanEqual color.g 255
        &&  Prelude.Natural.lessThanEqual color.b 255
        &&  Prelude.Natural.greaterThanEqual color.r 0
        &&  Prelude.Natural.greaterThanEqual color.g 0
        &&  Prelude.Natural.greaterThanEqual color.b 0

let are_colors_valid =
      -- usage: `assert : are_colors_valid [...] === True`
      \(xs : List Rgb) ->
        Prelude.List.fold
          Rgb
          xs
          Bool
          (\(color : Rgb) -> \(acc : Bool) -> acc && validate_color color)
          True

in  { Rgb
    , Party
    , Color
    , AllocationMethod
    , Config
    , Configs
    , validate_color
    , are_colors_valid
    }
