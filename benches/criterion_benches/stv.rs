use criterion::{
    black_box, criterion_group, BatchSize, BenchmarkId, Criterion,
};
use libapproportionment::{
    extract_parties::extract_stv_parties,
    generators::generate_voters,
    methods::AllocationMethod,
    stv::{
        core::allocate_seats_stv, generate_ballots::generate_stv_ballots,
        party_discipline::PartyDiscipline,
    },
    types::{Party, SimulateElectionsArgs},
};

use super::super::{parties::*, seed::get_xy_seeds};

fn stv_benchmark(
    c: &mut Criterion,
    parties: &[Party],
    rank_method: PartyDiscipline,
    rank_method_name: &str,
) {
    let n_seats = 3;
    let voter_mean = (0., 0.);
    let stdev = 1.;

    let n_parties = parties.len();

    let name = format!("stv-{n_parties}-{rank_method_name}");

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
                        generate_stv_ballots(
                            &voters,
                            &args,
                            &mut ballots,
                            &rank_method,
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
    rank_method: PartyDiscipline,
    rank_method_name: &str,
) {
    let parties = parties_13();
    stv_benchmark(c, &parties, rank_method, rank_method_name)
}

fn stv_8_normal(c: &mut Criterion) {
    stv_benchmark(c, PARTIES_8, PartyDiscipline::None, "normal")
}

fn stv_8_min(c: &mut Criterion) {
    stv_benchmark(c, PARTIES_8, PartyDiscipline::Min, "min")
}

fn stv_8_avg(c: &mut Criterion) {
    stv_benchmark(c, PARTIES_8, PartyDiscipline::Avg, "avg")
}

fn stv_13_normal(c: &mut Criterion) {
    stv_13(c, PartyDiscipline::None, "normal");
}

fn stv_13_min(c: &mut Criterion) {
    stv_13(c, PartyDiscipline::Min, "min");
}

fn stv_13_avg(c: &mut Criterion) {
    stv_13(c, PartyDiscipline::Avg, "avg");
}

criterion_group!(stv_benches, stv_8_normal, stv_13_normal,);
criterion_group!(
    stv_benches_discipline,
    stv_8_min,
    stv_8_avg,
    stv_13_min,
    stv_13_avg
);
