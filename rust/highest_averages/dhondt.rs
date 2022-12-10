use crate::*;

pub struct DHondt;

impl Allocate for DHondt {
    fn allocate_seats(
        &self,
        ballots: Vec<usize>,
        total_seats: u32,
        n_parties: usize,
    ) -> AllocationResult {
        fn quotient(original_votes: u32, n_seats_won: u32) -> u32 {
            original_votes / (n_seats_won + 1)
        }
        allocate_highest_average(quotient, total_seats, &ballots, n_parties)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::test_utils::*;
    use proptest::prelude::*;

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

    proptest! {
        #[test]
        fn dhondt_is_house_monotonic(
            house_size_1 in 0..=1000_u32,
            house_size_2 in 0..=1000_u32,
            votes_1 in 1000..1_000_000_usize,
            votes_2 in 1000..1_000_000_usize,
            votes_3 in 1000..1_000_000_usize,
            votes_4 in 1000..1_000_000_usize,
        ) {
            prop_assume!(house_size_1 != house_size_2);
            is_house_monotonic(
                DHondt,
                house_size_1,
                house_size_2,
                votes_1,
                votes_2,
                votes_3,
                votes_4
            )
        }
    }
}
