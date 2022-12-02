mod highest_averages;
mod largest_remainder;
mod plot;
mod simulator;
mod types;
mod utils;

use std::{env::args, fs::create_dir_all, path::Path};

use highest_averages::*;
use largest_remainder::*;
use plot::*;
use simulator::*;
use types::*;
use utils::*;

#[cfg(test)]
mod test_utils;
#[cfg(test)]
use test_utils::*;

use plotters::style::full_palette::*;

fn main() {
    let file = args().nth(1).unwrap();
    let r_config: Result<Config, _> = serde_dhall::from_file(file)
        .static_type_annotation()
        .parse();
    let config = r_config.unwrap_or_else(|r| {
        println!("{}", r);
        panic!()
    });

    let parties = &[
        Party {
            x: -0.7,
            y: 0.7,
            name: "A".to_string(),
            color: RED,
        },
        Party {
            x: 0.7,
            y: 0.7,
            name: "B".to_string(),
            color: BLUE,
        },
        Party {
            x: 0.7,
            y: -0.7,
            name: "C".to_string(),
            color: GREEN,
        },
        Party {
            x: -0.7,
            y: -0.7,
            name: "D".to_string(),
            color: ORANGE,
        },
    ];

    let party_to_colorize = parties
        .iter()
        .find(|p| p.name == config.party_to_colorize)
        .unwrap();

    let color_fn = match config.color {
        types::Color::Continuous => party_seats_to_continuous_color,
        types::Color::Discrete => party_seats_to_discrete_color,
        types::Color::Average => average_party_colors,
    };

    let color =
        |hmap| color_fn(config.n_seats, party_to_colorize.clone(), hmap);

    let out_dir = config.out_dir;
    let path = Path::new(&out_dir);
    if !path.exists() {
        create_dir_all(path).unwrap();
    }

    let rs = simulate_elections(
        |x| Box::new(DHondt(x)),
        config.n_seats,
        config.n_voters,
        parties,
    );
    plot(parties, rs, path.join("DHondt.png"), color).unwrap();

    let rs = simulate_elections(
        |x| Box::new(WebsterSainteLague(x)),
        config.n_seats,
        config.n_voters,
        parties,
    );
    plot(parties, rs, path.join("SainteLague.png"), color).unwrap();

    let rs = simulate_elections(
        |x| Box::new(Droop(x)),
        config.n_seats,
        config.n_voters,
        parties,
    );
    plot(parties, rs, path.join("droop.png"), color).unwrap();

    let rs = simulate_elections(
        |x| Box::new(Hare(x)),
        config.n_seats,
        config.n_voters,
        parties,
    );
    plot(parties, rs, path.join("hare.png"), color).unwrap();
}
