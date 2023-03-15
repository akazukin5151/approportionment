use std::cmp::Ordering;

pub trait IteratorExt {
    fn tie_aware_mins_by<T, F>(self, cmp: F) -> Vec<T>
    where
        Self: Sized + Iterator<Item = T>,
        F: FnMut(&T, &T) -> Ordering,
        T: Copy,
    {
        one_pass_filter(self, cmp, Ordering::Less)
    }

    fn tie_aware_maxs_by<T, F>(self, cmp: F) -> Vec<T>
    where
        Self: Sized + Iterator<Item = T>,
        F: FnMut(&T, &T) -> Ordering,
        T: Copy,
    {
        one_pass_filter(self, cmp, Ordering::Greater)
    }
}

impl<I> IteratorExt for I where I: Iterator {}

/// A one pass filter on "best value" as determined by the given comparator
/// function, cmp.
///
/// The first argument of cmp is the next value,
/// the second argument is the current best value.
///
/// For max or min as the cmp, it will filter the max/min values from the
/// iterator, in one pass and with time complexity O(n).
fn one_pass_filter<I, T, F>(
    mut xs: I,
    mut cmp: F,
    desired_ordering: Ordering,
) -> Vec<T>
where
    I: Iterator<Item = T>,
    F: FnMut(&T, &T) -> Ordering,
    T: Copy,
{
    let mut result = vec![];
    if let Some(mut current_best) = xs.next() {
        // first value is the starting current best
        result.push(current_best);
        for x in xs {
            let ordering = cmp(&x, &current_best);
            if ordering == desired_ordering {
                // we have a better value, replace entire vec with it
                // and update current_best
                result.clear();
                result.push(x);
                current_best = x;
            } else if ordering == Ordering::Equal {
                // we found a duplicate current_best, push it to vec
                result.push(x);
            }
        }
    }
    // if iterator was empty, result is empty. This matches the semantics of
    // the normal filter.
    result
}

/// instead of rewriting rust's highly optimized pdqsort,
/// we just use it to sort, then do another pass to find duplicates
/// the time complexity is O(n*log(n))
pub fn sort_largest_with_stv_tiebreak<S, T: Ord>(mut xs: Vec<(S, T)>) {
    xs.sort_unstable_by(|(_, a), (_, b)| {
        // largest first
        b.partial_cmp(a).expect("partial_cmp found NaN")
    });
}

#[cfg(test)]
mod test {
    use super::*;
    use proptest::prelude::*;

    #[test]
    fn tie_aware_min_finds_tie() {
        let v = vec![4, 6, 2, 3, 1, 4, 1];
        let r = v.iter().tie_aware_mins_by(|a, b| a.cmp(b));
        assert_eq!(r, vec![&1, &1]);
    }

    #[test]
    fn tie_aware_min_works_without_tie() {
        let v = vec![1, 0, 2, 3];
        let r = v.iter().tie_aware_mins_by(|a, b| a.cmp(b));
        assert_eq!(r, vec![&0]);
    }

    #[test]
    fn tie_aware_min_by_finds_tie() {
        let v = vec![4, 6, 2, 3, 1, 4, 1];
        let r = v
            .iter()
            .enumerate()
            .tie_aware_mins_by(|(_, a), (_, b)| a.cmp(b));
        assert_eq!(r, vec![(4, &1), (6, &1)]);
    }

    #[test]
    fn tie_aware_min_by_works_without_tie() {
        let v = vec![1, 0, 2, 3];
        let r = v
            .iter()
            .enumerate()
            .tie_aware_mins_by(|(_, a), (_, b)| a.cmp(b));
        assert_eq!(r, vec![(1, &0)]);
    }

    #[test]
    fn tie_aware_max_finds_tie() {
        let v = vec![2, 0, 2, 1];
        let r = v.iter().tie_aware_maxs_by(|a, b| a.cmp(b));
        assert_eq!(r, vec![&2, &2]);
    }

    #[test]
    fn tie_aware_max_works_without_tie() {
        let v = vec![2, 0, 3, 1];
        let r = v.iter().tie_aware_maxs_by(|a, b| a.cmp(b));
        assert_eq!(r, vec![&3]);
    }

    #[test]
    fn tie_aware_max_by_finds_tie() {
        let v = vec![2, 0, 2, 1];
        let r = v
            .iter()
            .enumerate()
            .tie_aware_maxs_by(|(_, a), (_, b)| a.cmp(b));

        assert_eq!(r, vec![(0, &2), (2, &2)]);
    }

    #[test]
    fn tie_aware_max_by_works_without_tie() {
        let v = vec![2, 0, 3, 1];
        let r = v
            .iter()
            .enumerate()
            .tie_aware_maxs_by(|(_, a), (_, b)| a.cmp(b));
        assert_eq!(r, vec![(2, &3)]);
    }

    #[test]
    fn tie_aware_min_none_on_empty() {
        let v: Vec<i32> = vec![];
        let r = v.iter().tie_aware_mins_by(|a, b| a.cmp(b));
        let ans: Vec<&i32> = vec![];
        assert_eq!(r, ans);
    }

    #[test]
    fn tie_aware_max_none_on_empty() {
        let v: Vec<i32> = vec![];
        let r = v.iter().tie_aware_maxs_by(|a, b| a.cmp(b));
        let ans: Vec<&i32> = vec![];
        assert_eq!(r, ans);
    }

    proptest! {
        #[test]
        fn one_pass_filter_min(
            v in proptest::collection::vec(0..100_i32, 100)
        ) {
            // TODO(tie): the idiomatic version is very concise compared
            // to our bulky implementation, is it really worth it?
            // try how fast the idiomatic version is first
            prop_assert_eq!(
                one_pass_filter(v.iter(), |a, b| a.cmp(b), Ordering::Less)
                    .to_vec(),
                v.iter()
                    .min()
                    .map(|m| v.iter().filter(|x| *x == m).collect::<Vec<_>>())
                    .unwrap_or(vec![])
            )
        }

        #[test]
        fn one_pass_filter_max(
            v in proptest::collection::vec(0..100_i32, 100)
        ) {
            prop_assert_eq!(
                one_pass_filter(v.iter(), |a, b| a.cmp(b), Ordering::Greater)
                    .to_vec(),
                v.iter()
                    .max()
                    .map(|m| v.iter().filter(|x| *x == m).collect::<Vec<_>>())
                    .unwrap_or(vec![])
            )
        }
    }
}
