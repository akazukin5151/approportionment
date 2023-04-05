use super::simple::abstract_benchmark;
use criterion::{criterion_group, Criterion};
use libapproportionment::{
    allocate::Allocate,
    cardinal::{strategy::CardinalStrategy, Cardinal},
};

macro_rules! make_bench {
    ($fn_name:ident, $n_voters:expr, $strategy:expr) => {
        pub fn $fn_name(c: &mut Criterion) {
            let mut a = Cardinal::new($n_voters, 3);
            a.strategy = $strategy;
            abstract_benchmark(c, stringify!($fn_name), a, $n_voters)
        }
    };
}

make_bench!(spav_mean_100, 100, CardinalStrategy::Mean);
make_bench!(spav_mean_1000, 1000, CardinalStrategy::Mean);
make_bench!(spav_mean_10000, 10000, CardinalStrategy::Mean);

make_bench!(spav_median_100, 100, CardinalStrategy::Median);
make_bench!(spav_median_1000, 1000, CardinalStrategy::Median);
make_bench!(spav_median_10000, 10000, CardinalStrategy::Median);

make_bench!(rrv_100, 100, CardinalStrategy::NormedLinear);
make_bench!(rrv_1000, 1000, CardinalStrategy::NormedLinear);
make_bench!(rrv_10000, 10000, CardinalStrategy::NormedLinear);

criterion_group!(
    spav_mean_benches,
    spav_mean_100,
    spav_mean_1000,
    spav_mean_10000
);
criterion_group!(
    spav_median_benches,
    spav_median_100,
    spav_median_1000,
    spav_median_10000
);
criterion_group!(
    rrv_benches,
    rrv_100,
    rrv_1000,
    rrv_10000
);
