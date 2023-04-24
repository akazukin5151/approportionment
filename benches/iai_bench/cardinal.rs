use iai::black_box;
use libapproportionment::{
    allocate::Allocate,
    cardinal::{
        allocate::CardinalAllocator, strategy::CardinalStrategy, Cardinal,
    },
    generators::generate_voters,
    types::Party,
};

use super::super::{parties::*, seed::get_xy_seeds};

fn cardinal_benchmark(
    mut a: impl Allocate,
    n_voters: usize,
    parties: &[Party],
) {
    let stdev = 1.0;
    let total_seats = 3;
    let voter_mean = (0., 0.);

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
        &vec![],
        #[cfg(feature = "stv_party_discipline")]
        0,
    );
    black_box(a.allocate_seats(
        black_box(total_seats),
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

make_bench!(
    spav_mean_8_100,
    100,
    PARTIES_8,
    CardinalStrategy::Mean,
    CardinalAllocator::Thiele
);
make_bench!(
    spav_mean_8_1000,
    1000,
    PARTIES_8,
    CardinalStrategy::Mean,
    CardinalAllocator::Thiele
);
make_bench!(
    spav_mean_8_10000,
    10000,
    PARTIES_8,
    CardinalStrategy::Mean,
    CardinalAllocator::Thiele
);

make_bench!(
    spav_median_8_100,
    100,
    PARTIES_8,
    CardinalStrategy::Median,
    CardinalAllocator::Thiele
);
make_bench!(
    spav_median_8_1000,
    1000,
    PARTIES_8,
    CardinalStrategy::Median,
    CardinalAllocator::Thiele
);
make_bench!(
    spav_median_8_10000,
    10000,
    PARTIES_8,
    CardinalStrategy::Median,
    CardinalAllocator::Thiele
);

make_bench!(
    rrv_8_100,
    100,
    PARTIES_8,
    CardinalStrategy::NormedLinear,
    CardinalAllocator::Thiele
);
make_bench!(
    rrv_8_1000,
    1000,
    PARTIES_8,
    CardinalStrategy::NormedLinear,
    CardinalAllocator::Thiele
);
make_bench!(
    rrv_8_10000,
    10000,
    PARTIES_8,
    CardinalStrategy::NormedLinear,
    CardinalAllocator::Thiele
);

make_bench!(
    spav_mean_13_100,
    100,
    &parties_13(),
    CardinalStrategy::Mean,
    CardinalAllocator::Thiele
);
make_bench!(
    spav_mean_13_1000,
    1000,
    &parties_13(),
    CardinalStrategy::Mean,
    CardinalAllocator::Thiele
);
make_bench!(
    spav_mean_13_10000,
    10000,
    &parties_13(),
    CardinalStrategy::Mean,
    CardinalAllocator::Thiele
);

make_bench!(
    spav_median_13_100,
    100,
    &parties_13(),
    CardinalStrategy::Median,
    CardinalAllocator::Thiele
);
make_bench!(
    spav_median_13_1000,
    1000,
    &parties_13(),
    CardinalStrategy::Median,
    CardinalAllocator::Thiele
);
make_bench!(
    spav_median_13_10000,
    10000,
    &parties_13(),
    CardinalStrategy::Median,
    CardinalAllocator::Thiele
);

make_bench!(
    rrv_13_100,
    100,
    &parties_13(),
    CardinalStrategy::NormedLinear,
    CardinalAllocator::Thiele
);
make_bench!(
    rrv_13_1000,
    1000,
    &parties_13(),
    CardinalStrategy::NormedLinear,
    CardinalAllocator::Thiele
);
make_bench!(
    rrv_13_10000,
    10000,
    &parties_13(),
    CardinalStrategy::NormedLinear,
    CardinalAllocator::Thiele
);

make_bench!(
    star_pr_8_100,
    100,
    PARTIES_8,
    CardinalStrategy::NormedLinear,
    CardinalAllocator::StarPr
);
make_bench!(
    star_pr_8_1000,
    1000,
    PARTIES_8,
    CardinalStrategy::NormedLinear,
    CardinalAllocator::StarPr
);
make_bench!(
    star_pr_8_10000,
    10000,
    PARTIES_8,
    CardinalStrategy::NormedLinear,
    CardinalAllocator::StarPr
);

make_bench!(
    star_pr_13_100,
    100,
    &parties_13(),
    CardinalStrategy::NormedLinear,
    CardinalAllocator::StarPr
);
make_bench!(
    star_pr_13_1000,
    1000,
    &parties_13(),
    CardinalStrategy::NormedLinear,
    CardinalAllocator::StarPr
);
make_bench!(
    star_pr_13_10000,
    10000,
    &parties_13(),
    CardinalStrategy::NormedLinear,
    CardinalAllocator::StarPr
);
