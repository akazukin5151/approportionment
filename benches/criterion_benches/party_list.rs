use criterion::{black_box, criterion_group, BenchmarkId, Criterion};
use libapproportionment::{
    allocate::Allocate,
    generators::generate_voters,
    highest_averages::{dhondt::DHondt, webster::WebsterSainteLague},
    largest_remainder::{droop::Droop, hare::Hare},
};

use super::super::{parties::TRIANGLE_PARTIES, seed::get_xy_seeds};

pub fn abstract_benchmark(
    c: &mut Criterion,
    name: &str,
    mut alloc: impl Allocate,
    n_voters: usize,
) {
    let voter_mean = (0., 0.);
    let stdev = 1.;
    // we don't care about the compiler optimizing these out, because
    // our goal is to benchmark the allocation function only
    let voters = generate_voters(voter_mean, n_voters, stdev, get_xy_seeds());
    alloc.generate_ballots(
        &voters,
        TRIANGLE_PARTIES,
        #[cfg(feature = "stv_party_discipline")]
        &vec![],
        #[cfg(feature = "stv_party_discipline")]
        0,
    );

    let mut group = c.benchmark_group(format!("{name}-{n_voters} voters"));
    // don't let n_seats equal to n_voters
    for n_seats in (10..=50).step_by(10) {
        // criterion.rs/src/html/mod.rs:766 checks if the throughput values
        // are the same in all runs. if it is, it does not plot the line graph
        // so need to comment this out for the line graph to work
        // this is because it would plot different y values (duration)
        // with the same x value (n_voters), as the runs are varying n_seats only
        // our problem is that the throughput that we care about is different
        // from the input size that is being varied
        //group.throughput(Throughput::Elements(n_voters as u64));
        group.bench_with_input(
            BenchmarkId::from_parameter(n_seats),
            &n_seats,
            |b, &n_seats| {
                b.iter(|| {
                    black_box(alloc.allocate_seats(
                        black_box(n_seats),
                        black_box(TRIANGLE_PARTIES.len()),
                        0,
                    ))
                })
            },
        );
    }
    group.finish();
}

macro_rules! make_bench {
    ($fn_name:ident, $name:ident, $n_voters:expr) => {
        pub fn $fn_name(c: &mut Criterion) {
            let a = $name::new($n_voters, 0);
            abstract_benchmark(c, stringify!($name), a, $n_voters)
        }
    };
}

make_bench!(dhondt_100, DHondt, 100);
make_bench!(dhondt_1000, DHondt, 1000);
make_bench!(dhondt_10000, DHondt, 10000);

make_bench!(sainte_lague_100, WebsterSainteLague, 100);
make_bench!(sainte_lague_1000, WebsterSainteLague, 1000);
make_bench!(sainte_lague_10000, WebsterSainteLague, 10000);

make_bench!(droop_100, Droop, 100);
make_bench!(droop_1000, Droop, 1000);
make_bench!(droop_10000, Droop, 10000);

make_bench!(hare_100, Hare, 100);
make_bench!(hare_1000, Hare, 1000);
make_bench!(hare_10000, Hare, 10000);

criterion_group!(dhondt_benches, dhondt_100, dhondt_1000, dhondt_10000);
criterion_group!(
    sainte_lague_benches,
    sainte_lague_100,
    sainte_lague_1000,
    sainte_lague_10000
);
criterion_group!(droop_benches, droop_100, droop_1000, droop_10000);
criterion_group!(hare_benches, hare_100, hare_1000, hare_10000);
