use crate::*;

struct DHondt;

impl HighestAverages for DHondt {
    fn quotient(original_votes: u64, n_seats_won: u32) -> u64 {
        original_votes / (n_seats_won as u64 + 1)
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

        let r = DHondt::allocate_seats(8, &ballots);

        assert(&r, "A", 4);
        assert(&r, "B", 3);
        assert(&r, "C", 1);
        assert(&r, "D", 0);
    }

    #[test]
    fn test_dhondt_uk_eu_10_seats() {
        let brexit = generic_party("Brexit");
        let labour = generic_party("Labour");
        let libdem = generic_party("Liberal Democrats");
        let con = generic_party("Conservatives");
        let greens = generic_party("Greens");
        let chuk = generic_party("CHUK");

        let mut ballots = vec![brexit; 240];
        ballots.extend(vec![labour; 220]);
        ballots.extend(vec![libdem; 130]);
        ballots.extend(vec![con; 100]);
        ballots.extend(vec![greens; 70]);
        ballots.extend(vec![chuk; 60]);

        let r = DHondt::allocate_seats(10, &ballots);

        assert(&r, "CHUK", 0);
        assert(&r, "Conservatives", 1);
        assert(&r, "Greens", 1);
        assert(&r, "Liberal Democrats", 2);
        assert(&r, "Labour", 3);
        assert(&r, "Brexit", 3);
    }

    #[test]
    fn test_dhondt_uk_eu_5_seats() {
        let brexit = generic_party("Brexit");
        let labour = generic_party("Labour");
        let libdem = generic_party("Liberal Democrats");
        let con = generic_party("Conservatives");
        let greens = generic_party("Greens");
        let chuk = generic_party("CHUK");

        let mut ballots = vec![brexit; 240];
        ballots.extend(vec![labour; 220]);
        ballots.extend(vec![libdem; 130]);
        ballots.extend(vec![con; 100]);
        ballots.extend(vec![greens; 70]);
        ballots.extend(vec![chuk; 60]);

        let r = DHondt::allocate_seats(5, &ballots);

        assert(&r, "CHUK", 0);
        assert(&r, "Conservatives", 0);
        assert(&r, "Greens", 0);
        assert(&r, "Liberal Democrats", 1);
        assert(&r, "Labour", 2);
        assert(&r, "Brexit", 2);
    }
}
