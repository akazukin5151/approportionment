mod parties;
#[cfg(feature = "stv_party_discipline")]
mod rank_methods;

use parties::*;

use iai::black_box;
use libapproportionment::{
    allocate::Allocate,
    generators::generate_voters,
    highest_averages::{dhondt::DHondt, webster::WebsterSainteLague},
    largest_remainder::{Droop, Hare},
    stv::StvAustralia,
    types::Party,
};

#[cfg(feature = "stv_party_discipline")]
use {
    libapproportionment::{extract_stv_parties, methods::RankMethod},
    rank_methods::*,
};

fn simple_benchmark(mut a: impl Allocate, n_voters: usize, total_seats: usize) {
    let stdev = 1.0;
    let voter_mean = (0., 0.);

    let voters = black_box(generate_voters(
        black_box(voter_mean),
        black_box(n_voters),
        black_box(stdev),
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

macro_rules! make_bench {
    ($fn_name:ident, $name:ident, $n_voters:expr, $n_seats:expr) => {
        fn $fn_name() {
            let a = $name::new($n_voters, 0);
            simple_benchmark(a, $n_voters, $n_seats)
        }
    };
}

fn stv_benchmark(mut a: impl Allocate, n_voters: usize, parties: &[Party]) {
    let stdev = 1.0;
    let total_seats = 3;
    let voter_mean = (0., 0.);
    #[cfg(feature = "stv_party_discipline")]
    let (party_of_cands, n_parties) = extract_stv_parties(parties);

    let voters = black_box(generate_voters(
        black_box(voter_mean),
        black_box(n_voters),
        black_box(stdev),
    ));
    a.generate_ballots(
        black_box(&voters),
        black_box(parties),
        #[cfg(feature = "stv_party_discipline")]
        black_box(&party_of_cands),
        #[cfg(feature = "stv_party_discipline")]
        black_box(n_parties),
    );
    black_box(a.allocate_seats(
        black_box(total_seats),
        black_box(TRIANGLE_PARTIES.len()),
        black_box(n_voters),
    ));
}

fn stv_8(
    n_voters: usize,
    #[cfg(feature = "stv_party_discipline")] rank_method: RankMethod,
) {
    #[allow(unused_mut)]
    let mut a = StvAustralia::new(n_voters, PARTIES_8.len());
    // IIFE because bare attribute assignments are unstable
    #[cfg(feature = "stv_party_discipline")]
    (|| a.rank_method = rank_method)();
    stv_benchmark(a, n_voters, PARTIES_8)
}

fn stv_13(
    n_voters: usize,
    #[cfg(feature = "stv_party_discipline")] rank_method: RankMethod,
) {
    let mut parties: Vec<Party> = vec![];
    // this is a workaround for Party not having Clone
    // conditional derive for test doesn't work so we manually copy the values
    // don't want to derive it just for benchmarks
    for party in PARTIES_8.iter().chain(EXTRA_PARTIES) {
        let party = Party {
            x: party.x,
            y: party.y,
            #[cfg(feature = "stv_party_discipline")]
            coalition: party.coalition,
        };
        parties.push(party);
    }
    #[allow(unused_mut)]
    let mut a = StvAustralia::new(n_voters, parties.len());
    #[cfg(feature = "stv_party_discipline")]
    (|| a.rank_method = rank_method)();
    stv_benchmark(a, n_voters, &parties)
}

macro_rules! make_stv_bench {
    ($fn_name:ident, $stv_f:ident, $n_voters:expr) => {
        fn $fn_name() {
            $stv_f(
                $n_voters,
                #[cfg(feature = "stv_party_discipline")]
                RankMethod::default(),
            )
        }
    };
    ($fn_name:ident, $stv_f:ident, $n_voters:expr, $rank_method:expr) => {
        #[cfg(feature = "stv_party_discipline")]
        fn $fn_name() {
            $stv_f($n_voters, $rank_method)
        }
    };
}

make_bench!(dhondt_10_100, DHondt, 100, 10);
make_bench!(dhondt_10_1000, DHondt, 1000, 10);
make_bench!(dhondt_10_10000, DHondt, 10000, 10);
make_bench!(dhondt_50_100, DHondt, 100, 50);
make_bench!(dhondt_50_1000, DHondt, 1000, 50);
make_bench!(dhondt_50_10000, DHondt, 10000, 50);

make_bench!(sainte_lague_10_100, WebsterSainteLague, 100, 10);
make_bench!(sainte_lague_10_1000, WebsterSainteLague, 1000, 10);
make_bench!(sainte_lague_10_10000, WebsterSainteLague, 10000, 10);
make_bench!(sainte_lague_50_100, WebsterSainteLague, 100, 50);
make_bench!(sainte_lague_50_1000, WebsterSainteLague, 1000, 50);
make_bench!(sainte_lague_50_10000, WebsterSainteLague, 10000, 50);

make_bench!(droop_10_100, Droop, 100, 10);
make_bench!(droop_10_1000, Droop, 1000, 10);
make_bench!(droop_10_10000, Droop, 10000, 10);
make_bench!(droop_50_100, Droop, 100, 50);
make_bench!(droop_50_1000, Droop, 1000, 50);
make_bench!(droop_50_10000, Droop, 10000, 50);

make_bench!(hare_10_100, Hare, 100, 10);
make_bench!(hare_10_1000, Hare, 1000, 10);
make_bench!(hare_10_10000, Hare, 10000, 10);
make_bench!(hare_50_100, Hare, 100, 50);
make_bench!(hare_50_1000, Hare, 1000, 50);
make_bench!(hare_50_10000, Hare, 10000, 50);

make_stv_bench!(stv_8_normal_100, stv_8, 100);
make_stv_bench!(stv_8_normal_1000, stv_8, 1000);
make_stv_bench!(stv_8_normal_10000, stv_8, 10000);

make_stv_bench!(stv_13_normal_100, stv_13, 100);
make_stv_bench!(stv_13_normal_1000, stv_13, 1000);
make_stv_bench!(stv_13_normal_10000, stv_13, 10000);

make_stv_bench!(stv_8_min_100, stv_8, 100, MIN_RANK_METHOD);
make_stv_bench!(stv_8_min_1000, stv_8, 1000, MIN_RANK_METHOD);
make_stv_bench!(stv_8_min_10000, stv_8, 10000, MIN_RANK_METHOD);

make_stv_bench!(stv_13_min_100, stv_13, 100, MIN_RANK_METHOD);
make_stv_bench!(stv_13_min_1000, stv_13, 1000, MIN_RANK_METHOD);
make_stv_bench!(stv_13_min_10000, stv_13, 10000, MIN_RANK_METHOD);

make_stv_bench!(stv_8_avg_100, stv_8, 100, AVG_RANK_METHOD);
make_stv_bench!(stv_8_avg_1000, stv_8, 1000, AVG_RANK_METHOD);
make_stv_bench!(stv_8_avg_10000, stv_8, 10000, AVG_RANK_METHOD);

make_stv_bench!(stv_13_avg_100, stv_13, 100, AVG_RANK_METHOD);
make_stv_bench!(stv_13_avg_1000, stv_13, 1000, AVG_RANK_METHOD);
make_stv_bench!(stv_13_avg_10000, stv_13, 10000, AVG_RANK_METHOD);

// copied from iai source, added attr:meta
macro_rules! main {
    ( $( $(#[$attr:meta])?  $func_name:ident ),+ $(,)* ) => {
        mod iai_wrappers {
            $(
                $(#[$attr])*
                pub fn $func_name() {
                    let _ = iai::black_box(super::$func_name());
                }
            )+
        }

        fn main() {

            let benchmarks : &[&(&'static str, fn())]= &[

                $(
                    $(#[$attr])*
                    &(stringify!($func_name), iai_wrappers::$func_name),
                )+
            ];

            iai::runner(benchmarks);
        }
    }
}

main!(
    dhondt_10_100,
    dhondt_10_1000,
    dhondt_10_10000,
    dhondt_50_100,
    dhondt_50_1000,
    dhondt_50_10000,
    sainte_lague_10_100,
    sainte_lague_10_1000,
    sainte_lague_10_10000,
    sainte_lague_50_100,
    sainte_lague_50_1000,
    sainte_lague_50_10000,
    droop_10_100,
    droop_10_1000,
    droop_10_10000,
    droop_50_100,
    droop_50_1000,
    droop_50_10000,
    hare_10_100,
    hare_10_1000,
    hare_10_10000,
    hare_50_100,
    hare_50_1000,
    hare_50_10000,
    stv_8_normal_100,
    stv_8_normal_1000,
    stv_8_normal_10000,
    stv_13_normal_100,
    stv_13_normal_1000,
    stv_13_normal_10000,
    #[cfg(feature = "stv_party_discipline")]
    stv_8_min_100,
    #[cfg(feature = "stv_party_discipline")]
    stv_8_min_1000,
    #[cfg(feature = "stv_party_discipline")]
    stv_8_min_10000,
    #[cfg(feature = "stv_party_discipline")]
    stv_13_min_100,
    #[cfg(feature = "stv_party_discipline")]
    stv_13_min_1000,
    #[cfg(feature = "stv_party_discipline")]
    stv_13_min_10000,
    #[cfg(feature = "stv_party_discipline")]
    stv_8_avg_100,
    #[cfg(feature = "stv_party_discipline")]
    stv_8_avg_1000,
    #[cfg(feature = "stv_party_discipline")]
    stv_8_avg_10000,
    #[cfg(feature = "stv_party_discipline")]
    stv_13_avg_100,
    #[cfg(feature = "stv_party_discipline")]
    stv_13_avg_1000,
    #[cfg(feature = "stv_party_discipline")]
    stv_13_avg_10000,
);
