#![warn(clippy::branches_sharing_code)]
#![warn(clippy::undocumented_unsafe_blocks)]
#![warn(clippy::needless_pass_by_value)]
#![warn(clippy::integer_division)]

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

#[cfg(feature = "wasm")]
pub mod wasm;

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

#[cfg(feature = "wasm")]
pub use wasm::*;
