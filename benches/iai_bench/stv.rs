use iai::black_box;
use libapproportionment::{
    allocate::Allocate, generators::generate_voters,
    stv::australia::StvAustralia, types::Party,
};

#[cfg(feature = "stv_party_discipline")]
use libapproportionment::{
    coalitions::extract_stv_parties, methods::RankMethod,
};

use super::super::parties::*;
#[cfg(feature = "stv_party_discipline")]
use super::super::rank_methods::*;
use super::super::seed::get_xy_seeds;

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
        get_xy_seeds(),
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
        pub fn $fn_name() {
            $stv_f(
                $n_voters,
                #[cfg(feature = "stv_party_discipline")]
                RankMethod::default(),
            )
        }
    };
    ($fn_name:ident, $stv_f:ident, $n_voters:expr, $rank_method:expr) => {
        #[cfg(feature = "stv_party_discipline")]
        pub fn $fn_name() {
            $stv_f($n_voters, $rank_method)
        }
    };
}

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
