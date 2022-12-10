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

    //proptest! {
    //    #[test]
    //    fn droop_is_not_house_monotonic(
    //        house_size_1 in 0..=1000_u32,
    //        house_size_2 in 0..=1000_u32,
    //    ) {
    //        prop_assume!(house_size_1 != house_size_2);
    //        is_house_monotonic(DHondt, house_size_1, house_size_2)
    //    }
    //}
}
