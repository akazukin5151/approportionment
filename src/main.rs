mod highest_averages;
mod largest_remainder;
mod simulator;
mod utils;
mod types;

#[cfg(test)]
mod test_utils;

use highest_averages::*;
use largest_remainder::*;
use simulator::*;
use utils::*;
use types::*;

#[cfg(test)]
use test_utils::*;


fn main() {
    let rs = simulate_elections(|x| Box::new(DHondt(x)), 10);
    dbg!(rs);
}

