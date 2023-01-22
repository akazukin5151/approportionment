pub mod config;
pub mod highest_averages;
pub mod largest_remainder;
pub mod simulator;
pub mod stv;
pub mod types;
pub mod utils;
pub mod methods;

#[cfg(feature = "wasm")]
pub mod wasm;

#[cfg(test)]
mod test_config;

pub use config::*;
pub use highest_averages::*;
pub use indicatif::ProgressBar;
pub use largest_remainder::*;
pub use stv::*;
pub use types::*;
pub use utils::*;
pub use methods::*;

#[cfg(feature = "wasm")]
pub use wasm::*;

