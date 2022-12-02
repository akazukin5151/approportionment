mod highest_averages;
mod largest_remainder;
mod plot;
mod simulator;
mod types;
mod utils;

use std::{fs::create_dir_all, path::Path};

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

use clap::Parser;
use plotters::style::full_palette::*;

fn main() {
    let cli = Cli::parse();

    let n_seats = 10;
    let n_voters = 100;
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
        .find(|p| p.name == cli.party_to_colorize)
        .unwrap();

    let color_fn = match cli.color {
        types::Color::Continuous => party_seats_to_continuous_color,
        types::Color::Discrete => party_seats_to_discrete_color,
        types::Color::Average => average_party_colors,
    };

    let color = |hmap| color_fn(n_seats, party_to_colorize.clone(), hmap);

    let out_dir = cli.out_dir;
    let path = Path::new(&out_dir);
    if !path.exists() {
        create_dir_all(path).unwrap();
    }

    let rs =
        simulate_elections(|x| Box::new(DHondt(x)), n_seats, n_voters, parties);
    plot(parties, rs, path.join("DHondt.png"), color).unwrap();

    let rs = simulate_elections(
        |x| Box::new(WebsterSainteLague(x)),
        n_seats,
        n_voters,
        parties,
    );
    plot(parties, rs, path.join("SainteLague.png"), color).unwrap();

    let rs =
        simulate_elections(|x| Box::new(Droop(x)), n_seats, n_voters, parties);
    plot(parties, rs, path.join("droop.png"), color).unwrap();

    let rs =
        simulate_elections(|x| Box::new(Hare(x)), n_seats, n_voters, parties);
    plot(parties, rs, path.join("hare.png"), color).unwrap();
}
