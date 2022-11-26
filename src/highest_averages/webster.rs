use crate::*;

struct WebsterSainteLague;

impl WebsterSainteLague {
    fn allocate_seats(total_seats: u32, ballots: &[Party]) -> ElectionResult {
        fn quotient(original_votes: u64, n_seats_won: u32) -> u64 {
            original_votes / (2 * n_seats_won as u64 + 1)
        }
        allocate(quotient, total_seats, ballots)
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_dhondt_wikipedia() {
        let a = generic_party("A");
        let b = generic_party("B");
        let c = generic_party("C");
        let d = generic_party("D");

        let mut ballots = vec![a; 10_000];
        ballots.extend(vec![b; 8_000]);
        ballots.extend(vec![c; 3_000]);
        ballots.extend(vec![d; 2_000]);

        let r = WebsterSainteLague::allocate_seats(8, &ballots);

        assert(&r, "A", 3);
        assert(&r, "B", 3);
        assert(&r, "C", 1);
        assert(&r, "D", 1);
    }
}
