pub mod parties;
pub mod rank_methods;
pub mod seed;

mod iai_bench;

use iai_bench::cardinal::*;
use iai_bench::party_list::*;
use iai_bench::stv::*;

// copied from iai source, added attr:meta
macro_rules! main {
    ( $( $(#[$attr:meta])?  $func_name:ident ),+ $(,)* ) => {
        mod iai_wrappers {
            $(
                $(#[$attr])*
                pub fn $func_name() {
                    let _ = iai::black_box(super::$func_name());
                }
            )+
        }

        fn main() {

            let benchmarks : &[&(&'static str, fn())]= &[

                $(
                    $(#[$attr])*
                    &(stringify!($func_name), iai_wrappers::$func_name),
                )+
            ];

            iai::runner(benchmarks);
        }
    }
}

main!(
    dhondt_10_100,
    dhondt_10_1000,
    dhondt_10_10000,
    dhondt_50_100,
    dhondt_50_1000,
    dhondt_50_10000,
    sainte_lague_10_100,
    sainte_lague_10_1000,
    sainte_lague_10_10000,
    sainte_lague_50_100,
    sainte_lague_50_1000,
    sainte_lague_50_10000,
    droop_10_100,
    droop_10_1000,
    droop_10_10000,
    droop_50_100,
    droop_50_1000,
    droop_50_10000,
    hare_10_100,
    hare_10_1000,
    hare_10_10000,
    hare_50_100,
    hare_50_1000,
    hare_50_10000,
    stv_8_normal_100,
    stv_8_normal_1000,
    stv_8_normal_10000,
    stv_13_normal_100,
    stv_13_normal_1000,
    stv_13_normal_10000,
    #[cfg(feature = "stv_party_discipline")]
    stv_8_min_100,
    #[cfg(feature = "stv_party_discipline")]
    stv_8_min_1000,
    #[cfg(feature = "stv_party_discipline")]
    stv_8_min_10000,
    #[cfg(feature = "stv_party_discipline")]
    stv_13_min_100,
    #[cfg(feature = "stv_party_discipline")]
    stv_13_min_1000,
    #[cfg(feature = "stv_party_discipline")]
    stv_13_min_10000,
    #[cfg(feature = "stv_party_discipline")]
    stv_8_avg_100,
    #[cfg(feature = "stv_party_discipline")]
    stv_8_avg_1000,
    #[cfg(feature = "stv_party_discipline")]
    stv_8_avg_10000,
    #[cfg(feature = "stv_party_discipline")]
    stv_13_avg_100,
    #[cfg(feature = "stv_party_discipline")]
    stv_13_avg_1000,
    #[cfg(feature = "stv_party_discipline")]
    stv_13_avg_10000,
    spav_mean_10_100,
    spav_mean_10_1000,
    spav_mean_10_10000,
    spav_median_10_100,
    spav_median_10_1000,
    spav_median_10_10000,
    rrv_10_100,
    rrv_10_1000,
    rrv_10_10000,
    spav_mean_50_100,
    spav_mean_50_1000,
    spav_mean_50_10000,
    spav_median_50_100,
    spav_median_50_1000,
    spav_median_50_10000,
    rrv_50_100,
    rrv_50_1000,
    rrv_50_10000,
);
