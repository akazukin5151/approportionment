mod colors;
mod highest_averages;
mod largest_remainder;
mod plot;
mod simulator;
mod types;
mod utils;

#[cfg(test)]
mod test_utils;

use colors::*;
use highest_averages::*;
use largest_remainder::*;
use plot::*;
use simulator::*;
use types::*;
use utils::*;

#[cfg(test)]
use test_utils::*;

use plotters::style::full_palette::*;

fn main() {
    let n_seats = 10;
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

    let party_to_colorize = parties[2].clone();

    // see colors module for possible functions
    let color = |hmap| {
        party_seats_to_continuous_color(
            n_seats,
            party_to_colorize.clone(),
            hmap,
        )
    };

    let rs = simulate_elections(|x| Box::new(DHondt(x)), n_seats, 100, parties);
    plot(parties, rs, "out/DHondt.png", color).unwrap();

    let rs = simulate_elections(
        |x| Box::new(WebsterSainteLague(x)),
        n_seats,
        100,
        parties,
    );
    plot(parties, rs, "out/SainteLague.png", color).unwrap();

    let rs = simulate_elections(|x| Box::new(Droop(x)), n_seats, 100, parties);
    plot(parties, rs, "out/droop.png", color).unwrap();

    let rs = simulate_elections(|x| Box::new(Hare(x)), n_seats, 100, parties);
    plot(parties, rs, "out/hare.png", color).unwrap();
}
