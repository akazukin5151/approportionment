use criterion::{black_box, BenchmarkId, Criterion};
use libapproportionment::{allocate::Allocate, generators::generate_voters};

use super::super::parties::TRIANGLE_PARTIES;
use super::super::seed::get_xy_seeds;

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
