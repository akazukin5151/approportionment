use crate::*;

pub struct Hare;

impl Allocate for Hare {
    fn allocate_seats(
        &self,
        ballots: Vec<usize>,
        total_seats: u32,
        n_parties: usize,
    ) -> AllocationResult {
        allocate_largest_remainder(
            |v, s| v / s,
            total_seats,
            &ballots,
            n_parties,
        )
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::test_utils::*;
    use proptest::prelude::*;

    #[test]
    fn hare_wikipedia() {
        let mut ballots = vec![0; 47_000];
        ballots.extend(vec![1; 16_000]);
        ballots.extend(vec![2; 15_800]);
        ballots.extend(vec![3; 12_000]);
        ballots.extend(vec![4; 6100]);
        ballots.extend(vec![5; 3100]);

        let r = Hare.allocate_seats(ballots, 10, 6);

        assert_eq!(r, vec![5, 2, 1, 1, 1, 0]);
    }

    proptest! {
        #[test]
        fn hare_satisfies_quota_rule(
            house_size in 0..=1000_u32,
            votes_1 in 1000..1_000_000_usize,
            votes_2 in 1000..1_000_000_usize,
            votes_3 in 1000..1_000_000_usize,
            votes_4 in 1000..1_000_000_usize,
        ) {
            satisfies_quota_rule(
                Hare,
                house_size,
                votes_1,
                votes_2,
                votes_3,
                votes_4
            )
        }
    }
}
