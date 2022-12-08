pub fn count_freqs(ballots: &[usize], n_parties: usize) -> Vec<u64> {
    let mut counts = vec![0; n_parties];
    for ballot in ballots {
        counts[*ballot] += 1;
    }
    counts
}

