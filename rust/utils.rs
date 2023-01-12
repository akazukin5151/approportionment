/// O(v) where v is the number of voters
// benchmarks show multi-threading with chunks then reduce is slower
pub fn count_freqs(ballots: &[usize], n_parties: usize) -> Vec<u32> {
    let mut counts = vec![0; n_parties];
    for ballot in ballots {
        counts[*ballot] += 1;
    }
    counts
}

pub fn wasm_debug(s: &str) {
    #[cfg(feature = "wasm_debug")]
    web_sys::console::log_1(&serde_wasm_bindgen::to_value(s).unwrap());
}
