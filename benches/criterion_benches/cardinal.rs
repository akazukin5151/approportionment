use criterion::{
    black_box, criterion_group, BatchSize, BenchmarkId, Criterion,
};
use libapproportionment::{
    allocate::Allocate,
    cardinal::{
        allocate::CardinalAllocator, reweighter::ReweightMethod,
        strategy::CardinalStrategy, Cardinal,
    },
    generators::generate_voters,
    types::{Party, SimulateElectionsArgs},
};

use super::super::{parties::*, seed::get_xy_seeds};

fn cardinal_benchmark(
    c: &mut Criterion,
    name: &str,
    parties: &[Party],
    strategy: CardinalStrategy,
    allocator: CardinalAllocator,
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
                        let args = SimulateElectionsArgs {
                            n_seats,
                            n_voters,
                            stdev,
                            parties,
                            seed: None,
                            party_of_cands: None,
                            n_parties: None,
                        };

                        let voters = generate_voters(
                            voter_mean,
                            n_voters,
                            stdev,
                            get_xy_seeds(),
                        );
                        let mut alloc = Cardinal::new(
                            n_voters, n_parties, strategy, allocator,
                        );
                        alloc.generate_ballots(&voters, &args);
                        alloc
                    },
                    |mut alloc| {
                        alloc.allocate_seats(
                            black_box(n_seats),
                            black_box(parties.len()),
                            black_box(n_voters),
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
    ($fn_name:ident, $parties:expr, $strategy:expr, $allocator:expr) => {
        pub fn $fn_name(c: &mut Criterion) {
            cardinal_benchmark(
                c,
                stringify!($fn_name),
                $parties,
                $strategy,
                $allocator,
            )
        }
    };
}

make_bench!(
    spav_mean_8,
    PARTIES_8,
    CardinalStrategy::Mean,
    CardinalAllocator::ScoreFromOriginal
);
make_bench!(
    spav_mean_13,
    &parties_13(),
    CardinalStrategy::Mean,
    CardinalAllocator::ScoreFromOriginal
);

make_bench!(
    spav_median_8,
    PARTIES_8,
    CardinalStrategy::Median,
    CardinalAllocator::ScoreFromOriginal
);
make_bench!(
    spav_median_13,
    &parties_13(),
    CardinalStrategy::Median,
    CardinalAllocator::ScoreFromOriginal
);

make_bench!(
    rrv_8,
    PARTIES_8,
    CardinalStrategy::NormedLinear,
    CardinalAllocator::ScoreFromOriginal
);
make_bench!(
    rrv_13,
    &parties_13(),
    CardinalStrategy::NormedLinear,
    CardinalAllocator::ScoreFromOriginal
);

make_bench!(
    star_pr_8,
    PARTIES_8,
    CardinalStrategy::NormedLinear,
    CardinalAllocator::WeightsFromPrevious(ReweightMethod::StarPr)
);
make_bench!(
    star_pr_13,
    &parties_13(),
    CardinalStrategy::NormedLinear,
    CardinalAllocator::WeightsFromPrevious(ReweightMethod::StarPr)
);

make_bench!(
    sss_8,
    PARTIES_8,
    CardinalStrategy::NormedLinear,
    CardinalAllocator::WeightsFromPrevious(ReweightMethod::Sss)
);
make_bench!(
    sss_13,
    &parties_13(),
    CardinalStrategy::NormedLinear,
    CardinalAllocator::WeightsFromPrevious(ReweightMethod::Sss)
);

criterion_group!(spav_mean_benches, spav_mean_8, spav_mean_13,);
criterion_group!(spav_median_benches, spav_median_8, spav_median_13,);
criterion_group!(rrv_benches, rrv_8, rrv_13);
criterion_group!(star_pr_benches, star_pr_8, star_pr_13);
criterion_group!(sss_benches, sss_8, sss_13);
