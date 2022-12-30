mod config;
mod highest_averages;
mod largest_remainder;
mod stv;
mod simulator;
mod types;
mod utils;

#[cfg(test)]
mod test_config;

#[cfg(test)]
mod test_utils;

use config::*;
use highest_averages::*;
use indicatif::ProgressBar;
use largest_remainder::*;
use stv::*;
use types::*;
use utils::*;

#[cfg(feature = "wasm")]
use serde::{Deserialize, Serialize};
#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg(feature = "wasm")]
#[derive(Serialize, Deserialize)]
struct RunResult {
    inner: Vec<((f32, f32), AllocationResult)>,
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn run(
    method_str: String,
    n_seats: u32,
    n_voters: usize,
    js_parties: JsValue,
) -> Result<JsValue, JsError> {
    let parties: Vec<Party> = serde_wasm_bindgen::from_value(js_parties)?;
    let method =
        AllocationMethod::try_from(method_str).map_err(JsError::new)?;
    let r = method.simulate_elections(n_seats, n_voters, &parties, &None);
    Ok(serde_wasm_bindgen::to_value(&r)?)
}

