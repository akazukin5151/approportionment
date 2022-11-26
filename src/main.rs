mod highest_averages;
mod largest_remainder;
mod simulator;
mod plot;
mod utils;
mod types;

#[cfg(test)]
mod test_utils;

use highest_averages::*;
use largest_remainder::*;
use simulator::*;
use plot::*;
use utils::*;
use types::*;

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
    let rs = simulate_elections(|x| Box::new(DHondt(x)), n_seats, parties);
    //dbg!(&rs);
    plot(n_seats, parties, rs).unwrap();
}

