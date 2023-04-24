use std::env;
use std::path::Path;
use std::{env::args, fs::create_dir_all};

#[cfg(feature = "progress_bar")]
use indicatif::ProgressBar;
use libapproportionment::arrow::write_results;
#[cfg(feature = "stv_party_discipline")]
use libapproportionment::coalitions::*;
use libapproportionment::types::SimulateElectionsArgs;
use libapproportionment::{
    config::{Config, Configs},
    types::Party,
};
use rayon::prelude::*;

fn main() {
    let file = args().nth(1).unwrap();
    let r_configs: Result<Configs, _> = serde_dhall::from_file(file).parse();
    let c = r_configs.unwrap_or_else(|r| {
        // This println gives slightly better formatting than unwrap or panic
        println!("{r}");
        panic!()
    });
    #[cfg(feature = "progress_bar")]
    let bar = setup_progress_bar(&c);
    let configs = c.configs;

    let seed = env::var("SEED")
        .map_err(|_| "failed to get var")
        .and_then(|val| val.parse::<u64>().map_err(|_| "failed to parse"))
        .ok();

    configs.into_par_iter().for_each(|config| {
        run_config(
            config,
            seed,
            #[cfg(feature = "progress_bar")]
            &bar,
        );
    });
    #[cfg(feature = "progress_bar")]
    bar.finish();
}

#[cfg(feature = "progress_bar")]
fn setup_progress_bar(c: &Configs) -> ProgressBar {
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
    ProgressBar::new(total_ballots)
}

fn run_config(
    config: Config,
    seed: Option<u64>,
    #[cfg(feature = "progress_bar")] bar: &ProgressBar,
) {
    let parties: Vec<Party> = config.parties.into_iter().collect();

    let out_dir = config.data_out_dir;
    let path = Path::new(&out_dir);
    if !path.exists() {
        create_dir_all(path).unwrap();
    }

    #[cfg(feature = "stv_party_discipline")]
    let (party_of_cands, n_parties) = extract_stv_parties(&parties);

    config
        .allocation_methods
        .into_par_iter()
        .for_each(|method| {
            let filename = path.join(method.filename());
            if filename.exists() {
                return;
            }
            let args = SimulateElectionsArgs {
                n_seats: config.n_seats,
                n_voters: config.n_voters,
                stdev: config.stdev,
                parties: parties.clone(),
                seed,
                #[cfg(feature = "progress_bar")]
                bar,
                #[cfg(feature = "voters_sample")]
                use_voters_sample: false,
                #[cfg(feature = "stv_party_discipline")]
                party_of_cands,
                #[cfg(feature = "stv_party_discipline")]
                n_parties,
            };
            let rs = method.simulate_elections(args);
            write_results(&parties, &rs, filename);
        });
}
