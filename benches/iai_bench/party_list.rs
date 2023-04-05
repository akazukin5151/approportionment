use libapproportionment::{
    allocate::Allocate,
    highest_averages::{dhondt::DHondt, webster::WebsterSainteLague},
    largest_remainder::{droop::Droop, hare::Hare},
};

use super::simple::simple_benchmark;

macro_rules! make_bench {
    ($fn_name:ident, $name:ident, $n_voters:expr, $n_seats:expr) => {
        pub fn $fn_name() {
            let a = $name::new($n_voters, 0);
            simple_benchmark(a, $n_voters, $n_seats)
        }
    };
}

make_bench!(dhondt_10_100, DHondt, 100, 10);
make_bench!(dhondt_10_1000, DHondt, 1000, 10);
make_bench!(dhondt_10_10000, DHondt, 10000, 10);
make_bench!(dhondt_50_100, DHondt, 100, 50);
make_bench!(dhondt_50_1000, DHondt, 1000, 50);
make_bench!(dhondt_50_10000, DHondt, 10000, 50);

make_bench!(sainte_lague_10_100, WebsterSainteLague, 100, 10);
make_bench!(sainte_lague_10_1000, WebsterSainteLague, 1000, 10);
make_bench!(sainte_lague_10_10000, WebsterSainteLague, 10000, 10);
make_bench!(sainte_lague_50_100, WebsterSainteLague, 100, 50);
make_bench!(sainte_lague_50_1000, WebsterSainteLague, 1000, 50);
make_bench!(sainte_lague_50_10000, WebsterSainteLague, 10000, 50);

make_bench!(droop_10_100, Droop, 100, 10);
make_bench!(droop_10_1000, Droop, 1000, 10);
make_bench!(droop_10_10000, Droop, 10000, 10);
make_bench!(droop_50_100, Droop, 100, 50);
make_bench!(droop_50_1000, Droop, 1000, 50);
make_bench!(droop_50_10000, Droop, 10000, 50);

make_bench!(hare_10_100, Hare, 100, 10);
make_bench!(hare_10_1000, Hare, 1000, 10);
make_bench!(hare_10_10000, Hare, 10000, 10);
make_bench!(hare_50_100, Hare, 100, 50);
make_bench!(hare_50_1000, Hare, 1000, 50);
make_bench!(hare_50_10000, Hare, 10000, 50);
