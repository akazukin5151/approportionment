pub mod parties;
pub mod rank_methods;
pub mod seed;

mod criterion_benches;

use criterion::criterion_main;
use criterion_benches::cardinal::*;
use criterion_benches::party_list::*;
use criterion_benches::stv::*;

criterion_main!(
    dhondt_benches,
    sainte_lague_benches,
    droop_benches,
    hare_benches,
    stv_benches,
    stv_benches_discipline,
    spav_mean_benches,
    spav_median_benches,
    rrv_benches,
    star_pr_benches,
    sss_benches,
);
