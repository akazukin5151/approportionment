use criterion::{
    black_box, criterion_group, BatchSize, BenchmarkId, Criterion,
};
use libapproportionment::{
    cardinal::{
        allocate::allocate_cardinal, generate::generate_cardinal_ballots,
        strategy::CardinalStrategy,
    },
    generators::generate_voters,
    types::Party,
};

use super::super::{parties::*, seed::get_xy_seeds};

fn cardinal_benchmark(
    c: &mut Criterion,
    name: &str,
    parties: &[Party],
    strategy: CardinalStrategy,
) {
    let n_seats = 3;
    let voter_mean = (0., 0.);
    let stdev = 1.;

    let n_parties = parties.len();

    let mut group = c.benchmark_group(name);
    for n_voters in [100, 1000, 10_000] {
        //group.throughput(Throughput::Elements(n_voters as u64));
        group.bench_with_input(
            BenchmarkId::new(name, n_voters),
            &n_voters,
            |b, &n_voters| {
                b.iter_batched(
                    || {
                        let voters = generate_voters(
                            voter_mean,
                            n_voters,
                            stdev,
                            get_xy_seeds(),
                        );
                        let mut ballots = vec![0.; parties.len() * n_voters];
                        generate_cardinal_ballots(
                            &voters,
                            parties,
                            &strategy,
                            &mut ballots,
                        );
                        ballots
                    },
                    |ballots| {
                        allocate_cardinal(
                            ballots,
                            black_box(n_seats),
                            black_box(n_parties),
                            1.,
                        );
                    },
                    BatchSize::SmallInput,
                )
            },
        );
    }
    group.finish();
}

macro_rules! make_bench {
    ($fn_name:ident, $n_voters:expr, $parties:expr, $strategy:expr) => {
        pub fn $fn_name(c: &mut Criterion) {
            cardinal_benchmark(c, stringify!($fn_name), $parties, $strategy)
        }
    };
}

make_bench!(spav_mean_8, 8, PARTIES_8, CardinalStrategy::Mean);
make_bench!(spav_mean_13, 13, &parties_13(), CardinalStrategy::Mean);

make_bench!(spav_median_8, 8, PARTIES_8, CardinalStrategy::Median);
make_bench!(spav_median_13, 13, &parties_13(), CardinalStrategy::Median);

make_bench!(rrv_8, 8, PARTIES_8, CardinalStrategy::NormedLinear);
make_bench!(rrv_13, 13, &parties_13(), CardinalStrategy::NormedLinear);

criterion_group!(spav_mean_benches, spav_mean_8, spav_mean_13,);
criterion_group!(spav_median_benches, spav_median_8, spav_median_13,);
criterion_group!(rrv_benches, rrv_8, rrv_13);
