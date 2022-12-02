let Rgb
    : Type
    = { r : Natural, g : Natural, b : Natural }

let Party
    : Type
    = { x : Double, y : Double, name : Text, color : Rgb }

let Color
    : Type
    = < Continuous | Discrete | Average >

let Config
    : Type
    = { color : Color
      , party_to_colorize : Text
      , out_dir : Text
      , n_seats : Natural
      , n_voters : Natural
      , parties : List Party
      }

let Configs
    : Type
    = List Config

let red
    : Rgb
    = { r = 244, g = 67, b = 54 }

let blue
    : Rgb
    = { r = 33, g = 150, b = 243 }

let green
    : Rgb
    = { r = 76, g = 175, b = 80 }

let orange
    : Rgb
    = { r = 255, g = 152, b = 0 }

let parties
    : List Party
    = [ { x = -0.7, y = 0.7, name = "A", color = red }
      , { x = 0.7, y = 0.7, name = "B", color = blue }
      , { x = 0.7, y = -0.7, name = "C", color = green }
      , { x = -0.7, y = -0.7, name = "D", color = orange }
      ]

let configs
    : Configs
    = [ { color = Color.Continuous
        , party_to_colorize = "C"
        , out_dir = "examples/number-of-winners/"
        , n_seats = 10
        , n_voters = 100
        , parties
        }
      , { color = Color.Average
        , party_to_colorize = "C"
        , out_dir = "examples/average-party/"
        , n_seats = 10
        , n_voters = 100
        , parties
        }
      ]

in  configs
