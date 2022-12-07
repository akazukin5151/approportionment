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

let all_colors = [ red, green, blue, orange ]

let _ = assert : schema.are_colors_valid all_colors === True

in  { red, blue, green, orange, all_methods }
