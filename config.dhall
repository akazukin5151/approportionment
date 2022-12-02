let Color : Type = < Continuous | Discrete | Average >
let Config : Type = {
    color : Color,
    party_to_colorize: Text,
    out_dir: Text,
    n_seats: Natural,
    n_voters: Natural,
}

let config : Config = {
    color = Color.Continuous,
    party_to_colorize = "C",
    out_dir = "examples/number-of-winners/",
    n_seats = 10,
    n_voters = 100
}

in config
