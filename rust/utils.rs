/// O(v) where v is the number of voters
/// TODO: this can be multi-threaded
pub fn count_freqs(ballots: &[usize], n_parties: usize) -> Vec<u32> {
    let mut counts = vec![0; n_parties];
    for ballot in ballots {
        counts[*ballot] += 1;
    }
    counts
}

