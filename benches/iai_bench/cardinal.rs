use iai::black_box;
use libapproportionment::{
    allocate::Allocate,
    cardinal::{
        allocate::CardinalAllocator, reweighter::ReweightMethod,
        strategy::CardinalStrategy, Cardinal,
    },
    generators::generate_voters,
    types::{Party, SimulateElectionsArgs},
};
use paste::paste;

use super::super::{parties::*, seed::get_xy_seeds};

fn cardinal_benchmark(
    mut a: impl Allocate,
    n_voters: usize,
    parties: &[Party],
) {
    let stdev = 1.0;
    let n_seats = 3;
    let voter_mean = (0., 0.);
    let args = SimulateElectionsArgs {
        n_seats,
        n_voters,
        stdev,
        parties,
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
        black_box(parties.len()),
        black_box(n_voters),
    ));
}

macro_rules! make_bench {
    ($fn_name:ident, $n_voters:expr, $parties:expr, $strategy:expr, $alloc:expr) => {
        pub fn $fn_name() {
            let a = Cardinal::new($n_voters, $parties.len(), $strategy, $alloc);
            cardinal_benchmark(a, $n_voters, $parties)
        }
    };
}

macro_rules! make_bench_auto_name {
    ($name:ident, $alloc:expr, $strategy:expr, $( ( $parties:expr, $n_parties:expr, $n_voters:expr ) ),* ) => {
        $(
            paste! {
                make_bench!(
                    [< $name _ $n_parties _ $n_voters >],
                    $n_voters,
                    $parties,
                    $strategy,
                    $alloc
                );
            }
        )*
    };
}

macro_rules! make_bench_with_parties {
    ($name:ident, $alloc:expr, $strategy:expr, [ $( $n_voters:expr ),* ] ) => {
        $(
            paste! {
                make_bench_auto_name!(
                    $name, $alloc, $strategy, (PARTIES_8, 8, $n_voters)
                );
                make_bench_auto_name!(
                    $name, $alloc, $strategy, (&parties_13(), 13, $n_voters)
                );
            }
        )*
    }
}

macro_rules! approval_bench {
    ($name:ident, $alloc:expr, $n_voters:expr ) => {
        paste! {
            make_bench_with_parties!(
                [< $name _mean >], $alloc, CardinalStrategy::Mean, $n_voters
            );
            make_bench_with_parties!(
                [< $name _median >], $alloc, CardinalStrategy::Median, $n_voters
            );
        }
    };
}

approval_bench!(
    spav,
    CardinalAllocator::ScoreFromOriginal,
    [100, 1000, 10000]
);

make_bench_with_parties!(
    rrv,
    CardinalAllocator::ScoreFromOriginal,
    CardinalStrategy::NormedLinear,
    [100, 1000, 10000]
);

make_bench_with_parties!(
    star_pr,
    CardinalAllocator::WeightsFromPrevious(ReweightMethod::StarPr),
    CardinalStrategy::NormedLinear,
    [100, 1000, 10000]
);

make_bench_with_parties!(
    sss,
    CardinalAllocator::WeightsFromPrevious(ReweightMethod::Sss),
    CardinalStrategy::NormedLinear,
    [100, 1000, 10000]
);

approval_bench!(phragmen, CardinalAllocator::VoterLoads, [100, 1000, 10000]);
