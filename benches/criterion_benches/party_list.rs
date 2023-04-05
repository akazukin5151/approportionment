use criterion::{criterion_group, Criterion};
use libapproportionment::{
    allocate::Allocate,
    highest_averages::{dhondt::DHondt, webster::WebsterSainteLague},
    largest_remainder::{droop::Droop, hare::Hare},
};

use super::simple::abstract_benchmark;

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
