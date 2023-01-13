use crate::AllocationMethod;
use crate::Party;

use wasm_bindgen::prelude::*;

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

#[wasm_bindgen]
pub fn run_2(
    method_str: String,
    n_seats: usize,
    n_voters: usize,
    js_parties: JsValue,
    voter_mean_x: f32,
    voter_mean_y: f32
) -> Result<JsValue, JsError> {
    let parties: Vec<Party> = serde_wasm_bindgen::from_value(js_parties)?;
    let method =
        AllocationMethod::try_from(method_str).map_err(JsError::new)?;
    let r = method.simulate_single_election(
        n_seats,
        n_voters,
        &parties,
        &None,
        (voter_mean_x, voter_mean_y),
    );
    Ok(serde_wasm_bindgen::to_value(&r)?)
}
