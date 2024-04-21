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

        for result in rdr.deserialize() {
            let record: HashMap<String, String> = result.unwrap();
            if let Some(x) = record.get("LanguageWantToWorkWith") {
                let mut choice = vec![];
                let it = x.split(';').filter(|s| *s != "NA");
                for cand in it.clone() {
                    let l = numbered.len();
                    let cand_num = numbered.entry(cand.to_owned()).or_insert(l);
                    choice.push(*cand_num);
                }
                ballots.push(choice)
            }
        }

        dbg!(&numbered);

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

        let label = "SPAV";
        // thiele will copy the ballots and save them, so it's fine
        // to reuse this object every time. (it takes an
        // immutable reference to ballots_matrix anyway)
        let thiele = Thiele::new(&ballots_matrix);
        let mut final_result = vec![];
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
                .map(|(i, c)| (initial_counts[i] - c) / initial_counts[i])
                .collect();

            final_result.push(change);
        }

        let output = Output {
            choices: numbered.clone(),
            changes: final_result,
        };

        write_result(output, label);

        let label = "Phragmen";
        // let phragmen = Phragmen::new(n_voters, n_candidates);
        let mut final_result = vec![];

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
            let total_loads: Vec<f32> = (0..n_candidates)
                .map(|cand| {
                    (0..n_voters)
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
                        .sum()
                })
                .collect();

            final_result.push(total_loads);
        }

        let output = Output {
            choices: numbered.clone(),
            changes: final_result,
        };

        write_result(output, label);
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
