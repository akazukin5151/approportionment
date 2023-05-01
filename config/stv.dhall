let Prelude =
      https://raw.githubusercontent.com/dhall-lang/dhall-lang/v21.1.0/Prelude/package.dhall

let NonEmpty = Prelude.NonEmpty.Type

let schema = ./lib/schema.dhall

let maker = ./example_utils/stv_parties.dhall

let generic_colorschemes_with_palette =
      \(palette_name : Text) ->
      \(name : Text) ->
        [ { palette =
              schema.Palette.Discrete { party_to_colorize = "C", palette_name }
          , plot_out_dir = "examples/" ++ name ++ "/number-of-seats-d"
          }
        ]

let generic_config =
      \(name : Text) ->
      \(stdev : Double) ->
      \(parties : NonEmpty schema.Party) ->
      \(rank_method : schema.PartyDiscipline) ->
        { allocation_methods =
          [ schema.AllocationMethod.StvAustralia rank_method ]
        , colorschemes = generic_colorschemes_with_palette "Pastel1" name
        , data_out_dir = "out/" ++ name
        , n_seats = 3
        , n_voters = 10000
        , stdev
        , parties
        }

let simple =
      \(rank_method : schema.PartyDiscipline) ->
      \(rank_name : Text) ->
        let f =
              \(stdev : Double) ->
              \(use_extra_parties : Bool) ->
                let n_cands = if use_extra_parties then "13" else "8"

                let name =
                      Prelude.Text.concatSep
                        "-"
                        [ "stv", n_cands, Prelude.Double.show stdev, rank_name ]

                in  generic_config
                      name
                      stdev
                      (maker.make_stv_parties use_extra_parties)
                      rank_method

        in  [ f 1.0 False, f 0.5 False, f 1.0 True, f 0.5 True ]

let configs
    : List schema.Config
    = Prelude.List.concat
        schema.Config
        [ simple schema.PartyDiscipline.None "normal"
        , simple schema.PartyDiscipline.Min "min"
        , simple schema.PartyDiscipline.Avg "avg"
        ]

in  { configs }
