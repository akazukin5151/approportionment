use crate::*;

pub struct WebsterSainteLague<'a>(pub &'a [Party]);

impl<'a> Allocate for WebsterSainteLague<'a> {
    fn allocate_seats(&self, total_seats: u32) -> AllocationResult {
        fn quotient(original_votes: u64, n_seats_won: u32) -> u64 {
            original_votes / (2 * n_seats_won as u64 + 1)
        }
        allocate_highest_average(quotient, total_seats, self.0)
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_webster_sainte_lague_wikipedia() {
        let a = generic_party("A");
        let b = generic_party("B");
        let c = generic_party("C");
        let d = generic_party("D");

        let mut ballots = vec![a; 10_000];
        ballots.extend(vec![b; 8_000]);
        ballots.extend(vec![c; 3_000]);
        ballots.extend(vec![d; 2_000]);

        let r = WebsterSainteLague(&ballots).allocate_seats(8);

        assert(&r, "A", 3);
        assert(&r, "B", 3);
        assert(&r, "C", 1);
        assert(&r, "D", 1);
    }
}
