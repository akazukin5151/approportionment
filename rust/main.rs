use std::path::Path;
use std::{env::args, fs::create_dir_all};

use indicatif::ProgressBar;
use libapproportionment::arrow::write_results;
use libapproportionment::config::*;
use libapproportionment::types::*;
use rayon::prelude::*;

fn main() {
    let file = args().nth(1).unwrap();
    let r_configs: Result<Configs, _> = serde_dhall::from_file(file).parse();
    let c = r_configs.unwrap_or_else(|r| {
        println!("{}", r);
        panic!()
    });
    let bar = setup_progress_bar(&c);
    let configs = c.configs;

    configs.into_par_iter().for_each(|config| {
        run_config(config, &bar);
    });
    if let Some(b) = bar {
        b.finish();
    }
}

fn setup_progress_bar(c: &Configs) -> Option<ProgressBar> {
    if c.show_progress_bar {
        let total_ballots: u64 = c
            .configs
            .iter()
            .map(|c| {
                let mut ballots_in_config: u64 = 0;
                let out_dir = &c.data_out_dir;
                let path = Path::new(&out_dir);
                for method in &c.allocation_methods {
                    let filename = path.join(method.filename());
                    if !filename.exists() {
                        let n_voters = c.n_voters as u64;
                        // if domain is customizable this will change
                        // there are 200 values between -100 to 100
                        let n_coords = 200 * 200;
                        let r: u64 = n_voters
                            .checked_mul(n_coords)
                            .expect("Overflow in mul");
                        ballots_in_config = ballots_in_config
                            .checked_add(r)
                            .expect("Overflow in add");
                    }
                }
                ballots_in_config
            })
            .sum();
        Some(ProgressBar::new(total_ballots))
    } else {
        None
    }
}

fn run_config(config: Config, bar: &Option<ProgressBar>) {
    let parties: Vec<Party> = config.parties.into_iter().collect();

    let out_dir = config.data_out_dir;
    let path = Path::new(&out_dir);
    if !path.exists() {
        create_dir_all(path).unwrap();
    }

    config
        .allocation_methods
        .into_par_iter()
        .for_each(|method| {
            let filename = path.join(method.filename());
            if filename.exists() {
                return;
            }
            let rs = method.simulate_elections(
                config.n_seats,
                config.n_voters,
                &parties,
                bar,
            );
            write_results(&parties, rs, filename);
        });
}
