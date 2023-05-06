use crate::{methods::AllocationMethod, rng::Fastrand};
use rand::RngCore;
use std::ptr;
use wasm_bindgen::prelude::*;

pub struct SimulationData {
    pub rng: Option<Fastrand>,
    pub method: AllocationMethod,
    pub n_seats: usize,
    pub n_voters: usize,
    pub stdev: f32,
    pub use_voters_sample: bool,
}

/// pointer to the Fastrand rng instance
/// only used by simulate_single_election
/// this is never dropped because it's static anyway
static mut DATA: *mut SimulationData =
    ptr::null::<*mut SimulationData>() as *mut _;

/// Creates a new `Fastrand` instance and write it to static memory.
/// There is no need to use this function if `simulate_single_election` is not
/// used.
/// Even if you forget and use `simulate_single_election` without calling
/// this function first, your seed value will just do nothing
#[wasm_bindgen]
pub fn set_data(
    seed: Option<u64>,
    js_method: JsValue,
    n_seats: usize,
    n_voters: usize,
    stdev: f32,
    use_voters_sample: bool,
) -> Result<(), JsError> {
    let method: AllocationMethod = serde_wasm_bindgen::from_value(js_method)?;
    let rng = if seed.is_some() {
        Some(Fastrand::new(seed))
    } else {
        None
    };
    let data = SimulationData {
        rng,
        method,
        n_seats,
        n_voters,
        stdev,
        use_voters_sample,
    };
    set_data_inner(data)
}

fn set_data_inner(data: SimulationData) -> Result<(), JsError> {
    // move it to the heap and leak it
    // `&mut rng as *mut _` already worked, but I'll just be safe
    // and leak the value, because I'm concerned it would be dropped
    // at the end of this function
    let boxed = Box::new(data);
    let leaked = Box::leak(boxed);

    // SAFETY:
    // - the pointer is initialized as nullptr (not uninitialized)
    // - this pointer is never freed
    // - all recursive structs of Fastrand uses `repr(rust)`,
    //   which is guaranteed to be aligned
    unsafe {
        DATA = leaked as *mut _;
    }
    Ok(())
}

pub fn get_data() -> Option<(SimulationData, Option<u64>)> {
    // SAFETY: javascript is single threaded so there cannot be any
    // multi-threaded data races
    let data_ptr = unsafe { DATA };

    if data_ptr.is_null() {
        None
    } else {
        // SAFETY:
        // - the pointer is initialized as nullptr (not uninitialized)
        // - we've checked that this is not a null pointer
        // - this pointer is never freed
        // - all recursive structs of Fastrand uses `repr(rust)`,
        //   which is guaranteed to be aligned
        // - we never read from both the pointer and the original value
        let mut data = unsafe { ptr::read(DATA) };

        let val = data.rng.as_mut().map(|r| r.next_u64());

        // writes `data` to the pointer `DATA`
        //
        // SAFETY:
        // - the pointer is initialized as nullptr (not uninitialized)
        // - we've checked that this is not a null pointer
        // - this pointer is never freed
        // - all recursive structs of Fastrand uses `repr(rust)`,
        //   which is guaranteed to be aligned
        unsafe { ptr::write(DATA, data) };

        // `data` is moved to ptr::write, so read it back again
        let data = unsafe { ptr::read(DATA) };
        Some((data, val))
    }
}

#[cfg(test)]
mod test {
    use super::*;

    // SAFETY: we have no other tests that will access the static mut
    // (tests are ran in parallel), so this is safe
    #[test]
    fn test_data() {
        // test that forgetting to use set_data won't cause UB
        let x = get_data();
        assert!(x.is_none());

        let data = SimulationData {
            rng: Some(Fastrand::new(Some(1234))),
            method: AllocationMethod::DHondt,
            n_seats: 10,
            n_voters: 100,
            stdev: 1.0,
            use_voters_sample: false,
        };

        let x = set_data_inner(data);
        assert!(x.is_ok());

        let (data1, seed) = get_data().unwrap();
        assert_eq!(seed, Some(9125819570723775615));

        assert_eq!(data1.n_seats, 10);
        assert_eq!(data1.n_voters, 100);
        assert_eq!(data1.stdev, 1.0);
        assert_eq!(data1.use_voters_sample, false);
    }
}
