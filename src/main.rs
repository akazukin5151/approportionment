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


fn main() {
    let n_seats = 10;
    let parties = &[
        Party {
            x: -0.7,
            y: 0.7,
            name: "A".to_string(),
            color: "red".to_string(),
        },
        Party {
            x: 0.7,
            y: 0.7,
            name: "B".to_string(),
            color: "blue".to_string(),
        },
        Party {
            x: 0.7,
            y: -0.7,
            name: "C".to_string(),
            color: "green".to_string(),
        },
        Party {
            x: -0.7,
            y: -0.7,
            name: "D".to_string(),
            color: "orange".to_string(),
        },
    ];
    let rs = simulate_elections(|x| Box::new(DHondt(x)), n_seats, parties);
    //dbg!(&rs);
    plot(n_seats, parties, rs).unwrap();
}

