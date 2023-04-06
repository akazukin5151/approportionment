use criterion::{
    black_box, criterion_group, BatchSize, BenchmarkId, Criterion,
};
use libapproportionment::{
    generators::generate_voters,
    stv::{core::allocate_seats_stv, generate_ballots::generate_stv_ballots},
    types::Party,
};

use super::super::{parties::*, seed::get_xy_seeds};

#[cfg(feature = "stv_party_discipline")]
use super::super::rank_methods::*;
#[cfg(feature = "stv_party_discipline")]
use libapproportionment::{
    coalitions::extract_stv_parties, methods::RankMethod,
};

fn stv_benchmark(
    c: &mut Criterion,
    parties: &[Party],
    #[cfg(feature = "stv_party_discipline")] rank_method: RankMethod,
    #[cfg(feature = "stv_party_discipline")] rank_method_name: &str,
) {
    let n_seats = 3;
    let voter_mean = (0., 0.);
    let stdev = 1.;

    let n_parties = parties.len();

    #[cfg(feature = "stv_party_discipline")]
    let name = format!("stv-{n_parties}-{rank_method_name}");
    #[cfg(not(feature = "stv_party_discipline"))]
    let name = format!("stv-{n_parties}");

    let mut group = c.benchmark_group(&name);
    for n_voters in [100, 1000, 10_000] {
        //group.throughput(Throughput::Elements(n_voters as u64));
        group.bench_with_input(
            BenchmarkId::new(&name, n_voters),
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
                        let mut ballots = vec![0; parties.len() * n_voters];
                        #[cfg(feature = "stv_party_discipline")]
                        let (party_of_cands, n_parties) =
                            extract_stv_parties(parties);
                        generate_stv_ballots(
                            &voters,
                            parties,
                            &mut ballots,
                            #[cfg(feature = "stv_party_discipline")]
                            &rank_method,
                            #[cfg(feature = "stv_party_discipline")]
                            &party_of_cands,
                            #[cfg(feature = "stv_party_discipline")]
                            n_parties,
                        );
                        ballots
                    },
                    |ballots| {
                        black_box(allocate_seats_stv(
                            black_box(&ballots),
                            black_box(n_seats),
                            black_box(parties.len()),
                            black_box(n_voters),
                        ))
                    },
                    BatchSize::SmallInput,
                )
            },
        );
    }
    group.finish();
}

fn stv_13(
    c: &mut Criterion,
    #[cfg(feature = "stv_party_discipline")] rank_method: RankMethod,
    #[cfg(feature = "stv_party_discipline")] rank_method_name: &str,
) {
    let parties = parties_13();
    stv_benchmark(
        c,
        &parties,
        #[cfg(feature = "stv_party_discipline")]
        rank_method,
        #[cfg(feature = "stv_party_discipline")]
        rank_method_name,
    )
}

fn stv_8_normal(c: &mut Criterion) {
    stv_benchmark(
        c,
        PARTIES_8,
        #[cfg(feature = "stv_party_discipline")]
        RankMethod::default(),
        #[cfg(feature = "stv_party_discipline")]
        "normal",
    )
}

#[cfg(feature = "stv_party_discipline")]
fn stv_8_min(c: &mut Criterion) {
    stv_benchmark(c, PARTIES_8, MIN_RANK_METHOD, "min")
}

#[cfg(feature = "stv_party_discipline")]
fn stv_8_avg(c: &mut Criterion) {
    stv_benchmark(c, PARTIES_8, AVG_RANK_METHOD, "avg")
}

fn stv_13_normal(c: &mut Criterion) {
    stv_13(
        c,
        #[cfg(feature = "stv_party_discipline")]
        RankMethod::default(),
        #[cfg(feature = "stv_party_discipline")]
        "normal",
    );
}

#[cfg(feature = "stv_party_discipline")]
fn stv_13_min(c: &mut Criterion) {
    stv_13(c, MIN_RANK_METHOD, "min");
}

#[cfg(feature = "stv_party_discipline")]
fn stv_13_avg(c: &mut Criterion) {
    stv_13(c, AVG_RANK_METHOD, "avg");
}

#[cfg(not(feature = "stv_party_discipline"))]
fn dummy(_: &mut Criterion) {}

criterion_group!(stv_benches, stv_8_normal, stv_13_normal,);
#[cfg(feature = "stv_party_discipline")]
criterion_group!(
    stv_benches_discipline,
    stv_8_min,
    stv_8_avg,
    stv_13_min,
    stv_13_avg
);
#[cfg(not(feature = "stv_party_discipline"))]
criterion_group!(stv_benches_discipline, dummy);
