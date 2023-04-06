use iai::black_box;
use libapproportionment::{
    allocate::Allocate,
    generators::generate_voters,
};

use super::super::parties::*;
use super::super::seed::get_xy_seeds;

pub fn simple_benchmark(mut a: impl Allocate, n_voters: usize, total_seats: usize) {
    let stdev = 1.0;
    let voter_mean = (0., 0.);

    let voters = black_box(generate_voters(
        black_box(voter_mean),
        black_box(n_voters),
        black_box(stdev),
        get_xy_seeds()
    ));
    a.generate_ballots(
        black_box(&voters),
        black_box(TRIANGLE_PARTIES),
        #[cfg(feature = "stv_party_discipline")]
        &vec![],
        #[cfg(feature = "stv_party_discipline")]
        0,
    );
    black_box(a.allocate_seats(
        black_box(total_seats),
        black_box(TRIANGLE_PARTIES.len()),
        black_box(n_voters),
    ));
}

