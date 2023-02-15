use criterion::{
    black_box, criterion_group, criterion_main, BatchSize, BenchmarkId,
    Criterion, Throughput,
};
use libapproportionment::{
    allocate_highest_average, allocate_largest_remainder, generate_stv_ballots,
    generators::{generate_ballots, generate_voters},
    stv::allocate_seats_stv,
    AllocationResult, StvBallot, XY,
};

fn dhondt(
    n_seats: usize,
    ballots: &[usize],
    n_parties: usize,
) -> AllocationResult {
    fn quotient(original_votes: f32, n_seats_won: f32) -> f32 {
        original_votes / (n_seats_won + 1.)
    }
    allocate_highest_average(quotient, n_seats, ballots, n_parties)
}

fn sainte_lague(
    n_seats: usize,
    ballots: &[usize],
    n_parties: usize,
) -> AllocationResult {
    fn quotient(original_votes: f32, n_seats_won: f32) -> f32 {
        original_votes / (2. * n_seats_won + 1.)
    }
    allocate_highest_average(quotient, n_seats, ballots, n_parties)
}

fn droop(
    n_seats: usize,
    ballots: &[usize],
    n_parties: usize,
) -> AllocationResult {
    allocate_largest_remainder(
        |v, s| {
            let v = v as f32;
            let s = s as f32;
            let x = v / (1. + s);
            let xf = x.floor();
            1. + xf
        },
        n_seats,
        ballots,
        n_parties,
    )
}

fn hare(
    n_seats: usize,
    ballots: &[usize],
    n_parties: usize,
) -> AllocationResult {
    allocate_largest_remainder(
        |v, s| v as f32 / s as f32,
        n_seats,
        ballots,
        n_parties,
    )
}

fn abstract_benchmark(
    c: &mut Criterion,
    name: &str,
    fun: fn(usize, &[usize], usize) -> AllocationResult,
    n_voters: usize,
) {
    let voter_mean = (0., 0.);
    let stdev = 1.;
    let parties = &[
        XY { x: -0.8, y: -0.6 },
        XY { x: -0.2, y: -0.7 },
        XY { x: 0.0, y: -0.73 },
    ];

    let mut group = c.benchmark_group(name);
    // don't let n_seats equal to n_voters
    for n_seats in (10..=50).step_by(10) {
        group.throughput(Throughput::Elements(n_voters as u64));
        group.bench_with_input(
            BenchmarkId::new(format!("{name} {n_voters} voters"), n_seats),
            &n_seats,
            |b, &n_seats| {
                b.iter_batched(
                    || {
                        let voters =
                            generate_voters(voter_mean, n_voters, stdev);
                        let mut ballots = vec![0; n_voters];
                        generate_ballots(&voters, parties, &mut ballots);
                        ballots
                    },
                    |ballots| {
                        fun(
                            black_box(n_seats),
                            black_box(&ballots),
                            black_box(parties.len()),
                        )
                    },
                    BatchSize::SmallInput,
                )
            },
        );
    }
    group.finish();
}

macro_rules! make_bench {
    ($fn_name:ident, $name:ident, $n_voters:expr) => {
        fn $fn_name(c: &mut Criterion) {
            abstract_benchmark(c, stringify!($name), $name, $n_voters)
        }
    };
}

make_bench!(dhondt_100, dhondt, 100);
make_bench!(dhondt_1000, dhondt, 1000);
make_bench!(dhondt_10000, dhondt, 10000);

make_bench!(sainte_lague_100, sainte_lague, 100);
make_bench!(sainte_lague_1000, sainte_lague, 1000);
make_bench!(sainte_lague_10000, sainte_lague, 10000);

make_bench!(droop_100, droop, 100);
make_bench!(droop_1000, droop, 1000);
make_bench!(droop_10000, droop, 10000);

make_bench!(hare_100, hare, 100);
make_bench!(hare_1000, hare, 1000);
make_bench!(hare_10000, hare, 10000);

fn stv_7(c: &mut Criterion) {
    let n_seats = 3;
    let voter_mean = (0., 0.);
    let stdev = 1.;
    let parties = &[
        XY { x: 0.7, y: 0.7 },
        XY { x: 0.7, y: -0.7 },
        XY { x: -0.7, y: -0.7 },
        XY { x: -0.4, y: -0.6 },
        XY { x: 0.3, y: -0.8 },
        XY { x: -0.4, y: 0.5 },
        XY { x: 0.3, y: -0.6 },
    ];

    let mut group = c.benchmark_group("stv-7-with-throughput");
    for n_voters in [100, 1000, 10_000] {
        group.throughput(Throughput::Elements(n_voters as u64));
        group.bench_with_input(
            BenchmarkId::new("stv-7", n_voters),
            &n_voters,
            |b, &n_voters| {
                b.iter_batched(
                    || {
                        let voters =
                            generate_voters(voter_mean, n_voters, stdev);
                        let mut ballots =
                            vec![StvBallot(vec![0; parties.len()]); n_voters];
                        generate_stv_ballots(&voters, parties, &mut ballots);
                        ballots
                    },
                    |ballots| {
                        allocate_seats_stv(
                            black_box(&ballots),
                            black_box(n_seats),
                            black_box(parties.len()),
                        )
                    },
                    BatchSize::SmallInput,
                )
            },
        );
    }
    group.finish();
}

criterion_group!(dhondt_benches, dhondt_100, dhondt_1000, dhondt_10000);
criterion_group!(
    sainte_lague_benches,
    sainte_lague_100,
    sainte_lague_1000,
    sainte_lague_10000
);
criterion_group!(droop_benches, droop_100, droop_1000, droop_10000);
criterion_group!(hare_benches, hare_100, hare_1000, hare_10000);
criterion_group!(stv_benches, stv_7);
criterion_main!(
    dhondt_benches,
    sainte_lague_benches,
    droop_benches,
    hare_benches,
    stv_benches
);
