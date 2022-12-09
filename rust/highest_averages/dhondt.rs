use crate::*;

pub struct DHondt;

impl Allocate for DHondt {
    fn allocate_seats(
        &self,
        ballots: Vec<usize>,
        total_seats: u32,
        n_parties: usize,
    ) -> AllocationResult {
        fn quotient(original_votes: u64, n_seats_won: u32) -> u64 {
            original_votes / (n_seats_won as u64 + 1)
        }
        allocate_highest_average(quotient, total_seats, &ballots, n_parties)
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_dhondt_wikipedia() {
        let mut ballots = vec![0; 10_000];
        ballots.extend(vec![1; 8_000]);
        ballots.extend(vec![2; 3_000]);
        ballots.extend(vec![3; 2_000]);

        let r = DHondt.allocate_seats(ballots, 8, 4);

        assert_eq!(r, vec![4, 3, 1, 0]);
    }

    #[test]
    fn test_dhondt_uk_eu_10_seats() {
        let mut ballots = vec![0; 240];
        ballots.extend(vec![1; 220]);
        ballots.extend(vec![2; 130]);
        ballots.extend(vec![3; 100]);
        ballots.extend(vec![4; 70]);
        ballots.extend(vec![5; 60]);

        let r = DHondt.allocate_seats(ballots, 10, 6);

        assert_eq!(r, vec![3, 3, 2, 1, 1, 0]);
    }

    #[test]
    fn test_dhondt_uk_eu_5_seats() {
        let mut ballots = vec![0; 240];
        ballots.extend(vec![1; 220]);
        ballots.extend(vec![2; 130]);
        ballots.extend(vec![3; 100]);
        ballots.extend(vec![4; 70]);
        ballots.extend(vec![5; 60]);

        let r = DHondt.allocate_seats(ballots, 5, 6);

        assert_eq!(r, vec![2, 2, 1, 0, 0, 0]);
    }
}
