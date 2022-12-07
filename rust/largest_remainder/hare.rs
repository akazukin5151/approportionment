use crate::*;

pub struct Hare;

impl Allocate for Hare {
    fn allocate_seats(
        &self,
        ballots: Vec<Party>,
        total_seats: u32,
    ) -> AllocationResult {
        allocate_largest_remainder(|v, s| v / s, total_seats, &ballots)
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn hare_wikipedia() {
        let a = generic_party("A");
        let b = generic_party("B");
        let c = generic_party("C");
        let d = generic_party("D");
        let e = generic_party("E");
        let f = generic_party("F");

        let mut ballots = vec![a; 47_000];
        ballots.extend(vec![b; 16_000]);
        ballots.extend(vec![c; 15_800]);
        ballots.extend(vec![d; 12_000]);
        ballots.extend(vec![e; 6100]);
        ballots.extend(vec![f; 3100]);

        let r = Hare.allocate_seats(ballots, 10);

        assert(&r, "A", 5);
        assert(&r, "B", 2);
        assert(&r, "C", 1);
        assert(&r, "D", 1);
        assert(&r, "E", 1);
        assert(&r, "F", 0);
    }
}