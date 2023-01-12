pub mod config;
pub mod highest_averages;
pub mod largest_remainder;
pub mod simulator;
pub mod stv;
pub mod types;
pub mod utils;

#[cfg(test)]
mod test_config;

pub use config::*;
pub use highest_averages::*;
pub use indicatif::ProgressBar;
pub use largest_remainder::*;
pub use stv::*;
pub use types::*;
pub use utils::*;

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn run(
    method_str: String,
    n_seats: usize,
    n_voters: usize,
    js_parties: JsValue,
) -> Result<JsValue, JsError> {
    let parties: Vec<Party> = serde_wasm_bindgen::from_value(js_parties)?;
    let method =
        AllocationMethod::try_from(method_str).map_err(JsError::new)?;
    let r = method.simulate_elections(n_seats, n_voters, &parties, &None);
    Ok(serde_wasm_bindgen::to_value(&r)?)
}

