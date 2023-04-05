use libapproportionment::{
    allocate::Allocate,
    cardinal::{strategy::CardinalStrategy, Cardinal},
};

use super::simple::simple_benchmark;

macro_rules! make_bench {
    ($fn_name:ident, $n_voters:expr, $n_seats:expr, $strategy:expr) => {
        pub fn $fn_name() {
            let mut a = Cardinal::new($n_voters, 3);
            a.strategy = $strategy;
            simple_benchmark(a, $n_voters, $n_seats)
        }
    };
}

make_bench!(spav_mean_10_100, 100, 10, CardinalStrategy::Mean);
make_bench!(spav_mean_10_1000, 1000, 10, CardinalStrategy::Mean);
make_bench!(spav_mean_10_10000, 10000, 10, CardinalStrategy::Mean);

make_bench!(spav_median_10_100, 100, 10, CardinalStrategy::Median);
make_bench!(spav_median_10_1000, 1000, 10, CardinalStrategy::Median);
make_bench!(spav_median_10_10000, 10000, 10, CardinalStrategy::Median);

make_bench!(rrv_10_100, 100, 10, CardinalStrategy::NormedLinear);
make_bench!(rrv_10_1000, 1000, 10, CardinalStrategy::NormedLinear);
make_bench!(rrv_10_10000, 10000, 10, CardinalStrategy::NormedLinear);

make_bench!(spav_mean_50_100, 100, 50, CardinalStrategy::Mean);
make_bench!(spav_mean_50_1000, 1000, 50, CardinalStrategy::Mean);
make_bench!(spav_mean_50_10000, 10000, 50, CardinalStrategy::Mean);

make_bench!(spav_median_50_100, 100, 50, CardinalStrategy::Median);
make_bench!(spav_median_50_1000, 1000, 10, CardinalStrategy::Median);
make_bench!(spav_median_50_10000, 10000, 10, CardinalStrategy::Median);

make_bench!(rrv_50_100, 100, 50, CardinalStrategy::NormedLinear);
make_bench!(rrv_50_1000, 1000, 50, CardinalStrategy::NormedLinear);
make_bench!(rrv_50_10000, 10000, 10, CardinalStrategy::NormedLinear);
