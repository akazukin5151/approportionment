use iai::black_box;
use libapproportionment::{
    allocate::Allocate,
    generators::generate_voters,
    highest_averages::{divisor::Divisor, lib::HighestAverages},
    largest_remainder::{lib::LargestRemainders, quota::Quota},
    types::SimulateElectionsArgs,
};

use super::super::{parties::*, seed::get_xy_seeds};

fn simple_benchmark(mut a: impl Allocate, n_voters: usize, n_seats: usize) {
    let stdev = 1.0;
    let voter_mean = (0., 0.);
    let args = SimulateElectionsArgs {
        n_seats,
        n_voters,
        stdev,
        parties: TRIANGLE_PARTIES,
        seed: None,
        party_of_cands: None,
        n_parties: None,
    };

    let voters = black_box(generate_voters(
        black_box(voter_mean),
        black_box(n_voters),
        black_box(stdev),
        get_xy_seeds(),
    ));
    a.generate_ballots(black_box(&voters), black_box(&args));
    black_box(a.allocate_seats(
        black_box(n_seats),
        black_box(TRIANGLE_PARTIES.len()),
        black_box(n_voters),
    ));
}

macro_rules! make_bench {
    ($fn_name:ident, $name:ident, $x:expr, $n_voters:expr, $n_seats:expr) => {
        pub fn $fn_name() {
            let a = $name::new($n_voters, $x);
            simple_benchmark(a, $n_voters, $n_seats)
        }
    };
}

make_bench!(dhondt_10_100, HighestAverages, Divisor::DHondt, 100, 10);
make_bench!(dhondt_10_1000, HighestAverages, Divisor::DHondt, 1000, 10);
make_bench!(dhondt_10_10000, HighestAverages, Divisor::DHondt, 10000, 10);
make_bench!(dhondt_50_100, HighestAverages, Divisor::DHondt, 100, 50);
make_bench!(dhondt_50_1000, HighestAverages, Divisor::DHondt, 1000, 50);
make_bench!(dhondt_50_10000, HighestAverages, Divisor::DHondt, 10000, 50);

make_bench!(
    sainte_lague_10_100,
    HighestAverages,
    Divisor::SainteLague,
    100,
    10
);
make_bench!(
    sainte_lague_10_1000,
    HighestAverages,
    Divisor::SainteLague,
    1000,
    10
);
make_bench!(
    sainte_lague_10_10000,
    HighestAverages,
    Divisor::SainteLague,
    10000,
    10
);
make_bench!(
    sainte_lague_50_100,
    HighestAverages,
    Divisor::SainteLague,
    100,
    50
);
make_bench!(
    sainte_lague_50_1000,
    HighestAverages,
    Divisor::SainteLague,
    1000,
    50
);
make_bench!(
    sainte_lague_50_10000,
    HighestAverages,
    Divisor::SainteLague,
    10000,
    50
);

make_bench!(droop_10_100, LargestRemainders, Quota::Droop, 100, 10);
make_bench!(droop_10_1000, LargestRemainders, Quota::Droop, 1000, 10);
make_bench!(droop_10_10000, LargestRemainders, Quota::Droop, 10000, 10);
make_bench!(droop_50_100, LargestRemainders, Quota::Droop, 100, 50);
make_bench!(droop_50_1000, LargestRemainders, Quota::Droop, 1000, 50);
make_bench!(droop_50_10000, LargestRemainders, Quota::Droop, 10000, 50);

make_bench!(hare_10_100, LargestRemainders, Quota::Hare, 100, 10);
make_bench!(hare_10_1000, LargestRemainders, Quota::Hare, 1000, 10);
make_bench!(hare_10_10000, LargestRemainders, Quota::Hare, 10000, 10);
make_bench!(hare_50_100, LargestRemainders, Quota::Hare, 100, 50);
make_bench!(hare_50_1000, LargestRemainders, Quota::Hare, 1000, 50);
make_bench!(hare_50_10000, LargestRemainders, Quota::Hare, 10000, 50);
