//! Run with `cargo r --features "csv,serde_json,counts_by_round" --bin survey_individual --release`.
//!
//! Copy the results from out/langs_pairwise/*.json to webui/static/langs_pairwise
//!
#[cfg(all(feature = "serde_json", feature = "csv"))]
mod survey {
    use std::{
        collections::HashMap,
        fs::{create_dir_all, remove_file, File},
    };

    use libapproportionment::cardinal::{
        allocate::AllocateCardinal, thiele::Thiele,
    };
    use serde::Serialize;

    #[derive(Serialize)]
    struct Output {
        choices: HashMap<String, usize>,
        changes: Vec<Vec<f32>>,
    }

    pub fn main() {
        let mut rdr = csv::Reader::from_path(
			"data/stack-overflow-developer-survey-2022/survey_results_public.csv",
		)
		.unwrap();

        println!("reading data...");
        let mut ballots = vec![];
        let mut numbered = HashMap::new();
        let mut matrix: HashMap<String, HashMap<String, i32>> = HashMap::new();

        for result in rdr.deserialize() {
            let record: HashMap<String, String> = result.unwrap();
            if let Some(x) = record.get("LanguageWantToWorkWith") {
                let mut choice = vec![];
                let mut choice_n = vec![];
                let it = x.split(';').filter(|s| *s != "NA");
                for cand in it.clone() {
                    let l = numbered.len();
                    let cand_num = numbered.entry(cand.to_owned()).or_insert(l);
                    choice.push(*cand_num);
                    choice_n.push(cand.to_owned());
                }

                // for every candidate that this voter has approved:
                for (i, cand) in choice_n.iter().enumerate() {
                    // for every other candidate, record that it was seen with `cand`
                    for (j, other_cands) in choice_n.iter().enumerate() {
                        if i != j {
                            matrix
                                .entry(cand.to_owned())
                                .and_modify(|h| {
                                    h.entry(other_cands.to_owned())
                                        .and_modify(|c| *c += 1)
                                        .or_insert(1);
                                })
                                .or_insert_with(|| {
                                    let mut h = HashMap::new();
                                    h.insert(other_cands.to_owned(), 1);
                                    h
                                });
                        }
                    }
                }

                ballots.push(choice)
            }
        }

        dbg!(&numbered);

        let filename = "out/langs_pairwise/matrix.json";
        create_dir_all("out/langs_pairwise").unwrap();
        let _ = remove_file(filename);
        let writer = File::options()
            .write(true)
            .create_new(true)
            .open(filename)
            .unwrap();
        serde_json::to_writer(writer, &matrix).unwrap();

        println!("transforming ballots...");
        let n_voters = ballots.len();
        let n_candidates = numbered.len();

        // A row-major matrix with `n_candidates` columns and `n_voters` rows.
        // Row major means [V1, V2, V3] where V1 is [C1, C2, C3] and so on
        let mut ballots_matrix: Vec<f32> = vec![0.; n_candidates * n_voters];
        // let mut total_approvals = 0;
        for (voter_idx, ballot) in ballots.iter().enumerate() {
            for choice in ballot {
                let i = n_candidates * voter_idx + choice;
                ballots_matrix[i] = 1.;
                // total_approvals += 1;
            }
        }

        println!("running elections...");

        let (final_result, p_final_result) =
            spav(n_candidates, n_voters, &ballots_matrix);

        let p_output = Output {
            choices: numbered.clone(),
            changes: p_final_result,
        };
        write_result(p_output, "SPAV-r");

        let output = Output {
            choices: numbered.clone(),
            changes: final_result,
        };
        write_result(output, "SPAV-a");

        let (p_a, p_r) = phragman(n_candidates, n_voters, &ballots_matrix);

        let output = Output {
            choices: numbered.clone(),
            changes: p_a,
        };
        write_result(output, "Phragmen-a");

        let output = Output {
            choices: numbered.clone(),
            changes: p_r,
        };
        write_result(output, "Phragmen-r");

        let (pm_a, pm_r) =
            phragmen_money(n_candidates, n_voters, &ballots_matrix);
        let output = Output {
            choices: numbered.clone(),
            changes: pm_a,
        };
        write_result(output, "Phragmen-m-a");

        let output = Output {
            choices: numbered,
            changes: pm_r,
        };
        write_result(output, "Phragmen-m-r");
    }

    fn spav(
        n_candidates: usize,
        n_voters: usize,
        ballots_matrix: &Vec<f32>,
    ) -> (Vec<Vec<f32>>, Vec<Vec<f32>>) {
        // thiele will copy the ballots and save them, so it's fine
        // to reuse this object every time. (it takes an
        // immutable reference to ballots_matrix anyway)
        let thiele = Thiele::new(ballots_matrix);
        let mut final_result = vec![];
        let mut p_final_result = vec![];
        let mut initial_counts = vec![0.; n_candidates];
        let mut initial_counted = false;
        // for every cand_num, "elect" it and reweight.
        // return the total score of all other candidates after the reweighting.
        for cand_to_elect in 0..n_candidates {
            // we make a copy of the ballots; reweighting will modify it.
            // then we count the total score from the reweighted ballots.
            let mut ballots = ballots_matrix.clone();

            let mut result = vec![0; n_candidates];
            // leave this unmodified; the reweighter modifies this.
            let mut sums_of_elected = vec![0.; n_voters];

            // perform an initial count as a baseline for comparison
            if !initial_counted {
                thiele.count(
                    &ballots,
                    n_candidates,
                    &result,
                    &mut initial_counts,
                    &sums_of_elected,
                );
                initial_counted = true;
            }

            // elect the candidate
            result[cand_to_elect] = 1;

            // reweight the ballots
            thiele.reweight(
                &mut ballots,
                &mut sums_of_elected,
                cand_to_elect,
                &result,
                n_candidates,
            );

            // using the reweighted ballots, count total score of all other candidates
            let mut counts = vec![0.; n_candidates];
            thiele.count(
                &ballots,
                n_candidates,
                &result,
                &mut counts,
                &sums_of_elected,
            );

            let change: Vec<_> = counts
                .iter()
                .enumerate()
                .map(|(i, c)| initial_counts[i] - c)
                .collect();

            final_result.push(change);

            let pchange: Vec<_> = counts
                .iter()
                .enumerate()
                .map(|(i, c)| (initial_counts[i] - c) / initial_counts[i])
                .collect();

            p_final_result.push(pchange);
        }
        (final_result, p_final_result)
    }

    fn phragman(
        n_candidates: usize,
        n_voters: usize,
        ballots_matrix: &[f32],
    ) -> (Vec<Vec<f32>>, Vec<Vec<f32>>) {
        let mut final_result = vec![];
        let mut p_final_result = vec![];

        // for every cand_num, "elect" it and reweight.
        // return the total loads of all other candidates after the reweighting.
        // after a candidate is elected, the next candidate is the candidate whose
        // approvers have the lowest total load
        for cand_to_elect in 0..n_candidates {
            // number of voters who approved of each candidate
            let mut counts = vec![0.; n_candidates];
            for ballot in ballots_matrix.chunks_exact(n_candidates) {
                for (idx, vote) in ballot.iter().enumerate() {
                    counts[idx] += vote;
                }
            }

            // every voter starts with 0 load
            let mut voter_loads = vec![0.; n_voters];

            // for each voter, if they approved of the candidate to elect,
            // charge them the load to elect said candidate.
            // candidates are always elected with a total load/cost of 1.
            // phragmen spreads the cost evenly among all its approvers,
            // so each voter is charged a load of 1/(number of voters that approved
            // the candidate to elect).
            for voter in 0..n_voters {
                if ballots_matrix[voter * n_candidates + cand_to_elect] != 0. {
                    voter_loads[voter] = 1. / counts[cand_to_elect];
                }
            }

            // for each candidate, sum up the total load voters have to pay
            // if said candidate is to be elected next.
            let (achange, pchange) = (0..n_candidates)
                .map(|cand| {
                    // this is the absolute change - no change if all voters
                    // did not approve of the winner.
                    let abs_change: f32 = (0..n_voters)
                        .map(|voter| {
                            // if this voter has approved of the candidate that
                            // was elected, they will have to pay more to elect
                            // another candidate.
                            // if this voter did not approve of the candidate,
                            // they don't have to pay because they were not
                            // represented yet.
                            if ballots_matrix[voter * n_candidates + cand] != 0.
                            {
                                voter_loads[voter]
                            } else {
                                0.
                            }
                        })
                        .sum();

                    // the relative change is relative to the initial count
                    // there is very little change (like 99.xx%), so subtract with 1.
                    let pchange = 1. - ((counts[cand] - abs_change) / counts[cand]);

                    (abs_change, pchange)
                })
                .unzip();

            final_result.push(achange);
            p_final_result.push(pchange);
        }
        (final_result, p_final_result)
    }

    // https://en.wikipedia.org/wiki/Phragmen%27s_voting_rules
    // let's say we force g to be elected
    // we skip to 1/11 days, where the ghi voters have enough to buy g.
    // we don't allow any other voters to buy their candidates earlier.
    // (at 1/11 days, the abc voters have enough money to buy 2 of their candidates,
    // and the def voters have enough money to buy 1 of their candidate.)
    // immediately after buying g, the ghi voters have 0 money left.
    // since none of the abc or def voters have approved of g, their money
    // is not affected.
    // hence the percentage change is 0% for candidates abc and def.
    // the percentage change is 100% for candidates h and i, because
    // every voter that approved of h and i has also approved of g, and had
    // their money reset to 0. so the combined money for h and i is 0,
    // compared to 1/11 before - a 100% change.
    //
    // let's say we force B to be elected
    // immediately after buying B, its approvers have 0 money left.
    // this affects the ABC and ABQ voters only.
    // candidates P and R have 0% change.
    // there is a 100% change for candidate C, because every voter who approved
    // of B also approved of C, so candidate C's approvers have 0 money left.
    // candidate A and Q still have money left from voters who did not approve of B,
    // i.e., PQR voters and APQ voters, who retain all their money.
    fn phragmen_money(
        n_candidates: usize,
        n_voters: usize,
        ballots_matrix: &[f32],
    ) -> (Vec<Vec<f32>>, Vec<Vec<f32>>) {
        let mut final_result = vec![];
        let mut p_final_result = vec![];

        // for every cand_num, "elect" it and reweight.
        // return the total loads of all other candidates after the reweighting.
        // after a candidate is elected, the next candidate is the candidate whose
        // approvers have the lowest total load
        for cand_to_elect in 0..n_candidates {
            // number of voters who approved of each candidate
            let mut counts = vec![0.; n_candidates];
            for ballot in ballots_matrix.chunks_exact(n_candidates) {
                for (idx, vote) in ballot.iter().enumerate() {
                    counts[idx] += vote;
                }
            }

            // to elect `cand_to_elect`, we jump to the time where the candidate's
            // approvers has accumulated enough money in total to buy the candidate.
            // this is equal to 1/(number of voters that approved of the candidate),
            // because it takes $1 to buy the candidate and that $1 is evenly spread
            // out among the candidate's approvers.

            // at this time, every voter has that much money.
            let time = 1. / counts[cand_to_elect];
            let mut voter_loads = vec![time; n_voters];

            // for each voter, if they approved of the candidate to elect,
            // reset their money to 0.
            for voter in 0..n_voters {
                if ballots_matrix[voter * n_candidates + cand_to_elect] != 0. {
                    voter_loads[voter] = 0.;
                }
            }

            let (change, pchange): (Vec<f32>, Vec<f32>) = (0..n_candidates)
                .map(|cand| {
                    // just before the candidate was elected, every voter has the same
                    // amount of money
                    let prev_sum: f32 = (0..n_voters)
                        .map(|voter| {
                            if ballots_matrix[voter * n_candidates + cand] != 0.
                            {
                                time
                            } else {
                                0.
                            }
                        })
                        .sum();

                    let new_sum: f32 = (0..n_voters)
                        .map(|voter| {
                            // if this voter has approved of this candidate,
                            // sum their money. otherwise, ignore the voter.
                            // this money might be 0 if the voter also approved
                            // of the winning candidate, otherwise it's 1/time.
                            if ballots_matrix[voter * n_candidates + cand] != 0.
                            {
                                voter_loads[voter]
                            } else {
                                0.
                            }
                        })
                        .sum();

                    let p_change = (prev_sum - new_sum) / prev_sum;
                    (new_sum, p_change)
                })
                .unzip();

            final_result.push(change);
            p_final_result.push(pchange);
        }

        (final_result, p_final_result)
    }

    fn write_result(output: Output, label: &str) {
        let filename = format!("out/langs_pairwise/{label}.json");
        create_dir_all("out/langs_pairwise").unwrap();
        let _ = remove_file(filename.clone());
        let writer = File::options()
            .write(true)
            .create_new(true)
            .open(filename)
            .unwrap();
        serde_json::to_writer(writer, &output).unwrap();
    }
}

#[cfg(not(all(feature = "serde_json", feature = "csv")))]
fn main() {}

#[cfg(all(feature = "serde_json", feature = "csv"))]
fn main() {
    survey::main()
}
