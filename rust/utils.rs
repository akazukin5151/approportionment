/// O(v) where v is the number of voters
// benchmarks show multi-threading with chunks then reduce is slower
pub fn count_freqs(ballots: &[usize], n_parties: usize) -> Vec<usize> {
    let mut counts = vec![0; n_parties];
    for ballot in ballots {
        counts[*ballot] += 1;
    }
    counts
}

#[cfg(feature = "wasm_debug")]
pub fn wasm_debug(s: &str) {
    web_sys::console::log_1(&serde_wasm_bindgen::to_value(s).unwrap());
}

#[cfg(not(feature = "wasm_debug"))]
#[allow(dead_code)]
pub fn wasm_debug(_: &str) {}
