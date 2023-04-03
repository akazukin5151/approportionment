mod parties;
#[cfg(feature = "stv_party_discipline")]
mod rank_methods;

use parties::*;

use criterion::{
    black_box, criterion_group, criterion_main, BatchSize, BenchmarkId,
    Criterion,
};
use libapproportionment::{
    allocate::Allocate,
    generators::generate_voters,
    highest_averages::{dhondt::DHondt, webster::WebsterSainteLague},
    largest_remainder::{droop::Droop, hare::Hare},
    stv::{core::allocate_seats_stv, generate_ballots::generate_stv_ballots},
    types::Party,
};
#[cfg(feature = "stv_party_discipline")]
use {
    libapproportionment::{
        coalitions::extract_stv_parties, methods::RankMethod,
    },
    rank_methods::*,
};

fn abstract_benchmark(
    c: &mut Criterion,
    name: &str,
    mut alloc: impl Allocate,
    n_voters: usize,
) {
    let voter_mean = (0., 0.);
    let stdev = 1.;
    // we don't care about the compiler optimizing these out, because
    // our goal is to benchmark the allocation function only
    let voters = generate_voters(voter_mean, n_voters, stdev);
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
                        let voters =
                            generate_voters(voter_mean, n_voters, stdev);
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
    let mut parties: Vec<Party> = vec![];
    // this is a workaround for Party not having Clone
    // conditional derive for test doesn't work so we manually copy the values
    // don't want to derive it just for benchmarks
    for party in PARTIES_8.iter().chain(EXTRA_PARTIES) {
        let party = Party {
            x: party.x,
            y: party.y,
            #[cfg(feature = "stv_party_discipline")]
            coalition: party.coalition,
        };
        parties.push(party);
    }
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

macro_rules! make_bench {
    ($fn_name:ident, $name:ident, $n_voters:expr) => {
        fn $fn_name(c: &mut Criterion) {
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
criterion_main!(
    dhondt_benches,
    sainte_lague_benches,
    droop_benches,
    hare_benches,
    stv_benches,
    stv_benches_discipline
);
