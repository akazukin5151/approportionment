use crate::{
    methods::AllocationMethod,
    rng::Fastrand,
    types::{Party, XY},
};
use rand::RngCore;
use rand_distr::{Distribution, Normal};
use std::ptr;

use wasm_bindgen::prelude::*;

/// pointer to the Fastrand rng instance
/// only used by simulate_single_election
/// this is never dropped because it's static anyway
static mut RNG: *mut Fastrand = ptr::null::<*mut Fastrand>() as *mut _;

/// Creates a new `Fastrand` instance and write it to static memory.
/// There is no need to use this function if `simulate_single_election` is not
/// used.
/// Even if you forget and use `simulate_single_election` without calling
/// this function first, your seed value will just do nothing
#[wasm_bindgen]
pub fn new_rng(seed: Option<u64>) {
    if seed.is_some() {
        let rng = Fastrand::new(seed);

        // move it to the heap and leak it
        // `&mut rng as *mut _` already worked, but I'll just be safe
        // and leak the value, because I'm concerned it would be dropped
        // at the end of this function
        let boxed = Box::new(rng);
        let leaked = Box::leak(boxed);

        // SAFETY:
        // - the pointer is initialized as nullptr (not uninitialized)
        // - this pointer is never freed
        // - all recursive structs of Fastrand uses `repr(rust)`,
        //   which is guaranteed to be aligned
        unsafe {
            RNG = leaked as *mut _;
        }
    }
}

fn get_election_seed() -> Option<u64> {
    // SAFETY: javascript is single threaded so there cannot be any
    // multi-threaded data races
    let rng_ptr = unsafe { RNG };

    if rng_ptr.is_null() {
        None
    } else {
        // SAFETY:
        // - the pointer is initialized as nullptr (not uninitialized)
        // - we've checked that this is not a null pointer
        // - this pointer is never freed
        // - all recursive structs of Fastrand uses `repr(rust)`,
        //   which is guaranteed to be aligned
        // - we never read from both the pointer and the original value
        let mut rng = unsafe { ptr::read(RNG) };

        let val = rng.next_u64();

        // writes `rng` to the pointer `RNG`
        //
        // SAFETY:
        // - the pointer is initialized as nullptr (not uninitialized)
        // - we've checked that this is not a null pointer
        // - this pointer is never freed
        // - all recursive structs of Fastrand uses `repr(rust)`,
        //   which is guaranteed to be aligned
        unsafe { ptr::write(RNG, rng) };

        Some(val)
    }
}

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
    method_str: String,
    n_seats: usize,
    n_voters: usize,
    stdev: f32,
    js_parties: JsValue,
    use_voters_sample: bool,
    seed: Option<u64>,
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
        seed,
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
    let election_seed = get_election_seed();
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
        election_seed,
        use_voters_sample,
    );
    Ok(serde_wasm_bindgen::to_value(&r)?)
}
