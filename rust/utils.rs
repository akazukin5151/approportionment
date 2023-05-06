use std::cmp::Ordering;

/// O(v) where v is the number of voters
// benchmarks show multi-threading with chunks then reduce is slower
pub fn count_freqs(ballots: &[usize], n_parties: usize) -> Vec<usize> {
    let mut counts = vec![0; n_parties];
    for ballot in ballots {
        counts[*ballot] += 1;
    }
    counts
}

#[inline(always)]
pub fn f32_cmp(a: &f32, b: &f32) -> Ordering {
    a.partial_cmp(b).expect("partial_cmp found NaN")
}

#[cfg(feature = "wasm_debug")]
pub fn wasm_debug(s: &str) {
    web_sys::console::log_1(&serde_wasm_bindgen::to_value(s).unwrap());
}

#[cfg(not(feature = "wasm_debug"))]
#[allow(dead_code)]
pub fn wasm_debug(_: &str) {}

#[cfg(test)]
mod test {
    use super::*;
    use proptest::collection::vec;
    use proptest::prelude::*;

    fn make_ballot() -> impl Strategy<Value = (usize, Vec<usize>)> {
        (1..1000_usize).prop_flat_map(|n_parties| {
            (Just(n_parties), vec(0..n_parties, 1000))
        })
    }

    proptest! {
        #[test]
        fn test_vote_counter(
            (n_parties, ballots) in make_ballot()
        ) {
            assert!(ballots.iter().any(|x| x < &n_parties));

            let r = count_freqs(&ballots, n_parties);
            for (idx, freq) in r.iter().enumerate() {
                let mut count = 0;
                for ballot in &ballots {
                    if *ballot == idx {
                        count += 1;
                    }
                }
                assert_eq!(*freq, count);
            }
        }
    }
}
