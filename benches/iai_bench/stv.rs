use iai::black_box;
use libapproportionment::{
    allocate::Allocate,
    generators::generate_voters,
    methods::AllocationMethod,
    stv::{
        australia::StvAustralia, generate_ballots::extract_stv_parties,
        party_discipline::PartyDiscipline,
    },
    types::{Party, SimulateElectionsArgs},
};

use super::super::{parties::*, seed::get_xy_seeds};

fn stv_benchmark(
    mut a: impl Allocate,
    n_voters: usize,
    parties: &[Party],
    rank_method: PartyDiscipline,
) {
    let stdev = 1.0;
    let n_seats = 3;
    let voter_mean = (0., 0.);
    let (party_of_cands, n_parties) = extract_stv_parties(
        &AllocationMethod::StvAustralia(rank_method),
        parties,
    );
    let args = SimulateElectionsArgs {
        n_seats,
        n_voters,
        stdev,
        parties,
        seed: None,
        party_of_cands,
        n_parties,
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

fn stv_8(n_voters: usize, rank_method: PartyDiscipline) {
    let a = StvAustralia::new(n_voters, PARTIES_8.len(), rank_method);
    stv_benchmark(a, n_voters, PARTIES_8, rank_method)
}

fn stv_13(n_voters: usize, rank_method: PartyDiscipline) {
    let parties = parties_13();
    let a = StvAustralia::new(n_voters, parties.len(), rank_method);
    stv_benchmark(a, n_voters, &parties, rank_method)
}

macro_rules! make_stv_bench {
    ($fn_name:ident, $stv_f:ident, $n_voters:expr, $rank_method:expr) => {
        pub fn $fn_name() {
            $stv_f($n_voters, $rank_method)
        }
    };
}

make_stv_bench!(stv_8_normal_100, stv_8, 100, PartyDiscipline::None);
make_stv_bench!(stv_8_normal_1000, stv_8, 1000, PartyDiscipline::None);
make_stv_bench!(stv_8_normal_10000, stv_8, 10000, PartyDiscipline::None);

make_stv_bench!(stv_13_normal_100, stv_13, 100, PartyDiscipline::None);
make_stv_bench!(stv_13_normal_1000, stv_13, 1000, PartyDiscipline::None);
make_stv_bench!(stv_13_normal_10000, stv_13, 10000, PartyDiscipline::None);

make_stv_bench!(stv_8_min_100, stv_8, 100, PartyDiscipline::Min);
make_stv_bench!(stv_8_min_1000, stv_8, 1000, PartyDiscipline::Min);
make_stv_bench!(stv_8_min_10000, stv_8, 10000, PartyDiscipline::Min);

make_stv_bench!(stv_13_min_100, stv_13, 100, PartyDiscipline::Min);
make_stv_bench!(stv_13_min_1000, stv_13, 1000, PartyDiscipline::Min);
make_stv_bench!(stv_13_min_10000, stv_13, 10000, PartyDiscipline::Min);

make_stv_bench!(stv_8_avg_100, stv_8, 100, PartyDiscipline::Avg);
make_stv_bench!(stv_8_avg_1000, stv_8, 1000, PartyDiscipline::Avg);
make_stv_bench!(stv_8_avg_10000, stv_8, 10000, PartyDiscipline::Avg);

make_stv_bench!(stv_13_avg_100, stv_13, 100, PartyDiscipline::Avg);
make_stv_bench!(stv_13_avg_1000, stv_13, 1000, PartyDiscipline::Avg);
make_stv_bench!(stv_13_avg_10000, stv_13, 10000, PartyDiscipline::Avg);
