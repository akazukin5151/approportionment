use crate::AllocationMethod;
use crate::Party;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn simulate_elections(
    method_str: String,
    n_seats: usize,
    n_voters: usize,
    stdev: f32,
    js_parties: JsValue,
    use_voters_sample: bool,
) -> Result<JsValue, JsError> {
    let parties: Vec<Party> = serde_wasm_bindgen::from_value(js_parties)?;
    let method =
        AllocationMethod::try_from(method_str).map_err(JsError::new)?;
    let mut a = method.init(n_voters, parties.len());
    let r = a.simulate_elections(
        n_seats,
        n_voters,
        stdev,
        &parties,
        use_voters_sample,
    );
    Ok(serde_wasm_bindgen::to_value(&r)?)
}

#[wasm_bindgen]
pub fn simulate_single_election(
    method_str: String,
    n_seats: usize,
    n_voters: usize,
    js_parties: JsValue,
    voter_mean_x: f32,
    voter_mean_y: f32,
    stdev: f32,
    use_voters_sample: bool,
) -> Result<JsValue, JsError> {
    let parties: Vec<Party> = serde_wasm_bindgen::from_value(js_parties)?;
    let method =
        AllocationMethod::try_from(method_str).map_err(JsError::new)?;
    let mut a = method.init(n_voters, parties.len());
    let r = a.simulate_single_election(
        n_seats,
        n_voters,
        &parties,
        (voter_mean_x, voter_mean_y),
        stdev,
        use_voters_sample,
    );
    Ok(serde_wasm_bindgen::to_value(&r)?)
}
