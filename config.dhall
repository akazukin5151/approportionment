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

let red
    : Rgb
    = { r = 255, g = 0, b = 0 }

let blue
    : Rgb
    = { r = 0, g = 0, b = 255 }

let green
    : Rgb
    = { r = 0, g = 255, b = 0 }

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

let config
    : Config
    = { color = Color.Continuous
      , party_to_colorize = "C"
      , out_dir = "examples/number-of-winners/"
      , n_seats = 10
      , n_voters = 100
      , parties
      }

in  config
