let Prelude =
      https://prelude.dhall-lang.org/v21.1.0/package.dhall

let NonEmpty = Prelude.NonEmpty.Type

let AllocationMethod
    : Type
    = < DHondt | WebsterSainteLague | Droop | Hare | StvAustralia >

let Rgb
    : Type
    = { r : Natural, g : Natural, b : Natural }

let Palette
    : Type
    = < Discrete : { party_to_colorize : Text, palette_name : Text }
      | Majority : { for_party : Text }
      >

let Colorscheme
    : Type
    = { palette : Palette, plot_out_dir : Text }

let Party
    : Type
    = { x : Double, y : Double, name : Optional Text, color : Optional Rgb }

let Config
    : Type
    = { allocation_methods : List AllocationMethod
      , colorschemes : List Colorscheme
      , data_out_dir : Text
      , n_seats : Natural
      , n_voters : Natural
      , parties : NonEmpty Party
      }

let Configs
    : Type
    = { show_progress_bar : Bool, configs : List Config }

in  { Rgb, Party, Colorscheme, Palette, AllocationMethod, Config, Configs }
