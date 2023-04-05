pub mod parties;
pub mod rank_methods;

mod criterion_benches;

use criterion_benches::party_list::*;
use criterion_benches::stv::*;
use criterion::criterion_main;

criterion_main!(
    dhondt_benches,
    sainte_lague_benches,
    droop_benches,
    hare_benches,
    stv_benches,
    stv_benches_discipline
);
