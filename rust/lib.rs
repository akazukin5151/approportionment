#![warn(clippy::branches_sharing_code)]
#![warn(clippy::undocumented_unsafe_blocks)]
#![warn(clippy::needless_pass_by_value)]
#![warn(clippy::too_many_lines)]
#![warn(clippy::integer_division)]
// Relevant limitations already documented in README, rest is verified
// cargo clippy -- -W clippy::integer_arithmetic
//#![warn(clippy::arithmetic_side_effects)]

#![cfg_attr(feature = "intrinsics", feature(core_intrinsics))]

pub mod allocate;
pub mod arrow;
pub mod config;
pub mod generators;
pub mod highest_averages;
pub mod largest_remainder;
pub mod methods;
pub mod rng;
pub mod stv;
pub mod types;
pub mod utils;
pub mod distance;
pub mod tie;

#[cfg(feature = "wasm")]
pub mod wasm;

#[cfg(feature = "stv_party_discipline")]
pub mod coalitions;

#[cfg(test)]
mod test_config;

pub use crate::arrow::*;
pub use allocate::*;
pub use config::*;
pub use highest_averages::*;
#[cfg(feature = "progress_bar")]
pub use indicatif::ProgressBar;
pub use largest_remainder::*;
pub use methods::*;
pub use stv::*;
pub use types::*;
pub use utils::*;
pub use tie::*;

#[cfg(feature = "wasm")]
pub use wasm::*;

#[cfg(feature = "stv_party_discipline")]
pub use coalitions::*;
