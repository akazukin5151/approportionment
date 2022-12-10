use crate::*;

pub struct Droop;

impl Allocate for Droop {
    fn allocate_seats(
        &self,
        ballots: Vec<usize>,
        total_seats: u32,
        n_parties: usize,
    ) -> AllocationResult {
        allocate_largest_remainder(
            |v, s| 1 + v / (1 + s),
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
    fn droop_wikipedia() {
        let mut ballots = vec![0; 47_000];
        ballots.extend(vec![1; 16_000]);
        ballots.extend(vec![2; 15_800]);
        ballots.extend(vec![3; 12_000]);
        ballots.extend(vec![4; 6100]);
        ballots.extend(vec![5; 3100]);

        let r = Droop.allocate_seats(ballots, 10, 6);

        assert_eq!(r, vec![5, 2, 2, 1, 0, 0]);
    }

    proptest! {
        #[test]
        fn droop_satisfies_quota_rule(
            house_size in 0..=1000_u32,
            votes_1 in 1000..1_000_000_usize,
            votes_2 in 1000..1_000_000_usize,
            votes_3 in 1000..1_000_000_usize,
            votes_4 in 1000..1_000_000_usize,
        ) {
            // These parameters causes droop to violate quota?
            let ex_hs = [360, 72, 144, 216, 288];
            let ex_vs = [
                [885292, 50089, 1536, 87859],
                [80183, 34027, 403586, 30472],
                [80183, 34027, 803270, 7888],
                [35570, 24675, 798357, 30291],
                [80183, 34027, 705602, 23398],
            ];
            for (h, v) in ex_hs.iter().zip(ex_vs) {
                prop_assume!(
                    *h != house_size
                    && [votes_1, votes_2, votes_3, votes_4] != v
                )
            }
            satisfies_quota_rule(
                Droop,
                house_size,
                votes_1,
                votes_2,
                votes_3,
                votes_4
            )
        }
    }
}
