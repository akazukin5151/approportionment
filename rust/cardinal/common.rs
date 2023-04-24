// find the candidate with most votes
// O(p)
pub fn find_max(counts: &[f32]) -> (usize, &f32) {
    counts
        .iter()
        .enumerate()
        .max_by(|(_, a), (_, b)| {
            a.partial_cmp(b).expect("partial_cmp found NaN")
        })
        .expect("counts is empty")
}


