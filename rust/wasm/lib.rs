use crate::wasm::storage::get_data;
use crate::{
    extract_parties::extract_parties,
    methods::AllocationMethod,
    rng::Fastrand,
    types::{Party, SimulateElectionsArgs, XY},
};
use rand_distr::{Distribution, Normal};

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn generate_normal(
    mean_x: f32,
    mean_y: f32,
    stdev: f32,
) -> Result<JsValue, JsError> {
    let nx = Normal::new(mean_x, stdev).expect("mean should not be NaN");
    let ny = Normal::new(mean_y, stdev).expect("mean should not be NaN");

    let mut rng = Fastrand::new(None);
    let x = nx.sample(&mut rng);

    let mut rng = Fastrand::new(None);
    let y = ny.sample(&mut rng);

    let r = XY { x, y };
    Ok(serde_wasm_bindgen::to_value(&r)?)
}

#[wasm_bindgen]
pub fn simulate_elections(
    js_method: JsValue,
    n_seats: usize,
    n_voters: usize,
    stdev: f32,
    js_parties: JsValue,
    use_voters_sample: bool,
    seed: Option<u64>,
) -> Result<JsValue, JsError> {
    let parties: Vec<Party> = serde_wasm_bindgen::from_value(js_parties)?;
    let method: AllocationMethod = serde_wasm_bindgen::from_value(js_method)?;
    let (party_of_cands, n_parties) = extract_parties(&method, &parties);
    let args = SimulateElectionsArgs {
        n_seats,
        n_voters,
        stdev,
        parties: &parties,
        seed,
        use_voters_sample,
        party_of_cands,
        n_parties,
    };
    let r = method.simulate_elections(args);
    Ok(serde_wasm_bindgen::to_value(&r)?)
}

// TODO: can't store vectors in SimulationData (parties and party_of_cands)
// it would get corrupted after every run
#[wasm_bindgen]
pub fn simulate_single_election(
    js_parties: JsValue,
    voter_mean_x: f32,
    voter_mean_y: f32,
) -> Result<JsValue, JsError> {
    // we have to pass data to here, instead of storing it in SimulationData
    // from set_data, because the values get corrupted for some reason
    let (data, seed) = get_data().ok_or(JsError::new("Could not get data"))?;
    let parties: Vec<Party> = serde_wasm_bindgen::from_value(js_parties)?;
    let (party_of_cands, n_parties) = extract_parties(&data.method, &parties);
    let args = SimulateElectionsArgs {
        n_seats: data.n_seats,
        n_voters: data.n_voters,
        stdev: data.stdev,
        parties: &parties,
        seed: None,
        use_voters_sample: data.use_voters_sample,
        party_of_cands,
        n_parties,
    };
    let r = data.method.simulate_single_election(
        args,
        (voter_mean_x, voter_mean_y),
        seed,
    );
    Ok(serde_wasm_bindgen::to_value(&r)?)
}
